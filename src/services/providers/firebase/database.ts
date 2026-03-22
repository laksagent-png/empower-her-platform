import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  startAfter as firestoreStartAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import type { IDatabase, QueryFilter, PaginationOptions, PageResult } from "../../interfaces/database";
import { firestoreDb } from "./config";

export class FirestoreDatabase implements IDatabase {
  async fetchDocument<T = DocumentData>(
    collectionPath: string,
    id: string
  ): Promise<T | null> {
    const docRef = doc(firestoreDb, collectionPath, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as T;
  }

  async fetchCollection<T = DocumentData>(
    collectionPath: string,
    ...filters: QueryFilter[]
  ): Promise<T[]> {
    const ref = collection(firestoreDb, collectionPath);
    const constraints = filters.map((f) => where(f.field, f.op, f.value));
    const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
  }

  async fetchCollectionPage<T = DocumentData>(
    collectionPath: string,
    pagination: PaginationOptions,
    ...filters: QueryFilter[]
  ): Promise<PageResult<T>> {
    const { limit, startAfterId, orderBy } = pagination;
    const ref = collection(firestoreDb, collectionPath);

    const constraints: QueryConstraint[] = filters.map((f) =>
      where(f.field, f.op, f.value)
    );

    if (orderBy) {
      constraints.push(firestoreOrderBy(orderBy.field, orderBy.direction ?? "asc"));
    }

    if (startAfterId) {
      const cursorSnap = await getDoc(doc(firestoreDb, collectionPath, startAfterId));
      if (cursorSnap.exists()) {
        constraints.push(firestoreStartAfter(cursorSnap));
      }
    }

    // Fetch one extra document to detect whether a next page exists.
    constraints.push(firestoreLimit(limit + 1));

    const q = query(ref, ...constraints);
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    const hasMore = docs.length > limit;
    const pageDocs = docs.slice(0, limit);
    const items = pageDocs.map((d) => ({ id: d.id, ...d.data() } as T));
    const lastId = items.length > 0 ? (items[items.length - 1] as { id: string }).id : null;

    return { items, hasMore, lastId };
  }

  async createDocument(
    collectionPath: string,
    data: Record<string, unknown>
  ): Promise<string> {
    const ref = collection(firestoreDb, collectionPath);
    const docRef = await addDoc(ref, data);
    return docRef.id;
  }

  async updateDocument(
    collectionPath: string,
    id: string,
    patch: Record<string, unknown>
  ): Promise<void> {
    const docRef = doc(firestoreDb, collectionPath, id);
    await updateDoc(docRef, patch);
  }

  async deleteDocument(collectionPath: string, id: string): Promise<void> {
    const docRef = doc(firestoreDb, collectionPath, id);
    await deleteDoc(docRef);
  }

  async upsertDocument(
    collectionPath: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const docRef = doc(firestoreDb, collectionPath, id);
    await setDoc(docRef, data);
  }
}
