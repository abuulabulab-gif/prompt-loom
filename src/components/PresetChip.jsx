import { useState } from "react";

export default function PresetChip({ preset, color, onLoad, onDelete, onCopyTo, onEditMemo, onEditNeg, otherChars, lang }) {
  const [h, setH] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const hasBundle = preset.bundle && Object.keys(preset.bundle).length > 0;
  const tooltip = [
    hasBundle ? (lang === 'ja' ? `📦 束: ${Object.keys(preset.bundle).join(', ')}` : `📦 bundle: ${Object.keys(preset.bundle).join(', ')}`) : '',
    preset.negAdd?.trim() ? `🚫 ${preset.negAdd.trim()}` : '',
    preset.memo?.trim() || '',
  ].filter(Boolean).join('\n');

  return (
    <div className="relative flex-shrink-0">
      <div
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        title={tooltip || undefined}
        style={{
          background: h ? color + '18' : 'rgb(var(--surface-alt))',
          border: `1px solid ${h ? color + '60' : 'rgb(var(--border))'}`,
        }}
        className="flex items-center gap-[0.1875rem] rounded-md px-2 py-1 cursor-pointer transition-all duration-[120ms]"
      >
        <span
          onClick={onLoad}
          style={{ color: h ? color : 'rgb(var(--text))' }}
          className="text-[0.6875rem] font-mono"
        >{hasBundle ? '📦' : ''}{preset.memo?.trim() ? '📝' : ''}{preset.name}</span>

        <span
          onClick={e => { e.stopPropagation(); setShowMenu(s => !s); }}
          onMouseOver={e => e.target.style.color = color}
          onMouseOut={e => e.target.style.color = ''}
          className="text-[0.625rem] px-0.5 cursor-pointer leading-none text-muted"
        >⋯</span>

        <span
          onClick={onDelete}
          onMouseOver={e => e.target.style.color = 'rgb(var(--c-red))'}
          onMouseOut={e => e.target.style.color = ''}
          className="text-[0.625rem] cursor-pointer px-0.5 leading-none text-dim"
        >✕</span>
      </div>

      {showMenu && (
        <div className="absolute top-full left-0 z-[200] bg-surface border border-linebright rounded-lg p-1.5 min-w-[8.125rem] mt-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          {onEditMemo && (
            <div
              onClick={() => { onEditMemo(); setShowMenu(false); }}
              onMouseOver={e => e.currentTarget.style.background = 'rgb(var(--surface-alt))'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              className="flex items-center gap-1.5 px-2 py-[0.3125rem] rounded-[0.3125rem] cursor-pointer"
            >
              <span className="text-xs">📝</span>
              <span className="text-[0.6875rem] text-fg">{lang === 'ja' ? 'メモ編集' : 'Edit memo'}</span>
            </div>
          )}
          {onEditNeg && (
            <div
              onClick={() => { onEditNeg(); setShowMenu(false); }}
              onMouseOver={e => e.currentTarget.style.background = 'rgb(var(--surface-alt))'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              className="flex items-center gap-1.5 px-2 py-[0.3125rem] rounded-[0.3125rem] cursor-pointer"
            >
              <span className="text-xs">🚫</span>
              <span className="text-[0.6875rem] text-fg">{lang === 'ja' ? 'ネガ差分' : 'Neg. tags'}</span>
            </div>
          )}
          {otherChars?.length > 0 && (
            <>
              <div className="text-[0.625rem] font-mono mb-[0.3125rem] mt-1 px-1 text-muted border-t border-line pt-1">
                {lang === 'ja' ? 'コピー先:' : 'Copy to:'}
              </div>
              {otherChars.map(c => (
                <div
                  key={c.id}
                  onClick={() => { onCopyTo(c.id); setShowMenu(false); }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgb(var(--surface-alt))'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  className="flex items-center gap-1.5 px-2 py-[0.3125rem] rounded-[0.3125rem] cursor-pointer"
                >
                  <span className="text-xs">{c.emoji}</span>
                  <span className="text-[0.6875rem] text-fg">{c.name}</span>
                </div>
              ))}
            </>
          )}
          <div
            onClick={() => setShowMenu(false)}
            className="text-[0.625rem] text-center p-1 mt-1 cursor-pointer text-muted border-t border-line"
          >✕</div>
        </div>
      )}
    </div>
  );
}
