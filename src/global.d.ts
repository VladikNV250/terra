declare class Go {
    importObject: WebAssembly.Imports;
    run(instance: WebAssembly.Instance): Promise<void>;
}

interface TerrainConfigGo {
    seed: number;
    width: number;
    height: number;
    scale: number;
    octave: number;
    persistence: number;
    contrast: number;
    seaLevel: number;
    offsetX: number;
    offsetY: number;
    startY: number;
    endY: number;
}

type Generate = (config: TerrainConfigGo) => Uint8Array;

interface Window {
    generate: Generate;
}

declare const self: DedicatedWorkerGlobalScope & {
    generate: Generate;
};
