'use client';

import { useEffect, useState } from 'react';
import { SettingsClient } from '@/components/settings/SettingsClient';
import { auth } from '@/lib/firebase';

export default function SettingsPage() {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return null; // Ou un skeleton minimaliste
  }

  return <SettingsClient user={user} />;
}
