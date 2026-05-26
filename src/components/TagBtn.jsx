import { useState, useRef } from "react";

const SUPPORTS_HOVER = typeof window !== 'undefined'
  && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const IS_TOUCH = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const LONG_PRESS_MS = 420;

export default function TagBtn({ tag, color, lang, isFav, active, analyzed, disabled, selectMode, selected, conflict, desc, large, onInsert, onToggleFav }) {
  const [h, setH] = useState(false);
  const [tipPos, setTipPos] = useState(null);
  const [longTip, setLongTip] = useState(false); // touch long-press tooltip
  const wrapRef = useRef(null);
  const longPressTimer = useRef(null);
  const longFired = useRef(false);

  const warnColor    = 'rgb(var(--c-red))';
  const analyzeColor = 'rgb(var(--c-teal))';
  const bg = selected  ? color + '33'
    : conflict         ? 'rgb(var(--c-red) / 0.12)'
    : active           ? color + '22'
    : analyzed         ? 'rgb(var(--c-teal) / 0.1)'
    : h                ? color + '1a'
    : isFav            ? 'rgb(var(--warn-text) / 0.08)'
    : 'rgb(var(--surface-alt))';
  const bd = selected  ? color
    : conflict         ? 'rgb(var(--c-red) / 0.4)'
    : active           ? color + '90'
    : analyzed         ? 'rgb(var(--c-teal) / 0.44)'
    : h                ? color + '70'
    : isFav            ? 'rgb(var(--warn-text) / 0.3)'
    : 'rgb(var(--border))';
  const fg = selected  ? color
    : conflict         ? warnColor
    : active           ? color
    : analyzed         ? analyzeColor
    : h                ? color
    : isFav            ? 'rgb(var(--warn-text))'
    : 'rgb(var(--text) / 0.9)';

  const handleEnter = () => {
    if (!SUPPORTS_HOVER) return;
    setH(true);
    if (desc && wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      setTipPos({ x: Math.round(r.left + r.width / 2), y: Math.round(r.top) });
    }
  };
  const handleLeave = () => { setH(false); setTipPos(null); };

  // Long-press tooltip for touch devices
  const handleTouchStart = (e) => {
    if (!desc || !wrapRef.current) return;
    longFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longFired.current = true;
      const r = wrapRef.current.getBoundingClientRect();
      setTipPos({ x: Math.round(r.left + r.width / 2), y: Math.round(r.top) });
      setLongTip(true);
    }, LONG_PRESS_MS);
  };
  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
    if (longFired.current) {
      // Long press fired — suppress the click so tag is NOT toggled
      setTimeout(() => { setLongTip(false); setTipPos(null); longFired.current = false; }, 1800);
    }
  };
  const handleTouchMove = () => {
    clearTimeout(longPressTimer.current);
    setLongTip(false);
    setTipPos(null);
  };

  const showTip = (h && desc && tipPos && !selectMode && !disabled && SUPPORTS_HOVER)
               || (longTip && desc && tipPos && !selectMode && !disabled);

  return (
    <div
      ref={wrapRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={IS_TOUCH ? handleTouchStart : undefined}
      onTouchEnd={IS_TOUCH ? handleTouchEnd : undefined}
      onTouchMove={IS_TOUCH ? handleTouchMove : undefined}
      style={{ background: bg, border: `1px solid ${bd}`, opacity: disabled ? 0.4 : 1, boxShadow: active && !selectMode ? `0 0 0 1px ${color}40` : 'none' }}
      className="inline-flex items-center rounded-[5px] overflow-hidden transition-all duration-100"
    >
      {/* Tooltip — position:fixed escapes parent overflow:hidden */}
      {showTip && (
        <div style={{
          position: 'fixed',
          left: tipPos.x,
          top: tipPos.y,
          transform: 'translate(-50%, calc(-100% - 8px))',
          zIndex: 9999,
          background: 'rgba(6,8,18,0.96)',
          border: '1px solid rgba(255,255,255,0.11)',
          borderRadius: 7,
          padding: '6px 10px',
          maxWidth: 210,
          pointerEvents: 'none',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          whiteSpace: 'normal',
        }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.88)', lineHeight: 1.55 }}>
            {lang === 'ja' ? desc.ja : desc.en}
          </div>
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: '5px solid rgba(6,8,18,0.96)',
          }} />
        </div>
      )}
      <button
        disabled={disabled}
        onClick={(e) => {
          // Suppress click when a long-press tooltip just fired
          if (longFired.current) { e.preventDefault(); return; }
          onInsert(e);
        }}
        title={conflict ? (lang === 'ja' ? `⚠ 競合タグ: ${tag.en}` : `⚠ Conflicting tag: ${tag.en}`) : (lang === 'ja' ? tag.en : tag.ja)}
        style={{ color: fg }}
        className={`bg-transparent border-none cursor-pointer font-mono tracking-tight ${large ? 'px-[10px] py-[6px] text-[15px]' : 'px-[7px] py-[3px] text-[12px]'} ${(active || selected) ? 'font-bold' : 'font-normal'}`}
      >
        {conflict ? '⚠ ' : (active && !selectMode) ? '✓ ' : (analyzed && !active && !selectMode) ? '◎ ' : ''}
        {selectMode && selected ? '☑ ' : selectMode ? '☐ ' : ''}
        {lang === 'ja' ? tag.ja : tag.en}
      </button>
      {onToggleFav && !selectMode && ((active && h) || isFav) && (
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(); }}
          className={`bg-transparent border-l border-dim cursor-pointer leading-none ${large ? 'px-[7px] py-[6px] text-[13px]' : 'px-[5px] py-[3px] text-[10px]'} ${isFav ? 'text-warn' : 'text-muted'}`}
        >★</button>
      )}
    </div>
  );
}
