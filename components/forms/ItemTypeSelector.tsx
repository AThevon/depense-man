'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet, TrendingUp, X } from 'lucide-react';

interface ItemTypeSelectorProps {
  onSelect: (type: 'expense' | 'credit' | 'income') => void;
  onCancel: () => void;
}

export function ItemTypeSelector({ onSelect, onCancel }: ItemTypeSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Que voulez-vous ajouter ?</h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dépense Simple */}
            <button
              onClick={() => onSelect('expense')}
              className="group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Wallet className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 text-destructive group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-base sm:text-lg text-center">Dépense simple</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
                Paiement unique
              </p>
            </button>

            {/* Crédit */}
            <button
              onClick={() => onSelect('credit')}
              className="group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 text-warning group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-base sm:text-lg text-center">Crédit</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
                Paiement mensuel
              </p>
            </button>

            {/* Revenu */}
            <button
              onClick={() => onSelect('income')}
              className="group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 text-success group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-base sm:text-lg text-center">Revenu</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
                Salaire, prime...
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
