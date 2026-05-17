import { useState, useRef, type PointerEvent, useCallback } from "react";
import type { Vector2D } from "../types/math";



interface UseDragOptions {
    onDragEnd?: (offset: Vector2D) => void;
}

export const useDrag = (options?: UseDragOptions) => {
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<Vector2D>({ x: 0, y: 0 });
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
            setDragOffset({ x: 0, y: 0 });
            return;
        }

        const distanceX = e.clientX - dragStartRef.current.x;
        const distanceY = e.clientY - dragStartRef.current.y;

        setDragOffset({ x: distanceX, y: distanceY });
    };

    const handlePointerUp = (e: PointerEvent<HTMLElement>) => {
        if (!isDraggingRef.current) return;
        
        e.currentTarget.releasePointerCapture(e.pointerId);
        isDraggingRef.current = false;

        if (options?.onDragEnd) {
            options.onDragEnd({
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y,
            });
        }
    };

    const handlePointerLeave = handlePointerUp;

    const resetDrag = useCallback(() => {
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
