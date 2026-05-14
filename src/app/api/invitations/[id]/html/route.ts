import { NextResponse } from 'next/server'
import { z }            from 'zod'
import { auth }         from '@/lib/auth'
import { db }           from '@/lib/db'

const schema = z.object({ html: z.string().min(10) })

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const invitation = await db.invitation.findUnique({
    where:  { id },
    select: { userId: true },
  })
  if (!invitation)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (invitation.userId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  await db.invitation.update({
    where: { id },
    data:  { html: parsed.data.html },
  })

  return NextResponse.json({ ok: true })
}
