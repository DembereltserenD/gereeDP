import { notFound } from 'next/navigation'
import { getSalesFunnelById } from '@/lib/actions/sales-funnel'
import { SalesFunnelForm } from '@/components/sales-funnel/form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditSalesFunnelPage({ params }: PageProps) {
  const { id } = await params

  let data
  try {
    data = await getSalesFunnelById(id)
  } catch {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <SalesFunnelForm initialData={data} />
    </div>
  )
}
