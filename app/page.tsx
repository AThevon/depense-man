'use client';

import { useEffect } from 'react';
import { useExpensesStore } from '@/lib/store/expenses';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { auth } from '@/lib/firebase';

/**
 * Page principale - Init le listener Firestore realtime au montage
 */
export default function Home() {
  const { isLoading, initListener, reset } = useExpensesStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Init Firestore realtime listener
        initListener(user.uid);
      } else {
        // User logged out, cleanup
        reset();
      }
    });

    return () => unsubscribe();
  }, [initListener, reset]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return <DashboardClient />;
}
