'use client';

import { useExpensesStore } from '@/lib/store/expenses';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function Home() {
  const { isLoading } = useExpensesStore();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return <DashboardClient />;
}
