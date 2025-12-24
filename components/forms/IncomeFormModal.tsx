'use client';

import { useActionState, useState, useEffect } from 'react';
import { addIncome, updateIncome, type ActionState } from '@/lib/actions/expenses';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { MonthlyItem } from '@/lib/types';
import IconSelector from '@/components/ui/IconSelector';

interface IncomeFormModalProps {
  item?: MonthlyItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Formulaire moderne utilisant Server Actions avec useActionState
 * Supporte l'ajout et la modification de revenus
 */
export function IncomeFormModal({ item, onSuccess, onCancel }: IncomeFormModalProps) {
  const isEditing = !!item;
  const action = isEditing ? updateIncome : addIncome;

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    null
  );

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
            {isEditing ? 'Modifier le revenu' : 'Nouveau revenu'}
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
                placeholder="Ex: Salaire"
                defaultValue={item?.name}
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
                placeholder="Ex: 2500"
                defaultValue={item?.amount}
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
                placeholder="Ex: 1"
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
