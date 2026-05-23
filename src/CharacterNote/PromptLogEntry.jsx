import { useState } from "react";
import { TOOLS } from "../data/tools.js";

export default function PromptLogEntry({ entry, lang, char, onRestore, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title || '');
  const [editMemo, setEditMemo] = useState(entry.memo || '');
  const [copied, setCopied] = useState(false);

  const fmtTs = ts => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const toolLabel = TOOLS.find(t => t.id === entry.tool)?.label || entry.tool || '';

  const doCopy = () => {
    navigator.clipboard.writeText(entry.posText || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="border border-line rounded-[8px] mb-[7px] overflow-hidden">
      {/* Summary row */}
      <div className="px-[12px] py-[8px] bg-surfalt flex items-center gap-[7px] flex-wrap">
        <span className="text-muted text-[10px] font-mono font-semibold flex-shrink-0">🕐 {fmtTs(entry.ts)}</span>

        {editMode ? (
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
            className="flex-1 bg-bg border border-line rounded-[4px] text-[11px] px-[6px] py-[2px] font-mono text-fg outline-none min-w-[100px]" />
        ) : (
          <span className="text-fg text-[11px] font-semibold flex-1 truncate min-w-0">
            {entry.title || <span className="text-dim italic font-normal">{lang === 'ja' ? '（タイトルなし）' : '(untitled)'}</span>}
          </span>
        )}

        {toolLabel && <span className="text-muted text-[10px] font-mono font-semibold flex-shrink-0">{toolLabel}</span>}

        {(entry.labels || []).map(l => (
          <span key={l}
            style={{ background: char.color + '20', border: `1px solid ${char.color}60`, color: char.color }}
            className="text-[10px] font-mono font-semibold px-[6px] py-[1px] rounded-[4px] flex-shrink-0">{l}</span>
        ))}

        <button onClick={() => setExpanded(e => !e)}
          className="bg-transparent border-none text-dim text-[10px] font-mono cursor-pointer ml-auto flex-shrink-0">
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Collapsed preview */}
      {!expanded && entry.posText && (
        <div className="px-[12px] py-[5px] border-t border-line/50">
          <div className="text-prompt text-[10px] font-mono truncate opacity-80">
            {entry.posText.slice(0, 100)}{entry.posText.length > 100 ? '…' : ''}
          </div>
        </div>
      )}

      {/* Expanded body */}
      {expanded && (
        <div className="px-[12px] py-[10px] border-t border-line/50">
          {entry.posText && (
            <div className="mb-[8px]">
              <div className="text-muted text-[10px] font-mono font-bold mb-[3px] uppercase tracking-[0.08em]">Positive</div>
              <div className="text-prompt text-[11px] font-mono break-all leading-[1.6] bg-bg rounded-[5px] px-[9px] py-[7px] select-all">
                {entry.posText}
              </div>
            </div>
          )}
          {entry.negText && (
            <div className="mb-[8px]">
              <div className="text-muted text-[10px] font-mono font-bold mb-[3px] uppercase tracking-[0.08em]">Negative</div>
              <div className="text-muted text-[11px] font-mono break-all leading-[1.6] bg-bg rounded-[5px] px-[9px] py-[7px] select-all">
                {entry.negText}
              </div>
            </div>
          )}

          {editMode ? (
            <textarea value={editMemo} onChange={e => setEditMemo(e.target.value)}
              placeholder={lang === 'ja' ? 'メモ...' : 'Notes...'}
              className="w-full bg-bg border border-line rounded-[5px] text-[11px] px-[8px] py-[6px] font-mono text-fg outline-none resize-none min-h-[50px] mb-[8px] leading-[1.7]" />
          ) : entry.memo ? (
            <div className="mb-[8px] text-muted text-[11px] font-mono leading-[1.7] bg-bg rounded-[5px] px-[9px] py-[7px]">
              📝 {entry.memo}
            </div>
          ) : null}

          <div className="flex gap-[6px] flex-wrap mt-[2px]">
            {entry.blocks && (
              <button onClick={() => onRestore(entry)}
                style={{ borderColor: char.color + '60', color: char.color }}
                className="border rounded-[5px] px-[9px] py-[4px] text-[10px] font-mono cursor-pointer bg-transparent">
                ↩ {lang === 'ja' ? 'ブロックを復元' : 'Restore blocks'}
              </button>
            )}
            <button onClick={doCopy}
              className="border border-dim rounded-[5px] px-[9px] py-[4px] text-[10px] font-mono cursor-pointer text-muted bg-transparent">
              {copied ? '✓' : '📋'} {lang === 'ja' ? 'コピー' : 'Copy'}
            </button>
            {editMode ? (
              <>
                <button
                  onClick={() => { onEdit({ ...entry, title: editTitle, memo: editMemo }); setEditMode(false); }}
                  style={{ background: char.color, color: '#000' }}
                  className="border-none rounded-[5px] px-[9px] py-[4px] text-[10px] font-bold cursor-pointer">
                  {lang === 'ja' ? '保存' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditMode(false); setEditTitle(entry.title || ''); setEditMemo(entry.memo || ''); }}
                  className="border border-dim rounded-[5px] px-[9px] py-[4px] text-[10px] font-mono cursor-pointer text-muted bg-transparent">
                  {lang === 'ja' ? 'キャンセル' : 'Cancel'}
                </button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)}
                className="border border-dim rounded-[5px] px-[9px] py-[4px] text-[10px] font-mono cursor-pointer text-muted bg-transparent">
                ✏️ {lang === 'ja' ? '編集' : 'Edit'}
              </button>
            )}
            <button
              onClick={() => { if (window.confirm(lang === 'ja' ? 'このログを削除しますか？' : 'Delete this log entry?')) onDelete(entry.id); }}
              className="border border-dim rounded-[5px] px-[9px] py-[4px] text-[10px] font-mono cursor-pointer text-muted bg-transparent ml-auto">
              🗑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
