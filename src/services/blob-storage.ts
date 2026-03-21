import type { IBlobStorage } from "./interfaces/blob-storage";
import { FirebaseBlobStorage } from "./providers/firebase/blob-storage";

/**
 * Active blob storage provider.
 *
 * To switch providers, replace `FirebaseBlobStorage` with a different `IBlobStorage`
 * implementation and update the import above.
 */
export const blobStorage: IBlobStorage = new FirebaseBlobStorage();
