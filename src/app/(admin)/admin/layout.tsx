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
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="invitia.id" className="h-24 w-auto" />
            <span className="text-[10px] font-bold text-rose-300 bg-rose-300/10 border border-rose-300/30 px-1.5 py-0.5 rounded-md tracking-wide">Beta</span>
          </div>
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
