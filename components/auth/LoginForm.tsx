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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card variant="elevated" className="shadow-2xl">
          <CardHeader className="flex flex-col items-center text-center">
            <div className="flex justify-center">
              <Image
                src="/web-app-manifest-192x192.png"
                alt="Dépense-Man Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Dépense-Man!
              </h1>
              <p className="text-secondary text-lg">
                Attention aux sous...
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {(formError || error) && (
                <div className="p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
                  <p className="text-sm">
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