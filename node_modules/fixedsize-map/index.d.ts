declare class FixedSizeMap<K, V> {
    private map;
    private keys;
    private currIndex;
    /**
     * The max number of keys this cache can hold
     * @param {number} size
     */
    constructor(size: number);
    /**
     * Adds a key and pairs it with a value
     * If this is already at maximum occupation, this will remove the oldest element.
     */
    add(key: K, value: V): void;
    /**
     * Checks if this cache contains a key
     */
    contains(key: K): boolean;
    /**
     * Retrieves a value from this cache corresponding to the specified key
     */
    get(key: K): V | undefined;
    /**
     * Removed the key value entry from this cache corresponding to the specified key
     */
    remove(key: K): void;
    /**
     * Clears this cache
     */
    clear(): void;
}

export = FixedSizeMap;
