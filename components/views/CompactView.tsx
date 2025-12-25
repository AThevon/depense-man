'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MonthlyItem, MonthlyExpense, getPayCyclePosition } from '@/lib/types';
import { calculateCreditInfoAtDate } from '@/lib/creditCalculations';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

interface CompactViewProps {
  items: MonthlyItem[];
  onEdit: (item: MonthlyItem) => void;
}

const CompactView = ({ items, onEdit }: CompactViewProps) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <motion.thead
              className="bg-muted/50 border-b border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Jour</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Montant</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Crédit</th>
              </tr>
            </motion.thead>
          <tbody>
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

              return (
                <motion.tr
                  key={item.id}
                  className={`border-b border-border hover:bg-muted/30 cursor-pointer transition-colors ${
                    index % 2 === 0 ? 'bg-card' : 'bg-muted/10'
                  }`}
                  onClick={() => router.push(`/expense/${item.id}`)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.3, duration: 0.3 }}
                  whileHover={{ backgroundColor: 'rgba(var(--muted-rgb, 0 0 0) / 0.3)' }}
                >
                  {/* Jour */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isExpense ? 'bg-destructive' : 'bg-success'}`} />
                      <span className="font-bold text-foreground">{item.dayOfMonth}</span>
                    </div>
                  </td>

                  {/* Nom avec icône */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${isExpense ? 'bg-destructive/10' : 'bg-success/10'}`}>
                        <Icon name={item.icon} className={`h-4 w-4 ${isExpense ? 'text-destructive' : 'text-success'}`} />
                      </div>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${isExpense ? 'text-destructive' : 'text-success'}`}>
                      {isExpense ? 'Dépense' : 'Revenu'}
                    </span>
                  </td>

                  {/* Montant */}
                  <td className="px-4 py-3 text-right">
                    <span className={`text-lg font-bold ${isExpense ? 'text-destructive' : 'text-success'}`}>
                      {isExpense ? '-' : '+'}
                      {formatAmount(displayAmount)}
                    </span>
                  </td>

                  {/* Crédit */}
                  <td className="px-4 py-3 text-center">
                    {isCredit && creditInfo?.isActive ? (
                      <div className="inline-flex items-center space-x-2 px-2 py-1 bg-primary/10 rounded-full">
                        <CreditCard className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          {creditInfo.remainingPayments}x
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>

          {/* Total row */}
          <motion.tfoot
            className="bg-muted/50 border-t-2 border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: sortedItems.length * 0.05 + 0.5 }}
          >
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-foreground">
                Total mensuel:
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-lg font-bold text-primary">
                  {formatAmount(
                    items.reduce((sum, item) => {
                      let amount = item.amount;
                      if (item.type === 'expense') {
                        const expenseItem = item as MonthlyExpense;
                        if (expenseItem.isCredit) {
                          const creditInfo = calculateCreditInfoAtDate(expenseItem);
                          if (creditInfo?.isActive) {
                            amount = creditInfo.monthlyAmount;
                          } else {
                            return sum;
                          }
                        }
                        return sum - amount;
                      }
                      return sum + amount;
                    }, 0)
                  )}
                </span>
              </td>
              <td />
            </tr>
          </motion.tfoot>
        </table>
      </div>
    </Card>
    </motion.div>
  );
};

export default CompactView;
