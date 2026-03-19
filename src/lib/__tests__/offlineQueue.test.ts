import { describe, it, expect, beforeEach } from "vitest";
import {
  getQueuedMutations,
  queueMutation,
  removeMutation,
  incrementRetryCount,
  cleanupQueue,
  getPendingCount,
} from "../offlineQueue";

const QUEUE_KEY = "querox_offline_queue";

describe("offlineQueue", () => {
  beforeEach(() => {
    localStorage.removeItem(QUEUE_KEY);
  });

  it("starts with empty queue", () => {
    expect(getQueuedMutations()).toEqual([]);
    expect(getPendingCount()).toBe(0);
  });

  it("queues and retrieves mutations", () => {
    const id = queueMutation("createOrder", { total: 100 });
    expect(id).toBeTruthy();
    const queue = getQueuedMutations();
    expect(queue).toHaveLength(1);
    expect(queue[0].mutationKey).toBe("createOrder");
    expect(queue[0].variables).toEqual({ total: 100 });
  });

  it("removes a mutation", () => {
    const id = queueMutation("test", {});
    expect(getPendingCount()).toBe(1);
    removeMutation(id);
    expect(getPendingCount()).toBe(0);
  });

  it("increments retry count and removes after max retries", () => {
    const id = queueMutation("test", {});
    expect(incrementRetryCount(id)).toBe(true); // 1
    expect(incrementRetryCount(id)).toBe(true); // 2
    expect(incrementRetryCount(id)).toBe(false); // 3 = max, removed
    expect(getPendingCount()).toBe(0);
  });

  it("cleans up mutations older than 24h", () => {
    // Manually insert an old mutation
    const old = {
      id: "old",
      timestamp: Date.now() - 25 * 60 * 60 * 1000,
      mutationKey: "old",
      variables: {},
      retryCount: 0,
    };
    const recent = {
      id: "new",
      timestamp: Date.now(),
      mutationKey: "new",
      variables: {},
      retryCount: 0,
    };
    localStorage.setItem(QUEUE_KEY, JSON.stringify([old, recent]));
    cleanupQueue();
    const queue = getQueuedMutations();
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe("new");
  });
});
