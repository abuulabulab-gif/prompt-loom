import { countTags, fmtTime } from "../../data/constants.js";

export default function HistoryModal({ history, lang, onClose, onRestore, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black/85 z-[300] flex items-center justify-center p-5">
      <div className="bg-surface border border-linebright rounded-[14px] w-full max-w-[620px] max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-[18px] py-[14px] border-b border-line flex items-center justify-between">
          <span className="text-fg text-[14px] font-bold">📋 {lang === 'ja' ? 'プロンプト履歴' : 'Prompt History'}</span>
          <div className="flex gap-2 items-center">
            <span className="text-muted text-[11px] font-mono">{history.length}/20</span>
            <button onClick={onClose} className="bg-transparent border border-dim rounded-[6px] px-[10px] py-1 text-muted cursor-pointer text-[12px]">
              {lang === 'ja' ? '閉じる' : 'Close'}
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {history.length === 0 ? (
            <div className="text-muted text-center p-9 text-[12px] font-mono">
              {lang === 'ja' ? 'COPYまたは📸でここに保存されます' : 'Saved here when you press COPY or 📸'}
            </div>
          ) : history.map(h => (
            <div key={h.id} className="px-[18px] py-[11px] border-b border-line flex gap-[10px] items-start">
              <span className="text-[17px] flex-shrink-0">{h.charEmoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[7px] mb-1">
                  <span style={{ color: h.charColor }} className="text-[11px] font-bold">{h.charName}</span>
                  <span className="text-muted text-[10px] font-mono">{fmtTime(h.ts)}</span>
                  <span className="text-muted text-[10px] font-mono">{countTags(h.posText)}{lang === 'ja' ? 'タグ' : 't'}</span>
                  {h.isSnapshot && (
                    <span className="text-warn text-[9px] font-mono px-[5px] py-[1px] bg-warn/10 rounded">📸</span>
                  )}
                </div>
                <div className="text-prompt text-[11px] font-mono whitespace-nowrap overflow-hidden text-ellipsis bg-bg px-2 py-[5px] rounded-[5px] border border-line">
                  {h.posText || '(empty)'}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => onRestore(h)}
                  className="bg-[#4a6fff22] border border-[#4a6fff60] rounded-[5px] px-[9px] py-[3px] text-accent text-[11px] cursor-pointer font-mono font-bold">
                  {lang === 'ja' ? '復元' : 'Restore'}
                </button>
                <button onClick={() => onDelete(h.id)}
                  className="bg-transparent border border-dim rounded-[5px] px-[9px] py-[3px] text-muted text-[11px] cursor-pointer">×</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
