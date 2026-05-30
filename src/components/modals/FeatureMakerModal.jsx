import { useState } from "react";
import { FEATURE_CATS, FEATURE_ITEMS } from "../../data/features.js";

const ACCENT = '#6c8fff';

export default function FeatureMakerModal({ lang, blocks, onApply, onClose, filterBlockId }) {
  const [catId,    setCatId]    = useState('face');
  const [partId,   setPartId]   = useState(null);
  const [optionEn, setOptionEn] = useState(null);

  // filterBlockId 指定時: 全カテゴリから targetBlock が一致するアイテムだけ集める
  const allItems     = Object.values(FEATURE_ITEMS).flat();
  const filteredItems = filterBlockId ? allItems.filter(item => item.targetBlock === filterBlockId) : null;
  const isFiltered   = Boolean(filteredItems);

  const displayItems = isFiltered ? filteredItems : (FEATURE_ITEMS[catId] || []);
  const part   = partId   ? displayItems.find(p => p.id === partId) : null;
  const option = optionEn && part ? part.options.find(o => o.en === optionEn) : null;

  const targetBlockName = part
    ? (blocks?.find(b => b.id === part.targetBlock)?.[lang === 'ja' ? 'name' : 'nameEn'] ?? part.targetBlock)
    : null;

  const handleCatChange = (id) => { setCatId(id); setPartId(null); setOptionEn(null); };
  const handlePartChange = (id) => { setPartId(id); setOptionEn(null); };
  const handleApply = () => {
    if (!option || !part) return;
    onApply(option.en, part.targetBlock);
  };

  const s1 = isFiltered ? '①' : '②';
  const s2 = isFiltered ? '②' : '③';

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

        {/* ① カテゴリ — 全部入りモードのみ */}
        {!isFiltered && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {lang === 'ja' ? '① カテゴリ' : '① Category'}
            </div>
            <div className="flex gap-[0.3125rem] mb-3.5">
              {FEATURE_CATS.map(c => (
                <button key={c.id} onClick={() => handleCatChange(c.id)}
                  style={catId === c.id ? { background: ACCENT + '22', borderColor: ACCENT, color: ACCENT } : {}}
                  className={`flex-1 rounded-md px-2 py-1.5 text-[0.6875rem] cursor-pointer font-mono ${catId === c.id ? 'font-bold border' : 'bg-surfalt border border-line text-fg'}`}>
                  {c.icon} {lang === 'ja' ? c.ja : c.en}
                </button>
              ))}
            </div>
          </>
        )}

        {/* パーツ選択 */}
        <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
          {lang === 'ja' ? `${s1} パーツ` : `${s1} Part`}
        </div>
        <div className="flex flex-wrap gap-[0.3125rem] mb-3.5">
          {displayItems.map(item => (
            <button key={item.id} onClick={() => handlePartChange(item.id)}
              style={partId === item.id ? { background: ACCENT + '22', borderColor: ACCENT, color: ACCENT } : {}}
              className={`rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono ${partId === item.id ? 'font-bold border' : 'bg-surfalt border border-line text-fg'}`}>
              {lang === 'ja' ? item.ja : item.en}
            </button>
          ))}
          {isFiltered && displayItems.length === 0 && (
            <span className="text-dim text-[0.625rem] font-mono">{lang === 'ja' ? 'このブロック用の特徴はありません' : 'No features for this block'}</span>
          )}
        </div>

        {/* 位置・状態選択 */}
        {part && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {lang === 'ja' ? `${s2} 位置・状態` : `${s2} Position / State`}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem] mb-2">
              {part.options.map(opt => (
                <button key={opt.en} onClick={() => setOptionEn(opt.en)}
                  style={optionEn === opt.en ? { background: ACCENT + '22', borderColor: ACCENT, color: ACCENT } : {}}
                  className={`rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono ${optionEn === opt.en ? 'font-bold border' : 'bg-surfalt border border-line text-fg'}`}>
                  {lang === 'ja' ? opt.ja : opt.en}
                </button>
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
            {option ? option.en : (lang === 'ja' ? '← パーツと位置を選んでください' : '← Select a part and position')}
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
