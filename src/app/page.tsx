import Link from 'next/link'
import { auth } from '@/lib/auth'
import { CREDIT_PACKS, formatRupiah } from '@/lib/utils'
import LandingShowcase from '@/components/LandingShowcase'

export default async function LandingPage() {
  const session = await auth()
  const cta = session ? '/undangan/new' : '/register'

  const pricePerUnit = Math.round(CREDIT_PACKS.PRO.price / CREDIT_PACKS.PRO.credits)

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="invitia.id" className="h-32 w-auto" />
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-md tracking-wide">Beta</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#yang-kamu-dapat" className="hover:text-white transition">Fitur</a>
            <a href="#cara-kerja" className="hover:text-white transition">Cara Kerja</a>
            <a href="#pricing" className="hover:text-white transition">Harga</a>
          </nav>
          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/dashboard"
                className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-5 py-2 rounded-xl transition">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition font-medium">Masuk</Link>
                <Link href="/register"
                  className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-5 py-2 rounded-xl transition">
                  Coba Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO: Dream Outcome ── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0a0600 0%,#1a0900 40%,#0d0d0d 100%)' }}>
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,#f59e0b 0%,transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">

          {/* Dream outcome — vivid & specific */}
          <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Tamu kamu buka HP,<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#f59e0b,#fb923c)' }}>
              langsung terpukau.
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Undangan beranimasi lengkap — musik, countdown hari H, galeri foto, RSVP, amplop digital —
            semua dari <strong className="text-white">satu link</strong> yang kamu kirim lewat WA.
            Tidak perlu mikir hosting. Tidak perlu beli domain. Tidak perlu update desain.{' '}
            <span className="text-amber-400 font-semibold">Tinggal bikin dan kirim.</span>
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href={cta}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-10 py-4 rounded-2xl text-base transition-all shadow-xl shadow-amber-500/30 hover:scale-105">
              Buat Undangan Gratis — 1 Kredit Langsung →
            </Link>
          </div>

          {/* Risk reversal di hero */}
          <p className="text-xs text-gray-600">
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
      <section id="yang-kamu-dapat" className="py-24 bg-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-amber-500 text-xs font-bold uppercase tracking-widest mb-3">Semua sudah termasuk</p>
          <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-4">
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
                className="flex gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-amber-800/40 transition">
                <span className="text-2xl shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <p className="font-bold text-white text-sm mb-1">{f.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Value stack reveal */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 text-center">
            <p className="text-gray-400 text-sm mb-2">11 hal di atas — fitur + hosting + domain + maintenance — dalam satu undangan</p>
            <p className="text-5xl font-black text-white mb-1">
              {formatRupiah(pricePerUnit)}
              <span className="text-lg text-gray-500 font-normal">/undangan</span>
            </p>
            <p className="text-amber-400 text-sm font-semibold mb-6">Paket Pro · {CREDIT_PACKS.PRO.credits} undangan seharga {formatRupiah(CREDIT_PACKS.PRO.price)}</p>
            <Link href={cta}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3.5 rounded-2xl text-sm transition shadow-lg shadow-amber-500/20">
              Coba Gratis Sekarang →
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="cara-kerja" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-amber-600 text-xs font-bold uppercase tracking-widest mb-3">Semudah ini</p>
          <h2 className="text-3xl font-black text-center text-gray-900 mb-14">Tiga langkah — undangan jadi</h2>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 z-0" />
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
          <p className="text-center text-amber-600 text-xs font-bold uppercase tracking-widest mb-3">Harga</p>
          <h2 className="text-3xl font-black text-center text-gray-900 mb-2">Pilih paket yang sesuai</h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            1 kredit = 1 undangan penuh. Tidak ada biaya berlangganan. Tidak ada biaya tersembunyi.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(Object.entries(CREDIT_PACKS) as [string, typeof CREDIT_PACKS[keyof typeof CREDIT_PACKS]][]).map(([key, pack]) => (
              <div key={key}
                className={`bg-white rounded-3xl p-7 border flex flex-col transition hover:shadow-lg ${
                  key === 'PRO'
                    ? 'border-amber-400 ring-2 ring-amber-400 ring-offset-2 shadow-lg shadow-amber-100 scale-[1.02]'
                    : 'border-gray-200'
                }`}>
                {key === 'PRO' && (
                  <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start mb-4 uppercase tracking-wide">
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
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}>
                  {session ? 'Beli Sekarang' : 'Daftar & Beli'}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400">
            Tidak tahu mau mulai dari mana? <Link href={cta} className="text-amber-600 font-semibold hover:underline">Daftar gratis dulu</Link> — dapat 1 kredit langsung, tidak perlu kartu kredit.
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
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8">
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5">
            <div>
              <p className="font-bold text-gray-900 text-sm">Kamu WO atau event planner?</p>
              <p className="text-xs text-gray-500 mt-0.5">Ada halaman khusus untuk kamu yang mau jualan undangan ke klien.</p>
            </div>
            <Link href="/reseller"
              className="shrink-0 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-5 py-2.5 rounded-xl transition whitespace-nowrap">
              Lihat halaman reseller →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden py-28"
        style={{ background: 'linear-gradient(135deg,#0a0600 0%,#1a0900 50%,#0a0a0a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 rounded-full"
            style={{ background: 'radial-gradient(circle,#f59e0b,transparent 60%)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Tamu kamu layak dapat<br />
            <span className="text-amber-400">undangan yang berkesan.</span>
          </h2>
          <p className="text-gray-500 text-base mb-10 leading-relaxed">
            Daftar sekarang. Dapat 1 kredit gratis. Buat undangan pertamamu hari ini.
          </p>
          <Link href={cta}
            className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black font-black px-12 py-5 rounded-2xl text-lg transition-all shadow-2xl shadow-amber-500/30 hover:scale-105">
            Buat Undangan Gratis →
          </Link>
          <p className="text-gray-700 text-xs mt-6">
            ✓ Gratis · ✓ 1 kredit langsung · ✓ Tidak perlu kartu kredit
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-black border-t border-gray-900 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="invitia.id" className="h-32 w-auto" />
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-md">Beta</span>
          </div>
          <p>© {new Date().getFullYear()} invitia.id · Dibuat di Indonesia</p>
          <div className="flex items-center gap-4">
            <Link href="/login"    className="hover:text-gray-400 transition">Masuk</Link>
            <Link href="/register" className="hover:text-gray-400 transition">Daftar</Link>
            <a href="#pricing"     className="hover:text-gray-400 transition">Harga</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
