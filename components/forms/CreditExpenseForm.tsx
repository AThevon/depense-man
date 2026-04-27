'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MonthlyExpense } from '@/lib/types';
import { useExpensesStore } from '@/lib/store/expenses';
import { auth } from '@/lib/firebase';
import IconSelector from '@/components/ui/IconSelector';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface CreditExpenseFormProps {
  item?: MonthlyExpense;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreditExpenseForm({ item, onSuccess, onCancel }: CreditExpenseFormProps) {
  const isEditing = !!item;
  const { addExpense, updateExpense } = useExpensesStore();

  const [name, setName] = useState(item?.name || '');
  const [inputMode, setInputMode] = useState<'total' | 'monthly'>('total');
  const [totalCreditAmount, setTotalCreditAmount] = useState(item?.totalCreditAmount?.toString() || '');
  const [monthlyAmount, setMonthlyAmount] = useState(item?.amount?.toString() || '');
  const [creditDuration, setCreditDuration] = useState(item?.creditDuration?.toString() || '');
  const [creditStartDate, setCreditStartDate] = useState(
    item?.creditStartDate ? item.creditStartDate.toISOString().split('T')[0] : ''
  );
  const [dayOfMonth, setDayOfMonth] = useState(item?.dayOfMonth.toString() || '');
  const [icon, setIcon] = useState(item?.icon || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculatedMonthly =
    inputMode === 'total' && totalCreditAmount && creditDuration
      ? (parseFloat(totalCreditAmount) / parseInt(creditDuration)).toFixed(2)
      : monthlyAmount;

  const calculatedTotal =
    inputMode === 'monthly' && monthlyAmount && creditDuration
      ? (parseFloat(monthlyAmount) * parseInt(creditDuration)).toFixed(2)
      : totalCreditAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !creditDuration || !creditStartDate || !dayOfMonth || !icon) {
      setError('Tous les champs sont requis');
      return;
    }

    if (inputMode === 'total' && !totalCreditAmount) {
      setError('Le montant total est requis');
      return;
    }

    if (inputMode === 'monthly' && !monthlyAmount) {
      setError('La mensualité est requise');
      return;
    }

    const dayNum = parseInt(dayOfMonth);
    if (dayNum < 1 || dayNum > 31) {
      setError('Le jour doit être entre 1 et 31');
      return;
    }

    const durationNum = parseInt(creditDuration);
    if (durationNum < 1) {
      setError('La durée doit être au moins 1 mois');
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');

      const finalMonthly = parseFloat(calculatedMonthly);
      const finalTotal = parseFloat(calculatedTotal);

      const itemData = {
        userId: user.uid,
        name: name.trim(),
        amount: finalMonthly,
        dayOfMonth: dayNum,
        icon,
        type: 'expense' as const,
        isCredit: true,
        totalCreditAmount: finalTotal,
        creditStartDate: new Date(creditStartDate),
        creditDuration: durationNum,
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

  const formId = 'credit-expense-form';
  const showCalc = creditDuration && (inputMode === 'total' ? totalCreditAmount : monthlyAmount);

  return (
    <BottomSheet
      onClose={() => onCancel?.()}
      title={isEditing ? 'Modifier le crédit' : 'Nouveau crédit'}
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
      <form id={formId} onSubmit={handleSubmit} className="px-5 pb-5 pt-1 space-y-5">
        {/* Section: Identité */}
        <section className="space-y-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Identité
          </p>
          <div className="space-y-2">
            <Label htmlFor="name">Nom du crédit</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Voiture, Téléphone..."
              inputMode="text"
              autoComplete="off"
              disabled={loading}
              required
            />
          </div>
          <div>
            <IconSelector selectedIcon={icon} onIconSelect={setIcon} />
          </div>
        </section>

        {/* Section: Montants */}
        <section className="space-y-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Montants
          </p>

          <div>
            <Label className="mb-2 block">Je connais</Label>
            <div className="inline-flex w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl p-1 gap-0.5">
              <button
                type="button"
                onClick={() => setInputMode('total')}
                disabled={loading}
                className={`flex-1 h-10 text-sm font-medium rounded-lg transition-colors ${
                  inputMode === 'total'
                    ? 'bg-[rgba(255,255,255,0.08)] text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                Montant total
              </button>
              <button
                type="button"
                onClick={() => setInputMode('monthly')}
                disabled={loading}
                className={`flex-1 h-10 text-sm font-medium rounded-lg transition-colors ${
                  inputMode === 'monthly'
                    ? 'bg-[rgba(255,255,255,0.08)] text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                Mensualité
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {inputMode === 'total' ? (
              <div className="space-y-2">
                <Label htmlFor="totalCreditAmount">Total (€)</Label>
                <Input
                  id="totalCreditAmount"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={totalCreditAmount}
                  onChange={(e) => setTotalCreditAmount(e.target.value)}
                  placeholder="0,00"
                  disabled={loading}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="monthlyAmount">Mensualité (€)</Label>
                <Input
                  id="monthlyAmount"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="0,00"
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="creditDuration">Durée (mois)</Label>
              <Input
                id="creditDuration"
                type="number"
                min="1"
                inputMode="numeric"
                value={creditDuration}
                onChange={(e) => setCreditDuration(e.target.value)}
                placeholder="12"
                disabled={loading}
                required
              />
            </div>
          </div>

          {showCalc && (
            <div className="p-3.5 rounded-xl bg-primary/8 border border-primary/30 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {inputMode === 'total' ? 'Mensualité calculée' : 'Total calculé'}
              </p>
              <p className="font-display text-lg font-bold text-primary tabular-nums">
                {inputMode === 'total' ? calculatedMonthly : calculatedTotal} €
              </p>
            </div>
          )}
        </section>

        {/* Section: Échéance */}
        <section className="space-y-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Échéance
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="creditStartDate">Date de début</Label>
              <Input
                id="creditStartDate"
                type="date"
                value={creditStartDate}
                onChange={(e) => setCreditStartDate(e.target.value)}
                disabled={loading}
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
                disabled={loading}
                required
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/40 text-destructive text-sm">
            {error}
          </div>
        )}
      </form>
    </BottomSheet>
  );
}
