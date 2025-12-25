'use client';

import { useState, useMemo, useOptimistic } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar as CalendarIcon, List, Columns, TableProperties, Grid3x3, Activity, LayoutGrid, BarChart3 } from 'lucide-react';
import { MonthlyItem, MonthlyCalculation, getPayCyclePosition } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MonthlyItemCard from './MonthlyItemCard';
import { ExpenseFormModal } from '@/components/forms/ExpenseFormModal';
import { IncomeFormModal } from '@/components/forms/IncomeFormModal';
import TimeIndicator from './TimeIndicator';
import Footer from '@/components/ui/Footer';
import Calendar from '@/components/calendar/Calendar';
import StatsPageOptimized from '@/components/stats/StatsPageOptimized';
import TimelineView from '@/components/views/TimelineView';
import CompactView from '@/components/views/CompactView';
import HeatmapView from '@/components/views/HeatmapView';
import KanbanView from '@/components/views/KanbanView';
import TreemapView from '@/components/views/TreemapView';
import { AppHeader } from '@/components/layout/AppHeader';

interface DashboardClientProps {
  items: MonthlyItem[];
  calculation: MonthlyCalculation;
}

/**
 * Client Component pour le Dashboard
 * Reçoit les données depuis le Server Component parent
 * Gère uniquement l'interactivité (state, modals, etc.)
 */
export function DashboardClient({ items: initialItems, calculation: initialCalculation }: DashboardClientProps) {
  // Optimistic UI - mise à jour instantanée avant la confirmation serveur
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    initialItems,
    (state, newItem: MonthlyItem) => [...state, newItem]
  );

  const [mainTab, setMainTab] = useState<'dashboard' | 'stats'>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [editingItem, setEditingItem] = useState<MonthlyItem | undefined>();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'timeline' | 'compact' | 'heatmap' | 'kanban' | 'treemap'>('list');
  const [loading, setLoading] = useState(false);

  // Utiliser les items optimistes
  const items = optimisticItems;
  const calculation = initialCalculation; // TODO: recalculer avec optimisticItems

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(item => item.type === filter);
  }, [items, filter]);

  const handleAddItem = (type: 'income' | 'expense') => {
    setFormType(type);
    setEditingItem(undefined);
    setShowForm(true);
  };

  const handleEditItem = (item: MonthlyItem) => {
    setFormType(item.type);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(undefined);
    // Les données seront automatiquement mises à jour via revalidatePath()
  };

  const handleDeleteItem = async (id: string) => {
    // TODO: Implémenter delete avec Server Action + useOptimistic
    console.log('Delete item:', id);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getRemainingColor = (remaining: number) => {
    if (remaining > 0) return 'text-success';
    if (remaining < 0) return 'text-destructive';
    return 'text-primary';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <AppHeader />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 mb-4 sm:mb-6">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <div>
                  <h3 className="font-semibold">Revenus</h3>
                  <p className="text-sm text-muted-foreground">Total mensuel</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="text-lg md:text-3xl font-bold text-success">
                {formatAmount(calculation.totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <div>
                  <h3 className="font-semibold">Dépenses</h3>
                  <p className="text-sm text-muted-foreground">Total mensuel</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="text-lg md:text-3xl font-bold text-destructive">
                {formatAmount(calculation.totalExpenses)}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
                {formatAmount(calculation.remainingThisMonth)} restant ce mois
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <div>
                  <h3 className="font-semibold">Solde</h3>
                  <p className="text-sm text-muted-foreground">Après dépenses</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className={`text-lg md:text-3xl font-bold ${getRemainingColor(calculation.remaining)}`}>
                {formatAmount(calculation.remaining)}
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <div>
                  <h3 className="font-semibold">Crédits</h3>
                  <p className="text-sm text-muted-foreground">En cours</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="text-lg md:text-3xl font-bold text-primary">
                {calculation.activeCredits.count}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
                {formatAmount(calculation.activeCredits.totalMonthly)}/mois
              </div>
              <div className="text-xs text-muted-foreground mt-1 ">
                {formatAmount(calculation.activeCredits.totalRemaining)} restant
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs className="mb-6">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger
              active={mainTab === 'dashboard'}
              onClick={() => setMainTab('dashboard')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              active={mainTab === 'stats'}
              onClick={() => setMainTab('stats')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          {mainTab === 'dashboard' && (
            <TabsContent>
        {/* Action Buttons */}
        <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Button
                  variant="default"
                  onClick={() => handleAddItem('expense')}
                  size="lg"
                  className="flex-1 justify-center py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-semibold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle dépense
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAddItem('income')}
                  size="lg"
                  className="flex-1 justify-center py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-semibold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau revenu
                </Button>
              </div>

              {/* View Mode Selector */}
              <div className="mb-4 overflow-x-auto">
                <div className="flex bg-muted border border-border rounded-lg p-1 min-w-max">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-md !px-3"
                  >
                    <List className="h-4 w-4 mr-1" />
                    Liste
                  </Button>
                  <Button
                    variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('timeline')}
                    className="rounded-md !px-3"
                  >
                    <Activity className="h-4 w-4 mr-1" />
                    Timeline
                  </Button>
                  <Button
                    variant={viewMode === 'compact' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('compact')}
                    className="rounded-md !px-3"
                  >
                    <TableProperties className="h-4 w-4 mr-1" />
                    Compact
                  </Button>
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className="rounded-md !px-3"
                  >
                    <Columns className="h-4 w-4 mr-1" />
                    Kanban
                  </Button>
                  <Button
                    variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('heatmap')}
                    className="rounded-md !px-3"
                  >
                    <Grid3x3 className="h-4 w-4 mr-1" />
                    Heatmap
                  </Button>
                  <Button
                    variant={viewMode === 'treemap' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('treemap')}
                    className="rounded-md !px-3"
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    Treemap
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                    className="rounded-md !px-3"
                  >
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Calendrier
                  </Button>
                </div>
              </div>

              {/* Filters (only for list view) */}
              {viewMode === 'list' && (
                <div className="mb-4">
                  <div className="flex bg-muted border border-border rounded-lg p-1 w-fit">
                    <Button
                      variant={filter === 'all' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter('all')}
                      className="rounded-md"
                    >
                      Tout
                    </Button>
                    <Button
                      variant={filter === 'income' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter('income')}
                      className="rounded-md"
                    >
                      Revenus
                    </Button>
                    <Button
                      variant={filter === 'expense' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter('expense')}
                      className="rounded-md"
                    >
                      Dépenses
                    </Button>
                  </div>
                </div>
              )}

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
                          onClick={() => handleAddItem(filter === 'income' ? 'income' : 'expense')}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {filter === 'income' ? 'Ajouter un revenu' : 'Ajouter une dépense'}
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
                            loading={loading}
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
            </TabsContent>
          )}

          {mainTab === 'stats' && (
            <TabsContent>
              <StatsPageOptimized
                items={items}
                totalIncome={calculation.totalIncome}
                totalExpenses={calculation.totalExpenses}
                remaining={calculation.remaining}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Form Modals */}
        {showForm && formType === 'expense' && (
          <ExpenseFormModal
            item={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(undefined);
            }}
          />
        )}

        {showForm && formType === 'income' && (
          <IncomeFormModal
            item={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(undefined);
            }}
          />
        )}
      </div>
      <Footer items={items} calculation={calculation} />
    </div>
  );
}
