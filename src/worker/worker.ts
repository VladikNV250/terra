import { CHUNK_SIZE } from "../config/terrain.js";
import { convertTerrainDataToRGBA } from "../lib";
import {
    WorkerMessageType,
    type WorkerInputMessage,
    type WorkerOutputMessage,
} from "../types/worker.js";

import "./wasm_exec.js";

export interface TerrainWorker extends Omit<
    Worker,
    "postMessage" | "onmessage"
> {
    postMessage(message: WorkerInputMessage, transfer?: Transferable[]): void;
    onmessage:
        | ((this: Worker, e: MessageEvent<WorkerOutputMessage>) => void)
        | null;
}

const sendMessage = (
    message: WorkerOutputMessage,
    transfer?: Transferable[],
) => {
    if (transfer) {
        self.postMessage(message, { transfer });
    } else {
        self.postMessage(message);
    }
};

const go = new Go();

self.onmessage = async (
    e: MessageEvent<WorkerInputMessage>,
) => {
    const message = e.data;

    switch (message.type) {
        case WorkerMessageType.INIT: {
            const { module } = message.payload;
            const instance = await WebAssembly.instantiate(
                module,
                go.importObject,
            );
            go.run(instance);
            sendMessage({ type: WorkerMessageType.READY });
            return;
        }
        case WorkerMessageType.CONFIG: {
            const { config, metadata } = message.payload;

            const startX = metadata.x * CHUNK_SIZE;
            const startY = metadata.y * CHUNK_SIZE;
            const endX = startX + CHUNK_SIZE;
            const endY = startY + CHUNK_SIZE;

            const terrainData = self.generate({
                ...config,
                ...metadata,
                startX,
                startY,
                endX,
                endY,
            });
            const pixels = convertTerrainDataToRGBA(terrainData, config);
            sendMessage(
                {
                    type: WorkerMessageType.PIXELS,
                    payload: {
                        pixels: pixels,
                        x: metadata.x,
                        y: metadata.y,
                        id: metadata.id,
                    },
                },
                [pixels.buffer],
            );
            return;
        }
    }
};
