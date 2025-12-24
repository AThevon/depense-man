'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { logout } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={isPending}
      className="text-muted-foreground hover:text-foreground !px-2 sm:!px-4 py-2"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline ml-2">
        {isPending ? 'Déconnexion...' : 'Déconnexion'}
      </span>
    </Button>
  );
}
