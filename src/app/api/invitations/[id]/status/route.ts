import { NextResponse } from 'next/server'
import { z }            from 'zod'
import { auth }         from '@/lib/auth'
import { db }           from '@/lib/db'

const schema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED']),
})

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
    select: { userId: true, status: true },
  })
  if (!invitation)
    return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
  if (invitation.userId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (invitation.status === 'ARCHIVED')
    return NextResponse.json({ error: 'Undangan terarsip tidak dapat diubah statusnya' }, { status: 400 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })

  await db.invitation.update({
    where: { id },
    data:  { status: parsed.data.status },
  })

  return NextResponse.json({ ok: true, status: parsed.data.status })
}
