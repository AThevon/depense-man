import { useState } from 'react';
import { Edit3, Trash2, Calendar, CreditCard } from 'lucide-react';
import { MonthlyItem, MonthlyExpense, calculateCreditInfo } from '@/lib/types';
import { ALL_ICONS } from '@/components/ui/IconModal';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface MonthlyItemCardProps {
  item: MonthlyItem;
  onEdit: (item: MonthlyItem) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const MonthlyItemCard = ({ item, onEdit, onDelete, loading = false }: MonthlyItemCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const IconComponent = ALL_ICONS.find(icon => icon.name === item.icon)?.icon;
  const isExpense = item.type === 'expense';
  const expenseItem = isExpense ? item as MonthlyExpense : null;

  const handleDelete = () => {
    onDelete(item.id);
    setShowDeleteConfirm(false);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const creditInfo = expenseItem ? calculateCreditInfo(expenseItem) : null;

  return (
    <Card className="relative group">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`p-2 rounded-lg ${isExpense ? 'bg-red-100 bg-opacity-10' : 'bg-green-100 bg-opacity-10'}`}>
              {IconComponent && (
                <IconComponent className={`h-6 w-6 ${isExpense ? 'text-red-400' : 'text-green-400'}`} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text truncate">
                {item.name}
              </h3>

              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="h-4 w-4 text-secondary" />
                <span className="text-sm text-secondary">
                  Le {item.dayOfMonth}
                </span>
              </div>

              {creditInfo && creditInfo.isActive && (
                <div className="flex items-center space-x-2 mt-1">
                  <CreditCard className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-secondary">
                    {creditInfo.remainingPayments} paiements restants
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                icon={Edit3}
                onClick={() => onEdit(item)}
                disabled={loading}
                className="text-secondary hover:text-primary"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="text-secondary hover:text-red-400"
              />
            </div>
            <span className={`text-lg font-bold ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
              {isExpense ? '-' : '+'}
              {creditInfo && creditInfo.isActive ?
                formatAmount(creditInfo.monthlyAmount) :
                formatAmount(item.amount)
              }
            </span>
          </div>
        </div>

        {creditInfo && creditInfo.isActive && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Progression</span>
              <span className="text-primary font-medium">{Math.round(creditInfo.progressPercentage)}%</span>
            </div>
            <div className="w-full bg-surface-elevated rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${creditInfo.progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-secondary">
              <span>Restant: {formatAmount(creditInfo.remainingAmount)}</span>
              <span>Total: {formatAmount(creditInfo.totalAmount)}</span>
            </div>
          </div>
        )}
      </CardContent>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-surface-elevated rounded-xl flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-text">
              Supprimer &quot;{item.name}&quot; ?
            </p>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                loading={loading}
                disabled={loading}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MonthlyItemCard; 