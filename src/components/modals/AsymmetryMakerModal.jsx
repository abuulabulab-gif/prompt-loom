import { useState } from "react";
import { ASYM_GROUPS, groupAsymByBlock } from "../../data/asymmetry.js";
import { hasTag } from "../../data/constants.js";

const chipCls = (active) =>
  `rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono ${active ? 'font-bold border' : 'bg-surfalt border border-line text-fg'}`;

export default function AsymmetryMakerModal({ lang, blocks, onApply, onClose }) {
  const [selected, setSelected] = useState(() => new Set());
  const ja = lang === 'ja';

  const textOf = (blockId) => blocks?.find(b => b.id === blockId)?.text ?? '';
  const nameOf = (blockId) => blocks?.find(b => b.id === blockId)?.[ja ? 'name' : 'nameEn'] ?? blockId;

  const toggle = (en) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(en) ? next.delete(en) : next.add(en);
      return next;
    });
  };

  // 既にブロックに入っているものは除いて適用（純粋な新規追加分のみ）
  const byBlock = groupAsymByBlock(selected);
  const pairs = [...byBlock.entries()]
    .map(([blockId, ens]) => ({ blockId, tags: ens.filter(en => !hasTag(textOf(blockId), en)) }))
    .filter(p => p.tags.length);
  const totalToAdd = pairs.reduce((n, p) => n + p.tags.length, 0);

  const handleApply = () => {
    if (!totalToAdd) return;
    onApply(pairs);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[27.5rem] max-h-[88vh] overflow-y-auto p-[1.125rem]">

        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-fg text-sm font-bold">🌓 {ja ? '左右メーカー' : 'Asymmetry Maker'}</span>
          <button onClick={onClose} className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
            {ja ? '閉じる' : 'Close'}
          </button>
        </div>

        <div className="text-dim text-[0.625rem] font-mono mb-3 leading-relaxed">
          {ja
            ? '「片方だけ・左右で丈違い・左右別デザイン」を部位ごとに選択（複数可）。それぞれの持ち場のブロックに入ります。'
            : 'Pick single / uneven-length / mismatched asymmetry per body zone (multi-select). Tags go to their home blocks.'}
        </div>

        {/* Groups */}
        {ASYM_GROUPS.map(group => (
          <div key={group.id} className="mb-3">
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {ja ? group.label.ja : group.label.en}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem]">
              {group.items.map(it => {
                const active  = selected.has(it.en);
                const already = hasTag(textOf(it.block || group.block), it.en);
                return (
                  <button key={it.en}
                    onClick={() => toggle(it.en)}
                    title={it.en}
                    style={active ? { background: group.acc + '22', borderColor: group.acc, color: group.acc } : {}}
                    className={chipCls(active)}>
                    {ja ? it.ja : it.en}
                    {already && <span className="ml-1 text-[0.5rem] opacity-60">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Preview（入れ先ブロックごと） */}
        <div className={`bg-bg border border-line rounded-lg p-3 mb-3.5 ${totalToAdd ? '' : 'opacity-40'}`}>
          <div className="text-muted text-[0.5625rem] font-mono mb-[0.1875rem]">
            {ja ? '追加されるタグ（入れ先ごと）' : 'Tags to add (per block)'}
          </div>
          {totalToAdd ? pairs.map(p => (
            <div key={p.blockId} className="mb-1">
              <span className="text-muted text-[0.625rem] font-mono mr-1.5">{nameOf(p.blockId)}:</span>
              <code className="text-prompt text-[0.8125rem] font-mono break-all">{p.tags.join(', ')}</code>
            </div>
          )) : (
            <code className="text-prompt text-[0.8125rem] font-mono">{ja ? '← 左右の崩しを選んでください' : '← Select asymmetry above'}</code>
          )}
        </div>

        <button onClick={handleApply} disabled={!totalToAdd}
          className="w-full border-none rounded-[0.5625rem] py-[0.6875rem] text-white text-[0.8125rem] font-bold tracking-[0.03em] bg-[linear-gradient(135deg,#60a5fa,#7c3aed)]"
          style={{ opacity: totalToAdd ? 1 : 0.45, cursor: totalToAdd ? 'pointer' : 'not-allowed' }}>
          + {totalToAdd
            ? (ja ? `${pairs.length}ブロックに${totalToAdd}件追加` : `Add ${totalToAdd} to ${pairs.length} block${pairs.length > 1 ? 's' : ''}`)
            : (ja ? '左右の崩しを選んでください' : 'Select asymmetry')}
        </button>
        <div className="text-dim text-[0.625rem] font-mono text-center mt-2">
          {ja ? '※ 元の衣装には上書きされず重ねて追記されます' : '※ Layered onto the base outfit (no overwrite)'}
        </div>
      </div>
    </div>
  );
}
