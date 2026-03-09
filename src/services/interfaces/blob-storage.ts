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
}
