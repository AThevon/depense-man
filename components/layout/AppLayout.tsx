'use client';

import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { BottomTabBar } from './BottomTabBar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChrome = !pathname.startsWith('/login');

  return (
    <>
      {showChrome && <AppHeader />}
      <main className={showChrome ? 'pb-20 md:pb-0' : ''}>
        {children}
      </main>
      {showChrome && <BottomTabBar />}
    </>
  );
}
