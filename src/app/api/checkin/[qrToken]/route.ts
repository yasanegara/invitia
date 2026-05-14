import { NextResponse } from 'next/server'
import { db }           from '@/lib/db'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ qrToken: string }> }
) {
  const { qrToken } = await params

  const rsvp = await db.rsvp.findUnique({ where: { qrToken } })
  if (!rsvp)
    return NextResponse.json({ error: 'Tamu tidak ditemukan' }, { status: 404 })

  if (rsvp.checkedIn)
    return NextResponse.json({ already: true, rsvp }, { status: 200 })

  const updated = await db.rsvp.update({
    where:  { qrToken },
    data:   { checkedIn: true, checkedInAt: new Date() },
  })

  return NextResponse.json({ already: false, rsvp: updated }, { status: 200 })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ qrToken: string }> }
) {
  const { qrToken } = await params
  const rsvp = await db.rsvp.findUnique({
    where:  { qrToken },
    include: { invitation: { select: { title: true, slug: true } } },
  })
  if (!rsvp)
    return NextResponse.json({ error: 'Tamu tidak ditemukan' }, { status: 404 })
  return NextResponse.json(rsvp)
}
