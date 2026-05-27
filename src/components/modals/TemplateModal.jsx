import { TEMPLATES } from "../../data/templates.js";

const FETI_IDS    = new Set(['highangle_armpit','lowangle_legs','midriff_navel','nape_lift','birdseye_lie','skintight_detail']);
const DYNAMIC_IDS = new Set(['dynamic_booster','extreme_perspective']);
const EXTREME_IDS = new Set(['lip_focus','eye_focus','fisheye','from_below','from_above']);

const styleTemplates    = TEMPLATES.filter(t => t.apply.quality);
const basicCompTemplates = TEMPLATES.filter(t => !t.apply.quality && !FETI_IDS.has(t.id) && !DYNAMIC_IDS.has(t.id) && !EXTREME_IDS.has(t.id));
const fetiTemplates     = TEMPLATES.filter(t => FETI_IDS.has(t.id));
const dynamicTemplates  = TEMPLATES.filter(t => DYNAMIC_IDS.has(t.id));
const extremeTemplates  = TEMPLATES.filter(t => EXTREME_IDS.has(t.id));

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

function previewText(tmpl) {
  const first = Object.values(tmpl.apply)[0] ?? '';
  return first.length > 50 ? first.slice(0, 50) + '…' : first;
}

function TemplateCard({ tmpl, lang, onApply }) {
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
      <div className="text-accent text-[0.625rem] font-mono bg-bg px-2 py-[0.3125rem] rounded-[0.3125rem] break-all leading-[1.5] mb-2">
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
  const gridCls = isMobile ? 'grid grid-cols-2 gap-2' : 'grid gap-2';
  const gridStyle = isMobile ? {} : { gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' };

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
            {lang === 'ja'
              ? '対象ブロックに上書き適用されます。'
              : 'Applies directly to the target blocks.'}
          </p>
          <p className="text-[#f87171] text-[0.625rem] font-mono mb-4">
            {lang === 'ja'
              ? '⚠ 対象ブロックにすでに入っているタグは消えます。'
              : '⚠ Existing tags in the target blocks will be cleared.'}
          </p>

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">
            {lang === 'ja' ? 'スタイル' : 'Style'}
          </div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>
            {styleTemplates.map(tmpl => (
              <TemplateCard key={tmpl.id} tmpl={tmpl} lang={lang} onApply={onApply} />
            ))}
          </div>

          <div className="border-t border-dim mb-4" />

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">
            {lang === 'ja' ? '構図・設定資料（SFW）' : 'Composition / Reference'}
          </div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>
            {basicCompTemplates.map(tmpl => (
              <TemplateCard key={tmpl.id} tmpl={tmpl} lang={lang} onApply={onApply} />
            ))}
          </div>

          <div className="border-t border-dim mb-4" />

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">
            {lang === 'ja' ? 'フェチ構図（SFW）' : 'Flair / Feti Composition'}
          </div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>
            {fetiTemplates.map(tmpl => (
              <TemplateCard key={tmpl.id} tmpl={tmpl} lang={lang} onApply={onApply} />
            ))}
          </div>

          <div className="border-t border-dim mb-4" />

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">
            {lang === 'ja' ? 'ダイナミック' : 'Dynamic'}
          </div>
          <div className={`${gridCls} mb-4`} style={gridStyle}>
            {dynamicTemplates.map(tmpl => (
              <TemplateCard key={tmpl.id} tmpl={tmpl} lang={lang} onApply={onApply} />
            ))}
          </div>

          <div className="border-t border-dim mb-4" />

          <div className="text-muted text-[0.625rem] font-mono tracking-widest mb-2 uppercase">
            {lang === 'ja' ? '極限アングル・クローズアップ' : 'Extreme Close-Up'}
          </div>
          <div className={gridCls} style={gridStyle}>
            {extremeTemplates.map(tmpl => (
              <TemplateCard key={tmpl.id} tmpl={tmpl} lang={lang} onApply={onApply} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
