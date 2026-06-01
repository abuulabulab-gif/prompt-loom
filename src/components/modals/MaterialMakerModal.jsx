import { MATERIAL_PALETTE, MATERIAL_TARGETS, buildMaterialTag } from "../../data/materials.js";
import { hasTag, appendTag, removeTag } from "../../data/constants.js";

const ACCENT = '#6c8fff';

// 素材グループ定義（表示順・グループ名）
const MAT_GROUPS = [
  {
    label: { ja: '光沢・高級',    en: 'Luxury'       },
    ids: ['silk','satin','velvet'],
  },
  {
    label: { ja: 'レース・装飾',  en: 'Lace & Trim'  },
    ids: ['lace','lace-trimmed','embroidered','sequined'],
  },
  {
    label: { ja: '特殊素材',      en: 'Special'      },
    ids: ['leather','fur','knit','mesh'],
  },
  {
    label: { ja: '透け・条件付き', en: 'Sheer & Adult' },
    ids: ['sheer','fishnet','latex'],
  },
];

function getBlockText(blocks, id) {
  return blocks?.find(b => b.id === id)?.text || '';
}

// どのブロックにトリガーが含まれるか判定
function resolveTargetBlock(target, outfitText, featureText) {
  const inOutfit  = [...target.triggers].some(k => hasTag(outfitText,  k));
  const inFeature = [...target.triggers].some(k => hasTag(featureText, k));
  if (inOutfit)  return 'outfit';
  if (inFeature) return 'feature';
  return null;
}

export default function MaterialMakerModal({ lang, blocks, onApply, onClose }) {
  const outfitText  = getBlockText(blocks, 'outfit');
  const featureText = getBlockText(blocks, 'feature');

  // 現在の衣装に合う部位だけ抽出
  const activeTargets = MATERIAL_TARGETS
    .map(t => ({ ...t, blockId: resolveTargetBlock(t, outfitText, featureText) }))
    .filter(t => t.blockId !== null);

  const isEmpty = activeTargets.length === 0;

  const currentText = (blockId) =>
    blockId === 'outfit' ? outfitText : featureText;

  const handleChip = (materialEn, target) => {
    const tag  = buildMaterialTag(materialEn, target.en);
    const bId  = target.blockId;
    const text = currentText(bId);
    const next = hasTag(text, tag)
      ? removeTag(text, tag)
      : appendTag(text, tag, '1.0');
    onApply(next, bId);
  };

  // 各部位に表示する素材リスト（combinable フィルタ適用）
  const matsForTarget = (target) => {
    const pool = target.combinable
      ? MATERIAL_PALETTE.filter(m => target.combinable.has(m.en))
      : MATERIAL_PALETTE;
    // グループ順を維持しながら絞り込み
    return MAT_GROUPS.flatMap(g =>
      g.ids.map(id => pool.find(m => m.en === id)).filter(Boolean)
    );
  };

  const jaLabel = (target) => target.ja;
  const enLabel = (target) => target.en.charAt(0).toUpperCase() + target.en.slice(1);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[28rem] max-h-[88vh] overflow-y-auto p-[1.125rem]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-fg text-sm font-bold">
            🧵 {lang === 'ja' ? 'マテリアルメーカー' : 'Material Maker'}
          </span>
          <button
            onClick={onClose}
            className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs"
          >
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        {/* 衣装が空のとき */}
        {isEmpty && (
          <p className="text-muted text-xs text-center py-6">
            {lang === 'ja'
              ? '衣装ブロックにタグを追加してから使用してください'
              : 'Add tags to the Outfit block first'}
          </p>
        )}

        {/* 部位ごとのセクション */}
        {activeTargets.map(target => {
          const mats = matsForTarget(target);
          if (mats.length === 0) return null;
          const text = currentText(target.blockId);

          return (
            <div key={target.id} className="mb-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[0.6875rem] font-bold text-muted">
                  {lang === 'ja' ? jaLabel(target) : enLabel(target)}
                </span>
                <span className="text-[0.5625rem] text-dim font-mono">
                  ({target.blockId === 'feature' ? (lang === 'ja' ? '衣装ディテール' : 'Detail') : (lang === 'ja' ? '衣装' : 'Outfit')})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {mats.map(mat => {
                  const tag    = buildMaterialTag(mat.en, target.en);
                  const active = hasTag(text, tag);
                  return (
                    <button
                      key={mat.en}
                      onClick={() => handleChip(mat.en, target)}
                      title={tag}
                      style={active
                        ? { background: ACCENT + '22', borderColor: ACCENT, color: ACCENT }
                        : {}}
                      className={`rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono transition-colors
                        ${active
                          ? 'font-bold border'
                          : 'bg-surfalt border border-line text-fg hover:border-muted'}
                        ${mat.adult ? 'opacity-70' : ''}`}
                    >
                      {lang === 'ja' ? mat.ja : mat.en}
                      {mat.adult && <span className="ml-0.5 text-[0.5rem] opacity-60">▲</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* 凡例 */}
        {!isEmpty && (
          <p className="text-[0.5625rem] text-dim mt-2">
            {lang === 'ja'
              ? '▲ = 成人向けコンテンツ向け素材。タグ例: silk skirt / leather jacket'
              : '▲ = Adult-oriented material. e.g. silk skirt / leather jacket'}
          </p>
        )}
      </div>
    </div>
  );
}
