'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MonthlyItem } from '@/lib/types';
import { useExpensesStore } from '@/lib/store/expenses';
import { auth } from '@/lib/firebase';
import IconSelector from '@/components/ui/IconSelector';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface SimpleIncomeFormProps {
  item?: MonthlyItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SimpleIncomeForm({ item, onSuccess, onCancel }: SimpleIncomeFormProps) {
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
        type: 'income' as const,
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

  const formId = 'simple-income-form';

  return (
    <BottomSheet
      onClose={() => onCancel?.()}
      title={isEditing ? 'Modifier le revenu' : 'Nouveau revenu'}
      footer={
        <div className="flex gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-12"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={loading}
            className="flex-1 h-12"
          >
            {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="px-5 pb-5 pt-1 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du revenu</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Salaire, Prime..."
            inputMode="text"
            autoComplete="off"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dayOfMonth">Jour</Label>
            <Input
              id="dayOfMonth"
              type="number"
              min="1"
              max="31"
              inputMode="numeric"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              placeholder="1-31"
              required
            />
          </div>
        </div>

        <div>
          <IconSelector selectedIcon={icon} onIconSelect={setIcon} />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/40 text-destructive text-sm">
            {error}
          </div>
        )}
      </form>
    </BottomSheet>
  );
}
