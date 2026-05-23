import { useState } from "react";
import { uid, deep } from "../data/constants.js";
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
    onSave({
      id: uid(), ts: Date.now(),
      title: title.trim(), tool, labels,
      posText, negText,
      memo: memo.trim(),
      blocks: deep(char.blocks),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface border border-linebright rounded-[12px] p-[20px] w-[420px] max-w-[92vw] shadow-xl">
        <div className="text-fg text-[13px] font-bold mb-[14px]">
          📋 {lang === 'ja' ? 'プロンプトを記録' : 'Record Prompt'}
        </div>

        <label className="text-muted text-[10px] font-mono font-semibold block mb-[3px] uppercase tracking-[0.08em]">
          {lang === 'ja' ? 'タイトル' : 'Title'}
        </label>
        <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
          placeholder={lang === 'ja' ? '例: 壁紙用・巫女衣装' : 'e.g. Wallpaper - shrine maiden'}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
          style={{ borderColor: char.color + '50' }}
          className="w-full bg-bg border rounded-[6px] text-[12px] px-[9px] py-[6px] font-mono text-fg outline-none mb-[10px]" />

        <label className="text-muted text-[10px] font-mono font-semibold block mb-[3px] uppercase tracking-[0.08em]">
          {lang === 'ja' ? 'ツール' : 'Tool'}
        </label>
        <select value={tool} onChange={e => setTool(e.target.value)}
          className="w-full bg-bg border border-line rounded-[6px] text-[12px] px-[9px] py-[5px] font-mono text-fg outline-none cursor-pointer mb-[10px]">
          {TOOLS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <label className="text-muted text-[10px] font-mono font-semibold block mb-[3px] uppercase tracking-[0.08em]">
          {lang === 'ja' ? 'ラベル' : 'Labels'}
        </label>
        <div className="flex gap-[5px] flex-wrap mb-[5px]">
          {labels.map((l, i) => (
            <span key={i}
              style={{ background: char.color + '22', border: `1px solid ${char.color}60`, color: char.color }}
              className="text-[10px] font-mono px-[7px] py-[2px] rounded-[4px] flex items-center gap-[4px]">
              {l}
              <button onClick={() => setLabels(prev => prev.filter((_, j) => j !== i))}
                className="bg-transparent border-none cursor-pointer text-[9px] leading-none">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-[5px] mb-[5px]">
          <input value={labelInput} onChange={e => setLabelInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } }}
            placeholder={lang === 'ja' ? 'ラベル追加...' : 'Add label...'}
            className="flex-1 bg-bg border border-line rounded-[5px] text-[11px] px-[7px] py-[4px] font-mono text-fg outline-none" />
          <button onClick={addLabel}
            style={{ background: char.color, color: '#000' }}
            className="border-none rounded-[5px] px-[10px] text-[12px] font-bold cursor-pointer">+</button>
        </div>
        {existingLabels.filter(l => !labels.includes(l)).length > 0 && (
          <div className="flex gap-[4px] flex-wrap mb-[10px]">
            {existingLabels.filter(l => !labels.includes(l)).map(l => (
              <button key={l} onClick={() => setLabels(prev => [...prev, l])}
                className="text-[10px] font-mono px-[6px] py-[1px] rounded-[4px] border border-dim text-dim cursor-pointer bg-transparent">
                + {l}
              </button>
            ))}
          </div>
        )}

        <label className="text-muted text-[10px] font-mono font-semibold block mb-[3px] uppercase tracking-[0.08em]">
          {lang === 'ja' ? 'メモ' : 'Notes'}
        </label>
        <textarea value={memo} onChange={e => setMemo(e.target.value)}
          placeholder={lang === 'ja' ? '気づき・改善点など...' : 'Notes, impressions...'}
          className="w-full bg-bg border border-line rounded-[6px] text-[12px] px-[9px] py-[6px] font-mono text-fg outline-none resize-none min-h-[60px] leading-[1.7] mb-[10px]" />

        <div className="text-muted text-[10px] font-mono mb-[14px]">
          {lang === 'ja' ? '※ 現在のブロック設定も保存されます（復元可能）' : '※ Current block settings will be saved (restorable)'}
        </div>

        <div className="flex justify-end gap-[8px]">
          <button onClick={onClose}
            className="border border-dim rounded-[7px] px-[14px] py-[6px] text-[11px] text-muted cursor-pointer bg-transparent">
            {lang === 'ja' ? 'キャンセル' : 'Cancel'}
          </button>
          <button onClick={handleSave}
            style={{ background: char.color, color: '#000' }}
            className="border-none rounded-[7px] px-[14px] py-[6px] text-[11px] font-bold cursor-pointer">
            {lang === 'ja' ? '保存' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
