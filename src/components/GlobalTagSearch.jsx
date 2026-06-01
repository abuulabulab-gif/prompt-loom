import { useState, useEffect, useRef } from "react";
import { hasTag } from "../data/constants.js";

// ── Search utilities ──────────────────────────────────────────────────────────
// Katakana → Hiragana (for normalized comparison)
const toHira = str => str.replace(/[ァ-ヶ]/g, c =>
  String.fromCharCode(c.charCodeAt(0) - 0x60));

// Japanese keyword → expanded search terms
const JA_EXPAND = {
  '赤': ['red'], '青': ['blue'], '緑': ['green'], '黄': ['yellow'],
  '金': ['gold', 'golden', 'blonde'], '銀': ['silver'],
  '白': ['white'], '黒': ['black'], '茶': ['brown'],
  'ピンク': ['pink'], '紫': ['purple'], '橙': ['orange'],
  '水色': ['light blue', 'aqua'],
  '長': ['long'], '短': ['short'],
  '大': ['large', 'big', 'huge'], '小': ['small', 'tiny', 'petite'],
  '細': ['slim', 'slender', 'thin'], '太': ['thick', 'muscular', 'chubby'],
  '若': ['young', 'teenage'], '大人': ['adult', 'mature'],
  '笑': ['smile', 'grin', 'happy'], '怒': ['angry'],
  '悲': ['sad'], '泣': ['crying', 'tear'],
  '目': ['eyes', 'eye'], '髪': ['hair'],
  '肌': ['skin'], '耳': ['ears', 'ear'],
  '猫': ['cat', 'cat ears', 'cat tail', 'neko'],
  '狐': ['fox', 'fox ears', 'fox tail'],
  'うさぎ': ['bunny', 'rabbit', 'bunny ears'],
  '犬': ['dog', 'dog ears', 'dog tail'],
  '馬': ['horse', 'horse ears', 'horse tail'],
  '龍': ['dragon'], '天使': ['angel'], '悪魔': ['demon'],
  '魔法': ['magic', 'magic circle', 'aura'],
  '剣': ['sword'], '銃': ['gun'], '翼': ['wings'],
  '花': ['flower', 'floral', 'cherry'], '桜': ['cherry blossom'],
  '雪': ['snow', 'snowfall'], '雨': ['rain', 'rainy'],
  '夜': ['night'], '昼': ['day'], '夕': ['sunset'],
  '森': ['forest'], '海': ['ocean', 'beach'], '空': ['sky'],
  '学校': ['school', 'classroom', 'school uniform'],
  '制服': ['uniform', 'school uniform', 'sailor uniform'],
  'メイド': ['maid'], '巫女': ['shrine maiden'],
  'ビキニ': ['bikini'], '水着': ['swimsuit'],
  '和': ['kimono', 'yukata', 'japanese'],
};

function expandQuery(raw) {
  const q = raw.trim();
  const qHira = toHira(q).toLowerCase();
  const terms = new Set([q.toLowerCase(), qHira]);

  for (const [key, aliases] of Object.entries(JA_EXPAND)) {
    const keyHira = toHira(key).toLowerCase();
    // Match if query contains the key or key contains query (for partial kanji)
    if (qHira.includes(keyHira) || keyHira.includes(qHira) ||
        q.includes(key) || key.includes(q)) {
      aliases.forEach(a => terms.add(a.toLowerCase()));
    }
  }
  return [...terms];
}

function tagMatches(tag, raw) {
  if (!raw.trim()) return false;
  const terms = expandQuery(raw);
  const enL = tag.en.toLowerCase();
  const jaH = toHira(tag.ja).toLowerCase();

  return terms.some(t =>
    enL.includes(t) || jaH.includes(toHira(t).toLowerCase())
  ) || tag.ja.includes(raw.trim());
}
// ─────────────────────────────────────────────────────────────────────────────

export default function GlobalTagSearch({ open, onClose, blocks, lang, onToggleTag }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const results = query.trim().length < 1 ? [] : blocks
    .filter(b => b.id !== 'negative')
    .flatMap(block =>
      block.cats.flatMap(cat =>
        cat.t
          .filter(tag => tagMatches(tag, query))
          .map(tag => ({ tag, block, cat }))
      )
    )
    .filter((item, i, arr) =>
      arr.findIndex(x => x.tag.en === item.tag.en && x.block.id === item.block.id) === i
    );

  // Group results by block
  const grouped = results.reduce((acc, item) => {
    const key = item.block.id;
    if (!acc[key]) acc[key] = { block: item.block, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  const scrollToBlock = (blockId) => {
    document.getElementById(`block-${blockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[5rem] px-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-line rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] w-full max-w-[35rem] flex flex-col max-h-[70vh]">

        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line flex-shrink-0">
          <span className="text-muted text-sm">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={lang === 'ja' ? 'タグを検索（全ブロック横断）' : 'Search tags across all blocks'}
            className="flex-1 bg-transparent border-none outline-none text-[0.8125rem] font-mono text-fg placeholder:text-dim"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted text-[0.6875rem] cursor-pointer bg-transparent border-none px-1">✕</button>
          )}
          <button onClick={onClose} className="text-muted text-[0.6875rem] cursor-pointer bg-transparent border-none px-1 ml-1">Esc</button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 p-3">
          {query.trim().length < 1 ? (
            <div className="text-center text-muted text-[0.6875rem] font-mono py-8">
              {lang === 'ja' ? '1文字以上入力してください' : 'Type to search'}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center text-muted text-[0.6875rem] font-mono py-8">
              {lang === 'ja' ? '見つかりません' : 'No results'}
            </div>
          ) : (
            Object.values(grouped).map(({ block, items }) => (
              <div key={block.id} className="mb-4">
                <button
                  onClick={() => scrollToBlock(block.id)}
                  className="flex items-center gap-1.5 mb-1.5 text-[0.625rem] font-mono font-bold cursor-pointer bg-transparent border-none p-0 hover:opacity-80 transition-opacity"
                  style={{ color: block.color }}
                >
                  <span>{block.icon}</span>
                  <span>{lang === 'ja' ? block.name : block.nameEn}</span>
                  <span className="font-normal text-muted">({items.length})</span>
                  <span className="text-[0.5625rem] text-dim">↗</span>
                </button>
                <div className="flex flex-wrap gap-1 pl-[1.125rem]">
                  {items.map(({ tag }) => {
                    const isActive = hasTag(block.text, tag.en);
                    return (
                      <button
                        key={tag.en}
                        onClick={() => { onToggleTag(block.id, tag.en); scrollToBlock(block.id); }}
                        title={isActive ? tag.en : (lang === 'ja' ? tag.en : tag.ja)}
                        className="rounded-[0.3125rem] px-2 py-[0.1875rem] text-[0.6875rem] font-mono cursor-pointer transition-all duration-100 border"
                        style={{
                          background: isActive ? block.color + '22' : 'rgb(var(--surface-alt))',
                          borderColor: isActive ? block.color + '90' : 'rgb(var(--border))',
                          color: isActive ? block.color : 'rgb(var(--text) / 0.8)',
                          fontWeight: isActive ? 700 : 400,
                        }}
                      >
                        {isActive ? '✓ ' : ''}{lang === 'ja' ? tag.ja : tag.en}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {results.length > 0 && (
          <div className="flex-shrink-0 px-4 py-2 border-t border-line text-[0.625rem] font-mono text-muted">
            {lang === 'ja' ? `${results.length}件` : `${results.length} tags`}
            {lang === 'ja' ? '・クリックでON/OFF・ブロック名をクリックでスクロール' : ' · click to toggle · click block name to scroll'}
          </div>
        )}
      </div>
    </div>
  );
}
