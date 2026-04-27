import { useState, useRef } from 'react';
import { Edit3, Trash2, CircleCheck } from 'lucide-react';
import { MonthlyItem, MonthlyExpense } from '@/lib/types';
import { calculateCreditInfoAtDate } from '@/lib/creditCalculations';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { motion, AnimatePresence } from 'motion/react';

interface MonthlyItemCardProps {
  item: MonthlyItem;
  onEdit: (item: MonthlyItem) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  isPast?: boolean;
}

const MonthlyItemCard = ({ item, onEdit, onDelete, loading = false, isPast = false }: MonthlyItemCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isExpense = item.type === 'expense';
  const expenseItem = isExpense ? (item as MonthlyExpense) : null;
  const isCredit = expenseItem?.isCredit || false;

  const creditInfo = expenseItem ? calculateCreditInfoAtDate(expenseItem) : null;

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

  // Gestion du swipe sur mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touchX = e.touches[0].clientX;
    const diff = startX - touchX;

    if (diff > 0 && diff < 120) {
      setCurrentX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (currentX > 60) {
      setCurrentX(120);
    } else {
      setCurrentX(0);
    }
  };

  const resetSwipe = () => {
    setCurrentX(0);
  };

  const displayAmount = creditInfo && creditInfo.isActive
    ? creditInfo.monthlyAmount
    : item.amount;

  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Boutons d'actions cachés (révélés par swipe sur mobile) */}
      <div
        className="absolute right-0 top-0 h-full flex items-center space-x-2 px-4 sm:hidden transition-opacity duration-200"
        style={{
          opacity: currentX > 30 ? 1 : 0,
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
            resetSwipe();
          }}
          disabled={loading}
          className="min-h-[44px] min-w-[44px] p-0"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
            resetSwipe();
          }}
          disabled={loading}
          className="min-h-[44px] min-w-[44px] p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={cardRef}
        className="flex items-center gap-3 px-2 py-3 border-b border-[rgba(255,255,255,0.05)] select-none group cursor-pointer"
        style={{
          transform: `translateX(-${currentX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (currentX > 0) {
            resetSwipe();
          }
        }}
      >
        {/* Icone */}
        <div className="p-2 rounded-lg flex-shrink-0 bg-secondary/50">
          <Icon
            name={item.icon}
            className={`h-5 w-5 ${isExpense ? 'text-destructive' : 'text-success'}`}
          />
        </div>

        {/* Nom + sous-texte crédit + coche passé */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
            {isPast && (
              <CircleCheck className="h-3.5 w-3.5 text-success flex-shrink-0" />
            )}
          </div>
          {isCredit && creditInfo && creditInfo.isActive && (
            <p className="text-xs text-muted-foreground">
              Crédit &middot; {creditInfo.remainingPayments} restants
            </p>
          )}
        </div>

        {/* Montant + jour */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Boutons desktop */}
          <div className="hidden sm:flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              disabled={loading}
              className="h-7 w-7 p-0"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              disabled={loading}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <span
            className={`text-sm font-semibold tabular-nums whitespace-nowrap ${
              isExpense ? 'text-destructive' : 'text-success'
            }`}
          >
            {isExpense ? '-' : '+'}
            {formatAmount(displayAmount)}
          </span>
          <span className="text-xs text-muted-foreground">J{item.dayOfMonth}</span>
        </div>
      </div>

      {/* Confirmation de suppression — bottom sheet */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <BottomSheet
            key="delete-confirm"
            onClose={() => setShowDeleteConfirm(false)}
            title="Supprimer cet élément ?"
            footer={
              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 h-12"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 h-12"
                >
                  Supprimer
                </Button>
              </div>
            }
          >
            <div className="px-5 pb-5 pt-1 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm text-foreground">
                <span className="font-semibold">&quot;{item.name}&quot;</span>{' '}
                <span className="text-muted-foreground">sera supprimé définitivement.</span>
              </p>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MonthlyItemCard;
