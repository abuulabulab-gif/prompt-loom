import { useCallback, useRef } from "react";

export function useOutputDrag(outputHeight, setOutputHeight) {
  const pendingRef = useRef(outputHeight);

  return useCallback((e) => {
    e.preventDefault();
    const startY = e.clientY ?? e.touches?.[0]?.clientY;
    const startH = outputHeight;
    pendingRef.current = startH;

    // Capture the output bar DOM node (parent of the drag handle).
    // Direct style updates bypass React re-renders entirely during drag.
    const bar = (e.currentTarget ?? e.target)?.parentElement;

    const onMove = (ev) => {
      ev.preventDefault(); // prevent page scroll while dragging
      const y = ev.clientY ?? ev.touches?.[0]?.clientY;
      const newH = Math.max(120, Math.min(Math.floor(window.innerHeight * 0.7), startH + (startY - y)));
      pendingRef.current = newH;
      if (bar) bar.style.height = `${newH}px`;
    };

    const onUp = () => {
      // Commit final height to React state exactly once
      setOutputHeight(pendingRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend',  onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend',  onUp);
  }, [outputHeight, setOutputHeight]);
}
