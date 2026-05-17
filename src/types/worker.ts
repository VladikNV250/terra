import type { TerrainConfig } from "./terrain";

export const WorkerMessageType = {
    READY: "READY",
    PIXELS: "PIXELS",
    CONFIG: "CONFIG",
    INIT: "INIT",
} as const;

export type WorkerMessageType =
    (typeof WorkerMessageType)[keyof typeof WorkerMessageType];

export interface WorkerMessage<T extends WorkerMessageType, D = unknown> {
    type: T;
    payload: D;
}

export type ReadyWorkerMessage = WorkerMessage<typeof WorkerMessageType.READY>;
export type PixelsWorkerMessage = WorkerMessage<
    typeof WorkerMessageType.PIXELS,
    { pixels: Uint8ClampedArray; startY: number; endY: number; id: number }
>;
export type ConfigWorkerMessage = WorkerMessage<
    typeof WorkerMessageType.CONFIG,
    TerrainConfig & {
        startY: number;
        endY: number;
        offsetX: number;
        offsetY: number;
        id: number;
    }
>;
export type InitWorkerMessage = WorkerMessage<
    typeof WorkerMessageType.INIT,
    { module: WebAssembly.Module }
>;
