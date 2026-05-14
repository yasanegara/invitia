'use client'

import { useState, useEffect, useCallback } from 'react'

type Guest = {
  id: string
  name: string
  guestCount: number
  checkedInAt: string | null
}

type Props = {
  invitationId: string
  invitationTitle: string
  initialGuests: Guest[]
}

const COLORS = [
  'from-amber-500 to-orange-500',
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-teal-500',
  'from-rose-500 to-red-500',
  'from-indigo-500 to-violet-500',
]

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function timeLabel(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function colorFor(name: string) {
  const idx = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % COLORS.length
  return COLORS[idx]
}

export default function DeckClient({ invitationId, invitationTitle, initialGuests }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [newGuest, setNewGuest] = useState<Guest | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const fetchGuests = useCallback(async () => {
    try {
      const res  = await fetch(`/api/invitations/${invitationId}/checkedin`)
      const data = await res.json()
      if (!Array.isArray(data)) return
      setGuests(prev => {
        const prevIds = new Set(prev.map(g => g.id))
        const added   = (data as Guest[]).filter(g => !prevIds.has(g.id))
        if (added.length > 0) setNewGuest(added[0])
        return data
      })
    } catch {/* silent */}
  }, [invitationId])

  useEffect(() => {
    const interval = setInterval(fetchGuests, 5000)
    return () => clearInterval(interval)
  }, [fetchGuests])

  useEffect(() => {
    if (!newGuest) return
    const t = setTimeout(() => setNewGuest(null), 4000)
    return () => clearTimeout(t)
  }, [newGuest])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-800 shrink-0">
        <div>
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest">invitia.id · Guest Deck</p>
          <h1 className="text-xl font-bold text-white mt-0.5 truncate max-w-[400px]">{invitationTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-black text-amber-400">{guests.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {guests.reduce((s, g) => s + g.guestCount, 0)} tamu hadir
            </p>
          </div>
          <button
            onClick={toggleFullscreen}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold px-4 py-2 rounded-xl transition">
            {isFullscreen ? '⊡ Keluar' : '⊞ Fullscreen'}
          </button>
        </div>
      </header>

      {/* New guest notification */}
      {newGuest && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-amber-500 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-amber-500/40 text-center">
            <p className="text-xs uppercase tracking-widest mb-1 opacity-80">Baru Tiba! 🎉</p>
            <p className="text-2xl">{newGuest.name}</p>
          </div>
        </div>
      )}

      {/* Guest grid */}
      <main className="flex-1 p-8 overflow-auto">
        {guests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-600">
            <p className="text-6xl">🎫</p>
            <p className="text-xl font-semibold">Menunggu tamu...</p>
            <p className="text-sm">Layar ini otomatis update saat tamu scan QR presensi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {guests.map(g => (
              <div key={g.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center hover:border-gray-700 transition">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorFor(g.name)} flex items-center justify-center text-xl font-black mx-auto mb-3 shadow-lg`}>
                  {initials(g.name)}
                </div>
                <p className="font-semibold text-white text-sm leading-tight truncate">{g.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {g.guestCount > 1 ? `+${g.guestCount - 1}` : ''} {timeLabel(g.checkedInAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-700 py-3 shrink-0">
        Otomatis refresh setiap 5 detik · invitia.id
      </footer>
    </div>
  )
}
