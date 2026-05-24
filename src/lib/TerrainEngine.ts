import { CHUNK_SIZE } from "../config/terrain";
import type { Vector2D } from "../types/math";
import type { TerrainConfig } from "../types/terrain";
import { TerrainWorkerPool, type ChunkResult } from "./TerrainWorkerPool";
import { isEqual } from "lodash";

interface GenerateOptions {
    config: TerrainConfig;
    canvas: HTMLCanvasElement | null;
}

export class TerrainEngine {
    private pool: TerrainWorkerPool;
    private requestId = 0;
    private targetCanvas: HTMLCanvasElement | null = null;
    private resolveRender?: () => void;
    private cameraOffset: Vector2D = { x: 0, y: 0 };
    private chunkCache: Map<string, ImageBitmap> = new Map();
    private renderingChunks: Set<string> = new Set();
    private currentConfig: TerrainConfig | null = null;
    private isRenderPending = false;

    constructor() {
        this.pool = new TerrainWorkerPool();
        this.onChunkDone = this.onChunkDone.bind(this);
        this.pool.events.on("chunkDone", this.onChunkDone);
    }

    async init(onReady?: () => void): Promise<void> {
        if (onReady) {
            this.pool.events.on("ready", onReady);
        }
        try {
            const response = await fetch("/main.wasm");
            const module = await WebAssembly.compileStreaming(response);
            this.pool.init(module);
        } catch (error) {
            console.error("Failed to initialize workers:", error);
        }
    }

    setCamera(offset: Vector2D) {
        this.cameraOffset = offset;
    }

    destroy(onDone?: () => void): void {
        this.pool.destroy();
        onDone?.();
    }

    render(options: GenerateOptions): Promise<void> {
        const { canvas, config } = options;
        if (!canvas) return Promise.resolve();

        this.targetCanvas = canvas;
        const ctx = canvas.getContext("2d");

        if (!isEqual(this.currentConfig, config)) {
            this.currentConfig = config;
            this.requestId++;
            this.pool.clearQueue();
            this.chunkCache.clear();
            this.renderingChunks.clear();
        }

        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        const startChunkX = Math.floor(this.cameraOffset.x / CHUNK_SIZE);
        const startChunkY = Math.floor(this.cameraOffset.y / CHUNK_SIZE);
        const endChunkX = Math.ceil(
            (canvas.width + this.cameraOffset.x) / CHUNK_SIZE,
        );
        const endChunkY = Math.ceil(
            (canvas.height + this.cameraOffset.y) / CHUNK_SIZE,
        );

        for (let y = startChunkY; y < endChunkY; y++) {
            for (let x = startChunkX; x < endChunkX; x++) {
                const chunkKey = `${x}-${y}`;
                const drawX = Math.floor(x * CHUNK_SIZE - this.cameraOffset.x);
                const drawY = Math.floor(y * CHUNK_SIZE - this.cameraOffset.y);

                if (this.chunkCache.has(chunkKey)) {
                    const bitmap = this.chunkCache.get(chunkKey)!;
                    ctx?.drawImage(bitmap, drawX, drawY);
                    continue;
                }

                if (ctx) {
                    ctx.fillStyle = "rgba(100, 100, 200, 0.1)";
                    ctx.fillRect(drawX, drawY, CHUNK_SIZE, CHUNK_SIZE);
                    ctx.strokeStyle = "rgba(100, 100, 100, 0.2)";
                    ctx.strokeRect(drawX, drawY, CHUNK_SIZE, CHUNK_SIZE);
                }

                if (!this.renderingChunks.has(chunkKey)) {
                    this.renderingChunks.add(chunkKey);
                    this.pool.enqueue({ x, y }, config, {
                        id: this.requestId,
                        offsetX: 0,
                        offsetY: 0,
                    });
                }
            }
        }

        return new Promise((resolve) => {
            this.resolveRender = resolve;

            if (this.pool.isIdle()) {
                this.resolveRender();
            }
        });
    }

    private requestRender() {
        if (this.isRenderPending) return;

        this.isRenderPending = true;
        requestAnimationFrame(() => {
            this.isRenderPending = false;

            if (this.targetCanvas && this.currentConfig) {
                this.render({
                    config: this.currentConfig,
                    canvas: this.targetCanvas,
                });
            }
        });
    }

    private async onChunkDone(result: ChunkResult) {
        const { pixels, id, x, y } = result;
        const chunkKey = `${x}-${y}`;
        const bitmap = await createImageBitmap(
            new ImageData(
                new Uint8ClampedArray(pixels),
                CHUNK_SIZE,
                CHUNK_SIZE,
            ),
        );

        this.chunkCache.set(chunkKey, bitmap);
        this.renderingChunks.delete(chunkKey);

        if (id !== this.requestId) return;

        this.requestRender();

        if (this.pool.isIdle()) {
            this.resolveRender?.();
        }
    }
}
