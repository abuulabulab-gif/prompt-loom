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
  // ちびキャラ
  ['super deformed',           'スーパーデフォルメ'],
  ['kawaii',                   'かわいい'],
  ['simple shading',           'シンプルシェード'],
  // ドット絵
  ['pixel perfect',            'ピクセルパーフェクト'],
  ['retro game',               'レトロゲーム'],
  ['8-bit',                    '8ビット'],
  // 壁紙
  ['scenery',                  '情景・風景'],
  ['cinematic lighting',       'シネマティック照明'],
  ['volumetric lighting',      'ボリューメトリックライト'],
  ['dramatic lighting',        'ドラマチック照明'],
  ['detailed background',      '詳細な背景'],
  // ライダーキック
  ['jumping',                  'ジャンプ'],
  ['kicking',                  '蹴り'],
  ['midair',                   '空中'],
  // 風・シネマティック
  ['clothes fluttering',       '衣装がなびく'],
  ['cinematic',                'シネマティック'],
  // 真俯瞰
  ['hair spread out',          '髪を広げた'],
  ['hair disheveled',          '髪が乱れた'],
  ['relaxed pose',             'リラックスポーズ'],
  ['white floor',              '白いフロア'],
  ['white sheets',             '白いシーツ'],
  ['bed sheet',                'ベッドシーツ'],
  ['soft lighting',            '柔らかい光'],
  ['fabric',                   '布地'],
  ['wrinkles',                 'しわ'],
  ['empty eyes',               'うつろな目'],
  ['vacant expression',        '虚ろな表情'],
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
  ['thick thighs',             '太もも太め'],
  ['plump',                    'ぽっちゃり'],
  ['wide hips',                '広い腰'],
  ['voluptuous',               'グラマラス'],
  // フェイス
  ['detailed lips',            '詳細な唇'],
  ['detailed pupils',          '詳細な瞳'],
  ['smug',                     '得意げ'],
  ['looking down at viewer',   '見下ろし目線'],
  // エフェクト
  ['flying debris',            '飛散する破片'],
  ['distorted background',     '歪んだ背景'],
  ['motion blur',              'モーションブラー'],
  // シチュ構図
  ['lying on stomach',         'うつ伏せ'],
  ['on elbows',                '肘をつく'],
  ['legs up',                  '足を上げる'],
  ['leg up',                   '足を上げる'],
  ['foot up',                  '足を上げる'],
  ['sole facing viewer',       '足裏をカメラへ'],
  ['hugging own legs',         '膝を抱える'],
  ['knees up',                 '膝立て'],
  ['on floor',                 '床の上'],
]);

// en → ja (ブロック + テンプレート専用の両方を検索)
function toJa(en) {
  const key = en.toLowerCase();
  return TAG_JA_MAP.get(key) ?? TEMPLATE_EXTRA_JA.get(key) ?? null;
}

const FETI_IDS    = new Set(['nape_lift','bare_back','armpitsleeveless','highangle_armpit','midriff_navel','zettairyouiki','skintight_detail','lowangle_legs','footperspective','birdseye_lie']);
const SITU_IDS    = new Set(['prone_elbow','floor_sit']);
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

export default function TemplateModal({ lang, isMobile, onApply, onClose }) {
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
              ? '💡 ネガ推奨タグ（💡）はネガティブブロックに自動追記。適用直後は「元に戻す」が12秒間使えます。'
              : '💡 Negative hints (💡) are auto-appended to the Negative block. An Undo button appears for 12 seconds after applying.'}
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
