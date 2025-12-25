import { create } from 'zustand';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MonthlyItem, CreateMonthlyItemInput, UpdateMonthlyItemInput, getPayCyclePosition } from '@/lib/types';
import { calculateMonthlyStats } from '@/lib/utils/calculations';

const COLLECTION_NAME = 'monthly_items';

interface ExpensesStore {
  items: MonthlyItem[];
  calculation: ReturnType<typeof calculateMonthlyStats>;
  isLoading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  // Actions
  initListener: (userId: string) => void;
  addExpense: (itemData: CreateMonthlyItemInput) => Promise<void>;
  updateExpense: (itemData: UpdateMonthlyItemInput) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  reset: () => void;
}

const initialCalculation = {
  totalIncome: 0,
  totalExpenses: 0,
  remaining: 0,
  remainingThisMonth: 0,
  items: [],
  activeCredits: { count: 0, totalRemaining: 0, totalMonthly: 0 },
  currentPosition: 0,
};

export const useExpensesStore = create<ExpensesStore>((set, get) => ({
  items: [],
  calculation: initialCalculation,
  isLoading: true,
  error: null,
  unsubscribe: null,

  initListener: (userId: string) => {
    // Cleanup existant
    const currentUnsub = get().unsubscribe;
    if (currentUnsub) {
      currentUnsub();
    }

    set({ isLoading: true, error: null });

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemsData: MonthlyItem[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const item: MonthlyItem = {
            id: docSnap.id,
            userId: data.userId,
            name: data.name,
            amount: data.amount,
            dayOfMonth: data.dayOfMonth,
            icon: data.icon,
            type: data.type,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            ...(data.type === 'expense' && {
              isCredit: data.isCredit || false,
              totalCreditAmount: data.totalCreditAmount,
              creditStartDate: data.creditStartDate?.toDate(),
              creditDuration: data.creditDuration,
            }),
          };
          itemsData.push(item);
        });

        // Tri par cycle de paye
        const sortedItems = [...itemsData].sort((a, b) => {
          const positionA = getPayCyclePosition(a.dayOfMonth);
          const positionB = getPayCyclePosition(b.dayOfMonth);
          return positionA - positionB;
        });

        const calculation = calculateMonthlyStats(sortedItems);

        set({
          items: sortedItems,
          calculation,
          isLoading: false,
          error: null,
        });
      },
      (err) => {
        console.error('Error fetching monthly items:', err);
        set({
          error: 'Erreur lors de la récupération des données',
          isLoading: false,
        });
      }
    );

    set({ unsubscribe });
  },

  addExpense: async (itemData: CreateMonthlyItemInput) => {
    try {
      set({ error: null });

      const newItem = {
        ...itemData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = {
        id: tempId,
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as MonthlyItem;

      const currentItems = get().items;
      const updatedItems = [...currentItems, optimisticItem].sort((a, b) => {
        return getPayCyclePosition(a.dayOfMonth) - getPayCyclePosition(b.dayOfMonth);
      });
      const calculation = calculateMonthlyStats(updatedItems);

      set({ items: updatedItems, calculation });

      // Firebase update (listener mettra à jour avec le vrai ID)
      await addDoc(collection(db, COLLECTION_NAME), newItem);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout";
      set({ error: errorMessage });
      throw err;
    }
  },

  updateExpense: async (itemData: UpdateMonthlyItemInput) => {
    try {
      set({ error: null });

      const { id, ...updateData } = itemData;

      // Optimistic update
      const currentItems = get().items;
      const updatedItems = currentItems.map((item) =>
        item.id === id ? ({ ...item, ...updateData, updatedAt: new Date() } as MonthlyItem) : item
      );
      const calculation = calculateMonthlyStats(updatedItems);

      set({ items: updatedItems, calculation });

      // Firebase update
      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, COLLECTION_NAME, id), updatePayload);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      set({ error: errorMessage });
      throw err;
    }
  },

  deleteExpense: async (id: string) => {
    try {
      set({ error: null });

      // Optimistic update
      const currentItems = get().items;
      const updatedItems = currentItems.filter((item) => item.id !== id);
      const calculation = calculateMonthlyStats(updatedItems);

      set({ items: updatedItems, calculation });

      // Firebase update
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      set({ error: errorMessage });
      throw err;
    }
  },

  reset: () => {
    const currentUnsub = get().unsubscribe;
    if (currentUnsub) {
      currentUnsub();
    }

    set({
      items: [],
      calculation: initialCalculation,
      isLoading: false,
      error: null,
      unsubscribe: null,
    });
  },
}));
