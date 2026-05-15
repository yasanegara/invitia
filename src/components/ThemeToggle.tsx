'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={theme === 'amber' ? 'Ganti ke Dusty Pink' : 'Ganti ke Amber'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all"
      style={{
        borderColor: 'var(--color-primary-border)',
        color: 'var(--color-primary-dark)',
        background: 'var(--color-primary-50)',
      }}
    >
      <span
        className="w-3.5 h-3.5 rounded-full border-2 inline-block transition-all"
        style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary-dark)' }}
      />
      {theme === 'amber' ? 'Amber' : 'Dusty Pink'}
    </button>
  )
}
