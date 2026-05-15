import Link from 'next/link'
import { auth } from '@/lib/auth'
import { CREDIT_PACKS, formatRupiah } from '@/lib/utils'
import LandingShowcase from '@/components/LandingShowcase'
import ThemeToggle from '@/components/ThemeToggle'

export default async function LandingPage() {
  const session = await auth()
  const cta = session ? '/undangan/new' : '/register'

  const pricePerUnit = Math.round(CREDIT_PACKS.PRO.price / CREDIT_PACKS.PRO.credits)

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-black.png" alt="invitia.id" className="logo-themed h-24 w-auto" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wide"
              style={{ color: 'var(--color-primary-dark)', background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-border)' }}>Beta</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#yang-kamu-dapat" className="hover:text-gray-900 transition">Fitur</a>
            <a href="#cara-kerja" className="hover:text-gray-900 transition">Cara Kerja</a>
            <a href="#pricing" className="hover:text-gray-900 transition">Harga</a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <Link href="/dashboard"
                className="text-black text-sm font-bold px-5 py-2 rounded-xl transition"
                style={{ background: 'var(--color-primary)' }}>
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">Masuk</Link>
                <Link href="/register"
                  className="text-black text-sm font-bold px-5 py-2 rounded-xl transition"
                  style={{ background: 'var(--color-primary)' }}>
                  Coba Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO: Dream Outcome ── */}
      <section className="relative overflow-hidden bg-gray-50">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,var(--color-primary) 0%,transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight mb-6">
            Tamu kamu buka HP,<br />
            <span className="text-primary">
              langsung terpukau.
            </span>
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Undangan beranimasi lengkap — musik, countdown hari H, galeri foto, RSVP, amplop digital —
            semua dari <strong className="text-gray-900">satu link</strong> yang kamu kirim lewat WA.
            Tidak perlu mikir hosting. Tidak perlu beli domain. Tidak perlu update desain.{' '}
            <span className="text-primary font-semibold">Tinggal bikin dan kirim.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href={cta}
              className="btn-primary text-black font-black px-10 py-4 rounded-2xl text-base transition-all shadow-xl shadow-primary hover:scale-105">
              Buat Undangan Gratis — 1 Kredit Langsung →
            </Link>
          </div>

          <p className="text-xs text-gray-400">
            ✓ Tidak perlu kartu kredit &nbsp;·&nbsp; ✓ 1 kredit gratis saat daftar &nbsp;·&nbsp; ✓ Link aktif selamanya
          </p>
        </div>
      </section>

      {/* ── SHOWCASE ── */}
      <div id="showcase">
        <LandingShowcase />
      </div>

      {/* ── VALUE STACK: "Yang Kamu Dapat" ── */}
      {/* Hormozi: tumpuk semua value dulu, baru reveal harga */}
      <section id="yang-kamu-dapat" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-primary text-xs font-bold uppercase tracking-widest mb-3">Semua sudah termasuk</p>
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-4">
            Satu link. Delapan fitur.
          </h2>
          <p className="text-center text-gray-500 text-sm mb-14 max-w-xl mx-auto">
            Satu harga. Semua sudah termasuk — fitur, hosting, domain, dan maintenance.
            Tidak ada biaya tersembunyi. Tidak ada yang perlu diurus lagi.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-14">
            {[
              {
                icon: '✅',
                title: 'Form RSVP Digital',
                value: 'Tamu konfirmasi hadir langsung dari HP. Kamu dapat datanya real-time di dashboard.',
              },
              {
                icon: '⏱️',
                title: 'Countdown Hari H',
                value: 'Setiap tamu yang buka undangan langsung tahu berapa hari lagi — membangun antisipasi.',
              },
              {
                icon: '🖼️',
                title: 'Galeri Foto',
                value: 'Upload foto kenangan atau foto prewedding. Tampil cantik di undangan.',
              },
              {
                icon: '🎵',
                title: 'Musik Background',
                value: 'Auto-play saat undangan dibuka. Undangan terasa hidup, bukan teks datar.',
              },
              {
                icon: '💳',
                title: 'Amplop Digital',
                value: 'Nomor rekening dan e-wallet langsung tampil. Tamu tidak perlu tanya lewat chat.',
              },
              {
                icon: '📊',
                title: 'Dashboard Kelola Tamu',
                value: 'Lihat siapa yang sudah RSVP, berapa tamu yang hadir, dan lacak check-in di venue.',
              },
              {
                icon: '📱',
                title: 'QR Check-in di Venue',
                value: 'Setiap tamu punya QR unik. Scan saat datang — langsung tercatat, tanpa antrian panjang.',
              },
              {
                icon: '🔗',
                title: 'Link Aktif Selamanya',
                value: 'Link tidak mati setelah acara. Kenangan tetap bisa dibuka kapan saja.',
              },
              {
                icon: '🌐',
                title: 'Hosting Sudah Termasuk',
                value: 'Tidak perlu beli server, setup VPS, atau bayar hosting bulanan. Semua sudah jalan.',
              },
              {
                icon: '🔒',
                title: 'Domain Sudah Termasuk',
                value: 'Undanganmu berjalan di invitia.id. Tidak perlu beli domain sendiri.',
              },
              {
                icon: '🛠️',
                title: 'Tidak Ada yang Perlu Diurus',
                value: 'Update desain, keamanan, performa — semua kami yang handle. Kamu tinggal pakai.',
              },
            ].map(f => (
              <div key={f.title}
                className="flex gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-primary transition">
                <span className="text-2xl shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{f.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Value stack reveal */}
          <div className="bg-primary-50 border border-primary rounded-3xl p-8 text-center">
            <p className="text-gray-500 text-sm mb-2">11 hal di atas — fitur + hosting + domain + maintenance — dalam satu undangan</p>
            <p className="text-5xl font-black text-gray-900 mb-1">
              {formatRupiah(pricePerUnit)}
              <span className="text-lg text-gray-500 font-normal">/undangan</span>
            </p>
            <p className="text-primary text-sm font-semibold mb-6">Paket Pro · {CREDIT_PACKS.PRO.credits} undangan seharga {formatRupiah(CREDIT_PACKS.PRO.price)}</p>
            <Link href={cta}
              className="inline-flex items-center gap-2 btn-primary text-black font-black px-8 py-3.5 rounded-2xl text-sm transition shadow-lg shadow-primary">
              Coba Gratis Sekarang →
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="cara-kerja" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-primary-dark text-xs font-bold uppercase tracking-widest mb-3">Semudah ini</p>
          <h2 className="text-3xl font-black text-center text-gray-900 mb-14">Tiga langkah — undangan jadi</h2>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-rose-100 via-rose-300 to-rose-100 z-0" />
            {[
              {
                step: '1',
                label: 'Daftar & Isi Data Acara',
                desc: 'Nama, tanggal, lokasi, foto — semua diisi lewat form biasa. Tidak perlu skill apapun.',
              },
              {
                step: '2',
                label: 'Generate Otomatis',
                desc: 'AI kami bikin undangan lengkap dengan semua fitur. Langsung ada preview-nya.',
              },
              {
                step: '3',
                label: 'Kirim ke Semua Tamu',
                desc: 'Salin link, blast lewat WA atau Instagram. Tamu langsung bisa buka dan RSVP.',
              },
            ].map((s, i) => (
              <div key={s.step} className="text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-lg"
                  style={{ background: `hsl(${38 - i * 5},90%,${52 + i * 2}%)`, color: '#000' }}>
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{s.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-primary-dark text-xs font-bold uppercase tracking-widest mb-3">Harga</p>
          <h2 className="text-3xl font-black text-center text-gray-900 mb-2">Pilih paket yang sesuai</h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            1 kredit = 1 undangan penuh. Tidak ada biaya berlangganan. Tidak ada biaya tersembunyi.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(Object.entries(CREDIT_PACKS) as [string, typeof CREDIT_PACKS[keyof typeof CREDIT_PACKS]][]).map(([key, pack]) => (
              <div key={key}
                className={`bg-white rounded-3xl p-7 border flex flex-col transition hover:shadow-lg ${
                  key === 'PRO'
                    ? 'border-primary ring-2 ring-primary ring-offset-2 shadow-lg shadow-primary scale-[1.02]'
                    : 'border-gray-200'
                }`}>
                {key === 'PRO' && (
                  <span className="text-xs font-black text-primary-dark bg-primary-50 border border-primary px-3 py-1 rounded-full self-start mb-4 uppercase tracking-wide">
                    Paling Efisien
                  </span>
                )}
                <h3 className="text-lg font-black text-gray-900 mb-1">{pack.label}</h3>
                <div className="mb-1">
                  <span className="text-4xl font-black text-gray-900">{formatRupiah(pack.price)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {pack.credits === -1 ? 'Unlimited kredit' : `${pack.credits} kredit`}
                </p>
                {key !== 'AGENCY' && pack.credits > 0 && (
                  <p className="text-xs text-green-600 font-semibold mb-6 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                    = Rp {Math.round(pack.price / pack.credits).toLocaleString('id-ID')} per undangan
                  </p>
                )}
                {key === 'AGENCY' && (
                  <p className="text-xs text-green-600 font-semibold mb-6 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                    Cocok untuk WO & event planner
                  </p>
                )}
                <ul className="space-y-2 text-sm text-gray-600 mb-8 flex-1">
                  {[
                    pack.credits === -1 ? 'Buat undangan tak terbatas' : `${pack.credits} undangan digital`,
                    'Semua 8 fitur sudah termasuk',
                    'Dashboard kelola tamu & RSVP',
                    'QR check-in di venue',
                    'Link aktif selamanya',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href={session ? '/settings' : '/register'}
                  className={`text-center font-black py-3.5 rounded-2xl text-sm transition ${
                    key === 'PRO'
                      ? 'btn-primary text-black shadow-lg shadow-primary'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}>
                  {session ? 'Beli Sekarang' : 'Daftar & Beli'}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400">
            Tidak tahu mau mulai dari mana? <Link href={cta} className="text-primary-dark font-semibold hover:underline">Daftar gratis dulu</Link> — dapat 1 kredit langsung, tidak perlu kartu kredit.
          </p>
        </div>
      </section>

      {/* ── RISK REVERSAL + URGENCY ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Risk Reversal */}
            <div className="bg-green-50 border border-green-200 rounded-3xl p-8">
              <span className="text-2xl block mb-4">🛡️</span>
              <h3 className="text-xl font-black text-gray-900 mb-3">Coba dulu. Gratis.</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Setiap akun baru dapat <strong>1 kredit gratis</strong> untuk bikin undangan pertama.
                Lihat sendiri hasilnya sebelum memutuskan beli kredit lebih banyak.
              </p>
              <p className="text-xs text-gray-500">Tidak perlu kartu kredit. Tidak ada pertanyaan jebakan.</p>
            </div>

            {/* Urgency */}
            <div className="bg-primary-50 border border-primary rounded-3xl p-8">
              <span className="text-2xl block mb-4">⚡</span>
              <h3 className="text-xl font-black text-gray-900 mb-3">Harga Beta</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Produk ini masih dalam fase Beta. Harga sekarang adalah harga paling murah yang
                pernah ada — dan akan naik seiring produk makin matang.
              </p>
              <p className="text-xs text-gray-500">Pengguna awal dapat harga terbaik. Tidak ada garansi kapan harga naik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WO / RESELLER teaser ── */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary-50 border border-primary rounded-2xl px-6 py-5">
            <div>
              <p className="font-bold text-gray-900 text-sm">Kamu WO atau event planner?</p>
              <p className="text-xs text-gray-500 mt-0.5">Ada halaman khusus untuk kamu yang mau jualan undangan ke klien.</p>
            </div>
            <Link href="/reseller"
              className="shrink-0 btn-primary text-black font-bold text-sm px-5 py-2.5 rounded-xl transition whitespace-nowrap">
              Lihat halaman reseller →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden py-28 bg-primary-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 rounded-full"
            style={{ background: 'radial-gradient(circle,var(--color-primary),transparent 60%)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Tamu kamu layak dapat<br />
            <span className="text-primary">undangan yang berkesan.</span>
          </h2>
          <p className="text-gray-500 text-base mb-10 leading-relaxed">
            Daftar sekarang. Dapat 1 kredit gratis. Buat undangan pertamamu hari ini.
          </p>
          <Link href={cta}
            className="inline-flex items-center gap-3 btn-primary text-black font-black px-12 py-5 rounded-2xl text-lg transition-all shadow-2xl shadow-primary hover:scale-105">
            Buat Undangan Gratis →
          </Link>
          <p className="text-gray-400 text-xs mt-6">
            ✓ Gratis · ✓ 1 kredit langsung · ✓ Tidak perlu kartu kredit
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-100 border-t border-gray-200 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <img src="/logo-black.png" alt="invitia.id" className="logo-themed h-24 w-auto" />
            <span className="text-[10px] font-bold text-primary-dark bg-primary-50 border border-primary px-1.5 py-0.5 rounded-md">Beta</span>
          </div>
          <p>© {new Date().getFullYear()} invitia.id · Dibuat di Indonesia</p>
          <div className="flex items-center gap-4">
            <Link href="/login"    className="hover:text-gray-700 transition">Masuk</Link>
            <Link href="/register" className="hover:text-gray-700 transition">Daftar</Link>
            <a href="#pricing"     className="hover:text-gray-700 transition">Harga</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
