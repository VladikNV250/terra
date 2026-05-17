import { useRef, useState } from "react";
import type { TerrainConfig } from "../types/terrain";
import { Flex } from "@radix-ui/themes";
import { useDrag } from "../hooks/useDrag";
import { useMapWorkers } from "../hooks/useMapWorkers";

interface Props {
    terrainConfig: TerrainConfig;
}

export const Map = ({ terrainConfig }: Props) => {
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
    const [requestId, setRequestId] = useState(0);

    const { dragOffset, resetDrag, handlers } = useDrag({
        onDragEnd: (offset) => {
            setCameraOffset((prev) => ({
                x: prev.x - offset.x,
                y: prev.y - offset.y,
            }));
            setRequestId((prev) => prev + 1);
        },
    });

    useMapWorkers(terrainConfig, cameraOffset, canvasRef, requestId, resetDrag);

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
                {...handlers}
            />
        </Flex>
    );
};
