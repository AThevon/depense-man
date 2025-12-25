'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AppHeader } from './AppHeader';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Ne pas afficher le header sur la page de login uniquement
  const showHeader = !pathname.startsWith('/login');

  const handleTabChange = (tab: 'dashboard' | 'stats') => {
    if (tab === 'dashboard') {
      router.push('/');
    } else {
      router.push('/stats');
    }
  };

  // Déterminer le tab actif basé sur le pathname
  const currentTab = pathname === '/stats' ? 'stats' : 'dashboard';

  return (
    <>
      {showHeader && <AppHeader currentTab={currentTab} onTabChange={handleTabChange} />}
      {children}
    </>
  );
}
