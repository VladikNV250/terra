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
            const terrainData = self.generate({ ...config, ...metadata });
            const pixels = convertTerrainDataToRGBA(terrainData, config);
            sendMessage(
                {
                    type: WorkerMessageType.PIXELS,
                    payload: {
                        pixels: pixels,
                        startY: metadata.startY,
                        endY: metadata.endY,
                        id: metadata.id,
                    },
                },
                [pixels.buffer],
            );
            return;
        }
    }
};
