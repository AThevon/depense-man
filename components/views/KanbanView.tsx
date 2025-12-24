'use client';

import { useMemo } from 'react';
import { MonthlyItem, MonthlyExpense} from '@/lib/types';
import { calculateCreditInfoAtDate } from '@/lib/creditCalculations';
import { Icon } from '@/components/ui/Icon';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface KanbanViewProps {
  items: MonthlyItem[];
  onEdit: (item: MonthlyItem) => void;
}

const KanbanView = ({ items, onEdit }: KanbanViewProps) => {
  // Générer 3 cycles de paye (actuel + 2 suivants)
  const cycles = useMemo(() => {
    const today = new Date();
    const payDay = 29;

    // Trouver le dernier jour de paye qui est passé (début du cycle actuel)
    let currentCycleStart: Date;
    if (today.getDate() >= payDay) {
      // On est après le jour de paye du mois actuel
      currentCycleStart = new Date(today.getFullYear(), today.getMonth(), payDay);
    } else {
      // On est avant le jour de paye, donc le cycle a commencé le mois précédent
      currentCycleStart = new Date(today.getFullYear(), today.getMonth() - 1, payDay);
    }

    const cycles = [];

    for (let i = 0; i < 3; i++) {
      const cycleStartDay = new Date(currentCycleStart.getFullYear(), currentCycleStart.getMonth() + i, payDay);
      const cycleEndDay = new Date(currentCycleStart.getFullYear(), currentCycleStart.getMonth() + i + 1, 28);

      // Calculer les items pour ce cycle
      const cycleItems = items.map(item => {
        const expenseItem = item as MonthlyExpense;
        let displayAmount = item.amount;
        let isActive = true;

        if (item.type === 'expense' && expenseItem.isCredit) {
          // Vérifier si le prélèvement du crédit tombe pendant ce cycle
          const dayOfPayment = expenseItem.dayOfMonth;

          // Calculer la date de prélèvement dans ce cycle
          let paymentDate: Date;
          if (dayOfPayment >= payDay) {
            // Prélèvement dans la première partie du cycle
            paymentDate = new Date(cycleStartDay.getFullYear(), cycleStartDay.getMonth(), dayOfPayment, 12, 0, 0);
          } else {
            // Prélèvement dans la deuxième partie (mois suivant)
            paymentDate = new Date(cycleEndDay.getFullYear(), cycleEndDay.getMonth(), dayOfPayment, 12, 0, 0);
          }

          const creditInfo = calculateCreditInfoAtDate(expenseItem, paymentDate);
          if (creditInfo?.isActive) {
            displayAmount = creditInfo.monthlyAmount;
          } else {
            isActive = false;
          }
        }

        return { ...item, displayAmount, isActive };
      }).filter(item => item.isActive);

      const totalIncome = cycleItems
        .filter(item => item.type === 'income')
        .reduce((sum, item) => sum + item.displayAmount, 0);

      const totalExpenses = cycleItems
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + item.displayAmount, 0);

      cycles.push({
        name: format(cycleEndDay, 'MMMM yyyy', { locale: fr }),
        startDay: cycleStartDay,
        endDay: cycleEndDay,
        items: cycleItems,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        isCurrent: i === 0
      });
    }

    return cycles;
  }, [items]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex space-x-4 min-w-max">
        {cycles.map((cycle) => (
          <div key={cycle.name} className="flex-shrink-0 w-[350px]">
            <Card className={`h-full ${cycle.isCurrent ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="space-y-3">
                  {/* Titre du cycle */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground capitalize">
                      {cycle.name}
                    </h3>
                    {cycle.isCurrent && (
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                        Actuel
                      </span>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="text-sm text-muted-foreground">
                    Du 29 au 28
                  </div>

                  {/* Summary cards */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-success/10 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-xs text-success font-medium">Revenus</span>
                      </div>
                      <div className="text-lg font-bold text-success">
                        {formatAmount(cycle.totalIncome)}
                      </div>
                    </div>

                    <div className="bg-destructive/10 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                        <span className="text-xs text-destructive font-medium">Dépenses</span>
                      </div>
                      <div className="text-lg font-bold text-destructive">
                        {formatAmount(cycle.totalExpenses)}
                      </div>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className={`text-center p-3 rounded-lg ${
                    cycle.balance > 0 ? 'bg-primary/10' : 'bg-destructive/10'
                  }`}>
                    <div className="text-sm text-muted-foreground mb-1">Solde</div>
                    <div className={`text-2xl font-bold ${
                      cycle.balance > 0 ? 'text-primary' : 'text-destructive'
                    }`}>
                      {formatAmount(cycle.balance)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                {cycle.items
                  .sort((a, b) => a.dayOfMonth - b.dayOfMonth)
                  .map((item) => {
                    const isExpense = item.type === 'expense';
                    const expenseItem = isExpense ? item as MonthlyExpense : null;
                    const isCredit = expenseItem?.isCredit || false;

                    return (
                      <Card
                        key={item.id}
                        className="p-3 cursor-pointer hover:shadow-md transition-all"
                        onClick={() => onEdit(item)}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Jour */}
                          <div className="flex-shrink-0 w-10 text-center">
                            <div className="text-lg font-bold text-foreground">
                              {item.dayOfMonth}
                            </div>
                          </div>

                          {/* Icône */}
                          <div className={`p-2 rounded-md flex-shrink-0 ${
                            isExpense ? 'bg-destructive/10' : 'bg-success/10'
                          }`}>
                            <Icon name={item.icon} className={`h-4 w-4 ${
                              isExpense ? 'text-destructive' : 'text-success'
                            }`} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <span className="font-medium text-sm text-foreground truncate">
                                {item.name}
                              </span>
                              {isCredit && (
                                <CreditCard className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                            <div className={`text-sm font-bold ${
                              isExpense ? 'text-destructive' : 'text-success'
                            }`}>
                              {isExpense ? '-' : '+'}
                              {formatAmount(item.displayAmount)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}

                {cycle.items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune transaction
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanView;
