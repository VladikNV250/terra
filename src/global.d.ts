/// <reference lib="webworker" />

declare class Go {
    importObject: WebAssembly.Imports;
    run(instance: WebAssembly.Instance): Promise<void>;
}

type Generate = (
    seed?: number,
    scale?: number,
    octave?: number,
    persistence?: number,
    amplitude?: number,
    seaLevel?: number,
    width?: number,
    height?: number,
    startY?: number,
    endY?: number,
) => Uint8Array;

interface Window {
    generate: Generate;
}

declare const self: DedicatedWorkerGlobalScope & {
    generate: Generate;
};
