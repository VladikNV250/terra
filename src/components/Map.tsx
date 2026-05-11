import { useEffect, useRef } from "react";
import type { TerrainConfig } from "../types/terrain";

interface Props {
    terrainConfig: TerrainConfig;
}

export const Map = ({ terrainConfig }: Props) => {
    const canvasRef = useRef<null | HTMLCanvasElement>(null);

    useEffect(() => {
        const go = new Go();

        WebAssembly.instantiateStreaming(
            fetch("main.wasm"),
            go.importObject,
        ).then((result) => {
            go.run(result.instance);

            const pixels = window.generate(
                terrainConfig.seed,
                terrainConfig.scale,
                terrainConfig.octave,
                terrainConfig.persistence,
                terrainConfig.amplitude,
                terrainConfig.seaLevel
            );

            const clampedImageData = new Uint8ClampedArray(pixels);
            const imageData = new ImageData(
                clampedImageData,
                terrainConfig.width,
                terrainConfig.height,
            );

            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d");
                ctx?.putImageData(imageData, 0, 0);
            }
        });
    }, [terrainConfig]);

    return (
        <canvas
            ref={canvasRef}
            width={terrainConfig.width}
            height={terrainConfig.height}
        />
    );
};
