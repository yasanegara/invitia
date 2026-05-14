'use client'

import { useState, useTransition, useRef } from 'react'
import { saveAIConfig, saveSystemPrompt, resetSystemPrompt } from './actions'

type Props = {
  model: string
  maxTokens: number
  systemPrompt: string
  defaultSystemPrompt: string
  isPromptCustomised: boolean
}

const TABS = ['⚙️ LM Config', '📝 System Prompt', '🧪 Sandbox'] as const
type Tab = typeof TABS[number]

// ── LM Config tab ────────────────────────────────────────────────────────────
function LMConfigTab({ model, maxTokens }: { model: string; maxTokens: number }) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await saveAIConfig(fd)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Model Name
        </label>
        <input
          name="model"
          defaultValue={model}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="claude-sonnet-4-6"
        />
        <p className="text-xs text-gray-600 mt-1.5">
          Nama model sesuai provider — harus match dengan API key yang dipakai.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Max Output Tokens
        </label>
        <input
          name="maxTokens"
          type="number"
          min={1000}
          max={200000}
          defaultValue={maxTokens}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <p className="text-xs text-gray-600 mt-1.5">
          Batas panjang output. Untuk undangan penuh, 32000+ direkomendasikan.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </button>
        {saved && <span className="text-green-400 text-sm font-medium">✓ Tersimpan</span>}
      </div>
    </form>
  )
}

// ── System Prompt tab ─────────────────────────────────────────────────────────
function SystemPromptTab({
  systemPrompt, defaultSystemPrompt, isPromptCustomised,
}: {
  systemPrompt: string
  defaultSystemPrompt: string
  isPromptCustomised: boolean
}) {
  const [value, setValue]         = useState(systemPrompt)
  const [isPending, startTrans]   = useTransition()
  const [isResetting, startReset] = useTransition()
  const [status, setStatus]       = useState<'idle' | 'saved' | 'reset'>('idle')

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('systemPrompt', value)
    startTrans(async () => {
      await saveSystemPrompt(fd)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    })
  }

  function handleReset() {
    startReset(async () => {
      await resetSystemPrompt()
      setValue(defaultSystemPrompt)
      setStatus('reset')
      setTimeout(() => setStatus('idle'), 3000)
    })
  }

  const charCount = value.length

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPromptCustomised ? (
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-semibold">
              Custom
            </span>
          ) : (
            <span className="text-xs bg-gray-800 text-gray-500 border border-gray-700 px-2.5 py-1 rounded-full">
              Default
            </span>
          )}
          <span className="text-xs text-gray-600">{charCount.toLocaleString('id-ID')} karakter</span>
        </div>
        {isPromptCustomised && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="text-xs text-red-400 hover:text-red-300 font-medium transition disabled:opacity-60"
          >
            {isResetting ? 'Reset...' : '↺ Reset ke Default'}
          </button>
        )}
      </div>

      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        rows={24}
        className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs font-mono rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y leading-relaxed"
        spellCheck={false}
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || value === systemPrompt}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
        >
          {isPending ? 'Menyimpan...' : 'Simpan System Prompt'}
        </button>
        {status === 'saved' && <span className="text-green-400 text-sm font-medium">✓ Tersimpan</span>}
        {status === 'reset' && <span className="text-blue-400 text-sm font-medium">✓ Reset ke default</span>}
      </div>

      <p className="text-xs text-gray-600">
        Perubahan berlaku untuk semua generate undangan baru. Undangan yang sudah dibuat tidak terpengaruh.
      </p>
    </form>
  )
}

// ── Sandbox tab ───────────────────────────────────────────────────────────────
function SandboxTab({ currentSystemPrompt }: { currentSystemPrompt: string }) {
  const [useCustomSystem, setUseCustomSystem] = useState(false)
  const [customSystem, setCustomSystem]       = useState('')
  const [userPrompt, setUserPrompt]           = useState('')
  const [output, setOutput]                   = useState('')
  const [running, setRunning]                 = useState(false)
  const [stats, setStats]                     = useState<{ input: number; output: number; model: string; stop: string } | null>(null)
  const [error, setError]                     = useState('')
  const [previewMode, setPreviewMode]         = useState<'raw' | 'preview'>('raw')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  async function handleRun() {
    if (!userPrompt.trim() || running) return
    setRunning(true)
    setOutput('')
    setStats(null)
    setError('')

    try {
      const res = await fetch('/api/admin/sandbox', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userPrompt,
          systemPrompt: useCustomSystem ? customSystem : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Terjadi kesalahan')
        return
      }

      const reader = res.body!.getReader()
      const dec    = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const evt = JSON.parse(line.slice(6))
          if (evt.type === 'text') {
            setOutput(p => p + evt.text)
          } else if (evt.type === 'done') {
            setStats({ input: evt.inputTokens, output: evt.outputTokens, model: evt.model, stop: evt.stopReason })
          } else if (evt.type === 'error') {
            setError(evt.message)
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setRunning(false)
    }
  }

  // Update iframe preview
  function handlePreview() {
    setPreviewMode('preview')
    if (iframeRef.current && output) {
      const raw = output.replace(/^```(?:html)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
      iframeRef.current.srcdoc = raw
    }
  }

  return (
    <div className="space-y-4">
      {/* Custom system prompt toggle */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setUseCustomSystem(p => !p)}
            className={`w-10 h-5 rounded-full transition relative ${useCustomSystem ? 'bg-amber-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${useCustomSystem ? 'left-5' : 'left-0.5'}`} />
          </div>
          <span className="text-sm text-gray-300 font-medium">Override System Prompt untuk sandbox ini</span>
        </label>

        {useCustomSystem && (
          <textarea
            value={customSystem}
            onChange={e => setCustomSystem(e.target.value)}
            placeholder={`Kosongkan untuk pakai system prompt aktif:\n\n${currentSystemPrompt.slice(0, 120)}...`}
            rows={6}
            className="mt-3 w-full bg-gray-800 border border-gray-700 text-gray-300 text-xs font-mono rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
          />
        )}
      </div>

      {/* User prompt */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          User Prompt
        </label>
        <textarea
          value={userPrompt}
          onChange={e => setUserPrompt(e.target.value)}
          placeholder={`Masukkan prompt untuk dikirim ke model...\n\nContoh:\nGenerate undangan digital dengan parameter berikut:\nJENIS: NIKAH\nTopik: Pernikahan Rizky & Salsabila\nIsi Acara: Akad 09.00, Resepsi 11.00, 15 Juni 2025, Graha Saba Buana Bandung\n...`}
          rows={8}
          className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm font-mono rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
        />
      </div>

      <button
        onClick={handleRun}
        disabled={running || !userPrompt.trim()}
        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl text-sm transition flex items-center gap-2"
      >
        {running ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : '▶ Jalankan'}
      </button>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Output */}
      {(output || running) && (
        <div className="space-y-3">
          {/* Stats bar */}
          {stats && (
            <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5">
              <span className="font-mono text-blue-400">↑ {stats.input.toLocaleString('id-ID')} in</span>
              <span className="font-mono text-purple-400">↓ {stats.output.toLocaleString('id-ID')} out</span>
              <span className="text-gray-600">·</span>
              <span>{stats.model}</span>
              <span className="text-gray-600">·</span>
              <span className={stats.stop === 'max_tokens' ? 'text-red-400 font-semibold' : 'text-green-400'}>
                {stats.stop === 'max_tokens' ? '⚠ max_tokens tercapai' : '✓ end_turn'}
              </span>
            </div>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
            {(['raw', 'preview'] as const).map(m => (
              <button
                key={m}
                onClick={() => m === 'preview' ? handlePreview() : setPreviewMode('raw')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  previewMode === m ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {m === 'raw' ? '&lt;/&gt; Raw HTML' : '👁 Preview'}
              </button>
            ))}
          </div>

          {previewMode === 'raw' ? (
            <div className="relative">
              <pre className="bg-gray-950 border border-gray-800 rounded-2xl p-4 text-xs text-gray-300 font-mono overflow-auto max-h-[600px] whitespace-pre-wrap break-words">
                {output || <span className="text-gray-600 animate-pulse">Streaming output...</span>}
              </pre>
              {output && (
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="absolute top-3 right-3 text-xs text-gray-500 hover:text-gray-300 bg-gray-900 border border-gray-700 px-3 py-1 rounded-lg transition"
                >
                  Salin
                </button>
              )}
            </div>
          ) : (
            <div className="border border-gray-700 rounded-2xl overflow-hidden bg-white">
              <iframe
                ref={iframeRef}
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-[700px]"
                title="Sandbox Preview"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AiBrainTabs({
  model, maxTokens, systemPrompt, defaultSystemPrompt, isPromptCustomised,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('⚙️ LM Config')

  return (
    <div>
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-2xl p-1 mb-6 w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition ${
              activeTab === tab
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === '⚙️ LM Config'     && <LMConfigTab model={model} maxTokens={maxTokens} />}
      {activeTab === '📝 System Prompt' && (
        <SystemPromptTab
          systemPrompt={systemPrompt}
          defaultSystemPrompt={defaultSystemPrompt}
          isPromptCustomised={isPromptCustomised}
        />
      )}
      {activeTab === '🧪 Sandbox'       && <SandboxTab currentSystemPrompt={systemPrompt} />}
    </div>
  )
}
