'use client';

import { useState, useMemo } from 'react';
import { MonthlyItem, MonthlyExpense, getPayCyclePosition, calculateCreditInfo } from '@/lib/types';
import { useExpensesStore } from '@/lib/store/expenses';
import { formatEuro } from '@/lib/format';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Wallet, Scale } from 'lucide-react';
import MonthlyItemCard from './MonthlyItemCard';
import { ItemTypeSelector } from '@/components/forms/ItemTypeSelector';
import { SimpleExpenseForm } from '@/components/forms/SimpleExpenseForm';
import { CreditExpenseForm } from '@/components/forms/CreditExpenseForm';
import { SimpleIncomeForm } from '@/components/forms/SimpleIncomeForm';
import TimeIndicator from './TimeIndicator';

const filters = [
  { id: 'all', label: 'Tout' },
  { id: 'expense', label: 'Dépenses' },
  { id: 'credit', label: 'Crédits' },
  { id: 'income', label: 'Revenus' },
] as const;

type FilterId = (typeof filters)[number]['id'];

const EASE_SNAPPY: [number, number, number, number] = [0.2, 0, 0, 1];

const heroContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_SNAPPY },
  },
};

export function DashboardClient() {
  const { items, deleteExpense, isLoading } = useExpensesStore();

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MonthlyItem | undefined>();
  const [filter, setFilter] = useState<FilterId>('all');
  const [simulatedDay, setSimulatedDay] = useState(() => new Date().getDate());

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

  const totalActiveExpenses = useMemo(() => {
    return items
      .filter((item): item is MonthlyExpense => item.type === 'expense')
      .reduce((sum, item) => {
        if (item.isCredit) {
          const creditInfo = calculateCreditInfo(item);
          return creditInfo?.isActive ? sum + creditInfo.monthlyAmount : sum;
        }
        return sum + item.amount;
      }, 0);
  }, [items]);

  const totalIncome = useMemo(() => {
    return items
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const balance = totalIncome - totalActiveExpenses;

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

  const simulatedPosition = getPayCyclePosition(simulatedDay);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 md:px-6 py-5 space-y-5">
        {/* Hero Card - Aurora Cockpit */}
        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden glass rounded-3xl p-6 md:p-8"
        >
          {/* Aurora ambient glow */}
          <div
            aria-hidden
            className="aurora-glow pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full"
            style={{
              background:
                'radial-gradient(circle at center, rgba(251,146,60,0.20) 0%, rgba(251,146,60,0.05) 40%, transparent 70%)',
            }}
          />
          {/* Secondary cool glow for depth */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -right-20 h-[22rem] w-[22rem] rounded-full opacity-40"
            style={{
              background:
                'radial-gradient(circle at center, rgba(239,68,68,0.12) 0%, transparent 65%)',
            }}
          />

          <div className="relative">
            {/* Label with pulse dot */}
            <motion.div variants={heroItem} className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
              </span>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Reste à payer
              </p>
            </motion.div>

            {/* Main amount with gradient */}
            <motion.p
              variants={heroItem}
              className="hero-amount font-display text-5xl sm:text-6xl md:text-7xl font-bold tabular-nums tracking-tight leading-none"
            >
              {formatEuro(remainingAmount)}
            </motion.p>

            {/* Day simulator chip */}
            <motion.div variants={heroItem} className="mt-4">
              <div className="inline-flex items-center gap-2 pl-3 pr-1 py-1 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Jour
                </span>
                <select
                  value={simulatedDay}
                  onChange={(e) => setSimulatedDay(Number(e.target.value))}
                  className="text-xs font-semibold bg-transparent text-foreground border-0 outline-none cursor-pointer pr-1.5 py-1"
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-[#1a1a1f]">
                      J{i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* Stats row - persistent metrics */}
            <motion.div
              variants={heroItem}
              className="mt-7 pt-5 border-t border-[rgba(255,255,255,0.06)] grid grid-cols-2 gap-4"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Wallet className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Total dépenses
                  </p>
                </div>
                <p className="font-display text-xl md:text-2xl font-bold tabular-nums text-foreground/95">
                  {formatEuro(totalActiveExpenses)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Scale className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Balance
                  </p>
                </div>
                <p
                  className={`font-display text-xl md:text-2xl font-bold tabular-nums ${
                    balance >= 0 ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {balance >= 0 ? '+' : ''}
                  {formatEuro(balance)}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32, ease: EASE_SNAPPY }}
          className="flex"
        >
          <div className="inline-flex bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl p-1 gap-0.5">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`relative px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 rounded-lg ${
                  filter === f.id
                    ? 'text-white'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {filter === f.id && (
                  <motion.div
                    layoutId="filter-pill"
                    className="absolute inset-0 gradient-active rounded-lg"
                    transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
                  />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Liste des items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-0"
        >
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
        </motion.div>

        {/* Bouton Ajouter */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          whileTap={{ scale: 0.985 }}
          onClick={handleAddItem}
          className="group w-full glass rounded-2xl py-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.05)] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          <span>Ajouter</span>
        </motion.button>
      </div>

      {/* Form Modals — wrapped in AnimatePresence for slide-out exits */}
      <AnimatePresence>
        {showTypeSelector && (
          <ItemTypeSelector
            key="type-selector"
            onSelect={handleTypeSelect}
            onCancel={handleFormCancel}
          />
        )}
        {showExpenseForm && (
          <SimpleExpenseForm
            key="expense-form"
            item={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}
        {showCreditForm && (
          <CreditExpenseForm
            key="credit-form"
            item={editingItem as MonthlyExpense | undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}
        {showIncomeForm && (
          <SimpleIncomeForm
            key="income-form"
            item={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
