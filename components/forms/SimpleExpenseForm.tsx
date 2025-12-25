'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { MonthlyItem } from '@/lib/types';
import { useExpensesStore } from '@/lib/store/expenses';
import { auth } from '@/lib/firebase';
import IconSelector from '@/components/ui/IconSelector';

interface SimpleExpenseFormProps {
  item?: MonthlyItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SimpleExpenseForm({ item, onSuccess, onCancel }: SimpleExpenseFormProps) {
  const isEditing = !!item;
  const { addExpense, updateExpense } = useExpensesStore();

  const [name, setName] = useState(item?.name || '');
  const [amount, setAmount] = useState(item?.amount.toString() || '');
  const [dayOfMonth, setDayOfMonth] = useState(item?.dayOfMonth.toString() || '');
  const [icon, setIcon] = useState(item?.icon || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim() || !amount || !dayOfMonth || !icon) {
      setError('Tous les champs sont requis');
      return;
    }

    const dayNum = parseInt(dayOfMonth);
    if (dayNum < 1 || dayNum > 31) {
      setError('Le jour doit être entre 1 et 31');
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');

      const itemData = {
        userId: user.uid,
        name: name.trim(),
        amount: parseFloat(amount),
        dayOfMonth: dayNum,
        icon,
        type: 'expense' as const,
        isCredit: false,
      };

      if (isEditing) {
        await updateExpense({ id: item.id, ...itemData });
      } else {
        await addExpense(itemData);
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Modifier la dépense' : 'Nouvelle dépense'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel} >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la dépense</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Courses, Essence..."
                
                required
              />
            </div>

            {/* Montant */}
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                
                required
              />
            </div>

            {/* Jour du mois */}
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Jour du mois</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                placeholder="1-31"
                
                required
              />
            </div>

            {/* Icône */}
            <div className="space-y-2">
              <IconSelector
                selectedIcon={icon}
                onIconSelect={setIcon}
                
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit"  className="flex-1">
                {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
