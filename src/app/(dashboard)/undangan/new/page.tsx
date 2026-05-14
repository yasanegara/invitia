import { auth }     from '@/lib/auth'
import { redirect } from 'next/navigation'
import WizardForm   from '@/components/wizard/WizardForm'

export default async function NewInvitationPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return <WizardForm />
}
