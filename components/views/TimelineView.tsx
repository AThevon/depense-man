'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MonthlyItem, MonthlyExpense, getPayCyclePosition } from '@/lib/types';
import { calculateCreditInfoAtDate } from '@/lib/creditCalculations';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

interface TimelineViewProps {
  items: MonthlyItem[];
  onEdit: (item: MonthlyItem) => void;
}

const TimelineView = ({ items, onEdit }: TimelineViewProps) => {
  const router = useRouter();
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const posA = getPayCyclePosition(a.dayOfMonth);
      const posB = getPayCyclePosition(b.dayOfMonth);
      return posA - posB;
    });
  }, [items]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBarWidth = (amount: number) => {
    const maxAmount = Math.max(...items.map(i => {
      if (i.type === 'expense') {
        const expenseItem = i as MonthlyExpense;
        if (expenseItem.isCredit) {
          const creditInfo = calculateCreditInfoAtDate(expenseItem);
          return creditInfo?.monthlyAmount || 0;
        }
      }
      return i.amount;
    }));
    return Math.max(10, (amount / maxAmount) * 100);
  };

  const today = new Date().getDate();

  return (
    <div className="space-y-6">
      {/* Timeline header */}
      <motion.div
        className="flex items-center space-x-4 overflow-x-auto pb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-1 relative">
          <div className="h-1 bg-border rounded-full relative">
            {/* Ligne principale */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            {/* Indicateur aujourd'hui */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${((today - 29 + 30) % 30) / 30 * 100}%` }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <div className="w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg" />
              <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-primary">
                Aujourd&apos;hui
              </div>
            </motion.div>
          </div>

          {/* Marqueurs de jours */}
          <motion.div
            className="flex justify-between mt-8 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span>29</span>
            <span>8</span>
            <span>18</span>
            <span>28</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Items en timeline */}
      <div className="space-y-3">
        {sortedItems.map((item, index) => {
          const isExpense = item.type === 'expense';
          const expenseItem = isExpense ? item as MonthlyExpense : null;
          const isCredit = expenseItem?.isCredit || false;

          let displayAmount = item.amount;
          let creditInfo = null;

          if (isCredit && expenseItem) {
            creditInfo = calculateCreditInfoAtDate(expenseItem);
            if (creditInfo?.isActive) {
              displayAmount = creditInfo.monthlyAmount;
            }
          }

          const barWidth = getBarWidth(displayAmount);

          return (
            <motion.div
              key={item.id}
              className="group relative"
              onClick={() => router.push(`/expense/${item.id}`)}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-all">
                <div className="flex items-center space-x-4">
                  {/* Jour */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className="text-xs text-muted-foreground">Le</div>
                    <div className="text-xl font-bold text-foreground">
                      {item.dayOfMonth}
                    </div>
                  </div>

                  {/* Icône */}
                  <div className={`p-3 rounded-lg flex-shrink-0 ${isExpense ? 'bg-destructive/10' : 'bg-success/10'}`}>
                    <Icon name={item.icon} className={`h-6 w-6 ${isExpense ? 'text-destructive' : 'text-success'}`} />
                  </div>

                  {/* Barre et info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-foreground truncate">
                          {item.name}
                        </span>
                        {isCredit && creditInfo?.isActive && (
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className={`font-bold text-lg ${isExpense ? 'text-destructive' : 'text-success'}`}>
                        {isExpense ? '-' : '+'}
                        {formatAmount(displayAmount)}
                      </span>
                    </div>

                    {/* Barre de visualisation comparative des montants */}
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          isExpense ? 'bg-destructive' : 'bg-success'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Info crédit (progress bar séparée) */}
                    {isCredit && creditInfo?.isActive && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {creditInfo.remainingPayments} paiements restants • {Math.round(creditInfo.progressPercentage)}% complété
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
