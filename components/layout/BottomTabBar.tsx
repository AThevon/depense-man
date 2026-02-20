'use client';

import { usePathname, useRouter } from 'next/navigation';
import { List, BarChart3, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

const tabs = [
  { id: 'list', label: 'Liste', icon: List, href: '/' },
  { id: 'stats', label: 'Stats', icon: BarChart3, href: '/stats' },
  { id: 'projections', label: 'Proj', icon: TrendingUp, href: '/projections' },
  { id: 'credits', label: 'Crédits', icon: CreditCard, href: '/credits' },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = tabs.find(tab => tab.href === pathname)?.id || 'list';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-[rgba(10,10,11,0.8)] backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className="relative flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[44px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -top-px left-3 right-3 h-0.5 rounded-full gradient-active"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={`h-5 w-5 mb-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
