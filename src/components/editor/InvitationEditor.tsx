'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { InvitationParams } from '@/types'

// ── Section metadata ─────────────────────────────────────────────────────────
const SECTION_LABELS: Record<string, string> = {
  cover:      '🎭 Cover',
  hero:       '💫 Hero',
  profil:     '👤 Profil',
  akad:       '📿 Akad',
  resepsi:    '🥂 Resepsi',
  lokasi:     '📍 Lokasi',
  galeri:     '🖼️ Galeri',
  rsvp:       '📝 RSVP',
  footer:     '🔚 Footer',
  detail:     '📋 Detail',
  ucapan:     '💬 Ucapan',
  agenda:     '📅 Agenda',
  penceramah: '🎙️ Penceramah',
  doa:        '🤲 Doa',
  pelepasan:  '✈️ Pelepasan',
  upacara:    '🎓 Upacara',
  syukuran:   '🎊 Syukuran',
  wishes:     '💌 Wishes',
}

interface MapLink { index: number; href: string; kind: 'a' | 'iframe' }

function extractMapLinks(html: string): MapLink[] {
  const links: MapLink[] = []
  let aIdx = 0, ifrIdx = 0
  for (const m of html.matchAll(/<a\b[^>]+href=["']([^"']*(?:maps\.google|goo\.gl\/maps|maps\.app)[^"']*)["'][^>]*>/gi))
    links.push({ index: aIdx++, href: m[1], kind: 'a' })
  for (const m of html.matchAll(/<iframe\b[^>]+src=["']([^"']*google\.com\/maps\/embed[^"']*)["'][^>]*>/gi))
    links.push({ index: ifrIdx++, href: m[1], kind: 'iframe' })
  return links
}

function extractSections(html: string): { id: string; label: string }[] {
  const seen = new Set<string>()
  return [...html.matchAll(/data-section=["']([^"']+)["']/gi)]
    .map(m => m[1])
    .filter(id => { if (seen.has(id)) return false; seen.add(id); return true })
    .map(id => ({ id, label: SECTION_LABELS[id] ?? id }))
}

// Script injected into iframe to enable live editing
const EDITOR_SCRIPT = `
<script id="__inv_editor__">
(function(){
  var editing = false;
  var clickHandler = null;

  function markEditables() {
    var TAGS = 'p,h1,h2,h3,h4,h5,h6,span,li,td,th,label,button,a';
    document.querySelectorAll(TAGS).forEach(function(el) {
      if(el.id === '__inv_editor__') return;
      if(el.closest('script,style,noscript')) return;
      if(el.querySelector('img,svg,canvas,video,audio,iframe,input,select,textarea')) return;
      if(el.textContent.trim().length === 0) return;
      el.setAttribute('data-inv-editable','1');
    });
  }

  function clearEditables() {
    document.querySelectorAll('[data-inv-editable]').forEach(function(el){
      el.removeAttribute('data-inv-editable');
    });
    document.querySelectorAll('[contenteditable]').forEach(function(el){
      el.removeAttribute('contenteditable');
    });
  }

  window.addEventListener('message', function(e){
    var d = e.data;
    if(!d || !d.type) return;

    if(d.type === 'enableEdit'){
      editing = true;
      document.body.spellcheck = false;
      markEditables();
      var s = document.createElement('style');
      s.id = '__edit_style__';
      s.textContent =
        '[contenteditable="true"]{outline:none!important}'
        + '[data-inv-editable]:hover{outline:2px dashed rgba(245,158,11,.6)!important;outline-offset:2px!important;cursor:text!important}'
        + '[contenteditable="true"]{outline:2px solid #f59e0b!important;outline-offset:2px!important;background:rgba(245,158,11,.05)!important}';
      document.head.appendChild(s);

      clickHandler = function(ev) {
        var el = ev.target.closest('[data-inv-editable]');
        var secEl = ev.target.closest('[data-section]');
        window.parent.postMessage({ type: 'activeSection', section: secEl ? secEl.getAttribute('data-section') : null }, '*');
        if(!el) {
          var active = document.querySelector('[contenteditable="true"]');
          if(active) { active.contentEditable = 'false'; active.removeAttribute('contenteditable'); }
          return;
        }
        var prev = document.querySelector('[contenteditable="true"]');
        if(prev && prev !== el) { prev.contentEditable = 'false'; prev.removeAttribute('contenteditable'); }
        el.contentEditable = 'true';
        el.focus();
        ev.stopPropagation();
      };
      document.addEventListener('click', clickHandler, true);
    }

    if(d.type === 'disableEdit'){
      editing = false;
      if(clickHandler) { document.removeEventListener('click', clickHandler, true); clickHandler = null; }
      clearEditables();
      var styleEl = document.getElementById('__edit_style__');
      if(styleEl) styleEl.remove();
    }

    if(d.type === 'extract'){
      if(clickHandler) { document.removeEventListener('click', clickHandler, true); clickHandler = null; }
      clearEditables();
      document.querySelectorAll('[data-section]').forEach(function(el){
        el.style.outline = ''; el.style.outlineOffset = '';
      });
      var inj = document.getElementById('__inv_editor__');
      if(inj) inj.remove();
      var es = document.getElementById('__edit_style__');
      if(es) es.remove();
      window.parent.postMessage({
        type: 'extracted',
        html: '<!DOCTYPE html>\\n' + document.documentElement.outerHTML
      }, '*');
    }

    if(d.type === 'replaceImg'){
      var imgs = document.querySelectorAll('img');
      if(imgs[d.index]) imgs[d.index].src = d.url;
    }

    if(d.type === 'injectCss'){
      var injEl = document.getElementById('__injected_style__');
      if(!injEl){ injEl = document.createElement('style'); injEl.id='__injected_style__'; document.head.appendChild(injEl); }
      injEl.textContent = d.css;
    }

    if(d.type === 'toggleSection'){
      var toggleEl = document.getElementById(d.sectionId);
      if(toggleEl) toggleEl.style.display = toggleEl.style.display === 'none' ? '' : 'none';
    }

    if(d.type === 'replaceMapLink'){
      if(d.kind === 'a'){
        var aLinks = Array.from(document.querySelectorAll('a')).filter(function(a){
          return a.href && (a.href.indexOf('maps.google') !== -1 || a.href.indexOf('goo.gl/maps') !== -1 || a.href.indexOf('maps.app') !== -1);
        });
        if(aLinks[d.index]) aLinks[d.index].href = d.href;
      } else if(d.kind === 'iframe'){
        var ifrLinks = Array.from(document.querySelectorAll('iframe')).filter(function(f){
          return f.src && f.src.indexOf('google.com/maps/embed') !== -1;
        });
        if(ifrLinks[d.index]) ifrLinks[d.index].src = d.href;
      }
    }

    if(d.type === 'scrollToSection'){
      var secTarget = document.querySelector('[data-section="' + d.sectionId + '"]');
      if(secTarget) secTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if(d.type === 'highlightSection'){
      document.querySelectorAll('[data-section]').forEach(function(el){
        el.style.outline = ''; el.style.outlineOffset = '';
      });
      if(d.sectionId){
        var secHL = document.querySelector('[data-section="' + d.sectionId + '"]');
        if(secHL){ secHL.style.outline = '2px dashed rgba(245,158,11,0.6)'; secHL.style.outlineOffset = '4px'; }
      }
    }
  });
})();
<\/script>
`

interface ImgEntry { index: number; src: string; label: string }
interface RsvpEntry { id: string; name: string; guestCount: number; attending: boolean; message?: string | null; createdAt: string }

const PHOTO_LABELS: Record<string, string> = {
  cover:   '📸 Cover',
  bride:   '👰 Pengantin Wanita',
  groom:   '🤵 Pengantin Pria',
}

function photoLabel(tag: string, arrIdx: number): string {
  if (tag.startsWith('gallery-')) return `🖼️ Galeri ${tag.split('-')[1]}`
  return PHOTO_LABELS[tag] ?? (arrIdx === 0 ? '📸 Cover' : `Foto ${arrIdx + 1}`)
}

function extractImgs(html: string): ImgEntry[] {
  const matches = [...html.matchAll(/<img([^>]+)>/gi)]
  return matches
    .map((m, i) => {
      const srcMatch   = m[1].match(/src=["']([^"']+)["']/)
      const photoMatch = m[1].match(/data-photo=["']([^"']+)["']/)
      if (!srcMatch) return null
      return { index: i, src: srcMatch[1], label: photoLabel(photoMatch?.[1] ?? '', i) }
    })
    .filter((x): x is ImgEntry => x !== null)
}

type Tab     = 'text' | 'photo' | 'background' | 'rsvp' | 'regen' | 'settings'
type ImgMode = 'upload' | 'url'

const BG_PRESETS = [
  { label: 'Putih',            css: 'body,html{background:#ffffff!important}' },
  { label: 'Krem Hangat',      css: 'body,html{background:#fdf8f0!important}' },
  { label: 'Dusty Rose',       css: 'body,html{background:linear-gradient(135deg,#f8e8e8,#fdf0e8)!important}' },
  { label: 'Sage Green',       css: 'body,html{background:linear-gradient(135deg,#e8f0e8,#f0f8f0)!important}' },
  { label: 'Lavender',         css: 'body,html{background:linear-gradient(135deg,#ede8f8,#f8e8f4)!important}' },
  { label: 'Malam Gelap',      css: 'body,html{background:#0f0f0f!important}' },
  { label: 'Navy',             css: 'body,html{background:linear-gradient(135deg,#0f1b2d,#1a2e4a)!important}' },
  { label: 'Gold Mewah',       css: 'body,html{background:linear-gradient(135deg,#1a1200,#2d2000)!important}' },
]

const FREE_EDIT_LIMIT = 3

interface Props {
  invitationId: string
  slug:         string
  html:         string
  savedParams:  InvitationParams
  editCount:    number
  status:       'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

export default function InvitationEditor({ invitationId, slug, html, savedParams, editCount, status }: Props) {
  const router     = useRouter()
  const iframeRef  = useRef<HTMLIFrameElement>(null)
  const [tab,      setTab]      = useState<Tab>('text')
  const [editMode, setEditMode] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [imgs,     setImgs]     = useState<ImgEntry[]>(() => extractImgs(html))
  const [imgUrls,  setImgUrls]  = useState<Record<number, string>>({})
  const [activeBg, setActiveBg] = useState<string | null>(null)
  const [customBg, setCustomBg] = useState('')
  const [imgModes, setImgModes] = useState<Record<number, ImgMode>>({})

  // Maps, sections, active section
  const [mapLinks]      = useState<MapLink[]>(() => extractMapLinks(html))
  const [mapLinkUrls,   setMapLinkUrls]   = useState<Record<string, string>>({})
  const [sections]      = useState<{ id: string; label: string }[]>(() => extractSections(html))
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // RSVP tab
  const [rsvps,       setRsvps]       = useState<RsvpEntry[]>([])
  const [rsvpLoading, setRsvpLoading] = useState(false)

  // Settings tab
  const [currentSlug,    setCurrentSlug]    = useState(slug)
  const [newSlug,        setNewSlug]        = useState(slug)
  const [slugSaving,     setSlugSaving]     = useState(false)
  const [slugMsg,        setSlugMsg]        = useState<{ ok: boolean; text: string } | null>(null)
  const [deleting,       setDeleting]       = useState(false)
  const [confirmDel,     setConfirmDel]     = useState(false)
  const [currentStatus,  setCurrentStatus]  = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>(status)
  const [statusSaving,   setStatusSaving]   = useState(false)
  const [copiedLink,     setCopiedLink]     = useState(false)
  const [origin,         setOrigin]         = useState('')

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const srcDoc = html.replace('</head>', EDITOR_SCRIPT + '</head>')

  const postMsg = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*')
  }, [])

  // Listen for messages from iframe
  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      const data = e.data
      if (!data?.type) return

      if (data.type === 'activeSection') {
        setActiveSection(data.section as string | null)
        return
      }

      if (data.type !== 'extracted') return
      const modifiedHtml = data.html as string
      setSaving(true)
      try {
        const res = await fetch(`/api/invitations/${invitationId}/html`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ html: modifiedHtml }),
        })
        if (!res.ok) throw new Error('Gagal menyimpan')
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error')
      } finally {
        setSaving(false)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [invitationId])

  // Load RSVPs when RSVP tab opens
  const handleStatusToggle = async () => {
    const next = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    const prev = currentStatus
    setCurrentStatus(next)
    setStatusSaving(true)
    try {
      const res = await fetch(`/api/invitations/${invitationId}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setCurrentStatus(prev)
    } finally {
      setStatusSaving(false)
    }
  }

  const copyShareLink = async () => {
    const url = `${origin}/u/${currentSlug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      prompt('Salin link berikut:', url)
    }
  }

  const exportCsv = () => {
    const headers = ['Nama', 'Kehadiran', 'Jumlah Tamu', 'Pesan', 'Waktu']
    const rows = rsvps.map(r => [
      r.name,
      r.attending ? 'Hadir' : 'Tidak Hadir',
      String(r.guestCount),
      r.message ?? '',
      new Date(r.createdAt).toLocaleString('id-ID'),
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `rsvp-${invitationId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const refreshRsvps = useCallback(() => {
    setRsvpLoading(true)
    fetch(`/api/invitations/${invitationId}/rsvp`)
      .then(r => r.json())
      .then((data: RsvpEntry[]) => { setRsvps(data); setRsvpLoading(false) })
      .catch(() => setRsvpLoading(false))
  }, [invitationId])

  useEffect(() => {
    if (tab === 'rsvp') refreshRsvps()
  }, [tab, refreshRsvps])

  const toggleEdit = () => {
    if (editMode) {
      postMsg({ type: 'disableEdit' })
      setEditMode(false)
      setActiveSection(null)
    } else {
      postMsg({ type: 'enableEdit' })
      setEditMode(true)
    }
  }

  const applyImgReplace = (index: number) => {
    const url = imgUrls[index]
    if (!url) return
    postMsg({ type: 'replaceImg', index, url })
  }

  const handleFileUpload = (index: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setImgUrls(p => ({ ...p, [index]: dataUrl }))
      postMsg({ type: 'replaceImg', index, url: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  const applyBg = (css: string, label: string) => {
    postMsg({ type: 'injectCss', css })
    setActiveBg(label)
  }

  const applyCustomBg = () => {
    if (!customBg) return
    const css = `body,html{background:${customBg}!important}`
    postMsg({ type: 'injectCss', css })
    setActiveBg('Custom')
  }

  const handleSave = () => postMsg({ type: 'extract' })

  const handleSlugSave = async () => {
    const trimmed = newSlug.trim().toLowerCase()
    if (trimmed === currentSlug) return
    setSlugSaving(true)
    setSlugMsg(null)
    try {
      const res = await fetch(`/api/invitations/${invitationId}/slug`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ slug: trimmed }),
      })
      const data = await res.json() as { ok?: boolean; slug?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Gagal menyimpan')
      setCurrentSlug(data.slug!)
      setNewSlug(data.slug!)
      setSlugMsg({ ok: true, text: 'Slug berhasil diperbarui!' })
    } catch (err) {
      setSlugMsg({ ok: false, text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setSlugSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return }
    setDeleting(true)
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      router.push('/dashboard')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
      setDeleting(false)
      setConfirmDel(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col">

        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 text-sm">← Dashboard</Link>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              currentStatus === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {currentStatus === 'PUBLISHED' ? '● Aktif' : '○ Draft'}
            </span>
            {currentStatus === 'PUBLISHED' && (
              <a href={`/u/${currentSlug}`} target="_blank"
                className="text-xs text-amber-600 font-semibold hover:underline">
                Lihat →
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 text-xs font-semibold">
          {([
            ['text',       '✏️ Teks'],
            ['photo',      '🖼️ Foto'],
            ['background', '🎨 BG'],
            ['rsvp',       '📋 RSVP'],
            ['regen',      '🔄'],
            ['settings',   '⚙️'],
          ] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 transition ${tab === t ? 'border-b-2 border-amber-500 text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* ── TEXT TAB ── */}
          {tab === 'text' && (
            <div className="space-y-4">

              {/* Edit mode toggle */}
              <button onClick={toggleEdit}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
                  editMode
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}>
                {editMode ? '✏️ Edit Mode ON — klik teks' : 'Aktifkan Edit Mode'}
              </button>

              {/* Active section indicator */}
              {editMode && (
                <div className={`rounded-lg px-3 py-2 text-xs border ${
                  activeSection
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  {activeSection
                    ? <><strong>{SECTION_LABELS[activeSection] ?? activeSection}</strong> — klik teks untuk edit</>
                    : 'Klik teks di preview untuk mengedit.'}
                </div>
              )}

              {/* Section navigator */}
              {sections.length > 0 && (
                <div className="space-y-1 pt-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Navigasi Section
                  </p>
                  {sections.map(s => (
                    <button key={s.id}
                      onClick={() => {
                        postMsg({ type: 'scrollToSection', sectionId: s.id })
                        postMsg({ type: 'highlightSection', sectionId: s.id })
                      }}
                      className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition ${
                        activeSection === s.id
                          ? 'bg-amber-100 text-amber-700 font-semibold'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Google Maps link editor */}
              {mapLinks.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    🗺️ Link Google Maps
                  </p>
                  {mapLinks.map(ml => {
                    const key = `${ml.kind}-${ml.index}`
                    const currentVal = mapLinkUrls[key] ?? ml.href
                    return (
                      <div key={key} className="space-y-1.5">
                        <p className="text-xs font-medium text-gray-600">
                          {ml.kind === 'iframe'
                            ? `Peta Embed ${ml.index + 1}`
                            : `Tombol Maps ${ml.index + 1}`}
                        </p>
                        <input
                          value={currentVal}
                          onChange={e => setMapLinkUrls(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-400"
                          placeholder="https://maps.google.com/..."
                        />
                        <button
                          onClick={() => postMsg({ type: 'replaceMapLink', kind: ml.kind, index: ml.index, href: currentVal })}
                          disabled={!currentVal}
                          className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-xs font-semibold py-1.5 rounded-lg transition">
                          Terapkan
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* No maps / no sections hint */}
              {mapLinks.length === 0 && sections.length === 0 && !editMode && (
                <p className="text-xs text-gray-400 text-center py-4">
                  Aktifkan edit mode untuk mengedit teks, atau gunakan Regen untuk membuat ulang template.
                </p>
              )}
            </div>
          )}

          {/* ── PHOTO TAB ── */}
          {tab === 'photo' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Ganti foto di undangan via upload atau URL.</p>
              {imgs.length === 0 && (
                <div className="text-center py-6 space-y-2">
                  <p className="text-xs text-gray-400">Template ini tidak memiliki slot foto.</p>
                  <p className="text-xs text-gray-400">Gunakan tab <strong>Regen</strong> untuk membuat ulang dengan foto.</p>
                </div>
              )}
              {imgs.map((img) => {
                const mode = imgModes[img.index] ?? 'upload'
                const appliedUrl = imgUrls[img.index]
                return (
                  <div key={img.index} className="space-y-2 pb-4 border-b border-gray-100 last:border-0">
                    <p className="text-xs font-semibold text-gray-700">{img.label}</p>
                    <div className="w-full h-20 rounded-lg bg-gray-100 overflow-hidden">
                      <img src={appliedUrl ?? img.src} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                      {(['upload', 'url'] as ImgMode[]).map(m => (
                        <button key={m}
                          onClick={() => setImgModes(p => ({ ...p, [img.index]: m }))}
                          className={`flex-1 py-1 text-xs rounded-md font-medium transition ${
                            mode === m ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}>
                          {m === 'upload' ? '⬆️ Upload' : '🔗 URL'}
                        </button>
                      ))}
                    </div>
                    {mode === 'upload' ? (
                      <label
                        className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-lg py-4 cursor-pointer hover:border-amber-300 transition"
                        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-amber-400', 'bg-amber-50') }}
                        onDragLeave={e => { e.currentTarget.classList.remove('border-amber-400', 'bg-amber-50') }}
                        onDrop={e => {
                          e.preventDefault()
                          e.currentTarget.classList.remove('border-amber-400', 'bg-amber-50')
                          const f = e.dataTransfer.files?.[0]
                          if (f && f.type.startsWith('image/')) handleFileUpload(img.index, f)
                        }}
                      >
                        <span className="text-xs text-gray-500">Klik atau drag foto ke sini</span>
                        {appliedUrl?.startsWith('data:') && (
                          <span className="text-xs text-green-600 mt-1">✅ Foto diterapkan</span>
                        )}
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(img.index, f) }}
                        />
                      </label>
                    ) : (
                      <div className="space-y-2">
                        <input
                          placeholder="Paste URL foto..."
                          value={appliedUrl && !appliedUrl.startsWith('data:') ? appliedUrl : ''}
                          onChange={e => setImgUrls(p => ({ ...p, [img.index]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={() => applyImgReplace(img.index)}
                          disabled={!appliedUrl || appliedUrl.startsWith('data:')}
                          className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-xs font-semibold py-2 rounded-lg transition">
                          Terapkan
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── BACKGROUND TAB ── */}
          {tab === 'background' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Pilih tema background atau masukkan nilai CSS.</p>
              <div className="grid grid-cols-2 gap-2">
                {BG_PRESETS.map(p => (
                  <button key={p.label} onClick={() => applyBg(p.css, p.label)}
                    className={`py-2 text-xs rounded-lg border font-medium transition ${
                      activeBg === p.label
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Custom (warna / gradient CSS)</p>
                <input
                  placeholder="#fdf0e8 atau linear-gradient(...)"
                  value={customBg}
                  onChange={e => setCustomBg(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                />
                <button onClick={applyCustomBg} disabled={!customBg}
                  className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-xs font-semibold py-2 rounded-lg transition">
                  Terapkan
                </button>
              </div>
            </div>
          )}

          {/* ── RSVP TAB ── */}
          {tab === 'rsvp' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Respons tamu undangan.</p>
                <div className="flex items-center gap-3">
                  {rsvps.length > 0 && (
                    <button onClick={exportCsv}
                      className="text-xs text-gray-500 font-semibold hover:text-gray-700">
                      ⬇️ CSV
                    </button>
                  )}
                  <button onClick={refreshRsvps} disabled={rsvpLoading}
                    className="text-xs text-amber-600 font-semibold hover:underline disabled:opacity-50">
                    {rsvpLoading ? '...' : '↻ Muat Ulang'}
                  </button>
                </div>
              </div>

              {rsvpLoading ? (
                <div className="text-center py-10 text-gray-400 text-xs">Memuat...</div>
              ) : rsvps.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-xs font-medium">Belum ada respons</p>
                  <p className="text-xs mt-1 text-gray-400">Tamu yang mengisi RSVP akan muncul di sini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-600">{rsvps.length} respons</p>
                    <p className="text-xs text-gray-400">
                      ✅ {rsvps.filter(r => r.attending).length} &middot;
                      ❌ {rsvps.filter(r => !r.attending).length}
                    </p>
                  </div>
                  {rsvps.map(r => (
                    <div key={r.id} className={`rounded-xl p-3 border text-xs space-y-1 ${
                      r.attending ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-800">{r.name}</p>
                        <p className="text-gray-400 shrink-0">
                          {new Date(r.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <p className={`font-medium ${r.attending ? 'text-green-600' : 'text-red-500'}`}>
                        {r.attending ? `✅ Hadir · ${r.guestCount} orang` : '❌ Tidak hadir'}
                      </p>
                      {r.message && (
                        <p className="text-gray-500 italic">"{r.message}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REGEN TAB ── */}
          {tab === 'regen' && (() => {
            const freeLeft = Math.max(0, FREE_EDIT_LIMIT - editCount)
            const isFree   = freeLeft > 0
            return (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">
                  Edit ulang seluruh konten & gaya undangan dengan wizard.
                </p>

                <div className={`rounded-xl p-3 text-xs font-medium flex items-center gap-2 ${
                  isFree
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-amber-50 border border-amber-200 text-amber-700'
                }`}>
                  {isFree ? (
                    <>
                      <span className="text-base">🎁</span>
                      <span>
                        Sisa edit gratis: <strong>{freeLeft}/{FREE_EDIT_LIMIT}</strong>
                        {freeLeft === 1 && ' — tinggal 1 lagi!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">💳</span>
                      <span>Edit gratis habis — edit berikutnya memotong <strong>1 kredit</strong></span>
                    </>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500">
                  ℹ️ Perubahan manual yang belum disimpan akan hilang.
                </div>

                <Link href={`/undangan/${invitationId}/regen`}
                  className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-3 rounded-xl transition">
                  Edit dengan Wizard →
                </Link>
              </div>
            )
          })()}

          {/* ── SETTINGS TAB ── */}
          {tab === 'settings' && (
            <div className="space-y-6">

              {/* Status Publikasi */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">📢 Status</p>
                <div className={`rounded-xl p-3 text-xs border flex items-center justify-between ${
                  currentStatus === 'PUBLISHED'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div>
                    <p className={`font-semibold ${currentStatus === 'PUBLISHED' ? 'text-green-700' : 'text-gray-600'}`}>
                      {currentStatus === 'PUBLISHED' ? '● Aktif (Publik)' : '○ Draft (Privat)'}
                    </p>
                    <p className="text-gray-400 mt-0.5">
                      {currentStatus === 'PUBLISHED'
                        ? 'Bisa diakses siapapun'
                        : 'Hanya terlihat di editor'}
                    </p>
                  </div>
                  {currentStatus !== 'ARCHIVED' && (
                    <button
                      onClick={handleStatusToggle}
                      disabled={statusSaving}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-60 ${
                        currentStatus === 'PUBLISHED'
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {statusSaving ? '...' : currentStatus === 'PUBLISHED' ? 'Nonaktifkan' : 'Publikasikan'}
                    </button>
                  )}
                </div>
              </div>

              {/* Bagikan */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">🔗 Bagikan</p>
                {currentStatus !== 'PUBLISHED' ? (
                  <p className="text-xs text-gray-400">Publikasikan undangan untuk mendapatkan link & QR.</p>
                ) : (
                  <div className="space-y-3">
                    {origin && (
                      <div className="flex justify-center bg-white rounded-xl border p-3">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(origin + '/u/' + currentSlug)}&format=png&margin=2`}
                          alt="QR Code"
                          width={160}
                          height={160}
                          className="rounded"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-500 font-mono truncate flex-1">/u/{currentSlug}</span>
                      <button
                        onClick={copyShareLink}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-700 shrink-0"
                      >
                        {copiedLink ? '✓ Disalin' : 'Salin'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* Ganti Slug */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">🔗 Ganti Slug</p>
                <p className="text-xs text-gray-400">
                  URL undangan: <span className="font-mono text-gray-600">/u/{currentSlug}</span>
                </p>
                <input
                  value={newSlug}
                  onChange={e => {
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    setSlugMsg(null)
                  }}
                  placeholder="contoh: pernikahan-budi-ani"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-400"
                />
                <p className="text-xs text-gray-400">Hanya huruf kecil, angka, dan tanda hubung (-).</p>
                {slugMsg && (
                  <p className={`text-xs font-medium ${slugMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
                    {slugMsg.ok ? '✅' : '❌'} {slugMsg.text}
                  </p>
                )}
                <button
                  onClick={handleSlugSave}
                  disabled={slugSaving || newSlug.trim() === currentSlug || newSlug.trim().length < 3}
                  className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-xs font-semibold py-2 rounded-lg transition">
                  {slugSaving ? 'Menyimpan...' : 'Simpan Slug'}
                </button>
              </div>

              <div className="border-t border-gray-100" />

              {/* Hapus Undangan */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">⚠️ Zona Berbahaya</p>
                {confirmDel ? (
                  <div className="space-y-2">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                      Yakin hapus undangan ini? Semua data RSVP ikut terhapus dan <strong>tidak bisa dipulihkan</strong>.
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDel(false)}
                        className="flex-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition">
                        Batal
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-semibold py-2 rounded-lg transition">
                        {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleDelete}
                    className="w-full border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold py-2.5 rounded-lg transition">
                    🗑️ Hapus Undangan Ini
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Save button */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-sm">
            {saving ? 'Menyimpan...' : saved ? '✅ Tersimpan!' : 'Simpan Perubahan'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">Tanpa potongan kredit</p>
        </div>
      </aside>

      {/* ── Preview iframe ── */}
      <div className="flex-1 relative bg-gray-200">
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          className="w-full h-full border-0"
          title="Preview Undangan"
        />
        {editMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg pointer-events-none">
            ✏️ Edit Mode Aktif — klik teks untuk mengedit
          </div>
        )}
      </div>
    </div>
  )
}
