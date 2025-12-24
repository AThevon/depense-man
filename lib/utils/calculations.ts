import { MonthlyItem, MonthlyCalculation, MonthlyExpense, MonthlyIncome } from '@/lib/types';
import { calculateCreditInfo, getPayCyclePosition, getCurrentPayCyclePosition } from '@/lib/types';

/**
 * Fonction de calcul côté serveur pour les statistiques mensuelles
 * Réplique la logique de useMonthlyItems mais s'exécute uniquement côté serveur
 */
export function calculateMonthlyStats(items: MonthlyItem[]): MonthlyCalculation {
  // 1. Tri par cycle de paye
  const sortedItems = [...items].sort((a, b) => {
    const positionA = getPayCyclePosition(a.dayOfMonth);
    const positionB = getPayCyclePosition(b.dayOfMonth);
    return positionA - positionB;
  });

  // 2. Calculer le revenu total
  const totalIncome = sortedItems
    .filter((item): item is MonthlyIncome => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  // 3. Calculer les dépenses totales (avec support des crédits)
  const totalExpenses = sortedItems
    .filter((item): item is MonthlyExpense => item.type === 'expense')
    .reduce((sum, item) => {
      if (item.isCredit) {
        const creditInfo = calculateCreditInfo(item);
        if (creditInfo && creditInfo.isActive) {
          return sum + creditInfo.monthlyAmount;
        }
        return sum; // Crédit inactif, pas de prélèvement
      }
      return sum + item.amount;
    }, 0);

  // 4. Calculer le solde restant
  const remaining = totalIncome - totalExpenses;

  // 5. Position actuelle dans le cycle de paye
  const currentPosition = getCurrentPayCyclePosition();

  // 6. Calculer les dépenses restantes ce mois-ci (après la date actuelle)
  const remainingThisMonth = sortedItems
    .filter((item): item is MonthlyExpense => item.type === 'expense')
    .filter(item => getPayCyclePosition(item.dayOfMonth) > currentPosition)
    .reduce((sum, item) => {
      if (item.isCredit) {
        const creditInfo = calculateCreditInfo(item);
        if (creditInfo && creditInfo.isActive) {
          return sum + creditInfo.monthlyAmount;
        }
        return sum;
      }
      return sum + item.amount;
    }, 0);

  // 7. Calculer les crédits actifs
  const activeCredits = sortedItems
    .filter((item): item is MonthlyExpense => item.type === 'expense')
    .filter(item => item.isCredit === true)
    .reduce((acc, item) => {
      const creditInfo = calculateCreditInfo(item);
      if (creditInfo && creditInfo.isActive) {
        return {
          count: acc.count + 1,
          totalRemaining: acc.totalRemaining + creditInfo.remainingAmount,
          totalMonthly: acc.totalMonthly + creditInfo.monthlyAmount,
        };
      }
      return acc;
    }, { count: 0, totalRemaining: 0, totalMonthly: 0 });

  return {
    totalIncome,
    totalExpenses,
    remaining,
    remainingThisMonth,
    items: sortedItems,
    activeCredits,
    currentPosition,
  };
}

/**
 * Filtre les items par type
 */
export function filterItemsByType(items: MonthlyItem[], type: 'income' | 'expense'): MonthlyItem[] {
  return items.filter(item => item.type === type);
}

/**
 * Récupère uniquement les crédits actifs
 */
export function getActiveCreditsFromItems(items: MonthlyItem[]): MonthlyExpense[] {
  const now = new Date();

  return items
    .filter((item): item is MonthlyExpense => item.type === 'expense' && item.isCredit === true)
    .filter(item => {
      if (!item.creditStartDate || !item.creditDuration) {
        return false;
      }

      // Calculer la date de fin
      const endDate = new Date(item.creditStartDate);
      endDate.setMonth(endDate.getMonth() + item.creditDuration);

      // Vérifier si le crédit est toujours actif
      return now >= item.creditStartDate && now <= endDate;
    });
}

/**
 * Calcule les statistiques pour les petites dépenses récurrentes (< 20€)
 */
export function getSmallRecurringExpenses(items: MonthlyItem[]) {
  return items
    .filter((item): item is MonthlyExpense => item.type === 'expense')
    .filter(item => !item.isCredit && item.amount < 20)
    .sort((a, b) => a.dayOfMonth - b.dayOfMonth);
}

/**
 * Calcule le total des petites dépenses
 */
export function calculateSmallExpensesTotal(items: MonthlyItem[]): number {
  const smallExpenses = getSmallRecurringExpenses(items);
  return smallExpenses.reduce((sum, item) => sum + item.amount, 0);
}
