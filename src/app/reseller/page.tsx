import Link from 'next/link'
import { auth } from '@/lib/auth'
import { CREDIT_PACKS, formatRupiah } from '@/lib/utils'

export default async function ResellerPage() {
  const session = await auth()
  const cta = session ? '/settings' : '/register'

  const pricePerUnit = Math.round(CREDIT_PACKS.PRO.price / CREDIT_PACKS.PRO.credits)

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="invitia.id" className="h-24 w-auto" />
            <span className="text-[10px] font-bold text-rose-300 bg-rose-300/10 border border-rose-300/30 px-1.5 py-0.5 rounded-md tracking-wide">Beta</span>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition">← Kembali</Link>
          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/settings" className="bg-rose-400 hover:bg-rose-300 text-black text-sm font-bold px-5 py-2 rounded-xl transition">
                Beli Kredit →
              </Link>
            ) : (
              <Link href="/register" className="bg-rose-400 hover:bg-rose-300 text-black text-sm font-bold px-5 py-2 rounded-xl transition">
                Mulai Gratis
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO: Dream Outcome untuk reseller ── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0a0600 0%,#1a0900 40%,#0d0d0d 100%)' }}>
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,#c9848e 0%,transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-400/10 border border-rose-400/30 text-rose-300 text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-wide">
            Untuk WO, Event Planner & Reseller
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Tinggal bikin.<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#c9848e,#c9848e)' }}>
              Jualan. Cuan.
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tidak perlu modal besar. Tidak perlu beli hosting. Tidak perlu beli domain.
            Tidak perlu belajar desain atau coding.
            Cukup beli kredit, buatkan undangan untuk klienmu, tentukan harga jualmu sendiri.
          </p>

          <Link href={cta}
            className="inline-flex items-center gap-2 bg-rose-400 hover:bg-rose-300 text-black font-black px-10 py-4 rounded-2xl text-base transition-all shadow-xl shadow-rose-400/30 hover:scale-105">
            Mulai Sekarang — Gratis →
          </Link>
          <p className="text-xs text-gray-600 mt-4">
            ✓ 1 kredit gratis saat daftar &nbsp;·&nbsp; ✓ Tidak perlu kartu kredit
          </p>
        </div>
      </section>

      {/* ── VALUE EQUATION: Effort ↓ ── */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-rose-400 text-xs font-bold uppercase tracking-widest mb-3">Yang tidak perlu kamu urus</p>
          <h2 className="text-3xl font-black text-center text-white mb-4">
            Semua sudah beres.
          </h2>
          <p className="text-center text-gray-500 text-sm mb-14 max-w-xl mx-auto">
            Biasanya untuk jualan produk digital kamu perlu setup banyak hal.
            Di sini — tidak perlu satu pun.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {[
              { icon: '🌐', title: 'Hosting',        desc: 'Sudah termasuk. Server, uptime, performa — semua kami yang urus.' },
              { icon: '🔒', title: 'Domain',          desc: 'Undangan berjalan di invitia.id. Tidak perlu beli domain sendiri.' },
              { icon: '🎨', title: 'Desain',          desc: 'AI yang bikin undangannya. Kamu cukup isi data klien.' },
              { icon: '💻', title: 'Coding',          desc: 'Tidak ada yang perlu dikoding. Semua sudah jalan dari browser.' },
              { icon: '🔧', title: 'Maintenance',     desc: 'Update, keamanan, bug fix — bukan urusanmu.' },
              { icon: '📦', title: 'Stok / Inventory', desc: 'Produk digital. Tidak ada yang perlu disimpan atau dikirim.' },
            ].map(f => (
              <div key={f.title} className="flex gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <span className="text-2xl shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <p className="font-bold text-white text-sm mb-1">{f.title} <span className="text-green-400 text-xs font-normal">— tidak perlu</span></p>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE STACK: Yang klien dapat ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-rose-500 text-xs font-bold uppercase tracking-widest mb-3">Yang kamu jualkan ke klien</p>
          <h2 className="text-3xl font-black text-center text-gray-900 mb-4">
            Produk yang klienmu tidak bisa bikin sendiri.
          </h2>
          <p className="text-center text-gray-500 text-sm mb-14 max-w-xl mx-auto">
            Setiap undangan yang kamu buatkan sudah include semua fitur ini.
            Klienmu dapat produk yang lengkap — kamu yang menentukan harganya.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {[
              { icon: '✅', title: 'Form RSVP Digital',     desc: 'Tamu konfirmasi hadir langsung dari HP. Data masuk ke dashboard.' },
              { icon: '⏱️', title: 'Countdown Hari H',      desc: 'Hitung mundur ke hari acara. Tampil otomatis di undangan.' },
              { icon: '🖼️', title: 'Galeri Foto',           desc: 'Upload foto prewedding atau keluarga. Tampil cantik di undangan.' },
              { icon: '🎵', title: 'Musik Background',       desc: 'Auto-play saat undangan dibuka. Berasa hidup, bukan teks biasa.' },
              { icon: '💳', title: 'Amplop Digital',         desc: 'Rekening dan e-wallet klien tampil langsung. Praktis untuk tamu.' },
              { icon: '📊', title: 'Dashboard Kelola Tamu',  desc: 'Klienmu bisa pantau RSVP dan check-in tamu sendiri.' },
              { icon: '📱', title: 'QR Check-in di Venue',   desc: 'Tamu scan QR saat datang — langsung tercatat. Keliatan profesional.' },
              { icon: '🔗', title: 'Link Aktif Selamanya',   desc: 'Link tidak mati setelah acara selesai.' },
            ].map(f => (
              <div key={f.title} className="flex gap-4 border border-gray-100 rounded-2xl p-5 hover:border-rose-100 transition">
                <span className="text-2xl shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{f.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING / MODAL ── */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-center text-rose-400 text-xs font-bold uppercase tracking-widest mb-3">Modal kamu</p>
          <h2 className="text-3xl font-black text-center text-white mb-4">
            Harga yang kamu bayar ke kami.
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12 max-w-xl mx-auto">
            Harga jual ke klienmu — terserah kamu. Ini yang kamu bayar ke invitia.id per undangan.
          </p>

          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {(Object.entries(CREDIT_PACKS) as [string, typeof CREDIT_PACKS[keyof typeof CREDIT_PACKS]][]).map(([key, pack]) => (
              <div key={key}
                className={`rounded-3xl p-6 border flex flex-col ${
                  key === 'PRO'
                    ? 'border-rose-400 bg-rose-400/10 ring-1 ring-rose-400'
                    : 'border-gray-800 bg-gray-900'
                }`}>
                {key === 'PRO' && (
                  <span className="text-xs font-black text-rose-300 mb-3 uppercase tracking-wide">Paling hemat per undangan</span>
                )}
                <h3 className="font-black text-white mb-1">{pack.label}</h3>
                <p className="text-3xl font-black text-white mb-1">{formatRupiah(pack.price)}</p>
                <p className="text-sm text-gray-500 mb-3">
                  {pack.credits === -1 ? 'Unlimited undangan' : `${pack.credits} undangan`}
                </p>
                {key !== 'AGENCY' && pack.credits > 0 && (
                  <p className="text-sm font-bold text-rose-300 mb-5">
                    = {formatRupiah(Math.round(pack.price / pack.credits))}/undangan
                  </p>
                )}
                {key === 'AGENCY' && (
                  <p className="text-sm font-bold text-rose-300 mb-5">Unlimited — cocok untuk volume tinggi</p>
                )}
                <Link href={session ? '/settings' : '/register'}
                  className={`text-center font-bold py-3 rounded-2xl text-sm transition mt-auto ${
                    key === 'PRO'
                      ? 'bg-rose-400 hover:bg-rose-300 text-black'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}>
                  Pilih Paket
                </Link>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <p className="text-gray-400 text-sm">
              Harga jual ke klienmu <strong className="text-white">kamu yang tentukan sendiri</strong>.
              invitia.id tidak ikut campur soal itu.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-rose-500 text-xs font-bold uppercase tracking-widest mb-3">Cara kerjanya</p>
          <h2 className="text-3xl font-black text-center text-gray-900 mb-14">Empat langkah dari daftar sampai cuan</h2>

          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-rose-100 via-rose-300 to-rose-100 z-0" />
            {[
              { step: '1', label: 'Daftar',          desc: 'Buat akun gratis. Dapat 1 kredit untuk coba sendiri dulu.' },
              { step: '2', label: 'Beli Kredit',      desc: 'Pilih paket sesuai volume klienmu. Bayar sekali, pakai kapan saja.' },
              { step: '3', label: 'Bikin Undangan',   desc: 'Isi data klien, generate — undangan jadi dengan semua fiturnya.' },
              { step: '4', label: 'Kirim & Tagih',    desc: 'Kirim link ke klien. Tentukan harga jualmu. Terima bayaran.' },
            ].map((s, i) => (
              <div key={s.step} className="text-center relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-lg"
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

      {/* ── RISK REVERSAL ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center">
            <span className="text-3xl block mb-4">🛡️</span>
            <h3 className="text-xl font-black text-gray-900 mb-3">Coba dulu sebelum beli kredit lebih banyak.</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-2 max-w-md mx-auto">
              Setiap akun baru dapat <strong>1 kredit gratis</strong>.
              Buatkan satu undangan — lihat sendiri hasilnya.
              Baru putuskan mau beli berapa kredit.
            </p>
            <p className="text-xs text-gray-500">Tidak perlu kartu kredit untuk daftar.</p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden py-28"
        style={{ background: 'linear-gradient(135deg,#0a0600 0%,#1a0900 50%,#0a0a0a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 rounded-full"
            style={{ background: 'radial-gradient(circle,#c9848e,transparent 60%)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Klien pertamamu<br />
            <span className="text-rose-300">sudah menunggu.</span>
          </h2>
          <p className="text-gray-500 text-base mb-10 leading-relaxed">
            Daftar gratis, coba sendiri dengan 1 kredit, lalu mulai tawarkan ke klienmu.
          </p>
          <Link href={cta}
            className="inline-flex items-center gap-3 bg-rose-400 hover:bg-rose-300 text-black font-black px-12 py-5 rounded-2xl text-lg transition-all shadow-2xl shadow-rose-400/30 hover:scale-105">
            Mulai Sekarang — Gratis →
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
            <img src="/logo.png" alt="invitia.id" className="h-24 w-auto" />
            <span className="text-[10px] font-bold text-rose-300 bg-rose-300/10 border border-rose-300/30 px-1.5 py-0.5 rounded-md">Beta</span>
          </div>
          <p>© {new Date().getFullYear()} invitia.id · Dibuat di Indonesia</p>
          <div className="flex items-center gap-4">
            <Link href="/"         className="hover:text-gray-400 transition">Home</Link>
            <Link href="/login"    className="hover:text-gray-400 transition">Masuk</Link>
            <Link href="/register" className="hover:text-gray-400 transition">Daftar</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
