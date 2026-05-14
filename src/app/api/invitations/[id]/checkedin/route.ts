import { NextResponse } from 'next/server'
import { db }           from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const guests = await db.rsvp.findMany({
    where:   { invitationId: id, checkedIn: true },
    orderBy: { checkedInAt: 'desc' },
    select:  { id: true, name: true, guestCount: true, checkedInAt: true },
  })
  return NextResponse.json(guests)
}
