'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useExpensesStore } from '@/lib/store/expenses';

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { initListener, reset } = useExpensesStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      initListener(user.uid);
    } else {
      reset();
      // Rediriger vers login si pas d'auth (sauf si déjà sur /login)
      if (!pathname.startsWith('/login')) {
        router.replace('/login');
      }
    }
  }, [user, loading, initListener, reset, pathname, router]);

  return <>{children}</>;
}
