'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useExpensesStore } from '@/lib/store/expenses';

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { initListener, reset } = useExpensesStore();

  useEffect(() => {
    if (user) {
      // Initialiser le listener Firestore quand l'utilisateur est connecté
      initListener(user.uid);
    } else {
      // Reset le store quand l'utilisateur se déconnecte
      reset();
    }
  }, [user, initListener, reset]);

  return <>{children}</>;
}
