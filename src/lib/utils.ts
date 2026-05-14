import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 40)
}

export const CREDIT_PACKS = {
  STARTER: { credits: 10, price: 400_000, label: 'Starter' },
  PRO:     { credits: 30, price: 900_000, label: 'Pro'     },
  AGENCY:  { credits: -1, price: 299_000, label: 'Agency'  },
} as const

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style:    'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
