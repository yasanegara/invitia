import { auth }      from '@/lib/auth'
import { db }        from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import WizardForm    from '@/components/wizard/WizardForm'
import type { InvitationParams } from '@/types'

export default async function RegenInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params

  const invitation = await db.invitation.findUnique({
    where:  { id },
    select: { userId: true, params: true, editCount: true },
  })

  if (!invitation) notFound()
  if (invitation.userId !== session.user.id) redirect('/dashboard')

  return (
    <WizardForm
      invitationId={id}
      initialParams={invitation.params as unknown as InvitationParams}
      editCount={invitation.editCount}
    />
  )
}
