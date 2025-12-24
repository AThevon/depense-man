'use client';

import { useActionState, useState, useEffect } from 'react';
import { addExpense, updateExpense, type ActionState } from '@/lib/actions/expenses';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { MonthlyItem } from '@/lib/types';
import IconSelector from '@/components/ui/IconSelector';

interface ExpenseFormModalProps {
  item?: MonthlyItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Formulaire moderne utilisant Server Actions avec useActionState
 * Supporte l'ajout et la modification de dépenses
 */
export function ExpenseFormModal({ item, onSuccess, onCancel }: ExpenseFormModalProps) {
  const isEditing = !!item;
  const action = isEditing ? updateExpense : addExpense;

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    null
  );

  const [isCredit, setIsCredit] = useState(item?.isCredit || false);
  const [selectedIcon, setSelectedIcon] = useState(item?.icon || '');

  // Quand le state indique un succès, appeler onSuccess
  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
    }
  }, [state?.success, onSuccess]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Modifier la dépense' : 'Nouvelle dépense'}
          </h2>
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
          <form action={formAction} className="space-y-4">
            {/* ID caché pour l'édition */}
            {isEditing && (
              <input type="hidden" name="id" value={item.id} />
            )}

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
                defaultValue={item?.name}
                required
                disabled={isPending}
              />
            </div>

            {/* Montant (si pas crédit) */}
            {!isCredit && (
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
                  defaultValue={item?.amount}
                  required={!isCredit}
                  disabled={isPending}
                />
              </div>
            )}

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
                defaultValue={item?.dayOfMonth}
                required
                disabled={isPending}
              />
            </div>

            {/* Icône */}
            <div>
              <label htmlFor="icon" className="block text-sm font-medium mb-2">
                Icône
              </label>
              <input type="hidden" name="icon" value={selectedIcon} />
              <IconSelector
                selectedIcon={selectedIcon}
                onIconSelect={setSelectedIcon}
              />
            </div>

            {/* Crédit ? */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCredit"
                name="isCredit"
                value="true"
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
                    defaultValue={item?.totalCreditAmount}
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
                    defaultValue={
                      item?.creditStartDate
                        ? new Date(item.creditStartDate).toISOString().split('T')[0]
                        : ''
                    }
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
                    defaultValue={item?.creditDuration}
                    required={isCredit}
                    disabled={isPending}
                  />
                </div>

                {/* Calcul automatique du montant mensuel */}
                {isCredit && (
                  <input
                    type="hidden"
                    name="amount"
                    value="0"
                  />
                )}
              </>
            )}

            {/* Message d'erreur */}
            {state?.error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isPending}
              >
                {isPending ? (isEditing ? 'Modification...' : 'Ajout...') : (isEditing ? 'Modifier' : 'Ajouter')}
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
