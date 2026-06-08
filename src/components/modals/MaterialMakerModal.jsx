import { useState } from "react";
import { MATERIAL_PALETTE, MATERIAL_TARGETS, buildMaterialTag } from "../../data/materials.js";
import { hasTag } from "../../data/constants.js";

const ACCENT    = 'rgb(var(--c-blue))';
const ACCENT_BG = 'rgb(var(--c-blue) / 0.13)';

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
  const [selectedMat,    setSelectedMat]    = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const outfitText  = getBlockText(blocks, 'outfit');
  const featureText = getBlockText(blocks, 'feature');
  const ja  = lang === 'ja';
  const accVal = groupOf(selectedMat)?.acc;
  const acc    = accVal ?? ACCENT;
  const accBg  = accVal ? accVal + '22' : ACCENT_BG;

  // 選択中素材に対応する部位リスト
  const availableTargets = selectedMat
    ? MATERIAL_TARGETS.filter(t => {
        const bId = resolveBlockId(t, outfitText, featureText);
        if (!bId) return false;
        if (t.combinable && !t.combinable.has(selectedMat)) return false;
        return true;
      }).map(t => ({ ...t, blockId: resolveBlockId(t, outfitText, featureText) }))
    : [];

  const currentText = (bId) => bId === 'outfit' ? outfitText : featureText;

  const preview    = selectedMat && selectedTarget
    ? buildMaterialTag(selectedMat, selectedTarget.en)
    : null;
  const isReady    = Boolean(preview);
  const alreadyHas = isReady && hasTag(currentText(selectedTarget.blockId), preview);

  const blockLabel = selectedTarget
    ? (blocks?.find(b => b.id === selectedTarget.blockId)?.[ja ? 'name' : 'nameEn'] ?? selectedTarget.blockId)
    : null;

  const handleApply = () => {
    if (!isReady) return;
    onApply(preview, selectedTarget.blockId);
  };

  const selectMat = (en) => {
    setSelectedMat(en === selectedMat ? null : en);
    setSelectedTarget(null);
  };

  const noOutfit = !outfitText && !featureText;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={onClose}>
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
            {/* Step 1: 素材 */}
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
                          onClick={() => selectMat(mat.en)}
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

            {/* Step 2: 部位 */}
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {ja ? '② 適用する部位を選ぶ' : '② Pick a target part'}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem] mb-3.5 min-h-[2rem]">
              {!selectedMat ? (
                <span className="text-dim text-[0.625rem] font-mono self-center">
                  {ja ? '↑ 素材を選ぶと部位が表示されます' : '↑ Select a material to see targets'}
                </span>
              ) : availableTargets.length === 0 ? (
                <span className="text-dim text-[0.625rem] font-mono self-center">
                  {ja ? 'この素材に対応する衣装タグが見当たりません' : `No outfit tags found for this material`}
                </span>
              ) : availableTargets.map(target => {
                const active   = selectedTarget?.id === target.id;
                const appended = hasTag(currentText(target.blockId), buildMaterialTag(selectedMat, target.en));
                return (
                  <button key={target.id}
                    onClick={() => setSelectedTarget(active ? null : target)}
                    style={active ? { background: accBg, borderColor: acc, color: acc } : {}}
                    className={chipCls(active)}
                    title={buildMaterialTag(selectedMat, target.en)}>
                    {appended ? '✓ ' : ''}{ja ? target.ja : target.en}
                  </button>
                );
              })}
            </div>

            {/* プレビュー */}
            <div className={`bg-bg border border-line rounded-lg p-3 mb-3.5 ${isReady ? '' : 'opacity-40'}`}>
              <div className="text-muted text-[0.5625rem] font-mono mb-[0.1875rem]">
                {ja ? '生成されるタグ' : 'Generated tag'}
              </div>
              <code className="text-prompt text-[0.8125rem] font-mono break-all">
                {preview ?? (ja ? '← 素材・部位を選んでください' : '← Select material and target')}
              </code>
            </div>

            {/* 適用ボタン */}
            <button onClick={handleApply} disabled={!isReady}
              className="w-full border-none rounded-[0.5625rem] py-[0.6875rem] text-white text-[0.8125rem] font-bold tracking-[0.03em] bg-[linear-gradient(135deg,#4a6fff,#8a4fff)]"
              style={{ opacity: isReady ? 1 : 0.45, cursor: isReady ? 'pointer' : 'not-allowed' }}>
              {isReady && blockLabel
                ? (alreadyHas
                  ? (ja ? `+ 「${blockLabel}」ブロックに再追加` : `+ Add again to ${blockLabel}`)
                  : (ja ? `+ 「${blockLabel}」ブロックに追加` : `+ Add to ${blockLabel}`))
                : (ja ? '+ 素材・部位を選んでください' : '+ Select material and target')}
            </button>
            <div className="text-dim text-[0.625rem] font-mono text-center mt-2">
              {ja ? '※ 連続で追加できます　▲ = 成人向け寄りの素材' : '※ Add multiple in a row　▲ = Adult-oriented material'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
