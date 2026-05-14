import { NextResponse } from 'next/server'
import { auth }         from '@/lib/auth'
import { db }           from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invitations = await db.invitation.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select:  {
      id:        true,
      slug:      true,
      title:     true,
      status:    true,
      viewCount: true,
      createdAt: true,
      _count:    { select: { rsvps: true } },
    },
  })

  return NextResponse.json(invitations)
}
