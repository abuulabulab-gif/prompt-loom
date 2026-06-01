import { useState } from "react";
import { TEMPLATES } from "../../data/templates.js";
import { BLOCKS_DEF } from "../../data/blocks.js";

// ブロック登録タグの en→ja 逆引きマップ
const TAG_JA_MAP = new Map();
for (const block of BLOCKS_DEF) {
  for (const cat of block.cats) {
    for (const tag of cat.t) {
      if (tag.en && tag.ja) TAG_JA_MAP.set(tag.en.toLowerCase(), tag.ja);
    }
  }
}

// テンプレート専用タグ（ブロック未登録）の日本語マップ
const TEMPLATE_EXTRA_JA = new Map([
  // 品質・レンダリング
  ['smooth shading',           'スムースシェード'],
  ['intricate details',        '緻密な描写'],
  // 撮影スタイル
  ['selfie',                   '自撮り'],
  // 構図・視点
  ['foreshortening',           '短縮遠近法'],
  ['extreme perspective',      '超パース'],
  ['fisheye lens',             '魚眼レンズ'],
  ['wide angle view',          '広角'],
  ['lower body',               '下半身'],
  ['lower half of face',       '顔の下半分'],
  ['extreme close-up on eyes', '目の超アップ'],
  ['macro shot',               'マクロショット'],
  // ボディ
  ['armpit focus',             '脇アップ'],
  ['midriff focus',            'お腹アップ'],
  ['eye focus',                '目フォーカス'],
  // フェイス
  ['detailed lips',            '詳細な唇'],
  ['detailed pupils',          '詳細な瞳'],
  // エフェクト
  ['flying debris',            '飛散する破片'],
  ['distorted background',     '歪んだ背景'],
  ['motion blur',              'モーションブラー'],
]);

// en → ja (ブロック + テンプレート専用の両方を検索)
function toJa(en) {
  const key = en.toLowerCase();
  return TAG_JA_MAP.get(key) ?? TEMPLATE_EXTRA_JA.get(key) ?? null;
}

const FETI_IDS    = new Set(['highangle_armpit','lowangle_legs','midriff_navel','nape_lift','birdseye_lie','skintight_detail','zettairyouiki','napeandback','bare_back','footperspective','armpitsleeveless']);
const DYNAMIC_IDS = new Set(['dynamic_booster','extreme_perspective']);
const EXTREME_IDS = new Set(['lip_focus','eye_focus','fisheye','from_below','from_above']);

const styleTemplates     = TEMPLATES.filter(t => t.apply.quality);
const basicCompTemplates = TEMPLATES.filter(t => !t.apply.quality && !FETI_IDS.has(t.id) && !DYNAMIC_IDS.has(t.id) && !EXTREME_IDS.has(t.id));
const fetiTemplates      = TEMPLATES.filter(t => FETI_IDS.has(t.id));
const dynamicTemplates   = TEMPLATES.filter(t => DYNAMIC_IDS.has(t.id));
const extremeTemplates   = TEMPLATES.filter(t => EXTREME_IDS.has(t.id));

const BLOCK_LABEL = {
  quality:     { ja: '品質',   en: 'Quality' },
  artstyle:    { ja: '作風',   en: 'Style'   },
  background:  { ja: '背景',   en: 'BG'      },
  composition: { ja: '構図',   en: 'View'    },
  body:        { ja: '体型',   en: 'Body'    },
  outfit:      { ja: '衣装',   en: 'Outfit'  },
  face:        { ja: '顔',     en: 'Face'    },
  effect:      { ja: '効果',   en: 'Effect'  },
};

// 全ブロックのタグを結合してプレビュー文字列を生成
function previewText(tmpl) {
  const parts = Object.values(tmpl.apply)
    .map(val => (typeof val === 'object' ? val.tags ?? '' : val).trim())
    .filter(Boolean);
  return parts.join(', ');
}

function TagDetailPopup({ tmpl, lang, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-[310]" onClick={onClose} />
      <div className="fixed z-[311] inset-x-4 top-1/2 -translate-y-1/2 bg-surface border border-linebright rounded-xl shadow-2xl p-5 max-h-[70vh] overflow-y-auto"
        style={{ maxWidth: '28rem', margin: '0 auto' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-fg text-sm font-bold">{tmpl.icon} {lang === 'ja' ? tmpl.name : tmpl.nameEn}</span>
          <button onClick={onClose}
            className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>
        {Object.entries(tmpl.apply).map(([blockId, val]) => {
          const rawTags = typeof val === 'string' ? val : (val.tags ?? '');
          const tagList = rawTags.split(',').map(t => t.trim()).filter(Boolean);
          if (!tagList.length) return null;
          const label = BLOCK_LABEL[blockId]?.[lang] ?? blockId;
          return (
            <div key={blockId} className="mb-3">
              <div className="text-[0.5625rem] font-mono text-muted mb-1 uppercase tracking-widest">{label}</div>
              <div className="flex flex-wrap gap-1">
                {tagList.map(tag => {
                  const ja = toJa(tag);
                  return (
                    <span key={tag}
                      className="text-[0.625rem] font-mono px-1.5 py-0.5 rounded border border-dim"
                      style={{ color: 'rgb(var(--text))', background: 'rgb(var(--bg))' }}>
                      {ja ?? tag}
                      {ja && <span className="text-muted ml-0.5 opacity-50">({tag})</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TemplateCard({ tmpl, lang, onApply, onShowDetail }) {
  const targetBlocks = Object.keys(tmpl.apply);
  return (
    <div
      onClick={() => onApply(tmpl)}
      onMouseOver={e => { e.currentTarget.style.border = '1px solid #6c8fff60'; e.currentTarget.style.background = 'rgb(var(--dim))'; }}
      onMouseOut={e => { e.currentTarget.style.border = ''; e.currentTarget.style.background = ''; }}
      className="bg-surfalt border border-line rounded-[0.625rem] p-3.5 cursor-pointer transition-all duration-150"
    >
      <div className="text-2xl mb-1.5">{tmpl.icon}</div>
      <div className="text-fg text-[0.8125rem] font-bold mb-[0.1875rem]">{lang === 'ja' ? tmpl.name : tmpl.nameEn}</div>
      <div className="text-muted text-[0.6875rem] mb-2">{lang === 'ja' ? tmpl.desc : tmpl.descEn}</div>

      {/* プレビューボックス — クリックでタグ詳細ポップアップ */}
      <div
        onClick={e => { e.stopPropagation(); onShowDetail(tmpl); }}
        onMouseOver={e => { e.currentTarget.style.borderColor = '#6c8fff80'; e.currentTarget.style.background = 'rgb(var(--surface-alt))'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; }}
        className="text-accent text-[0.625rem] font-mono bg-bg px-2 py-[0.3125rem] rounded-[0.3125rem] leading-[1.5] mb-2 cursor-pointer border border-transparent transition-colors overflow-hidden"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-all',
        }}
        title={lang === 'ja' ? 'タップでタグ一覧' : 'Tap to view tags'}
      >
        {previewText(tmpl)}
      </div>

      {(lang === 'ja' ? tmpl.sizeHintJa : tmpl.sizeHintEn) && (
        <div className="text-[0.5625rem] font-mono leading-[1.5] mb-2 px-1.5 py-1 rounded"
          style={{ background: 'rgb(var(--c-warn) / 0.08)', color: 'rgb(var(--c-warn))', border: '1px solid rgb(var(--c-warn) / 0.25)' }}>
          {lang === 'ja' ? tmpl.sizeHintJa : tmpl.sizeHintEn}
        </div>
      )}
      {(lang === 'ja' ? tmpl.negHintJa : tmpl.negHintEn) && (
        <div className="text-[0.5625rem] font-mono leading-[1.5] mb-2 px-1.5 py-1 rounded"
          style={{ background: 'rgb(var(--c-blue) / 0.08)', color: 'rgb(var(--c-blue))', border: '1px solid rgb(var(--c-blue) / 0.25)' }}>
          💡 {lang === 'ja' ? 'ネガ推奨: ' : 'Neg hint: '}{lang === 'ja' ? tmpl.negHintJa : tmpl.negHintEn}
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {targetBlocks.map(id => (
          <span key={id} className="text-[0.5625rem] font-mono px-[0.3125rem] py-0.5 rounded-[0.1875rem] border border-dim text-muted">
            {BLOCK_LABEL[id]?.[lang] ?? id}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TemplateModal({ lang, isMobile, onApply, onClose }) {
  const [detailTmpl, setDetailTmpl] = useState(null);
  const gridCls = isMobile ? 'grid grid-cols-2 gap-2' : 'grid gap-2';
  const gridStyle = isMobile ? {} : { gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' };

  const card = (tmpl) => (
    <TemplateCard key={tmpl.id} tmpl={tmpl} lang={lang} onApply={onApply} onShowDetail={setDetailTmpl} />
  );

  return (
    <div className="fixed inset-0 bg-black/85 z-[300] flex items-center justify-center p-5">
      <div className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[57.5rem] overflow-hidden">
        <div className="px-[1.125rem] py-3.5 border-b border-line flex items-center justify-between">
          <span className="text-fg text-sm font-bold">✦ {lang === 'ja' ? 'ブロックテンプレート' : 'Block Templates'}</span>
          <button onClick={onClose} className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        <div className="px-[1.125rem] py-3.5 overflow-y-auto max-h-[75vh]">
          <p className="text-muted text-[0.6875rem] font-mono mb-1">
            {lang === 'ja' ? '対象ブロックに上書き適用されます。' : 'Applies directly to the target blocks.'}
          </p>
          <p className="text-[#f87171] text-[0.625rem] font-mono mb-4">
            {lang === 'ja' ? '⚠ 対象ブロックにすでに入っているタグは消えます。' : '⚠ Existing tags in the target blocks will be cleared.'}
          </p>

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">{lang === 'ja' ? 'スタイル' : 'Style'}</div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>{styleTemplates.map(card)}</div>

          <div className="border-t border-dim mb-4" />

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">{lang === 'ja' ? '構図・設定資料（SFW）' : 'Composition / Reference'}</div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>{basicCompTemplates.map(card)}</div>

          <div className="border-t border-dim mb-4" />

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">{lang === 'ja' ? 'フェチ構図（SFW）' : 'Flair / Feti Composition'}</div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>{fetiTemplates.map(card)}</div>

          <div className="border-t border-dim mb-4" />

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">{lang === 'ja' ? 'ダイナミック' : 'Dynamic'}</div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>{dynamicTemplates.map(card)}</div>

          <div className="border-t border-dim mb-4" />

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">{lang === 'ja' ? '極限アングル・クローズアップ' : 'Extreme Close-Up'}</div>
          <div className={gridCls} style={gridStyle}>{extremeTemplates.map(card)}</div>
        </div>
      </div>

      {/* タグ詳細ポップアップ */}
      {detailTmpl && <TagDetailPopup tmpl={detailTmpl} lang={lang} onClose={() => setDetailTmpl(null)} />}
    </div>
  );
}
