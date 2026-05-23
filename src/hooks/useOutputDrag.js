import { useCallback } from "react";

export function useOutputDrag(outputHeight, setOutputHeight) {
  return useCallback((e) => {
    e.preventDefault();
    const startY = e.clientY ?? e.touches?.[0]?.clientY;
    const startH = outputHeight;
    const onMove = (ev) => {
      const y = ev.clientY ?? ev.touches?.[0]?.clientY;
      setOutputHeight(Math.max(120, Math.min(Math.floor(window.innerHeight * 0.7), startH + (startY - y))));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }, [outputHeight, setOutputHeight]);
}
