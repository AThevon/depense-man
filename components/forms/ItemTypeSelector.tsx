'use client';

import { CreditCard, Wallet, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface ItemTypeSelectorProps {
  onSelect: (type: 'expense' | 'credit' | 'income') => void;
  onCancel: () => void;
}

const options = [
  {
    type: 'expense' as const,
    label: 'Dépense simple',
    description: 'Paiement unique chaque mois',
    icon: Wallet,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  {
    type: 'credit' as const,
    label: 'Crédit',
    description: 'Mensualités sur une durée fixe',
    icon: CreditCard,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    type: 'income' as const,
    label: 'Revenu',
    description: 'Salaire, prime, autre rentrée',
    icon: TrendingUp,
    color: 'text-success',
    bg: 'bg-success/10',
  },
];

export function ItemTypeSelector({ onSelect, onCancel }: ItemTypeSelectorProps) {
  return (
    <BottomSheet onClose={onCancel} title="Que voulez-vous ajouter ?">
      <div className="px-5 pb-6 pt-1 space-y-2">
        {options.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <motion.button
              key={opt.type}
              type="button"
              onClick={() => onSelect(opt.type)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 + i * 0.05, duration: 0.3, ease: [0.2, 0, 0, 1] }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.05)] active:bg-[rgba(255,255,255,0.07)] transition-colors text-left"
            >
              <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${opt.bg}`}>
                <Icon className={`h-6 w-6 ${opt.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
