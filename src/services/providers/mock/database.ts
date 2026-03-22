import type { IDatabase, QueryFilter, PaginationOptions, PageResult } from "../../interfaces/database";
import { useEventStore } from "@/stores/eventStore";

/**
 * In-memory mock database that reads events from the Zustand event store.
 *
 * Activated automatically when the `VITE_USE_MOCK_DATA` environment variable
 * is set to `"true"` (e.g. in PR-preview builds that have no Firebase
 * credentials). All write operations are forwarded to the store so admin
 * actions remain functional in mock mode.
 */
export class MockDatabase implements IDatabase {
  /** Retrieve raw documents for a named collection. */
  private getCollection(name: string): Record<string, unknown>[] {
    if (name === "events") {
      return useEventStore.getState().events as unknown as Record<string, unknown>[];
    }
    return [];
  }

  async fetchDocument<T>(collection: string, id: string): Promise<T | null> {
    const docs = this.getCollection(collection);
    const found = docs.find((d) => (d as { id: string }).id === id);
    return (found ?? null) as T | null;
  }

  async fetchCollection<T>(collection: string, ...filters: QueryFilter[]): Promise<T[]> {
    let docs = this.getCollection(collection);
    for (const f of filters) {
      docs = applyFilter(docs, f);
    }
    return docs as T[];
  }

  async fetchCollectionPage<T>(
    collection: string,
    pagination: PaginationOptions,
    ...filters: QueryFilter[]
  ): Promise<PageResult<T>> {
    let docs = this.getCollection(collection);

    for (const f of filters) {
      docs = applyFilter(docs, f);
    }

    if (pagination.orderBy) {
      docs = sortDocs(docs, pagination.orderBy.field, pagination.orderBy.direction ?? "asc");
    }

    if (pagination.startAfterId) {
      const idx = docs.findIndex(
        (d) => (d as { id: string }).id === pagination.startAfterId
      );
      if (idx !== -1) {
        docs = docs.slice(idx + 1);
      }
    }

    const hasMore = docs.length > pagination.limit;
    const page = docs.slice(0, pagination.limit);
    const lastId =
      page.length > 0 ? (page[page.length - 1] as { id: string }).id : null;

    return { items: page as T[], hasMore, lastId };
  }

  async createDocument(collection: string, data: Record<string, unknown>): Promise<string> {
    const id = crypto.randomUUID();
    if (collection === "events") {
      useEventStore.getState().addEvent(
        { ...data, id } as Parameters<ReturnType<typeof useEventStore.getState>["addEvent"]>[0]
      );
    }
    return id;
  }

  async updateDocument(collection: string, id: string, patch: Record<string, unknown>): Promise<void> {
    if (collection === "events") {
      useEventStore.getState().updateEvent(
        id,
        patch as Parameters<ReturnType<typeof useEventStore.getState>["updateEvent"]>[1]
      );
    }
  }

  async deleteDocument(collection: string, id: string): Promise<void> {
    if (collection === "events") {
      useEventStore.getState().deleteEvent(id);
    }
  }

  async upsertDocument(
    _collection: string,
    _id: string,
    _data: Record<string, unknown>
  ): Promise<void> {
    // No persistent storage in mock mode; writes are silently accepted.
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function applyFilter(
  docs: Record<string, unknown>[],
  filter: QueryFilter
): Record<string, unknown>[] {
  return docs.filter((d) => {
    const val = d[filter.field];
    switch (filter.op) {
      case "==":  return val === filter.value;
      case "!=":  return val !== filter.value;
      case "<":   return (val as number) < (filter.value as number);
      case "<=":  return (val as number) <= (filter.value as number);
      case ">":   return (val as number) > (filter.value as number);
      case ">=":  return (val as number) >= (filter.value as number);
      case "array-contains":
        return Array.isArray(val) && val.includes(filter.value);
      case "in":
        return Array.isArray(filter.value) && (filter.value as unknown[]).includes(val);
      case "not-in":
        return Array.isArray(filter.value) && !(filter.value as unknown[]).includes(val);
      case "array-contains-any":
        return (
          Array.isArray(val) &&
          Array.isArray(filter.value) &&
          (filter.value as unknown[]).some((v) => (val as unknown[]).includes(v))
        );
      default:
        return true;
    }
  });
}

function sortDocs(
  docs: Record<string, unknown>[],
  field: string,
  direction: "asc" | "desc"
): Record<string, unknown>[] {
  return [...docs].sort((a, b) => {
    const av = a[field] as number | string;
    const bv = b[field] as number | string;
    if (av < bv) return direction === "asc" ? -1 : 1;
    if (av > bv) return direction === "asc" ? 1 : -1;
    return 0;
  });
}
