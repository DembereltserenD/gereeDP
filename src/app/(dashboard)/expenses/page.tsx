import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getExpenses, getExpensesSummary } from '@/lib/actions/expenses'
import { ExpenseDataTable } from '@/components/expenses/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function ExpensesPage() {
  const { data } = await getExpenses()
  const summary = await getExpensesSummary()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Зардал</h1>
          <p className="text-muted-foreground">
            Зардлын бүх мэдээлэл
          </p>
        </div>
        <Button asChild>
          <Link href="/expenses/new">
            <Plus className="mr-2 h-4 w-4" />
            Нэмэх
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт зардал</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.count} бүртгэл
            </p>
          </CardContent>
        </Card>

        {Object.entries(summary.byCategory).slice(0, 3).map(([category, amount]) => (
          <Card key={category}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ExpenseDataTable data={data || []} />
    </div>
  )
}
