import { ref, getDownloadURL } from "firebase/storage";
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
}
