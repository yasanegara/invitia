import { db } from './db'

export async function getConfig(key: string, defaultValue: string): Promise<string> {
  const row = await db.appConfig.findUnique({ where: { key } })
  return row?.value ?? defaultValue
}

export async function setConfig(key: string, value: string): Promise<void> {
  await db.appConfig.upsert({
    where:  { key },
    update: { value },
    create: { key, value },
  })
}

// IDR per 1M tokens — defaults approximate claude-sonnet at 15k IDR/USD
export const TOKEN_PRICE_DEFAULTS = {
  input:  '45000',   // Rp 45.000 / 1M input tokens
  output: '225000',  // Rp 225.000 / 1M output tokens
}

export function calcCost(inputTokens: number, outputTokens: number, priceInput: number, priceOutput: number): number {
  return Math.round((inputTokens / 1_000_000) * priceInput + (outputTokens / 1_000_000) * priceOutput)
}
