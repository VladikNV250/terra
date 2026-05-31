import { useEffect, useRef, useState } from "react";
import type { TerrainConfig } from "../types/terrain";
import { Flex } from "@radix-ui/themes";
import { useDrag } from "../hooks/useDrag";
import { TerrainEngine } from "../lib";
import { useErrorBoundary } from "react-error-boundary";

interface Props {
    terrainConfig: TerrainConfig;
    onPointerMoveMap?: (coords: { x: number; y: number }) => void;
    onZoom?: (newZoom: number) => void;
}

export const Map = ({ terrainConfig, onPointerMoveMap, onZoom }: Props) => {
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    const terrainEngine = useRef<TerrainEngine | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const { showBoundary } = useErrorBoundary();
    
    const effectiveScale = Math.floor(terrainConfig.scale * terrainConfig.zoom);
    const effectiveTempScale = Math.floor(terrainConfig.tempScale * terrainConfig.zoom);
    const effectiveMoistureScale = Math.floor(terrainConfig.moistureScale * terrainConfig.zoom);

    const { handlers } = useDrag({
        onDragMove: (delta) => {
            if (isInitialized && terrainEngine.current && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const scaleX = canvasRef.current.width / rect.width;
                const scaleY = canvasRef.current.height / rect.height;

                terrainEngine.current.moveCamera({
                    x: delta.x * scaleX,
                    y: delta.y * scaleY
                });
            }
        },
    });

    useEffect(() => {
        terrainEngine.current = new TerrainEngine();
        
        terrainEngine.current.init(
            () => setIsInitialized(true),
            showBoundary
        ).catch(showBoundary);

        return () => {
            if (terrainEngine.current) {
                terrainEngine.current.destroy();
            }
        };
    }, [showBoundary]);

    useEffect(() => {
        if (!isInitialized || !terrainEngine.current || !canvasRef.current)
            return;

        terrainEngine.current.render({
            config: { 
                ...terrainConfig, 
                scale: effectiveScale,
                tempScale: effectiveTempScale,
                moistureScale: effectiveMoistureScale
            },
            canvas: canvasRef.current,
        });
    }, [isInitialized, terrainConfig, effectiveScale, effectiveTempScale, effectiveMoistureScale]);

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        handlers.onPointerMove(e);

        if (onPointerMoveMap && canvasRef.current && terrainEngine.current) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const cameraOffset = terrainEngine.current.getCamera();

            const px = (e.clientX - rect.left) * scaleX + cameraOffset.x;
            const py = (e.clientY - rect.top) * scaleY + cameraOffset.y;

            const zoom = terrainConfig.zoom || 1.0;
            const x = Math.floor(px / zoom);
            const y = Math.floor(py / zoom);

            onPointerMoveMap({ x, y });
        }
    };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        if (!onZoom) return;
        const zoomDelta = e.deltaY * -0.001;
        onZoom(terrainConfig.zoom + zoomDelta);
    };

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
                className="max-w-full max-h-full object-contain touch-none"
                ref={canvasRef}
                width={terrainConfig.width}
                height={terrainConfig.height}
                {...handlers}
                onPointerMove={handlePointerMove}
                onWheel={handleWheel}
            />
        </Flex>
    );
};
