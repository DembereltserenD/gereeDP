import { notFound } from 'next/navigation'
import { getSalaryById } from '@/lib/actions/salary'
import { SalaryForm } from '@/components/salary/form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditSalaryPage({ params }: PageProps) {
  const { id } = await params

  try {
    const salary = await getSalaryById(id)

    return (
      <div className="max-w-2xl mx-auto">
        <SalaryForm initialData={salary} />
      </div>
    )
  } catch {
    notFound()
  }
}
