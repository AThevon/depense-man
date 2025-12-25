import { SettingsClient } from '@/components/settings/SettingsClient';
import { requireAuth } from '@/lib/auth/session';

export default async function SettingsPage() {
  const session = await requireAuth();

  return <SettingsClient user={{ uid: session.userId, email: session.email || null }} />;
}
