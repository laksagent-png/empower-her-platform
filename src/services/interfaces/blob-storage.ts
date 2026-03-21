/**
 * Provider-agnostic interface for blob / file storage operations.
 *
 * To swap Firebase Storage for another provider (e.g. Cloudflare R2, AWS S3):
 *   1. Create a new implementation of this interface under src/services/providers/<name>/
 *   2. Update the binding in src/services/blob-storage.ts to use the new class.
 */
export interface IBlobStorage {
  /**
   * Resolve a provider-specific storage path to a publicly accessible URL.
   */
  getFileUrl(path: string): Promise<string>;

  /**
   * Upload a file to the given storage path.
   * Returns the public download URL and the storage path that can be used
   * later to delete the object.
   */
  uploadFile(file: File, path: string): Promise<{ url: string; path: string }>;

  /**
   * Permanently delete the object at the given storage path.
   * Must only be called by authenticated admin users.
   */
  deleteFile(path: string): Promise<void>;
}
