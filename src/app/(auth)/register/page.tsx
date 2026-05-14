'use client'

import { useState } from 'react'
import { signIn }   from 'next-auth/react'
import Link         from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form,    setForm]    = useState({ name: '', email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Terjadi kesalahan')
      setLoading(false)
      return
    }

    // auto-login after register
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">Daftar Gratis</h1>
        <p className="text-sm text-center text-gray-500 mb-6">1 kredit gratis untuk mulai</p>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2 mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['name', 'email', 'password'] as const).map(field => (
            <div key={field}>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                {field === 'name' ? 'Nama' : field === 'email' ? 'Email' : 'Password'}
              </label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                name={field} required value={form[field]} onChange={onChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder={field === 'name' ? 'Nama lengkap' : field === 'email' ? 'nama@email.com' : 'Min. 8 karakter'}
                minLength={field === 'password' ? 8 : undefined}
              />
            </div>
          ))}
          <button
            type="submit" disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-amber-600 font-semibold hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
