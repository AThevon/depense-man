'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/ibutton';
import { Input } from '@/components/ui/iinput';
import { Card, CardHeader, CardContent } from '@/components/ui/icard';

const LoginForm = () => {
  const { signIn, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.email || !formData.password) {
      setFormError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await signIn(formData.email, formData.password);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setFormError('Email ou mot de passe incorrect');
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (formError) setFormError(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col items-center text-center ">
            <div className="flex justify-center mb-6">
              {/* <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"> */}
              <Image
                src="/web-app-manifest-192x192.png"
                alt="Dépense-Man Logo"
                width={100}
                height={100}
                className="object-contain w-full h-full -mb-7"
              />
              {/* </div> */}
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Dépense-Man
            </h1>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="votre@email.com"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Mot de passe
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {(formError || error) && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    {formError || error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full mt-4"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default LoginForm; 