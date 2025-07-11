'use client';

import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, LogOut, CreditCard, Calendar as CalendarIcon, List } from 'lucide-react';
import { MonthlyItem, FormData, CreateMonthlyItemInput, getPayCyclePosition } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useMonthlyItems } from '@/hooks/useMonthlyItems';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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
    if (remaining > 0) return 'text-green-400';
    if (remaining < 0) return 'text-red-400';
    return 'text-primary';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-secondary">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Dépense-Man!</h1>
            <p className="text-secondary mt-1">Attention aux sous...</p>
          </div>
          <Button
            variant="ghost"
            icon={LogOut}
            onClick={handleSignOut}
            className="text-secondary hover:text-primary"
          >
            Déconnexion
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card variant="elevated">
            <CardHeader
              icon={TrendingUp}
              title="Revenus"
              subtitle="Total mensuel"
            />
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {formatAmount(calculation.totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader
              icon={TrendingDown}
              title="Dépenses"
              subtitle="Total mensuel"
            />
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {formatAmount(calculation.totalExpenses)}
              </div>
              <div className="text-sm text-secondary mt-1">
                {formatAmount(calculation.remainingThisMonth)} restant ce mois
              </div>
            </CardContent>
          </Card>
          
          <Card variant="elevated">
            <CardHeader
              icon={DollarSign}
              title="Restant"
              subtitle="Après dépenses"
            />
            <CardContent>
              <div className={`text-2xl font-bold ${getRemainingColor(calculation.remaining)}`}>
                {formatAmount(calculation.remaining)}
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader
              icon={CreditCard}
              title="Crédits"
              subtitle="En cours"
            />
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {calculation.activeCredits.count}
              </div>
              <div className="text-sm text-secondary mt-1">
                {formatAmount(calculation.activeCredits.totalMonthly)}/mois
              </div>
              <div className="text-xs text-secondary mt-1">
                {formatAmount(calculation.activeCredits.totalRemaining)} restant
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleAddItem('expense')}
            size="lg"
            className="w-full justify-center py-3 px-4"
          >
            <span className="hidden sm:inline">Ajouter une dépense</span>
            <span className="sm:hidden">Dépense</span>
          </Button>
          <Button
          variant="outline"
            icon={Plus}
            onClick={() => handleAddItem('income')}
            size="lg"
            className="w-full justify-center py-3 px-4"
          >
            <span className="hidden sm:inline">Ajouter un revenu</span>
            <span className="sm:hidden">Revenu</span>
          </Button>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6">
          {/* Desktop version */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                icon={List}
              >
                Liste
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                icon={CalendarIcon}
              >
                Calendrier
              </Button>
            </div>
            
            {/* Filter (only for list view) */}
            {viewMode === 'list' && (
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Tout
                </Button>
                <Button
                  variant={filter === 'income' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('income')}
                >
                  Revenus
                </Button>
                <Button
                  variant={filter === 'expense' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('expense')}
                >
                  Dépenses
                </Button>
              </div>
            )}
          </div>

          {/* Mobile version */}
          <div className="md:hidden space-y-3">
            {/* View Mode Toggle */}
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                icon={List}
                className="flex-1"
              >
                Liste
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                icon={CalendarIcon}
                className="flex-1"
              >
                Calendrier
              </Button>
            </div>
            
            {/* Filter (only for list view on mobile) */}
            {viewMode === 'list' && (
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="flex-1"
                >
                  Tout
                </Button>
                <Button
                  variant={filter === 'income' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('income')}
                  className="flex-1"
                >
                  Revenus
                </Button>
                <Button
                  variant={filter === 'expense' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('expense')}
                  className="flex-1"
                >
                  Dépenses
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-secondary mb-4">
                    {filter === 'all' ? 'Aucun élément trouvé' : 
                     filter === 'income' ? 'Aucun revenu trouvé' : 'Aucune dépense trouvée'}
                  </p>
                  <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => handleAddItem(filter === 'income' ? 'income' : 'expense')}
                  >
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
          <Card variant="outlined" className="mt-6 border-red-500">
            <CardContent>
              <p className="text-red-400">{error}</p>
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
      <Footer />
    </div>
  );
};

export default Dashboard; 