import { auth }          from '@/lib/auth'
import { db }            from '@/lib/db'
import { redirect }      from 'next/navigation'
import Link              from 'next/link'
import { CREDIT_PACKS, formatRupiah } from '@/lib/utils'
import BuyButton         from '@/components/billing/BuyButton'
import LogoutButton      from '@/components/LogoutButton'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { status } = await searchParams

  const [user, transactions] = await Promise.all([
    db.user.findUnique({
      where:  { id: session.user.id },
      select: { name: true, email: true, credits: true, role: true },
    }),
    db.transaction.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take:    5,
      select:  { orderId: true, packType: true, amount: true, status: true, createdAt: true, credits: true },
    }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg text-amber-600">invitia.id</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            🪙 <span className="font-semibold text-gray-800">{user?.credits ?? 0}</span> kredit
          </span>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</Link>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan & Billing</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola kredit dan akun kamu.</p>
        </div>

        {/* Status banner */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl px-5 py-4 text-sm font-medium">
            ✅ Pembayaran berhasil! Kredit sudah ditambahkan ke akun kamu.
          </div>
        )}

        {/* Credit balance */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Saldo Kredit</p>
          <p className="text-4xl font-bold text-amber-500">{user?.credits ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">1 kredit = 1 undangan digital</p>
        </div>

        {/* Credit packs */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-4">Beli Kredit</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(CREDIT_PACKS) as [keyof typeof CREDIT_PACKS, typeof CREDIT_PACKS[keyof typeof CREDIT_PACKS]][]).map(([key, pack]) => (
              <div key={key}
                className={`bg-white rounded-2xl border p-5 flex flex-col shadow-sm ${key === 'PRO' ? 'border-amber-400 ring-2 ring-amber-400' : 'border-gray-100'}`}>
                {key === 'PRO' && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full self-start mb-2">
                    Populer
                  </span>
                )}
                <p className="font-bold text-gray-900">{pack.label}</p>
                <p className="text-2xl font-bold text-amber-500 mt-1">{formatRupiah(pack.price)}</p>
                <p className="text-xs text-gray-500 mb-4">
                  {pack.credits === -1 ? 'Unlimited kredit' : `${pack.credits} kredit`}
                </p>
                <BuyButton packType={key} label={`Beli ${pack.label}`} highlighted={key === 'PRO'} />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Pembayaran diproses oleh Midtrans. Aman & terpercaya.
          </p>
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Informasi Akun</h2>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Nama</dt>
              <dd className="font-medium text-gray-800">{user?.name ?? '-'}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-800">{user?.email}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Role</dt>
              <dd className="font-medium text-gray-800">{user?.role}</dd>
            </div>
          </dl>
        </div>

        {/* Transaction history */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Riwayat Transaksi</h2>
            </div>
            <ul className="divide-y">
              {transactions.map(tx => (
                <li key={tx.orderId} className="px-6 py-4 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{CREDIT_PACKS[tx.packType as keyof typeof CREDIT_PACKS]?.label} Pack</p>
                    <p className="text-xs text-gray-400">
                      {tx.credits === -1 ? 'Unlimited' : `+${tx.credits} kredit`} ·{' '}
                      {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700">{formatRupiah(tx.amount)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tx.status === 'SUCCESS'   ? 'bg-green-100 text-green-700' :
                      tx.status === 'PENDING'   ? 'bg-yellow-100 text-yellow-700' :
                      tx.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' :
                                                  'bg-red-100 text-red-600'
                    }`}>
                      {tx.status === 'SUCCESS'   ? 'Sukses' :
                       tx.status === 'PENDING'   ? 'Menunggu' :
                       tx.status === 'CANCELLED' ? 'Dibatalkan' : 'Gagal'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
