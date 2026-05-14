import { db }           from '@/lib/db'
import { formatRupiah, CREDIT_PACKS } from '@/lib/utils'
import { getConfig, TOKEN_PRICE_DEFAULTS, calcCost } from '@/lib/config'
import Link            from 'next/link'

export default async function AdminOverviewPage() {
  const now            = new Date()
  const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLast    = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLast      = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const thirtyDaysAgo  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [priceInputStr, priceOutputStr] = await Promise.all([
    getConfig('token_price_input',  TOKEN_PRICE_DEFAULTS.input),
    getConfig('token_price_output', TOKEN_PRICE_DEFAULTS.output),
  ])
  const priceInput  = parseInt(priceInputStr,  10)
  const priceOutput = parseInt(priceOutputStr, 10)

  const [
    totalUsers,
    totalInvitations,
    totalRsvps,
    newUsersThisMonth,
    newUsersLastMonth,
    publishedInvitations,
    allTransactions,
    packBreakdown,
    recentTransactions,
    recentUsers,
    topUsers,
    tokenAgg,
    tokenMonthAgg,
  ] = await Promise.all([
    db.user.count(),
    db.invitation.count(),
    db.rsvp.count(),
    db.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.user.count({ where: { createdAt: { gte: startOfLast, lte: endOfLast } } }),
    db.invitation.count({ where: { status: 'PUBLISHED' } }),
    db.transaction.groupBy({ by: ['status'], _count: { id: true }, _sum: { amount: true } }),
    db.transaction.groupBy({
      by:    ['packType'],
      where: { status: 'SUCCESS' },
      _count: { id: true },
      _sum:   { amount: true, credits: true },
    }),
    db.transaction.findMany({
      where:   { status: 'SUCCESS', createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take:    10,
      select:  {
        id: true, packType: true, credits: true, amount: true, createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take:    5,
      select:  { id: true, name: true, email: true, credits: true, role: true, createdAt: true },
    }),
    db.user.findMany({
      orderBy: { invitations: { _count: 'desc' } },
      take:    5,
      select:  {
        id: true, name: true, email: true, credits: true,
        _count: { select: { invitations: true } },
      },
    }),
    db.invitation.aggregate({ _sum: { tokensInput: true, tokensOutput: true } }),
    db.invitation.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum:  { tokensInput: true, tokensOutput: true },
    }),
  ])

  const totalTokenIn   = tokenAgg._sum.tokensInput   ?? 0
  const totalTokenOut  = tokenAgg._sum.tokensOutput  ?? 0
  const monthTokenIn   = tokenMonthAgg._sum.tokensInput  ?? 0
  const monthTokenOut  = tokenMonthAgg._sum.tokensOutput ?? 0
  const totalTokenCost = calcCost(totalTokenIn, totalTokenOut, priceInput, priceOutput)
  const monthTokenCost = calcCost(monthTokenIn, monthTokenOut, priceInput, priceOutput)

  const revenue  = allTransactions.find(t => t.status === 'SUCCESS')?._sum.amount ?? 0
  const pending  = allTransactions.find(t => t.status === 'PENDING')?._count.id  ?? 0
  const failed   = allTransactions.find(t => t.status === 'FAILED')?._count.id   ?? 0
  const userGrowthPct = newUsersLastMonth > 0
    ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
    : null

  return (
    <div className="p-8 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',        value: totalUsers,             sub: `+${newUsersThisMonth} bulan ini`,      color: 'text-white' },
          { label: 'Revenue (berhasil)', value: formatRupiah(revenue),  sub: `${allTransactions.find(t=>t.status==='SUCCESS')?._count.id??0} transaksi`, color: 'text-amber-400' },
          { label: 'Total Undangan',     value: totalInvitations,       sub: `${publishedInvitations} aktif`,        color: 'text-white' },
          { label: 'Total RSVP',         value: totalRsvps,             sub: 'seluruh undangan',                     color: 'text-white' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Token Cost Summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Biaya Token Total</p>
          <p className="text-2xl font-bold text-red-400">{formatRupiah(totalTokenCost)}</p>
          <p className="text-xs text-gray-600 mt-1">{((totalTokenIn + totalTokenOut) / 1000).toFixed(1)}K tokens</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Biaya Token Bulan Ini</p>
          <p className="text-2xl font-bold text-red-400">{formatRupiah(monthTokenCost)}</p>
          <p className="text-xs text-gray-600 mt-1">{((monthTokenIn + monthTokenOut) / 1000).toFixed(1)}K tokens</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 col-span-2 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Detail &amp; Pengaturan Harga</p>
            <p className="text-xs text-gray-600">Set harga per juta token sesuai provider AI kamu</p>
          </div>
          <Link href="/admin/tokens"
            className="shrink-0 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold px-4 py-2 rounded-xl transition">
            Kelola →
          </Link>
        </div>
      </div>

      {/* ── Row: Revenue by Pack + User Growth ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Revenue by pack */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">Revenue per Paket</h2>
          <div className="space-y-4">
            {Object.entries(CREDIT_PACKS).map(([key, pack]) => {
              const data    = packBreakdown.find(p => p.packType === key)
              const count   = data?._count.id  ?? 0
              const amount  = data?._sum.amount ?? 0
              const totalRev = packBreakdown.reduce((acc, p) => acc + (p._sum.amount ?? 0), 0)
              const pct     = totalRev > 0 ? Math.round((amount / totalRev) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-300 font-medium">{pack.label}</span>
                    <div className="text-right">
                      <span className="text-amber-400 font-semibold">{formatRupiah(amount)}</span>
                      <span className="text-gray-600 text-xs ml-2">{count}×</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between text-sm">
            <span className="text-gray-500">Tx Pending</span>
            <span className="text-yellow-400 font-semibold">{pending}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-500">Tx Gagal</span>
            <span className="text-red-400 font-semibold">{failed}</span>
          </div>
        </div>

        {/* User growth */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">Pengguna</h2>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Bulan ini</p>
                <p className="text-3xl font-bold text-white">{newUsersThisMonth}</p>
              </div>
              {userGrowthPct !== null && (
                <p className={`text-sm font-semibold mb-1 ${userGrowthPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {userGrowthPct >= 0 ? '↑' : '↓'} {Math.abs(userGrowthPct)}% dari bulan lalu
                </p>
              )}
            </div>
            <div className="h-px bg-gray-800" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Bulan lalu</p>
                <p className="text-xl font-bold text-gray-300">{newUsersLastMonth}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Total</p>
                <p className="text-xl font-bold text-gray-300">{totalUsers}</p>
              </div>
            </div>
            <div className="h-px bg-gray-800" />

            {/* Top users by invitations */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Top Pengguna Aktif</p>
              <div className="space-y-2">
                {topUsers.map((u, i) => (
                  <Link key={u.id} href={`/admin/users/${u.id}`}
                    className="flex items-center justify-between hover:bg-gray-800/50 rounded-lg px-2 py-1.5 transition">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-4">{i + 1}.</span>
                      <div>
                        <p className="text-xs text-gray-200 font-medium">{u.name ?? u.email}</p>
                        <p className="text-xs text-gray-600">{u._count.invitations} undangan</p>
                      </div>
                    </div>
                    <span className="text-xs text-amber-400 font-semibold">{u.credits} kr</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Recent Transactions ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Transaksi Terbaru <span className="text-gray-600 font-normal text-sm">(30 hari)</span></h2>
          <Link href="/admin/transactions" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
            Lihat Semua →
          </Link>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {recentTransactions.length === 0 ? (
            <p className="text-center py-10 text-gray-600 text-sm">Belum ada transaksi berhasil.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-5 py-3">Paket</th>
                  <th className="text-right px-5 py-3">Amount</th>
                  <th className="text-right px-5 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-5 py-3">
                      <p className="text-gray-200 font-medium">{tx.user.name ?? '—'}</p>
                      <p className="text-gray-500 text-xs">{tx.user.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {CREDIT_PACKS[tx.packType as keyof typeof CREDIT_PACKS]?.label ?? tx.packType}
                      <span className="text-gray-600 text-xs ml-1.5">+{tx.credits}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-amber-400 font-semibold">
                      {formatRupiah(tx.amount)}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500 text-xs">
                      {new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Recent Users ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">User Terbaru</h2>
          <Link href="/admin/users" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
            Lihat Semua →
          </Link>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Nama</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-right px-5 py-3">Kredit</th>
                <th className="text-right px-5 py-3">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-800/40 transition">
                  <td className="px-5 py-3">
                    <Link href={`/admin/users/${u.id}`} className="text-gray-100 font-medium hover:text-amber-400 transition">
                      {u.name ?? '—'}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role === 'ADMIN'    ? 'bg-red-900/60 text-red-300' :
                      u.role === 'RESELLER' ? 'bg-purple-900/60 text-purple-300' :
                                             'bg-gray-800 text-gray-400'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-amber-400 font-semibold">{u.credits}</td>
                  <td className="px-5 py-3 text-right text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
