import { notFound } from 'next/navigation'
import { getServiceContractById } from '@/lib/actions/service-contracts'
import { ServiceContractForm } from '@/components/service-contracts/form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditServiceContractPage({ params }: PageProps) {
  const { id } = await params

  let data
  try {
    data = await getServiceContractById(id)
  } catch {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ServiceContractForm initialData={data} />
    </div>
  )
}
