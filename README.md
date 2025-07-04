# Dépense Manager

Une application PWA moderne pour gérer vos finances mensuelles avec Firebase et Next.js.

## 🚀 Fonctionnalités

- **Gestion des dépenses mensuelles** : Ajoutez, modifiez et supprimez vos prélèvements
- **Gestion des revenus** : Suivez vos entrées d'argent mensuelles
- **Crédits échelonnés** : Gérez vos paiements avec nombre de mensualités restantes
- **Calcul automatique** : Visualisez votre reste à vivre en temps réel
- **Authentification sécurisée** : Accès restreint via Firebase Auth
- **Interface mobile-first** : Optimisée pour smartphone et tablette
- **PWA** : Installable sur iPhone/Android comme une app native
- **Temps réel** : Synchronisation automatique des données avec Firestore
- **Thème sombre** : Design moderne avec accents jaune-orangé

## 🛠️ Technologies

- **Next.js 15.3.5** avec App Router
- **React 19** avec hooks modernes
- **TypeScript** strict
- **Tailwind CSS 4** avec variables CSS
- **Firebase Auth** pour l'authentification
- **Firestore** pour la base de données temps réel
- **Lucide React** pour les icônes
- **PWA** avec Service Worker

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd depense-man
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Firebase**
   
   Créer un projet Firebase et activer :
   - Authentication (Email/Password)
   - Firestore Database
   
   Créer un fichier `.env.local` :
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_ALLOWED_EMAIL=your-email@example.com
   ```

4. **Règles Firestore**
   
   Configurer les règles de sécurité dans Firebase Console :
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /monthly_items/{document} {
         allow read, write: if request.auth != null && 
           request.auth.token.email in ['your-email@example.com'];
       }
     }
   }
   ```

5. **Créer les icônes PWA**
   
   Créer les fichiers suivants dans `/public/` :
   - `web-app-manifest-192x192.png` (192x192px)
   - `web-app-manifest-512x512.png` (512x512px)
   - `apple-icon.png` (180x180px)

   Utilisez un générateur d'icônes PWA ou créez des icônes avec le logo de votre app.

## 🚀 Développement

```bash
# Lancer le serveur de développement
npm run dev

# Build de production
npm run build

# Lancer en production
npm start

# Linter
npm run lint
```

## 🌐 Déploiement sur Vercel

1. **Connecter à Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configuration des variables d'environnement**
   
   Dans le dashboard Vercel, ajouter toutes les variables d'environnement Firebase.

3. **Déploiement automatique**
   
   Connecter votre repository Git à Vercel pour un déploiement automatique.

## 📱 Installation PWA

### iPhone/iPad
1. Ouvrir l'app dans Safari
2. Toucher l'icône de partage
3. Sélectionner "Ajouter à l'écran d'accueil"

### Android
1. Ouvrir l'app dans Chrome
2. Toucher le menu (3 points)
3. Sélectionner "Ajouter à l'écran d'accueil"

## 🎨 Personnalisation

### Couleurs
Modifier les couleurs dans `app/globals.css` :
```css
:root {
  --color-primary: #f59e0b;          /* Jaune-orangé principal */
  --color-primary-darker: #d97706;   /* Variante plus sombre */
  --color-background: #232323;       /* Fond sombre */
  --color-surface: #2a2a2a;         /* Surface des cartes */
}
```

### Icônes
Ajouter de nouvelles icônes dans `components/ui/IconSelector.tsx` :
```typescript
export const AVAILABLE_ICONS: IconOption[] = [
  // Ajouter vos icônes ici
  { name: 'new-icon', icon: NewIcon, category: 'expense' },
];
```

## 🔧 Structure du projet

```
depense-man/
├── app/                    # App Router Next.js
│   ├── globals.css        # Styles globaux et thème
│   ├── layout.tsx         # Layout principal avec PWA
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   ├── forms/            # Formulaires
│   ├── dashboard/        # Interface principale
│   └── auth/             # Authentification
├── hooks/                # Hooks personnalisés
│   ├── useAuth.ts        # Hook d'authentification
│   └── useMonthlyItems.ts # Hook de gestion des données
├── lib/                  # Utilitaires
│   ├── firebase.ts       # Configuration Firebase
│   └── types.ts          # Types TypeScript
└── public/               # Assets statiques
    ├── manifest.json     # Manifeste PWA
    ├── sw.js            # Service Worker
    └── *.png            # Icônes PWA
```

## 🔐 Sécurité

- **Authentification restrictive** : Seuls les emails autorisés peuvent se connecter
- **Règles Firestore** : Accès limité aux données de l'utilisateur connecté
- **Validation côté client et serveur** : Toutes les données sont validées
- **HTTPS obligatoire** : Nécessaire pour PWA et Firebase

## 🐛 Dépannage

### Problèmes d'installation PWA
- Vérifier que le site est servi en HTTPS
- Vérifier que le manifeste est accessible
- Tester le Service Worker dans les DevTools

### Problèmes Firebase
- Vérifier les variables d'environnement
- Contrôler les règles Firestore
- Vérifier que l'email est dans la liste autorisée

### Problèmes de build
- Nettoyer le cache : `rm -rf .next && npm run build`
- Vérifier les types TypeScript
- Contrôler les imports/exports

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou soumettez une pull request.

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.
