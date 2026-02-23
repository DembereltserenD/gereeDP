'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import { PushNotificationProvider } from '@/components/layout/push-notification-provider'
import type { Profile } from '@/types/database'

interface DashboardShellProps {
  user: {
    email: string
    profile: Profile | null
    id: string
  }
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <PushNotificationProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <div className="lg:pl-64">
          <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </PushNotificationProvider>
  )
}
