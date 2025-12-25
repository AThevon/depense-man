'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, Settings, Moon, Sun, User, BarChart3, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth/actions';
import { motion } from 'motion/react';

interface AppHeaderProps {
  currentTab?: 'dashboard' | 'stats';
  onTabChange?: (tab: 'dashboard' | 'stats') => void;
}

export function AppHeader({ currentTab = 'dashboard', onTabChange }: AppHeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [localTab, setLocalTab] = useState(currentTab);

  // Charger la préférence de thème au montage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <Image
                src="/web-app-manifest-192x192.png"
                alt="Dépense-Man Logo"
                width={48}
                height={48}
                className="rounded-lg object-cover"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground font-display tracking-tight">
                Dépense-Man
              </h1>
              <p className="text-xs text-muted-foreground">Vers l'infini money</p>
            </div>
            <h1 className="sm:hidden text-xl font-bold text-foreground font-display">
              D-Man
            </h1>
          </div>

          {/* Navigation + Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Navigation Tabs */}
            <div className="relative flex bg-muted/50 rounded-lg p-1 gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setLocalTab('dashboard');
                  requestAnimationFrame(() => {
                    onTabChange?.('dashboard');
                  });
                }}
                className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  localTab === 'dashboard'
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {localTab === 'dashboard' && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary rounded-md"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                      mass: 0.8,
                    }}
                  />
                )}
                <LayoutDashboard className="h-4 w-4 relative z-10" />
                <span className="hidden lg:inline relative z-10">Dashboard</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setLocalTab('stats');
                  requestAnimationFrame(() => {
                    onTabChange?.('stats');
                  });
                }}
                className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  localTab === 'stats'
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {localTab === 'stats' && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary rounded-md"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                      mass: 0.8,
                    }}
                  />
                )}
                <BarChart3 className="h-4 w-4 relative z-10" />
                <span className="hidden lg:inline relative z-10">Statistiques</span>
              </button>
            </div>

            {/* User Menu Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Menu</span>
              </Button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-popover ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                      {/* Dark/Light Mode Toggle */}
                      <button
                        onClick={toggleDarkMode}
                        className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                        role="menuitem"
                      >
                        {isDarkMode ? (
                          <>
                            <Sun className="h-4 w-4" />
                            <span>Mode clair</span>
                          </>
                        ) : (
                          <>
                            <Moon className="h-4 w-4" />
                            <span>Mode sombre</span>
                          </>
                        )}
                      </button>

                      {/* Settings */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push('/settings');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                        role="menuitem"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Paramètres</span>
                      </button>

                      <div className="border-t border-border my-1"></div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted flex items-center gap-2"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
