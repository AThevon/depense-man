'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Settings, List, BarChart3, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

const tabs = [
  { id: 'list', label: 'Liste', icon: List, href: '/' },
  { id: 'stats', label: 'Stats', icon: BarChart3, href: '/stats' },
  { id: 'projections', label: 'Projections', icon: TrendingUp, href: '/projections' },
  { id: 'credits', label: 'Crédits', icon: CreditCard, href: '/credits' },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = tabs.find(tab => tab.href === pathname)?.id || 'list';

  // Initialisation du thème
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[rgba(10,10,11,0.8)] backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <Image
                src="/web-app-manifest-192x192.png"
                alt="Dépense-Man Logo"
                width={40}
                height={40}
                className="rounded-lg object-cover"
                priority
              />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              D-Man
            </h1>
          </div>

          {/* Desktop Navigation Tabs - hidden on mobile */}
          <div className="hidden md:flex items-center">
            <div className="relative flex bg-secondary rounded-lg p-1 gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => router.push(tab.href)}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 flex items-center gap-2 rounded-md ${
                      isActive
                        ? 'text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="header-pill"
                        className="absolute inset-0 bg-primary rounded-md"
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <Icon className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Icon */}
          <button
            onClick={() => router.push('/settings')}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-secondary transition-colors"
            aria-label="Paramètres"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
