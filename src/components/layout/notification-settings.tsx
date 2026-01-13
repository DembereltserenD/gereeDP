'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Bell, Smartphone, Mail, BellRing } from 'lucide-react'
import { pushNotificationService } from '@/lib/push-notifications'
import { createClient } from '@/lib/supabase/client'

export function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [contractExpiryEnabled, setContractExpiryEnabled] = useState(true)
  const [meetingReminderEnabled, setMeetingReminderEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          
          // Check current push notification subscription status
          const isSubscribed = await pushNotificationService.checkSubscriptionStatus()
          setPushEnabled(isSubscribed)
        }
      } catch (error) {
        console.error('Error initializing notification settings:', error)
      }
    }

    initializeSettings()
  }, [])

  const handlePushToggle = async (checked: boolean) => {
    if (!userId) return

    setIsLoading(true)
    try {
      if (checked) {
        // Request notification permission first
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          const success = await pushNotificationService.subscribe(userId)
          if (success) {
            setPushEnabled(true)
          } else {
            setPushEnabled(false)
            alert('Push мэдэгдэл идэвхжүүлэхэд алдаа гарлаа')
          }
        } else {
          setPushEnabled(false)
          alert('Мэдэгдэл зөвшөөрөл олгогдоогүй байна')
        }
      } else {
        const success = await pushNotificationService.unsubscribe(userId)
        if (success) {
          setPushEnabled(false)
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error)
      alert('Алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    await pushNotificationService.sendTestNotification()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Мэдэгдлийн тохиргоо
        </CardTitle>
        <CardDescription>
          Мэдэгдлийн төрөл болон хүлээн авах аргаа сонгоно уу
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Push мэдэгдэл</p>
                <p className="text-sm text-muted-foreground">
                  Браузер дээр шууд мэдэгдэл хүлээн авах
                </p>
              </div>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={handlePushToggle}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Имэйл мэдэгдэл</p>
                <p className="text-sm text-muted-foreground">
                  Имэйлээр мэдэгдэл хүлээн авах
                </p>
              </div>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Мэдэгдлийн төрөл</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Гэрээ дуусах мэдэгдэл</p>
                <p className="text-sm text-muted-foreground">
                  Гэрээний хугацаа дуусахаас 1 өдрийн өмнө
                </p>
              </div>
              <Switch
                checked={contractExpiryEnabled}
                onCheckedChange={setContractExpiryEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Уулзалтын сануулга</p>
                <p className="text-sm text-muted-foreground">
                  Уулзалт болохоос 1 өдрийн өмнө
                </p>
              </div>
              <Switch
                checked={meetingReminderEnabled}
                onCheckedChange={setMeetingReminderEnabled}
              />
            </div>
          </div>
        </div>

        {pushEnabled && (
          <div className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              className="flex items-center gap-2"
            >
              <BellRing className="h-4 w-4" />
              Тест мэдэгдэл илгээх
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}