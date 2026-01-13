import { notFound } from 'next/navigation'
import { getStockById } from '@/lib/actions/stock'
import { StockForm } from '@/components/stock/form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditStockPage({ params }: PageProps) {
  const { id } = await params

  try {
    const stock = await getStockById(id)

    return (
      <div className="max-w-2xl mx-auto">
        <StockForm initialData={stock} />
      </div>
    )
  } catch {
    notFound()
  }
}
