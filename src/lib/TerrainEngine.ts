import { CHUNK_SIZE } from "../config/terrain";
import type { Vector2D } from "../types/math";
import type { TerrainConfig } from "../types/terrain";
import { TerrainWorkerPool, type ChunkResult } from "./TerrainWorkerPool";

interface GenerateOptions {
    config: TerrainConfig;
    cameraOffset: Vector2D;
    canvas: HTMLCanvasElement | null;
}

export class TerrainEngine {
    private pool: TerrainWorkerPool;
    private requestId = 0;
    private targetCanvas: HTMLCanvasElement | null = null;
    private resolveRender?: () => void;

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

    destroy(onDone?: () => void): void {
        this.pool.destroy();
        onDone?.();
    }

    generate(options: GenerateOptions): Promise<void> {
        const { cameraOffset, canvas, config } = options;
        this.requestId++;

        this.pool.clearQueue();
        this.targetCanvas = canvas;
        const ctx = canvas?.getContext("2d");

        for (let y = 0; y < Math.ceil(config.height / CHUNK_SIZE); y++) {
            for (let x = 0; x < Math.ceil(config.width / CHUNK_SIZE); x++) {
                if (ctx) {
                    ctx.clearRect(x * CHUNK_SIZE, y * CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE);
                    ctx.fillStyle = "rgba(100, 100, 200, 0.1)";
                    ctx.fillRect(x * CHUNK_SIZE, y * CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE);
                    ctx.strokeStyle = "rgba(100, 100, 100, 0.2)";
                    ctx.strokeRect(x * CHUNK_SIZE, y * CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE);
                }

                this.pool.enqueue({ x, y }, config, {
                    id: this.requestId,
                    offsetX: cameraOffset.x,
                    offsetY: cameraOffset.y,
                });
            }
        }

        return new Promise((resolve) => {
            this.resolveRender = resolve;

            if (this.pool.isIdle()) {
                this.resolveRender();
            }
        });
    }

    private onChunkDone(result: ChunkResult) {
        const { pixels, id, x, y } = result;

        if (id !== this.requestId) return;

        const imageData = new ImageData(
            new Uint8ClampedArray(pixels),
            CHUNK_SIZE,
            CHUNK_SIZE,
        );

        this.targetCanvas
            ?.getContext("2d")
            ?.putImageData(imageData, x * CHUNK_SIZE, y * CHUNK_SIZE);

        if (this.pool.isIdle()) {
            this.resolveRender?.();
        }
    }
}

