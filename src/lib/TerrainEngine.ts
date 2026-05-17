import type { Vector2D } from "../types/math";
import type { TerrainConfig } from "../types/terrain";
import { WorkerMessageType, type WorkerOutputMessage } from "../types/worker";
import type { TerrainWorker } from "../worker/worker";

interface GenerateOptions {
    config: TerrainConfig;
    cameraOffset: Vector2D;
    canvas: HTMLCanvasElement | null;
}

export class TerrainEngine {
    private readonly NUM_OF_WORKERS = navigator.hardwareConcurrency || 4;

    private readyWorkers = 0;
    private workers: TerrainWorker[] = [];
    private bufferCanvas: HTMLCanvasElement = document.createElement("canvas");
    private chunksReady = 0;
    private requestId = 0;

    private targetCanvas: HTMLCanvasElement | null = null;
    private targetWidth: number = 0;
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

                worker.onmessage = this.handleWorkerMessage;

                worker.postMessage({
                    type: WorkerMessageType.INIT,
                    payload: { module },
                });

                this.workers.push(worker);
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

        this.targetCanvas = canvas;
        this.targetWidth = config.width;

        const totalHeight = config.height;
        const chunkHeight = Math.floor(totalHeight / this.NUM_OF_WORKERS);

        this.chunksReady = 0;
        const isLastChunk = (i: number) => i === this.NUM_OF_WORKERS - 1;
        this.workers.forEach((worker, i) => {
            const startY = chunkHeight * i;
            const endY = isLastChunk(i) ? totalHeight : startY + chunkHeight;

            worker.postMessage({
                type: WorkerMessageType.CONFIG,
                payload: {
                    config: config,
                    metadata: {
                        id: this.requestId,
                        offsetX: cameraOffset.x,
                        offsetY: cameraOffset.y,
                        startY,
                        endY,
                    },
                },
            });
        });

        return new Promise((resolve) => {
            this.resolveRender = resolve;
        });
    }

    private handleWorkerMessage(e: MessageEvent<WorkerOutputMessage>) {
        const message = e.data;

        if (message.type === WorkerMessageType.READY) {
            this.readyWorkers++;
            if (this.readyWorkers === this.NUM_OF_WORKERS) {
                this.onEngineReady?.();
            }
            return;
        }

        if (message.type === WorkerMessageType.PIXELS) {
            const { pixels, id, startY, endY } = message.payload;
            if (id !== this.requestId) return;

            const chunkHeight = endY - startY;
            const imageData = new ImageData(
                new Uint8ClampedArray(pixels),
                this.targetWidth,
                chunkHeight,
            );

            this.bufferCanvas
                .getContext("2d")
                ?.putImageData(imageData, 0, startY);
            this.chunksReady++;

            if (this.targetCanvas && this.chunksReady === this.NUM_OF_WORKERS) {
                const ctx = this.targetCanvas.getContext("2d");
                ctx?.drawImage(this.bufferCanvas, 0, 0);
                this.chunksReady = 0;
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
}
