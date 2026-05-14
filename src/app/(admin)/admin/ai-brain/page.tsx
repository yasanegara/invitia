import { getConfig, getSystemPrompt, TOKEN_PRICE_DEFAULTS } from '@/lib/config'
import { SYSTEM_PROMPT } from '@/lib/prompt'
import AiBrainTabs from './AiBrainTabs'

export default async function AiBrainPage() {
  const [model, maxTokensStr, storedPrompt] = await Promise.all([
    getConfig('ai_model',      process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'),
    getConfig('ai_max_tokens', '32000'),
    getSystemPrompt(),
  ])

  const isPromptCustomised = storedPrompt !== SYSTEM_PROMPT

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Brain</h1>
        <p className="text-gray-400 text-sm mt-0.5">Konfigurasi LM, system prompt, dan sandbox untuk testing</p>
      </div>

      <AiBrainTabs
        model={model}
        maxTokens={parseInt(maxTokensStr, 10) || 32000}
        systemPrompt={storedPrompt}
        defaultSystemPrompt={SYSTEM_PROMPT}
        isPromptCustomised={isPromptCustomised}
      />
    </div>
  )
}
