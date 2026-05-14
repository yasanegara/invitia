import { auth }      from '@/lib/auth'
import { db }        from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import InvitationEditor from '@/components/editor/InvitationEditor'
import type { InvitationParams } from '@/types'

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params

  const invitation = await db.invitation.findUnique({
    where:  { id },
    select: { userId: true, slug: true, title: true, html: true, params: true, editCount: true, status: true },
  })

  if (!invitation) notFound()
  if (invitation.userId !== session.user.id) redirect('/dashboard')

  return (
    <InvitationEditor
      invitationId={id}
      slug={invitation.slug}
      html={invitation.html}
      savedParams={invitation.params as unknown as InvitationParams}
      editCount={invitation.editCount}
      status={invitation.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'}
    />
  )
}
