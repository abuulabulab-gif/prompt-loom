import { useState } from "react";
import { COLOR_PALETTE, SHADES, COLOR_TARGETS, buildColorTag } from "../../data/colors.js";

export default function ColorPickerModal({ lang, onApply, onClose, defaultTarget }) {
  const [shade, setShade] = useState('normal');
  const [color, setColor] = useState(COLOR_PALETTE[7]); // blue
  const [target, setTarget] = useState(
    defaultTarget ? (COLOR_TARGETS.find(t => t.id === defaultTarget) ?? COLOR_TARGETS[0]) : COLOR_TARGETS[0]
  );

  const shadeEn = SHADES.find(s => s.id === shade)?.en || '';
  const preview = target.id === 'theme'
    ? `${shadeEn}${color.en} theme`.trim()
    : buildColorTag(shadeEn, color.en, target.en);

  return (
    <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[27.5rem] max-h-[88vh] overflow-y-auto p-[1.125rem]">

        <div className="flex items-center justify-between mb-3.5">
          <span className="text-fg text-sm font-bold">🎨 {lang === 'ja' ? 'カラーメイカー' : 'Color Maker'}</span>
          <button onClick={onClose} className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        {/* Target */}
        <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? '① 部位を選ぶ' : '① Target'}</div>
        <div className="flex flex-wrap gap-[0.3125rem] mb-3.5">
          {COLOR_TARGETS.map(t => (
            <button key={t.id} onClick={() => setTarget(t)}
              className={`rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono ${target.id === t.id ? 'bg-[#6c8fff22] border border-accent text-accent' : 'bg-surfalt border border-line text-fg'}`}>
              {lang === 'ja' ? t.ja : t.en}
            </button>
          ))}
        </div>

        {/* Color swatches */}
        <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? '② 色を選ぶ' : '② Color'}</div>
        <div className="grid grid-cols-9 gap-[0.3125rem] mb-3.5">
          {COLOR_PALETTE.map(col => (
            <div key={col.en} onClick={() => setColor(col)} title={lang === 'ja' ? col.ja : col.en}
              style={{
                background: col.hex,
                border: `2px solid ${color.en === col.en ? '#6c8fff' : 'transparent'}`,
                boxShadow: color.en === col.en ? '0 0 0 2px rgba(108,143,255,0.3)' : 'none',
                aspectRatio: '1',
              }}
              className="rounded-[0.4375rem] cursor-pointer transition-all duration-[120ms]"
            />
          ))}
        </div>

        {/* Shade */}
        <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? '③ 明暗' : '③ Shade'}</div>
        <div className="flex gap-1.5 mb-4">
          {SHADES.map(s => (
            <button key={s.id} onClick={() => setShade(s.id)}
              className={`flex-1 rounded-[0.4375rem] p-2 text-xs cursor-pointer font-mono ${shade === s.id ? 'bg-[#6c8fff22] border border-accent text-accent font-bold' : 'bg-surfalt border border-line text-fg font-normal'}`}>
              {s.id === 'dark' ? '🌑 ' : s.id === 'light' ? '☀️ ' : '⚪ '}{lang === 'ja' ? s.ja : (s.en || 'normal')}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="bg-bg border border-line rounded-lg p-3 mb-3.5 flex items-center gap-3">
          <div style={{
            background: color.hex,
            filter: shade === 'dark' ? 'brightness(0.6)' : shade === 'light' ? 'brightness(1.4)' : 'none',
          }} className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div>
            <div className="text-muted text-[0.5625rem] font-mono mb-[0.1875rem]">{lang === 'ja' ? '生成されるタグ' : 'Generated tag'}</div>
            <code className="text-prompt text-[0.8125rem] font-mono">{preview}</code>
          </div>
        </div>

        <button
          onClick={() => onApply(shadeEn, color.en, target.en, target.id)}
          className="w-full border-none rounded-[0.5625rem] py-[0.6875rem] text-white text-[0.8125rem] font-bold cursor-pointer tracking-[0.03em] bg-[linear-gradient(135deg,#4a6fff,#8a4fff)]"
        >
          + {lang === 'ja' ? `「${target.ja}」ブロックに追加` : 'Add to block'}
        </button>
        <div className="text-dim text-[0.625rem] font-mono text-center mt-2">
          {lang === 'ja' ? '※ 連続で追加できます' : '※ Add multiple in a row'}
        </div>
      </div>
    </div>
  );
}
