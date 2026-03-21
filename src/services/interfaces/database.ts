/**
 * Provider-agnostic interface for database (document-store) operations.
 *
 * To swap Firebase Firestore for another provider (e.g. Cloudflare D1, Supabase):
 *   1. Create a new implementation of this interface under src/services/providers/<name>/
 *   2. Update the binding in src/services/database.ts to use the new class.
 */

/** A provider-agnostic filter condition for collection queries. */
export interface QueryFilter {
  field: string;
  op:
    | "=="
    | "!="
    | "<"
    | "<="
    | ">"
    | ">="
    | "array-contains"
    | "in"
    | "not-in"
    | "array-contains-any";
  value: unknown;
}

export interface IDatabase {
  /**
   * Fetch a single document by collection path and document ID.
   * Returns the document data merged with its `id` field, or null if not found.
   */
  fetchDocument<T = Record<string, unknown>>(
    collection: string,
    id: string
  ): Promise<T | null>;

  /**
   * Fetch documents from a collection, with optional provider-agnostic filters.
   * Returns an array of documents each merged with their `id` field.
   */
  fetchCollection<T = Record<string, unknown>>(
    collection: string,
    ...filters: QueryFilter[]
  ): Promise<T[]>;

  /**
   * Create a new document in the given collection with auto-generated ID.
   * Returns the new document's ID.
   */
  createDocument(
    collectionPath: string,
    data: Record<string, unknown>
  ): Promise<string>;

  /**
   * Update (merge) fields on an existing document.
   */
  updateDocument(
    collectionPath: string,
    id: string,
    patch: Record<string, unknown>
  ): Promise<void>;

  /**
   * Permanently delete a document by collection path and ID.
   */
  deleteDocument(collectionPath: string, id: string): Promise<void>;

  /**
   * Create or fully overwrite a document at the given collection path and ID.
   * Unlike `updateDocument`, this succeeds even if the document does not yet exist.
   */
  upsertDocument(
    collectionPath: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<void>;
}
