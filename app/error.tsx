'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

/**
 * Error UI pour gérer les erreurs de la page principale
 * Composant Client nécessaire pour utiliser useEffect et reset
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur dans la console
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Une erreur est survenue</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Impossible de charger les données. Veuillez réessayer.
          </p>

          {error.message && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">Détails de l'erreur :</p>
              <p className="font-mono text-xs">{error.message}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={reset}
              className="flex-1"
            >
              Réessayer
            </Button>
            <Button
              onClick={() => window.location.href = '/login'}
              variant="outline"
            >
              Se reconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
