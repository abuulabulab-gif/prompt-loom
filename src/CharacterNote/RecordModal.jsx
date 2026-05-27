import { useState } from "react";
import { uid } from "../data/constants.js";
import { TOOLS } from "../data/tools.js";

export default function RecordModal({ char, lang, activeTool, posText, negText, existingLabels = [], onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [tool, setTool] = useState(activeTool || 'general');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState([]);
  const [memo, setMemo] = useState('');

  const addLabel = () => {
    const t = labelInput.trim();
    if (!t || labels.includes(t)) return;
    setLabels(prev => [...prev, t]);
    setLabelInput('');
  };

  const handleSave = () => {
    const slimBlocks = char.blocks.map(b => { const { cats, lastRandomPicks, ...r } = b; return r; });
    onSave({
      id: uid(), ts: Date.now(),
      title: title.trim(), tool, labels,
      posText, negText,
      memo: memo.trim(),
      blocks: slimBlocks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface border border-linebright rounded-xl p-5 w-[26.25rem] max-w-[92vw] shadow-xl">
        <div className="text-fg text-[0.8125rem] font-bold mb-3.5">
          📋 {lang === 'ja' ? 'プロンプトを記録' : 'Record Prompt'}
        </div>

        <label className="text-muted text-[0.625rem] font-mono font-semibold block mb-[0.1875rem] uppercase tracking-[0.08em]">
          {lang === 'ja' ? 'タイトル' : 'Title'}
        </label>
        <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
          placeholder={lang === 'ja' ? '例: 壁紙用・巫女衣装' : 'e.g. Wallpaper - shrine maiden'}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
          style={{ borderColor: char.color + '50' }}
          className="w-full bg-bg border rounded-md text-xs px-[0.5625rem] py-1.5 font-mono text-fg outline-none mb-2.5" />

        <label className="text-muted text-[0.625rem] font-mono font-semibold block mb-[0.1875rem] uppercase tracking-[0.08em]">
          {lang === 'ja' ? 'ツール' : 'Tool'}
        </label>
        <select value={tool} onChange={e => setTool(e.target.value)}
          className="w-full bg-bg border border-line rounded-md text-xs px-[0.5625rem] py-[0.3125rem] font-mono text-fg outline-none cursor-pointer mb-2.5">
          {TOOLS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <label className="text-muted text-[0.625rem] font-mono font-semibold block mb-[0.1875rem] uppercase tracking-[0.08em]">
          {lang === 'ja' ? 'ラベル' : 'Labels'}
        </label>
        <div className="flex gap-[0.3125rem] flex-wrap mb-[0.3125rem]">
          {labels.map((l, i) => (
            <span key={i}
              style={{ background: char.color + '22', border: `1px solid ${char.color}60`, color: char.color }}
              className="text-[0.625rem] font-mono px-[0.4375rem] py-0.5 rounded flex items-center gap-1">
              {l}
              <button onClick={() => setLabels(prev => prev.filter((_, j) => j !== i))}
                className="bg-transparent border-none cursor-pointer text-[0.5625rem] leading-none">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-[0.3125rem] mb-[0.3125rem]">
          <input value={labelInput} onChange={e => setLabelInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } }}
            placeholder={lang === 'ja' ? 'ラベル追加...' : 'Add label...'}
            className="flex-1 bg-bg border border-line rounded-[0.3125rem] text-[0.6875rem] px-[0.4375rem] py-1 font-mono text-fg outline-none" />
          <button onClick={addLabel}
            style={{ background: char.color, color: '#000' }}
            className="border-none rounded-[0.3125rem] px-2.5 text-xs font-bold cursor-pointer">+</button>
        </div>
        {existingLabels.filter(l => !labels.includes(l)).length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2.5">
            {existingLabels.filter(l => !labels.includes(l)).map(l => (
              <button key={l} onClick={() => setLabels(prev => [...prev, l])}
                className="text-[0.625rem] font-mono px-1.5 py-[0.0625rem] rounded border border-dim text-dim cursor-pointer bg-transparent">
                + {l}
              </button>
            ))}
          </div>
        )}

        <label className="text-muted text-[0.625rem] font-mono font-semibold block mb-[0.1875rem] uppercase tracking-[0.08em]">
          {lang === 'ja' ? 'メモ' : 'Notes'}
        </label>
        <textarea value={memo} onChange={e => setMemo(e.target.value)}
          placeholder={lang === 'ja' ? '気づき・改善点など...' : 'Notes, impressions...'}
          className="w-full bg-bg border border-line rounded-md text-xs px-[0.5625rem] py-1.5 font-mono text-fg outline-none resize-none min-h-[3.75rem] leading-[1.7] mb-2.5" />

        <div className="text-muted text-[0.625rem] font-mono mb-3.5">
          {lang === 'ja' ? '※ 現在のブロック設定も保存されます（復元可能）' : '※ Current block settings will be saved (restorable)'}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}
            className="border border-dim rounded-[0.4375rem] px-3.5 py-1.5 text-[0.6875rem] text-muted cursor-pointer bg-transparent">
            {lang === 'ja' ? 'キャンセル' : 'Cancel'}
          </button>
          <button onClick={handleSave}
            style={{ background: char.color, color: '#000' }}
            className="border-none rounded-[0.4375rem] px-3.5 py-1.5 text-[0.6875rem] font-bold cursor-pointer">
            {lang === 'ja' ? '保存' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
