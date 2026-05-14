import { db }               from '@/lib/db'
import { formatRupiah }      from '@/lib/utils'
import { getConfig, TOKEN_PRICE_DEFAULTS, calcCost } from '@/lib/config'
import TokenPricingForm      from '@/components/admin/TokenPricingForm'
import Link                  from 'next/link'

export default async function AdminTokensPage() {
  const now           = new Date()
  const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1)

  const [priceInputStr, priceOutputStr, priceInputUsdStr, priceOutputUsdStr, globalAgg, monthAgg, recentInvitations] = await Promise.all([
    getConfig('token_price_input',  TOKEN_PRICE_DEFAULTS.input),
    getConfig('token_price_output', TOKEN_PRICE_DEFAULTS.output),
    getConfig('token_price_input_usd', '3.0'),
    getConfig('token_price_output_usd', '15.0'),
    db.invitation.aggregate({ _sum: { tokensInput: true, tokensOutput: true }, _count: { id: true } }),
    db.invitation.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum:  { tokensInput: true, tokensOutput: true },
      _count: { id: true },
    }),
    db.invitation.findMany({
      orderBy: { createdAt: 'desc' },
      take:    50,
      select:  {
        id: true, title: true, tokensInput: true, tokensOutput: true, createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ])

  const priceInput  = parseInt(priceInputStr,  10)
  const priceOutput = parseInt(priceOutputStr, 10)

  const totalIn   = globalAgg._sum.tokensInput  ?? 0
  const totalOut  = globalAgg._sum.tokensOutput ?? 0
  const monthIn   = monthAgg._sum.tokensInput   ?? 0
  const monthOut  = monthAgg._sum.tokensOutput  ?? 0

  const totalCost = calcCost(totalIn, totalOut, priceInput, priceOutput)
  const monthCost = calcCost(monthIn, monthOut, priceInput, priceOutput)

  const avgInPerInv  = globalAgg._count.id > 0 ? Math.round(totalIn  / globalAgg._count.id) : 0
  const avgOutPerInv = globalAgg._count.id > 0 ? Math.round(totalOut / globalAgg._count.id) : 0
  const avgCostPerInv = calcCost(avgInPerInv, avgOutPerInv, priceInput, priceOutput)

  return (
    <div className="p-8 space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-white">Token Usage</h1>
        <p className="text-gray-400 text-sm mt-0.5">Penggunaan token AI & estimasi biaya</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Token (semua)',
            value: ((totalIn + totalOut) / 1000).toFixed(1) + 'K',
            sub:   `${(totalIn/1000).toFixed(1)}K in · ${(totalOut/1000).toFixed(1)}K out`,
            color: 'text-white',
          },
          {
            label: 'Estimasi Biaya Total',
            value: formatRupiah(totalCost),
            sub:   `${globalAgg._count.id} undangan`,
            color: 'text-red-400',
          },
          {
            label: 'Token Bulan Ini',
            value: ((monthIn + monthOut) / 1000).toFixed(1) + 'K',
            sub:   `${monthAgg._count.id} undangan`,
            color: 'text-white',
          },
          {
            label: 'Biaya Bulan Ini',
            value: formatRupiah(monthCost),
            sub:   `avg ${formatRupiah(avgCostPerInv)}/undangan`,
            color: 'text-red-400',
          },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Average per invitation */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">Rata-rata per Undangan</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Input Tokens</p>
            <p className="text-xl font-bold text-blue-400">{avgInPerInv.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Output Tokens</p>
            <p className="text-xl font-bold text-purple-400">{avgOutPerInv.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Estimasi Biaya</p>
            <p className="text-xl font-bold text-red-400">{formatRupiah(avgCostPerInv)}</p>
          </div>
        </div>
      </div>

      {/* Pricing Settings */}
      <div className="bg-gray-900 rounded-2xl border border-amber-800/40 p-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1">Pengaturan Harga Token</h2>
        <p className="text-xs text-gray-500 mb-5">
          Set harga sesuai provider AI kamu. Digunakan hanya untuk estimasi biaya — tidak mempengaruhi harga ke user.
        </p>
        <TokenPricingForm defaultInputUsd={parseFloat(priceInputUsdStr)} defaultOutputUsd={parseFloat(priceOutputUsdStr)} />
      </div>

      {/* Per-invitation table */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Per Undangan <span className="text-gray-600 font-normal text-sm">(50 terbaru)</span>
        </h2>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Undangan</th>
                <th className="text-left px-5 py-3">User</th>
                <th className="text-right px-5 py-3">Input</th>
                <th className="text-right px-5 py-3">Output</th>
                <th className="text-right px-5 py-3">Est. Biaya</th>
                <th className="text-right px-5 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentInvitations.map(inv => {
                const cost = calcCost(inv.tokensInput, inv.tokensOutput, priceInput, priceOutput)
                return (
                  <tr key={inv.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-5 py-3">
                      <p className="text-gray-200 font-medium truncate max-w-[180px]">{inv.title}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/users/${inv.user.id}`}
                        className="text-gray-400 hover:text-amber-400 transition text-xs">
                        {inv.user.name ?? inv.user.email}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right text-blue-400 font-mono text-xs">
                      {inv.tokensInput > 0 ? inv.tokensInput.toLocaleString('id-ID') : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right text-purple-400 font-mono text-xs">
                      {inv.tokensOutput > 0 ? inv.tokensOutput.toLocaleString('id-ID') : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right text-red-400 font-semibold text-xs">
                      {cost > 0 ? formatRupiah(cost) : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500 text-xs">
                      {new Date(inv.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {recentInvitations.length === 0 && (
            <p className="text-center py-10 text-gray-600 text-sm">Belum ada data undangan.</p>
          )}
        </div>
      </div>

    </div>
  )
}
