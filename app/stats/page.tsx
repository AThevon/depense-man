'use client';

import { useExpensesStore } from '@/lib/store/expenses';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { StatsPage as StatsPageContent } from '@/components/stats/StatsPageWithWorker';

export default function StatsPage() {
  const { isLoading } = useExpensesStore();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return <StatsPageContent />;
}
