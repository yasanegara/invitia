'use client'

import { useState } from 'react'

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess:  (result: unknown) => void
        onPending:  (result: unknown) => void
        onError:    (result: unknown) => void
        onClose:    () => void
      }) => void
    }
  }
}

interface Props {
  packType:    string
  label:       string
  highlighted: boolean
}

export default function BuyButton({ packType, label, highlighted }: Props) {
  const [loading, setLoading] = useState(false)

  const loadSnapScript = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (window.snap) { resolve(); return }
      const script = document.createElement('script')
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '')
      script.onload  = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Midtrans Snap'))
      document.head.appendChild(script)
    })

  const handleBuy = async () => {
    setLoading(true)
    try {
      await loadSnapScript()

      const res = await fetch('/api/billing/create-transaction', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ packType }),
      })

      if (!res.ok) {
        const { error } = await res.json() as { error: string }
        alert(error || 'Gagal membuat transaksi')
        return
      }

      const { token } = await res.json() as { token: string }

      window.snap?.pay(token, {
        onSuccess: () => { window.location.href = '/settings?status=success' },
        onPending: () => { window.location.reload() },
        onError:   () => { alert('Pembayaran gagal. Coba lagi.') },
        onClose:   () => {},
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className={`mt-auto w-full py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
        highlighted
          ? 'bg-amber-500 hover:bg-amber-600 text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      }`}
    >
      {loading ? 'Memproses...' : label}
    </button>
  )
}
