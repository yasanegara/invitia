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
  credits: z.number().int().min(0).optional(),
  role:    z.enum(['USER', 'RESELLER', 'ADMIN']).optional(),
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

  const user = await db.user.update({
    where: { id },
    data:  parsed.data,
    select: { id: true, name: true, credits: true, role: true },
  })
  return NextResponse.json(user)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await assertAdmin())
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await db.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
