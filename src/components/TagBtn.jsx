import { useState, useRef } from "react";

const SUPPORTS_HOVER = typeof window !== 'undefined'
  && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const IS_TOUCH = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const LONG_PRESS_MS = 420;

export default function TagBtn({ tag, color, lang, isFav, active, analyzed, disabled, selectMode, selected, conflict, desc, large, onInsert, onToggleFav, wrapperRef }) {
  const [h, setH] = useState(false);
  const [tipPos, setTipPos] = useState(null);
  const [longTip, setLongTip] = useState(false); // touch long-press tooltip
  const wrapRef = useRef(null);
  const setRef = el => { wrapRef.current = el; wrapperRef?.(el); };
  const longPressTimer = useRef(null);
  const longFired = useRef(false);

  const errorColor   = 'rgb(var(--c-red))';
  const softColor    = 'rgb(var(--warn-text))'; // amber — for level:'warn' conflicts
  const analyzeColor = 'rgb(var(--c-teal))';
  const bg = selected           ? color + '33'
    : conflict === 'error'      ? 'rgb(var(--c-red) / 0.12)'
    : conflict === 'warn'       ? 'rgb(var(--warn-text) / 0.08)'
    : active                    ? color + '22'
    : analyzed                  ? 'rgb(var(--c-teal) / 0.1)'
    : h                         ? color + '1a'
    : isFav                     ? 'rgb(var(--warn-text) / 0.08)'
    : 'rgb(var(--surface-alt))';
  const bd = selected           ? color
    : conflict === 'error'      ? 'rgb(var(--c-red) / 0.4)'
    : conflict === 'warn'       ? 'rgb(var(--warn-text) / 0.35)'
    : active                    ? color + '90'
    : analyzed                  ? 'rgb(var(--c-teal) / 0.44)'
    : h                         ? color + '70'
    : isFav                     ? 'rgb(var(--warn-text) / 0.3)'
    : 'rgb(var(--border))';
  const fg = selected           ? color
    : conflict === 'error'      ? errorColor
    : conflict === 'warn'       ? softColor
    : active                    ? color
    : analyzed                  ? analyzeColor
    : h                         ? color
    : isFav                     ? 'rgb(var(--warn-text))'
    : 'rgb(var(--text) / 0.9)';

  const calcTipPos = (rect) => {
    const vw = window.innerWidth || 375;
    return { x: Math.round(vw / 2), y: Math.round(rect.top) };
  };

  const handleEnter = () => {
    if (!SUPPORTS_HOVER) return;
    setH(true);
    if (desc && wrapRef.current) setTipPos(calcTipPos(wrapRef.current.getBoundingClientRect()));
  };
  const handleLeave = () => { setH(false); setTipPos(null); };

  // Long-press tooltip for touch devices
  const handleTouchStart = (_e) => {
    if (!desc || !wrapRef.current) return;
    longFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longFired.current = true;
      setTipPos(calcTipPos(wrapRef.current.getBoundingClientRect()));
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
      ref={setRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={IS_TOUCH ? handleTouchStart : undefined}
      onTouchEnd={IS_TOUCH ? handleTouchEnd : undefined}
      onTouchMove={IS_TOUCH ? handleTouchMove : undefined}
      style={{ background: bg, border: `1px solid ${bd}`, opacity: disabled ? 0.4 : 1, boxShadow: active && !selectMode ? `0 0 0 1px ${color}40` : 'none', position: 'relative' }}
      className="inline-flex items-center rounded-[0.3125rem] overflow-hidden transition-all duration-100"
    >
      {/* Tooltip — position:fixed escapes parent overflow:hidden */}
      {showTip && (
        <div style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          background: 'rgba(6,8,18,0.97)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '0.875rem',
          padding: '0.875rem 1.25rem 1rem',
          width: '21.25rem',
          maxWidth: 'calc(100vw - 2rem)',
          pointerEvents: 'none',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        }}>
          <div style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            {tag.en}
          </div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.92)', lineHeight: 1.8 }}>
            {lang === 'ja' ? desc.ja : desc.en}
          </div>
        </div>
      )}
      <button
        disabled={disabled}
        onClick={(e) => {
          // Suppress click when a long-press tooltip just fired
          if (longFired.current) { e.preventDefault(); return; }
          onInsert(e);
        }}
        title={
          conflict === 'error' ? (lang === 'ja' ? `⚠ 競合タグ: ${tag.en}` : `⚠ Conflicting tag: ${tag.en}`) :
          conflict === 'warn'  ? (lang === 'ja' ? `〜 不自然な組み合わせ: ${tag.en}` : `〜 Unusual combination: ${tag.en}`) :
          (lang === 'ja' ? tag.en : tag.ja)
        }
        style={{ color: fg }}
        className={`bg-transparent border-none cursor-pointer font-mono tracking-tight ${large ? `px-2.5 py-1.5 text-[0.9375rem]${onToggleFav && !selectMode ? ' pr-[1.375rem]' : ''}` : `px-[0.4375rem] py-[0.1875rem] text-xs${onToggleFav && !selectMode ? ' pr-[1.125rem]' : ''}`} ${(active || selected) ? 'font-bold' : 'font-normal'}`}
      >
        {conflict === 'error' ? '⚠ ' : conflict === 'warn' ? '〜 ' : (active && !selectMode) ? '✓ ' : (analyzed && !active && !selectMode) ? '◎ ' : ''}
        {selectMode && selected ? '☑ ' : selectMode ? '☐ ' : ''}
        {lang === 'ja' ? tag.ja : tag.en}
      </button>
      {onToggleFav && !selectMode && ((active && (h || IS_TOUCH)) || isFav) && (
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(); }}
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: bg }}
          className={`border-l border-dim cursor-pointer leading-none ${large ? 'px-[0.4375rem] text-[0.8125rem]' : 'px-[0.3125rem] text-[0.625rem]'} ${isFav ? 'text-warn' : 'text-muted'}`}
        >★</button>
      )}
    </div>
  );
}
