import { CHUNK_SIZE } from "../config/terrain";
import type { Vector2D } from "../types/math";
import type { TerrainConfig } from "../types/terrain";
import { WorkerMessageType, type WorkerOutputMessage } from "../types/worker";
import type { TerrainWorker } from "../worker/worker";

interface GenerateOptions {
    config: TerrainConfig;
    cameraOffset: Vector2D;
    canvas: HTMLCanvasElement | null;
}

interface ChunkRequest {
    x: number;
    y: number;
}

export class TerrainEngine {
    private readonly NUM_OF_WORKERS = navigator.hardwareConcurrency || 4;

    private readyWorkers = 0;
    private workers: TerrainWorker[] = [];
    private idleWorkers: TerrainWorker[] = [];
    private bufferCanvas: HTMLCanvasElement = document.createElement("canvas");
    private requestId = 0;
    private chunksQueue: ChunkRequest[] = [];

    private targetCanvas: HTMLCanvasElement | null = null;
    private currentConfig: TerrainConfig | null = null;
    private currentCameraOffset: Vector2D | null = null;
    private onEngineReady?: () => void;
    private resolveRender?: () => void;

    constructor() {
        this.handleWorkerMessage = this.handleWorkerMessage.bind(this);
    }

    async init(onReady?: () => void): Promise<void> {
        this.onEngineReady = onReady;
        try {
            const response = await fetch("/main.wasm");
            const module = await WebAssembly.compileStreaming(response);

            for (let i = 0; i < this.NUM_OF_WORKERS; i++) {
                const worker = new Worker(
                    new URL("../worker/worker.ts", import.meta.url),
                    { type: "module" },
                ) as TerrainWorker;

                worker.onmessage = (e) => this.handleWorkerMessage(worker, e);

                worker.postMessage({
                    type: WorkerMessageType.INIT,
                    payload: { module },
                });

                this.workers.push(worker);
                this.idleWorkers.push(worker);
            }
        } catch (error) {
            console.error("Failed to initialize workers:", error);
        }
    }

    destroy(onDone?: () => void): void {
        this.workers.forEach((worker) => worker.terminate());
        this.workers = [];
        this.readyWorkers = 0;
        onDone?.();
    }

    generate(options: GenerateOptions): Promise<void> {
        const { cameraOffset, canvas, config } = options;
        this.requestId++;
        this.resizeBuffer(config.width, config.height);
        
        this.chunksQueue = []
        this.targetCanvas = canvas;
        this.currentConfig = config;
        this.currentCameraOffset = cameraOffset;

        for (let y = 0; y < Math.ceil(config.height / CHUNK_SIZE); y++) {
            for (let x = 0; x < Math.ceil(config.width / CHUNK_SIZE); x++) {
                this.chunksQueue.push({
                    x,
                    y,
                });
            }
        }

        this.processQueue();

        return new Promise((resolve) => {
            this.resolveRender = resolve;
        });
    }

    private handleWorkerMessage(
        worker: TerrainWorker,
        e: MessageEvent<WorkerOutputMessage>,
    ) {
        const message = e.data;

        if (message.type === WorkerMessageType.READY) {
            this.readyWorkers++;
            if (this.readyWorkers === this.NUM_OF_WORKERS) {
                this.onEngineReady?.();
            }
            return;
        }

        if (message.type === WorkerMessageType.PIXELS) {
            const { pixels, id, x, y } = message.payload;
            if (id !== this.requestId) {
                this.idleWorkers.push(worker);
                return;
            }

            const imageData = new ImageData(
                new Uint8ClampedArray(pixels),
                CHUNK_SIZE,
                CHUNK_SIZE,
            );

            this.bufferCanvas
                .getContext("2d")
                ?.putImageData(imageData, x * CHUNK_SIZE, y * CHUNK_SIZE);

            this.idleWorkers.push(worker);
            this.processQueue();

            if (
                this.chunksQueue.length === 0 &&
                this.idleWorkers.length === this.NUM_OF_WORKERS
            ) {
                if (this.targetCanvas) {
                    const ctx = this.targetCanvas.getContext("2d");
                    ctx?.drawImage(this.bufferCanvas, 0, 0);
                }
                this.resolveRender?.();
            }
        }
    }

    private resizeBuffer(width: number, height: number): void {
        if (
            this.bufferCanvas.width === width &&
            this.bufferCanvas.height === height
        )
            return;

        this.bufferCanvas.width = width;
        this.bufferCanvas.height = height;
    }

    private processQueue() {
        if (!this.currentConfig || !this.currentCameraOffset) return;

        while (this.chunksQueue.length > 0 && this.idleWorkers.length > 0) {
            const worker = this.idleWorkers.pop();
            const chunkRequest = this.chunksQueue.shift();

            worker.postMessage({
                type: WorkerMessageType.CONFIG,
                payload: {
                    config: this.currentConfig,
                    metadata: {
                        id: this.requestId,
                        x: chunkRequest.x,
                        y: chunkRequest.y,
                        offsetX: this.currentCameraOffset.x,
                        offsetY: this.currentCameraOffset.y,
                    },
                },
            });
        }
    }
}
