import mitt from "mitt";
import type { ChunkMetadata, TerrainConfig } from "../../types/terrain";
import { WorkerMessageType, type WorkerOutputMessage } from "../../types/worker";
import type { TerrainWorker } from "../../worker/worker";

export interface ChunkRequest {
    x: number;
    y: number;
}

export interface ChunkResult {
    x: number;
    y: number;
    pixels: Uint8ClampedArray;
    id: number;
}

type Events = {
    ready: void;
    chunkDone: ChunkResult;
    error: Error;
};

export class TerrainWorkerPool {
    private readonly NUM_OF_WORKERS = navigator.hardwareConcurrency || 4;
    private workers: TerrainWorker[] = [];
    private idleWorkers: TerrainWorker[] = [];
    private chunksQueue: ChunkRequest[] = [];
    private currentConfig: TerrainConfig | null = null;
    private currentMetadataTemplate: Omit<ChunkMetadata, "x" | "y"> | null =
        null;
    private readyWorkers = 0;

    public events = mitt<Events>();

    init(module: WebAssembly.Module) {
        for (let i = 0; i < this.NUM_OF_WORKERS; i++) {
            const worker = new Worker(
                new URL("../../worker/worker.ts", import.meta.url),
                { type: "module" },
            ) as TerrainWorker;

            worker.onmessage = (e) => this.handleWorkerMessage(worker, e);
            worker.onerror = (e) => {
                this.events.emit("error", new Error(`Worker error: ${e.message || 'Failed to load worker script'}`));
            };

            worker.postMessage({
                type: WorkerMessageType.INIT,
                payload: { module },
            });

            this.workers.push(worker);
            this.idleWorkers.push(worker);
        }
    }

    destroy() {
        this.workers.forEach((w) => w.terminate());
        this.workers = [];
        this.idleWorkers = [];
        this.chunksQueue = [];
        this.events.all.clear();
    }

    clearQueue() {
        this.chunksQueue = [];
    }

    enqueue(
        chunk: ChunkRequest,
        config: TerrainConfig,
        metadataTemplate: Omit<ChunkMetadata, "x" | "y">,
    ) {
        this.currentConfig = config;
        this.currentMetadataTemplate = metadataTemplate;
        this.chunksQueue.push(chunk);
        this.processQueue();
    }

    isIdle() {
        return (
            this.chunksQueue.length === 0 &&
            this.idleWorkers.length === this.NUM_OF_WORKERS
        );
    }

    private processQueue() {
        if (!this.currentConfig || !this.currentMetadataTemplate) return;

        while (this.chunksQueue.length > 0 && this.idleWorkers.length > 0) {
            const worker = this.idleWorkers.pop()!;
            const chunkRequest = this.chunksQueue.shift()!;

            worker.postMessage({
                type: WorkerMessageType.CONFIG,
                payload: {
                    config: this.currentConfig,
                    metadata: {
                        ...this.currentMetadataTemplate,
                        x: chunkRequest.x,
                        y: chunkRequest.y,
                    },
                },
            });
        }
    }

    private handleWorkerMessage(
        worker: TerrainWorker,
        e: MessageEvent<WorkerOutputMessage>,
    ) {
        const message = e.data;

        if (message.type === WorkerMessageType.READY) {
            this.readyWorkers++;
            if (this.readyWorkers === this.NUM_OF_WORKERS) {
                this.events.emit("ready");
            }
            return;
        }

        if (message.type === WorkerMessageType.PIXELS) {
            const { pixels, id, x, y } = message.payload;

            this.idleWorkers.push(worker);

            this.events.emit("chunkDone", { pixels, id, x, y });

            this.processQueue();
        }
    }
}
