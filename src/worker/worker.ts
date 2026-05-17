import { convertHeightsToRGBA } from "../lib";
import {
    WorkerMessageType,
    type ConfigWorkerMessage,
    type PixelsWorkerMessage,
    type ReadyWorkerMessage,
    type InitWorkerMessage,
} from "../types/worker.js";

import "./wasm_exec.js";

const go = new Go();

self.onmessage = async (e: MessageEvent<InitWorkerMessage | ConfigWorkerMessage>) => {
    const { type, payload } = e.data;

    if (type === WorkerMessageType.INIT) {
        const { module } = payload as InitWorkerMessage["payload"];
        const instance = await WebAssembly.instantiate(module, go.importObject);
        go.run(instance);
        self.postMessage({ type: WorkerMessageType.READY } as ReadyWorkerMessage);
        return;
    }

    if (type === WorkerMessageType.CONFIG) {
        const config = payload as ConfigWorkerMessage["payload"];
        
        // Ensure WASM is ready (though we send READY message, let's be safe)
        if (typeof self.generate !== 'function') {
            console.error('WASM generate function not ready');
            return;
        }

        const heightmap = self.generate(config);

        const pixels = convertHeightsToRGBA(
            heightmap,
            config.seaLevel,
        );

        self.postMessage({
            type: WorkerMessageType.PIXELS,
            payload: {
                pixels: pixels,
                startY: config.startY,
                endY: config.endY,
                id: config.id,
            },
        } as PixelsWorkerMessage, [pixels.buffer]);
    }
};
