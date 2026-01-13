import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { NotificationSettings } from '@/components/layout/notification-settings'
import { getAllSettings } from '@/lib/actions/settings'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('mn-MN').format(amount) + '₮'
}

function formatPercentage(value: number): string {
  return Math.round(value * 100) + '%'
}

const stageDescriptions: Record<string, string> = {
  'Cold': 'Анхны холбоо барилт',
  'Warm': 'Эхний шатны уулзалт',
  'Hot': 'Үнийн санал илгээсэн',
  'Won': 'Гэрээ байгуулагдсан',
  'Closed': 'Бүрэн дууссан',
  'Lost': 'Алдсан',
}

export default async function SettingsPage() {
  const { salesTargets, stageProbabilities, serviceContractTargets } = await getAllSettings()

  // Calculate total for sales targets
  const salesTotal = salesTargets.reduce((sum, t) => sum + t.target, 0)

  // Calculate total for service contracts
  const serviceTotal = serviceContractTargets.reduce((sum, t) => sum + t.target, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Тохиргоо</h1>
        <p className="text-muted-foreground">
          Системийн тохиргоонууд
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <NotificationSettings />
        
        <Card>
          <CardHeader>
            <CardTitle>2026 Target - Sales Funnel</CardTitle>
            <CardDescription>
              Борлуулалтын баг тус бүрийн зорилтот дүн
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesTargets.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Team target</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(salesTotal)}
                    </span>
                  </div>
                  {salesTargets.map((item) => (
                    <div key={item.team}>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between">
                        <span>{item.team}</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(item.target)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Тохиргоо олдсонгүй. Supabase settings хүснэгтэд өгөгдөл нэмнэ үү.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage Probabilities</CardTitle>
            <CardDescription>
              Stage тус бүрийн амжилттай болох магадлал
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageProbabilities.length > 0 ? (
                stageProbabilities.map((item, index) => (
                  <div key={item.stage}>
                    {index > 0 && <Separator className="my-2" />}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{item.stage}</span>
                        <p className="text-xs text-muted-foreground">
                          {stageDescriptions[item.stage] || ''}
                        </p>
                      </div>
                      <span className="font-medium">{formatPercentage(item.probability)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  Тохиргоо олдсонгүй. Supabase settings хүснэгтэд өгөгдөл нэмнэ үү.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2026 Target - Service Contracts</CardTitle>
            <CardDescription>
              Сервис гэрээний зорилтот дүн
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serviceContractTargets.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Team target</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(serviceTotal)}
                    </span>
                  </div>
                  {serviceContractTargets.map((item) => (
                    <div key={item.team}>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between">
                        <span>{item.team}</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(item.target)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Тохиргоо олдсонгүй. Supabase settings хүснэгтэд өгөгдөл нэмнэ үү.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Системийн мэдээлэл</CardTitle>
            <CardDescription>
              Програмын тохиргоо
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Хувилбар</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Framework</span>
                <span className="font-medium">Next.js 16</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Database</span>
                <span className="font-medium">Supabase</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
