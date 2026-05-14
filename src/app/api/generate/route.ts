import { NextResponse }              from 'next/server'
import { z }                         from 'zod'
import { nanoid }                    from 'nanoid'
import { auth }                      from '@/lib/auth'
import { anthropic, MODELS }         from '@/lib/claude'
import { SYSTEM_PROMPT, buildUserPrompt, type MediaAssets } from '@/lib/prompt'
import { db }                        from '@/lib/db'
import { generateSlug }              from '@/lib/utils'
import { detectProgress }            from '@/lib/generate-progress'
import type { InvitationParams }     from '@/types'

const dataUrlOpt = z.string().startsWith('data:').optional()

const JENIS = ['nikah','khitan','walimah_safar','pengajian','wisuda','gathering','ulang_tahun','aqiqah','umum'] as const

const schema = z.object({
  jenis:              z.enum(JENIS),
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
  // media — not stored in params, used only during generation
  fotoCover:          dataUrlOpt,
  fotoMempelaiPria:   dataUrlOpt,
  fotoMempelaiWanita: dataUrlOpt,
  fotoPerson:         dataUrlOpt,
  bgCover:            dataUrlOpt,
  audioUrl:           dataUrlOpt,
  fotoGaleri:         z.array(z.string().startsWith('data:')).max(5).optional(),
})

function injectPhotoSrc(html: string, photoType: string, dataUrl: string): string {
  // handles both attribute orderings: data-photo before src, and src before data-photo
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

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.credits < 1)
    return NextResponse.json({ error: 'Kredit tidak cukup' }, { status: 402 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Parameter tidak valid', detail: parsed.error.flatten() }, { status: 400 })

  const { fotoCover, fotoMempelaiPria, fotoMempelaiWanita, fotoPerson, bgCover, audioUrl, fotoGaleri, ...params } = parsed.data
  const media: MediaAssets & { audioUrl?: string; fotoGaleri?: string[] } = {
    fotoCover, fotoMempelaiPria, fotoMempelaiWanita, fotoPerson, bgCover, audioUrl, fotoGaleri,
    hasAudio: !!audioUrl,
  }

  // Stream response back to client for real-time progress
  const encoder = new TextEncoder()
  const stream  = new TransformStream()
  const writer  = stream.writable.getWriter()

  const send = (chunk: string) => writer.write(encoder.encode(chunk))

  ;(async () => {
    try {
      await send('data: {"status":"generating","phase":"🤖 AI sedang merancang undangan...","percent":3}\n\n')

      let accumulated = ''
      let lastPercent = 3

      const aiStream = anthropic.messages.stream({
        model:      MODELS.generate,
        max_tokens: 32000,
        system: [
          {
            type:          'text',
            text:          SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: buildUserPrompt(params as InvitationParams, media) }],
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
      // Strip markdown code fences if the provider wraps output (e.g. ```html ... ```)
      const html = raw
        .replace(/^```(?:html)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim()

      if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html'))
        throw new Error('Output tidak valid dari AI')
      if (!html.includes('</html>'))
        throw new Error('HTML undangan tidak lengkap — coba lagi atau kurangi kompleksitas desain')

      // Inject uploaded photos & audio into the generated HTML
      const finalHtml = injectMedia(html, media)

      await send(`data: ${JSON.stringify({ status: 'progress', phase: '💾 Menyimpan undangan ke database...', percent: 97 })}\n\n`)

      // Deduct credit & save invitation atomically (strip media data from stored params)
      const slug       = `${generateSlug(params.topik)}-${nanoid(6)}`
      const invitation = await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data:  { credits: { decrement: 1 } },
        })
        return tx.invitation.create({
          data: {
            slug,
            userId:      user.id,
            title:       params.topik,
            params:      params as unknown as Record<string, string>,
            html:        finalHtml,
            status:      'PUBLISHED',
            tokensInput:  inputTokens,
            tokensOutput: outputTokens,
          },
        })
      }, {
        maxWait: 5000,
        timeout: 10000,
      }) as { slug: string; id: string }

      await send(
        `data: ${JSON.stringify({ status: 'done', slug: invitation.slug, id: invitation.id })}\n\n`
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      await send(`data: ${JSON.stringify({ status: 'error', message: msg })}\n\n`)
    } finally {
      await writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection:      'keep-alive',
    },
  })
}
