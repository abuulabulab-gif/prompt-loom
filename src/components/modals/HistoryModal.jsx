import { countTags, fmtTime } from "../../data/constants.js";

export default function HistoryModal({ history, lang, onClose, onRestore, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black/85 z-[300] flex items-center justify-center p-5">
      <div className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[38.75rem] max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-[1.125rem] py-3.5 border-b border-line flex items-center justify-between">
          <span className="text-fg text-sm font-bold">📋 {lang === 'ja' ? 'プロンプト履歴' : 'Prompt History'}</span>
          <div className="flex gap-2 items-center">
            <span className="text-muted text-[0.6875rem] font-mono">{history.length}/20</span>
            <button onClick={onClose} className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
              {lang === 'ja' ? '閉じる' : 'Close'}
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {history.length === 0 ? (
            <div className="text-muted text-center p-9 text-xs font-mono">
              {lang === 'ja' ? 'COPYまたは📸でここに保存されます' : 'Saved here when you press COPY or 📸'}
            </div>
          ) : history.map(h => (
            <div key={h.id} className="px-[1.125rem] py-[0.6875rem] border-b border-line flex gap-2.5 items-start">
              <span className="text-[1.0625rem] flex-shrink-0">{h.charEmoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[0.4375rem] mb-1">
                  <span style={{ color: h.charColor }} className="text-[0.6875rem] font-bold">{h.charName}</span>
                  <span className="text-muted text-[0.625rem] font-mono">{fmtTime(h.ts)}</span>
                  <span className="text-muted text-[0.625rem] font-mono">{countTags(h.posText)}{lang === 'ja' ? 'タグ' : 't'}</span>
                  {h.isSnapshot && (
                    <span className="text-warn text-[0.5625rem] font-mono px-[0.3125rem] py-[0.0625rem] bg-warn/10 rounded">📸</span>
                  )}
                </div>
                <div className="text-prompt text-[0.6875rem] font-mono whitespace-nowrap overflow-hidden text-ellipsis bg-bg px-2 py-[0.3125rem] rounded-[0.3125rem] border border-line">
                  {h.posText || '(empty)'}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => onRestore(h)}
                  className="bg-[#4a6fff22] border border-[#4a6fff60] rounded-[0.3125rem] px-[0.5625rem] py-[0.1875rem] text-accent text-[0.6875rem] cursor-pointer font-mono font-bold">
                  {lang === 'ja' ? '復元' : 'Restore'}
                </button>
                <button onClick={() => onDelete(h.id)}
                  className="bg-transparent border border-dim rounded-[0.3125rem] px-[0.5625rem] py-[0.1875rem] text-muted text-[0.6875rem] cursor-pointer">×</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
