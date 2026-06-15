import { useState } from "react";
import { CUTOUT_GROUPS, CUTOUT_TARGET_BLOCK } from "../../data/cutouts.js";
import { hasTag } from "../../data/constants.js";

const chipCls = (active) =>
  `rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono ${active ? 'font-bold border' : 'bg-surfalt border border-line text-fg'}`;

export default function CutoutMakerModal({ lang, blocks, onApply, onClose }) {
  const [selected, setSelected] = useState(() => new Set());
  const ja = lang === 'ja';

  const detailBlock = blocks?.find(b => b.id === CUTOUT_TARGET_BLOCK);
  const detailText  = detailBlock?.text ?? '';
  const blockName   = detailBlock?.[ja ? 'name' : 'nameEn'] ?? CUTOUT_TARGET_BLOCK;

  const toggle = (en) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(en) ? next.delete(en) : next.add(en);
      return next;
    });
  };

  // 既にブロックに入っているものは除いて適用（純粋な新規追加分のみ）
  const toAdd = [...selected].filter(en => !hasTag(detailText, en));
  const handleApply = () => {
    if (!toAdd.length) return;
    onApply(toAdd);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[27.5rem] max-h-[88vh] overflow-y-auto p-[1.125rem]">

        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-fg text-sm font-bold">✂️ {ja ? 'カットメーカー' : 'Cutout Maker'}</span>
          <button onClick={onClose} className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
            {ja ? '閉じる' : 'Close'}
          </button>
        </div>

        <div className="text-dim text-[0.625rem] font-mono mb-3 leading-relaxed">
          {ja
            ? '元の衣装の上に重ねるカット・変形ディテールを選択（複数可）。'
            : 'Pick cut & silhouette details to layer over the base outfit (multi-select).'}
        </div>

        {/* Groups */}
        {CUTOUT_GROUPS.map(group => (
          <div key={group.id} className="mb-3">
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {ja ? group.label.ja : group.label.en}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem]">
              {group.items.map(it => {
                const active  = selected.has(it.en);
                const already = hasTag(detailText, it.en);
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

        {/* Preview */}
        <div className={`bg-bg border border-line rounded-lg p-3 mb-3.5 ${toAdd.length ? '' : 'opacity-40'}`}>
          <div className="text-muted text-[0.5625rem] font-mono mb-[0.1875rem]">
            {ja ? '追加されるタグ' : 'Tags to add'}
          </div>
          <code className="text-prompt text-[0.8125rem] font-mono break-all">
            {toAdd.length ? toAdd.join(', ') : (ja ? '← カットを選んでください' : '← Select cutouts above')}
          </code>
        </div>

        <button onClick={handleApply} disabled={!toAdd.length}
          className="w-full border-none rounded-[0.5625rem] py-[0.6875rem] text-white text-[0.8125rem] font-bold tracking-[0.03em] bg-[linear-gradient(135deg,#fb7185,#e11d48)]"
          style={{ opacity: toAdd.length ? 1 : 0.45, cursor: toAdd.length ? 'pointer' : 'not-allowed' }}>
          + {toAdd.length
            ? (ja ? `「${blockName}」に${toAdd.length}件追加` : `Add ${toAdd.length} to ${blockName}`)
            : (ja ? 'カットを選んでください' : 'Select cutouts')}
        </button>
        <div className="text-dim text-[0.625rem] font-mono text-center mt-2">
          {ja ? '※ 元の衣装には上書きされず重ねて追記されます' : '※ Layered onto the base outfit (no overwrite)'}
        </div>
      </div>
    </div>
  );
}
