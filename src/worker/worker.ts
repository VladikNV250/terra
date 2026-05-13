import { convertHeightsToRGBA } from "../lib";
import type {
    ConfigWorkerMessage,
    PixelsWorkerMessage,
    ReadyWorkerMessage,
} from "../types/worker.js";

import "./wasm_exec.js";

const go = new Go();

WebAssembly.instantiateStreaming(fetch("/main.wasm"), go.importObject).then(
    (result) => {
        go.run(result.instance);
        self.onmessage = (e: MessageEvent<ConfigWorkerMessage>) => {
            const heightmap = self.generate(
                e.data.payload.seed,
                e.data.payload.scale,
                e.data.payload.octave,
                e.data.payload.persistence,
                e.data.payload.width,
                e.data.payload.height,
                e.data.payload.startY,
                e.data.payload.endY,
            );

            const pixels = convertHeightsToRGBA(
                heightmap,
                e.data.payload.seaLevel,
            );

            self.postMessage({
                type: "PIXELS",
                payload: {
                    pixels: pixels,
                    startY: e.data.payload.startY,
                    endY: e.data.payload.endY,
                },
            } as PixelsWorkerMessage);
        };

        self.postMessage({ type: "READY" } as ReadyWorkerMessage);
    },
);
