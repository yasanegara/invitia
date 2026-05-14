import { auth }        from '@/lib/auth'
import { db }          from '@/lib/db'
import { redirect }    from 'next/navigation'
import Link            from 'next/link'
import { formatRupiah } from '@/lib/utils'
import DeleteInvitationButton from '@/components/dashboard/DeleteInvitationButton'
import PublishToggle           from '@/components/dashboard/PublishToggle'
import CopyLinkButton          from '@/components/dashboard/CopyLinkButton'
import LogoutButton            from '@/components/LogoutButton'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [user, invitations, totalCount, viewsAgg, totalRsvpCount] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, select: { name: true, credits: true, role: true } }),
    db.invitation.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take:    10,
      select:  { id: true, slug: true, title: true, status: true, viewCount: true, createdAt: true, _count: { select: { rsvps: true } } },
    }),
    db.invitation.count({ where: { userId: session.user.id } }),
    db.invitation.aggregate({ where: { userId: session.user.id }, _sum: { viewCount: true } }),
    db.rsvp.count({ where: { invitation: { userId: session.user.id } } }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg text-amber-600">invitia.id</span>
        <div className="flex items-center gap-4">
          <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700">
            🪙 <span className="font-semibold text-gray-800">{user?.credits ?? 0}</span> kredit
          </Link>
          <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700 font-medium">Pengaturan</Link>
          <LogoutButton />
          <Link href="/undangan/new" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            + Buat Undangan
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Halo, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola semua undangan digital kamu di sini.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Undangan', value: totalCount },
            { label: 'Total RSVP',    value: totalRsvpCount },
            { label: 'Total Dilihat', value: viewsAgg._sum.viewCount ?? 0 },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border">
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Invitation list */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Undangan Saya</h2>
            <Link href="/undangan/new" className="text-sm text-amber-600 font-semibold">+ Buat Baru</Link>
          </div>

          {invitations.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">💌</p>
              <p className="font-medium">Belum ada undangan</p>
              <p className="text-sm mt-1">Mulai buat undangan pertama kamu!</p>
              <Link href="/undangan/new" className="mt-4 inline-block bg-amber-500 text-white text-sm font-semibold px-6 py-2 rounded-xl">
                Buat Sekarang
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {invitations.map(inv => (
                <li key={inv.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <p className="font-medium text-gray-800">{inv.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {inv._count.rsvps} RSVP · {inv.viewCount} dilihat ·{' '}
                      {new Date(inv.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PublishToggle id={inv.id} status={inv.status} />
                    <CopyLinkButton slug={inv.slug} />
                    <Link href={`/undangan/${inv.id}/manage`}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium hover:underline">
                      Kelola
                    </Link>
                    <Link href={`/undangan/${inv.id}/edit`}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium hover:underline">
                      Edit
                    </Link>
                    {inv.status === 'PUBLISHED' && (
                      <Link href={`/u/${inv.slug}`} target="_blank"
                        className="text-xs text-amber-600 font-semibold hover:underline">
                        Lihat →
                      </Link>
                    )}
                    <DeleteInvitationButton id={inv.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
