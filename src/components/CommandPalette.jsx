import { useState, useEffect, useRef } from "react";

function fuzzy(query, str) {
  if (!query) return true;
  const q = query.toLowerCase();
  const s = str.toLowerCase();
  if (s.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function CommandPalette({ commands, lang, onClose }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = query.trim()
    ? commands.filter(cmd => fuzzy(query, cmd.label) || fuzzy(query, cmd.labelJa || '') || fuzzy(query, cmd.group))
    : commands;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCursor(0); }, [query]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const run = (cmd) => { onClose(); cmd.action(); };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { if (filtered[cursor]) run(filtered[cursor]); }
    else if (e.key === 'Escape') { onClose(); }
  };

  const groups = [...new Set(filtered.map(c => c.group))];

  return (
    <div className="fixed inset-0 bg-black/75 z-[400] flex items-start justify-center pt-[12vh]" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-surface border border-linebright rounded-[14px] w-full max-w-[540px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)]">

        {/* Search input */}
        <div className="flex items-center gap-2 px-[14px] py-[11px] border-b border-line">
          <span className="text-muted text-[14px]">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={lang === 'ja' ? 'コマンドを検索...' : 'Search commands...'}
            className="flex-1 bg-transparent text-fg text-[13px] outline-none placeholder:text-dim font-mono"
          />
          <kbd className="text-dim text-[10px] font-mono border border-dim rounded px-[5px] py-[2px]">Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-[6px]">
          {filtered.length === 0 ? (
            <div className="text-muted text-[12px] font-mono text-center py-8">
              {lang === 'ja' ? '見つかりません' : 'No results'}
            </div>
          ) : groups.map(group => {
            const items = filtered.filter(c => c.group === group);
            return (
              <div key={group}>
                <div className="text-muted text-[10px] font-mono font-semibold tracking-[0.10em] uppercase px-[14px] pt-[8px] pb-[4px]">
                  {group}
                </div>
                {items.map(cmd => {
                  const idx = filtered.indexOf(cmd);
                  const active = idx === cursor;
                  return (
                    <div
                      key={cmd.id}
                      data-idx={idx}
                      onClick={() => run(cmd)}
                      onMouseEnter={() => setCursor(idx)}
                      style={active ? { background: 'rgb(var(--tint-accent))' } : undefined}
                      className="flex items-center gap-3 px-[14px] py-[8px] cursor-pointer transition-colors duration-75"
                    >
                      <span className="text-[16px] flex-shrink-0 w-[22px] text-center">{cmd.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[12px] font-semibold ${active ? 'text-accent' : 'text-fg'}`}>
                          {lang === 'ja' && cmd.labelJa ? cmd.labelJa : cmd.label}
                        </div>
                        {cmd.description && (
                          <div className="text-muted text-[10px] font-mono truncate">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="text-muted text-[10px] font-mono border border-dim rounded px-[5px] py-[2px] flex-shrink-0">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="border-t border-line px-[14px] py-[7px] flex gap-4 items-center">
          <span className="text-dim text-[10px] font-mono">↑↓ {lang === 'ja' ? '移動' : 'navigate'}</span>
          <span className="text-dim text-[10px] font-mono">↵ {lang === 'ja' ? '実行' : 'run'}</span>
          <span className="text-dim text-[10px] font-mono">Esc {lang === 'ja' ? '閉じる' : 'close'}</span>
        </div>
      </div>
    </div>
  );
}
