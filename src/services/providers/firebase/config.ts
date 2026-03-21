import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";
import firebaseConfig from "../../../../firebase-applet-config.json";

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firestoreDb: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const firebaseStorage: FirebaseStorage = getStorage(app);
export const auth: Auth = getAuth(app);

export default app;
