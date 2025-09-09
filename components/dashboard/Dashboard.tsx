'use client';

import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, LogOut, CreditCard, Calendar as CalendarIcon, List } from 'lucide-react';
import { MonthlyItem, FormData, CreateMonthlyItemInput, getPayCyclePosition } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useMonthlyItems } from '@/hooks/useMonthlyItems';
import { Card, CardHeader, CardContent } from '@/components/ui/icard';
import { Button } from '@/components/ui/button';
import MonthlyItemCard from './MonthlyItemCard';
import MonthlyItemForm from '@/components/forms/MonthlyItemForm';
import TimeIndicator from './TimeIndicator';
import Footer from '@/components/ui/Footer';
import Calendar from '@/components/calendar/Calendar';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { items, loading, error, addItem, updateItem, deleteItem, calculation } = useMonthlyItems(user?.uid);

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [editingItem, setEditingItem] = useState<MonthlyItem | undefined>();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

  const handleFormSubmit = async (formData: FormData) => {
    const itemData: CreateMonthlyItemInput = {
      userId: user!.uid,
      name: formData.name,
      amount: Number(formData.amount),
      dayOfMonth: Number(formData.dayOfMonth),
      icon: formData.icon,
      type: formType,
      ...(formType === 'expense' && {
        isCredit: formData.isCredit,
        ...(formData.isCredit && {
          totalCreditAmount: Number(formData.totalCreditAmount),
          creditStartDate: new Date(formData.creditStartDate!),
          creditDuration: Number(formData.creditDuration),
        }),
      }),
    };

    try {
      if (editingItem) {
        await updateItem({ id: editingItem.id, ...itemData });
      } else {
        await addItem(itemData);
      }
      setShowForm(false);
      setEditingItem(undefined);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground">Dépense-Man</h1>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground !px-2 sm:!px-4 py-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Déconnexion</span>
          </Button>
        </header>

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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mb-2 sm:mb-6">
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

        {/* View Mode & Filters */}
        <div className="mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-muted border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1 sm:flex-none rounded-md !px-4"
              >
                <List className="h-4 w-4" />
                Liste
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="flex-1 sm:flex-none rounded-md !px-4"
              >
                <CalendarIcon className="h-4 w-4" />
                Calendrier
              </Button>
            </div>

            {/* Filter (only for list view) */}
            {viewMode === 'list' && (
              <div className="flex bg-muted border border-border rounded-lg p-1">
                <Button
                  variant={filter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="flex-1 sm:flex-none rounded-md"
                >
                  Tout
                </Button>
                <Button
                  variant={filter === 'income' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('income')}
                  className="flex-1 sm:flex-none rounded-md"
                >
                  Revenus
                </Button>
                <Button
                  variant={filter === 'expense' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('expense')}
                  className="flex-1 sm:flex-none rounded-md"
                >
                  Dépenses
                </Button>
              </div>
            )}
          </div>
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

                  // Afficher l'indicateur si on passe la position actuelle
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

                // Si l'indicateur n'a pas été affiché (on est après tous les items), l'afficher à la fin
                if (!timeIndicatorShown) {
                  elements.push(
                    <TimeIndicator key="time-indicator" />
                  );
                }

                return elements;
              })()
            )}
          </div>
        ) : (
          <Calendar items={items} />
        )}

        {/* Error Message */}
        {error && (
          <Card className="mt-6 border-destructive">
            <CardContent>
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Form Modal */}
        {showForm && (
          <MonthlyItemForm
            type={formType}
            item={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(undefined);
            }}
            loading={loading}
          />
        )}
      </div>
      <Footer items={items} calculation={calculation} />
    </div>
  );
};

export default Dashboard; 