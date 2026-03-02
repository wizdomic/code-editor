import { useState, useRef } from 'react';
import React from 'react';

/**
 * Drag-to-resize hook for split panels.
 * axis: 'x' = horizontal resize (chat), 'y' = vertical (output)
 */
export function useResizer(initial: number, min: number, max: number, axis: 'x' | 'y') {
  const [size, setSize] = useState(initial);
  const drag = useRef({ active: false, startPos: 0, startSize: initial });

  const onMouseDown = (e: React.MouseEvent) => {
    drag.current = {
      active:    true,
      startPos:  axis === 'x' ? e.clientX : e.clientY,
      startSize: size,
    };

    const onMove = (ev: MouseEvent) => {
      if (!drag.current.active) return;
      const delta = drag.current.startPos - (axis === 'x' ? ev.clientX : ev.clientY);
      setSize(Math.min(max, Math.max(min, drag.current.startSize + delta)));
    };

    const onUp = () => {
      drag.current.active = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    e.preventDefault();
  };

  return { size, onMouseDown };
}