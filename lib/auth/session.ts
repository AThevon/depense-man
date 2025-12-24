'use server';

import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';

export interface Session {
  userId: string;
  email: string | undefined;
}

/**
 * Récupère la session utilisateur depuis le cookie
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return null;
    }

    // Vérifier le cookie de session avec Firebase Admin
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    return {
      userId: decodedClaims.uid,
      email: decodedClaims.email,
    };
  } catch {
    // Session invalide ou expirée
    return null;
  }
}

/**
 * Requiert une session valide, sinon redirige vers login
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

/**
 * Crée une session cookie depuis un ID token Firebase
 */
export async function createSession(idToken: string): Promise<void> {
  try {
    // Créer un cookie de session (5 jours)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 jours en ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn / 1000, // En secondes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  } catch (error) {
    console.error('Failed to create session:', error);
    throw new Error('Failed to create session');
  }
}

/**
 * Détruit la session en supprimant le cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
