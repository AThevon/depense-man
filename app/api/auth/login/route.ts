import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    await createSession(idToken);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Échec de la connexion' }, { status: 500 });
  }
}
