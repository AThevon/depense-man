'use client';

import { useExpensesStore } from '@/lib/store/expenses';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { CreditsPage as CreditsPageContent } from '@/components/credits/CreditsPage';

export default function CreditsPage() {
  const { isLoading } = useExpensesStore();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return <CreditsPageContent />;
}
