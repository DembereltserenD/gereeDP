'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Funnel,
  FileText,
  Settings,
  BarChart3,
  Kanban,
  Receipt,
  Wallet,
  Package,
} from 'lucide-react'

const navigation = [
  {
    name: 'Хянах самбар',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Борлуулалт',
    href: '/sales-funnel',
    icon: Funnel,
  },
  {
    name: 'Kanban',
    href: '/sales-funnel/kanban',
    icon: Kanban,
  },
  {
    name: 'Сервис гэрээ',
    href: '/service-contracts',
    icon: FileText,
  },
  {
    name: 'Зардал',
    href: '/expenses',
    icon: Receipt,
  },
  {
    name: 'Цалин',
    href: '/salary',
    icon: Wallet,
  },
  {
    name: 'Бараа материал',
    href: '/stock',
    icon: Package,
  },
  {
    name: 'Тайлан',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Тохиргоо',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-gray-900">
        <div className="flex h-16 shrink-0 items-center px-6">
          <h1 className="text-xl font-bold text-white">Sales CRM</h1>
        </div>
        <nav className="flex flex-1 flex-col px-4 pb-4">
          <ul className="flex flex-1 flex-col gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
