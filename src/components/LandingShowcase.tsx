'use client'

import { useState } from 'react'

type InvType = 'nikah' | 'wisuda' | 'ulang_tahun' | 'aqiqah' | 'khitan' | 'gathering'

const TYPES: { id: InvType; label: string; emoji: string }[] = [
  { id: 'nikah',       label: 'Pernikahan',  emoji: '💍' },
  { id: 'wisuda',      label: 'Wisuda',      emoji: '🎓' },
  { id: 'ulang_tahun', label: 'Ulang Tahun', emoji: '🎂' },
  { id: 'aqiqah',      label: 'Aqiqah',      emoji: '🌿' },
  { id: 'khitan',      label: 'Khitan',      emoji: '⭐' },
  { id: 'gathering',   label: 'Gathering',   emoji: '🎉' },
]

function NikahPreview() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8 px-6 text-center"
      style={{ background: 'linear-gradient(160deg,#1a0800 0%,#3d1500 50%,#1a0800 100%)' }}>
      <p className="text-amber-400/60 text-[10px] tracking-[0.35em] uppercase">Undangan Pernikahan</p>
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 h-px bg-amber-700/40" />
        <span className="text-amber-500">❋</span>
        <div className="flex-1 h-px bg-amber-700/40" />
      </div>
      <p className="text-amber-300/80 text-sm">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
      <div>
        <p className="text-amber-100 text-3xl font-bold" style={{ fontFamily: 'Georgia,serif' }}>Rizky</p>
        <p className="text-amber-500/70 text-sm my-1">&amp;</p>
        <p className="text-amber-100 text-3xl font-bold" style={{ fontFamily: 'Georgia,serif' }}>Salsabila</p>
      </div>
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 h-px bg-amber-700/40" />
        <span className="text-amber-500/60 text-xs">✦ ✦ ✦</span>
        <div className="flex-1 h-px bg-amber-700/40" />
      </div>
      <div>
        <p className="text-amber-400 font-semibold">Ahad, 15 Juni 2025</p>
        <p className="text-amber-200/50 text-xs mt-0.5">Graha Saba Buana · Yogyakarta</p>
      </div>
      <div className="border border-amber-600/50 text-amber-400 text-[11px] px-5 py-1.5 rounded-full">
        Konfirmasi Kehadiran
      </div>
      <p className="text-amber-400/25 text-[10px] tracking-widest">✦ invitia.id ✦</p>
    </div>
  )
}

function WisudaPreview() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8 px-6 text-center"
      style={{ background: 'linear-gradient(160deg,#080f1e 0%,#112249 50%,#080f1e 100%)' }}>
      <p className="text-blue-400/60 text-[10px] tracking-[0.35em] uppercase">Tasyakuran Wisuda</p>
      <div className="text-5xl">🎓</div>
      <div>
        <p className="text-blue-300/60 text-[11px] uppercase tracking-widest mb-2">Dengan bangga mempersembahkan</p>
        <p className="text-white text-2xl font-bold" style={{ fontFamily: 'Georgia,serif' }}>Fadhilah Nur Azizah</p>
        <div className="h-px bg-amber-400/40 w-20 mx-auto my-2" />
        <p className="text-blue-300 text-xs">S.Kom · Universitas Gadjah Mada</p>
      </div>
      <div className="bg-blue-900/40 border border-blue-700/30 rounded-xl px-4 py-3 w-full">
        <p className="text-amber-400 font-semibold text-sm">Sabtu, 22 Maret 2025</p>
        <p className="text-blue-300/50 text-xs mt-0.5">Auditorium Grha Sabha Pramana</p>
      </div>
      <div className="border border-blue-500/40 text-blue-300 text-[11px] px-5 py-1.5 rounded-full">
        Konfirmasi Kehadiran
      </div>
      <p className="text-blue-400/25 text-[10px] tracking-widest">✦ invitia.id ✦</p>
    </div>
  )
}

function UlangTahunPreview() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8 px-6 text-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#3b0764 0%,#7c2d8e 50%,#c2185b 100%)' }}>
      <div className="absolute top-6 left-6 w-2 h-2 rounded-full bg-yellow-300/50" />
      <div className="absolute top-14 right-10 w-2 h-2 rounded-full bg-cyan-300/50" />
      <div className="absolute top-28 left-14 w-1.5 h-1.5 rounded-full bg-pink-300/50" />
      <div className="absolute bottom-20 left-8 w-2 h-2 rounded-full bg-green-300/50" />
      <div className="absolute bottom-14 right-8 w-1.5 h-1.5 rounded-full bg-orange-300/50" />
      <p className="text-yellow-300 text-[11px] font-bold tracking-[0.3em] uppercase relative">🎉 You&apos;re Invited!</p>
      <div className="relative">
        <div className="text-5xl mb-2">🎂</div>
        <p className="text-white/60 text-[11px] uppercase tracking-widest mb-1">Merayakan</p>
        <p className="text-white text-2xl font-black mb-2" style={{ fontFamily: 'Georgia,serif' }}>Ananda Putri</p>
        <div className="w-12 h-12 rounded-full bg-yellow-400 text-purple-900 font-black text-xl flex items-center justify-center mx-auto">7</div>
        <p className="text-pink-200 text-xs mt-2">Ulang Tahun yang ke-7</p>
      </div>
      <div className="bg-white/10 rounded-xl px-4 py-3 w-full relative">
        <p className="text-yellow-300 font-semibold text-sm">Minggu, 8 Juni 2025</p>
        <p className="text-pink-200/60 text-xs mt-0.5">Taman Bermain Sari · 10.00 WIB</p>
      </div>
      <p className="text-white/25 text-[10px] tracking-widest relative">✦ invitia.id ✦</p>
    </div>
  )
}

function AqiqahPreview() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8 px-6 text-center"
      style={{ background: 'linear-gradient(160deg,#0b1f1a 0%,#0f3d2e 50%,#0b1f1a 100%)' }}>
      <p className="text-emerald-400/60 text-[10px] tracking-[0.35em] uppercase">Tasyakuran Aqiqah</p>
      <p className="text-amber-400/80 text-sm">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
      <div>
        <p className="text-emerald-200/60 text-[11px] mb-2">Alhamdulillah telah lahir putra kami</p>
        <p className="text-white text-2xl font-bold" style={{ fontFamily: 'Georgia,serif' }}>Muhammad Rayyan</p>
        <div className="flex items-center gap-2 justify-center my-2">
          <div className="h-px w-10 bg-emerald-500/40" />
          <span className="text-emerald-400 text-sm">🌿</span>
          <div className="h-px w-10 bg-emerald-500/40" />
        </div>
        <p className="text-emerald-300/60 text-xs">Putra dari</p>
        <p className="text-emerald-200 text-sm font-medium mt-0.5">Bpk. Ahmad & Ibu Siti</p>
      </div>
      <div className="bg-emerald-900/40 border border-emerald-700/30 rounded-xl px-4 py-3 w-full">
        <p className="text-amber-400 font-semibold text-sm">Sabtu, 29 Maret 2025</p>
        <p className="text-emerald-300/50 text-xs mt-0.5">Kediaman Keluarga · Bandung</p>
      </div>
      <div className="border border-emerald-500/40 text-emerald-300 text-[11px] px-5 py-1.5 rounded-full">
        Konfirmasi Kehadiran
      </div>
      <p className="text-emerald-400/25 text-[10px] tracking-widest">✦ invitia.id ✦</p>
    </div>
  )
}

function KhitanPreview() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8 px-6 text-center"
      style={{ background: 'linear-gradient(160deg,#0d1f2a 0%,#133547 50%,#0d1f2a 100%)' }}>
      <p className="text-cyan-400/60 text-[10px] tracking-[0.35em] uppercase">Walimatul Khitan</p>
      <p className="text-amber-400/80 text-sm">الحمد لله رب العالمين</p>
      <div>
        <div className="text-4xl mb-3">⭐</div>
        <p className="text-white/60 text-[11px] uppercase tracking-widest mb-2">Dengan penuh syukur mengundang</p>
        <p className="text-white text-2xl font-bold" style={{ fontFamily: 'Georgia,serif' }}>Farhan Al-Ghifari</p>
        <div className="h-px bg-cyan-500/30 w-16 mx-auto my-2" />
        <p className="text-cyan-300/60 text-xs">Putra dari Bpk. Hendra & Ibu Dewi</p>
      </div>
      <div className="bg-cyan-900/30 border border-cyan-700/30 rounded-xl px-4 py-3 w-full">
        <p className="text-amber-400 font-semibold text-sm">Ahad, 13 April 2025</p>
        <p className="text-cyan-300/50 text-xs mt-0.5">Aula Masjid Al-Ikhlas · Cirebon</p>
      </div>
      <div className="border border-cyan-500/40 text-cyan-300 text-[11px] px-5 py-1.5 rounded-full">
        Konfirmasi Kehadiran
      </div>
      <p className="text-cyan-400/25 text-[10px] tracking-widest">✦ invitia.id ✦</p>
    </div>
  )
}

function GatheringPreview() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8 px-6 text-center"
      style={{ background: 'linear-gradient(160deg,#10101e 0%,#1a2550 50%,#10101e 100%)' }}>
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 h-px bg-indigo-500/30" />
        <p className="text-indigo-400/60 text-[10px] tracking-[0.3em] uppercase">Corporate Event</p>
        <div className="flex-1 h-px bg-indigo-500/30" />
      </div>
      <div>
        <div className="text-4xl mb-2">🎉</div>
        <p className="text-indigo-300/60 text-[11px] uppercase tracking-widest mb-1">Mengundang Bapak/Ibu/Sdr/i</p>
        <p className="text-white text-2xl font-black">Annual Gathering</p>
        <p className="text-indigo-300 text-base font-semibold mt-0.5">PT Maju Bersama</p>
        <div className="flex items-center gap-2 justify-center my-2">
          <div className="h-px w-12 bg-indigo-500/30" />
          <span className="text-indigo-400 text-xs">2025</span>
          <div className="h-px w-12 bg-indigo-500/30" />
        </div>
        <p className="text-indigo-200/50 text-[11px]">&ldquo;Bersatu Menuju Masa Depan Gemilang&rdquo;</p>
      </div>
      <div className="bg-indigo-900/40 border border-indigo-700/30 rounded-xl px-4 py-3 w-full">
        <p className="text-amber-400 font-semibold text-sm">Jumat, 18 Juli 2025</p>
        <p className="text-indigo-300/50 text-xs mt-0.5">The Ritz-Carlton Jakarta · 18.00 WIB</p>
      </div>
      <div className="border border-indigo-400/40 text-indigo-300 text-[11px] px-5 py-1.5 rounded-full">
        Konfirmasi Kehadiran
      </div>
      <p className="text-indigo-400/25 text-[10px] tracking-widest">✦ invitia.id ✦</p>
    </div>
  )
}

const PREVIEWS: Record<InvType, React.ReactNode> = {
  nikah:       <NikahPreview />,
  wisuda:      <WisudaPreview />,
  ulang_tahun: <UlangTahunPreview />,
  aqiqah:      <AqiqahPreview />,
  khitan:      <KhitanPreview />,
  gathering:   <GatheringPreview />,
}

const GLOW: Record<InvType, string> = {
  nikah:       '#f59e0b',
  wisuda:      '#3b82f6',
  ulang_tahun: '#a855f7',
  aqiqah:      '#10b981',
  khitan:      '#06b6d4',
  gathering:   '#6366f1',
}

export default function LandingShowcase() {
  const [active, setActive] = useState<InvType>('nikah')

  return (
    <section className="py-20" style={{ background: '#0a0a0a' }}>
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          Semua Jenis Undangan
        </h2>
        <p className="text-center text-gray-500 text-sm mb-10">
          Pernikahan, wisuda, ulang tahun, aqiqah, khitan, dan lainnya — semuanya bisa.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                active === t.id
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800'
              }`}>
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Phone preview */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div
              className="absolute inset-0 -z-10 blur-3xl opacity-30 transition-all duration-500"
              style={{ background: `radial-gradient(circle at center, ${GLOW[active]} 0%, transparent 70%)` }}
            />
            {/* Phone frame */}
            <div className="w-64 h-[500px] rounded-[40px] border-4 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-white/5 bg-gray-950 relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-gray-800 rounded-b-xl z-10" />
              <div className="w-full h-full transition-all duration-300">
                {PREVIEWS[active]}
              </div>
            </div>
          </div>
          <p className="text-gray-700 text-xs mt-6">
            Preview ilustrasi — hasil undangan mengikuti pilihan desain dan konten kamu
          </p>
        </div>
      </div>
    </section>
  )
}
