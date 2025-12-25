import { adminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/auth/session';
import { MonthlyItem } from '@/lib/types';

/**
 * Server Query pour récupérer toutes les dépenses et revenus de l'utilisateur
 * Cette fonction s'exécute côté serveur uniquement
 */
export async function getExpenses(): Promise<MonthlyItem[]> {
  // 1. Vérifier l'authentification
  const session = await requireAuth();

  try {
    // 2. Récupérer les items de l'utilisateur depuis Firestore
    const snapshot = await adminDb
      .collection('monthly_items')
      .where('userId', '==', session.userId)
      .get();

    // 3. Transformer les documents Firestore en objets MonthlyItem
    const items: MonthlyItem[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      items.push({
        id: doc.id,
        userId: data.userId,
        name: data.name,
        amount: data.amount,
        dayOfMonth: data.dayOfMonth,
        icon: data.icon,
        type: data.type as 'income' | 'expense',
        isCredit: data.isCredit || false,
        totalCreditAmount: data.totalCreditAmount,
        creditStartDate: data.creditStartDate?.toDate(),
        creditDuration: data.creditDuration,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      });
    });

    // 4. Trier par cycle de paye (du 29 au 28)
    // Le cycle commence le 29 (jour de paye) et se termine le 28
    const sortByPayCycle = (a: MonthlyItem, b: MonthlyItem) => {
      const getPayCyclePosition = (day: number) => {
        // Jours 29, 30, 31 viennent en premier (début du cycle)
        if (day >= 29) {
          return day - 29; // 29 -> 0, 30 -> 1, 31 -> 2
        }
        // Jours 1-28 viennent après (fin du cycle)
        return day + 3; // 1 -> 4, 2 -> 5, ..., 28 -> 31
      };

      return getPayCyclePosition(a.dayOfMonth) - getPayCyclePosition(b.dayOfMonth);
    };

    items.sort(sortByPayCycle);

    return items;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw new Error('Impossible de récupérer les dépenses');
  }
}

/**
 * Server Query pour récupérer une dépense/revenu spécifique
 */
export async function getExpenseById(id: string): Promise<MonthlyItem | null> {
  const session = await requireAuth();

  try {
    const doc = await adminDb.collection('monthly_items').doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();

    // Vérifier que l'item appartient à l'utilisateur
    if (data?.userId !== session.userId) {
      throw new Error('Non autorisé');
    }

    return {
      id: doc.id,
      userId: data.userId,
      name: data.name,
      amount: data.amount,
      dayOfMonth: data.dayOfMonth,
      icon: data.icon,
      type: data.type as 'income' | 'expense',
      isCredit: data.isCredit || false,
      totalCreditAmount: data.totalCreditAmount,
      creditStartDate: data.creditStartDate?.toDate(),
      creditDuration: data.creditDuration,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error fetching expense by id:', error);
    throw error;
  }
}

/**
 * Server Query pour récupérer uniquement les dépenses
 */
export async function getExpensesOnly(): Promise<MonthlyItem[]> {
  const items = await getExpenses();
  return items.filter(item => item.type === 'expense');
}

/**
 * Server Query pour récupérer uniquement les revenus
 */
export async function getIncomesOnly(): Promise<MonthlyItem[]> {
  const items = await getExpenses();
  return items.filter(item => item.type === 'income');
}

/**
 * Server Query pour récupérer les crédits actifs
 */
export async function getActiveCredits(): Promise<MonthlyItem[]> {
  const items = await getExpenses();
  const now = new Date();

  return items.filter(item => {
    if (!item.isCredit || !item.creditStartDate || !item.creditDuration) {
      return false;
    }

    // Calculer la date de fin
    const endDate = new Date(item.creditStartDate);
    endDate.setMonth(endDate.getMonth() + item.creditDuration);

    // Vérifier si le crédit est toujours actif
    return now >= item.creditStartDate && now <= endDate;
  });
}
