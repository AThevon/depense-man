'use server';

import { redirect } from 'next/navigation';
import { createSession, destroySession } from './session';

/**
 * Server Action pour login
 * Attend un idToken Firebase généré côté client
 */
export async function login(idToken: string): Promise<{ error?: string; success?: boolean }> {
  if (!idToken) {
    return { error: 'Token manquant' };
  }

  try {
    await createSession(idToken);
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
