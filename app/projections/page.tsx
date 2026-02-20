'use client';

import { useEffect } from 'react';
import { useExpensesStore } from '@/lib/store/expenses';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { ProjectionsPage as ProjectionsPageContent } from '@/components/projections/ProjectionsPage';
import { auth } from '@/lib/firebase';

export default function ProjectionsPage() {
  const { isLoading, initListener, reset } = useExpensesStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        initListener(user.uid);
      } else {
        reset();
      }
    });

    return () => unsubscribe();
  }, [initListener, reset]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return <ProjectionsPageContent />;
}
