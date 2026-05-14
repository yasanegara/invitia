import type { InvitationParams, InvitationJenis } from '@/types'

export interface MediaAssets {
  fotoCover?:         string
  fotoMempelaiPria?:  string
  fotoMempelaiWanita?: string
  fotoPerson?:        string
  bgCover?:           string
  fotoGaleri?:        string[]
  hasAudio?:          boolean
}

// ── Section structure guide per invitation type ──────────────────────────────

const SECTION_GUIDE: Record<InvitationJenis, string> = {
  nikah: `
STRUKTUR SECTION WAJIB — NIKAH/PERNIKAHAN:
1. #cover    : Fullscreen overlay, nama kedua mempelai, ornamen mewah, tombol "Buka Undangan". Body overflow:hidden sampai klik.
2. HERO      : Bismillah, nama kedua mempelai (kaligrafi/ornamen kuat), quote ayat pernikahan.
3. PROFIL    : Foto + nama lengkap + nama orang tua masing-masing mempelai, berdampingan.
4. AKAD      : Hari/tanggal/waktu/lokasi akad nikah, ikon masjid SVG.
5. RESEPSI   : Hari/tanggal/waktu/lokasi resepsi, ikon gedung SVG.
6. GALERI    : Grid foto kenangan (placeholder jika tidak ada foto yang disediakan).
7. LOKASI    : Alamat lengkap resepsi, tombol Google Maps.
8. RSVP      : Form (Nama, Jumlah Tamu, Hadir/Tidak, Ucapan).
9. FOOTER    : Quote pernikahan islami, nama kedua mempelai.`,

  khitan: `
STRUKTUR SECTION WAJIB — KHITAN/SUNATAN:
1. #cover    : Fullscreen overlay, nama anak, tema Islami/bulan bintang SVG, tombol "Buka Undangan".
2. HERO      : Bismillah, "Walimatul Khitan", nama anak, quote sunnah.
3. PROFIL    : Foto anak (placeholder), nama lengkap, usia, nama orang tua.
4. DETAIL    : Hari/tanggal/waktu/lokasi acara.
5. LOKASI    : Alamat, tombol Google Maps.
6. RSVP      : Form konfirmasi kehadiran.
7. FOOTER    : Doa & kutipan islami.`,

  walimah_safar: `
STRUKTUR SECTION WAJIB — WALIMAH SAFAR:
1. #cover    : Fullscreen, ilustrasi Ka'bah SVG, nama yang berangkat, tombol "Buka Undangan".
2. HERO      : Bismillah, "Melepas ke Tanah Suci", nama, tujuan (Umroh/Haji).
3. DETAIL    : Tanggal keberangkatan, maskapai/kloter jika ada, durasi perjalanan.
4. PELEPASAN : Lokasi & waktu acara pelepasan.
5. DOA       : Section doa perjalanan (teks arabic + latin), ucapan dari keluarga.
6. LOKASI    : Tombol Google Maps ke lokasi pelepasan.
7. RSVP      : Konfirmasi kehadiran pelepasan.
8. FOOTER    : Doa safar & kutipan.`,

  pengajian: `
STRUKTUR SECTION WAJIB — PENGAJIAN/MAJELIS ILMU:
1. #cover    : Fullscreen, ornamen kaligrafi SVG, judul pengajian, tombol "Buka Undangan".
2. HERO      : Bismillah, judul/tema kajian, nama penceramah, quote ayat/hadits.
3. PENCERAMAH: Foto (placeholder), nama lengkap, biografi singkat.
4. DETAIL    : Hari/tanggal/waktu/lokasi, topik kajian.
5. LOKASI    : Alamat, tombol Google Maps.
6. RSVP      : Konfirmasi kehadiran.
7. FOOTER    : Ajakan menghadiri, doa.`,

  wisuda: `
STRUKTUR SECTION WAJIB — WISUDA:
1. #cover    : Fullscreen, nama wisudawan, "Alhamdulillah – Wisuda [tahun]", tombol "Buka Undangan".
2. HERO      : Foto wisudawan (placeholder), nama lengkap, gelar baru, jurusan, universitas.
3. UCAPAN    : Kutipan inspiratif tentang pendidikan, ucapan dari orang tua.
4. UPACARA   : Hari/tanggal/waktu/lokasi upacara wisuda.
5. SYUKURAN  : Hari/tanggal/waktu/lokasi acara syukuran (jika ada).
6. GALERI    : Grid foto momen studi (placeholder jika tidak ada).
7. LOKASI    : Tombol Google Maps ke lokasi syukuran.
8. RSVP      : Konfirmasi kehadiran.
9. FOOTER    : Quote motivasi & ucapan terima kasih.`,

  gathering: `
STRUKTUR SECTION WAJIB — GATHERING/REUNI:
1. #cover    : Fullscreen, nama event/komunitas, tema, confetti/dekorasi, tombol "Buka Undangan".
2. HERO      : Nama event, tagline/slogan, nama komunitas/angkatan.
3. DETAIL    : Hari/tanggal/waktu/lokasi, dress code, tema.
4. AGENDA    : Rundown acara singkat (timeline).
5. LOKASI    : Alamat, tombol Google Maps.
6. RSVP      : Konfirmasi kehadiran + pilihan menu opsional.
7. FOOTER    : Info kontak panitia, kutipan kebersamaan.`,

  ulang_tahun: `
STRUKTUR SECTION WAJIB — ULANG TAHUN:
1. #cover    : Fullscreen, konfetti SVG / balon, "Happy Birthday!", nama, tombol "Buka Undangan".
2. HERO      : Foto (placeholder), nama, usia, quote ulang tahun yang hangat.
3. DETAIL    : Hari/tanggal/waktu/lokasi pesta, dress code.
4. WISHES    : Section guestbook / ucapan tamu (tampilan statis yang menarik).
5. LOKASI    : Tombol Google Maps.
6. RSVP      : Konfirmasi kehadiran.
7. FOOTER    : "Thank you for coming", kutipan.`,

  aqiqah: `
STRUKTUR SECTION WAJIB — AQIQAH/SYUKURAN KELAHIRAN:
1. #cover    : Fullscreen, "Alhamdulillah atas karunia-Nya", nama bayi, bintang SVG, tombol "Buka Undangan".
2. HERO      : Bismillah, nama bayi, jenis kelamin, tanggal lahir, nama orang tua.
3. PROFIL    : Foto bayi (placeholder), info kelahiran (berat, panjang, tanggal).
4. DETAIL    : Hari/tanggal/waktu/lokasi acara aqiqah.
5. LOKASI    : Alamat, tombol Google Maps.
6. RSVP      : Konfirmasi kehadiran.
7. FOOTER    : Doa untuk bayi & keluarga, kutipan islami.`,

  umum: `
STRUKTUR SECTION WAJIB — ACARA UMUM:
1. #cover    : Fullscreen overlay, nama acara, tombol "Buka Undangan". Body overflow:hidden sampai klik.
2. HERO      : Nama acara, penyelenggara, tagline.
3. DETAIL    : Hari/tanggal/waktu/lokasi.
4. LOKASI    : Alamat lengkap, tombol Google Maps.
5. RSVP      : Form konfirmasi kehadiran.
6. FOOTER    : Info kontak, kutipan penutup.`,
}

// ── System prompt (technical rules only — structure injected per-type in user prompt) ──

export const SYSTEM_PROMPT = `
Kamu adalah Expert Frontend Developer dan Spesialis UI/UX Undangan Digital Indonesia.
Tugasmu adalah mengenerate Undangan Digital Berbasis Web interaktif berdasarkan parameter dari pengguna.

ATURAN WAJIB MUTLAK (STRICT RULES):
1. FORMAT OUTPUT: Hasilkan HANYA 1 (satu) file HTML tunggal yang lengkap dan valid.
   Semua styling (CSS) dan interaksi (JavaScript) HARUS di dalam file ini.
   Output HANYA berisi kode HTML mentah, dimulai dari <!DOCTYPE html> tanpa penjelasan apapun.
2. STYLING ENGINE: Gunakan Tailwind CSS via CDN. Gunakan tailwind.config untuk warna dan font khusus.
3. ASSETS: Gunakan FontAwesome CDN untuk ikon. Gunakan Google Fonts.
   - DEKORASI: gunakan CSS Art, Gradients, Glassmorphism, atau Inline SVG murni (bukan bitmap).
   - SLOT FOTO (mempelai, avatar, galeri): WAJIB gunakan tag <img> dengan src placeholder
     https://placehold.co/400x400/d4af37/ffffff?text=Foto (sesuaikan ukuran W dan H).
     Setiap <img> slot foto HARUS punya atribut data-photo dengan nilai deskriptif:
     data-photo="cover" untuk foto utama/cover (profil/mempelai di hero),
     data-photo="bride" untuk foto pengantin perempuan,
     data-photo="groom" untuk foto pengantin laki-laki,
     data-photo="person" untuk foto orang utama selain pengantin (wisudawan/ti, bayi, penceramah, ulang tahun, dll),
     data-photo="bg-cover" untuk foto background fullscreen section cover (letakkan sebagai <img class="absolute inset-0 w-full h-full object-cover -z-10"> di dalam section cover sebagai latar, bukan foto profil),
     data-photo="gallery-1", "gallery-2", dst untuk foto galeri.
     Contoh: <img src="https://placehold.co/400x400/d4af37/fff?text=Foto+Utama" data-photo="cover" class="w-full h-full object-cover" />
4. LAYOUT UTAMA (MOBILE-FIRST): Bungkus seluruh konten di dalam <main class="w-full max-w-md mx-auto min-h-screen relative overflow-x-hidden shadow-2xl">.
5. DATA-SECTION: Setiap elemen wrapper section HARUS memiliki atribut data-section dengan nama deskriptif sesuai STRUKTUR SECTION yang diberikan. Contoh: data-section="cover", data-section="hero", data-section="profil", data-section="akad", data-section="resepsi", data-section="lokasi", data-section="galeri", data-section="rsvp", data-section="footer".

KAMUS DESAIN:
- Gaya "Glassmorphism": background:rgba(255,255,255,0.1); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.2)
- Gaya "Islamic/Ornamental": motif arabesque, geometri Islam, palette Navy+Gold+Cream
- Gaya "Minimalis Modern": typography-driven, banyak whitespace, satu aksen warna
- Gaya "Floral/Botanical": SVG bunga & daun inline, palet pastel romantic
- Warna "Royal Islamic": Navy (#1a2744), Gold (#D4AF37), Cream (#FDFBF7)
- Warna "Dusty Rose & Gold": Rose (#F2D7D5), Gold (#D4AF37), Brown (#5C3D2E)
- Warna "Sage Green & Cream": Sage (#7D9B76), Cream (#E8EDE0), Dark (#3D4A35)
- Warna "Cyberpunk Neon": Black (#000), Neon Blue (#00f3ff), Neon Pink (#ff003c), text-shadow glow

ATURAN JAVASCRIPT WAJIB:
1. Cover: Klik tombol → slide-up cover, hapus overflow-hidden dari body, tampilkan FAB audio, play audio.
2. Countdown: Hitung mundur real-time ke tanggal acara menggunakan setInterval.
3. Scroll Reveal: IntersectionObserver untuk animasi masuk elemen.
4. RSVP: Form HARUS memiliki id="rsvp-form" dengan field berikut:
   - input[name="name"] (type text, wajib)
   - input[name="guestCount"] (type number, min=1 max=10, value default 1)
   - input[name="attending"] (type radio, dua opsi: value="true" label Hadir / value="false" label Tidak Hadir)
   - textarea[name="message"] (opsional, untuk ucapan/pesan)
   Handler submit WAJIB menggunakan pola berikut (verbatim, jangan diubah):
   document.getElementById('rsvp-form').addEventListener('submit',async function(e){
     e.preventDefault();var f=e.target;
     var data={name:f.name.value,guestCount:parseInt(f.guestCount.value)||1,
               attending:f.attending.value==='true',message:f.message?f.message.value:''};
     if(window.__rsvpSubmit){
       var ok=await window.__rsvpSubmit(data);
       if(ok){/* sembunyikan form, tampilkan ucapan terima kasih */}
       else{/* tampilkan pesan error */}
     }else{/* tampilkan ucapan terima kasih lokal */}
   });
5. Dark Mode: toggle class pada body/html.

EFISIENSI KODE (WAJIB):
- Output HARUS lengkap dari <!DOCTYPE html> hingga </html> dalam satu respons.
- Jangan duplikasi deklarasi CSS; gunakan class reusable.
- Ikon: utamakan FontAwesome class (fa-*); SVG inline hanya jika tidak ada padanannya.
- Galeri placeholder: max 3 item dengan CSS/SVG yang sama, jangan copy-paste berulang.
`.trim()

// ── User prompt builder ───────────────────────────────────────────────────────

export function buildUserPrompt(params: InvitationParams, media?: MediaAssets): string {
  const photoLines: string[] = []
  if (media?.fotoCover)          photoLines.push('- Foto cover/utama    : DISEDIAKAN → wajib pakai <img data-photo="cover" ...>')
  if (media?.fotoMempelaiPria)   photoLines.push('- Foto mempelai pria  : DISEDIAKAN → wajib pakai <img data-photo="groom" ...>')
  if (media?.fotoMempelaiWanita) photoLines.push('- Foto mempelai wanita: DISEDIAKAN → wajib pakai <img data-photo="bride" ...>')
  if (media?.fotoPerson)         photoLines.push('- Foto orang utama    : DISEDIAKAN → wajib pakai <img data-photo="person" ...>')
  if (media?.bgCover)            photoLines.push('- Background cover    : DISEDIAKAN → wajib pakai <img data-photo="bg-cover" class="absolute inset-0 w-full h-full object-cover -z-10" alt="" /> sebagai latar fullscreen di section cover (pastikan section cover punya position:relative dan overflow:hidden)')
  if (media?.fotoGaleri?.length) {
    photoLines.push(`- Foto galeri (${media.fotoGaleri.length} foto): DISEDIAKAN → wajib pakai <img data-photo="gallery-1">, <img data-photo="gallery-2">, dst. Buat section galeri dengan tepat ${media.fotoGaleri.length} slot.`)
  }

  const extraFeatures: string[] = []
  if (params.story) {
    extraFeatures.push(`STORY / KISAH (wajib tambahkan section dengan heading yang sesuai jenis undangan, seperti "Kisah Cinta", "Perjalanan Studi", dll):\n${params.story}`)
  }
  if (params.dompetDigital) {
    extraFeatures.push(`DOMPET DIGITAL / AMPLOP ONLINE (wajib tambahkan section "Hadiah & Doa" atau "Amplop Digital" dengan card per rekening/e-wallet, tombol salin nomor ke clipboard untuk tiap entry, ikon atau label bank/e-wallet):\n${params.dompetDigital}`)
  }
  if (params.acaraKedua) {
    extraFeatures.push(`ACARA TAMBAHAN (wajib tambahkan section acara terpisah dengan detail lengkap, ikon, tanggal, waktu, lokasi):\n${params.acaraKedua}`)
  }

  const mediaSection = [
    photoLines.length > 0 ? `\nFOTO PENGGUNA (WAJIB sediakan slot <img> dengan atribut data-photo yang tepat):\n${photoLines.join('\n')}` : '',
    media?.hasAudio ? '\nAUDIO BACKGROUND: DISEDIAKAN → wajib sertakan <audio loop autoplay><source src="__AUDIO__" type="audio/mpeg"></audio> di dalam <body>.' : '',
    extraFeatures.length > 0 ? `\n\nFITUR TAMBAHAN WAJIB DISERTAKAN:\n${extraFeatures.join('\n\n')}` : '',
  ].filter(Boolean).join('\n')

  const sectionGuide = SECTION_GUIDE[params.jenis] ?? SECTION_GUIDE.umum

  return `
Generate undangan digital dengan parameter berikut:

JENIS UNDANGAN    : ${params.jenis.toUpperCase().replace('_', ' ')}
Topik / Judul     : ${params.topik}
Isi Acara         : ${params.isiAcara}
Mode Tampilan     : ${params.mode}
Gaya Visual       : ${params.gaya}
Tema Warna        : ${params.warna}
Tipografi         : ${params.tipografi}
Layout/Komposisi  : ${params.layout}
Background        : ${params.background}
Dekorasi Tambahan : ${params.dekorasi}
Identitas Medsos  : ${params.medsos}
Aspect Ratio      : Layout Smartphone (max-w-md multi-section scrolling)
Instruksi Tambahan: ${params.instruksiTambahan}
${sectionGuide}
${mediaSection}

Output HANYA kode HTML lengkap dimulai dari <!DOCTYPE html>.
`.trim()
}
