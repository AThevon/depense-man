'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

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
        <Card variant="elevated" className="glass shadow-2xl">
          <CardHeader className="flex flex-col items-center text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-xl">
                <Image
                  src="/web-app-manifest-192x192.png"
                  alt="Dépense-Man Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <h1 className="text-4xl font-bold gradient-text">
                Dépense-Man
              </h1>
              <p className="text-secondary text-lg">
                Gérez vos finances en toute simplicité
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="votre@email.com"
                  disabled={loading}
                  required
                />

                <Input
                  label="Mot de passe"
                  type="password"
                  icon={Lock}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  showPasswordToggle={true}
                  required
                />
              </div>

              {(formError || error) && (
                <div className="p-4 bg-error/10 border border-error/30 rounded-xl">
                  <p className="text-sm text-error font-medium">
                    {formError || error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
                icon={LogIn}
                size="lg"
                className="mt-8"
              >
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default LoginForm; 