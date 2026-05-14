'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteInvitationButton({ id }: { id: string }) {
  const router   = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      router.refresh()
    } catch {
      alert('Gagal menghapus undangan')
      setLoading(false)
      setConfirm(false)
    }
  }

  if (confirm) {
    return (
      <span className="flex items-center gap-1">
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-gray-400 hover:text-gray-600 font-medium">
          Batal
        </button>
        <span className="text-gray-200">|</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-500 hover:text-red-700 font-semibold disabled:opacity-60">
          {loading ? 'Menghapus...' : 'Yakin Hapus?'}
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-gray-400 hover:text-red-500 font-medium transition"
      title="Hapus undangan">
      🗑️
    </button>
  )
}
