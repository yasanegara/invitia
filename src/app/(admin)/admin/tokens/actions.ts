'use server'

import { auth }      from '@/lib/auth'
import { setConfig } from '@/lib/config'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function updateTokenPricing(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

  const inputPriceUsd  = parseFloat(formData.get('inputPriceUsd')  as string)
  const outputPriceUsd = parseFloat(formData.get('outputPriceUsd') as string)

  if (isNaN(inputPriceUsd) || isNaN(outputPriceUsd) || inputPriceUsd < 0 || outputPriceUsd < 0)
    throw new Error('Nilai harga tidak valid')

  // Fetch real-time exchange rate
  let exchangeRate = 16000 // Fallback
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await res.json()
    if (data && data.rates && data.rates.IDR) {
      exchangeRate = data.rates.IDR
    }
  } catch (err) {
    console.error('Failed to fetch exchange rate', err)
  }

  const inputPriceIdr = Math.round(inputPriceUsd * exchangeRate)
  const outputPriceIdr = Math.round(outputPriceUsd * exchangeRate)

  await Promise.all([
    setConfig('token_price_input_usd', String(inputPriceUsd)),
    setConfig('token_price_output_usd', String(outputPriceUsd)),
    setConfig('token_price_input',  String(inputPriceIdr)),
    setConfig('token_price_output', String(outputPriceIdr)),
  ])

  revalidatePath('/admin/tokens')
}

export async function resetTokenStats() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

  await db.invitation.updateMany({
    data: {
      tokensInput: 0,
      tokensOutput: 0
    }
  })

  revalidatePath('/admin/tokens')
}
