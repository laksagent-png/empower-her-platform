import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module before importing firebase.ts so Firebase config
// environment variables are never loaded.
vi.mock("@/services/database", () => ({
  database: {
    fetchCollection: vi.fn(),
    fetchDocument: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    upsertDocument: vi.fn(),
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
  createEvent,
  updateEvent,
  deleteEvent,
  fetchImpactStats,
  updateImpactStats,
  fetchContributionDetails,
  updateContributionDetails,
} from "@/services/firebase";
import { EventStatus } from "@/types/firebase";

const mockFetchCollection = database.fetchCollection as ReturnType<typeof vi.fn>;
const mockFetchDocument = database.fetchDocument as ReturnType<typeof vi.fn>;
const mockCreateDocument = database.createDocument as ReturnType<typeof vi.fn>;
const mockUpdateDocument = database.updateDocument as ReturnType<typeof vi.fn>;
const mockDeleteDocument = database.deleteDocument as ReturnType<typeof vi.fn>;
const mockUpsertDocument = database.upsertDocument as ReturnType<typeof vi.fn>;

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

  it("queries by status == COMPLETED", async () => {
    await fetchPastEvents();

    expect(mockFetchCollection).toHaveBeenCalledOnce();
    const [, filter] = mockFetchCollection.mock.calls[0];
    expect(filter.field).toBe("status");
    expect(filter.op).toBe("==");
    expect(filter.value).toBe(EventStatus.COMPLETED);
  });

  it("returns empty array on error", async () => {
    mockFetchCollection.mockRejectedValue(new Error("network error"));
    const result = await fetchPastEvents();
    expect(result).toEqual([]);
  });
});

describe("createEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateDocument.mockResolvedValue("new-event-id");
  });

  it("calls createDocument with events collection and sets createdAt/updatedAt", async () => {
    const before = Date.now();
    const data = {
      title: "Test Event",
      startDateTime: Date.now() + 86400000,
      endDateTime: Date.now() + 90000000,
      venueName: "Test Venue",
      venueUrl: "https://maps.example.com",
      description: "A test event",
      registrationUrl: "https://forms.example.com",
      status: EventStatus.ONLINE,
      coverImage: { url: "https://example.com/cover.jpg", path: "events/tmp/session123/cover/cover.jpg" },
      hostName: "Test Host",
    };
    const id = await createEvent(data);
    const after = Date.now();

    expect(mockCreateDocument).toHaveBeenCalledOnce();
    const [collection, payload] = mockCreateDocument.mock.calls[0];
    expect(collection).toBe("events");
    expect(payload.title).toBe("Test Event");
    expect(payload.createdAt).toBeGreaterThanOrEqual(before);
    expect(payload.createdAt).toBeLessThanOrEqual(after);
    expect(payload.updatedAt).toBeGreaterThanOrEqual(before);
    expect(id).toBe("new-event-id");
  });
});

describe("updateEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateDocument.mockResolvedValue(undefined);
  });

  it("calls updateDocument with correct collection, id and sets updatedAt", async () => {
    const before = Date.now();
    await updateEvent("evt-123", { title: "Updated Title" });
    const after = Date.now();

    expect(mockUpdateDocument).toHaveBeenCalledOnce();
    const [collection, id, patch] = mockUpdateDocument.mock.calls[0];
    expect(collection).toBe("events");
    expect(id).toBe("evt-123");
    expect(patch.title).toBe("Updated Title");
    expect(patch.updatedAt).toBeGreaterThanOrEqual(before);
    expect(patch.updatedAt).toBeLessThanOrEqual(after);
  });
});

describe("deleteEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteDocument.mockResolvedValue(undefined);
  });

  it("calls deleteDocument with correct collection and id", async () => {
    await deleteEvent("evt-456");

    expect(mockDeleteDocument).toHaveBeenCalledOnce();
    const [collection, id] = mockDeleteDocument.mock.calls[0];
    expect(collection).toBe("events");
    expect(id).toBe("evt-456");
  });
});

describe("fetchImpactStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchDocument.mockResolvedValue(null);
  });

  it("fetches from stats/impact", async () => {
    const doc = { metrics: [], updatedAt: 12345 };
    mockFetchDocument.mockResolvedValue(doc);
    const result = await fetchImpactStats();
    expect(mockFetchDocument).toHaveBeenCalledOnce();
    const [col, id] = mockFetchDocument.mock.calls[0];
    expect(col).toBe("stats");
    expect(id).toBe("impact");
    expect(result).toEqual(doc);
  });

  it("returns null on error", async () => {
    mockFetchDocument.mockRejectedValue(new Error("network error"));
    const result = await fetchImpactStats();
    expect(result).toBeNull();
  });
});

describe("updateImpactStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsertDocument.mockResolvedValue(undefined);
  });

  it("upserts stats/impact with updatedAt timestamp", async () => {
    const before = Date.now();
    const metrics = [{ id: "1", label: "Test", value: 100, iconKey: "users" }];
    await updateImpactStats({ metrics });
    const after = Date.now();

    expect(mockUpsertDocument).toHaveBeenCalledOnce();
    const [col, id, payload] = mockUpsertDocument.mock.calls[0];
    expect(col).toBe("stats");
    expect(id).toBe("impact");
    expect(payload.metrics).toEqual(metrics);
    expect(payload.updatedAt).toBeGreaterThanOrEqual(before);
    expect(payload.updatedAt).toBeLessThanOrEqual(after);
  });
});

describe("fetchContributionDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchDocument.mockResolvedValue(null);
  });

  it("fetches from settings/contribution", async () => {
    const doc = { upiId: "test@upi", bankAccount: { accountName: "Test", accountNumber: "123", ifscCode: "SBIN", branch: "Main" }, updatedAt: 12345 };
    mockFetchDocument.mockResolvedValue(doc);
    const result = await fetchContributionDetails();
    expect(mockFetchDocument).toHaveBeenCalledOnce();
    const [col, id] = mockFetchDocument.mock.calls[0];
    expect(col).toBe("settings");
    expect(id).toBe("contribution");
    expect(result).toEqual(doc);
  });

  it("returns null on error", async () => {
    mockFetchDocument.mockRejectedValue(new Error("network error"));
    const result = await fetchContributionDetails();
    expect(result).toBeNull();
  });
});

describe("updateContributionDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsertDocument.mockResolvedValue(undefined);
  });

  it("upserts settings/contribution with updatedAt timestamp", async () => {
    const before = Date.now();
    const doc = {
      upiId: "test@upi",
      bankAccount: {
        accountName: "Test",
        accountNumber: "123",
        ifscCode: "SBIN",
        branch: "Main",
      },
    };
    await updateContributionDetails(doc);
    const after = Date.now();

    expect(mockUpsertDocument).toHaveBeenCalledOnce();
    const [col, id, payload] = mockUpsertDocument.mock.calls[0];
    expect(col).toBe("settings");
    expect(id).toBe("contribution");
    expect(payload.upiId).toBe("test@upi");
    expect(payload.updatedAt).toBeGreaterThanOrEqual(before);
    expect(payload.updatedAt).toBeLessThanOrEqual(after);
  });
});
