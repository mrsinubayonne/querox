import { describe, it, expect } from "vitest";
import { sanitizeStorageId, resolveOfflineUserId } from "../offlineIdentity";

describe("sanitizeStorageId", () => {
  it("returns undefined for null/undefined/empty", () => {
    expect(sanitizeStorageId(null)).toBeUndefined();
    expect(sanitizeStorageId(undefined)).toBeUndefined();
    expect(sanitizeStorageId("")).toBeUndefined();
    expect(sanitizeStorageId("   ")).toBeUndefined();
  });

  it("returns undefined for invalid string values", () => {
    expect(sanitizeStorageId("undefined")).toBeUndefined();
    expect(sanitizeStorageId("null")).toBeUndefined();
    expect(sanitizeStorageId("NaN")).toBeUndefined();
    expect(sanitizeStorageId("false")).toBeUndefined();
    expect(sanitizeStorageId("FALSE")).toBeUndefined();
  });

  it("returns trimmed value for valid strings", () => {
    expect(sanitizeStorageId("  abc-123  ")).toBe("abc-123");
    expect(sanitizeStorageId("valid-id")).toBe("valid-id");
  });
});

describe("resolveOfflineUserId", () => {
  it("returns userId for non-team members", () => {
    expect(resolveOfflineUserId({ userId: "u1", isTeamMember: false })).toBe("u1");
  });

  it("returns ownerId for team members", () => {
    expect(resolveOfflineUserId({ userId: "u1", isTeamMember: true, ownerId: "owner1" })).toBe("owner1");
  });

  it("returns undefined when source is null", () => {
    expect(resolveOfflineUserId({ userId: null, isTeamMember: false })).toBeUndefined();
  });
});
