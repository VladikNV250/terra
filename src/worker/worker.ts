self.importScripts("/wasm_exec.js");

const go = new Go();

WebAssembly.instantiateStreaming(fetch("/main.wasm"), go.importObject).then(
    (result) => {
        go.run(result.instance);
        self.onmessage = (e) => {
            const pixels = self.generate(
                e.data.payload.seed,
                e.data.payload.scale,
                e.data.payload.octave,
                e.data.payload.persistence,
                e.data.payload.amplitude,
                e.data.payload.seaLevel,
                e.data.payload.width,
                e.data.payload.height,
                e.data.payload.startY,
                e.data.payload.endY,
            );

            self.postMessage({
                type: "PIXELS",
                payload: {
                    pixels,
                    startY: e.data.payload.startY,
                    endY: e.data.payload.endY,
                },
            });
        };

        self.postMessage({ type: "READY" });
    },
);
