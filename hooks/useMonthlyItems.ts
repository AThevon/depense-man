'use client';

import { useState, useEffect, useMemo } from 'react';
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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  MonthlyItem, 
  MonthlyCalculation, 
  CreateMonthlyItemInput, 
  UpdateMonthlyItemInput, 
  UseMonthlyItemsReturn,
  MonthlyExpense,
  MonthlyIncome,
  calculateCreditInfo,
  getPayCyclePosition,
  getCurrentPayCyclePosition
} from '@/lib/types';

const COLLECTION_NAME = 'monthly_items';

export function useMonthlyItems(userId: string | undefined): UseMonthlyItemsReturn {
  const [items, setItems] = useState<MonthlyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Écoute en temps réel des données Firestore
  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemsData: MonthlyItem[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const item: MonthlyItem = {
            id: doc.id,
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

        setItems(itemsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching monthly items:', err);
        setError('Erreur lors de la récupération des données');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  // Tri intelligent par cycle de paye (commence au jour de paye)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const positionA = getPayCyclePosition(a.dayOfMonth);
      const positionB = getPayCyclePosition(b.dayOfMonth);

      return positionA - positionB;
    });
  }, [items]);

  // Calcul automatique des totaux
  const calculation = useMemo((): MonthlyCalculation => {
    const totalIncome = sortedItems
      .filter((item): item is MonthlyIncome => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = sortedItems
      .filter((item): item is MonthlyExpense => item.type === 'expense')
      .reduce((sum, item) => {
        if (item.isCredit) {
          const creditInfo = calculateCreditInfo(item);
          if (creditInfo && creditInfo.isActive) {
            return sum + creditInfo.monthlyAmount;
          }
          return sum; // Credit inactif, pas de prélèvement
        }
        return sum + item.amount;
      }, 0);

    const remaining = totalIncome - totalExpenses;

    // Position actuelle dans le cycle de paye
    const currentPosition = getCurrentPayCyclePosition();

    // Calcul des dépenses restantes ce mois-ci (après la date actuelle)
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

    // Calcul des crédits actifs
    const activeCredits = sortedItems
      .filter(item => item.type === 'expense')
      .map(item => item as MonthlyExpense)
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
  }, [sortedItems]);

  // Ajouter un élément
  const addItem = async (itemData: CreateMonthlyItemInput): Promise<void> => {
    try {
      setError(null);
      
      const newItem = {
        ...itemData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, COLLECTION_NAME), newItem);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout';
      setError(errorMessage);
      throw err;
    }
  };

  // Mettre à jour un élément
  const updateItem = async (itemData: UpdateMonthlyItemInput): Promise<void> => {
    try {
      setError(null);
      
      const { id, ...updateData } = itemData;
      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, COLLECTION_NAME, id), updatePayload);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw err;
    }
  };

  // Supprimer un élément
  const deleteItem = async (id: string): Promise<void> => {
    try {
      setError(null);
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    items: sortedItems,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    calculation,
  };
} 