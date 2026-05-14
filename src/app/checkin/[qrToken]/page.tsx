import { db }        from '@/lib/db'
import { notFound }  from 'next/navigation'
import CheckinClient from './CheckinClient'

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ qrToken: string }>
}) {
  const { qrToken } = await params

  const rsvp = await db.rsvp.findUnique({
    where:   { qrToken },
    include: { invitation: { select: { title: true, slug: true } } },
  })

  if (!rsvp) notFound()

  return (
    <CheckinClient
      qrToken={qrToken}
      name={rsvp.name}
      guestCount={rsvp.guestCount}
      invitationTitle={rsvp.invitation.title}
      invitationSlug={rsvp.invitation.slug}
      alreadyCheckedIn={rsvp.checkedIn}
      checkedInAt={rsvp.checkedInAt?.toISOString() ?? null}
    />
  )
}
