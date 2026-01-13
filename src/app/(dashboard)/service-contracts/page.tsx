import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getServiceContracts } from '@/lib/actions/service-contracts'
import { ServiceContractsDataTable } from '@/components/service-contracts/data-table'

export default async function ServiceContractsPage() {
  const { data } = await getServiceContracts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Сервис гэрээ</h1>
          <p className="text-muted-foreground">
            Сервис гэрээний бүх мэдээлэл
          </p>
        </div>
        <Button asChild>
          <Link href="/service-contracts/new">
            <Plus className="mr-2 h-4 w-4" />
            Нэмэх
          </Link>
        </Button>
      </div>

      <ServiceContractsDataTable data={data || []} />
    </div>
  )
}
