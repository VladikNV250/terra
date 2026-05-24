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
    const { resetDrag, handlers } = useDrag({
        onDragMove: (offset) => {
            if (isInitialized && terrainEngine.current) {
                terrainEngine.current.setCamera(offset);
                terrainEngine.current.render({
                    config: terrainConfig,
                    canvas: canvasRef.current,
                });
            }
        },
    });

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

        terrainEngine.current.render({
            config: terrainConfig,
            canvas: canvasRef.current,
        });
    }, [isInitialized, terrainConfig, resetDrag]);

    return (
        <Flex
            justify="center"
            align="center"
            width="100%"
            height="100%"
            overflow="hidden"
            className="aspect-square cursor-grab active:cursor-grabbing"
        >
            <canvas
                className="max-w-full max-h-full object-contain"
                ref={canvasRef}
                width={terrainConfig.width}
                height={terrainConfig.height}
                {...handlers}
            />
        </Flex>
    );
};
