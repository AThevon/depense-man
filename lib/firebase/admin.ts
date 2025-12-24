import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

let adminApp: App | null = null;

export function getAdminApp() {
  if (!adminApp) {
    const apps = getApps();
    if (apps.length === 0) {
      adminApp = initializeApp(firebaseAdminConfig);
    } else {
      adminApp = apps[0];
    }
  }
  return adminApp;
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
