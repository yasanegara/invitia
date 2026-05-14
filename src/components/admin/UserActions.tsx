'use client'

import { useState } from 'react'

interface Props {
  userId:         string
  currentRole:    string
  currentCredits: number
}

export default function UserActions({ userId, currentRole, currentCredits }: Props) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState(String(currentCredits))
  const [role,    setRole]    = useState(currentRole)

  const save = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ credits: parseInt(credits), role }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan')
      setOpen(false)
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async () => {
    if (!confirm('Hapus user ini? Semua undangan dan data akan terhapus.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg transition">
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-white mb-5">Edit User</h3>

            <label className="block text-xs text-gray-400 mb-1">Kredit</label>
            <input
              type="number"
              value={credits}
              onChange={e => setCredits(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-100 mb-4 focus:outline-none focus:border-amber-500"
            />

            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-100 mb-6 focus:outline-none focus:border-amber-500"
            >
              <option value="USER">USER</option>
              <option value="RESELLER">RESELLER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <div className="flex gap-3">
              <button onClick={save} disabled={loading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2 rounded-xl transition disabled:opacity-60">
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button onClick={() => setOpen(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2 rounded-xl transition">
                Batal
              </button>
            </div>

            <button onClick={deleteUser} disabled={loading}
              className="w-full mt-3 text-xs text-red-400 hover:text-red-300 py-2 rounded-xl hover:bg-red-900/20 transition">
              Hapus User
            </button>
          </div>
        </div>
      )}
    </>
  )
}
