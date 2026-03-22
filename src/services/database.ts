import type { IDatabase } from "./interfaces/database";
import { FirestoreDatabase } from "./providers/firebase/database";
import type { GlobalStats } from "@/types/firebase";

/**
 * Active database provider.
 *
 * To switch providers, replace `FirestoreDatabase` with a different `IDatabase`
 * implementation and update the import above.
 */
export const database: IDatabase = new FirestoreDatabase();

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
