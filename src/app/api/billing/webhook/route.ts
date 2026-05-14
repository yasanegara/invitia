import { NextResponse } from 'next/server'
import { db }           from '@/lib/db'
import { CREDIT_PACKS } from '@/lib/utils'
import crypto           from 'crypto'

export async function POST(req: Request) {
  const body = await req.json() as {
    order_id:            string
    status_code:         string
    gross_amount:        string
    transaction_status:  string
    fraud_status?:       string
    signature_key:       string
  }

  // Verify Midtrans signature
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ''
  const raw       = body.order_id + body.status_code + body.gross_amount + serverKey
  const expected  = crypto.createHash('sha512').update(raw).digest('hex')

  if (expected !== body.signature_key)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })

  const { order_id, transaction_status, fraud_status } = body
  const isSuccess =
    transaction_status === 'settlement' ||
    (transaction_status === 'capture' && fraud_status === 'accept')

  const transaction = await db.transaction.findUnique({ where: { orderId: order_id } })
  if (!transaction)
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

  if (transaction.status !== 'PENDING')
    return NextResponse.json({ ok: true }) // already processed

  if (isSuccess) {
    const pack    = CREDIT_PACKS[transaction.packType as keyof typeof CREDIT_PACKS]
    const isAgency = pack.credits === -1

    await db.$transaction([
      db.transaction.update({
        where: { orderId: order_id },
        data:  { status: 'SUCCESS' },
      }),
      // For Agency (unlimited), add a large pool; for others add exact credits
      db.user.update({
        where: { id: transaction.userId },
        data:  { credits: { increment: isAgency ? 9999 : pack.credits } },
      }),
    ])
  } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
    await db.transaction.update({
      where: { orderId: order_id },
      data:  { status: transaction_status === 'cancel' ? 'CANCELLED' : 'FAILED' },
    })
  }

  return NextResponse.json({ ok: true })
}
