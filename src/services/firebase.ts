import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;
let isConfigured = false;

// Check if credentials are present in localStorage or environment
try {
  const customConfigStr = localStorage.getItem('spendwise_firebase_config');
  let config = null;

  if (customConfigStr) {
    try {
      config = JSON.parse(customConfigStr);
    } catch {
      config = null;
    }
  }

  // Fallback to process or import.meta env if configured
  if (!config && import.meta.env.VITE_FIREBASE_API_KEY) {
    config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  if (config && config.apiKey && config.projectId) {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }
    firestoreDb = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
    isConfigured = true;
  }
} catch (e) {
  console.warn('Firebase initialization skipped or failed:', e);
}

export function isFirebaseConfigured(): boolean {
  return isConfigured && firestoreDb !== null && firebaseAuth !== null;
}

export function getDb(): Firestore | null {
  return firestoreDb;
}

export function getFirebaseAuth(): Auth | null {
  return firebaseAuth;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const auth = firebaseAuth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
