import { useState } from "react";
import { MATERIAL_PALETTE, MATERIAL_TARGETS, buildMaterialTag } from "../../data/materials.js";
import { hasTag, appendTag, removeTag } from "../../data/constants.js";

const ACCENT = '#6c8fff';

// 素材グループ（アクセントカラー付き）
const MAT_GROUPS = [
  { label: { ja: '光沢・高級',    en: 'Luxury'        }, acc: '#f59e0b', ids: ['silk','satin','velvet'] },
  { label: { ja: 'レース・装飾',  en: 'Lace & Trim'   }, acc: '#ec4899', ids: ['lace','lace-trimmed','embroidered','sequined'] },
  { label: { ja: '特殊素材',      en: 'Special'       }, acc: '#78716c', ids: ['leather','fur','knit','mesh'] },
  { label: { ja: '透け・条件付き', en: 'Sheer & Adult' }, acc: '#64748b', ids: ['sheer','fishnet','latex'] },
];

const chipCls = (active) =>
  `rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono transition-colors ${active ? 'font-bold border' : 'bg-surfalt border border-line text-fg'}`;

function getBlockText(blocks, id) { return blocks?.find(b => b.id === id)?.text || ''; }

function resolveBlockId(target, outfitText, featureText) {
  if ([...target.triggers].some(k => hasTag(outfitText,  k))) return 'outfit';
  if ([...target.triggers].some(k => hasTag(featureText, k))) return 'feature';
  return null;
}

function groupOf(matEn) { return MAT_GROUPS.find(g => g.ids.includes(matEn)); }

export default function MaterialMakerModal({ lang, blocks, onApply, onClose }) {
  const [selectedMat, setSelectedMat] = useState(null);

  const outfitText  = getBlockText(blocks, 'outfit');
  const featureText = getBlockText(blocks, 'feature');
  const ja = lang === 'ja';

  const acc = groupOf(selectedMat)?.acc ?? ACCENT;

  // Step 2: 現在の衣装に合う部位
  const availableTargets = selectedMat
    ? MATERIAL_TARGETS.filter(t => {
        const bId = resolveBlockId(t, outfitText, featureText);
        if (!bId) return false;
        if (t.combinable && !t.combinable.has(selectedMat)) return false;
        return true;
      }).map(t => ({ ...t, blockId: resolveBlockId(t, outfitText, featureText) }))
    : [];

  const currentText = (bId) => bId === 'outfit' ? outfitText : featureText;
  const isApplied = (t) => selectedMat ? hasTag(currentText(t.blockId), buildMaterialTag(selectedMat, t.en)) : false;

  const handleTarget = (target) => {
    const tag  = buildMaterialTag(selectedMat, target.en);
    const bId  = target.blockId;
    const text = currentText(bId);
    onApply(hasTag(text, tag) ? removeTag(text, tag) : appendTag(text, tag, '1.0'), bId);
  };

  // 全適用済みタグの一覧（プレビュー用）
  const appliedTags = MATERIAL_TARGETS.flatMap(t => {
    const bId = resolveBlockId(t, outfitText, featureText);
    if (!bId) return [];
    return MATERIAL_PALETTE
      .filter(m => hasTag(currentText(bId), buildMaterialTag(m.en, t.en)))
      .map(m => buildMaterialTag(m.en, t.en));
  });

  const noOutfit = !outfitText && !featureText;
  const previewTag = selectedMat && availableTargets.length > 0
    ? buildMaterialTag(selectedMat, availableTargets[0].en)
    : null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[27.5rem] max-h-[88vh] overflow-y-auto p-[1.125rem]">

        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-fg text-sm font-bold">🧵 {ja ? 'マテリアルメーカー' : 'Material Maker'}</span>
          <button onClick={onClose} className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
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
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {ja ? '① 素材を選ぶ' : '① Pick a material'}
            </div>
            {MAT_GROUPS.map(group => {
              const mats = group.ids.map(id => MATERIAL_PALETTE.find(m => m.en === id)).filter(Boolean);
              return (
                <div key={group.label.ja} className="mb-3.5">
                  <div className="text-[0.5625rem] font-mono mb-1 font-bold" style={{ color: group.acc }}>
                    {ja ? group.label.ja : group.label.en}
                  </div>
                  <div className="flex flex-wrap gap-[0.3125rem]">
                    {mats.map(mat => {
                      const active = selectedMat === mat.en;
                      return (
                        <button key={mat.en}
                          onClick={() => setSelectedMat(active ? null : mat.en)}
                          style={active ? { background: group.acc+'22', borderColor: group.acc, color: group.acc } : {}}
                          className={`${chipCls(active)}${mat.adult ? ' opacity-75' : ''}`}>
                          {ja ? mat.ja : mat.en}
                          {mat.adult && <span className="ml-0.5 text-[0.5rem] opacity-60">▲</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Step 2: 部位を選ぶ */}
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {ja ? '② 適用する部位を選ぶ' : '② Pick target parts'}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem] mb-3.5 min-h-[2rem]">
              {!selectedMat ? (
                <span className="text-dim text-[0.625rem] font-mono self-center">
                  {ja ? '↑ 素材を選ぶと適用できる部位が表示されます' : '↑ Select a material to see available targets'}
                </span>
              ) : availableTargets.length === 0 ? (
                <span className="text-dim text-[0.625rem] font-mono self-center">
                  {ja ? 'この素材に対応する衣装タグが見当たりません' : `No outfit tags found for "${selectedMat}"`}
                </span>
              ) : (
                availableTargets.map(target => {
                  const applied = isApplied(target);
                  return (
                    <button key={target.id}
                      onClick={() => handleTarget(target)}
                      style={applied ? { background: acc+'22', borderColor: acc, color: acc } : {}}
                      className={chipCls(applied)}
                      title={buildMaterialTag(selectedMat, target.en)}>
                      {applied ? '✓ ' : ''}{ja ? target.ja : target.en}
                      <span className="ml-1 text-[0.5rem] opacity-40">
                        ({target.blockId === 'feature' ? (ja ? 'D' : 'D') : (ja ? '衣' : 'O')})
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* プレビュー */}
            <div className={`bg-bg border border-line rounded-lg p-3 mb-3.5 ${(selectedMat && availableTargets.length > 0) || appliedTags.length > 0 ? '' : 'opacity-40'}`}>
              <div className="text-muted text-[0.5625rem] font-mono mb-[0.1875rem]">
                {ja ? '生成されるタグ' : 'Generated tags'}
              </div>
              <code className="text-prompt text-[0.8125rem] font-mono break-all">
                {appliedTags.length > 0
                  ? appliedTags.join(', ')
                  : (previewTag
                    ? previewTag
                    : (ja ? '← 素材・部位を選んでください' : '← Select material and target'))}
              </code>
            </div>

            {/* 凡例 */}
            <div className="text-dim text-[0.5625rem] font-mono mb-3">
              {ja ? '▲ = 成人向け寄りの素材 　(衣/D) = 適用先ブロック' : '▲ = Adult-oriented material 　(O/D) = target block'}
            </div>

            <div className="text-dim text-[0.625rem] font-mono text-center">
              {ja ? '※ 部位チップをタップで追加・解除できます' : '※ Tap a target to toggle it on / off'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
