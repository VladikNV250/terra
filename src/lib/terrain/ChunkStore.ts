export class ChunkStore {
    private cache: Map<string, ImageBitmap> = new Map();
    private rendering: Set<string> = new Set();
    private maxCacheSize: number;

    constructor(maxCacheSize = 300) {
        this.maxCacheSize = maxCacheSize;
    }

    public has(key: string): boolean {
        return this.cache.has(key);
    }

    public get(key: string): ImageBitmap | undefined {
        const bitmap = this.cache.get(key);
        if (bitmap !== undefined) {
            this.cache.delete(key);
            this.cache.set(key, bitmap);
        }
        return bitmap;
    }

    public set(key: string, bitmap: ImageBitmap): void {
        this.cache.set(key, bitmap);
        this.rendering.delete(key);
        this.runGarbageCollection();
    }

    public isRendering(key: string): boolean {
        return this.rendering.has(key);
    }

    public markRendering(key: string): void {
        this.rendering.add(key);
    }

    public clear(): void {
        for (const bitmap of this.cache.values()) {
            bitmap.close();
        }
        this.cache.clear();
        this.rendering.clear();
    }

    private runGarbageCollection() {
        if (this.cache.size > this.maxCacheSize) {
            const targetSize = Math.floor(this.maxCacheSize * 0.9);
            const keysToRemove = this.cache.size - targetSize;
            const keysIterator = this.cache.keys();

            for (let i = 0; i < keysToRemove; i++) {
                const oldestKey = keysIterator.next().value;
                if (oldestKey !== undefined) {
                    const bitmap = this.cache.get(oldestKey);
                    bitmap?.close(); 
                    this.cache.delete(oldestKey);
                }
            }
        }
    }
}
