'use client';

import { useExpensesStore } from '@/lib/store/expenses';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { ProjectionsPage as ProjectionsPageContent } from '@/components/projections/ProjectionsPage';

export default function ProjectionsPage() {
  const { isLoading } = useExpensesStore();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return <ProjectionsPageContent />;
}
