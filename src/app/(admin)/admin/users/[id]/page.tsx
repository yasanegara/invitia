import { db }           from '@/lib/db'
import { notFound }      from 'next/navigation'
import { formatRupiah, CREDIT_PACKS } from '@/lib/utils'
import Link              from 'next/link'
import UserActions       from '@/components/admin/UserActions'
import AdminInvitationActions from '@/components/admin/AdminInvitationActions'

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, credits: true,
      createdAt: true, updatedAt: true,
      _count:    { select: { invitations: true, transactions: true } },
      invitations: {
        orderBy: { createdAt: 'desc' },
        take:    20,
        select: {
          id: true, slug: true, title: true, status: true,
          viewCount: true, editCount: true, createdAt: true,
          _count: { select: { rsvps: true } },
        },
      },
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, packType: true, credits: true, amount: true,
          status: true, orderId: true, createdAt: true,
        },
      },
    },
  })

  if (!user) notFound()

  const totalSpent = user.transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalViews = user.invitations
    .reduce((acc, inv) => acc + inv.viewCount, 0)

  return (
    <div className="p-8 space-y-8">

      {/* Back */}
      <Link href="/admin/users" className="text-xs text-gray-500 hover:text-gray-300 transition">
        ← Kembali ke Users
      </Link>

      {/* ── Profile Header ── */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold text-amber-400 border border-gray-700 shrink-0">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user.name ?? '—'}</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                user.role === 'ADMIN'    ? 'bg-red-900/60 text-red-300' :
                user.role === 'RESELLER' ? 'bg-purple-900/60 text-purple-300' :
                                           'bg-gray-800 text-gray-400'
              }`}>{user.role}</span>
              <span className="text-xs text-gray-600">
                Bergabung {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <UserActions userId={user.id} currentRole={user.role} currentCredits={user.credits} />
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Kredit Tersisa',   value: user.credits,                    color: 'text-amber-400'  },
          { label: 'Total Dibelanjakan', value: formatRupiah(totalSpent),       color: 'text-green-400'  },
          { label: 'Total Undangan',   value: user._count.invitations,          color: 'text-white'      },
          { label: 'Total Views',      value: totalViews,                       color: 'text-white'      },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Invitations ── */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Undangan <span className="text-gray-600 font-normal text-sm">({user._count.invitations})</span>
        </h2>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {user.invitations.length === 0 ? (
            <p className="text-center py-10 text-gray-600 text-sm">Belum ada undangan.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Judul</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Views</th>
                  <th className="text-right px-5 py-3">RSVP</th>
                  <th className="text-right px-5 py-3">Edit</th>
                  <th className="text-right px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {user.invitations.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-5 py-3">
                      <p className="text-gray-100 font-medium">{inv.title}</p>
                      <p className="text-gray-600 text-xs font-mono">{inv.slug}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        inv.status === 'PUBLISHED' ? 'bg-green-900/60 text-green-300' :
                        inv.status === 'DRAFT'     ? 'bg-gray-800 text-gray-400' :
                                                     'bg-gray-800 text-gray-500'
                      }`}>{inv.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-300">{inv.viewCount}</td>
                    <td className="px-5 py-3 text-right text-gray-300">{inv._count.rsvps}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{inv.editCount}</td>
                    <td className="px-5 py-3 text-right text-gray-500 text-xs">
                      {new Date(inv.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status === 'PUBLISHED' && (
                          <Link href={`/u/${inv.slug}`} target="_blank"
                            className="text-xs text-amber-400 hover:text-amber-300">Lihat →</Link>
                        )}
                        <AdminInvitationActions invitationId={inv.id} currentStatus={inv.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Transactions ── */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Riwayat Transaksi <span className="text-gray-600 font-normal text-sm">({user._count.transactions})</span>
        </h2>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {user.transactions.length === 0 ? (
            <p className="text-center py-10 text-gray-600 text-sm">Belum ada transaksi.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Order ID</th>
                  <th className="text-left px-5 py-3">Paket</th>
                  <th className="text-right px-5 py-3">Kredit</th>
                  <th className="text-right px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {user.transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{tx.orderId.slice(0, 12)}…</td>
                    <td className="px-5 py-3 text-gray-300">
                      {CREDIT_PACKS[tx.packType as keyof typeof CREDIT_PACKS]?.label ?? tx.packType}
                    </td>
                    <td className="px-5 py-3 text-right text-amber-400 font-semibold">+{tx.credits}</td>
                    <td className="px-5 py-3 text-right text-gray-200 font-semibold">
                      {formatRupiah(tx.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        tx.status === 'SUCCESS'   ? 'bg-green-900/60 text-green-300' :
                        tx.status === 'PENDING'   ? 'bg-yellow-900/60 text-yellow-300' :
                        tx.status === 'CANCELLED' ? 'bg-gray-800 text-gray-500' :
                                                    'bg-red-900/60 text-red-300'
                      }`}>{tx.status}</span>
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

    </div>
  )
}
