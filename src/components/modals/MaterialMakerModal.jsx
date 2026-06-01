import { useState } from "react";
import { MATERIAL_PALETTE, MATERIAL_TARGETS, buildMaterialTag } from "../../data/materials.js";
import { hasTag, appendTag, removeTag } from "../../data/constants.js";

// 素材グループ定義（色・アクセントカラー付き）
const MAT_GROUPS = [
  {
    label: { ja: '光沢・高級',    en: 'Luxury'        },
    color: '#f59e0b',
    ids:   ['silk','satin','velvet'],
  },
  {
    label: { ja: 'レース・装飾',  en: 'Lace & Trim'   },
    color: '#ec4899',
    ids:   ['lace','lace-trimmed','embroidered','sequined'],
  },
  {
    label: { ja: '特殊素材',      en: 'Special'       },
    color: '#78716c',
    ids:   ['leather','fur','knit','mesh'],
  },
  {
    label: { ja: '透け・条件付き', en: 'Sheer & Adult' },
    color: '#64748b',
    ids:   ['sheer','fishnet','latex'],
  },
];

function getBlockText(blocks, id) {
  return blocks?.find(b => b.id === id)?.text || '';
}

function resolveBlockId(target, outfitText, featureText) {
  if ([...target.triggers].some(k => hasTag(outfitText, k))) return 'outfit';
  if ([...target.triggers].some(k => hasTag(featureText, k))) return 'feature';
  return null;
}

export default function MaterialMakerModal({ lang, blocks, onApply, onClose }) {
  const [selectedMat, setSelectedMat] = useState(null);

  const outfitText  = getBlockText(blocks, 'outfit');
  const featureText = getBlockText(blocks, 'feature');

  const ja = lang === 'ja';

  // 選択中素材のオブジェクト
  const matObj = selectedMat
    ? MATERIAL_PALETTE.find(m => m.en === selectedMat)
    : null;

  // 選択中素材が使える部位（現在の衣装に合うもの）
  const availableTargets = selectedMat
    ? MATERIAL_TARGETS.filter(t => {
        const bId = resolveBlockId(t, outfitText, featureText);
        if (!bId) return false;
        if (t.combinable && !t.combinable.has(selectedMat)) return false;
        return true;
      }).map(t => ({
        ...t,
        blockId: resolveBlockId(t, outfitText, featureText),
      }))
    : [];

  const currentText = (blockId) =>
    blockId === 'outfit' ? outfitText : featureText;

  const handleTarget = (target) => {
    const tag  = buildMaterialTag(selectedMat, target.en);
    const bId  = target.blockId;
    const text = currentText(bId);
    const next = hasTag(text, tag) ? removeTag(text, tag) : appendTag(text, tag, '1.0');
    onApply(next, bId);
  };

  const isApplied = (target) => {
    if (!selectedMat) return false;
    const tag  = buildMaterialTag(selectedMat, target.en);
    return hasTag(currentText(target.blockId), tag);
  };

  // 全体の適用済みタグ数（バッジ表示用）
  const appliedCount = MATERIAL_TARGETS.reduce((n, t) => {
    const bId = resolveBlockId(t, outfitText, featureText);
    if (!bId) return n;
    return n + MATERIAL_PALETTE.filter(m =>
      hasTag(currentText(bId), buildMaterialTag(m.en, t.en))
    ).length;
  }, 0);

  const noOutfit = !outfitText && !featureText;

  return (
    <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4"
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[28rem] max-h-[88vh] overflow-y-auto p-[1.125rem]">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-fg text-sm font-bold">🧵 {ja ? 'マテリアルメーカー' : 'Material Maker'}</span>
            {appliedCount > 0 && (
              <span className="text-[0.5625rem] font-mono font-bold px-[0.3125rem] py-0.5 rounded"
                style={{ background: 'rgb(var(--c-teal) / 0.12)', border: '1px solid rgb(var(--c-teal) / 0.35)', color: 'rgb(var(--c-teal))' }}>
                ✓ {appliedCount}
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
            {ja ? '閉じる' : 'Close'}
          </button>
        </div>

        {noOutfit ? (
          <p className="text-muted text-xs text-center py-6">
            {ja ? '衣装ブロックにタグを追加してから使用してください' : 'Add tags to the Outfit block first'}
          </p>
        ) : (
          <>
            {/* Step 1: 素材を選ぶ */}
            <div className="mb-1">
              <div className="text-[0.5625rem] font-mono text-muted tracking-widest uppercase mb-2">
                {ja ? 'Step 1 — 素材を選ぶ' : 'Step 1 — Pick a material'}
              </div>
              {MAT_GROUPS.map(group => {
                const mats = group.ids
                  .map(id => MATERIAL_PALETTE.find(m => m.en === id))
                  .filter(Boolean);
                return (
                  <div key={group.label.ja} className="mb-3">
                    <div className="text-[0.5625rem] font-mono mb-1.5 font-bold"
                      style={{ color: group.color }}>
                      {ja ? group.label.ja : group.label.en}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {mats.map(mat => {
                        const active = selectedMat === mat.en;
                        return (
                          <button key={mat.en}
                            onClick={() => setSelectedMat(active ? null : mat.en)}
                            style={active
                              ? { background: group.color + '22', borderColor: group.color, color: group.color }
                              : {}}
                            className={`rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono transition-colors
                              ${active ? 'font-bold border' : 'bg-surfalt border border-line text-fg hover:border-muted'}
                              ${mat.adult ? 'opacity-75' : ''}`}>
                            {ja ? mat.ja : mat.en}
                            {mat.adult && <span className="ml-0.5 text-[0.5rem] opacity-60">▲</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 2: 部位を選ぶ */}
            <div className="border-t border-line pt-3 mt-1">
              <div className="text-[0.5625rem] font-mono text-muted tracking-widest uppercase mb-2">
                {ja ? 'Step 2 — 適用する部位を選ぶ' : 'Step 2 — Pick target parts'}
              </div>
              {!selectedMat ? (
                <p className="text-muted text-xs py-2">
                  {ja ? '↑ 素材を選ぶと適用できる部位が表示されます' : '↑ Select a material to see available targets'}
                </p>
              ) : availableTargets.length === 0 ? (
                <p className="text-muted text-xs py-2">
                  {ja ? `この素材を適用できる衣装タグが見当たりません` : `No outfit tags found that accept ${selectedMat}`}
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {availableTargets.map(target => {
                    const applied  = isApplied(target);
                    const tagLabel = buildMaterialTag(
                      matObj ? (ja ? matObj.ja : matObj.en) : selectedMat,
                      ja ? target.ja : target.en
                    );
                    return (
                      <button key={target.id}
                        onClick={() => handleTarget(target)}
                        style={applied
                          ? { background: (MAT_GROUPS.find(g => g.ids.includes(selectedMat))?.color ?? '#6c8fff') + '22',
                              borderColor: MAT_GROUPS.find(g => g.ids.includes(selectedMat))?.color ?? '#6c8fff',
                              color:       MAT_GROUPS.find(g => g.ids.includes(selectedMat))?.color ?? '#6c8fff' }
                          : {}}
                        className={`rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono transition-colors
                          ${applied ? 'font-bold border' : 'bg-surfalt border border-line text-fg hover:border-muted'}`}
                        title={buildMaterialTag(selectedMat, target.en)}>
                        {applied ? '✓ ' : ''}{tagLabel}
                        <span className="ml-1 text-[0.5rem] opacity-50">
                          ({target.blockId === 'feature' ? (ja ? '衣装D' : 'Detail') : (ja ? '衣装' : 'Outfit')})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 凡例 */}
            <p className="text-[0.5rem] text-dim mt-3">
              {ja ? '▲ = 成人向け素材。例: silk skirt / leather jacket / lace stockings' : '▲ = Adult-oriented material. e.g. silk skirt / leather jacket'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
