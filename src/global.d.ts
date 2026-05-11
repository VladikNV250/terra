declare class Go {
    importObject: WebAssembly.Imports;
    run(instance: WebAssembly.Instance): Promise<void>;
}

interface Window {
    generate: (
        seed?: number,
        scale?: number,
        octave?: number,
        persistence?: number,
        amplitude?: number,
        seaLevel?: number,
    ) => Uint8Array;
}