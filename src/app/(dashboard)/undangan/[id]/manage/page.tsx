import { auth }      from '@/lib/auth'
import { db }        from '@/lib/db'
import { redirect }  from 'next/navigation'
import Link          from 'next/link'
import ManageTabs    from '@/components/manage/ManageTabs'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://invitia.id'

export default async function ManagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }    = await params
  const session   = await auth()
  if (!session?.user?.id) redirect('/login')

  const invitation = await db.invitation.findUnique({
    where:  { id },
    select: {
      id: true, title: true, slug: true, userId: true,
      rsvps: {
        orderBy: { createdAt: 'desc' },
        select:  {
          id: true, name: true, phone: true, guestCount: true,
          attending: true, message: true, qrToken: true,
          checkedIn: true, checkedInAt: true, createdAt: true,
        },
      },
    },
  })

  if (!invitation || invitation.userId !== session.user.id) redirect('/dashboard')

  const totalHadir   = invitation.rsvps.filter(r => r.attending).reduce((s, r) => s + r.guestCount, 0)
  const totalCheckin = invitation.rsvps.filter(r => r.checkedIn).reduce((s, r) => s + r.guestCount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-amber-600 font-bold text-lg">invitia.id</Link>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md tracking-wide">Beta</span>
          </div>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 text-sm font-medium truncate max-w-[200px]">{invitation.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/undangan/${id}/deck`} target="_blank"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium">
            Layar Tamu ↗
          </Link>
          <Link href="/dashboard"
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl transition">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Kelola Tamu</h1>
          <p className="text-gray-500 text-sm mt-1">{invitation.title}</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total RSVP',   value: invitation.rsvps.length },
            { label: 'Konfirmasi Hadir', value: invitation.rsvps.filter(r => r.attending).length, color: 'text-green-600' },
            { label: 'Total Tamu',   value: totalHadir,    color: 'text-blue-600' },
            { label: 'Check-in',     value: totalCheckin,  color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border text-center">
              <p className={`text-xl font-bold ${s.color ?? 'text-gray-800'}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <ManageTabs
          rsvps={invitation.rsvps}
          invitationId={invitation.id}
          invitationTitle={invitation.title}
          invitationSlug={invitation.slug}
          baseUrl={BASE_URL}
        />
      </main>
    </div>
  )
}
