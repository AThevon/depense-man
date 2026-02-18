'use client';

import { useState, useTransition, useEffect } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { login } from '@/lib/auth/actions';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ✅ PATTERN 2025: useActionState pour gérer le server action
  const [state, formAction, isPending] = useActionState(login, {});
  const [isAuthenticating, startTransition] = useTransition();

  const isLoading = isPending || isAuthenticating;

  // Rediriger vers le dashboard après un login réussi
  useEffect(() => {
    if (state?.success) {
      router.push('/');
    }
  }, [state?.success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. Authentifier avec Firebase Client (hors transition)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // 2. Obtenir l'ID token
      const idToken = await userCredential.user.getIdToken();

      // 3. Créer un FormData avec le token
      const formData = new FormData();
      formData.append('idToken', idToken);

      // 4. Appeler le Server Action dans une transition (synchrone)
      startTransition(() => {
        formAction(formData);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    }
  };

  return (
    <Card className="w-full max-w-md glass rounded-2xl">
      <CardHeader className="space-y-4">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/web-app-manifest-192x192.png"
            alt="Dépense-Man Logo"
            width={80}
            height={80}
            className="rounded-2xl shadow-lg object-cover w-20 h-20"
          />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Dépense-Man
          </h1>
          <p className="text-muted-foreground">
            Connectez-vous pour continuer
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Mot de passe
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="_ _ _ _ _ _ _ _"
              required
              disabled={isLoading}
            />
          </div>

          {(error || state?.error) && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              {error || state?.error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
