import { useEffect, useRef, useState } from "react";
import type { TerrainConfig } from "../types/terrain";
import { Flex } from "@radix-ui/themes";
import { useDrag } from "../hooks/useDrag";
import { TerrainEngine } from "../lib/TerrainEngine";

interface Props {
    terrainConfig: TerrainConfig;
}

export const Map = ({ terrainConfig }: Props) => {
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    const terrainEngine = useRef<TerrainEngine | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

    const { dragOffset, resetDrag, handlers } = useDrag({
        onDragEnd: (offset) => {
            setCameraOffset((prev) => ({
                x: prev.x - offset.x,
                y: prev.y - offset.y,
            }))
        },
    })

    useEffect(() => {
        terrainEngine.current = new TerrainEngine();
        terrainEngine.current.init(() => {
            setIsInitialized(true);
        });

        return () => {
            if (terrainEngine.current) {
                terrainEngine.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (!isInitialized || !terrainEngine.current || !canvasRef.current)
            return;

        const draw = async () => {
            await terrainEngine.current?.generate({
                config: terrainConfig,
                cameraOffset,
                canvas: canvasRef.current,
            });
            
            resetDrag()
        }

        draw()
    }, [isInitialized, terrainConfig, cameraOffset, resetDrag]);

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
