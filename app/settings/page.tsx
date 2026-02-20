'use client';

import { useAuth } from '@/hooks/useAuth';
import { SettingsClient } from '@/components/settings/SettingsClient';

export default function SettingsPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return <SettingsClient user={{ uid: user.uid, email: user.email }} />;
}
