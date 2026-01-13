'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Funnel,
  FileText,
  Settings,
  BarChart3,
  Kanban,
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

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 bg-gray-900 p-0">
        <SheetHeader className="h-16 flex items-center justify-center border-b border-gray-800">
          <SheetTitle className="text-xl font-bold text-white">
            Sales CRM
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-1 flex-col px-4 py-4">
          <ul className="flex flex-1 flex-col gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => onOpenChange(false)}
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
      </SheetContent>
    </Sheet>
  )
}
