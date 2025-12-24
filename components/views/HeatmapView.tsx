'use client';

import { useMemo } from 'react';
import { MonthlyItem, MonthlyExpense} from '@/lib/types';
import { calculateCreditInfoAtDate } from '@/lib/creditCalculations';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface HeatmapViewProps {
  items: MonthlyItem[];
  onEdit: (item: MonthlyItem) => void;
}

const HeatmapView = ({ items, onEdit }: HeatmapViewProps) => {
  // Calculer les montants par jour
  const dayData = useMemo(() => {
    const data: Record<number, { income: number; expense: number; balance: number; items: MonthlyItem[] }> = {};

    // Initialiser tous les jours
    for (let i = 1; i <= 31; i++) {
      data[i] = { income: 0, expense: 0, balance: 0, items: [] };
    }

    // Remplir les données
    items.forEach(item => {
      const day = item.dayOfMonth;
      data[day].items.push(item);

      if (item.type === 'income') {
        data[day].income += item.amount;
      } else {
        const expenseItem = item as MonthlyExpense;
        let amount = item.amount;

        if (expenseItem.isCredit) {
          const creditInfo = calculateCreditInfoAtDate(expenseItem);
          if (creditInfo?.isActive) {
            amount = creditInfo.monthlyAmount;
          } else {
            return;
          }
        }

        data[day].expense += amount;
      }

      data[day].balance = data[day].income - data[day].expense;
    });

    return data;
  }, [items]);

  // Trouver le montant max pour normaliser les couleurs
  const maxAmount = useMemo(() => {
    return Math.max(
      ...Object.values(dayData).map(day => Math.max(day.income, day.expense))
    );
  }, [dayData]);

  const getIntensity = (amount: number) => {
    if (amount === 0) return 0;
    return Math.min(1, amount / maxAmount);
  };

  const getBackgroundColor = (day: number) => {
    const { income, expense } = dayData[day];

    if (income === 0 && expense === 0) {
      return 'bg-muted/20';
    }

    if (income > expense) {
      // Plus de revenus = vert
      const intensity = getIntensity(income);
      if (intensity > 0.7) return 'bg-success';
      if (intensity > 0.4) return 'bg-success/70';
      return 'bg-success/40';
    } else if (expense > income) {
      // Plus de dépenses = rouge
      const intensity = getIntensity(expense);
      if (intensity > 0.7) return 'bg-destructive';
      if (intensity > 0.4) return 'bg-destructive/70';
      return 'bg-destructive/40';
    }

    return 'bg-muted/50';
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const today = new Date().getDate();

  return (
    <div className="space-y-6">
      {/* Légende */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-success rounded" />
              <span className="text-sm text-muted-foreground">Revenus dominants</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-destructive rounded" />
              <span className="text-sm text-muted-foreground">Dépenses dominantes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted/20 rounded" />
              <span className="text-sm text-muted-foreground">Aucune transaction</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Plus la couleur est foncée, plus le montant est élevé
          </div>
        </div>
      </Card>

      {/* Grille calendrier */}
      <div className="grid grid-cols-7 gap-2">
        {/* Headers jours de la semaine */}
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {/* Jours du mois */}
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
          const data = dayData[day];
          const isToday = day === today;
          const hasTransactions = data.items.length > 0;

          return (
            <Card
              key={day}
              className={`relative p-4 cursor-pointer hover:shadow-lg transition-all ${getBackgroundColor(day)} ${
                isToday ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                if (data.items.length > 0) {
                  onEdit(data.items[0]); // Editer le premier item du jour
                }
              }}
            >
              <div className="flex flex-col items-center justify-center min-h-[80px]">
                {/* Numéro du jour */}
                <div className={`text-2xl font-bold mb-2 ${hasTransactions ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {day}
                </div>

                {/* Indicateurs */}
                {hasTransactions && (
                  <div className="space-y-1 w-full">
                    {data.income > 0 && (
                      <div className="flex items-center justify-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-success-foreground" />
                        <span className="text-xs font-semibold text-foreground">
                          {formatAmount(data.income)}
                        </span>
                      </div>
                    )}
                    {data.expense > 0 && (
                      <div className="flex items-center justify-center space-x-1">
                        <TrendingDown className="h-3 w-3 text-destructive-foreground" />
                        <span className="text-xs font-semibold text-foreground">
                          {formatAmount(data.expense)}
                        </span>
                      </div>
                    )}
                    {/* Badge nombre de transactions */}
                    {data.items.length > 1 && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {data.items.length}
                      </div>
                    )}
                  </div>
                )}

                {/* Indicateur aujourd'hui */}
                {isToday && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-primary">
                    •
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Jours avec revenus</div>
          <div className="text-2xl font-bold text-success">
            {Object.values(dayData).filter(d => d.income > 0).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Jours avec dépenses</div>
          <div className="text-2xl font-bold text-destructive">
            {Object.values(dayData).filter(d => d.expense > 0).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Jours sans transaction</div>
          <div className="text-2xl font-bold text-muted-foreground">
            {Object.values(dayData).filter(d => d.items.length === 0).length}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HeatmapView;
