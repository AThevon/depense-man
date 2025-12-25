'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useExpensesStore } from '@/lib/store/expenses';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { Spinner } from '@/components/ui/spinner';
import { auth } from '@/lib/firebase';

// Lazy load des stats avec Web Worker pour ne pas bloquer le rendu
const StatsPageWithWorker = dynamic(
  () => import('@/components/stats/StatsPageWithWorker'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    ),
    ssr: false,
  }
);

/**
 * Page Stats - Affiche les statistiques détaillées
 */
export default function StatsPage() {
  const { items, calculation, isLoading, initListener, reset } = useExpensesStore();

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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
      <StatsPageWithWorker
        items={items}
        totalIncome={calculation.totalIncome}
        totalExpenses={calculation.totalExpenses}
        remaining={calculation.remaining}
      />
    </div>
  );
}
