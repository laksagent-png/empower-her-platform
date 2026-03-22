import type { IDatabase } from "./interfaces/database";
import { FirestoreDatabase } from "./providers/firebase/database";
import { MockDatabase } from "./providers/mock/database";
import type { GlobalStats } from "@/types/firebase";

/**
 * Active database provider.
 *
 * Uses `MockDatabase` (in-memory, no Firebase credentials required) when
 * `VITE_USE_MOCK_DATA` is set to `"true"` or when the Firebase project-ID
 * environment variable is absent (e.g. local development without a
 * `.env.local` file, or PR-preview builds).
 *
 * To switch to a different production provider, replace `FirestoreDatabase`
 * with another `IDatabase` implementation and update the import above.
 */
const useMock =
  import.meta.env.VITE_USE_MOCK_DATA === "true" ||
  !import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const database: IDatabase = useMock
  ? new MockDatabase()
  : new FirestoreDatabase();

/**
 * Convenience helper: fetch the global statistics document.
 * Returns null if the document does not exist or a fetch error occurs.
 */
export async function getGlobalStats(): Promise<GlobalStats | null> {
  try {
    return await database.fetchDocument<GlobalStats>("stats", "global");
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to fetch global stats:", error);
    }
    return null;
  }
}
