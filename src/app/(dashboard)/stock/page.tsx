import Link from 'next/link'
import { Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStock, getStockSummary } from '@/lib/actions/stock'
import { StockDataTable } from '@/components/stock/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('mn-MN', {
    maximumFractionDigits: 0,
  }).format(value) + '₮'
}

export default async function StockPage() {
  const { data } = await getStock()
  const summary = await getStockSummary()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Бараа материал</h1>
          <p className="text-muted-foreground">
            Бараа материалын бүх мэдээлэл
          </p>
        </div>
        <Button asChild>
          <Link href="/stock/new">
            <Plus className="mr-2 h-4 w-4" />
            Нэмэх
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт бараа</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalQuantity} ширхэг
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт үнэ цэнэ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
          </CardContent>
        </Card>

        <Card className={summary.lowStockItems > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {summary.lowStockItems > 0 && <AlertTriangle className="h-4 w-4 text-red-500" />}
              Бага үлдэгдэлтэй
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.lowStockItems > 0 ? 'text-red-600' : ''}`}>
              {summary.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              бараа
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ангилал</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(summary.byCategory).length}</div>
            <p className="text-xs text-muted-foreground">
              төрөл
            </p>
          </CardContent>
        </Card>
      </div>

      {Object.keys(summary.byCategory).length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(summary.byCategory).map(([category, data]) => (
            <Card key={category}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{data.count} бараа</div>
                <p className="text-xs text-muted-foreground">
                  {data.quantity} ширхэг • {formatCurrency(data.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StockDataTable data={data || []} />
    </div>
  )
}
