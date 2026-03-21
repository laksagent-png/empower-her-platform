import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseStorage } from "./providers/firebase/config";

/**
 * Blob storage for development and production.
 */
export const mockBlobStorage = {
  /**
   * Uploads a file and returns a URL.
   */
  async uploadFile(file: File, path?: string): Promise<string> {
    const storageRef = ref(firebaseStorage, path || `uploads/${Date.now()}_${file.name}`);
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Upload timed out. Please check if Firebase Storage is enabled in your project.")), 30000);
    });

    try {
      // Race the upload against the timeout
      const snapshot = await Promise.race([
        uploadBytes(storageRef, file),
        timeoutPromise
      ]);
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Storage upload error:", error);
      throw error;
    }
  },
};
