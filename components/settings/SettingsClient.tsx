'use client';

import { useState } from 'react';
import { Copy, Check, LogOut, Github, Info } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

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
