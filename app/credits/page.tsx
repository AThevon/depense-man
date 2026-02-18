'use client';

import { useEffect } from 'react';
import { useExpensesStore } from '@/lib/store/expenses';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { CreditsPage as CreditsPageContent } from '@/components/credits/CreditsPage';
import { auth } from '@/lib/firebase';

export default function CreditsPage() {
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

  return <CreditsPageContent />;
}
