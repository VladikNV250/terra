import { useEffect, useRef, useState, type RefObject } from "react";
import type { TerrainConfig } from "../types/terrain";
import {
    WorkerMessageType,
    type ConfigWorkerMessage,
    type PixelsWorkerMessage,
    type ReadyWorkerMessage,
    type InitWorkerMessage,
} from "../types/worker";

export const useMapWorkers = (
    terrainConfig: TerrainConfig,
    cameraOffset: { x: number; y: number },
    canvasRef: RefObject<HTMLCanvasElement | null>,
    requestId: number,
    onDragComplete?: () => void,
) => {
    const mapWorkersRef = useRef<Worker[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const readyCountRef = useRef(0);
    const bufferCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const chunksReadyRef = useRef(0)

    useEffect(() => {
        if (!bufferCanvasRef.current) {
            bufferCanvasRef.current = document.createElement("canvas");
        }

        bufferCanvasRef.current.width = terrainConfig.width;
        bufferCanvasRef.current.height = terrainConfig.height;
    }, [terrainConfig.width, terrainConfig.height])

    useEffect(() => {
        const initializeWorkers = async () => {
            try {
                const response = await fetch("/main.wasm");
                const module = await WebAssembly.compileStreaming(response);

                const workers: Worker[] = [];
                const numOfWorkers = navigator.hardwareConcurrency || 4;

                for (let i = 0; i < numOfWorkers; i++) {
                    const worker = new Worker(
                        new URL("../worker/worker.ts", import.meta.url),
                        { type: "module" },
                    );

                    worker.onmessage = (e: MessageEvent<ReadyWorkerMessage>) => {
                        if (e.data.type === WorkerMessageType.READY) {
                            readyCountRef.current++;
                            if (readyCountRef.current === numOfWorkers) {
                                setIsInitialized(true);
                            }
                        }
                    };

                    worker.postMessage({
                        type: WorkerMessageType.INIT,
                        payload: { module },
                    } as InitWorkerMessage);

                    workers.push(worker);
                }
                mapWorkersRef.current = workers;
            } catch (error) {
                console.error("Failed to initialize workers:", error);
            }
        };

        initializeWorkers();

        return () => {
            mapWorkersRef.current.forEach((worker) => worker.terminate());
            mapWorkersRef.current = [];
            readyCountRef.current = 0;
            setIsInitialized(false);
        };
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        mapWorkersRef.current.forEach((worker) => {
            worker.onmessage = (
                e: MessageEvent<PixelsWorkerMessage>,
            ) => {
                const { type, payload } = e.data;
                
                if (type === WorkerMessageType.PIXELS) {
                    if (payload.id !== requestId) return;
                    
                    const chunkHeight = payload.endY - payload.startY;
                    const imageData = new ImageData(
                        new Uint8ClampedArray(payload.pixels),
                        terrainConfig.width,
                        chunkHeight,
                    );

                    bufferCanvasRef.current.getContext("2d")?.putImageData(imageData, 0, payload.startY);
                    chunksReadyRef.current++;

                    if (canvasRef.current && chunksReadyRef.current === mapWorkersRef.current.length) {
                        const ctx = canvasRef.current.getContext("2d");
                        ctx?.drawImage(bufferCanvasRef.current, 0, 0);
                        chunksReadyRef.current = 0;
                        onDragComplete?.()
                    }
                }
            };
        });
    }, [isInitialized, terrainConfig.width, canvasRef, requestId, onDragComplete]);

    useEffect(() => {
        if (!isInitialized) return;

        const numOfWorkers = mapWorkersRef.current.length;
        const totalHeight = terrainConfig.height;
        const chunkHeight = Math.floor(totalHeight / numOfWorkers);

        chunksReadyRef.current = 0
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
                    id: requestId,
                },
            } as ConfigWorkerMessage);
        });
    }, [isInitialized, terrainConfig, cameraOffset, requestId]);
};
