import { NextResponse } from 'next/server'
import { z }            from 'zod'
import { auth }         from '@/lib/auth'
import { db }           from '@/lib/db'

async function assertAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

const patchSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await assertAdmin())
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id }  = await params
  const body    = await req.json()
  const parsed  = patchSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const invitation = await db.invitation.update({
    where: { id },
    data:  { status: parsed.data.status },
    select: { id: true, status: true },
  })
  return NextResponse.json(invitation)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await assertAdmin())
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await db.invitation.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
