'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MonthlyItem, MonthlyExpense} from '@/lib/types';
import { calculateCreditInfoAtDate } from '@/lib/creditCalculations';
import { Icon } from '@/components/ui/Icon';
import { CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

interface TreemapViewProps {
  items: MonthlyItem[];
  onEdit: (item: MonthlyItem) => void;
}

interface TreemapNode {
  item: MonthlyItem;
  amount: number;
  percentage: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Algorithme de squarified treemap simplifié
const squarify = (data: Array<{ item: MonthlyItem; amount: number }>, x: number, y: number, width: number, height: number): TreemapNode[] => {
  if (data.length === 0) return [];

  const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);

  const squarifyRecursive = (
    items: Array<{ item: MonthlyItem; amount: number }>,
    x: number,
    y: number,
    width: number,
    height: number
  ): TreemapNode[] => {
    if (items.length === 0) return [];
    if (items.length === 1) {
      return [{
        item: items[0].item,
        amount: items[0].amount,
        percentage: (items[0].amount / totalAmount) * 100,
        x,
        y,
        width,
        height
      }];
    }

    const vertical = height > width;
    const total = items.reduce((sum, d) => sum + d.amount, 0);

    // Split by median
    const mid = Math.floor(items.length / 2);
    const left = items.slice(0, mid);
    const right = items.slice(mid);

    const leftTotal = left.reduce((sum, d) => sum + d.amount, 0);
    const leftRatio = leftTotal / total;

    if (vertical) {
      const leftHeight = height * leftRatio;
      return [
        ...squarifyRecursive(left, x, y, width, leftHeight),
        ...squarifyRecursive(right, x, y + leftHeight, width, height - leftHeight)
      ];
    } else {
      const leftWidth = width * leftRatio;
      return [
        ...squarifyRecursive(left, x, y, leftWidth, height),
        ...squarifyRecursive(right, x + leftWidth, y, width - leftWidth, height)
      ];
    }
  };

  return squarifyRecursive(data, x, y, width, height);
};

const TreemapView = ({ items, onEdit }: TreemapViewProps) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const treemapData = useMemo(() => {
    // Préparer les données avec montants - uniquement les dépenses
    const processedItems = items
      .filter(item => item.type === 'expense') // Filtrer uniquement les dépenses
      .map(item => {
        const expenseItem = item as MonthlyExpense;
        let amount = item.amount;

        if (expenseItem.isCredit) {
          const creditInfo = calculateCreditInfoAtDate(expenseItem);
          if (creditInfo?.isActive) {
            amount = creditInfo.monthlyAmount;
          } else {
            return null; // Ignorer les crédits inactifs
          }
        }

        return { item, amount };
      }).filter(Boolean) as Array<{ item: MonthlyItem; amount: number }>;

    // Trier par montant décroissant pour un meilleur treemap
    const sorted = processedItems.sort((a, b) => b.amount - a.amount);

    // Générer le treemap (utiliser les dimensions du viewport)
    const width = 100; // En pourcentage
    const height = 100; // En pourcentage

    return squarify(sorted, 0, 0, width, height);
  }, [items]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getColorForItem = (percentage: number) => {
    // Couleur basée sur l'intensité de la dépense
    if (percentage > 20) return 'bg-destructive';
    if (percentage > 10) return 'bg-destructive/80';
    if (percentage > 5) return 'bg-destructive/60';
    return 'bg-destructive/40';
  };

  const getTextSize = (percentage: number) => {
    if (percentage > 15) return 'text-2xl';
    if (percentage > 10) return 'text-xl';
    if (percentage > 5) return 'text-lg';
    if (percentage > 2) return 'text-base';
    return 'text-xs';
  };

  return (
    <div className="space-y-4">
      {/* Info */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-2">Vue Proportionnelle des Dépenses</h3>
        <p className="text-sm text-muted-foreground">
          La taille de chaque bloc représente la proportion de la dépense dans votre budget mensuel
        </p>
      </motion.div>

      {/* Treemap Grid */}
      <div
        className="relative w-full bg-muted/20 rounded-lg overflow-hidden border border-border"
        style={{
          height: 'calc(100vh - 400px)',
          minHeight: '500px'
        }}
      >
        {treemapData.map((node, index) => {
          const expenseItem = node.item as MonthlyExpense;
          const isCredit = expenseItem?.isCredit || false;

          return (
            <motion.div
              key={node.item.id}
              className={`absolute cursor-pointer group ${getColorForItem(node.percentage)}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: `${node.width}%`,
                height: `${node.height}%`,
                border: '2px solid hsl(var(--background))',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{ scale: 0.98, opacity: 0.9 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/expense/${node.item.id}`)}
            >
              <div className="absolute inset-0 p-1 sm:p-2 flex items-center justify-center overflow-hidden">
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Icône */}
                  <Icon
                    name={node.item.icon}
                    className={`${
                      node.percentage > 15 ? 'h-8 w-8 sm:h-12 sm:w-12' :
                      node.percentage > 10 ? 'h-6 w-6 sm:h-10 sm:w-10' :
                      node.percentage > 5 ? 'h-5 w-5 sm:h-8 sm:w-8' :
                      node.percentage > 2 ? 'h-4 w-4 sm:h-6 sm:w-6' :
                      'h-3 w-3 sm:h-4 sm:w-4'
                    } text-foreground drop-shadow-lg flex-shrink-0`}
                  />

                  {/* Montant */}
                  {node.percentage > 1 && (
                    <div
                      className={`font-bold text-foreground drop-shadow-lg whitespace-nowrap ${
                        node.percentage > 15 ? 'text-lg sm:text-2xl' :
                        node.percentage > 10 ? 'text-base sm:text-xl' :
                        node.percentage > 5 ? 'text-sm sm:text-lg' :
                        node.percentage > 2 ? 'text-xs sm:text-base' :
                        'text-[10px] sm:text-sm'
                      }`}
                    >
                      {formatAmount(node.amount)}
                    </div>
                  )}
                </div>

                {/* Badge crédit - coin supérieur */}
                {isCredit && node.percentage > 3 && (
                  <div className="absolute top-1 right-1 bg-primary/90 text-primary-foreground rounded-full p-1">
                    <CreditCard className="h-2 w-2 sm:h-3 sm:w-3" />
                  </div>
                )}
              </div>

              {/* Overlay hover avec effet brillant */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-foreground/0 via-foreground/5 to-foreground/0 pointer-events-none opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Légende */}
      <motion.div
        className="flex items-center justify-center flex-wrap gap-4 text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-destructive rounded" />
          <span className="text-muted-foreground">&gt; 20% du budget</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-destructive/80 rounded" />
          <span className="text-muted-foreground">10-20% du budget</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-destructive/60 rounded" />
          <span className="text-muted-foreground">5-10% du budget</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-destructive/40 rounded" />
          <span className="text-muted-foreground">&lt; 5% du budget</span>
        </div>
      </motion.div>
    </div>
  );
};

export default TreemapView;
