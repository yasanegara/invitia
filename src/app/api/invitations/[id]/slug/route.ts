import { NextResponse } from 'next/server'
import { z }            from 'zod'
import { auth }         from '@/lib/auth'
import { db }           from '@/lib/db'

const schema = z.object({
  slug: z
    .string()
    .min(3, 'Minimal 3 karakter')
    .max(80, 'Maksimal 80 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Hanya huruf kecil, angka, dan tanda hubung (-)'),
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
    select: { userId: true },
  })
  if (!invitation)
    return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
  if (invitation.userId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { slug } = parsed.data

  const existing = await db.invitation.findUnique({ where: { slug }, select: { id: true } })
  if (existing && existing.id !== id)
    return NextResponse.json({ error: 'Slug sudah dipakai undangan lain' }, { status: 409 })

  await db.invitation.update({ where: { id }, data: { slug } })
  return NextResponse.json({ ok: true, slug })
}
