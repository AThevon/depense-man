'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useExpensesStore } from '@/lib/store/expenses';

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { initListener, reset } = useExpensesStore();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (user) {
      initListener(user.uid);
    } else {
      reset();
      if (!pathname.startsWith('/login')) {
        window.location.replace('/login');
      }
    }
  }, [user, loading, initListener, reset, pathname]);

  return <>{children}</>;
}
