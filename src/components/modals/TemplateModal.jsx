import { useState } from "react";
import { TEMPLATES } from "../../data/templates.js";
import { BLOCKS_DEF } from "../../data/blocks.js";
import { EXTRA_TAG_JA } from "../../data/extraTags.js";

// ブロック登録タグの en→ja 逆引きマップ
const TAG_JA_MAP = new Map();
for (const block of BLOCKS_DEF) {
  for (const cat of block.cats) {
    for (const tag of cat.t) {
      if (tag.en && tag.ja) TAG_JA_MAP.set(tag.en.toLowerCase(), tag.ja);
    }
  }
}

// en → ja (ブロック登録 + テンプレ専用辞書 extraTags の両方を検索)
function toJa(en) {
  const key = en.toLowerCase();
  return TAG_JA_MAP.get(key) ?? EXTRA_TAG_JA.get(key) ?? null;
}

const FETI_IDS    = new Set(['nape_lift','bare_back','armpitsleeveless','armpit_closeup','midriff_navel','underboob_lowangle','zettairyouiki','skintight_detail','lowangle_legs','footperspective','split_balance']);
const SITU_IDS    = new Set(['prone_elbow','supine_relax','floor_sit','birdseye_lie']);
const DYNAMIC_IDS = new Set(['dynamic_booster','extreme_perspective','rider_kick','wind','cinematic']);
const EXTREME_IDS = new Set(['lip_focus','eye_focus','fisheye','from_below','from_above']);

const STYLE_IDS          = new Set(['anime','photo','fantasy','chibi','pixelart']);
const styleTemplates     = TEMPLATES.filter(t => STYLE_IDS.has(t.id));
const basicCompTemplates = TEMPLATES.filter(t => !STYLE_IDS.has(t.id) && !FETI_IDS.has(t.id) && !SITU_IDS.has(t.id) && !DYNAMIC_IDS.has(t.id) && !EXTREME_IDS.has(t.id));
const fetiTemplates      = TEMPLATES.filter(t => FETI_IDS.has(t.id));
const situTemplates      = TEMPLATES.filter(t => SITU_IDS.has(t.id));
const dynamicTemplates   = TEMPLATES.filter(t => DYNAMIC_IDS.has(t.id));
const extremeTemplates   = TEMPLATES.filter(t => EXTREME_IDS.has(t.id));

const BLOCK_LABEL = {
  quality:     { ja: '品質',   en: 'Quality' },
  artstyle:    { ja: '作風',   en: 'Style'   },
  background:  { ja: '背景',   en: 'BG'      },
  composition: { ja: '構図',   en: 'View'    },
  body:        { ja: '体型',   en: 'Body'    },
  outfit:        { ja: '衣装',         en: 'Outfit'  },
  outfit_detail: { ja: '衣装ディテール', en: 'Detail'  },
  face:          { ja: '顔',           en: 'Face'    },
  effect:        { ja: '効果',         en: 'Effect'  },
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

function TemplateCard({ tmpl, lang, clearMode, onApply, onShowDetail }) {
  const targetBlocks = Object.keys(tmpl.apply);
  return (
    <div
      onClick={() => onApply(tmpl, clearMode)}
      onMouseOver={e => { e.currentTarget.style.border = '1px solid rgb(var(--c-blue) / 0.38)'; e.currentTarget.style.background = 'rgb(var(--dim))'; }}
      onMouseOut={e => { e.currentTarget.style.border = ''; e.currentTarget.style.background = ''; }}
      className="bg-surfalt border border-line rounded-[0.625rem] p-3.5 cursor-pointer transition-all duration-150"
    >
      <div className="text-2xl mb-1.5">{tmpl.icon}</div>
      <div className="text-fg text-[0.8125rem] font-bold mb-[0.1875rem]">{lang === 'ja' ? tmpl.name : tmpl.nameEn}</div>
      <div className="text-muted text-[0.6875rem] mb-2">{lang === 'ja' ? tmpl.desc : tmpl.descEn}</div>

      {/* プレビューボックス — クリックでタグ詳細ポップアップ */}
      <div
        onClick={e => { e.stopPropagation(); onShowDetail(tmpl); }}
        onMouseOver={e => { e.currentTarget.style.borderColor = 'rgb(var(--c-blue) / 0.5)'; e.currentTarget.style.background = 'rgb(var(--surface-alt))'; }}
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

export default function TemplateModal({ lang, isMobile, onApply, onClose, hasBase, baseSavedAt, onRestoreBase, onSaveBase }) {
  const [detailTmpl, setDetailTmpl] = useState(null);
  const [clearMode, setClearMode] = useState(false);
  const gridCls = isMobile ? 'grid grid-cols-2 gap-2' : 'grid gap-2';
  const gridStyle = isMobile ? {} : { gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' };

  const card = (tmpl) => (
    <TemplateCard key={tmpl.id} tmpl={tmpl} lang={lang} clearMode={clearMode} onApply={onApply} onShowDetail={setDetailTmpl} />
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-5">
      <div className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[57.5rem] overflow-hidden">
        <div className="px-[1.125rem] py-3.5 border-b border-line flex items-center justify-between gap-3 flex-wrap">
          <span className="text-fg text-sm font-bold">✦ {lang === 'ja' ? 'ブロックテンプレート' : 'Block Templates'}</span>
          <div className="flex items-center gap-2 flex-wrap">
            {/* ベース（テンプレ派生前の姿）操作 */}
            <div className="flex items-center gap-1.5">
              {hasBase && (
                <button
                  onClick={onRestoreBase}
                  className="rounded-full px-3 py-[0.1875rem] text-[0.625rem] font-mono font-bold cursor-pointer border transition-all duration-150"
                  style={{ background: 'rgb(var(--c-green, 76 175 80) / 0.1)', borderColor: 'rgb(var(--c-green, 76 175 80) / 0.45)', color: 'rgb(76 175 80)' }}
                  title={lang === 'ja'
                    ? `テンプレ派生前の状態（${baseSavedAt ? new Date(baseSavedAt).toLocaleTimeString() : ''}記録）へ全ブロックを戻す。ベース自体は残ります`
                    : `Restore all blocks to the pre-template base${baseSavedAt ? ` (saved ${new Date(baseSavedAt).toLocaleTimeString()})` : ''}. The base itself is kept`}
                >
                  ⟲ {lang === 'ja' ? 'ベースに戻す' : 'Restore base'}
                </button>
              )}
              <button
                onClick={onSaveBase}
                className="rounded-full px-3 py-[0.1875rem] text-[0.625rem] font-mono font-bold cursor-pointer border border-dim text-muted bg-transparent transition-all duration-150"
                title={lang === 'ja'
                  ? '今の全ブロック状態を「ベース」として記録。以降のテンプレ適用からいつでもここへ戻れます（初回適用時は自動記録）'
                  : 'Record the current state as the base to return to. Auto-recorded on first template apply'}
              >
                📌 {lang === 'ja' ? (hasBase ? 'ベース更新' : '現在をベースに記録') : (hasBase ? 'Update base' : 'Save as base')}
              </button>
            </div>
            {/* 適用モードトグル */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted text-[0.625rem] font-mono">{lang === 'ja' ? '適用モード:' : 'Apply:'}</span>
              <button
                onClick={() => setClearMode(m => !m)}
                className="rounded-full px-3 py-[0.1875rem] text-[0.625rem] font-mono font-bold cursor-pointer border transition-all duration-150"
                style={clearMode
                  ? { background: 'rgb(var(--c-warn) / 0.12)', borderColor: 'rgb(var(--c-warn) / 0.5)', color: 'rgb(var(--c-warn))' }
                  : { background: 'rgb(var(--c-blue) / 0.1)', borderColor: 'rgb(var(--c-blue) / 0.4)', color: 'rgb(var(--c-blue))' }
                }
                title={lang === 'ja'
                  ? (clearMode ? '現在: クリアして適用（templateが触るブロックを先に空にする）' : '現在: 追加で適用（既存タグに重ねる）')
                  : (clearMode ? 'Current: Clear & apply (touched blocks emptied first)' : 'Current: Add to existing tags')
                }
              >
                {clearMode
                  ? (lang === 'ja' ? '🧹 クリアして適用' : '🧹 Clear & apply')
                  : (lang === 'ja' ? '＋ 追加で適用' : '＋ Add to existing')
                }
              </button>
            </div>
            <button onClick={onClose} className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
              {lang === 'ja' ? '閉じる' : 'Close'}
            </button>
          </div>
        </div>

        <div className="px-[1.125rem] py-3.5 overflow-y-auto max-h-[75vh]">
          <p className="text-muted text-[0.6875rem] font-mono mb-1.5">
            {lang === 'ja'
              ? '構図・スタイル・効果などを複数ブロックにまとめてセットできる型です。カードをタップするとすぐ適用されます。'
              : 'Presets that set composition, style, effects, and more across multiple blocks at once. Tap a card to apply instantly.'}
          </p>
          <p className="text-[#f87171] text-[0.625rem] font-mono mb-1">
            {lang === 'ja'
              ? '⚠ 構図・背景は上書き。衣装・体型・顔は追記。「クリアして適用」モードでは追記ブロックも先に空にしてから適用します。'
              : '⚠ Composition / BG blocks are overwritten. Outfit / body / face blocks append. In "Clear & apply" mode, append-blocks are also cleared first.'}
          </p>
          <p className="text-[0.5625rem] font-mono mb-4" style={{ color: 'rgb(var(--c-blue))' }}>
            {lang === 'ja'
              ? '💡 ネガ推奨タグ（💡）はネガティブブロックに自動追記。適用直後は「元に戻す」が12秒間使えます。初回適用時に派生前の姿を「ベース」として自動記録——連続でテンプレを重ねても「⟲ ベースに戻す」やブロックの⟲でいつでも復帰できます。フォーカス系テンプレはノイズになるブロックを削除せず一時OFFにします（タグ保持）。'
              : '💡 Negative hints (💡) are auto-appended to the Negative block. Undo is available for 12s after applying. On first apply, the pre-template state is auto-saved as a base — chain templates freely and return anytime via "Restore base" or per-block ⟲. Focus templates mute noisy blocks instead of deleting (tags kept).'}
          </p>

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">{lang === 'ja' ? 'スタイル' : 'Style'}</div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>{styleTemplates.map(card)}</div>

          <div className="border-t border-dim mb-4" />

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">{lang === 'ja' ? '構図・設定資料' : 'Composition / Reference'}</div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>{basicCompTemplates.map(card)}</div>

          <div className="border-t border-dim mb-4" />

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">{lang === 'ja' ? 'フェチ構図（SFW）' : 'Flair / Feti Composition'}</div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>{fetiTemplates.map(card)}</div>

          <div className="border-t border-dim mb-4" />

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">{lang === 'ja' ? 'シチュ構図' : 'Situational'}</div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>{situTemplates.map(card)}</div>

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
