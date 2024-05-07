const assert = require("node:assert");
const Cache = require("./index");

// Test case 0: Creating a cache with an invalid size
assert.throws(() => new Cache(0), err => err.message === "Cache size must be an integer greater than 0");
assert.throws(() => new Cache(-1), err => err.message === "Cache size must be an integer greater than 0");
assert.throws(() => new Cache(1.5), err => err.message === "Cache size must be an integer greater than 0");
assert.throws(() => new Cache("1"), err => err.message === "Cache size must be an integer greater than 0");

// Test case 1: Creating a cache with size 3
const cache = new Cache(3);
assert.strictEqual(cache.contains("key1"), false);
assert.strictEqual(cache.get("key1"), undefined);

// Test case 2: Adding key-value pairs to the cache
cache.add("key1", "value1");
cache.add("key2", "value2");
cache.add("key3", "value3");
assert.strictEqual(cache.contains("key1"), true);
assert.strictEqual(cache.contains("key2"), true);
assert.strictEqual(cache.contains("key3"), true);
assert.strictEqual(cache.get("key1"), "value1");
assert.strictEqual(cache.get("key2"), "value2");
assert.strictEqual(cache.get("key3"), "value3");

// Test case 3: Adding a new key-value pair to the cache, which should remove the oldest element
cache.add("key4", "value4");
assert.strictEqual(cache.contains("key1"), false);
assert.strictEqual(cache.contains("key2"), true);
assert.strictEqual(cache.contains("key3"), true);
assert.strictEqual(cache.contains("key4"), true);
assert.strictEqual(cache.get("key1"), undefined);
assert.strictEqual(cache.get("key2"), "value2");
assert.strictEqual(cache.get("key3"), "value3");
assert.strictEqual(cache.get("key4"), "value4");

// Test case 4: Removing a key-value pair from the cache
cache.remove("key2");
assert.strictEqual(cache.contains("key2"), false);
assert.strictEqual(cache.get("key2"), undefined);

// Test case 5: Clearing the cache
cache.clear();
assert.strictEqual(cache.contains("key3"), false);
assert.strictEqual(cache.get("key3"), undefined);

console.log("All tests passed!");
