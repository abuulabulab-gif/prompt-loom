import { useState } from "react";

export default function LibraryModal({ characters, activeCharId, lang, onClose, onActivate, onArchive, onDelete, onSetFolder }) {
  const [search, setSearch] = useState('');
  const [folderTab, setFolderTab] = useState('all');

  // Collect unique folder names (non-empty, non-archived chars)
  const folders = [...new Set(characters.map(c => c.folder || '').filter(f => f !== ''))].sort();

  const tabs = [
    { id: 'all',      label: lang === 'ja' ? 'すべて' : 'All' },
    ...folders.map(f => ({ id: `folder:${f}`, label: f })),
    { id: 'archived', label: lang === 'ja' ? '🗄 アーカイブ' : '🗄 Archive' },
  ];

  const filtered = characters.filter(c => {
    const q = search.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(q) || (c.folder || '').toLowerCase().includes(q);
    if (!nameMatch) return false;
    if (folderTab === 'archived') return !!c.archived;
    if (folderTab.startsWith('folder:')) return !c.archived && (c.folder || '') === folderTab.slice(7);
    return !c.archived; // 'all'
  });

  const nonArchivedCount = characters.filter(c => !c.archived).length;

  return (
    <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-3"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface border border-linebright rounded-[14px] w-full max-w-[660px] flex flex-col max-h-[88vh] overflow-hidden">

        {/* Header */}
        <div className="px-[16px] py-[12px] border-b border-line flex items-center gap-[10px] flex-shrink-0">
          <span className="text-fg text-[14px] font-bold">📚 {lang === 'ja' ? 'キャラクター格納庫' : 'Character Library'}</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'ja' ? 'キャラ名・フォルダで検索...' : 'Search by name or folder...'}
            className="flex-1 bg-surfalt border border-line rounded-[6px] px-[9px] py-[4px] text-[11px] font-mono outline-none text-fg placeholder:text-dim"
            autoFocus
          />
          <button onClick={onClose}
            className="bg-transparent border border-dim rounded-[6px] px-[10px] py-1 text-muted cursor-pointer text-[11px] flex-shrink-0">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        {/* Folder tabs */}
        {tabs.length > 2 && (
          <div className="flex gap-[4px] px-[14px] py-[8px] border-b border-line flex-shrink-0 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setFolderTab(t.id)}
                className={`flex-shrink-0 rounded-[5px] px-[9px] py-[3px] text-[10px] font-mono cursor-pointer border transition-all duration-100 ${
                  folderTab === t.id
                    ? 'bg-tint-accent border-accent/40 text-accent'
                    : 'bg-surfalt border-dim text-muted'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Character grid */}
        <div className="overflow-y-auto flex-1 p-[14px]">
          {filtered.length === 0 ? (
            <div className="text-center text-muted text-[12px] font-mono py-[40px]">
              {search ? (lang === 'ja' ? '該当するキャラが見つかりません' : 'No characters found') : (lang === 'ja' ? 'キャラクターがいません' : 'No characters here')}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-[8px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {filtered.map(c => {
                const isActive = c.id === activeCharId;
                return (
                  <div key={c.id}
                    style={{ borderColor: isActive ? c.color + '80' : 'rgb(var(--border))', background: isActive ? c.color + '10' : 'rgb(var(--surface-alt))' }}
                    className="rounded-[10px] border p-[10px] flex flex-col gap-[7px] transition-all duration-150">

                    {/* Character identity */}
                    <div className="flex items-center gap-[7px]">
                      <span className="text-[20px] leading-none">{c.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div style={{ color: isActive ? c.color : 'rgb(var(--text))' }}
                          className="text-[12px] font-bold truncate">{c.name}</div>
                        {c.archived && (
                          <span className="text-[9px] font-mono text-muted">🗄 {lang === 'ja' ? 'アーカイブ済み' : 'archived'}</span>
                        )}
                      </div>
                      {isActive && (
                        <span style={{ color: c.color }} className="text-[9px] font-mono flex-shrink-0">▶ {lang === 'ja' ? '使用中' : 'active'}</span>
                      )}
                    </div>

                    {/* Folder input */}
                    <input
                      value={c.folder || ''}
                      onChange={e => onSetFolder(c.id, e.target.value)}
                      placeholder={lang === 'ja' ? 'フォルダ名...' : 'Folder...'}
                      className="w-full bg-bg border border-dim rounded-[5px] px-[7px] py-[3px] text-[10px] font-mono outline-none text-muted placeholder:text-dim"
                      onClick={e => e.stopPropagation()}
                    />

                    {/* Action buttons */}
                    <div className="flex gap-[4px] flex-wrap">
                      {!isActive && !c.archived && (
                        <button onClick={() => { onActivate(c.id); onClose(); }}
                          style={{ borderColor: c.color + '60', color: c.color }}
                          className="border rounded-[5px] px-[7px] py-[2px] text-[10px] font-mono cursor-pointer bg-transparent flex-shrink-0">
                          ▶ {lang === 'ja' ? '選択' : 'Select'}
                        </button>
                      )}
                      {c.archived ? (
                        <button onClick={() => onArchive(c.id, false)}
                          className="border border-dim rounded-[5px] px-[7px] py-[2px] text-[10px] font-mono cursor-pointer bg-transparent text-muted flex-shrink-0">
                          ↩ {lang === 'ja' ? '戻す' : 'Restore'}
                        </button>
                      ) : (
                        <button
                          onClick={() => nonArchivedCount > 1 ? onArchive(c.id, true) : alert(lang === 'ja' ? '最後のキャラはアーカイブできません' : 'Cannot archive the last character')}
                          className="border border-dim rounded-[5px] px-[7px] py-[2px] text-[10px] font-mono cursor-pointer bg-transparent text-muted flex-shrink-0">
                          🗄 {lang === 'ja' ? '格納' : 'Archive'}
                        </button>
                      )}
                      {characters.length > 1 && (
                        <button onClick={() => {
                          if (!window.confirm(lang === 'ja' ? `「${c.name}」を削除しますか？` : `Delete "${c.name}"?`)) return;
                          onDelete(c.id);
                        }}
                          className="border border-dim rounded-[5px] px-[7px] py-[2px] text-[10px] font-mono cursor-pointer bg-transparent ml-auto"
                          style={{ color: 'rgb(var(--c-red) / 0.7)' }}>
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-[14px] py-[8px] border-t border-line flex-shrink-0 text-center text-[10px] font-mono text-dim">
          {lang === 'ja'
            ? `${characters.filter(c => !c.archived).length} キャラ使用中 · ${characters.filter(c => c.archived).length} アーカイブ`
            : `${characters.filter(c => !c.archived).length} active · ${characters.filter(c => c.archived).length} archived`}
        </div>
      </div>
    </div>
  );
}
