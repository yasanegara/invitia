import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-800">
          <span className="font-bold text-amber-400 text-lg">invitia.id</span>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Super Admin</p>
        </div>

        <AdminNav />

        <div className="px-5 py-4 border-t border-gray-800 space-y-2">
          <p className="text-xs text-gray-600 truncate">{session.user?.email}</p>
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition">
            ← Kembali ke Dashboard
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
