/**
 * Mock blob storage for development.
 * Converts File objects into local object-URLs so the preview works
 * without a real storage backend.
 */
export const mockBlobStorage = {
  /**
   * "Uploads" a file and returns a URL.
   * In production, replace with real storage (Firebase, S3, etc.).
   */
  async uploadFile(file: File, _path?: string): Promise<string> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 400));
    // Create a local blob URL that works in the browser session
    return URL.createObjectURL(file);
  },
};
