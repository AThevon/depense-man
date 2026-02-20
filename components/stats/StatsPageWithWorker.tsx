'use client';

import { useMemo } from 'react';
import { useExpensesStore } from '@/lib/store/expenses';
import { MonthlyExpense } from '@/lib/types';
import { calculateCreditInfo } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';

import { formatEuro } from '@/lib/format';

export function StatsPage() {
  const { items, calculation } = useExpensesStore();

  const expenseBreakdown = useMemo(() => {
    const expenses = items.filter((i): i is MonthlyExpense => i.type === 'expense');
    let creditTotal = 0;
    let nonCreditTotal = 0;
    expenses.forEach(e => {
      if (e.isCredit) {
        const info = calculateCreditInfo(e);
        if (info?.isActive) creditTotal += info.monthlyAmount;
      } else {
        nonCreditTotal += e.amount;
      }
    });
    return { creditTotal, nonCreditTotal, total: creditTotal + nonCreditTotal };
  }, [items]);

  const top5 = useMemo(() => {
    return items
      .filter((i): i is MonthlyExpense => i.type === 'expense')
      .map(e => {
        const info = e.isCredit ? calculateCreditInfo(e) : null;
        const amount = info?.isActive ? info.monthlyAmount : (!e.isCredit ? e.amount : 0);
        return { ...e, displayAmount: amount };
      })
      .filter(e => e.displayAmount > 0)
      .sort((a, b) => b.displayAmount - a.displayAmount)
      .slice(0, 5);
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 md:px-6 py-4">
        <h2 className="text-lg font-semibold mb-4">Résumé du mois</h2>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {/* Dépenses */}
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Dépenses</p>
            <p className="text-2xl font-bold tabular-nums text-destructive">
              {formatEuro(expenseBreakdown.total)}
            </p>
            <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              <p>Crédits : {formatEuro(expenseBreakdown.creditTotal)}</p>
              <p>Hors crédits : {formatEuro(expenseBreakdown.nonCreditTotal)}</p>
            </div>
          </div>

          {/* Revenus */}
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Revenus</p>
            <p className="text-2xl font-bold tabular-nums text-success">
              {formatEuro(calculation.totalIncome)}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Top 5 dépenses</h2>
        <div className="glass rounded-2xl divide-y divide-[rgba(255,255,255,0.05)]">
          {top5.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-5">{index + 1}.</span>
                <Icon name={item.icon} className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-medium tabular-nums">
                {formatEuro(item.displayAmount)}
              </span>
            </div>
          ))}
          {top5.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucune dépense
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
