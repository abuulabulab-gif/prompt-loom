import { useState } from "react";
import { TOOLS } from "../data/tools.js";
import PromptLogEntry from "./PromptLogEntry.jsx";
import RecordModal from "./RecordModal.jsx";

export default function PromptLog({ char, lang, activeTool, posText, negText, onUpdate, onRestoreBlocks }) {
  const [recordOpen, setRecordOpen] = useState(false);
  const [filterTool, setFilterTool] = useState('all');
  const [filterLabel, setFilterLabel] = useState('');
  const [search, setSearch] = useState('');

  const log = char.promptLog || [];

  const addEntry = entry => onUpdate({ promptLog: [entry, ...log] });
  const deleteEntry = id => onUpdate({ promptLog: log.filter(e => e.id !== id) });
  const editEntry = updated => onUpdate({ promptLog: log.map(e => e.id === updated.id ? updated : e) });

  const allLabels = [...new Set(log.flatMap(e => e.labels || []))];

  const filtered = log.filter(e => {
    if (filterTool !== 'all' && e.tool !== filterTool) return false;
    if (filterLabel && !(e.labels || []).includes(filterLabel)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.title?.toLowerCase().includes(q) &&
          !e.memo?.toLowerCase().includes(q) &&
          !e.posText?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Group by date
  const groups = [];
  let lastDate = '';
  for (const entry of filtered) {
    const d = new Date(entry.ts);
    const dateStr = `${d.getFullYear()}/${d.getMonth()+1}/${String(d.getDate()).padStart(2,'0')}`;
    if (dateStr !== lastDate) { groups.push({ type: 'date', label: dateStr }); lastDate = dateStr; }
    groups.push({ type: 'entry', entry });
  }

  const handleRestore = entry => {
    if (window.confirm(lang === 'ja' ? 'ブロック設定を復元しますか？（現在の設定が上書きされます）' : 'Restore block settings? Current settings will be overwritten.')) {
      onRestoreBlocks(entry.blocks);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-[8px] mb-[11px] flex-wrap">
        <span className="text-fg text-[12px] font-bold">🗂 {lang === 'ja' ? 'プロンプトログ' : 'Prompt Log'}</span>
        <span className="text-muted text-[10px] font-mono font-semibold">{log.length}{lang === 'ja' ? '件' : ' entries'}</span>
        <div className="flex-1" />
        <button onClick={() => setRecordOpen(true)}
          style={{ background: char.color, color: '#000' }}
          className="border-none rounded-[7px] px-[11px] py-[5px] text-[11px] font-bold cursor-pointer flex-shrink-0">
          ＋ {lang === 'ja' ? '現在のプロンプトを記録' : 'Record current'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-[5px] flex-wrap mb-[10px]">
        <select value={filterTool} onChange={e => setFilterTool(e.target.value)}
          className="bg-bg border border-line rounded-[5px] text-[10px] px-[7px] py-[4px] font-mono text-muted outline-none cursor-pointer">
          <option value="all">{lang === 'ja' ? 'ツール: 全て' : 'Tool: All'}</option>
          {TOOLS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {allLabels.length > 0 && (
          <select value={filterLabel} onChange={e => setFilterLabel(e.target.value)}
            className="bg-bg border border-line rounded-[5px] text-[10px] px-[7px] py-[4px] font-mono text-muted outline-none cursor-pointer">
            <option value="">{lang === 'ja' ? 'ラベル: 全て' : 'Label: All'}</option>
            {allLabels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'ja' ? '🔍 タイトル・メモを検索...' : '🔍 Search...'}
          className="bg-bg border border-line rounded-[5px] text-[10px] px-[8px] py-[4px] font-mono text-fg outline-none flex-1 min-w-[100px]" />
        {(filterTool !== 'all' || filterLabel || search) && (
          <button onClick={() => { setFilterTool('all'); setFilterLabel(''); setSearch(''); }}
            className="bg-transparent border border-dim rounded-[5px] px-[7px] py-[4px] text-[10px] font-mono text-muted cursor-pointer">
            ✕
          </button>
        )}
      </div>

      {/* Note about auto-save */}
      {log.length === 0 && (
        <div className="text-center py-[32px]">
          <div className="text-muted text-[11px] font-mono mb-[6px]">
            {lang === 'ja' ? '（まだ記録がありません）' : '(no logs yet)'}
          </div>
          <div className="text-muted text-[10px] font-mono leading-[1.6]">
            {lang === 'ja'
              ? 'COPYボタンで自動記録、または上の「＋ 記録」から手動保存できます'
              : 'Auto-saved on COPY, or use the button above to save manually'}
          </div>
        </div>
      )}

      {log.length > 0 && filtered.length === 0 && (
        <div className="text-muted text-[11px] font-mono text-center py-[20px]">
          {lang === 'ja' ? '（条件に一致するログがありません）' : '(no matching entries)'}
        </div>
      )}

      {groups.map((item, i) =>
        item.type === 'date' ? (
          <div key={`d-${i}`} className="text-muted text-[10px] font-mono font-semibold py-[4px] mb-[6px] border-b border-line">
            ── {item.label}
          </div>
        ) : (
          <PromptLogEntry key={item.entry.id}
            entry={item.entry} lang={lang} char={char}
            onRestore={handleRestore}
            onDelete={deleteEntry}
            onEdit={editEntry}
          />
        )
      )}

      {recordOpen && (
        <RecordModal char={char} lang={lang} activeTool={activeTool}
          posText={posText} negText={negText}
          existingLabels={allLabels}
          onSave={addEntry} onClose={() => setRecordOpen(false)} />
      )}
    </div>
  );
}
