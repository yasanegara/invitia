import { NextResponse }  from 'next/server'
import { z }             from 'zod'
import { auth }          from '@/lib/auth'
import { db }            from '@/lib/db'
import { CREDIT_PACKS }  from '@/lib/utils'
import { nanoid }        from 'nanoid'

const schema = z.object({
  packType: z.enum(['STARTER', 'PRO', 'AGENCY']),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid pack type' }, { status: 400 })

  const { packType } = parsed.data
  const pack         = CREDIT_PACKS[packType]
  const orderId      = `INV-${nanoid(10).toUpperCase()}`

  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey)
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 })

  const user = await db.user.findUnique({
    where:  { id: session.user.id },
    select: { name: true, email: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Create transaction record first
  const transaction = await db.transaction.create({
    data: {
      userId:   session.user.id,
      orderId,
      packType,
      credits:  pack.credits,
      amount:   pack.price,
      status:   'PENDING',
    },
  })

  // Call Midtrans Snap API
  const midtransBody = {
    transaction_details: {
      order_id:     orderId,
      gross_amount: pack.price,
    },
    item_details: [{
      id:       packType,
      price:    pack.price,
      quantity: 1,
      name:     `invitia.id ${pack.label} Pack (${pack.credits === -1 ? 'Unlimited' : pack.credits + ' kredit'})`,
    }],
    customer_details: {
      first_name: user.name ?? 'User',
      email:      user.email,
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/settings?status=success`,
    },
  }

  const midtransRes = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
    },
    body: JSON.stringify(midtransBody),
  })

  if (!midtransRes.ok) {
    await db.transaction.update({ where: { id: transaction.id }, data: { status: 'FAILED' } })
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 502 })
  }

  const { token, redirect_url } = await midtransRes.json() as { token: string; redirect_url: string }

  return NextResponse.json({ token, redirect_url, orderId })
}
