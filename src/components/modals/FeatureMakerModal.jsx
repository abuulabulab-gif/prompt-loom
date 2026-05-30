import { useState } from "react";
import { FEATURE_CATS, FEATURE_ITEMS } from "../../data/features.js";

const ACCENT = '#6c8fff';

export default function FeatureMakerModal({ lang, blocks, onApply, onClose, filterBlockId }) {
  const [catId,      setCatId]      = useState('face');
  const [partId,     setPartId]     = useState(null);
  const [subtypeId,  setSubtypeId]  = useState(null);
  const [optionEn,   setOptionEn]   = useState(null);

  const allItems      = Object.values(FEATURE_ITEMS).flat();
  const filteredItems = filterBlockId ? allItems.filter(item => item.targetBlock === filterBlockId) : null;
  const isFiltered    = Boolean(filteredItems);
  const displayItems  = isFiltered ? filteredItems : (FEATURE_ITEMS[catId] || []);

  const part         = partId ? displayItems.find(p => p.id === partId) : null;
  const hasSubtypes  = Boolean(part?.subtypes);
  const subtype      = subtypeId && part?.subtypes ? part.subtypes.find(s => s.id === subtypeId) : null;
  const currentOpts  = hasSubtypes ? (subtype?.options ?? []) : (part?.options ?? []);
  const option       = optionEn ? currentOpts.find(o => o.en === optionEn) : null;

  const targetBlockName = part
    ? (blocks?.find(b => b.id === part.targetBlock)?.[lang === 'ja' ? 'name' : 'nameEn'] ?? part.targetBlock)
    : null;

  const handleCatChange     = (id) => { setCatId(id); setPartId(null); setSubtypeId(null); setOptionEn(null); };
  const handlePartChange    = (id) => { setPartId(id); setSubtypeId(null); setOptionEn(null); };
  const handleSubtypeChange = (id) => { setSubtypeId(id); setOptionEn(null); };
  const handleApply = () => {
    if (!option || !part) return;
    onApply(option.en, part.targetBlock);
  };

  // ステップ番号の計算
  const base   = isFiltered ? 0 : 1;
  const sSteps = ['①','②','③','④'];
  const sPart    = sSteps[base];
  const sSubtype = sSteps[base + 1];
  const sOption  = sSteps[base + (hasSubtypes ? 2 : 1)];

  const chip = (label, active, onClick) => (
    <button key={label} onClick={onClick}
      style={active ? { background: ACCENT + '22', borderColor: ACCENT, color: ACCENT } : {}}
      className={`rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono ${active ? 'font-bold border' : 'bg-surfalt border border-line text-fg'}`}>
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[27.5rem] max-h-[88vh] overflow-y-auto p-[1.125rem]">

        <div className="flex items-center justify-between mb-3.5">
          <span className="text-fg text-sm font-bold">🎯 {lang === 'ja' ? '特徴メーカー' : 'Feature Maker'}</span>
          <button onClick={onClose} className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        {/* ① カテゴリ（全部入りのみ） */}
        {!isFiltered && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {lang === 'ja' ? '① カテゴリ' : '① Category'}
            </div>
            <div className="flex gap-[0.3125rem] mb-3.5">
              {FEATURE_CATS.map(c => chip(
                `${c.icon} ${lang === 'ja' ? c.ja : c.en}`,
                catId === c.id,
                () => handleCatChange(c.id)
              ))}
            </div>
          </>
        )}

        {/* パーツ */}
        <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
          {lang === 'ja' ? `${sPart} パーツ` : `${sPart} Part`}
        </div>
        <div className="flex flex-wrap gap-[0.3125rem] mb-3.5">
          {displayItems.map(item => chip(
            lang === 'ja' ? item.ja : item.en,
            partId === item.id,
            () => handlePartChange(item.id)
          ))}
          {isFiltered && displayItems.length === 0 && (
            <span className="text-dim text-[0.625rem] font-mono">
              {lang === 'ja' ? 'このブロック用の特徴はありません' : 'No features for this block'}
            </span>
          )}
        </div>

        {/* 種類（subtypes がある場合のみ） */}
        {part && hasSubtypes && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {lang === 'ja' ? `${sSubtype} 種類` : `${sSubtype} Type`}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem] mb-3.5">
              {part.subtypes.map(st => chip(
                lang === 'ja' ? st.ja : (st.en ?? st.ja),
                subtypeId === st.id,
                () => handleSubtypeChange(st.id)
              ))}
            </div>
          </>
        )}

        {/* 位置・状態 */}
        {part && (!hasSubtypes || subtype) && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {lang === 'ja' ? `${sOption} 位置・状態` : `${sOption} Position / State`}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem] mb-2">
              {currentOpts.map(opt => chip(
                lang === 'ja' ? opt.ja : opt.en,
                optionEn === opt.en,
                () => setOptionEn(opt.en)
              ))}
            </div>
            {part.lrWarning && (
              <div className="text-dim text-[0.5625rem] font-mono mb-2.5">
                ⚠️ {lang === 'ja' ? '左右指定はAIによって反転する場合があります' : 'Left/right may be reversed by AI models'}
              </div>
            )}
          </>
        )}

        {/* プレビュー */}
        <div className={`bg-bg border border-line rounded-lg p-3 mb-3.5 ${option ? 'opacity-100' : 'opacity-40'}`}>
          <div className="text-muted text-[0.5625rem] font-mono mb-[0.1875rem]">
            {lang === 'ja' ? '生成されるタグ' : 'Generated tag'}
          </div>
          <code className="text-prompt text-[0.8125rem] font-mono break-all">
            {option ? option.en : (lang === 'ja' ? '← パーツ・位置を選んでください' : '← Select a part and position')}
          </code>
        </div>

        <button
          onClick={handleApply}
          disabled={!option}
          className="w-full border-none rounded-[0.5625rem] py-[0.6875rem] text-white text-[0.8125rem] font-bold tracking-[0.03em]"
          style={{
            background: 'linear-gradient(135deg,#4a6fff,#8a4fff)',
            opacity: option ? 1 : 0.45,
            cursor: option ? 'pointer' : 'not-allowed',
          }}
        >
          + {option && targetBlockName
            ? (lang === 'ja' ? `「${targetBlockName}」ブロックに追加` : `Add to ${targetBlockName}`)
            : (lang === 'ja' ? '位置・状態を選んでください' : 'Select a position / state')}
        </button>
        <div className="text-dim text-[0.625rem] font-mono text-center mt-2">
          {lang === 'ja' ? '※ 連続で追加できます' : '※ Add multiple in a row'}
        </div>
      </div>
    </div>
  );
}
