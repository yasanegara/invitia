import { NextResponse }                         from 'next/server'
import { auth }                                  from '@/lib/auth'
import { anthropic }                             from '@/lib/claude'
import { getSystemPrompt, getAIModel, getAIMaxTokens } from '@/lib/config'

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userPrompt, systemPrompt: customSystem } = await req.json()
  if (!userPrompt?.trim())
    return NextResponse.json({ error: 'userPrompt wajib diisi' }, { status: 400 })

  const [systemPrompt, model, maxTokens] = await Promise.all([
    customSystem?.trim() ? Promise.resolve(customSystem.trim()) : getSystemPrompt(),
    getAIModel(),
    getAIMaxTokens(),
  ])

  const encoder = new TextEncoder()
  const stream  = new TransformStream()
  const writer  = stream.writable.getWriter()

  ;(async () => {
    try {
      const aiStream = anthropic.messages.stream({
        model,
        max_tokens: maxTokens,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: userPrompt }],
      })

      aiStream.on('text', async (text) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`))
      })

      const finalMsg     = await aiStream.finalMessage()
      const inputTokens  = finalMsg.usage.input_tokens
      const outputTokens = finalMsg.usage.output_tokens

      await writer.write(encoder.encode(
        `data: ${JSON.stringify({ type: 'done', inputTokens, outputTokens, model, stopReason: finalMsg.stop_reason })}\n\n`
      ))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error tidak diketahui'
      await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`))
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
