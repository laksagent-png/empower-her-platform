import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  type DocumentData,
} from "firebase/firestore";
import type { IDatabase, QueryFilter } from "../../interfaces/database";
import { firestoreDb, auth } from "./config";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export class FirestoreDatabase implements IDatabase {
  async fetchDocument<T = DocumentData>(
    collectionPath: string,
    id: string
  ): Promise<T | null> {
    try {
      const docRef = doc(firestoreDb, collectionPath, id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as T;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${collectionPath}/${id}`);
      return null;
    }
  }

  async fetchCollection<T = DocumentData>(
    collectionPath: string,
    ...filters: QueryFilter[]
  ): Promise<T[]> {
    try {
      const ref = collection(firestoreDb, collectionPath);
      const constraints = filters.map((f) => where(f.field, f.op, f.value));
      const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
      return [];
    }
  }

  async createDocument<T extends DocumentData>(
    collectionPath: string,
    data: T
  ): Promise<string> {
    try {
      const ref = collection(firestoreDb, collectionPath);
      const docRef = await addDoc(ref, data);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionPath);
      throw error;
    }
  }

  async updateDocument<T extends DocumentData>(
    collectionPath: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(firestoreDb, collectionPath, id);
      await updateDoc(docRef, data as { [x: string]: unknown });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionPath}/${id}`);
      throw error;
    }
  }

  async deleteDocument(
    collectionPath: string,
    id: string
  ): Promise<void> {
    try {
      const docRef = doc(firestoreDb, collectionPath, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${id}`);
      throw error;
    }
  }
}
