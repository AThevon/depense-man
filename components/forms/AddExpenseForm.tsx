'use client';

import { useActionState, useOptimistic, useState } from 'react';
import { addExpense, type ActionState } from '@/lib/actions/expenses';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AddExpenseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddExpenseForm({ onSuccess, onCancel }: AddExpenseFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    addExpense,
    null
  );

  const [isCredit, setIsCredit] = useState(false);

  // useOptimistic pour l'UI instantanée (on l'utilisera dans les listes)
  const handleSubmit = async (formData: FormData) => {
    formAction(formData);

    // Si succès, on appelle le callback
    if (state?.success) {
      onSuccess?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold">Nouvelle dépense</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nom
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Ex: Netflix"
                required
                disabled={isPending}
              />
            </div>

            {/* Montant */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-2">
                Montant (€)
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Ex: 15.99"
                required
                disabled={isPending}
              />
            </div>

            {/* Jour du mois */}
            <div>
              <label htmlFor="dayOfMonth" className="block text-sm font-medium mb-2">
                Jour du mois
              </label>
              <Input
                id="dayOfMonth"
                name="dayOfMonth"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 15"
                required
                disabled={isPending}
              />
            </div>

            {/* Icône */}
            <div>
              <label htmlFor="icon" className="block text-sm font-medium mb-2">
                Icône
              </label>
              <Input
                id="icon"
                name="icon"
                type="text"
                placeholder="Ex: streaming"
                required
                disabled={isPending}
              />
            </div>

            {/* Crédit ? */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCredit"
                name="isCredit"
                checked={isCredit}
                onChange={(e) => setIsCredit(e.target.checked)}
                disabled={isPending}
                className="rounded border-gray-300"
              />
              <label htmlFor="isCredit" className="text-sm font-medium">
                C'est un crédit
              </label>
            </div>

            {/* Champs crédit conditionnels */}
            {isCredit && (
              <>
                <div>
                  <label htmlFor="totalCreditAmount" className="block text-sm font-medium mb-2">
                    Montant total du crédit (€)
                  </label>
                  <Input
                    id="totalCreditAmount"
                    name="totalCreditAmount"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1200"
                    required={isCredit}
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label htmlFor="creditStartDate" className="block text-sm font-medium mb-2">
                    Date de début
                  </label>
                  <Input
                    id="creditStartDate"
                    name="creditStartDate"
                    type="date"
                    required={isCredit}
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label htmlFor="creditDuration" className="block text-sm font-medium mb-2">
                    Durée (mois)
                  </label>
                  <Input
                    id="creditDuration"
                    name="creditDuration"
                    type="number"
                    min="1"
                    placeholder="Ex: 24"
                    required={isCredit}
                    disabled={isPending}
                  />
                </div>
              </>
            )}

            {/* Message d'erreur */}
            {state?.error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}

            {/* Message de succès */}
            {state?.success && (
              <div className="bg-success/10 text-success px-4 py-3 rounded-lg text-sm">
                Dépense ajoutée avec succès !
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isPending}
              >
                {isPending ? 'Ajout...' : 'Ajouter'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
