import { notFound } from 'next/navigation'
import { getExpenseById } from '@/lib/actions/expenses'
import { ExpenseForm } from '@/components/expenses/form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditExpensePage({ params }: PageProps) {
  const { id } = await params

  try {
    const expense = await getExpenseById(id)

    return (
      <div className="max-w-2xl mx-auto">
        <ExpenseForm initialData={expense} />
      </div>
    )
  } catch {
    notFound()
  }
}
