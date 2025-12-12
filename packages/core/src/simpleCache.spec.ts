import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SimpleCache } from "./index.js";

describe("SimpleCache", () => {
  let cache: SimpleCache<string>;

  beforeEach(() => {
    cache = new SimpleCache<string>(3); // Small cache for testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should create cache with default max size", () => {
      const defaultCache = new SimpleCache<string>();
      expect(defaultCache.size()).toBe(0);
    });

    it("should create cache with custom max size", () => {
      const customCache = new SimpleCache<string>(5);
      expect(customCache.size()).toBe(0);
    });
  });

  describe("set and get", () => {
    it("should store and retrieve data", () => {
      cache.set("key1", "value1", 1000);
      expect(cache.get("key1")).toBe("value1");
    });

    it("should return null for non-existent key", () => {
      expect(cache.get("nonexistent")).toBeNull();
    });

    it("should store multiple values", () => {
      cache.set("key1", "value1", 1000);
      cache.set("key2", "value2", 1000);
      cache.set("key3", "value3", 1000);

      expect(cache.get("key1")).toBe("value1");
      expect(cache.get("key2")).toBe("value2");
      expect(cache.get("key3")).toBe("value3");
      expect(cache.size()).toBe(3);
    });
  });

  describe("TTL (Time To Live)", () => {
    it("should return data before expiration", () => {
      cache.set("key1", "value1", 1000); // 1 second TTL

      // Advance time by 500ms (within TTL)
      vi.advanceTimersByTime(500);

      expect(cache.get("key1")).toBe("value1");
    });

    it("should return null after expiration", () => {
      cache.set("key1", "value1", 1000); // 1 second TTL

      // Advance time by 1500ms (past TTL)
      vi.advanceTimersByTime(1500);

      expect(cache.get("key1")).toBeNull();
    });

    it("should remove expired entry from cache when accessed", () => {
      cache.set("key1", "value1", 1000);
      expect(cache.size()).toBe(1);

      // Advance time past TTL
      vi.advanceTimersByTime(1500);

      // Access expired entry
      cache.get("key1");

      expect(cache.size()).toBe(0);
    });

    it("should handle different TTL values correctly", () => {
      cache.set("short", "value1", 500); // 0.5 second
      cache.set("long", "value2", 2000); // 2 seconds

      // After 1 second, short should expire but long should remain
      vi.advanceTimersByTime(1000);

      expect(cache.get("short")).toBeNull();
      expect(cache.get("long")).toBe("value2");
    });
  });

  describe("max size and eviction", () => {
    it("should not exceed max size", () => {
      // Cache max size is 3
      cache.set("key1", "value1", 1000);
      cache.set("key2", "value2", 1000);
      cache.set("key3", "value3", 1000);
      cache.set("key4", "value4", 1000); // Should trigger eviction

      expect(cache.size()).toBe(3);
    });

    it("should evict oldest entry when max size exceeded", () => {
      // Cache max size is 3
      cache.set("key1", "value1", 1000);
      cache.set("key2", "value2", 1000);
      cache.set("key3", "value3", 1000);
      cache.set("key4", "value4", 1000); // Should evict key1

      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBe("value2");
      expect(cache.get("key3")).toBe("value3");
      expect(cache.get("key4")).toBe("value4");
    });

    it("should cleanup expired entries before evicting when at max size", () => {
      // Fill cache to max size
      cache.set("key1", "value1", 500); // Short TTL
      cache.set("key2", "value2", 1000);
      cache.set("key3", "value3", 1000);

      expect(cache.size()).toBe(3);

      // Advance time to expire key1
      vi.advanceTimersByTime(600);

      // Add new entry - should cleanup expired entry instead of evicting
      cache.set("key4", "value4", 1000);

      expect(cache.size()).toBe(3);
      expect(cache.get("key1")).toBeNull(); // Expired
      expect(cache.get("key2")).toBe("value2");
      expect(cache.get("key3")).toBe("value3");
      expect(cache.get("key4")).toBe("value4");
    });
  });

  describe("clear", () => {
    it("should clear all entries", () => {
      cache.set("key1", "value1", 1000);
      cache.set("key2", "value2", 1000);
      cache.set("key3", "value3", 1000);

      expect(cache.size()).toBe(3);

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBeNull();
      expect(cache.get("key3")).toBeNull();
    });

    it("should work on empty cache", () => {
      expect(cache.size()).toBe(0);
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe("size", () => {
    it("should return correct size", () => {
      expect(cache.size()).toBe(0);

      cache.set("key1", "value1", 1000);
      expect(cache.size()).toBe(1);

      cache.set("key2", "value2", 1000);
      expect(cache.size()).toBe(2);

      cache.set("key3", "value3", 1000);
      expect(cache.size()).toBe(3);
    });

    it("should reflect size changes after expiration cleanup", () => {
      cache.set("key1", "value1", 500);
      cache.set("key2", "value2", 1000);

      expect(cache.size()).toBe(2);

      // Advance time to expire key1
      vi.advanceTimersByTime(600);

      // Trigger cleanup by accessing expired entry
      cache.get("key1");

      expect(cache.size()).toBe(1);
    });
  });

  describe("data types", () => {
    it("should work with different data types", () => {
      const numberCache = new SimpleCache<number>();
      const objectCache = new SimpleCache<{ id: number; name: string }>();
      const arrayCache = new SimpleCache<string[]>();

      numberCache.set("num", 42, 1000);
      expect(numberCache.get("num")).toBe(42);

      const testObj = { id: 1, name: "test" };
      objectCache.set("obj", testObj, 1000);
      expect(objectCache.get("obj")).toEqual(testObj);

      const testArray = ["a", "b", "c"];
      arrayCache.set("arr", testArray, 1000);
      expect(arrayCache.get("arr")).toEqual(testArray);
    });
  });

  describe("edge cases", () => {
    it("should handle zero TTL", () => {
      cache.set("key1", "value1", 0);
      expect(cache.get("key1")).toBeNull();
    });

    it("should handle very large TTL", () => {
      cache.set("key1", "value1", Number.MAX_SAFE_INTEGER);
      expect(cache.get("key1")).toBe("value1");
    });

    it("should handle overwriting existing key", () => {
      cache.set("key1", "value1", 1000);
      cache.set("key1", "value2", 1000);

      expect(cache.get("key1")).toBe("value2");
      expect(cache.size()).toBe(1);
    });

    it("should handle max size of 1", () => {
      const smallCache = new SimpleCache<string>(1);

      smallCache.set("key1", "value1", 1000);
      expect(smallCache.size()).toBe(1);

      smallCache.set("key2", "value2", 1000);
      expect(smallCache.size()).toBe(1);
      expect(smallCache.get("key1")).toBeNull();
      expect(smallCache.get("key2")).toBe("value2");
    });

    it("should handle empty string keys and values", () => {
      cache.set("", "", 1000);
      expect(cache.get("")).toBe("");
    });
  });
});
