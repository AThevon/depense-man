'use client';

import { useMemo } from 'react';
import { MonthlyItem, MonthlyExpense} from '@/lib/types';
import { calculateCreditInfoAtDate } from '@/lib/creditCalculations';
import { Icon } from '@/components/ui/Icon';
import { CreditCard } from 'lucide-react';

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
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Vue Proportionnelle des Dépenses</h3>
        <p className="text-sm text-muted-foreground">
          La taille de chaque bloc représente la proportion de la dépense dans votre budget mensuel
        </p>
      </div>

      {/* Treemap Grid */}
      <div
        className="relative w-full bg-muted/20 rounded-lg overflow-hidden border border-border"
        style={{
          height: 'calc(100vh - 400px)',
          minHeight: '500px'
        }}
      >
        {treemapData.map((node) => {
          const expenseItem = node.item as MonthlyExpense;
          const isCredit = expenseItem?.isCredit || false;

          return (
            <div
              key={node.item.id}
              className={`absolute transition-all duration-300 cursor-pointer group hover:opacity-90 hover:scale-[0.98] ${getColorForItem(node.percentage)}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: `${node.width}%`,
                height: `${node.height}%`,
                border: '2px solid hsl(var(--background))',
              }}
              onClick={() => onEdit(node.item)}
            >
              <div className="absolute inset-0 p-2 sm:p-4 flex flex-col items-center justify-center text-center overflow-hidden">
                {/* Icône */}
                {node.percentage > 3 && (
                  <div className="mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Icon
                      name={node.item.icon}
                      className={`${
                        node.percentage > 15 ? 'h-12 w-12' :
                        node.percentage > 10 ? 'h-10 w-10' :
                        node.percentage > 5 ? 'h-8 w-8' :
                        'h-6 w-6'
                      } text-foreground drop-shadow-md`}
                    />
                  </div>
                )}

                {/* Nom */}
                <div
                  className={`font-bold text-foreground drop-shadow-md ${getTextSize(node.percentage)} leading-tight mb-1 line-clamp-2`}
                >
                  {node.item.name}
                </div>

                {/* Montant */}
                <div
                  className={`font-bold text-foreground drop-shadow-md ${
                    node.percentage > 10 ? 'text-xl' :
                    node.percentage > 5 ? 'text-lg' :
                    node.percentage > 2 ? 'text-base' :
                    'text-sm'
                  }`}
                >
                  -{formatAmount(node.amount)}
                </div>

                {/* Pourcentage */}
                {node.percentage > 2 && (
                  <div className="text-xs font-medium text-foreground/80 mt-1">
                    {node.percentage.toFixed(1)}%
                  </div>
                )}

                {/* Badge crédit */}
                {isCredit && node.percentage > 5 && (
                  <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground rounded-full p-1.5">
                    <CreditCard className="h-3 w-3" />
                  </div>
                )}

                {/* Jour */}
                {node.percentage > 3 && (
                  <div className="absolute bottom-2 left-2 bg-background/80 text-foreground rounded px-2 py-1 text-xs font-semibold">
                    Le {node.item.dayOfMonth}
                  </div>
                )}
              </div>

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center flex-wrap gap-4 text-sm">
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
      </div>
    </div>
  );
};

export default TreemapView;
