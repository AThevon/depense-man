'use client';

import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, UseAuthReturn } from '@/lib/types';

// Liste des emails autorisés (à configurer selon tes besoins)
const ALLOWED_EMAILS = [
  process.env.NEXT_PUBLIC_ALLOWED_EMAIL
];

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Vérifier si l'email est autorisé
        if (!ALLOWED_EMAILS.includes(firebaseUser.email || '')) {
          setError('Accès non autorisé. Contactez l\'administrateur.');
          setUser(null);
          firebaseSignOut(auth);
          setLoading(false);
          return;
        }

        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        };
        setUser(userData);
        setError(null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!ALLOWED_EMAILS.includes(email)) {
        throw new Error('Accès non autorisé. Contactez l\'administrateur.');
      }

      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await firebaseSignOut(auth);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de déconnexion';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      
      if (!ALLOWED_EMAILS.includes(email)) {
        throw new Error('Accès non autorisé. Contactez l\'administrateur.');
      }

      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de réinitialisation';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    resetPassword,
  };
} 