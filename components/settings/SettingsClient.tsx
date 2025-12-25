'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Palette, Database, Info } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth/actions';

interface SettingsClientProps {
  user: {
    uid: string;
    email: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('account');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');

  // Charger le thème au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('dark');
    }
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      // Auto mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', 'auto');
    }
  };

  const sections = [
    { id: 'account', icon: User, label: 'Compte', description: 'Informations de connexion' },
    { id: 'appearance', icon: Palette, label: 'Apparence', description: 'Thème et affichage' },
    { id: 'data', icon: Database, label: 'Données', description: 'Gestion des données' },
    { id: 'about', icon: Info, label: 'À propos', description: 'Version et informations' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Paramètres</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Gérez vos préférences
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 max-w-5xl">
        {/* Settings Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                  activeSection === section.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:bg-muted text-foreground'
                }`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-center">
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {activeSection === 'account' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold">Compte</h2>
                    <p className="text-sm text-muted-foreground">Gérez vos informations de connexion</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-foreground">{user.email || 'Non disponible'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">ID utilisateur</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-foreground font-mono break-all">{user.uid}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Changer le mot de passe</p>
                      <p className="text-sm text-muted-foreground">Mettre à jour vos identifiants</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                      Modifier
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="w-full sm:w-auto"
                  >
                    Se déconnecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'appearance' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold">Apparence</h2>
                    <p className="text-sm text-muted-foreground">Personnalisez l'interface de l'application</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Thème</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`p-4 rounded-lg border transition-colors ${
                        theme === 'light'
                          ? 'border-2 border-primary bg-primary/10'
                          : 'border border-border bg-card hover:bg-muted'
                      }`}
                    >
                      <div className="w-full h-12 bg-background rounded mb-2 border border-border"></div>
                      <p className={`text-xs font-medium ${theme === 'light' ? 'text-primary' : ''}`}>Clair</p>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`p-4 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'border-2 border-primary bg-primary/10'
                          : 'border border-border bg-card hover:bg-muted'
                      }`}
                    >
                      <div className="w-full h-12 bg-zinc-900 rounded mb-2"></div>
                      <p className={`text-xs font-medium ${theme === 'dark' ? 'text-primary' : ''}`}>Sombre</p>
                    </button>
                    <button
                      onClick={() => handleThemeChange('auto')}
                      className={`p-4 rounded-lg border transition-colors ${
                        theme === 'auto'
                          ? 'border-2 border-primary bg-primary/10'
                          : 'border border-border bg-card hover:bg-muted'
                      }`}
                    >
                      <div className="w-full h-12 bg-gradient-to-b from-background to-zinc-900 rounded mb-2 border border-border"></div>
                      <p className={`text-xs font-medium ${theme === 'auto' ? 'text-primary' : ''}`}>Auto</p>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground">Vue par défaut</label>
                  <select className="w-full p-3 bg-muted rounded-lg border border-border text-foreground">
                    <option value="list">Liste</option>
                    <option value="calendar">Calendrier</option>
                    <option value="compact">Compacte</option>
                    <option value="timeline">Timeline</option>
                    <option value="kanban">Kanban</option>
                    <option value="treemap">Treemap</option>
                    <option value="heatmap">Heatmap</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Animations</p>
                    <p className="text-sm text-muted-foreground">Activer les transitions animées</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                    defaultChecked
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'data' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold">Données</h2>
                    <p className="text-sm text-muted-foreground">Gérez vos données et sauvegardes</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-destructive">Supprimer toutes les données</p>
                      <p className="text-sm text-muted-foreground">Action irréversible - supprime tous vos revenus, dépenses et crédits</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'about' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold">À propos</h2>
                    <p className="text-sm text-muted-foreground">Informations sur l'application</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center py-4">
                  <img
                    src="/web-app-manifest-192x192.png"
                    alt="Dépense-Man Logo"
                    className="w-24 h-24 rounded-2xl shadow-lg"
                  />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Dépense-Man</h3>
                  <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Développé avec</p>
                    <p className="text-xs text-muted-foreground">Next.js 15, React 19, Firebase, Tailwind CSS</p>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Licences</p>
                    <button className="text-xs text-primary hover:underline">Voir les licences open source</button>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Support</p>
                    <button className="text-xs text-primary hover:underline">Signaler un problème</button>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    © 2025 Dépense-Man. Tous droits réservés.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modale changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold">Changer le mot de passe</h2>
              <p className="text-sm text-muted-foreground">
                Cette fonctionnalité sera bientôt disponible
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Pour l'instant, utilisez la fonction "Mot de passe oublié" sur la page de connexion pour réinitialiser votre mot de passe.
              </p>
              <Button onClick={() => setShowPasswordModal(false)} className="w-full">
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
