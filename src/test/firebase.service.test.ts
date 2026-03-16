import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module before importing firebase.ts so Firebase config
// environment variables are never loaded.
vi.mock("@/services/database", () => ({
  database: {
    fetchCollection: vi.fn(),
    fetchDocument: vi.fn(),
  },
}));

// Mock the event schema to avoid Zod / Firebase dependency chain.
vi.mock("@/schemas/event.schema", () => ({
  validateEvent: vi.fn((data: unknown) => data),
}));

import { database } from "@/services/database";
import {
  fetchUpcomingEvents,
  fetchPastEvents,
} from "@/services/firebase";

const mockFetchCollection = database.fetchCollection as ReturnType<typeof vi.fn>;

describe("fetchUpcomingEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCollection.mockResolvedValue([]);
  });

  it("queries by startDateTime >= current time", async () => {
    const before = Date.now();
    await fetchUpcomingEvents();
    const after = Date.now();

    expect(mockFetchCollection).toHaveBeenCalledOnce();
    const [, filter] = mockFetchCollection.mock.calls[0];
    expect(filter.field).toBe("startDateTime");
    expect(filter.op).toBe(">=");
    expect(filter.value).toBeGreaterThanOrEqual(before);
    expect(filter.value).toBeLessThanOrEqual(after);
  });

  it("does not filter by status", async () => {
    await fetchUpcomingEvents();
    const [, filter] = mockFetchCollection.mock.calls[0];
    expect(filter.field).not.toBe("status");
  });

  it("returns empty array on error", async () => {
    mockFetchCollection.mockRejectedValue(new Error("network error"));
    const result = await fetchUpcomingEvents();
    expect(result).toEqual([]);
  });
});

describe("fetchPastEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCollection.mockResolvedValue([]);
  });

  it("queries by startDateTime < current time", async () => {
    const before = Date.now();
    await fetchPastEvents();
    const after = Date.now();

    expect(mockFetchCollection).toHaveBeenCalledOnce();
    const [, filter] = mockFetchCollection.mock.calls[0];
    expect(filter.field).toBe("startDateTime");
    expect(filter.op).toBe("<");
    expect(filter.value).toBeGreaterThanOrEqual(before);
    expect(filter.value).toBeLessThanOrEqual(after);
  });

  it("does not filter by status", async () => {
    await fetchPastEvents();
    const [, filter] = mockFetchCollection.mock.calls[0];
    expect(filter.field).not.toBe("status");
  });

  it("returns empty array on error", async () => {
    mockFetchCollection.mockRejectedValue(new Error("network error"));
    const result = await fetchPastEvents();
    expect(result).toEqual([]);
  });
});
