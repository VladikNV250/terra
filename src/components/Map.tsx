import { useEffect, useRef } from "react";

interface Props {
    seed: number;
}

export const Map = ({ seed }: Props) => {
    const canvasRef = useRef<null | HTMLCanvasElement>(null);

    useEffect(() => {
        const go = new Go();

        WebAssembly.instantiateStreaming(
            fetch("main.wasm"),
            go.importObject,
        ).then((result) => {
            go.run(result.instance);

            const pixels = window.generate(seed);

            const clampedImageData = new Uint8ClampedArray(pixels);
            const imageData = new ImageData(clampedImageData, 512, 512);

            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d");
                ctx?.putImageData(imageData, 0, 0);
            }
        });
    }, [seed]);

    return <canvas ref={canvasRef} width={512} height={512} />;
};
