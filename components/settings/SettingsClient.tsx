'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Copy, Check, LogOut, Github, Info } from 'lucide-react';
import { useExpensesStore } from '@/lib/store/expenses';
import { logout } from '@/lib/auth/actions';

interface SettingsClientProps {
  user: {
    uid: string;
    email: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { items } = useExpensesStore();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
    if (saved) setTheme(saved);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const handleCopyJSON = async () => {
    const json = JSON.stringify(items, null, 2);
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 md:px-6 py-4 space-y-6">
        <h1 className="text-xl font-semibold">Paramètres</h1>

        {/* Account */}
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Connecté en tant que</p>
          <p className="text-sm font-medium">{user.email || 'N/A'}</p>
        </div>

        {/* Theme */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <p className="text-sm font-medium">Thème</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light' as const, icon: Sun, label: 'Clair' },
              { id: 'dark' as const, icon: Moon, label: 'Sombre' },
              { id: 'auto' as const, icon: Monitor, label: 'Auto' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${
                  theme === t.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-[rgba(255,255,255,0.08)] text-muted-foreground hover:text-foreground'
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Export JSON */}
        <button
          onClick={handleCopyJSON}
          className="glass rounded-2xl p-4 w-full flex items-center justify-between hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <div className="flex items-center gap-3">
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            <span className="text-sm">{copied ? 'JSON copié !' : 'Exporter les données (JSON)'}</span>
          </div>
        </button>

        {/* About */}
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Dépense-Man v1.0.0</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-full glass rounded-2xl p-4 flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
