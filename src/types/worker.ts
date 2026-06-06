import type { ChunkMetadata, TerrainConfig } from "./terrain";

export const WorkerMessageType = {
    READY: "READY",
    PIXELS: "PIXELS",
    CONFIG: "CONFIG",
    INIT: "INIT",
} as const;

export type WorkerMessageType =
    (typeof WorkerMessageType)[keyof typeof WorkerMessageType];

export type WorkerMessage<
    T extends WorkerMessageType,
    D = void,
> = D extends void
    ? {
          type: T;
      }
    : {
          type: T;
          payload: D;
      };

export type ReadyWorkerMessage = WorkerMessage<typeof WorkerMessageType.READY>;

export type PixelsPayload = Omit<ChunkMetadata, "offsetX" | "offsetY"> & {
    pixels: Uint8ClampedArray;
};

export type PixelsWorkerMessage = WorkerMessage<
    typeof WorkerMessageType.PIXELS,
    PixelsPayload
>;

export type ConfigWorkerMessage = WorkerMessage<
    typeof WorkerMessageType.CONFIG,
    {
        config: TerrainConfig;
        metadata: ChunkMetadata;
    }
>;

export type InitWorkerMessage = WorkerMessage<
    typeof WorkerMessageType.INIT,
    { module: WebAssembly.Module }
>;

export type WorkerInputMessage = InitWorkerMessage | ConfigWorkerMessage;
export type WorkerOutputMessage = ReadyWorkerMessage | PixelsWorkerMessage;
