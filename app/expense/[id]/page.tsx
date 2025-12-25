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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <ExpenseDetailClient expenseId={id} />
    </Suspense>
  );
}
