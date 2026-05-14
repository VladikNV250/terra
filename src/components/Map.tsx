import { useEffect, useRef, useState, type PointerEvent } from "react";
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

    const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
        if (e.buttons !== 1) {
            handlePointerUp(e);
            return;
        }

        const distanceX = e.clientX - dragStart.x;
        const distanceY = e.clientY - dragStart.y;

        setDragOffset({ x: distanceX, y: distanceY });
    };

    const handlePointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        if (dragOffset.x === 0 && dragOffset.y === 0) {
            return;
        }

        setCameraOffset((prev) => ({
            x: prev.x - dragOffset.x,
            y: prev.y - dragOffset.y,
        }));

        setDragOffset({ x: 0, y: 0 });
    };

    useEffect(() => {
        const workers = [];
        const numOfWorkers = navigator.hardwareConcurrency;
        for (let i = 0; i < numOfWorkers; i++) {
            workers.push(
                new Worker(new URL("../worker/worker.ts", import.meta.url), {
                    type: "module",
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
                            const imageData = new ImageData(
                                new Uint8ClampedArray(payload.pixels),
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
            setReadyWorkersCount(0);
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
                payload: {
                    ...terrainConfig,
                    offsetX: cameraOffset.x,
                    offsetY: cameraOffset.y,
                    startY,
                    endY,
                },
            } as ConfigWorkerMessage);
        });
    }, [terrainConfig, cameraOffset, readyWorkersCount]);

    return (
        <Flex
            justify="center"
            align="center"
            height="100%"
            overflow="hidden"
            className="aspect-square cursor-grab active:cursor-grabbing"
        >
            <canvas
                style={{
                    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                }}
                className="max-w-full max-h-full object-contain"
                ref={canvasRef}
                width={terrainConfig.width}
                height={terrainConfig.height}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            />
        </Flex>
    );
};
