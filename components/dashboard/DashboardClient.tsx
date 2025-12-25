'use client';

import { useState, useMemo } from 'react';
import { Plus, Calendar as CalendarIcon, List, Columns, TableProperties, Grid3x3, Activity, LayoutGrid } from 'lucide-react';
import { MonthlyItem, MonthlyExpense, getPayCyclePosition } from '@/lib/types';
import { useExpensesStore } from '@/lib/store/expenses';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import MonthlyItemCard from './MonthlyItemCard';
import { ItemTypeSelector } from '@/components/forms/ItemTypeSelector';
import { SimpleExpenseForm } from '@/components/forms/SimpleExpenseForm';
import { CreditExpenseForm } from '@/components/forms/CreditExpenseForm';
import { SimpleIncomeForm } from '@/components/forms/SimpleIncomeForm';
import TimeIndicator from './TimeIndicator';
import Footer from '@/components/ui/Footer';
import Calendar from '@/components/calendar/Calendar';
import TimelineView from '@/components/views/TimelineView';
import CompactView from '@/components/views/CompactView';
import HeatmapView from '@/components/views/HeatmapView';
import KanbanView from '@/components/views/KanbanView';
import TreemapView from '@/components/views/TreemapView';

/**
 * Client Component pour le Dashboard
 * Lit les données depuis le store Zustand global
 * Gère l'interactivité (state, modals, mutations)
 */
export function DashboardClient() {
  // Lire depuis le store Zustand
  const { items, calculation, deleteExpense, isLoading } = useExpensesStore();

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MonthlyItem | undefined>();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'credit' | 'non-credit'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'timeline' | 'compact' | 'heatmap' | 'kanban' | 'treemap'>('list');

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'income') return items.filter(item => item.type === 'income');
    if (filter === 'expense') return items.filter(item => item.type === 'expense');
    if (filter === 'credit') return items.filter(item => {
      if (item.type !== 'expense') return false;
      return (item as MonthlyExpense).isCredit === true;
    });
    if (filter === 'non-credit') return items.filter(item => {
      if (item.type !== 'expense') return false;
      return (item as MonthlyExpense).isCredit !== true;
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
      // Check if it's a credit
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
          {/* Action Buttons */}
          <div className="mb-6">
              {/* View Mode Selector */}
              <div className="mb-4 overflow-x-auto">
                <div className="relative flex bg-muted border border-border rounded-lg p-1 min-w-max gap-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                      viewMode === 'list' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {viewMode === 'list' && (
                      <motion.div layoutId="viewmode-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <List className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Liste</span>
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                      viewMode === 'timeline' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {viewMode === 'timeline' && (
                      <motion.div layoutId="viewmode-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <Activity className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Timeline</span>
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                      viewMode === 'compact' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {viewMode === 'compact' && (
                      <motion.div layoutId="viewmode-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <TableProperties className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Compact</span>
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                      viewMode === 'kanban' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {viewMode === 'kanban' && (
                      <motion.div layoutId="viewmode-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <Columns className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Kanban</span>
                  </button>
                  <button
                    onClick={() => setViewMode('heatmap')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                      viewMode === 'heatmap' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {viewMode === 'heatmap' && (
                      <motion.div layoutId="viewmode-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <Grid3x3 className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Heatmap</span>
                  </button>
                  <button
                    onClick={() => setViewMode('treemap')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                      viewMode === 'treemap' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {viewMode === 'treemap' && (
                      <motion.div layoutId="viewmode-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <LayoutGrid className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Treemap</span>
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                      viewMode === 'calendar' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {viewMode === 'calendar' && (
                      <motion.div layoutId="viewmode-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <CalendarIcon className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Calendrier</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mb-4">
                {/* Filters - Only show for list view */}
                {viewMode === 'list' && (
                  <div className="relative flex bg-muted border border-border rounded-lg p-1 gap-1">
                  <button
                    onClick={() => setFilter('all')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                      filter === 'all' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filter === 'all' && (
                      <motion.div layoutId="filter-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <span className="relative z-10">Tout</span>
                  </button>
                  <button
                    onClick={() => setFilter('income')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                      filter === 'income' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filter === 'income' && (
                      <motion.div layoutId="filter-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <span className="relative z-10">Revenus</span>
                  </button>
                  <button
                    onClick={() => setFilter('expense')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                      filter === 'expense' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filter === 'expense' && (
                      <motion.div layoutId="filter-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <span className="relative z-10">Dépenses</span>
                  </button>
                  <button
                    onClick={() => setFilter('credit')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                      filter === 'credit' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filter === 'credit' && (
                      <motion.div layoutId="filter-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <span className="relative z-10">Crédits</span>
                  </button>
                  <button
                    onClick={() => setFilter('non-credit')}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                      filter === 'non-credit' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filter === 'non-credit' && (
                      <motion.div layoutId="filter-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }} />
                    )}
                    <span className="relative z-10">Simples</span>
                  </button>
                </div>
                )}

                {/* Single Add Button */}
                <Button
                  variant="default"
                  onClick={handleAddItem}
                  size="lg"
                  className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold ${viewMode !== 'list' ? 'ml-auto' : ''}`}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </div>

              {/* Content */}
              {viewMode === 'list' ? (
                <div className="space-y-2">
                  {filteredItems.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                          {filter === 'all' ? 'Aucun élément trouvé' :
                            filter === 'income' ? 'Aucun revenu trouvé' : 'Aucune dépense trouvée'}
                        </p>
                        <Button
                          variant="default"
                          onClick={handleAddItem}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter un élément
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    (() => {
                      const elements: React.ReactNode[] = [];
                      let timeIndicatorShown = false;

                      filteredItems.forEach((item) => {
                        const itemPosition = getPayCyclePosition(item.dayOfMonth);
                        const currentPosition = calculation.currentPosition;

                        if (!timeIndicatorShown && itemPosition > currentPosition) {
                          elements.push(
                            <TimeIndicator key="time-indicator" />
                          );
                          timeIndicatorShown = true;
                        }

                        elements.push(
                          <MonthlyItemCard
                            key={item.id}
                            item={item}
                            onEdit={handleEditItem}
                            onDelete={handleDeleteItem}
                            loading={isLoading}
                          />
                        );
                      });

                      if (!timeIndicatorShown) {
                        elements.push(
                          <TimeIndicator key="time-indicator" />
                        );
                      }

                      return elements;
                    })()
                  )}
                </div>
              ) : viewMode === 'timeline' ? (
                <TimelineView items={items} onEdit={handleEditItem} />
              ) : viewMode === 'compact' ? (
                <CompactView items={items} onEdit={handleEditItem} />
              ) : viewMode === 'heatmap' ? (
                <HeatmapView items={items} onEdit={handleEditItem} />
              ) : viewMode === 'kanban' ? (
                <KanbanView items={items} onEdit={handleEditItem} />
              ) : viewMode === 'treemap' ? (
                <TreemapView items={items} onEdit={handleEditItem} />
              ) : (
                <Calendar items={items} />
              )}
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
            item={editingItem as any}
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
    </div>
  );
}
