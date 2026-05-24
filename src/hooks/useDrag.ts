import { useState, useRef, type PointerEvent, useCallback } from "react";
import type { Vector2D } from "../types/math";



interface UseDragOptions {
    onDragEnd?: (offset: Vector2D) => void;
    onDragMove?: (offset: Vector2D) => void;
}

export const useDrag = (options?: UseDragOptions) => {
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<Vector2D>({ x: 0, y: 0 });
    const accumulatedOffsetRef = useRef<Vector2D>({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState<Vector2D>({ x: 0, y: 0 });

    const handlePointerDown = (e: PointerEvent<HTMLElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        isDraggingRef.current = true;
    };

    const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
        if (!isDraggingRef.current) return;

        if (e.buttons !== 1) {
            isDraggingRef.current = false;
            return;
        }

        const distanceX = e.clientX - dragStartRef.current.x;
        const distanceY = e.clientY - dragStartRef.current.y;

        setDragOffset({ 
            x: accumulatedOffsetRef.current.x - distanceX, 
            y: accumulatedOffsetRef.current.y - distanceY 
        });

        if (options?.onDragMove) {
            options.onDragMove(dragOffset);
        }
    };

    const handlePointerUp = (e: PointerEvent<HTMLElement>) => {
        if (!isDraggingRef.current) return;
        
        e.currentTarget.releasePointerCapture(e.pointerId);
        isDraggingRef.current = false;
        
        accumulatedOffsetRef.current = dragOffset;

        if (options?.onDragEnd) {
            options.onDragEnd(dragOffset);
        }
    };

    const handlePointerLeave = handlePointerUp;

    const resetDrag = useCallback(() => {
        accumulatedOffsetRef.current = { x: 0, y: 0 };
        setDragOffset({ x: 0, y: 0 })
    }, [])

    return {
        dragOffset,
        resetDrag,
        handlers: {
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            onPointerLeave: handlePointerLeave,
        }
    };
};
