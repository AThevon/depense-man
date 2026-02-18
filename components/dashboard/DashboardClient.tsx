'use client';

import { useState, useMemo } from 'react';
import { MonthlyItem, MonthlyExpense, getPayCyclePosition, calculateCreditInfo } from '@/lib/types';
import { useExpensesStore } from '@/lib/store/expenses';
import { motion } from 'motion/react';
import MonthlyItemCard from './MonthlyItemCard';
import { ItemTypeSelector } from '@/components/forms/ItemTypeSelector';
import { SimpleExpenseForm } from '@/components/forms/SimpleExpenseForm';
import { CreditExpenseForm } from '@/components/forms/CreditExpenseForm';
import { SimpleIncomeForm } from '@/components/forms/SimpleIncomeForm';
import TimeIndicator from './TimeIndicator';

import { formatEuro } from '@/lib/format';

const filters = [
  { id: 'all', label: 'Tout' },
  { id: 'expense', label: 'Dépenses' },
  { id: 'credit', label: 'Crédits' },
  { id: 'income', label: 'Revenus' },
] as const;

type FilterId = (typeof filters)[number]['id'];

/**
 * Client Component pour le Dashboard
 * Lit les données depuis le store Zustand global
 * Gère l'interactivité (state, modals, mutations)
 */
export function DashboardClient() {
  const { items, deleteExpense, isLoading } = useExpensesStore();

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MonthlyItem | undefined>();
  const [filter, setFilter] = useState<FilterId>('all');
  const [simulatedDay, setSimulatedDay] = useState(() => new Date().getDate());

  // Calcul du "reste à payer"
  const remainingAmount = useMemo(() => {
    const simulatedPosition = getPayCyclePosition(simulatedDay);
    return items
      .filter((item): item is MonthlyExpense => item.type === 'expense')
      .filter(item => getPayCyclePosition(item.dayOfMonth) > simulatedPosition)
      .reduce((sum, item) => {
        if (item.isCredit) {
          const creditInfo = calculateCreditInfo(item);
          if (creditInfo?.isActive) return sum + creditInfo.monthlyAmount;
          return sum;
        }
        return sum + item.amount;
      }, 0);
  }, [items, simulatedDay]);

  // Items filtrés
  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'income') return items.filter(item => item.type === 'income');
    if (filter === 'expense') return items.filter(item => item.type === 'expense');
    if (filter === 'credit')
      return items.filter(item => {
        if (item.type !== 'expense') return false;
        return (item as MonthlyExpense).isCredit === true;
      });
    return items;
  }, [items, filter]);

  const handleAddItem = () => {
    setEditingItem(undefined);
    setShowTypeSelector(true);
  };

  const handleTypeSelect = (type: 'expense' | 'credit' | 'income') => {
    setShowTypeSelector(false);
    if (type === 'expense') {
      setShowExpenseForm(true);
    } else if (type === 'credit') {
      setShowCreditForm(true);
    } else {
      setShowIncomeForm(true);
    }
  };

  const handleEditItem = (item: MonthlyItem) => {
    setEditingItem(item);
    if (item.type === 'income') {
      setShowIncomeForm(true);
    } else {
      const expenseItem = item as MonthlyExpense;
      if (expenseItem.isCredit) {
        setShowCreditForm(true);
      } else {
        setShowExpenseForm(true);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowTypeSelector(false);
    setShowExpenseForm(false);
    setShowCreditForm(false);
    setShowIncomeForm(false);
    setEditingItem(undefined);
  };

  const handleFormCancel = () => {
    setShowTypeSelector(false);
    setShowExpenseForm(false);
    setShowCreditForm(false);
    setShowIncomeForm(false);
    setEditingItem(undefined);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteExpense(id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Position simulée pour déterminer past/future
  const simulatedPosition = getPayCyclePosition(simulatedDay);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 md:px-6 py-4 space-y-4">
        {/* Hero Card - Reste à payer */}
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Reste à payer</p>
          <p className="text-3xl font-bold tabular-nums text-destructive">
            {formatEuro(remainingAmount)}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Simuler jour :</span>
            <select
              value={simulatedDay}
              onChange={(e) => setSimulatedDay(Number(e.target.value))}
              className="text-xs bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg px-2 py-1 text-foreground"
            >
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  J{i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                filter === f.id
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter === f.id && (
                <motion.div
                  layoutId="filter-pill"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Liste des items */}
        <div className="space-y-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {filter === 'all'
                  ? 'Aucun élément trouvé'
                  : filter === 'income'
                    ? 'Aucun revenu trouvé'
                    : filter === 'credit'
                      ? 'Aucun crédit trouvé'
                      : 'Aucune dépense trouvée'}
              </p>
            </div>
          ) : (
            (() => {
              const elements: React.ReactNode[] = [];
              let timeIndicatorShown = false;

              filteredItems.forEach((item) => {
                const itemPosition = getPayCyclePosition(item.dayOfMonth);

                if (!timeIndicatorShown && itemPosition > simulatedPosition) {
                  elements.push(
                    <TimeIndicator key="time-indicator" day={simulatedDay} />
                  );
                  timeIndicatorShown = true;
                }

                const isPast = itemPosition <= simulatedPosition;

                elements.push(
                  <MonthlyItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    loading={isLoading}
                    isPast={isPast}
                  />
                );
              });

              if (!timeIndicatorShown) {
                elements.push(
                  <TimeIndicator key="time-indicator" day={simulatedDay} />
                );
              }

              return elements;
            })()
          )}
        </div>

        {/* Bouton Ajouter */}
        <button
          onClick={handleAddItem}
          className="w-full glass rounded-2xl py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {/* Form Modals */}
      {showTypeSelector && (
        <ItemTypeSelector
          onSelect={handleTypeSelect}
          onCancel={handleFormCancel}
        />
      )}

      {showExpenseForm && (
        <SimpleExpenseForm
          item={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {showCreditForm && (
        <CreditExpenseForm
          item={editingItem as MonthlyExpense | undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {showIncomeForm && (
        <SimpleIncomeForm
          item={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
