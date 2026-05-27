import { useState } from "react";
import { TOOLS } from "../data/tools.js";

export default function PromptLogEntry({ entry, lang, char, onRestore, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title || '');
  const [editMemo, setEditMemo] = useState(entry.memo || '');
  const [editPosText, setEditPosText] = useState(entry.posText || '');
  const [editNegText, setEditNegText] = useState(entry.negText || '');
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
    <div className="border border-line rounded-lg mb-[0.4375rem] overflow-hidden">
      {/* Summary row */}
      <div className="px-3 py-2 bg-surfalt flex items-center gap-[0.4375rem] flex-wrap">
        <span className="text-muted text-[0.625rem] font-mono font-semibold flex-shrink-0">🕐 {fmtTs(entry.ts)}</span>

        {editMode ? (
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
            className="flex-1 bg-bg border border-line rounded text-[0.6875rem] px-1.5 py-0.5 font-mono text-fg outline-none min-w-[6.25rem]" />
        ) : (
          <span className="text-fg text-[0.6875rem] font-semibold flex-1 truncate min-w-0">
            {entry.title || <span className="text-dim italic font-normal">{lang === 'ja' ? '（タイトルなし）' : '(untitled)'}</span>}
          </span>
        )}

        {toolLabel && <span className="text-muted text-[0.625rem] font-mono font-semibold flex-shrink-0">{toolLabel}</span>}

        {entry.editedAt && (
          <span className="text-[0.5625rem] font-mono px-[0.3125rem] py-[0.0625rem] rounded-[0.1875rem] border border-dim/50 text-dim flex-shrink-0">
            {lang === 'ja' ? '編集済み' : 'Edited'}
          </span>
        )}

        {(entry.labels || []).map(l => (
          <span key={l}
            style={{ background: char.color + '20', border: `1px solid ${char.color}60`, color: char.color }}
            className="text-[0.625rem] font-mono font-semibold px-1.5 py-[0.0625rem] rounded flex-shrink-0">{l}</span>
        ))}

        <button onClick={() => setExpanded(e => !e)}
          className="bg-transparent border-none text-dim text-[0.625rem] font-mono cursor-pointer ml-auto flex-shrink-0">
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Collapsed preview */}
      {!expanded && entry.posText && (
        <div className="px-3 py-[0.3125rem] border-t border-line/50">
          <div className="text-prompt text-[0.625rem] font-mono truncate opacity-80">
            {entry.posText.slice(0, 100)}{entry.posText.length > 100 ? '…' : ''}
          </div>
        </div>
      )}

      {/* Expanded body */}
      {expanded && (
        <div className="px-3 py-2.5 border-t border-line/50">
          {(entry.posText || editMode) && (
            <div className="mb-2">
              <div className="text-muted text-[0.625rem] font-mono font-bold mb-[0.1875rem] uppercase tracking-[0.08em]">Positive</div>
              {editMode ? (
                <textarea value={editPosText} onChange={e => setEditPosText(e.target.value)}
                  className="w-full bg-bg border border-line rounded-[0.3125rem] text-[0.6875rem] px-2 py-1.5 font-mono text-prompt outline-none resize-y min-h-[3.75rem] leading-[1.6]" />
              ) : (
                <div className="text-prompt text-[0.6875rem] font-mono break-all leading-[1.6] bg-bg rounded-[0.3125rem] px-[0.5625rem] py-[0.4375rem] select-all">
                  {entry.posText}
                </div>
              )}
            </div>
          )}
          {(entry.negText || editMode) && (
            <div className="mb-2">
              <div className="text-muted text-[0.625rem] font-mono font-bold mb-[0.1875rem] uppercase tracking-[0.08em]">Negative</div>
              {editMode ? (
                <textarea value={editNegText} onChange={e => setEditNegText(e.target.value)}
                  className="w-full bg-bg border border-line rounded-[0.3125rem] text-[0.6875rem] px-2 py-1.5 font-mono text-muted outline-none resize-y min-h-10 leading-[1.6]" />
              ) : (
                <div className="text-muted text-[0.6875rem] font-mono break-all leading-[1.6] bg-bg rounded-[0.3125rem] px-[0.5625rem] py-[0.4375rem] select-all">
                  {entry.negText}
                </div>
              )}
            </div>
          )}

          {editMode ? (
            <textarea value={editMemo} onChange={e => setEditMemo(e.target.value)}
              placeholder={lang === 'ja' ? 'メモ...' : 'Notes...'}
              className="w-full bg-bg border border-line rounded-[0.3125rem] text-[0.6875rem] px-2 py-1.5 font-mono text-fg outline-none resize-none min-h-[3.125rem] mb-2 leading-[1.7]" />
          ) : entry.memo ? (
            <div className="mb-2 text-muted text-[0.6875rem] font-mono leading-[1.7] bg-bg rounded-[0.3125rem] px-[0.5625rem] py-[0.4375rem]">
              📝 {entry.memo}
            </div>
          ) : null}

          <div className="flex gap-1.5 flex-wrap mt-0.5">
            {entry.blocks && (
              <button onClick={() => onRestore(entry)}
                style={{ borderColor: char.color + '60', color: char.color }}
                className="border rounded-[0.3125rem] px-[0.5625rem] py-1 text-[0.625rem] font-mono cursor-pointer bg-transparent">
                ↩ {lang === 'ja' ? 'ブロックを復元' : 'Restore blocks'}
              </button>
            )}
            <button onClick={doCopy}
              className="border border-dim rounded-[0.3125rem] px-[0.5625rem] py-1 text-[0.625rem] font-mono cursor-pointer text-muted bg-transparent">
              {copied ? '✓' : '📋'} {lang === 'ja' ? 'コピー' : 'Copy'}
            </button>
            {editMode ? (
              <>
                <button
                  onClick={() => {
                    onEdit({ ...entry, title: editTitle, memo: editMemo, posText: editPosText, negText: editNegText, editedAt: Date.now() });
                    setEditMode(false);
                  }}
                  style={{ background: char.color, color: '#000' }}
                  className="border-none rounded-[0.3125rem] px-[0.5625rem] py-1 text-[0.625rem] font-bold cursor-pointer">
                  {lang === 'ja' ? '保存' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditTitle(entry.title || '');
                    setEditMemo(entry.memo || '');
                    setEditPosText(entry.posText || '');
                    setEditNegText(entry.negText || '');
                  }}
                  className="border border-dim rounded-[0.3125rem] px-[0.5625rem] py-1 text-[0.625rem] font-mono cursor-pointer text-muted bg-transparent">
                  {lang === 'ja' ? 'キャンセル' : 'Cancel'}
                </button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)}
                className="border border-dim rounded-[0.3125rem] px-[0.5625rem] py-1 text-[0.625rem] font-mono cursor-pointer text-muted bg-transparent">
                ✏️ {lang === 'ja' ? '編集' : 'Edit'}
              </button>
            )}
            <button
              onClick={() => { if (window.confirm(lang === 'ja' ? 'このログを削除しますか？' : 'Delete this log entry?')) onDelete(entry.id); }}
              className="border border-dim rounded-[0.3125rem] px-[0.5625rem] py-1 text-[0.625rem] font-mono cursor-pointer text-muted bg-transparent ml-auto">
              🗑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
