import { NextResponse }              from 'next/server'
import { z }                         from 'zod'
import { auth }                      from '@/lib/auth'
import { anthropic }                  from '@/lib/claude'
import { buildUserPrompt, type MediaAssets } from '@/lib/prompt'
import { getSystemPrompt, getAIModel, getAIMaxTokens } from '@/lib/config'
import { db }                        from '@/lib/db'
import { detectProgress }            from '@/lib/generate-progress'
import type { InvitationParams, InvitationJenis } from '@/types'

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const invitation = await db.invitation.findUnique({
    where:  { id },
    select: { userId: true },
  })
  if (!invitation)
    return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
  if (invitation.userId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.invitation.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

const FREE_EDIT_LIMIT = 3

const JENIS = ['nikah','khitan','walimah_safar','pengajian','wisuda','gathering','ulang_tahun','aqiqah','umum'] as const
const dataUrlOpt = z.string().startsWith('data:').optional()

const schema = z.object({
  jenis:              z.enum(JENIS).optional(),
  topik:              z.string().min(3),
  isiAcara:           z.string().min(10),
  mode:               z.enum(['Light', 'Dark', 'Auto']),
  gaya:               z.string().min(2),
  warna:              z.string().min(2),
  tipografi:          z.string().min(2),
  layout:             z.string().min(2),
  background:         z.string().min(2),
  dekorasi:           z.string(),
  medsos:             z.string(),
  instruksiTambahan:  z.string(),
  story:              z.string().optional(),
  dompetDigital:      z.string().optional(),
  acaraKedua:         z.string().optional(),
  fotoCover:          dataUrlOpt,
  fotoMempelaiPria:   dataUrlOpt,
  fotoMempelaiWanita: dataUrlOpt,
  fotoPerson:         dataUrlOpt,
  bgCover:            dataUrlOpt,
  audioUrl:           dataUrlOpt,
  fotoGaleri:         z.array(z.string().startsWith('data:')).max(5).optional(),
})

function injectPhotoSrc(html: string, photoType: string, dataUrl: string): string {
  return html
    .replace(new RegExp(`(<img\\b(?=[^>]*\\bdata-photo="${photoType}")[^>]*)\\bsrc="[^"]*"`, 'gi'), `$1src="${dataUrl}"`)
    .replace(new RegExp(`(<img\\b[^>]*\\bsrc=")[^"]*("[^>]*\\bdata-photo="${photoType}")`, 'gi'), `$1${dataUrl}$2`)
}

function injectMedia(html: string, media: MediaAssets & { audioUrl?: string; fotoGaleri?: string[] }): string {
  let out = html
  if (media.fotoCover)          out = injectPhotoSrc(out, 'cover', media.fotoCover)
  if (media.fotoMempelaiPria)   out = injectPhotoSrc(out, 'groom', media.fotoMempelaiPria)
  if (media.fotoMempelaiWanita) out = injectPhotoSrc(out, 'bride', media.fotoMempelaiWanita)
  if (media.fotoPerson)         out = injectPhotoSrc(out, 'person', media.fotoPerson)
  if (media.bgCover)            out = injectPhotoSrc(out, 'bg-cover', media.bgCover)
  if (media.fotoGaleri)         media.fotoGaleri.forEach((url, i) => { out = injectPhotoSrc(out, `gallery-${i + 1}`, url) })
  if (media.audioUrl)           out = out.replace(/src="__AUDIO__"/gi, `src="${media.audioUrl}"`)
  return out
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify ownership and get current editCount
  const existing = await db.invitation.findUnique({
    where:  { id },
    select: { userId: true, slug: true, editCount: true },
  })
  if (!existing)
    return NextResponse.json({ error: 'Undangan tidak ditemukan' }, { status: 404 })
  if (existing.userId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const isFreeEdit = existing.editCount < FREE_EDIT_LIMIT

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user)
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

  // Require credits if free edit limit exhausted
  if (!isFreeEdit && user.credits < 1)
    return NextResponse.json({ error: 'Kredit tidak cukup. Edit ke-4 dan seterusnya membutuhkan 1 kredit.' }, { status: 402 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Parameter tidak valid', detail: parsed.error.flatten() }, { status: 400 })

  const { fotoCover, fotoMempelaiPria, fotoMempelaiWanita, fotoPerson, bgCover, audioUrl, fotoGaleri, ...invParams } = parsed.data
  const media: MediaAssets & { audioUrl?: string; fotoGaleri?: string[] } = {
    fotoCover, fotoMempelaiPria, fotoMempelaiWanita, fotoPerson, bgCover, audioUrl, fotoGaleri,
    hasAudio: !!audioUrl,
  }
  const typedParams = { ...invParams, jenis: (invParams.jenis ?? 'umum') as InvitationJenis } as InvitationParams

  // Stream SSE back to client
  const encoder  = new TextEncoder()
  const sseStream = new TransformStream()
  const writer   = sseStream.writable.getWriter()
  const send     = (chunk: string) => writer.write(encoder.encode(chunk))

  ;(async () => {
    try {
      await send(`data: ${JSON.stringify({ status: 'generating', phase: '🤖 AI sedang merancang undangan...', percent: 3 })}\n\n`)

      let accumulated = ''
      let lastPercent = 3

      const [systemPrompt, model, maxTokens] = await Promise.all([
        getSystemPrompt(), getAIModel(), getAIMaxTokens(),
      ])

      const aiStream = anthropic.messages.stream({
        model,
        max_tokens: maxTokens,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: buildUserPrompt(typedParams, media) }],
      })

      aiStream.on('text', (text) => {
        accumulated += text
        const progress = detectProgress(accumulated)
        if (progress.percent > lastPercent) {
          lastPercent = progress.percent
          void send(`data: ${JSON.stringify({ status: 'progress', phase: progress.label, percent: progress.percent })}\n\n`)
        }
      })

      const raw          = (await aiStream.finalText()).trim()
      const finalMsg     = await aiStream.finalMessage()
      const inputTokens  = finalMsg.usage.input_tokens
      const outputTokens = finalMsg.usage.output_tokens

      if (finalMsg.stop_reason === 'max_tokens')
        throw new Error('HTML undangan terlalu panjang — coba kurangi detail atau gunakan gaya lebih sederhana')

      const html = raw
        .replace(/^```(?:html)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim()

      if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html'))
        throw new Error('Output tidak valid dari AI')
      if (!html.includes('</html>'))
        throw new Error('HTML undangan tidak lengkap — coba lagi atau kurangi kompleksitas desain')

      const finalHtml = injectMedia(html, media)

      await send(`data: ${JSON.stringify({ status: 'progress', phase: '💾 Menyimpan undangan ke database...', percent: 97 })}\n\n`)

      // If limit exceeded: deduct credit. Otherwise: increment editCount for free.
      const invUpdate = {
        html:         finalHtml,
        params:       typedParams as unknown as Record<string, string>,
        title:        typedParams.topik,
        editCount:    { increment: 1 },
        tokensInput:  { increment: inputTokens },
        tokensOutput: { increment: outputTokens },
      }

      if (isFreeEdit) {
        await db.invitation.update({ where: { id }, data: invUpdate })
      } else {
        await db.$transaction([
          db.user.update({ where: { id: user.id }, data: { credits: { decrement: 1 } } }),
          db.invitation.update({ where: { id }, data: invUpdate }),
        ])
      }

      await send(`data: ${JSON.stringify({ status: 'done', slug: existing.slug, id })}\n\n`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      await send(`data: ${JSON.stringify({ status: 'error', message: msg })}\n\n`)
    } finally {
      await writer.close()
    }
  })()

  return new Response(sseStream.readable, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection:      'keep-alive',
    },
  })
}
