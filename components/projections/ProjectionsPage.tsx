'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { addMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useExpensesStore } from '@/lib/store/expenses';
import { MonthlyExpense, MonthlyIncome } from '@/lib/types';
import { generateExpensePredictions, calculateCreditInfoAtDate } from '@/lib/creditCalculations';
import { formatEuro } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';

const ResponsiveLine = dynamic(
  () => import('@nivo/line').then((m) => m.ResponsiveLine),
  { ssr: false }
);

export function ProjectionsPage() {
  const { items } = useExpensesStore();

  // Calcul des projections sur 12 mois
  const projections = useMemo(() => {
    const expenses = items.filter((i): i is MonthlyExpense => i.type === 'expense');
    const totalIncome = items
      .filter((i): i is MonthlyIncome => i.type === 'income')
      .reduce((sum, i) => sum + i.amount, 0);

    const predictions = generateExpensePredictions(expenses, 12);

    return predictions.map((p, i) => {
      const monthDate = addMonths(new Date(), i);
      const monthLabel = format(monthDate, 'MMM yy', { locale: fr });
      const monthLabelLong = format(monthDate, 'MMMM yyyy', { locale: fr });
      const reste = totalIncome - p.totalExpenses;

      // Trouver les credits qui se terminent ce mois-ci
      const endingCredits = expenses.filter((expense) => {
        if (!expense.isCredit) return false;
        const info = calculateCreditInfoAtDate(expense, monthDate);
        if (!info) return false;
        if (i === 0) return false;
        const prevMonth = addMonths(new Date(), i - 1);
        const prevInfo = calculateCreditInfoAtDate(expense, prevMonth);
        return prevInfo?.isActive && !info.isActive;
      });

      return {
        month: monthLabel,
        monthLong: monthLabelLong,
        monthDate,
        expenses: p.totalExpenses,
        income: totalIncome,
        reste,
        details: p.details,
        endingCredits,
      };
    });
  }, [items]);

  // Credits actifs avec dates de fin
  const creditEvents = useMemo(() => {
    return items
      .filter((i): i is MonthlyExpense => i.type === 'expense' && i.isCredit === true)
      .map((credit) => {
        const info = calculateCreditInfoAtDate(credit);
        return { credit, info };
      })
      .filter(({ info }) => info && info.isActive)
      .sort((a, b) => a.info!.endDate.getTime() - b.info!.endDate.getTime());
  }, [items]);

  // Donnees du graphique Nivo
  const chartData = useMemo(
    () => [
      {
        id: 'Revenus',
        color: '#34d399',
        data: projections.map((p) => ({ x: p.month, y: p.income })),
      },
      {
        id: 'Depenses',
        color: '#f87171',
        data: projections.map((p) => ({ x: p.month, y: Math.round(p.expenses) })),
      },
      {
        id: 'Reste',
        color: '#f97316',
        data: projections.map((p) => ({ x: p.month, y: Math.round(p.reste) })),
      },
    ],
    [projections]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 md:px-6 py-4 space-y-6">
        {/* Section 1: Prochaines fins de credits */}
        {creditEvents.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Prochaines fins de crédits
            </h2>
            <div className="space-y-2">
              {creditEvents.map(({ credit, info }) => {
                const monthsLeft = info!.remainingPayments;
                return (
                  <div
                    key={credit.id}
                    className="glass rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        name={credit.icon}
                        className="h-5 w-5 text-warning"
                      />
                      <div>
                        <p className="text-sm font-medium">{credit.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Fin dans {monthsLeft} mois
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-success">
                      -{formatEuro(info!.monthlyAmount)}/mois
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Tableau previsionnel */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Prévisionnel</h2>
          <div className="glass rounded-2xl divide-y divide-[rgba(255,255,255,0.05)]">
            {/* En-tete */}
            <div className="grid grid-cols-4 gap-2 p-3 text-xs text-muted-foreground font-medium">
              <span>Mois</span>
              <span className="text-right">Dépenses</span>
              <span className="text-right">Revenus</span>
              <span className="text-right">Reste</span>
            </div>
            {projections.map((p, i) => (
              <div key={i}>
                <div className="grid grid-cols-4 gap-2 p-3 text-sm">
                  <span className="capitalize">{p.monthLong}</span>
                  <span className="text-right tabular-nums text-destructive">
                    {formatEuro(p.expenses)}
                  </span>
                  <span className="text-right tabular-nums text-success">
                    {formatEuro(p.income)}
                  </span>
                  <span
                    className={`text-right tabular-nums font-medium ${
                      p.reste >= 0 ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {formatEuro(p.reste)}
                  </span>
                </div>
                {p.endingCredits.length > 0 && (
                  <div className="px-3 pb-2">
                    {p.endingCredits.map((credit) => (
                      <p
                        key={credit.id}
                        className="text-xs text-muted-foreground"
                      >
                        Fin : {credit.name} (-{formatEuro(credit.amount)}/mois)
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Graphique 12 mois */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Projections 12 mois</h2>
          <div className="glass rounded-2xl p-4" style={{ height: 300 }}>
            <ResponsiveLine
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              colors={({ id }) => {
                if (id === 'Revenus') return '#34d399';
                if (id === 'Depenses') return '#f87171';
                return '#f97316';
              }}
              theme={{
                text: { fill: '#71717a' },
                grid: { line: { stroke: 'rgba(255,255,255,0.05)' } },
                axis: {
                  ticks: { text: { fill: '#71717a', fontSize: 11 } },
                },
                crosshair: { line: { stroke: '#f97316' } },
              }}
              enablePoints={false}
              enableGridX={false}
              curve="monotoneX"
              useMesh
              legends={[
                {
                  anchor: 'top-left',
                  direction: 'row',
                  translateY: -15,
                  itemWidth: 80,
                  itemHeight: 12,
                  itemTextColor: '#71717a',
                  symbolSize: 8,
                  symbolShape: 'circle',
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
