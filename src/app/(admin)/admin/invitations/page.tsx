import { db } from '@/lib/db'
import Link from 'next/link'
import AdminInvitationActions from '@/components/admin/AdminInvitationActions'

export default async function AdminInvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const { q, status, page } = await searchParams
  const pageNum  = Math.max(1, parseInt(page ?? '1'))
  const pageSize = 25
  const skip     = (pageNum - 1) * pageSize

  const where = {
    ...(q      ? { OR: [{ title: { contains: q, mode: 'insensitive' as const } }, { slug: { contains: q, mode: 'insensitive' as const } }] } : {}),
    ...(status ? { status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' } : {}),
  }

  const [invitations, total] = await Promise.all([
    db.invitation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take:    pageSize,
      select:  {
        id: true, slug: true, title: true, status: true, viewCount: true, createdAt: true,
        user:  { select: { name: true, email: true } },
        _count: { select: { rsvps: true } },
      },
    }),
    db.invitation.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Undangan</h1>
      <p className="text-gray-400 text-sm mb-6">{total} undangan dibuat.</p>

      {/* Filters */}
      <form className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul atau slug..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
        >
          <option value="">Semua Status</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <button type="submit"
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
          Cari
        </button>
      </form>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3">Judul</th>
              <th className="text-left px-5 py-3">Pemilik</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Views</th>
              <th className="text-right px-5 py-3">RSVP</th>
              <th className="text-right px-5 py-3">Tanggal</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {invitations.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-800/50 transition">
                <td className="px-5 py-3">
                  <p className="text-gray-100 font-medium">{inv.title}</p>
                  <p className="text-gray-500 text-xs font-mono">{inv.slug}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-gray-300">{inv.user.name ?? '—'}</p>
                  <p className="text-gray-500 text-xs">{inv.user.email}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    inv.status === 'PUBLISHED' ? 'bg-green-900 text-green-300' :
                    inv.status === 'DRAFT'     ? 'bg-gray-800 text-gray-400' :
                                                 'bg-gray-800 text-gray-500'
                  }`}>{inv.status}</span>
                </td>
                <td className="px-5 py-3 text-right text-gray-300">{inv.viewCount}</td>
                <td className="px-5 py-3 text-right text-gray-300">{inv._count.rsvps}</td>
                <td className="px-5 py-3 text-right text-gray-500">
                  {new Date(inv.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                  <Link href={`/u/${inv.slug}`} target="_blank"
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                    Lihat →
                  </Link>
                  <AdminInvitationActions invitationId={inv.id} currentStatus={inv.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invitations.length === 0 && (
          <p className="text-center py-10 text-gray-500 text-sm">Tidak ada undangan.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a key={p} href={`?q=${q ?? ''}&status=${status ?? ''}&page=${p}`}
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
