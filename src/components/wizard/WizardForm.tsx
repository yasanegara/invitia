'use client'

import { useState, useRef, useEffect }  from 'react'
import { useRouter } from 'next/navigation'
import type { InvitationParams, InvitationJenis, WizardStep } from '@/types'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload  = e => resolve(e.target!.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

interface UploadZoneProps {
  label:    string
  value:    string
  onChange: (v: string) => void
  accept:   string
  isAudio?: boolean
  maxMB?:   number
}

function UploadZone({ label, value, onChange, accept, isAudio, maxMB = 5 }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > maxMB * 1024 * 1024) { alert(`Ukuran file maks ${maxMB}MB`); return }
    const url = await readFileAsDataUrl(file)
    onChange(url)
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
      <div
        className={`relative border-2 border-dashed rounded-xl transition cursor-pointer
          ${value ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-amber-300'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-amber-400') }}
        onDragLeave={e => e.currentTarget.classList.remove('border-amber-400')}
        onDrop={async e => {
          e.preventDefault()
          e.currentTarget.classList.remove('border-amber-400')
          const f = e.dataTransfer.files?.[0]
          if (f) handleFile(f)
        }}
      >
        {value ? (
          <div className="flex items-center gap-3 p-3">
            {isAudio ? (
              <span className="text-2xl">🎵</span>
            ) : (
              <img src={value} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-700 font-semibold">✅ {isAudio ? 'Audio dipilih' : 'Foto dipilih'}</p>
              <p className="text-xs text-gray-400 mt-0.5">Klik untuk ganti</p>
            </div>
            <button type="button" onClick={e => { e.stopPropagation(); onChange('') }}
              className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded">✕</button>
          </div>
        ) : (
          <div className="py-5 text-center">
            <p className="text-lg">{isAudio ? '🎵' : '📷'}</p>
            <p className="text-xs text-gray-400 mt-1">Klik atau drag file ke sini</p>
            <p className="text-xs text-gray-300">Maks {maxMB}MB</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept={accept} className="hidden"
          onChange={async e => { const f = e.target.files?.[0]; if (f) { await handleFile(f); e.target.value = '' } }}
        />
      </div>
    </div>
  )
}

const STEPS = [
  { label: 'Jenis',   icon: '📋' },
  { label: 'Acara',   icon: '✍️' },
  { label: 'Desain',  icon: '🎨' },
  { label: 'Konten',  icon: '📁' },
  { label: 'Generate',icon: '✨' },
]

const JENIS_UNDANGAN: { id: InvitationJenis; emoji: string; label: string; desc: string }[] = [
  { id: 'nikah',         emoji: '💍', label: 'Nikah',         desc: 'Akad & resepsi pernikahan'   },
  { id: 'khitan',        emoji: '🌙', label: 'Khitan',        desc: 'Walimatul khitan / sunatan'  },
  { id: 'walimah_safar', emoji: '✈️', label: 'Walimah Safar', desc: 'Pelepasan umroh / haji'      },
  { id: 'pengajian',     emoji: '📖', label: 'Pengajian',     desc: 'Majelis ilmu & kajian'       },
  { id: 'wisuda',        emoji: '🎓', label: 'Wisuda',        desc: 'Syukuran wisuda'             },
  { id: 'gathering',     emoji: '🎉', label: 'Gathering',     desc: 'Reuni / gathering komunitas' },
  { id: 'ulang_tahun',   emoji: '🎂', label: 'Ulang Tahun',   desc: 'Perayaan ulang tahun'        },
  { id: 'aqiqah',        emoji: '👶', label: 'Aqiqah',        desc: 'Syukuran kelahiran bayi'     },
  { id: 'umum',          emoji: '📋', label: 'Lainnya',       desc: 'Acara umum lainnya'          },
]

const ISIAKARA_TEMPLATE: Record<InvitationJenis, string> = {
  nikah: `Nama mempelai pria    : \nNama orang tua pria   : Bapak ... & Ibu ...\n\nNama mempelai wanita  : \nNama orang tua wanita : Bapak ... & Ibu ...\n\nAkad Nikah:\n- Hari/Tanggal : \n- Waktu        : ... WIB\n- Lokasi       : \n\nResepsi:\n- Hari/Tanggal : \n- Waktu        : ... s/d ... WIB\n- Lokasi       : `,
  khitan: `Nama anak    : \nUsia         : ... tahun\nOrang tua    : Bapak ... & Ibu ...\n\nAcara Khitan:\n- Tanggal : \n- Waktu   : ... WIB\n- Lokasi  : `,
  walimah_safar: `Nama yang berangkat : \nTujuan              : Umroh / Haji\nTanggal berangkat   : \n\nAcara Pelepasan:\n- Tanggal : \n- Waktu   : ... WIB\n- Lokasi  : `,
  pengajian: `Tema Kajian   : \nPenceramah    : Ustadz/Ustadzah ...\n\nDetail Acara:\n- Tanggal  : \n- Waktu    : ... WIB\n- Lokasi   : `,
  wisuda: `Nama wisudawan/ti : \nGelar / Prodi     : \nUniversitas       : \nNama orang tua    : Bapak ... & Ibu ...\n\nUpacara Wisuda:\n- Tanggal  : \n- Waktu    : ... WIB\n- Lokasi   : \n\nSyukuran:\n- Tanggal  : \n- Waktu    : ... WIB\n- Lokasi   : `,
  gathering: `Nama Event / Komunitas : \nTema               : \n\nDetail Acara:\n- Tanggal   : \n- Waktu     : ... WIB\n- Lokasi    : \n- Dress Code: `,
  ulang_tahun: `Nama yang berulang tahun : \nUsia                     : ... tahun\n\nDetail Acara:\n- Tanggal   : \n- Waktu     : ... WIB\n- Lokasi    : \n- Dress Code: `,
  aqiqah: `Nama bayi      : \nJenis kelamin  : Laki-laki / Perempuan\nTanggal lahir  : \nNama orang tua : Bapak ... & Ibu ...\n\nAcara Aqiqah:\n- Tanggal  : \n- Waktu    : ... WIB\n- Lokasi   : `,
  umum: `Nama Acara    : \nPenyelenggara : \n\nDetail Acara:\n- Tanggal  : \n- Waktu    : ... WIB\n- Lokasi   : `,
}

const TOPIK_PLACEHOLDER: Record<InvitationJenis, string> = {
  nikah:         'Pernikahan Budi & Ani',
  khitan:        'Khitan Muhammad Fauzan',
  walimah_safar: 'Walimah Safar Bapak Ahmad',
  pengajian:     'Pengajian Rutin Majelis Al-Hikmah',
  wisuda:        'Wisuda Sarah Amelia, S.Kom.',
  gathering:     'Family Gathering Keluarga Besar Suharto',
  ulang_tahun:   'Ulang Tahun Nafisah ke-17',
  aqiqah:        'Aqiqah Putra Pertama Keluarga Rizki',
  umum:          'Acara Syukuran Rumah Baru',
}

const GAYA_OPTIONS = [
  { value: 'Floral/Botanical',  label: '🌸 Floral',       desc: 'Bunga & daun, romantis' },
  { value: 'Islamic/Ornamental',label: '🕌 Islamic',       desc: 'Arabesque, mewah'       },
  { value: 'Glassmorphism',     label: '🪟 Glassmorphism', desc: 'Kaca buram, modern'     },
  { value: 'Minimalis Modern',  label: '⬜ Minimalis',     desc: 'Clean, tipografi kuat'  },
]

const WARNA_OPTIONS = [
  { value: 'Dusty Rose & Gold',  label: '🌹 Dusty Rose & Gold'  },
  { value: 'Royal Islamic',      label: '👑 Royal Islamic'       },
  { value: 'Sage Green & Cream', label: '🌿 Sage Green & Cream'  },
  { value: 'Putih & Lavender',   label: '💜 Putih & Lavender'    },
]

const FONT_OPTIONS = [
  { value: 'Cormorant Garamond + Raleway', label: 'Cormorant + Raleway'      },
  { value: 'Playfair Display + Lato',      label: 'Playfair + Lato'          },
  { value: 'Great Vibes + Montserrat',     label: 'Great Vibes + Montserrat' },
]

const PERSON_PHOTO_LABEL: Partial<Record<InvitationJenis, string>> = {
  khitan:        'Foto Anak',
  walimah_safar: 'Foto yang Berangkat',
  pengajian:     'Foto Penceramah',
  wisuda:        'Foto Wisudawan/ti',
  ulang_tahun:   'Foto yang Berulang Tahun',
  aqiqah:        'Foto Bayi',
  umum:          'Foto Utama',
}

const STORY_LABEL: Partial<Record<InvitationJenis, string>> = {
  nikah:         'Kisah Cinta',
  khitan:        'Momen Spesial',
  walimah_safar: 'Kisah Perjalanan',
  pengajian:     'Tentang Kajian',
  wisuda:        'Perjalanan Studi',
  gathering:     'Tentang Komunitas',
  ulang_tahun:   'Perjalanan Hidup',
  aqiqah:        'Kehadiran Buah Hati',
  umum:          'Cerita / Story',
}

const STORY_PLACEHOLDER: Partial<Record<InvitationJenis, string>> = {
  nikah:         'Bagaimana kalian bertemu, perjalanan cinta, hingga memutuskan menikah...',
  wisuda:        'Perjalanan studi, perjuangan, dan momen berkesan selama kuliah...',
  aqiqah:        'Kehadiran si kecil, makna nama yang dipilih, dan rasa syukur keluarga...',
  ulang_tahun:   'Perjalanan hidup, pencapaian, dan momen-momen berharga...',
  gathering:     'Asal muasal komunitas, misi, dan momen kebersamaan...',
}

const ACARA_KEDUA_PLACEHOLDER: Partial<Record<InvitationJenis, string>> = {
  nikah:         'Contoh: Pengajian\n- Tanggal : Jumat, 10 Januari 2025\n- Waktu   : 19.00 WIB\n- Lokasi  : ...',
  wisuda:        'Contoh: Syukuran\n- Tanggal : ...\n- Waktu   : ...\n- Lokasi  : ...',
  umum:          'Nama acara, tanggal, waktu, lokasi...',
}

const DEKORASI_OPTIONS = [
  'Countdown Timer',
  'Animasi kelopak bunga jatuh',
  'Ornamen border floral SVG',
  'Dark Mode toggle',
  'Konfetti animasi',
]

interface DompetEntry { nama: string; nomor: string; penerima: string }

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${on ? 'bg-amber-500' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

function FeatureCard({
  icon, title, desc, on, onChange, children,
}: {
  icon: string; title: string; desc: string
  on: boolean; onChange: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-colors duration-200 ${on ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200 bg-white'}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onChange(!on)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(!on)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl leading-none">{icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>
        </div>
        <Toggle on={on} onChange={onChange} />
      </div>
      {on && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )
}

type FormState = Partial<InvitationParams> & { dekorasiList?: string[] }

const FREE_EDIT_LIMIT = 3

function AnimatedDots() {
  const [count, setCount] = useState(1)
  useEffect(() => {
    const id = setInterval(() => setCount(c => (c % 3) + 1), 400)
    return () => clearInterval(id)
  }, [])
  return <span className="inline-block w-5 text-left">{'.'.repeat(count)}</span>
}

interface Props {
  initialParams?:  InvitationParams
  invitationId?:   string  // when set → edit mode
  editCount?:      number
}

function paramsToFormState(p: InvitationParams): FormState {
  return {
    ...p,
    dekorasiList: p.dekorasi ? p.dekorasi.split(', ').filter(Boolean) : [],
  }
}

export default function WizardForm({ initialParams, invitationId, editCount = 0 }: Props) {
  const isEdit   = !!invitationId
  const isFree   = editCount < FREE_EDIT_LIMIT
  const freeLeft = Math.max(0, FREE_EDIT_LIMIT - editCount)
  const router   = useRouter()

  const [step,    setStep]    = useState<WizardStep>(1)
  const [form,    setForm]    = useState<FormState>(
    initialParams
      ? paramsToFormState(initialParams)
      : {
          mode:             'Light',
          layout:           'Centered',
          background:       'Gradient pastel animated',
          dekorasiList:     ['Countdown Timer', 'Ornamen border floral SVG'],
          instruksiTambahan:'',
          medsos:           '',
        }
  )
  const selectedJenis = JENIS_UNDANGAN.find(j => j.id === form.jenis)
  const [status,          setStatus]          = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [errorMsg,        setErrorMsg]        = useState('')
  const [slug,            setSlug]            = useState('')
  const [progressPhase,   setProgressPhase]   = useState('🤖 AI sedang merancang undangan...')
  const [progressPercent, setProgressPercent] = useState(3)

  // Media uploads (data URLs — not stored in DB params)
  const [fotoCover,          setFotoCover]          = useState('')
  const [fotoMempelaiPria,   setFotoMempelaiPria]   = useState('')
  const [fotoMempelaiWanita, setFotoMempelaiWanita] = useState('')
  const [fotoPerson,         setFotoPerson]         = useState('')
  const [bgCoverUrl,         setBgCoverUrl]         = useState('')
  const [audioUrl,           setAudioUrl]           = useState('')
  const [fotoGaleri,         setFotoGaleri]         = useState<string[]>([])

  // Feature toggles
  const [fiturMusik,      setFiturMusik]      = useState(false)
  const [fiturGaleri,     setFiturGaleri]     = useState(false)
  const [fiturStory,      setFiturStory]      = useState(!!initialParams?.story)
  const [storyText,       setStoryText]       = useState(initialParams?.story ?? '')
  const [fiturDompet,     setFiturDompet]     = useState(!!initialParams?.dompetDigital)
  const [dompetEntries,   setDompetEntries]   = useState<DompetEntry[]>(() => {
    if (!initialParams?.dompetDigital) return []
    return initialParams.dompetDigital.split('\n').filter(Boolean).map(line => {
      const m = line.match(/^(.+?)\s*\((.+?)\)\s*:\s*(.+)$/)
      return m ? { nama: m[1].trim(), penerima: m[2].trim(), nomor: m[3].trim() } : { nama: '', penerima: '', nomor: line.trim() }
    })
  })
  const [fiturAcaraKedua, setFiturAcaraKedua] = useState(!!initialParams?.acaraKedua)
  const [acaraKeduaText,  setAcaraKeduaText]  = useState(initialParams?.acaraKedua ?? '')
  const [fiturBgCover,    setFiturBgCover]    = useState(false)

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(p => ({ ...p, [key]: val }))
  }

  function toggleDekorasi(item: string) {
    setForm(p => {
      const list = p.dekorasiList ?? []
      return { ...p, dekorasiList: list.includes(item) ? list.filter(x => x !== item) : [...list, item] }
    })
  }

  async function generate() {
    setProgressPhase('🤖 AI sedang merancang undangan...')
    setProgressPercent(3)
    setStatus('generating')
    const params: InvitationParams = {
      jenis:             (form.jenis ?? 'umum') as InvitationJenis,
      topik:             form.topik ?? '',
      isiAcara:          form.isiAcara ?? '',
      mode:              form.mode ?? 'Light',
      gaya:              form.gaya ?? '',
      warna:             form.warna ?? '',
      tipografi:         form.tipografi ?? '',
      layout:            form.layout ?? 'Centered',
      background:        form.background ?? '',
      dekorasi:          (form.dekorasiList ?? []).join(', '),
      medsos:            form.medsos ?? '',
      instruksiTambahan: form.instruksiTambahan ?? '',
      ...(fiturStory && storyText.trim()       ? { story: storyText.trim() }         : {}),
      ...(fiturDompet && dompetEntries.some(e => e.nama && e.nomor) ? {
        dompetDigital: dompetEntries
          .filter(e => e.nama && e.nomor)
          .map(e => `${e.nama} (${e.penerima || e.nama}): ${e.nomor}`)
          .join('\n'),
      } : {}),
      ...(fiturAcaraKedua && acaraKeduaText.trim() ? { acaraKedua: acaraKeduaText.trim() } : {}),
    }

    // Merge uploaded media (stripped from params before DB storage by the API)
    const body = {
      ...params,
      ...(fotoCover                                             ? { fotoCover }          : {}),
      ...(params.jenis === 'nikah' && fotoMempelaiPria          ? { fotoMempelaiPria }   : {}),
      ...(params.jenis === 'nikah' && fotoMempelaiWanita        ? { fotoMempelaiWanita } : {}),
      ...(params.jenis !== 'nikah' && fotoPerson                ? { fotoPerson }         : {}),
      ...(fiturBgCover && bgCoverUrl                            ? { bgCover: bgCoverUrl }: {}),
      ...(fiturMusik && audioUrl                                ? { audioUrl }           : {}),
      ...(fiturGaleri && fotoGaleri.length > 0                  ? { fotoGaleri }         : {}),
    }

    try {
      const url    = isEdit ? `/api/invitations/${invitationId}` : '/api/generate'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '')
        let msg = 'Gagal generate'
        try { msg = (JSON.parse(text) as { error?: string }).error ?? `HTTP ${res.status}` } catch { msg = `HTTP ${res.status}` }
        throw new Error(msg)
      }

      const reader = res.body.getReader()
      const dec    = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = dec.decode(value)
        for (const line of text.split('\n')) {
          if (!line.startsWith('data:')) continue
          const event = JSON.parse(line.slice(5).trim()) as { status: string; slug?: string; message?: string; phase?: string; percent?: number }
          if (event.status === 'done') {
            setProgressPercent(100)
            setProgressPhase('✅ Undangan selesai!')
            setSlug(event.slug ?? '')
            setStatus('done')
          } else if (event.status === 'progress' || event.status === 'generating') {
            if (event.phase)   setProgressPhase(event.phase)
            if (event.percent) setProgressPercent(event.percent)
          } else if (event.status === 'error') {
            throw new Error(event.message)
          }
        }
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Terjadi kesalahan')
      setStatus('error')
    }
  }

  const canNext = (): boolean => {
    if (step === 1) return !!form.jenis
    if (step === 2) return !!(form.topik && form.isiAcara)
    if (step === 3) return !!(form.gaya && form.warna && form.tipografi)
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">←</button>
        <span className="font-bold text-amber-600">
          {isEdit ? 'Edit Undangan' : 'Buat Undangan Baru'}
        </span>
      </header>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 pt-6 px-4">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
              i + 1 === step  ? 'bg-amber-500 text-white' :
              i + 1 < step    ? 'bg-green-500 text-white' :
                                'bg-gray-200 text-gray-500'
            }`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i + 1 === step ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300" />}
          </div>
        ))}
      </div>

      {/* Form content */}
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* STEP 1 — Pilih Jenis */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800">📋 Pilih Jenis Undangan</h2>
            <p className="text-sm text-gray-500">Setiap jenis punya struktur section dan komponen yang berbeda.</p>
            <div className="grid grid-cols-3 gap-3">
              {JENIS_UNDANGAN.map(j => (
                <button key={j.id}
                  onClick={() => {
                    setField('jenis', j.id as InvitationJenis)
                    if (!form.isiAcara) setField('isiAcara', ISIAKARA_TEMPLATE[j.id as InvitationJenis])
                    if (!form.topik)    setField('topik',    TOPIK_PLACEHOLDER[j.id as InvitationJenis])
                  }}
                  className={`p-3 rounded-2xl border-2 text-center transition ${
                    form.jenis === j.id
                      ? 'border-amber-400 bg-amber-50 shadow-sm'
                      : 'border-gray-200 hover:border-amber-200'
                  }`}>
                  <p className="text-2xl">{j.emoji}</p>
                  <p className="text-xs font-bold text-gray-700 mt-1">{j.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{j.desc}</p>
                </button>
              ))}
            </div>
            {form.jenis && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                ✅ <strong>{selectedJenis?.emoji} {selectedJenis?.label}</strong> dipilih — lanjut untuk mengisi detail acara.
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Acara */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800">
              ✍️ Detail {selectedJenis ? `${selectedJenis.emoji} ${selectedJenis.label}` : 'Acara'}
            </h2>
            <div>
              <label className="label">Judul / Topik</label>
              <input
                className="inp"
                placeholder={form.jenis ? TOPIK_PLACEHOLDER[form.jenis as InvitationJenis] : 'Judul acara...'}
                value={form.topik ?? ''} onChange={e => setField('topik', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Isi Acara</label>
              <textarea
                className="inp" rows={8}
                placeholder={form.jenis ? ISIAKARA_TEMPLATE[form.jenis as InvitationJenis] : 'Detail acara...'}
                value={form.isiAcara ?? ''} onChange={e => setField('isiAcara', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Isi sesuai template di atas — semakin lengkap semakin bagus hasilnya.</p>
            </div>
            <div>
              <label className="label">Mode Tampilan</label>
              <div className="flex gap-3">
                {(['Light', 'Dark', 'Auto'] as const).map(m => (
                  <button key={m} onClick={() => setField('mode', m)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition ${
                      form.mode === m ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500'
                    }`}>
                    {m === 'Light' ? '☀️' : m === 'Dark' ? '🌙' : '🔄'} {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Desain */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800">🎨 Gaya Desain</h2>
            <div>
              <label className="label">Gaya Visual</label>
              <div className="grid grid-cols-2 gap-3">
                {GAYA_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setField('gaya', opt.value)}
                    className={`p-3 rounded-xl border text-left transition ${
                      form.gaya === opt.value ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Tema Warna</label>
              <div className="space-y-2">
                {WARNA_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setField('warna', opt.value)}
                    className={`w-full p-3 rounded-xl border text-left text-sm transition ${
                      form.warna === opt.value ? 'border-amber-400 bg-amber-50 font-semibold' : 'border-gray-200'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Tipografi</label>
              <div className="space-y-2">
                {FONT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setField('tipografi', opt.value)}
                    className={`w-full p-3 rounded-xl border text-left text-sm transition ${
                      form.tipografi === opt.value ? 'border-amber-400 bg-amber-50 font-semibold' : 'border-gray-200'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Konten & Dekorasi Console */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">🎪 Konten & Dekorasi</h2>
              <p className="text-sm text-gray-400 mt-1">Aktifkan fitur yang ingin disertakan dalam undangan.</p>
            </div>

            {/* ── FOTO PROFIL ── */}
            <section className="space-y-3">
              <p className="label">📷 Foto Profil <span className="normal-case font-normal text-gray-400">(opsional)</span></p>
              <UploadZone label="Foto Cover / Utama" value={fotoCover} onChange={setFotoCover} accept="image/*" />
              {form.jenis === 'nikah' && (
                <div className="grid grid-cols-2 gap-3">
                  <UploadZone label="Foto Mempelai Pria"   value={fotoMempelaiPria}   onChange={setFotoMempelaiPria}   accept="image/*" />
                  <UploadZone label="Foto Mempelai Wanita" value={fotoMempelaiWanita} onChange={setFotoMempelaiWanita} accept="image/*" />
                </div>
              )}
              {form.jenis && form.jenis !== 'nikah' && form.jenis !== 'gathering' && PERSON_PHOTO_LABEL[form.jenis] && (
                <UploadZone label={PERSON_PHOTO_LABEL[form.jenis]!} value={fotoPerson} onChange={setFotoPerson} accept="image/*" />
              )}
            </section>

            {/* ── FITUR CARDS ── */}
            <section className="space-y-2">
              <p className="label">⚡ Fitur Undangan</p>

              <FeatureCard icon="🎵" title="Musik Background"
                desc="Putar musik otomatis saat undangan dibuka"
                on={fiturMusik} onChange={v => { setFiturMusik(v); if (!v) setAudioUrl('') }}>
                <UploadZone label="File Audio (MP3/OGG, maks 10MB)" value={audioUrl} onChange={setAudioUrl} accept="audio/*" isAudio maxMB={10} />
              </FeatureCard>

              <FeatureCard icon="📸" title="Galeri Foto"
                desc="Tampilkan kenangan dalam grid foto"
                on={fiturGaleri} onChange={v => { setFiturGaleri(v); if (!v) setFotoGaleri([]) }}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Maks 8 foto</p>
                    {fotoGaleri.length < 8 && (
                      <button type="button"
                        onClick={async () => {
                          const input = document.createElement('input')
                          input.type = 'file'; input.accept = 'image/*'; input.multiple = true
                          input.onchange = async () => {
                            const files = Array.from(input.files ?? []).slice(0, 8 - fotoGaleri.length)
                            const urls  = await Promise.all(files.map(readFileAsDataUrl))
                            setFotoGaleri(p => [...p, ...urls].slice(0, 8))
                          }
                          input.click()
                        }}
                        className="text-xs text-amber-600 font-semibold hover:underline">
                        + Tambah Foto
                      </button>
                    )}
                  </div>
                  {fotoGaleri.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">
                      Belum ada foto — klik "+ Tambah Foto"
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5">
                      {fotoGaleri.map((url, i) => (
                        <div key={i} className="relative aspect-square">
                          <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                          <button type="button"
                            onClick={() => setFotoGaleri(p => p.filter((_, j) => j !== i))}
                            className="absolute top-0.5 right-0.5 bg-black/60 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FeatureCard>

              <FeatureCard
                icon="💕"
                title={STORY_LABEL[form.jenis ?? 'umum'] ?? 'Kisah / Story'}
                desc="Bagikan cerita di balik momen spesial ini"
                on={fiturStory} onChange={setFiturStory}>
                <textarea
                  className="inp" rows={5}
                  placeholder={STORY_PLACEHOLDER[form.jenis ?? 'umum'] ?? 'Tuliskan cerita singkat...'}
                  value={storyText}
                  onChange={e => setStoryText(e.target.value)}
                />
                <p className="text-xs text-gray-400">AI akan memformat dan membuat section story yang menarik.</p>
              </FeatureCard>

              <FeatureCard icon="💳" title="Dompet Digital"
                desc="Rekening bank & e-wallet untuk hadiah"
                on={fiturDompet} onChange={v => { setFiturDompet(v); if (!v) setDompetEntries([]) }}>
                <div className="space-y-3">
                  {dompetEntries.map((entry, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">Rekening / E-Wallet {i + 1}</p>
                        <button type="button" onClick={() => setDompetEntries(p => p.filter((_, j) => j !== i))}
                          className="text-xs text-red-400 hover:text-red-600">✕ Hapus</button>
                      </div>
                      <input
                        className="inp" placeholder="Bank / E-Wallet (contoh: BCA, GoPay, OVO)"
                        value={entry.nama}
                        onChange={e => setDompetEntries(p => p.map((x, j) => j === i ? { ...x, nama: e.target.value } : x))}
                      />
                      <input
                        className="inp" placeholder="Nomor rekening / nomor HP"
                        value={entry.nomor}
                        onChange={e => setDompetEntries(p => p.map((x, j) => j === i ? { ...x, nomor: e.target.value } : x))}
                      />
                      <input
                        className="inp" placeholder="Atas nama"
                        value={entry.penerima}
                        onChange={e => setDompetEntries(p => p.map((x, j) => j === i ? { ...x, penerima: e.target.value } : x))}
                      />
                    </div>
                  ))}
                  {dompetEntries.length < 5 && (
                    <button type="button"
                      onClick={() => setDompetEntries(p => [...p, { nama: '', nomor: '', penerima: '' }])}
                      className="w-full border-2 border-dashed border-gray-200 hover:border-amber-300 text-gray-400 hover:text-amber-600 text-xs font-semibold py-2.5 rounded-xl transition">
                      + Tambah Rekening / E-Wallet
                    </button>
                  )}
                </div>
              </FeatureCard>

              <FeatureCard icon="📅" title="Acara Tambahan"
                desc="Tambahkan sesi atau rangkaian acara kedua"
                on={fiturAcaraKedua} onChange={setFiturAcaraKedua}>
                <textarea
                  className="inp" rows={5}
                  placeholder={ACARA_KEDUA_PLACEHOLDER[form.jenis ?? 'umum'] ?? 'Nama acara, tanggal, waktu, lokasi...'}
                  value={acaraKeduaText}
                  onChange={e => setAcaraKeduaText(e.target.value)}
                />
                <p className="text-xs text-gray-400">Tuliskan detail acara tambahan, AI akan membuat section terpisah.</p>
              </FeatureCard>

              <FeatureCard icon="🖼️" title="Background Section Cover"
                desc="Foto untuk latar belakang fullscreen cover undangan"
                on={fiturBgCover} onChange={v => { setFiturBgCover(v); if (!v) setBgCoverUrl('') }}>
                <UploadZone label="Foto Background Cover" value={bgCoverUrl} onChange={setBgCoverUrl} accept="image/*" />
                <p className="text-xs text-gray-400">Foto ini akan menjadi background layar penuh di section cover.</p>
              </FeatureCard>
            </section>

            {/* ── DEKORASI ── */}
            <section className="space-y-3">
              <p className="label">🎨 Dekorasi Tambahan</p>
              <div className="flex flex-wrap gap-2">
                {DEKORASI_OPTIONS.map(item => (
                  <button key={item} type="button" onClick={() => toggleDekorasi(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      form.dekorasiList?.includes(item)
                        ? 'border-amber-400 bg-amber-100 text-amber-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {item}
                  </button>
                ))}
              </div>
            </section>

            {/* ── INFO ── */}
            <section className="space-y-4">
              <p className="label">📋 Informasi Lainnya</p>
              <div>
                <label className="label">Identitas Sosial Media <span className="normal-case font-normal text-gray-400">(opsional)</span></label>
                <input className="inp" placeholder="@instagram, WA: 08xxx, dll"
                  value={form.medsos ?? ''} onChange={e => setField('medsos', e.target.value)} />
              </div>
              <div>
                <label className="label">Instruksi Tambahan <span className="normal-case font-normal text-gray-400">(opsional)</span></label>
                <textarea className="inp" rows={3}
                  placeholder="Nuansa islami, tambahkan countdown, dll"
                  value={form.instruksiTambahan ?? ''} onChange={e => setField('instruksiTambahan', e.target.value)}
                />
              </div>
            </section>
          </div>
        )}

        {/* STEP 5 — Generate / Regenerate */}
        {step === 5 && (
          <div className="text-center space-y-6">
            {status === 'idle' && (
              <>
                <p className="text-5xl">{isEdit ? '✏️' : '✨'}</p>
                <h2 className="text-xl font-bold text-gray-800">
                  {isEdit ? 'Siap Update Undangan!' : 'Siap Generate!'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEdit
                    ? 'AI akan membuat ulang undangan dengan data baru. HTML lama akan diganti.'
                    : 'AI akan membuat undangan berdasarkan pilihan kamu. Proses ~30 detik.'}
                </p>

                {/* Credit / free info */}
                {isEdit ? (
                  isFree ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                      <span className="text-lg">🎁</span>
                      <span>
                        Edit gratis! Sisa <strong>{freeLeft}/{FREE_EDIT_LIMIT}</strong> edit gratis.
                        {freeLeft === 1 && ' Ini yang terakhir.'}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                      <span className="text-lg">💳</span>
                      <span>Edit gratis habis — akan memotong <strong>1 kredit</strong>.</span>
                    </div>
                  )
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                    <span className="text-lg">💳</span>
                    <span>Membuat undangan baru memotong <strong>1 kredit</strong>.</span>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-4 border text-left space-y-2 text-sm text-gray-600">
                  <p><span className="font-semibold">Acara:</span> {form.topik}</p>
                  <p><span className="font-semibold">Gaya:</span> {form.gaya}</p>
                  <p><span className="font-semibold">Warna:</span> {form.warna}</p>
                  <p><span className="font-semibold">Font:</span> {form.tipografi}</p>
                  {[
                    fiturMusik      && '🎵 Musik',
                    fiturGaleri     && `📸 Galeri (${fotoGaleri.length} foto)`,
                    fiturStory      && `💕 ${STORY_LABEL[form.jenis ?? 'umum'] ?? 'Story'}`,
                    fiturDompet     && `💳 Dompet (${dompetEntries.filter(e => e.nama && e.nomor).length} rekening)`,
                    fiturAcaraKedua && '📅 Acara Tambahan',
                    fiturBgCover    && '🖼️ Background Cover',
                  ].filter(Boolean).length > 0 && (
                    <p><span className="font-semibold">Fitur:</span>{' '}
                      {[
                        fiturMusik      && '🎵 Musik',
                        fiturGaleri     && `📸 Galeri (${fotoGaleri.length} foto)`,
                        fiturStory      && `💕 ${STORY_LABEL[form.jenis ?? 'umum'] ?? 'Story'}`,
                        fiturDompet     && `💳 Dompet (${dompetEntries.filter(e => e.nama && e.nomor).length} rekening)`,
                        fiturAcaraKedua && '📅 Acara Tambahan',
                        fiturBgCover    && '🖼️ BG Cover',
                      ].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <button onClick={generate}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl text-lg transition">
                  {isEdit
                    ? isFree ? '✏️ Update Undangan (Gratis)' : '✏️ Update Undangan (1 Kredit)'
                    : '✨ Generate Sekarang (1 Kredit)'}
                </button>
              </>
            )}

            {status === 'generating' && (
              <div className="space-y-6">
                {/* Spinner */}
                <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />

                {/* Phase label */}
                <p className="font-semibold text-gray-700 text-center">
                  {progressPhase.replace(/\.{2,}$/, '')}<AnimatedDots />
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{isEdit ? 'Mengupdate undangan...' : 'Membuat undangan...'}</span>
                    <span className="font-semibold text-amber-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center">Proses biasanya memakan waktu 20–40 detik 🎨</p>
              </div>
            )}

            {status === 'done' && (
              <div className="space-y-4">
                <p className="text-5xl">🎉</p>
                <h2 className="text-xl font-bold text-green-700">
                  {isEdit ? 'Undangan Berhasil Diperbarui!' : 'Undangan Berhasil Dibuat!'}
                </h2>
                <a href={`/u/${slug}`} target="_blank"
                  className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition">
                  Lihat Undangan →
                </a>
                <button onClick={() => router.push('/dashboard')}
                  className="w-full border border-gray-300 text-gray-600 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition">
                  Kembali ke Dashboard
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <p className="text-5xl">❌</p>
                <p className="font-semibold text-red-700">{errorMsg}</p>
                <button onClick={() => setStatus('idle')}
                  className="w-full border border-red-300 text-red-600 font-semibold py-3 rounded-2xl hover:bg-red-50 transition">
                  Coba Lagi
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {status === 'idle' && (
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as WizardStep)}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition">
                ← Kembali
              </button>
            )}
            {step < 5 && (
              <button onClick={() => setStep(s => (s + 1) as WizardStep)} disabled={!canNext()}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold py-3 rounded-2xl transition">
                Lanjut →
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .label { display:block; font-size:.75rem; font-weight:600; color:#6b7280; margin-bottom:4px; text-transform:uppercase; letter-spacing:.05em; }
        .inp   { width:100%; border:1.5px solid #e5e7eb; border-radius:12px; padding:12px 16px; font-size:.9rem; color:#374151; outline:none; transition:border-color .2s; }
        .inp:focus { border-color:#f59e0b; box-shadow:0 0 0 3px rgba(245,158,11,.1); }
        textarea.inp { resize:none; }
      `}</style>
    </div>
  )
}
