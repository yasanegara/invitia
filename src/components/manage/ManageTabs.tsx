'use client'

import { useState } from 'react'
import QRCode        from 'react-qr-code'
import Link          from 'next/link'

type Rsvp = {
  id: string
  name: string
  phone: string | null
  guestCount: number
  attending: boolean
  message: string | null
  qrToken: string
  checkedIn: boolean
  checkedInAt: Date | null
  createdAt: Date
}

type Props = {
  rsvps: Rsvp[]
  invitationId: string
  invitationTitle: string
  invitationSlug: string
  baseUrl: string
}

const TABS = ['Tamu', 'QR Presensi', 'Kirim WA'] as const
type Tab = typeof TABS[number]

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function buildWaMessage(name: string, title: string, slug: string, baseUrl: string) {
  const url = `${baseUrl}/u/${slug}`
  return encodeURIComponent(
    `Halo ${name}! 🎉\n\nKami dengan senang hati mengundang kamu ke *${title}*.\n\nSilakan buka undangan digitalmu di sini:\n${url}\n\nMohon konfirmasi kehadiran ya. Terima kasih! 🙏`
  )
}

export default function ManageTabs({ rsvps, invitationId, invitationTitle, invitationSlug, baseUrl }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Tamu')

  const attending = rsvps.filter(r => r.attending)
  const notAttending = rsvps.filter(r => !r.attending)
  const checkedIn = rsvps.filter(r => r.checkedIn)

  return (
    <div>
      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: Tamu ── */}
      {activeTab === 'Tamu' && (
        <div>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total RSVP',   value: rsvps.length,       color: 'text-gray-800' },
              { label: 'Hadir',        value: attending.length,   color: 'text-green-600' },
              { label: 'Check-in',     value: checkedIn.length,   color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-4 text-center border">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {rsvps.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm">Belum ada tamu yang RSVP.</p>
          ) : (
            <div className="space-y-2">
              {rsvps.map(r => (
                <div key={r.id}
                  className="flex items-center gap-3 bg-gray-50 border rounded-2xl px-4 py-3 hover:bg-white transition">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {initials(r.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{r.name}</p>
                    <p className="text-xs text-gray-400">
                      {r.guestCount} orang ·{' '}
                      {r.attending ? <span className="text-green-600">Hadir</span> : <span className="text-red-500">Tidak Hadir</span>}
                      {r.checkedIn && <span className="text-amber-600"> · ✓ Check-in</span>}
                    </p>
                    {r.message && <p className="text-xs text-gray-400 italic truncate mt-0.5">"{r.message}"</p>}
                  </div>
                  {r.phone && (
                    <a
                      href={`https://wa.me/${r.phone.replace(/\D/g, '')}?text=${buildWaMessage(r.name, invitationTitle, invitationSlug, baseUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition">
                      WA
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Link to deck */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-amber-800 text-sm">Layar Tamu (Guest Deck)</p>
              <p className="text-xs text-amber-600 mt-0.5">Tampilkan di layar/proyektor saat acara berlangsung</p>
            </div>
            <Link href={`/undangan/${invitationId}/deck`} target="_blank"
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shrink-0">
              Buka Layar →
            </Link>
          </div>
        </div>
      )}

      {/* ── Tab: QR Presensi ── */}
      {activeTab === 'QR Presensi' && (
        <div>
          <p className="text-sm text-gray-500 mb-6">
            Bagikan atau cetak QR code per tamu. Saat acara, tamu scan QR → otomatis tercatat hadir.
          </p>
          {attending.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm">
              Belum ada tamu yang konfirmasi hadir.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3">
              {attending.map(r => {
                const url = `${baseUrl}/checkin/${r.qrToken}`
                return (
                  <div key={r.id}
                    className="bg-white border rounded-2xl p-4 flex flex-col items-center gap-3 hover:shadow-md transition print:break-inside-avoid">
                    <QRCode
                      value={url}
                      size={120}
                      bgColor="#ffffff"
                      fgColor="#1f2937"
                      level="M"
                    />
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.guestCount} orang</p>
                      {r.checkedIn && (
                        <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          ✓ Sudah Hadir
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {attending.length > 0 && (
            <button
              onClick={() => window.print()}
              className="mt-6 w-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold py-3 rounded-2xl transition print:hidden">
              🖨️ Cetak Semua QR
            </button>
          )}
        </div>
      )}

      {/* ── Tab: Kirim WA ── */}
      {activeTab === 'Kirim WA' && (
        <div>
          <p className="text-sm text-gray-500 mb-6">
            Klik tombol di bawah untuk mengirim undangan personal lewat WhatsApp. Tamu yang tidak punya nomor WA perlu diisi secara manual.
          </p>

          {/* Guests with phone */}
          {attending.filter(r => r.phone).length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Tamu dengan Nomor WA ({attending.filter(r => r.phone).length})
              </p>
              <div className="space-y-2">
                {attending.filter(r => r.phone).map(r => (
                  <div key={r.id} className="flex items-center gap-3 bg-gray-50 border rounded-xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.phone}</p>
                    </div>
                    <a
                      href={`https://wa.me/${r.phone!.replace(/\D/g, '')}?text=${buildWaMessage(r.name, invitationTitle, invitationSlug, baseUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shrink-0">
                      Kirim WA
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guests without phone */}
          {attending.filter(r => !r.phone).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Belum Ada Nomor WA ({attending.filter(r => !r.phone).length})
              </p>
              <div className="space-y-2">
                {attending.filter(r => !r.phone).map(r => (
                  <div key={r.id} className="flex items-center gap-3 bg-gray-50 border rounded-xl px-4 py-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{r.name}</p>
                      <p className="text-xs text-gray-400">Nomor WA belum diisi</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {attending.length === 0 && (
            <p className="text-center py-12 text-gray-400 text-sm">
              Belum ada tamu yang konfirmasi hadir.
            </p>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-700">
            <p className="font-semibold mb-1">Cara menambah nomor WA tamu</p>
            <p>Tamu bisa mengisi nomor WA saat RSVP di undangan. Atau, minta tamu untuk mengisi ulang RSVP mereka dengan nomor WA.</p>
          </div>
        </div>
      )}
    </div>
  )
}
