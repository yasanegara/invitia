import Link from 'next/link'
import { auth } from '@/lib/auth'
import { CREDIT_PACKS, formatRupiah } from '@/lib/utils'
import LandingShowcase from '@/components/LandingShowcase'

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-xl text-amber-600 tracking-tight">invitia.id</span>
          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/dashboard"
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Masuk</Link>
                <Link href="/register"
                  className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
                  Coba Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          ✨ Undangan digital siap kirim dalam hitungan detik
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-5">
          Undangan Digital<br />
          <span className="text-amber-500">Cantik &amp; Profesional</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Isi formulir, pilih desain, dan undangan siap dibagikan — tanpa coding, tanpa desainer,
          tanpa ribet.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href={session ? '/undangan/new' : '/register'}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-2xl text-base transition shadow-lg shadow-amber-200">
            Buat Undangan Sekarang →
          </Link>
          <Link href="#pricing" className="text-sm text-gray-500 hover:text-gray-700 font-medium">
            Lihat harga ↓
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">Daftar gratis · 1 kredit langsung · Tanpa kartu kredit</p>
      </section>

      {/* ── Stats bar ── */}
      <div className="bg-gray-950 py-6">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '9+',      label: 'Jenis Undangan' },
              { value: '30 dtk',  label: 'Waktu Generate' },
              { value: '100%',    label: 'Mobile-Friendly' },
              { value: '∞',       label: 'Link Aktif Selamanya' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-black text-amber-400">{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interactive Showcase ── */}
      <LandingShowcase />

      {/* ── How it works ── */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Cara Kerja</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: '1', label: 'Daftar',        desc: 'Buat akun gratis, langsung dapat 1 kredit untuk dicoba.' },
            { step: '2', label: 'Isi Formulir',  desc: 'Ceritakan acaramu — nama, tanggal, lokasi, dan pilih desain.' },
            { step: '3', label: 'Langsung Jadi', desc: 'Undangan HTML lengkap — animasi, countdown, RSVP — dalam detik.' },
            { step: '4', label: 'Share!',        desc: 'Bagikan link undangan ke seluruh tamu lewat WA, IG, atau email.' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-lg shadow-amber-200">
                {s.step}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{s.label}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Kenapa invitia.id?</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Semua yang kamu butuhkan untuk undangan digital, sudah ada di sini.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',
                title: 'Selesai dalam 30 Detik',
                desc: 'Undangan HTML lengkap dengan animasi, countdown, dan form RSVP — langsung jadi saat kamu submit.',
              },
              {
                icon: '🎨',
                title: 'Desain Bisa Dikustom',
                desc: 'Pilih gaya, warna, tipografi, dan dekorasi. Setiap undangan unik sesuai selera dan tema acaramu.',
              },
              {
                icon: '📊',
                title: 'Kelola RSVP Mudah',
                desc: 'Pantau siapa yang hadir langsung dari dashboard. Data tamu tersimpan rapi dan bisa diekspor.',
              },
              {
                icon: '🖼️',
                title: 'Upload Foto & Musik',
                desc: 'Tambahkan foto profil, galeri, background section, dan musik pengiring agar undangan makin personal.',
              },
              {
                icon: '💼',
                title: 'Cocok untuk Reseller',
                desc: 'Beli kredit grosir, buat undangan untuk klien, dan tentukan harga jual sendiri. Bisnis sambilan yang menjanjikan.',
              },
              {
                icon: '🌙',
                title: 'Responsif & Dark Mode',
                desc: 'Setiap undangan tampil sempurna di HP maupun desktop, mode terang maupun gelap.',
              },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fitur Unggulan ── */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Fitur Lengkap dalam Satu Undangan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🎵', label: 'Musik Background'      },
            { icon: '🖼️', label: 'Galeri Foto'           },
            { icon: '📖', label: 'Story / Kisah'         },
            { icon: '💳', label: 'Dompet Digital'        },
            { icon: '📅', label: '2 Acara dalam 1 Link'  },
            { icon: '🌄', label: 'Background Custom'     },
            { icon: '✅', label: 'Form RSVP'             },
            { icon: '⏱️', label: 'Countdown Timer'       },
          ].map(f => (
            <div key={f.label}
              className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-amber-200 hover:bg-amber-50/50 transition">
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm font-medium text-gray-700">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Harga Kredit</h2>
          <p className="text-center text-gray-500 text-sm mb-10">1 kredit = 1 undangan. Beli sekali, pakai selamanya.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(CREDIT_PACKS) as [string, typeof CREDIT_PACKS[keyof typeof CREDIT_PACKS]][]).map(([key, pack]) => (
              <div key={key}
                className={`bg-white rounded-2xl p-7 border shadow-sm flex flex-col ${
                  key === 'PRO' ? 'border-amber-400 ring-2 ring-amber-400 ring-offset-2' : 'border-gray-100'
                }`}>
                {key === 'PRO' && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start mb-4">
                    Paling Populer
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-1">{pack.label}</h3>
                <p className="text-3xl font-bold text-amber-500 mb-1">{formatRupiah(pack.price)}</p>
                <p className="text-sm text-gray-500 mb-6">
                  {pack.credits === -1 ? 'Unlimited kredit / bulan' : `${pack.credits} kredit`}
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-8 flex-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {pack.credits === -1 ? 'Buat undangan tak terbatas' : `${pack.credits} undangan digital`}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Sistem RSVP &amp; statistik
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {key === 'AGENCY' ? 'Cocok untuk reseller &amp; wedding organizer' : 'Link undangan aktif selamanya'}
                  </li>
                </ul>
                <Link href={session ? '/settings' : '/register'}
                  className={`text-center font-semibold py-3 rounded-xl text-sm transition ${
                    key === 'PRO'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}>
                  {session ? 'Beli Sekarang' : 'Daftar &amp; Beli'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 text-center max-w-2xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Siap buat undangan pertamamu?</h2>
        <p className="text-gray-500 mb-8">Gratis untuk dicoba. Tidak perlu kartu kredit.</p>
        <Link href={session ? '/undangan/new' : '/register'}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-10 py-4 rounded-2xl text-base transition shadow-lg shadow-amber-200 inline-block">
          Mulai Gratis →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} invitia.id · Dibuat dengan ❤️ di Indonesia</p>
      </footer>

    </div>
  )
}
