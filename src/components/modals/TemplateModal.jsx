import { TEMPLATES } from "../../data/templates.js";

export default function TemplateModal({ lang, onApply, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/85 z-[300] flex items-center justify-center p-5">
      <div className="bg-surface border border-linebright rounded-[14px] w-full max-w-[560px] overflow-hidden">
        <div className="px-[18px] py-[14px] border-b border-line flex items-center justify-between">
          <span className="text-fg text-[14px] font-bold">✦ {lang === 'ja' ? 'ブロックテンプレート' : 'Block Templates'}</span>
          <button onClick={onClose} className="bg-transparent border border-dim rounded-[6px] px-[10px] py-1 text-muted cursor-pointer text-[12px]">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        <div className="px-[18px] py-[14px]">
          <p className="text-muted text-[11px] font-mono mb-3">
            {lang === 'ja'
              ? '品質・スタイルブロックにテンプレートを適用します。他のブロックはそのまま保持されます。'
              : 'Applies to Quality and Style blocks only. Other blocks are preserved.'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map(tmpl => (
              <div
                key={tmpl.id}
                onClick={() => onApply(tmpl)}
                onMouseOver={e => { e.currentTarget.style.border = '1px solid #6c8fff60'; e.currentTarget.style.background = 'rgb(var(--dim))'; }}
                onMouseOut={e => { e.currentTarget.style.border = ''; e.currentTarget.style.background = ''; }}
                className="bg-surfalt border border-line rounded-[10px] p-[14px] cursor-pointer transition-all duration-150"
              >
                <div className="text-[24px] mb-[6px]">{tmpl.icon}</div>
                <div className="text-fg text-[13px] font-bold mb-[3px]">{lang === 'ja' ? tmpl.name : tmpl.nameEn}</div>
                <div className="text-muted text-[11px] mb-2">{lang === 'ja' ? tmpl.desc : tmpl.descEn}</div>
                <div className="text-accent text-[10px] font-mono bg-bg px-2 py-[5px] rounded-[5px] break-all leading-[1.5]">
                  {tmpl.apply.quality?.slice(0, 50)}…
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
