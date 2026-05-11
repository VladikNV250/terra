declare class Go {
    importObject: WebAssembly.Imports;
    run(instance: WebAssembly.Instance): Promise<void>;
}

interface Window {
        generate: (seed?: number) => Uint8Array;
    }