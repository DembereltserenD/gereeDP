import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSalaries, getSalarySummary } from '@/lib/actions/salary'
import { SalaryDataTable } from '@/components/salary/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function SalaryPage() {
  const { data } = await getSalaries()
  const summary = await getSalarySummary()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Цалин</h1>
          <p className="text-muted-foreground">
            Цалингийн бүх мэдээлэл
          </p>
        </div>
        <Button asChild>
          <Link href="/salary/new">
            <Plus className="mr-2 h-4 w-4" />
            Нэмэх
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт цэвэр цалин</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalNetSalary)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.count} ажилтан
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Үндсэн цалин</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalBaseSalary)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Урамшуулал</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalBonus)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Суутгал</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDeductions)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summary.byStatus.Pending && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Хүлээгдэж байна</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.byStatus.Pending.count}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.byStatus.Pending.amount)}
              </p>
            </CardContent>
          </Card>
        )}
        {summary.byStatus.Paid && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Төлөгдсөн</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.byStatus.Paid.count}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.byStatus.Paid.amount)}
              </p>
            </CardContent>
          </Card>
        )}
        {summary.byStatus.Cancelled && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Цуцлагдсан</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.byStatus.Cancelled.count}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.byStatus.Cancelled.amount)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <SalaryDataTable data={data || []} />
    </div>
  )
}
