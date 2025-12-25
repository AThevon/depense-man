'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { MonthlyItem, MonthlyExpense } from '@/lib/types';
import { useExpensesStore } from '@/lib/store/expenses';
import { auth } from '@/lib/firebase';
import IconSelector from '@/components/ui/IconSelector';

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
  const [monthlyAmount, setMonthlyAmount] = useState(
    item?.amount?.toString() || ''
  );
  const [creditDuration, setCreditDuration] = useState(item?.creditDuration?.toString() || '');
  const [creditStartDate, setCreditStartDate] = useState(
    item?.creditStartDate ? item.creditStartDate.toISOString().split('T')[0] : ''
  );
  const [dayOfMonth, setDayOfMonth] = useState(item?.dayOfMonth.toString() || '');
  const [icon, setIcon] = useState(item?.icon || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculs automatiques
  const calculatedMonthly = inputMode === 'total' && totalCreditAmount && creditDuration
    ? (parseFloat(totalCreditAmount) / parseInt(creditDuration)).toFixed(2)
    : monthlyAmount;

  const calculatedTotal = inputMode === 'monthly' && monthlyAmount && creditDuration
    ? (parseFloat(monthlyAmount) * parseInt(creditDuration)).toFixed(2)
    : totalCreditAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Modifier le crédit' : 'Nouveau crédit'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel} >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du crédit</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Voiture, Téléphone..."
                disabled={loading}
                required
              />
            </div>

            {/* Mode de saisie */}
            <div className="space-y-2">
              <Label>Je connais</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={inputMode === 'total' ? 'default' : 'outline'}
                  onClick={() => setInputMode('total')}
                  disabled={loading}
                >
                  Montant total
                </Button>
                <Button
                  type="button"
                  variant={inputMode === 'monthly' ? 'default' : 'outline'}
                  onClick={() => setInputMode('monthly')}
                  disabled={loading}
                >
                  Mensualité
                </Button>
              </div>
            </div>

            {/* Montant total OU Mensualité */}
            {inputMode === 'total' ? (
              <div className="space-y-2">
                <Label htmlFor="totalCreditAmount">Montant total du crédit (€)</Label>
                <Input
                  id="totalCreditAmount"
                  type="number"
                  step="0.01"
                  value={totalCreditAmount}
                  onChange={(e) => setTotalCreditAmount(e.target.value)}
                  placeholder="0.00"
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
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                  required
                />
              </div>
            )}

            {/* Durée */}
            <div className="space-y-2">
              <Label htmlFor="creditDuration">Durée (mois)</Label>
              <Input
                id="creditDuration"
                type="number"
                min="1"
                value={creditDuration}
                onChange={(e) => setCreditDuration(e.target.value)}
                placeholder="12"
                disabled={loading}
                required
              />
            </div>

            {/* Calcul automatique */}
            {creditDuration && (inputMode === 'total' ? totalCreditAmount : monthlyAmount) && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary space-y-2">
                {inputMode === 'total' ? (
                  <>
                    <p className="text-sm text-muted-foreground">Mensualité calculée</p>
                    <p className="text-2xl font-bold text-primary">{calculatedMonthly} €</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Montant total calculé</p>
                    <p className="text-2xl font-bold text-primary">{calculatedTotal} €</p>
                  </>
                )}
              </div>
            )}

            {/* Date de début */}
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

            {/* Jour du prélèvement */}
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Jour du prélèvement mensuel</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                placeholder="1-31"
                disabled={loading}
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
                disabled={loading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
