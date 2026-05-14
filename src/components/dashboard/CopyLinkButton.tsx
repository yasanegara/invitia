'use client'

import { useState } from 'react'

export default function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/u/${slug}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: prompt
      prompt('Salin link berikut:', `${window.location.origin}/u/${slug}`)
    }
  }

  return (
    <button
      onClick={copy}
      title="Salin link undangan"
      className="text-xs text-gray-400 hover:text-gray-600 font-medium transition"
    >
      {copied ? '✓' : '📋'}
    </button>
  )
}
