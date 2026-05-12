import { useEffect, useRef, useState } from "react";
import type { TerrainConfig } from "../types/terrain";
import {
    WorkerMessageType,
    type ConfigWorkerMessage,
    type PixelsWorkerMessage,
    type ReadyWorkerMessage,
} from "../types/worker";
import { Flex } from "@radix-ui/themes";

interface Props {
    terrainConfig: TerrainConfig;
}

export const Map = ({ terrainConfig }: Props) => {
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    const mapWorkersRef = useRef<Worker[]>([]);

    const [readyWorkersCount, setReadyWorkersCount] = useState(0);

    useEffect(() => {
        const workers = [];
        const numOfWorkers = navigator.hardwareConcurrency;
        for (let i = 0; i < numOfWorkers; i++) {
            workers.push(
                new Worker(new URL("../worker/worker.ts", import.meta.url), {
                    type: "classic",
                }),
            );
        }
        mapWorkersRef.current = workers;

        mapWorkersRef.current.forEach(
            (worker) =>
                (worker.onmessage = (
                    e: MessageEvent<PixelsWorkerMessage | ReadyWorkerMessage>,
                ) => {
                    const { type, payload } = e.data;

                    switch (type) {
                        case WorkerMessageType.READY: {
                            setReadyWorkersCount((prev) => prev + 1);
                            return;
                        }
                        case WorkerMessageType.PIXELS: {
                            const chunkHeight = payload.endY - payload.startY;
                            const clampedImageData = new Uint8ClampedArray(
                                payload.pixels,
                            );
                            const imageData = new ImageData(
                                clampedImageData,
                                terrainConfig.width,
                                chunkHeight,
                            );

                            if (canvasRef.current) {
                                const ctx = canvasRef.current.getContext("2d");
                                ctx?.putImageData(imageData, 0, payload.startY);
                            }
                            return;
                        }
                    }
                }),
        );

        return () => {
            mapWorkersRef.current.forEach((worker) => worker.terminate());
            mapWorkersRef.current = [];
            setReadyWorkersCount(0)
        };
    }, [terrainConfig.width, terrainConfig.height]);

    useEffect(() => {
        const numOfWorkers = mapWorkersRef.current.length;
        if (numOfWorkers === 0 || readyWorkersCount !== numOfWorkers) return;

        const totalHeight = terrainConfig.height;
        const chunkHeight = Math.floor(totalHeight / numOfWorkers);

        mapWorkersRef.current.forEach((worker, i) => {
            const startY = chunkHeight * i;
            const endY =
                i === numOfWorkers - 1 ? totalHeight : startY + chunkHeight;

            worker.postMessage({
                type: WorkerMessageType.CONFIG,
                payload: { ...terrainConfig, startY, endY },
            } as ConfigWorkerMessage);
        });
    }, [terrainConfig, readyWorkersCount]);

    return (
        <Flex justify="center" align="center" height="100%" overflow="hidden" className="aspect-square">
            <canvas
                className="max-w-full max-h-full object-contain "
                ref={canvasRef}
                width={terrainConfig.width}
                height={terrainConfig.height}
            />
        </Flex>
    );
};
