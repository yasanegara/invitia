'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  id:     string
  status: string
}

export default function PublishToggle({ id, status }: Props) {
  const router  = useRouter()
  const [current, setCurrent] = useState(status)
  const [loading, setLoading] = useState(false)

  const isPublished = current === 'PUBLISHED'
  const isArchived  = current === 'ARCHIVED'

  const toggle = async () => {
    if (isArchived) return
    const next = isPublished ? 'DRAFT' : 'PUBLISHED'
    const prev = current
    setCurrent(next)
    setLoading(true)
    try {
      const res = await fetch(`/api/invitations/${id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setCurrent(prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading || isArchived}
      title={isPublished ? 'Klik untuk jadikan draft' : isArchived ? 'Terarsip' : 'Klik untuk publikasikan'}
      className={`text-xs px-2 py-0.5 rounded-full font-medium transition disabled:cursor-not-allowed ${
        current === 'PUBLISHED'
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : current === 'DRAFT'
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          : 'bg-red-100 text-red-500 cursor-default'
      }`}
    >
      {loading ? '...' : current === 'PUBLISHED' ? 'Aktif' : current === 'DRAFT' ? 'Draft' : 'Arsip'}
    </button>
  )
}
