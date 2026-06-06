import { useRef, type PointerEvent } from "react";
import type { Vector2D } from "../types/math";

interface UseDragOptions {
    onDragMove?: (delta: Vector2D) => void;
    onDragEnd?: () => void;
}

export const useDrag = (options?: UseDragOptions) => {
    const isDraggingRef = useRef(false);
    const lastPosRef = useRef<Vector2D>({ x: 0, y: 0 });

    const handlePointerDown = (e: PointerEvent<HTMLElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        isDraggingRef.current = true;
    };

    const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
        if (!isDraggingRef.current) return;

        if (e.pointerType === 'mouse' && e.buttons !== 1) {
            isDraggingRef.current = false;
            return;
        }

        const deltaX = lastPosRef.current.x - e.clientX;
        const deltaY = lastPosRef.current.y - e.clientY;

        lastPosRef.current = { x: e.clientX, y: e.clientY };

        if (options?.onDragMove) {
            options.onDragMove({ x: deltaX, y: deltaY });
        }
    };

    const handlePointerUp = (e: PointerEvent<HTMLElement>) => {
        if (!isDraggingRef.current) return;
        
        e.currentTarget.releasePointerCapture(e.pointerId);
        isDraggingRef.current = false;

        if (options?.onDragEnd) {
            options.onDragEnd();
        }
    };

    const handlePointerLeave = handlePointerUp;

    return {
        handlers: {
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            onPointerLeave: handlePointerLeave,
        }
    };
};
