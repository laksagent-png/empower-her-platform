import { ref, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";
import type { IBlobStorage } from "../../interfaces/blob-storage";
import { firebaseStorage } from "./config";

export class FirebaseBlobStorage implements IBlobStorage {
  async getFileUrl(path: string): Promise<string> {
    try {
      const fileRef = ref(firebaseStorage, path);
      return await getDownloadURL(fileRef);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to get storage URL for path "${path}":`, error);
      }
      throw error;
    }
  }

  async uploadFile(file: File, path: string): Promise<{ url: string; path: string }> {
    try {
      const fileRef = ref(firebaseStorage, path);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return { url, path };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to upload file to path "${path}":`, error);
      }
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const fileRef = ref(firebaseStorage, path);
      await deleteObject(fileRef);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to delete storage object at path "${path}":`, error);
      }
      throw error;
    }
  }
}

/** Singleton instance used throughout the app. */
export const firebaseBlobStorage = new FirebaseBlobStorage();
