'use client'

import { useState } from 'react'
import Link          from 'next/link'

type Props = {
  qrToken: string
  name: string
  guestCount: number
  invitationTitle: string
  invitationSlug: string
  alreadyCheckedIn: boolean
  checkedInAt: string | null
}

export default function CheckinClient({
  qrToken, name, guestCount, invitationTitle, invitationSlug,
  alreadyCheckedIn, checkedInAt,
}: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>(
    alreadyCheckedIn ? 'done' : 'idle'
  )
  const [doneAt, setDoneAt] = useState<string | null>(checkedInAt)

  async function handleCheckin() {
    setState('loading')
    try {
      const res = await fetch(`/api/checkin/${qrToken}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setState('done')
        setDoneAt(data.rsvp.checkedInAt)
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  const formattedTime = doneAt
    ? new Date(doneAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Top accent */}
          <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600" />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-lg ${
              state === 'done' ? 'bg-green-500' : 'bg-amber-500'
            }`}>
              {state === 'done' ? '✓' : '🎫'}
            </div>

            {/* Event title */}
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
              {invitationTitle}
            </p>

            {/* Guest name */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
            <p className="text-sm text-gray-400 mb-8">
              {guestCount} {guestCount > 1 ? 'orang' : 'tamu'}
            </p>

            {/* Status */}
            {state === 'done' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
                <p className="text-green-700 font-bold text-lg">Selamat Datang! 🎉</p>
                <p className="text-green-600 text-sm mt-1">
                  {alreadyCheckedIn && !formattedTime
                    ? 'Kehadiran sudah tercatat sebelumnya.'
                    : `Tercatat pukul ${formattedTime}`}
                </p>
              </div>
            ) : state === 'error' ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-600 text-sm">
                Terjadi kesalahan. Silakan coba lagi.
              </div>
            ) : (
              <button
                onClick={handleCheckin}
                disabled={state === 'loading'}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base transition shadow-lg shadow-amber-200 mb-6">
                {state === 'loading' ? 'Memproses...' : 'Konfirmasi Kehadiran ✓'}
              </button>
            )}

            {/* Link to invitation */}
            <Link href={`/u/${invitationSlug}`} target="_blank"
              className="text-xs text-amber-600 hover:text-amber-700 font-medium">
              Buka Undangan ↗
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">invitia.id · Presensi Digital</p>
      </div>
    </div>
  )
}
