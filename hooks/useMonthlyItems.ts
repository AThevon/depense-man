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
  MonthlyIncome 
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
              remainingPayments: data.remainingPayments,
              totalPayments: data.totalPayments,
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
      // Fonction pour calculer la position dans le cycle (jour de paye = 0)
      const getPayCyclePosition = (dayOfMonth: number, payDay: number = 29) => {
        if (dayOfMonth >= payDay) {
          return dayOfMonth - payDay; // Jours après la paye
        } else {
          return (31 - payDay) + dayOfMonth; // Jours du mois suivant
        }
      };

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
      .reduce((sum, item) => sum + item.amount, 0);

    const remaining = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      remaining,
      items: sortedItems,
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