import { useState, useRef } from 'react';
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
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // Gestion du swipe sur mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touchX = e.touches[0].clientX;
    const diff = startX - touchX;
    
    if (diff > 0 && diff < 120) { // Limite le swipe à 120px
      setCurrentX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (currentX > 60) { // Seuil pour activer le swipe
      setCurrentX(120);
    } else {
      setCurrentX(0);
    }
  };

  const resetSwipe = () => {
    setCurrentX(0);
  };

  return (
    <div className="relative overflow-hidden">
      <Card className="relative group hover:scale-[1.01] transition-all duration-200" hover>
        {/* Boutons d'actions cachés (révélés par swipe sur mobile) */}
        <div 
          className="absolute right-0 top-0 h-full flex items-center space-x-2 bg-surface px-4 sm:hidden transition-opacity duration-200"
          style={{
            opacity: currentX > 30 ? 1 : 0
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            icon={Edit3}
            onClick={() => {
              onEdit(item);
              resetSwipe();
            }}
            disabled={loading}
            className="text-primary hover:text-primary-dark bg-primary/10 hover:bg-primary/20"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => {
              setShowDeleteConfirm(true);
              resetSwipe();
            }}
            disabled={loading}
            className="text-error hover:text-error/80 bg-error/10 hover:bg-error/20"
          />
        </div>

        <CardContent 
          ref={cardRef}
          className="p-4 sm:p-6 relative z-10 transition-transform duration-200 ease-out cursor-pointer select-none sm:cursor-auto"
          style={{
            transform: `translateX(-${currentX}px)`
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={resetSwipe}
        >
          <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${isExpense ? 'bg-error/10 border border-error/20' : 'bg-success/10 border border-success/20'}`}>
              {IconComponent && (
                <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${isExpense ? 'text-error' : 'text-success'}`} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text truncate text-sm sm:text-base">
                {item.name}
              </h3>

              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-secondary flex-shrink-0" />
                <span className="text-xs sm:text-sm text-secondary">
                  Le {item.dayOfMonth}
                </span>
              </div>

              {creditInfo && creditInfo.isActive && (
                <div className="flex items-center space-x-2 mt-1">
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-secondary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-secondary truncate">
                    {creditInfo.remainingPayments} paiements restants
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Boutons desktop seulement */}
            <div className="hidden sm:flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <span className={`text-lg sm:text-xl font-bold ${isExpense ? 'text-error' : 'text-success'} whitespace-nowrap`}>
              {isExpense ? '-' : '+'}
              {creditInfo && creditInfo.isActive ?
                formatAmount(creditInfo.monthlyAmount) :
                formatAmount(item.amount)
              }
            </span>
          </div>
        </div>

        {creditInfo && creditInfo.isActive && (
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-secondary font-medium">Progression</span>
              <span className="text-primary font-semibold">{Math.round(creditInfo.progressPercentage)}%</span>
            </div>
            <div className="w-full bg-surface-elevated rounded-full h-2.5 border border-border/30">
              <div
                className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${creditInfo.progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-secondary">
              <span>Restant: <span className="font-medium">{formatAmount(creditInfo.remainingAmount)}</span></span>
              <span>Total: <span className="font-medium">{formatAmount(creditInfo.totalAmount)}</span></span>
            </div>
          </div>
        )}
        </CardContent>
      </Card>

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
    </div>
  );
};

export default MonthlyItemCard; 