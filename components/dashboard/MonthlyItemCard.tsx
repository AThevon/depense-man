import { useState, useRef } from 'react';
import { Edit3, Trash2, Calendar, CreditCard } from 'lucide-react';
import { MonthlyItem, MonthlyExpense, calculateCreditInfo } from '@/lib/types';
import { ALL_ICONS } from '@/components/ui/IconModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  const isCredit = expenseItem?.isCredit || false;

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
      <Card className={`relative group p-0 ${isCredit ? 'bg-gradient-to-r from-card via-muted/30 to-card' : ''}`} 
            style={isCredit ? {
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, oklch(from var(--muted) l c h / 0.3) 8px, oklch(from var(--muted) l c h / 0.3) 12px)',
              backgroundSize: '24px 24px'
            } : {}}>
        {/* Boutons d'actions cachés (révélés par swipe sur mobile) */}
        <div 
          className="absolute right-0 top-0 h-full flex items-center space-x-2 bg-card px-4 sm:hidden transition-opacity duration-200"
          style={{
            opacity: currentX > 30 ? 1 : 0
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onEdit(item);
              resetSwipe();
            }}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowDeleteConfirm(true);
              resetSwipe();
            }}
            disabled={loading}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CardContent 
          ref={cardRef}
          className="p-4 relative z-10 cursor-pointer select-none sm:cursor-auto"
          style={{
            transform: `translateX(-${currentX}px)`
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={resetSwipe}
        >
          <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-2 sm:p-3 rounded-lg flex-shrink-0 bg-secondary/50">
              {IconComponent && (
                <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${isExpense ? 'text-destructive' : 'text-success'}`} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate !text-lg sm:text-base">
                {item.name}
              </p>

              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Le {item.dayOfMonth}
                </span>
              </div>

              {creditInfo && creditInfo.isActive && (
                <div className="flex items-center space-x-2 mt-1">
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">
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
                onClick={() => onEdit(item)}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <span className={`text-lg sm:text-xl font-bold ${isExpense ? 'text-destructive' : 'text-success'} whitespace-nowrap`}>
              {isExpense ? '-' : '+'}
              {creditInfo && creditInfo.isActive ?
                formatAmount(creditInfo.monthlyAmount) :
                formatAmount(item.amount)
              }
            </span>
          </div>
        </div>

          {creditInfo && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Progression</span>
                <span className="text-primary font-semibold">{Math.round(creditInfo.progressPercentage)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${creditInfo.progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Restant: <span className="font-medium text-foreground">{formatAmount(creditInfo.remainingAmount)}</span></span>
                <span>Total: <span className="font-medium text-foreground">{formatAmount(creditInfo.totalAmount)}</span></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 text-center space-y-4 shadow-xl border border-border">
            <p className="text-sm text-foreground">
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
                variant="destructive"
                size="sm"
                onClick={handleDelete}
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