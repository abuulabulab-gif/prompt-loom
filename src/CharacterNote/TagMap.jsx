import { useState } from "react";
import { uid, appendTag, splitTags } from "../data/constants.js";

const BLOCK_OPTIONS = [
  { id: 'face',        ja: '顔・髪',       en: 'Face / Hair' },
  { id: 'attribute',   ja: '属性',         en: 'Attribute' },
  { id: 'body',        ja: '体型',         en: 'Body' },
  { id: 'outfit',      ja: '衣装',         en: 'Outfit' },
  { id: 'feature',     ja: '特徴',         en: 'Feature' },
  { id: 'effect',      ja: 'エフェクト',   en: 'Effect' },
  { id: 'artstyle',    ja: 'アートスタイル', en: 'Art Style' },
  { id: 'composition', ja: '構図',         en: 'Composition' },
  { id: 'background',  ja: '背景',         en: 'Background' },
  { id: 'lighting',    ja: 'ライティング', en: 'Lighting' },
  { id: 'quality',     ja: '品質',         en: 'Quality' },
  { id: 'negative',    ja: 'ネガティブ',   en: 'Negative' },
];

export default function TagMap({ char, lang, onUpdate }) {
  const tagMap = char.tagMap || [];
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newBlock, setNewBlock] = useState('face');
  const [newNotes, setNewNotes] = useState('');
  const [insertedRow, setInsertedRow] = useState(null);

  const addRow = () => {
    if (!newLabel.trim()) return;
    onUpdate({ tagMap: [...tagMap, { id: uid(), label: newLabel.trim(), promptTags: newPrompt.trim(), targetBlock: newBlock, notes: newNotes.trim(), pinned: false }] });
    setNewLabel(''); setNewPrompt(''); setNewNotes('');
    setAdding(false);
  };

  const deleteRow = id => {
    if (!window.confirm(lang === 'ja' ? 'この行を削除しますか？' : 'Delete this row?')) return;
    onUpdate({ tagMap: tagMap.filter(r => r.id !== id) });
  };

  const updateRow = (id, upd) => onUpdate({ tagMap: tagMap.map(r => r.id === id ? { ...r, ...upd } : r) });

  const copyTags = row => {
    navigator.clipboard.writeText(row.promptTags);
  };

  const insertToBlock = row => {
    const tags = splitTags(row.promptTags);
    if (tags.length === 0) return;
    const blocks = char.blocks || [];
    const target = blocks.find(b => b.id === row.targetBlock);
    if (!target) return;
    let text = target.text;
    for (const tag of tags) text = appendTag(text, tag, target.strength || '1.0');
    onUpdate({ blocks: blocks.map(b => b.id === row.targetBlock ? { ...b, text } : b) });
    setInsertedRow(row.id);
    setTimeout(() => setInsertedRow(null), 1500);
  };

  const sorted = [...tagMap.filter(r => r.pinned), ...tagMap.filter(r => !r.pinned)];

  const blockLabel = id => {
    const b = BLOCK_OPTIONS.find(b => b.id === id);
    return b ? (lang === 'ja' ? b.ja : b.en) : id;
  };

  return (
    <div>
      <div className="flex items-center gap-[8px] mb-[11px]">
        <span className="text-fg text-[12px] font-bold">🔗 {lang === 'ja' ? 'タグ対応表' : 'Tag Map'}</span>
        <span className="text-muted text-[10px] font-mono font-semibold">{tagMap.length}{lang === 'ja' ? '件' : ' rows'}</span>
        <div className="flex-1" />
        <button onClick={() => setAdding(a => !a)}
          style={adding ? { background: char.color + '22', borderColor: char.color, color: char.color } : undefined}
          className={`rounded-[6px] px-[10px] py-[4px] text-[10px] font-mono cursor-pointer border ${adding ? 'font-bold' : 'border-dim text-muted'}`}>
          {adding ? `✕ ${lang === 'ja' ? 'キャンセル' : 'Cancel'}` : `＋ ${lang === 'ja' ? '行を追加' : 'Add row'}`}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-[12px] p-[12px] bg-bg border rounded-[8px]" style={{ borderColor: char.color + '40' }}>
          <div className="grid grid-cols-2 gap-[8px] mb-[7px]">
            <div>
              <div className="text-muted text-[10px] font-mono font-semibold mb-[3px]">{lang === 'ja' ? '設定（日本語）' : 'Setting label'}</div>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder={lang === 'ja' ? '例: 銀黒の長髪' : 'e.g. silver black hair'}
                className="w-full bg-surface border border-line rounded-[5px] text-[11px] px-[7px] py-[5px] font-mono text-fg outline-none" />
            </div>
            <div>
              <div className="text-muted text-[10px] font-mono font-semibold mb-[3px]">{lang === 'ja' ? 'プロンプトタグ' : 'Prompt tags'}</div>
              <input value={newPrompt} onChange={e => setNewPrompt(e.target.value)}
                placeholder="silver hair, long hair"
                className="w-full bg-surface border border-line rounded-[5px] text-[11px] px-[7px] py-[5px] font-mono text-fg outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[8px] mb-[9px]">
            <div>
              <div className="text-muted text-[10px] font-mono font-semibold mb-[3px]">{lang === 'ja' ? '対象ブロック' : 'Target block'}</div>
              <select value={newBlock} onChange={e => setNewBlock(e.target.value)}
                className="w-full bg-surface border border-line rounded-[5px] text-[11px] px-[7px] py-[5px] font-mono text-fg outline-none cursor-pointer">
                {BLOCK_OPTIONS.map(b => <option key={b.id} value={b.id}>{lang === 'ja' ? b.ja : b.en}</option>)}
              </select>
            </div>
            <div>
              <div className="text-muted text-[10px] font-mono font-semibold mb-[3px]">{lang === 'ja' ? '備考' : 'Notes'}</div>
              <input value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="—"
                className="w-full bg-surface border border-line rounded-[5px] text-[11px] px-[7px] py-[5px] font-mono text-fg outline-none" />
            </div>
          </div>
          <button onClick={addRow}
            style={{ background: char.color, color: '#000' }}
            className="border-none rounded-[6px] px-[14px] py-[5px] text-[11px] font-bold cursor-pointer">
            {lang === 'ja' ? '追加' : 'Add'}
          </button>
        </div>
      )}

      {tagMap.length === 0 ? (
        <div className="text-center py-[32px]">
          <div className="text-muted text-[11px] font-mono mb-[6px]">
            {lang === 'ja' ? '（まだ行がありません）' : '(no rows yet)'}
          </div>
          <div className="text-muted text-[10px] font-mono leading-[1.6]">
            {lang === 'ja'
              ? '設定上の表現（日本語）とプロンプトタグ（英語）を対応づけて管理できます'
              : 'Map character settings to prompt tags'}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line text-muted text-[10px] font-mono font-bold uppercase tracking-[0.07em]">
                <th className="text-left pb-[6px] w-[20px]" />
                <th className="text-left pb-[6px] pr-[10px] min-w-[110px]">{lang === 'ja' ? '設定' : 'Setting'}</th>
                <th className="text-left pb-[6px] pr-[10px] min-w-[160px]">{lang === 'ja' ? 'プロンプトタグ' : 'Prompt tags'}</th>
                <th className="text-left pb-[6px] pr-[10px] min-w-[70px]">{lang === 'ja' ? 'ブロック' : 'Block'}</th>
                <th className="text-left pb-[6px] pr-[10px]">{lang === 'ja' ? '備考' : 'Notes'}</th>
                <th className="pb-[6px] w-[60px]" />
              </tr>
            </thead>
            <tbody>
              {sorted.map(row => (
                <tr key={row.id} className="border-b border-line/40 group hover:bg-surfalt/50 transition-colors">
                  <td className="py-[5px] pr-[4px]">
                    <button onClick={() => updateRow(row.id, { pinned: !row.pinned })}
                      className={`bg-transparent border-none cursor-pointer text-[11px] transition-opacity ${row.pinned ? 'text-warn' : 'text-dim opacity-0 group-hover:opacity-100'}`}>
                      ★
                    </button>
                  </td>
                  <td className="py-[5px] pr-[10px]">
                    <input value={row.label} onChange={e => updateRow(row.id, { label: e.target.value })}
                      className="bg-transparent border-none outline-none text-fg text-[11px] font-mono w-full" />
                  </td>
                  <td className="py-[5px] pr-[10px]">
                    <input value={row.promptTags} onChange={e => updateRow(row.id, { promptTags: e.target.value })}
                      className="bg-transparent border-none outline-none text-prompt text-[11px] font-mono w-full" />
                  </td>
                  <td className="py-[5px] pr-[10px]">
                    <select value={row.targetBlock} onChange={e => updateRow(row.id, { targetBlock: e.target.value })}
                      className="bg-transparent border-none outline-none text-muted text-[10px] font-mono cursor-pointer w-full">
                      {BLOCK_OPTIONS.map(b => <option key={b.id} value={b.id}>{lang === 'ja' ? b.ja : b.en}</option>)}
                    </select>
                  </td>
                  <td className="py-[5px] pr-[10px]">
                    <input value={row.notes} onChange={e => updateRow(row.id, { notes: e.target.value })}
                      placeholder="—"
                      className="bg-transparent border-none outline-none text-muted text-[10px] font-mono w-full" />
                  </td>
                  <td className="py-[5px]">
                    <div className="flex gap-[4px] items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => insertToBlock(row)}
                        style={{ borderColor: char.color + '60', color: char.color }}
                        title={lang === 'ja' ? `「${blockLabel(row.targetBlock)}」ブロックに追加` : `Add to ${blockLabel(row.targetBlock)} block`}
                        className="border rounded-[4px] px-[6px] py-[2px] text-[10px] cursor-pointer bg-transparent font-mono font-semibold">
                        {insertedRow === row.id ? '✓' : '→'}
                      </button>
                      <button onClick={() => copyTags(row)}
                        style={{ borderColor: char.color + '60', color: char.color }}
                        title={lang === 'ja' ? 'タグをコピー' : 'Copy tags'}
                        className="border rounded-[4px] px-[6px] py-[2px] text-[10px] cursor-pointer bg-transparent font-mono">📋</button>
                      <button onClick={() => deleteRow(row.id)}
                        className="border border-dim rounded-[4px] px-[6px] py-[2px] text-[10px] cursor-pointer bg-transparent text-muted font-mono">✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-muted text-[10px] font-mono mt-[8px]">
            {lang === 'ja' ? '💡 行をクリックして直接編集。→でブロックに追加、📋でコピー、★でピン固定' : '💡 Click to edit inline. → inserts into block, 📋 copies, ★ pins to top'}
          </div>
        </div>
      )}
    </div>
  );
}
