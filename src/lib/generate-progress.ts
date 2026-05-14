export interface ProgressUpdate {
  label:   string
  percent: number
}

const ESTIMATE = 14000

const MILESTONES: Array<{ check: (t: string) => boolean; label: string; percent: number }> = [
  { check: t => t.includes('</html>'),                           label: '✅ Finalisasi dokumen HTML...',          percent: 93 },
  { check: t => t.includes('</body>'),                           label: '🔧 Melengkapi struktur halaman...',      percent: 87 },
  { check: t => t.length >= ESTIMATE * 0.75,                     label: '✨ Menyempurnakan detail & animasi...',  percent: 78 },
  { check: t => t.length >= ESTIMATE * 0.5,                      label: '🖼️ Menambahkan galeri & dekorasi...',   percent: 65 },
  { check: t => t.includes('<body'),                             label: '📄 Membangun konten undangan...',        percent: 48 },
  { check: t => t.length >= ESTIMATE * 0.25,                     label: '✍️ Menulis konten & detail acara...',   percent: 38 },
  { check: t => t.includes('</style>'),                          label: '🎨 Menyelesaikan desain visual...',      percent: 30 },
  { check: t => t.includes('<style'),                            label: '🎨 Membuat CSS & animasi...',            percent: 18 },
  { check: t => t.includes('<!DOCTYPE') || t.includes('<html'), label: '📝 Menyiapkan struktur HTML...',         percent: 8  },
]

export function detectProgress(accumulated: string): ProgressUpdate {
  for (const m of MILESTONES) {
    if (m.check(accumulated)) return { label: m.label, percent: m.percent }
  }
  return { label: '🤖 AI sedang merancang undangan...', percent: 3 }
}
