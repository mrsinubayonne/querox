import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn (className merge)", () => {
  it("merges simple classes", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("deduplicates tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined/null inputs", () => {
    expect(cn("base", undefined, null)).toBe("base");
  });
});
