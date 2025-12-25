import { Suspense } from 'react';
import { ExpenseDetailClient } from '@/components/expense/ExpenseDetailClient';
import { Spinner } from '@/components/ui/spinner';

export default async function ExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<Spinner size="lg" />}>
      <ExpenseDetailClient expenseId={id} />
    </Suspense>
  );
}
