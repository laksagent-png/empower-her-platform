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

/** Options for paginated collection queries. */
export interface PaginationOptions {
  /** Maximum number of documents to return in a single page. */
  limit: number;
  /**
   * Document ID of the last document on the previous page.
   * When provided, the query returns documents after this cursor.
   */
  startAfterId?: string;
  /** Field to order results by, along with sort direction. */
  orderBy?: { field: string; direction?: "asc" | "desc" };
}

/** The result of a paginated collection query. */
export interface PageResult<T> {
  /** Documents on the current page. */
  items: T[];
  /** Whether there are more documents after this page. */
  hasMore: boolean;
  /** The ID of the last document in `items`, or null when the page is empty. */
  lastId: string | null;
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
   * Fetch a single page of documents from a collection.
   * Supports cursor-based pagination via `PaginationOptions.startAfterId`.
   * Returns a `PageResult` with the page items, a `hasMore` flag, and the
   * last document ID to use as the cursor for the next page.
   */
  fetchCollectionPage<T = Record<string, unknown>>(
    collection: string,
    pagination: PaginationOptions,
    ...filters: QueryFilter[]
  ): Promise<PageResult<T>>;

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
