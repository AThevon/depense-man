'use client';

import { useMemo } from 'react';
import { useExpensesStore } from '@/lib/store/expenses';
import { MonthlyExpense } from '@/lib/types';
import { calculateCreditInfoAtDate } from '@/lib/creditCalculations';
import { Icon } from '@/components/ui/Icon';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const formatEuro = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

export function CreditsPage() {
  const { items, calculation } = useExpensesStore();

  const activeCredits = useMemo(() => {
    return items
      .filter((i): i is MonthlyExpense => i.type === 'expense' && i.isCredit === true)
      .map(credit => ({
        credit,
        info: calculateCreditInfoAtDate(credit),
      }))
      .filter(({ info }) => info && info.isActive)
      .sort((a, b) => a.info!.remainingPayments - b.info!.remainingPayments);
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 md:px-6 py-4 space-y-6">
        <h2 className="text-lg font-semibold">
          Crédits actifs ({activeCredits.length})
        </h2>

        {/* Credit cards */}
        {activeCredits.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-muted-foreground">Aucun crédit actif</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeCredits.map(({ credit, info }) => (
              <div key={credit.id} className="glass rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name={credit.icon} className="h-5 w-5 text-[#fbbf24]" />
                    <p className="font-medium">{credit.name}</p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">
                    {formatEuro(info!.monthlyAmount)}/mois
                  </p>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progression</span>
                    <span>{Math.round(info!.progressPercentage)}%</span>
                  </div>
                  <div className="w-full h-2 bg-[rgba(255,255,255,0.05)] rounded-full">
                    <div
                      className="h-full rounded-full bg-[#fbbf24] transition-all"
                      style={{ width: `${info!.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Reste : <span className="text-foreground font-medium tabular-nums">{formatEuro(info!.remainingAmount)}</span> sur {formatEuro(info!.totalAmount)}</span>
                  <span>Fin : {format(info!.endDate, 'MMM yyyy', { locale: fr })} ({info!.remainingPayments} mois)</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Résumé</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Crédits actifs</p>
              <p className="text-xl font-bold tabular-nums">{calculation.activeCredits.count}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total mensuel</p>
              <p className="text-xl font-bold tabular-nums text-[#fbbf24]">
                {formatEuro(calculation.activeCredits.totalMonthly)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total restant</p>
              <p className="text-xl font-bold tabular-nums">
                {formatEuro(calculation.activeCredits.totalRemaining)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
