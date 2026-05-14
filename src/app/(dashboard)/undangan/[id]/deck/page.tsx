import { db }      from '@/lib/db'
import { notFound } from 'next/navigation'
import DeckClient   from './DeckClient'

export default async function DeckPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const invitation = await db.invitation.findUnique({
    where:  { id },
    select: { title: true },
  })
  if (!invitation) notFound()

  const rows = await db.rsvp.findMany({
    where:   { invitationId: id, checkedIn: true },
    orderBy: { checkedInAt: 'desc' },
    select:  { id: true, name: true, guestCount: true, checkedInAt: true },
  })
  const initial = rows.map(r => ({ ...r, checkedInAt: r.checkedInAt?.toISOString() ?? null }))

  return (
    <DeckClient
      invitationId={id}
      invitationTitle={invitation.title}
      initialGuests={initial}
    />
  )
}
