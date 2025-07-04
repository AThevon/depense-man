'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit3, X } from 'lucide-react';
import { FormData, FormErrors, MonthlyItem, ValidationResult } from '@/lib/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import IconSelector from '@/components/ui/IconSelector';

interface MonthlyItemFormProps {
  type: 'income' | 'expense';
  item?: MonthlyItem;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const MonthlyItemForm = ({ type, item, onSubmit, onCancel, loading = false }: MonthlyItemFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    amount: '',
    dayOfMonth: '',
    icon: '',
    isCredit: false,
    remainingPayments: '',
    totalPayments: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Pré-remplir le formulaire si on édite un élément existant
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        amount: item.amount.toString(),
        dayOfMonth: item.dayOfMonth.toString(),
        icon: item.icon,
        isCredit: item.type === 'expense' ? item.isCredit : false,
        remainingPayments: item.type === 'expense' && item.remainingPayments ? item.remainingPayments.toString() : '',
        totalPayments: item.type === 'expense' && item.totalPayments ? item.totalPayments.toString() : '',
      });
    }
  }, [item]);

  const validateForm = (): ValidationResult => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Le montant est requis';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Le montant doit être un nombre positif';
    }

    if (!formData.dayOfMonth.trim()) {
      newErrors.dayOfMonth = 'Le jour du mois est requis';
    } else {
      const day = Number(formData.dayOfMonth);
      if (isNaN(day) || day < 1 || day > 31) {
        newErrors.dayOfMonth = 'Le jour doit être entre 1 et 31';
      }
    }

    if (!formData.icon.trim()) {
      newErrors.icon = 'Une icône est requise';
    }

    if (type === 'expense' && formData.isCredit) {
      if (!formData.remainingPayments?.trim()) {
        newErrors.remainingPayments = 'Le nombre de paiements restants est requis';
      } else if (isNaN(Number(formData.remainingPayments)) || Number(formData.remainingPayments) <= 0) {
        newErrors.remainingPayments = 'Le nombre de paiements doit être un nombre positif';
      }

      if (!formData.totalPayments?.trim()) {
        newErrors.totalPayments = 'Le nombre total de paiements est requis';
      } else if (isNaN(Number(formData.totalPayments)) || Number(formData.totalPayments) <= 0) {
        newErrors.totalPayments = 'Le nombre total de paiements doit être un nombre positif';
      }

      if (formData.remainingPayments && formData.totalPayments) {
        const remaining = Number(formData.remainingPayments);
        const total = Number(formData.totalPayments);
        if (remaining > total) {
          newErrors.remainingPayments = 'Le nombre de paiements restants ne peut pas être supérieur au total';
        }
      }
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Nettoyer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const isEditing = !!item;
  const title = isEditing 
    ? `Modifier ${type === 'income' ? 'le revenu' : 'la dépense'}`
    : `Ajouter ${type === 'income' ? 'un revenu' : 'une dépense'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-surface rounded-none md:rounded-xl shadow-xl w-full max-w-lg h-full md:h-auto md:max-h-[95vh] overflow-y-auto">
        <div className="p-4 md:p-6 pt-8 md:pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text">
              {title}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-secondary hover:text-text transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nom"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              placeholder={`Nom du ${type === 'income' ? 'revenu' : 'dépense'}`}
              disabled={loading}
            />

            <Input
              label="Montant (€)"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              error={errors.amount}
              placeholder="0.00"
              disabled={loading}
            />

            <Input
              label="Jour du mois"
              type="number"
              min="1"
              max="31"
              value={formData.dayOfMonth}
              onChange={(e) => handleInputChange('dayOfMonth', e.target.value)}
              error={errors.dayOfMonth}
              placeholder="1-31"
              helper="Jour du mois où le montant est prélevé/versé"
              disabled={loading}
            />

            <IconSelector
              selectedIcon={formData.icon}
              onIconSelect={(icon) => handleInputChange('icon', icon)}
              className="w-full"
            />
            {errors.icon && (
              <p className="text-sm text-red-500 mt-1">{errors.icon}</p>
            )}

            {type === 'expense' && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isCredit"
                    checked={formData.isCredit}
                    onChange={(e) => handleInputChange('isCredit', e.target.checked)}
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-default rounded"
                    disabled={loading}
                  />
                  <label htmlFor="isCredit" className="text-sm font-medium text-text">
                    Crédit (paiements échelonnés)
                  </label>
                </div>

                {formData.isCredit && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Paiements restants"
                      type="number"
                      min="0"
                      value={formData.remainingPayments}
                      onChange={(e) => handleInputChange('remainingPayments', e.target.value)}
                      error={errors.remainingPayments}
                      placeholder="12"
                      disabled={loading}
                    />

                    <Input
                      label="Total paiements"
                      type="number"
                      min="1"
                      value={formData.totalPayments}
                      onChange={(e) => handleInputChange('totalPayments', e.target.value)}
                      error={errors.totalPayments}
                      placeholder="24"
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={loading}
                fullWidth
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                fullWidth
                icon={isEditing ? Edit3 : Plus}
              >
                {isEditing ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MonthlyItemForm; 