import { describe, it, expect } from "vitest";
import {
  detectConflict,
  resolveClientWins,
  resolveServerWins,
  resolveMerge,
  mergeItemArrays,
} from "../conflictResolution";

describe("detectConflict", () => {
  it("returns null when server data is older than last sync", () => {
    const local = { id: "1", status: "delivered", updated_at: "2026-01-01T00:00:00Z" };
    const server = { id: "1", status: "pending", updated_at: "2026-01-01T00:00:00Z" };
    const lastSync = new Date("2026-01-02").getTime();
    expect(detectConflict(local, server, lastSync)).toBeNull();
  });

  it("detects conflict when server updated after last sync", () => {
    const local = { id: "1", status: "delivered" };
    const server = { id: "1", status: "pending", updated_at: "2026-03-19T12:00:00Z" };
    const lastSync = new Date("2026-03-18").getTime();
    const result = detectConflict(local, server, lastSync);
    expect(result).not.toBeNull();
    expect(result!.conflictFields).toContain("status");
  });

  it("returns null when values match despite newer server timestamp", () => {
    const local = { id: "1", status: "paid" };
    const server = { id: "1", status: "paid", updated_at: "2026-03-19T12:00:00Z" };
    const lastSync = new Date("2026-03-18").getTime();
    expect(detectConflict(local, server, lastSync)).toBeNull();
  });

  it("ignores server authority fields in conflict detection", () => {
    const local = { id: "1", user_id: "u1", notes: "same" };
    const server = { id: "2", user_id: "u2", notes: "same", updated_at: "2026-03-19T12:00:00Z" };
    const lastSync = new Date("2026-03-18").getTime();
    expect(detectConflict(local, server, lastSync)).toBeNull();
  });
});

describe("resolveClientWins", () => {
  it("uses client values except server authority fields", () => {
    const local = { id: "local-id", status: "delivered", notes: "client note" };
    const server = { id: "server-id", status: "pending", notes: "server note", created_at: "2026-01-01" };
    const result = resolveClientWins(local, server);
    expect(result.id).toBe("server-id"); // server authority
    expect(result.status).toBe("delivered"); // client wins
    expect(result.notes).toBe("client note"); // client wins
    expect(result.created_at).toBe("2026-01-01"); // preserved
  });
});

describe("resolveServerWins", () => {
  it("returns server data unchanged", () => {
    const local = { status: "delivered" };
    const server = { status: "pending", notes: "server" };
    const result = resolveServerWins(local, server);
    expect(result.status).toBe("pending");
    expect(result.notes).toBe("server");
  });
});

describe("resolveMerge", () => {
  it("uses client value for client-priority fields", () => {
    const local = { status: "delivered", total_amount: 5000 };
    const server = { status: "pending", total_amount: 3000, updated_at: "2026-03-19T12:00:00Z" };
    const localTs = new Date("2026-03-18").getTime();
    const result = resolveMerge(local, server, localTs);
    expect(result.merged.status).toBe("delivered");
    expect(result.merged.total_amount).toBe(5000);
    expect(result.autoResolved).toContain("status");
  });

  it("uses server value for non-priority fields when server is newer", () => {
    const local = { category: "food" };
    const server = { category: "drinks", updated_at: "2026-03-19T12:00:00Z" };
    const localTs = new Date("2026-03-18").getTime();
    const result = resolveMerge(local, server, localTs);
    expect(result.merged.category).toBe("drinks");
    expect(result.conflicts).toContain("category");
  });
});

describe("mergeItemArrays", () => {
  it("deduplicates by id, preferring local", () => {
    const local = [{ id: "a", qty: 3 }];
    const server = [{ id: "a", qty: 1 }, { id: "b", qty: 2 }];
    const result = mergeItemArrays(local, server);
    expect(result).toHaveLength(2);
    expect(result.find((i) => i.id === "a")!.qty).toBe(3);
  });
});
