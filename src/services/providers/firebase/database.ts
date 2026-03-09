import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import type { IDatabase, QueryFilter } from "../../interfaces/database";
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
}
