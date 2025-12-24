import { Suspense } from 'react';
import { getExpenses } from '@/lib/queries/expenses';
import { calculateMonthlyStats } from '@/lib/utils/calculations';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

/**
 * Server Component - Page principale du Dashboard
 * Récupère les données côté serveur avant le rendu
 */
export default async function Home() {
  // Récupération des données côté serveur
  const items = await getExpenses();
  const calculation = calculateMonthlyStats(items);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient items={items} calculation={calculation} />
    </Suspense>
  );
}
