import { useEffect, useRef, useState } from "react";
import type { TerrainConfig } from "../types/terrain";
import {
    WorkerMessageType,
    type ConfigWorkerMessage,
    type PixelsWorkerMessage,
    type ReadyWorkerMessage,
} from "../types/worker";

interface Props {
    terrainConfig: TerrainConfig;
}

export const Map = ({ terrainConfig }: Props) => {
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    const mapWorkerRef = useRef<Worker | null>(null);

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        mapWorkerRef.current = new Worker(
            new URL("../worker/worker.ts", import.meta.url),
            {
                type: "classic",
            },
        );

        mapWorkerRef.current.onmessage = (
            e: MessageEvent<PixelsWorkerMessage | ReadyWorkerMessage>,
        ) => {
            const { type, payload } = e.data;

            switch (type) {
                case WorkerMessageType.READY: {
                    setIsReady(true);
                    return;
                }
                case WorkerMessageType.PIXELS: {
                    const clampedImageData = new Uint8ClampedArray(payload);
                    const imageData = new ImageData(
                        clampedImageData,
                        terrainConfig.width,
                        terrainConfig.height,
                    );

                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext("2d");
                        ctx?.putImageData(imageData, 0, 0);
                    }
                    return;
                }
            }
        };

        return () => {
            mapWorkerRef.current?.terminate();
            mapWorkerRef.current = null;
        };
    }, [terrainConfig.width, terrainConfig.height]);

    useEffect(() => {
        if (!mapWorkerRef.current || !isReady) return;

        mapWorkerRef.current.postMessage({
            type: WorkerMessageType.CONFIG,
            payload: terrainConfig,
        } as ConfigWorkerMessage);
    }, [terrainConfig, isReady]);

    return (
        <canvas
            ref={canvasRef}
            width={terrainConfig.width}
            height={terrainConfig.height}
        />
    );
};
