'use client';

import { useEffect } from 'react';
import { useExpensesStore } from '@/lib/store/expenses';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { StatsPage as StatsPageContent } from '@/components/stats/StatsPageWithWorker';
import { auth } from '@/lib/firebase';

export default function StatsPage() {
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

  return <StatsPageContent />;
}
