import { NextResponse } from 'next/server'
import { z }            from 'zod'
import { db }           from '@/lib/db'

const schema = z.object({
  name:       z.string().min(2),
  phone:      z.string().optional(),
  guestCount: z.number().int().min(1).max(10),
  attending:  z.boolean(),
  message:    z.string().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const invitation = await db.invitation.findUnique({ where: { id } })
  if (!invitation)
    return NextResponse.json({ error: 'Undangan tidak ditemukan' }, { status: 404 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })

  const rsvp = await db.rsvp.create({
    data: { invitationId: id, ...parsed.data },
  })

  return NextResponse.json(rsvp, { status: 201 })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rsvps = await db.rsvp.findMany({
    where:   { invitationId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(rsvps)
}
