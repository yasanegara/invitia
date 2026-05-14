'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin',              icon: '📊', label: 'Overview'     },
  { href: '/admin/users',        icon: '👥', label: 'Users'        },
  { href: '/admin/transactions', icon: '💳', label: 'Transaksi'    },
  { href: '/admin/invitations',  icon: '💌', label: 'Undangan'     },
  { href: '/admin/tokens',       icon: '🧮', label: 'Token Usage'  },
  { href: '/admin/ai-brain',     icon: '🧠', label: 'AI Brain'     },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 py-4 px-3 space-y-0.5">
      {NAV.map(item => {
        const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
        return (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              active
                ? 'bg-amber-500/15 text-amber-400'
                : 'text-gray-400 hover:bg-gray-800/70 hover:text-gray-100'
            }`}>
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
          </Link>
        )
      })}
    </nav>
  )
}
