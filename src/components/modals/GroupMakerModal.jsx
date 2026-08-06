import { useState } from "react";
import { hasTag } from "../../data/constants.js";

// ── 汎用グループメーカー（2026-08-06 共通化） ─────────────────────────
// カットメーカー・左右メーカーの同型2枚を1枚に畳んだ器。
// 「グループ→チップ複数選択→入れ先ごとのプレビュー→一括適用」の型を、
// config（データ側）だけで新しいメーカーにできる＝3枚目（柄メーカー等）はタダ。
//
// config = {
//   icon, ja, en                  … タイトル（例: '✂️', 'カットメーカー', 'Cutout Maker'）
//   introJa, introEn              … 説明1行
//   gradient                      … 適用ボタンの背景（CSS gradient文字列）
//   defaultBlock                  … グループ/アイテムにblock指定が無い時の入れ先
//   groups: [{ id, label:{ja,en}, acc, block?, items:[{ en, ja, block? }] }]
// }
// onApply(pairs) … pairs = [{ blockId, tags: [en, ...] }]（入れ先ブロックごと）

const chipCls = (active) =>
  `rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono ${active ? 'font-bold border' : 'bg-surfalt border border-line text-fg'}`;

export default function GroupMakerModal({ lang, blocks, config, onApply, onClose }) {
  const [selected, setSelected] = useState(() => new Set());
  const ja = lang === 'ja';

  const blockOf = (it, g) => it.block || g.block || config.defaultBlock;
  const textOf = (blockId) => blocks?.find(b => b.id === blockId)?.text ?? '';
  const nameOf = (blockId) => blocks?.find(b => b.id === blockId)?.[ja ? 'name' : 'nameEn'] ?? blockId;

  const toggle = (en) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(en) ? next.delete(en) : next.add(en);
      return next;
    });
  };

  // 選択タグを入れ先ブロックごとにまとめ、既に入っている物は除く（純粋な新規追加分のみ）
  const byBlock = new Map();
  for (const g of config.groups) {
    for (const it of g.items) {
      if (!selected.has(it.en)) continue;
      const blockId = blockOf(it, g);
      if (hasTag(textOf(blockId), it.en)) continue;
      if (!byBlock.has(blockId)) byBlock.set(blockId, []);
      byBlock.get(blockId).push(it.en);
    }
  }
  const pairs = [...byBlock.entries()].map(([blockId, tags]) => ({ blockId, tags }));
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
          <span className="text-fg text-sm font-bold">{config.icon} {ja ? config.ja : config.en}</span>
          <button onClick={onClose} className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
            {ja ? '閉じる' : 'Close'}
          </button>
        </div>

        <div className="text-dim text-[0.625rem] font-mono mb-3 leading-relaxed">
          {ja ? config.introJa : config.introEn}
        </div>

        {/* Groups */}
        {config.groups.map(group => (
          <div key={group.id} className="mb-3">
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {ja ? group.label.ja : group.label.en}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem]">
              {group.items.map(it => {
                const active  = selected.has(it.en);
                const already = hasTag(textOf(blockOf(it, group)), it.en);
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
            {ja ? '追加されるタグ' : 'Tags to add'}
          </div>
          {totalToAdd ? pairs.map(p => (
            <div key={p.blockId} className="mb-1">
              {pairs.length > 1 && <span className="text-muted text-[0.625rem] font-mono mr-1.5">{nameOf(p.blockId)}:</span>}
              <code className="text-prompt text-[0.8125rem] font-mono break-all">{p.tags.join(', ')}</code>
            </div>
          )) : (
            <code className="text-prompt text-[0.8125rem] font-mono">{ja ? '← 上から選んでください' : '← Select above'}</code>
          )}
        </div>

        <button onClick={handleApply} disabled={!totalToAdd}
          className="w-full border-none rounded-[0.5625rem] py-[0.6875rem] text-white text-[0.8125rem] font-bold tracking-[0.03em]"
          style={{ background: config.gradient, opacity: totalToAdd ? 1 : 0.45, cursor: totalToAdd ? 'pointer' : 'not-allowed' }}>
          + {totalToAdd
            ? (pairs.length === 1
                ? (ja ? `「${nameOf(pairs[0].blockId)}」に${totalToAdd}件追加` : `Add ${totalToAdd} to ${nameOf(pairs[0].blockId)}`)
                : (ja ? `${pairs.length}ブロックに${totalToAdd}件追加` : `Add ${totalToAdd} to ${pairs.length} blocks`))
            : (ja ? '上から選んでください' : 'Select above')}
        </button>
        <div className="text-dim text-[0.625rem] font-mono text-center mt-2">
          {ja ? '※ 元の衣装には上書きされず重ねて追記されます' : '※ Layered onto the base outfit (no overwrite)'}
        </div>
      </div>
    </div>
  );
}
