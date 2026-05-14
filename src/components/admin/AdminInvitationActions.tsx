'use client'

import { useState } from 'react'

interface Props {
  invitationId:  string
  currentStatus: string
}

export default function AdminInvitationActions({ invitationId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)

  const updateStatus = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/invitations/${invitationId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Gagal update')
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  const deleteInvitation = async () => {
    if (!confirm('Hapus undangan ini permanen?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/invitations/${invitationId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {currentStatus !== 'ARCHIVED' && (
        <button onClick={() => updateStatus('ARCHIVED')} disabled={loading}
          className="text-xs text-gray-500 hover:text-gray-300 bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-lg transition disabled:opacity-60">
          Arsip
        </button>
      )}
      {currentStatus === 'ARCHIVED' && (
        <button onClick={() => updateStatus('PUBLISHED')} disabled={loading}
          className="text-xs text-green-500 hover:text-green-300 bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-lg transition disabled:opacity-60">
          Aktifkan
        </button>
      )}
      <button onClick={deleteInvitation} disabled={loading}
        className="text-xs text-red-500 hover:text-red-300 bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-lg transition disabled:opacity-60">
        Hapus
      </button>
    </div>
  )
}
