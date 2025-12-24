'use server';

import { redirect } from 'next/navigation';
import { createSession, destroySession } from './session';

interface LoginState {
  error?: string;
  success?: boolean;
}

/**
 * Server Action pour login
 * Attend un idToken Firebase généré côté client
 */
export async function login(prevState: LoginState | null, formData: FormData): Promise<LoginState> {
  const idToken = formData.get('idToken') as string;

  if (!idToken) {
    return { error: 'Token manquant' };
  }

  try {
    // Créer la session serveur
    await createSession(idToken);

    // Retourner success au lieu de redirect
    // Le redirect sera fait côté client
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Échec de la connexion' };
  }
}

/**
 * Server Action pour logout
 */
export async function logout(): Promise<void> {
  await destroySession();
  redirect('/login');
}
