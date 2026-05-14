import { db }            from '@/lib/db'
import { CREDIT_PACKS, formatRupiah } from '@/lib/utils'

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page } = await searchParams
  const pageNum  = Math.max(1, parseInt(page ?? '1'))
  const pageSize = 25
  const skip     = (pageNum - 1) * pageSize

  const where = status ? { status: status as 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' } : {}

  const [transactions, total, summary] = await Promise.all([
    db.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take:    pageSize,
      select:  {
        id: true, orderId: true, packType: true, credits: true,
        amount: true, status: true, createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    db.transaction.count({ where }),
    db.transaction.groupBy({
      by:    ['status'],
      _count: { id: true },
      _sum:   { amount: true },
    }),
  ])

  const totalPages = Math.ceil(total / pageSize)
  const revenue    = summary.find(s => s.status === 'SUCCESS')?._sum.amount ?? 0

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Transaksi</h1>
      <p className="text-gray-400 text-sm mb-6">
        Total revenue: <span className="text-amber-400 font-bold">{formatRupiah(revenue)}</span>
      </p>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6">
        {['', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'].map(s => (
          <a key={s} href={`?status=${s}`}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              (status ?? '') === s
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>
            {s || 'Semua'}
            <span className="ml-1.5 opacity-70">
              {s
                ? (summary.find(x => x.status === s)?._count.id ?? 0)
                : summary.reduce((acc, x) => acc + x._count.id, 0)
              }
            </span>
          </a>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3">Order ID</th>
              <th className="text-left px-5 py-3">User</th>
              <th className="text-left px-5 py-3">Paket</th>
              <th className="text-right px-5 py-3">Amount</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-800/50 transition">
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">{tx.orderId}</td>
                <td className="px-5 py-3">
                  <p className="text-gray-100">{tx.user.name ?? '—'}</p>
                  <p className="text-gray-500 text-xs">{tx.user.email}</p>
                </td>
                <td className="px-5 py-3 text-gray-300">
                  {CREDIT_PACKS[tx.packType as keyof typeof CREDIT_PACKS]?.label ?? tx.packType}
                  <span className="text-gray-500 text-xs ml-1">
                    ({tx.credits === -1 ? '∞' : `+${tx.credits}`})
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-amber-400 font-semibold">
                  {formatRupiah(tx.amount)}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    tx.status === 'SUCCESS'   ? 'bg-green-900 text-green-300' :
                    tx.status === 'PENDING'   ? 'bg-yellow-900 text-yellow-300' :
                    tx.status === 'CANCELLED' ? 'bg-gray-800 text-gray-400' :
                                               'bg-red-900 text-red-300'
                  }`}>{tx.status}</span>
                </td>
                <td className="px-5 py-3 text-right text-gray-500">
                  {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="text-center py-10 text-gray-500 text-sm">Tidak ada transaksi.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a key={p} href={`?status=${status ?? ''}&page=${p}`}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                p === pageNum ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}>
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
