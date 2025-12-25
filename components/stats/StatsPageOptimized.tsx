'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { MonthlyItem } from '@/lib/types';

interface StatsPageProps {
  items: MonthlyItem[];
  totalIncome: number;
  totalExpenses: number;
  remaining: number;
}

// Lazy load avec dynamic import (Next.js optimized)
const StatsPageContent = dynamic(() => import('./StatsPage'), {
  loading: () => (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-64 bg-muted/50 rounded-lg"></div>
        </div>
      ))}
    </div>
  ),
  ssr: false, // Pas de SSR pour les graphiques
});

const StatsPageOptimized = memo((props: StatsPageProps) => {
  return <StatsPageContent {...props} />;
}, (prevProps, nextProps) => {
  // Custom comparison - ne re-render que si les données changent vraiment
  return (
    prevProps.items.length === nextProps.items.length &&
    prevProps.totalIncome === nextProps.totalIncome &&
    prevProps.totalExpenses === nextProps.totalExpenses &&
    prevProps.remaining === nextProps.remaining
  );
});

StatsPageOptimized.displayName = 'StatsPageOptimized';

export default StatsPageOptimized;
