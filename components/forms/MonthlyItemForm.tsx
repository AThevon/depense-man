'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit3, X } from 'lucide-react';
import { FormData, FormErrors, MonthlyItem, ValidationResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    totalCreditAmount: '',
    creditStartDate: '',
    creditDuration: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Pré-remplir le formulaire si on édite un élément existant
  useEffect(() => {
    if (item) {
      const expenseItem = item.type === 'expense' ? item : null;
      
      setFormData({
        name: item.name,
        amount: item.amount.toString(),
        dayOfMonth: item.dayOfMonth.toString(),
        icon: item.icon,
        isCredit: expenseItem?.isCredit || false,
        totalCreditAmount: expenseItem?.totalCreditAmount?.toString() || '',
        creditStartDate: expenseItem?.creditStartDate ? 
          new Date(expenseItem.creditStartDate).toISOString().split('T')[0] : '',
        creditDuration: expenseItem?.creditDuration?.toString() || '',
      });
    } else {
      // Réinitialiser le formulaire pour un nouvel élément
      setFormData({
        name: '',
        amount: '',
        dayOfMonth: '',
        icon: '',
        isCredit: false,
        totalCreditAmount: '',
        creditStartDate: '',
        creditDuration: '',
      });
    }
  }, [item]);

  const validateForm = (): ValidationResult => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.isCredit) {
      if (!formData.amount.trim()) {
        newErrors.amount = 'Le montant est requis';
      } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
        newErrors.amount = 'Le montant doit être un nombre positif';
      }
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
      if (!formData.totalCreditAmount?.trim()) {
        newErrors.totalCreditAmount = 'Le montant total du crédit est requis';
      } else if (isNaN(Number(formData.totalCreditAmount)) || Number(formData.totalCreditAmount) <= 0) {
        newErrors.totalCreditAmount = 'Le montant total doit être un nombre positif';
      }

      if (!formData.creditStartDate?.trim()) {
        newErrors.creditStartDate = 'La date de début est requise';
      } else {
        const startDate = new Date(formData.creditStartDate);
        if (isNaN(startDate.getTime())) {
          newErrors.creditStartDate = 'Date invalide';
        }
      }

      if (!formData.creditDuration?.trim()) {
        newErrors.creditDuration = 'La durée en mois est requise';
      } else if (isNaN(Number(formData.creditDuration)) || Number(formData.creditDuration) <= 0) {
        newErrors.creditDuration = 'La durée doit être un nombre positif';
      } else if (Number(formData.creditDuration) > 60) {
        newErrors.creditDuration = 'La durée ne peut pas dépasser 60 mois';
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
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Calculer automatiquement le montant mensuel pour les crédits
      if (newData.isCredit && (field === 'totalCreditAmount' || field === 'creditDuration')) {
        const total = Number(newData.totalCreditAmount);
        const duration = Number(newData.creditDuration);
        if (total > 0 && duration > 0) {
          newData.amount = (total / duration).toFixed(2);
        }
      }

      // Réinitialiser le montant si on désactive le crédit
      if (field === 'isCredit' && !value) {
        newData.amount = '';
      }

      return newData;
    });
    
    // Nettoyer l'erreur du champ modifié
    if (field in errors && errors[field as keyof FormErrors]) {
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-0 md:p-4"
    >
      <div className="bg-card rounded-none md:rounded-xl shadow-xl w-full max-w-lg h-full md:h-auto md:max-h-[95vh] overflow-y-auto">
        <div className="p-4 md:p-6 pt-8 md:pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {title}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Nom
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={`Nom du ${type === 'income' ? 'revenu' : 'dépense'}`}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-foreground">
                {formData.isCredit ? "Montant mensuel (€)" : "Montant (€)"}
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                disabled={loading || formData.isCredit}
              />
              {formData.isCredit && (
                <p className="text-xs text-muted-foreground">Calculé automatiquement à partir du montant total</p>
              )}
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="dayOfMonth" className="text-sm font-medium text-foreground">
                Jour du mois
              </label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={formData.dayOfMonth}
                onChange={(e) => handleInputChange('dayOfMonth', e.target.value)}
                placeholder="1-31"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Jour du mois où le montant est prélevé/versé</p>
              {errors.dayOfMonth && (
                <p className="text-sm text-destructive">{errors.dayOfMonth}</p>
              )}
            </div>

            <IconSelector
              selectedIcon={formData.icon}
              onIconSelect={(icon) => handleInputChange('icon', icon)}
              className="w-full"
            />
            {errors.icon && (
              <p className="text-sm text-destructive mt-1">{errors.icon}</p>
            )}

            {type === 'expense' && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isCredit"
                    checked={formData.isCredit}
                    onChange={(e) => handleInputChange('isCredit', e.target.checked)}
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                    disabled={loading}
                  />
                  <label htmlFor="isCredit" className="text-sm font-medium text-foreground">
                    Crédit (paiements échelonnés)
                  </label>
                </div>

                {formData.isCredit && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="totalCreditAmount" className="text-sm font-medium text-foreground">
                        Montant total du crédit (€)
                      </label>
                      <Input
                        id="totalCreditAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.totalCreditAmount}
                        onChange={(e) => handleInputChange('totalCreditAmount', e.target.value)}
                        placeholder="600.00"
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">Montant total à rembourser</p>
                      {errors.totalCreditAmount && (
                        <p className="text-sm text-destructive">{errors.totalCreditAmount}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="creditStartDate" className="text-sm font-medium text-foreground">
                          Date de début
                        </label>
                        <Input
                          id="creditStartDate"
                          type="date"
                          value={formData.creditStartDate}
                          onChange={(e) => handleInputChange('creditStartDate', e.target.value)}
                          disabled={loading}
                        />
                        {errors.creditStartDate && (
                          <p className="text-sm text-destructive">{errors.creditStartDate}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="creditDuration" className="text-sm font-medium text-foreground">
                          Durée (mois)
                        </label>
                        <Input
                          id="creditDuration"
                          type="number"
                          min="1"
                          max="60"
                          value={formData.creditDuration}
                          onChange={(e) => handleInputChange('creditDuration', e.target.value)}
                          placeholder="4"
                          disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">Nombre de mois</p>
                        {errors.creditDuration && (
                          <p className="text-sm text-destructive">{errors.creditDuration}</p>
                        )}
                      </div>
                    </div>
                    
                    {formData.totalCreditAmount && formData.creditDuration && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Montant mensuel : </span>
                          <span className="text-primary font-bold">
                            {(Number(formData.totalCreditAmount) / Number(formData.creditDuration)).toFixed(2)}€
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : (
                  <>{isEditing ? <Edit3 className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}</>
                )}
                {loading ? 'Traitement...' : (isEditing ? 'Modifier' : 'Ajouter')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MonthlyItemForm; 