import { db }   from '@/lib/db'
import Link      from 'next/link'
import UserActions from '@/components/admin/UserActions'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>
}) {
  const { q, role, page } = await searchParams
  const pageNum  = Math.max(1, parseInt(page ?? '1'))
  const pageSize = 20
  const skip     = (pageNum - 1) * pageSize

  const where = {
    ...(q    ? { OR: [{ email: { contains: q, mode: 'insensitive' as const } }, { name: { contains: q, mode: 'insensitive' as const } }] } : {}),
    ...(role ? { role: role as 'USER' | 'RESELLER' | 'ADMIN' } : {}),
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take:    pageSize,
      select:  {
        id: true, name: true, email: true, role: true, credits: true, createdAt: true,
        _count: { select: { invitations: true, transactions: true } },
      },
    }),
    db.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-gray-400 text-sm mb-6">{total} user terdaftar.</p>

      {/* Filters */}
      <form className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama atau email..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
        <select
          name="role"
          defaultValue={role ?? ''}
          className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
        >
          <option value="">Semua Role</option>
          <option value="USER">USER</option>
          <option value="RESELLER">RESELLER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button type="submit"
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
          Cari
        </button>
      </form>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3">User</th>
              <th className="text-left px-5 py-3">Role</th>
              <th className="text-right px-5 py-3">Kredit</th>
              <th className="text-right px-5 py-3">Undangan</th>
              <th className="text-right px-5 py-3">Bergabung</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-800/50 transition">
                <td className="px-5 py-3">
                  <Link href={`/admin/users/${u.id}`} className="text-gray-100 font-medium hover:text-amber-400 transition">
                    {u.name ?? '—'}
                  </Link>
                  <p className="text-gray-500 text-xs">{u.email}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === 'ADMIN'    ? 'bg-red-900 text-red-300' :
                    u.role === 'RESELLER' ? 'bg-purple-900 text-purple-300' :
                                           'bg-gray-800 text-gray-400'
                  }`}>{u.role}</span>
                </td>
                <td className="px-5 py-3 text-right text-amber-400 font-bold">{u.credits}</td>
                <td className="px-5 py-3 text-right text-gray-400">{u._count.invitations}</td>
                <td className="px-5 py-3 text-right text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-5 py-3 text-right">
                  <UserActions userId={u.id} currentRole={u.role} currentCredits={u.credits} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center py-10 text-gray-500 text-sm">Tidak ada user ditemukan.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a key={p} href={`?q=${q ?? ''}&role=${role ?? ''}&page=${p}`}
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
