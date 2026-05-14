'use client'

import { useRef, useTransition, useState, useEffect } from 'react'
import { updateTokenPricing, resetTokenStats }     from '@/app/(admin)/admin/tokens/actions'

export default function TokenPricingForm({
  defaultInputUsd,
  defaultOutputUsd,
}: {
  defaultInputUsd:  number
  defaultOutputUsd: number
}) {
  const formRef     = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()
  const [resetPending, startResetTransition] = useTransition()
  
  const [rate, setRate] = useState<number | null>(null)
  const [inUsd, setInUsd] = useState(String(defaultInputUsd ?? 0))
  const [outUsd, setOutUsd] = useState(String(defaultOutputUsd ?? 0))

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.IDR) setRate(data.rates.IDR)
      })
      .catch(console.error)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData(formRef.current!)
    startTransition(() => updateTokenPricing(fd))
  }

  function handleReset() {
    if (confirm('Apakah Anda yakin ingin mereset (menghapus) semua data perhitungan token pada semua undangan?')) {
      startResetTransition(() => resetTokenStats())
    }
  }

  return (
    <div className="space-y-6">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Harga Input <span className="text-gray-600">(USD / 1 Juta token)</span>
            </label>
            <input
              name="inputPriceUsd"
              type="number"
              step="0.01"
              min="0"
              value={inUsd}
              onChange={(e) => setInUsd(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
            />
            {rate && (
              <p className="text-xs text-gray-500 mt-2">
                ≈ Rp {((parseFloat(inUsd) || 0) * rate).toLocaleString('id-ID')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Harga Output <span className="text-gray-600">(USD / 1 Juta token)</span>
            </label>
            <input
              name="outputPriceUsd"
              type="number"
              step="0.01"
              min="0"
              value={outUsd}
              onChange={(e) => setOutUsd(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
            />
            {rate && (
              <p className="text-xs text-gray-500 mt-2">
                ≈ Rp {((parseFloat(outUsd) || 0) * rate).toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={pending}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
          >
            {pending ? 'Menyimpan...' : 'Simpan Harga'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={resetPending}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-50 border border-red-500/20 text-sm font-semibold px-5 py-2 rounded-xl transition"
          >
            {resetPending ? 'Mereset...' : 'Reset Penghitungan Token'}
          </button>
        </div>
        {rate && (
          <p className="text-xs text-emerald-500/80 mt-2">
            * Kurs IDR real-time: Rp {rate.toLocaleString('id-ID')} / 1 USD
          </p>
        )}
      </form>
    </div>
  )
}
