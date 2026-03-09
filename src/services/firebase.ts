import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  type Firestore,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";
import type { Event, GlobalStats } from "@/types/firebase";

const requiredEnvVars: Record<string, string | undefined> = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(", ")}. ` +
      "Copy .env.example to .env.local and fill in your Firebase project credentials."
  );
}

const firebaseConfig = {
  apiKey: requiredEnvVars.VITE_FIREBASE_API_KEY,
  authDomain: requiredEnvVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: requiredEnvVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: requiredEnvVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: requiredEnvVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredEnvVars.VITE_FIREBASE_APP_ID,
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const auth: Auth = getAuth(app);

/**
 * Fetch a single document from Firestore.
 * Returns the document data or null if the document does not exist.
 */
export async function fetchDocument<T = DocumentData>(
  collectionPath: string,
  documentId: string
): Promise<T | null> {
  const docRef = doc(db, collectionPath, documentId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as T;
}

/**
 * Fetch all documents from a Firestore collection, with optional query constraints.
 */
export async function fetchCollection<T = DocumentData>(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const ref = collection(db, collectionPath);
  const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

/**
 * Generate a public download URL for a file stored in Firebase Storage.
 */
export async function getStorageUrl(path: string): Promise<string> {
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Failed to get storage URL for path "${path}":`, error);
    }
    throw error;
  }
}

/**
 * Fetch the global statistics document from Firestore.
 * Returns null if the document does not exist.
 */
export async function getGlobalStats(): Promise<GlobalStats | null> {
  try {
    return await fetchDocument<GlobalStats>("stats", "global");
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to fetch global stats:", error);
    }
    return null;
  }
}

export default app;
