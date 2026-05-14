'use server'

import { auth }       from '@/lib/auth'
import { setConfig }  from '@/lib/config'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')
}

export async function saveAIConfig(formData: FormData) {
  await requireAdmin()
  const model     = (formData.get('model')     as string)?.trim()
  const maxTokens = (formData.get('maxTokens') as string)?.trim()
  await Promise.all([
    model     ? setConfig('ai_model',      model)     : Promise.resolve(),
    maxTokens ? setConfig('ai_max_tokens', maxTokens) : Promise.resolve(),
  ])
  revalidatePath('/admin/ai-brain')
}

export async function saveSystemPrompt(formData: FormData) {
  await requireAdmin()
  const prompt = (formData.get('systemPrompt') as string)?.trim()
  if (!prompt) throw new Error('System prompt tidak boleh kosong')
  await setConfig('ai_system_prompt', prompt)
  revalidatePath('/admin/ai-brain')
}

export async function resetSystemPrompt() {
  await requireAdmin()
  const { db } = await import('@/lib/db')
  await db.appConfig.deleteMany({ where: { key: 'ai_system_prompt' } })
  revalidatePath('/admin/ai-brain')
}
