import { useState } from "react";
import { COLOR_PALETTE, SHADES, COLOR_TARGETS, buildColorTag, buildColorName } from "../../data/colors.js";

const EYE1_ACCENT = '#6c8fff';
const EYE2_ACCENT = '#ff6ca8';

function shadeFilter(shadeId) {
  if (shadeId === 'dark')  return 'brightness(0.6)';
  if (shadeId === 'light') return 'brightness(1.4)';
  return 'none';
}

export default function ColorPickerModal({ lang, onApply, onClose, defaultTarget, allowedTargets }) {
  const availableTargets = allowedTargets
    ? COLOR_TARGETS.filter(t => allowedTargets.includes(t.id))
    : COLOR_TARGETS;
  const singleMode = availableTargets.length === 1;

  const [shade, setShade]   = useState('normal');
  const [color, setColor]   = useState(COLOR_PALETTE[7]); // blue
  const [shade2, setShade2] = useState('normal');
  const [color2, setColor2] = useState(COLOR_PALETTE[0]); // red
  const [target, setTarget] = useState(
    defaultTarget
      ? (availableTargets.find(t => t.id === defaultTarget) ?? availableTargets[0])
      : availableTargets[0]
  );

  const shadeEn  = SHADES.find(s => s.id === shade)?.en  || '';
  const shade2En = SHADES.find(s => s.id === shade2)?.en || '';
  const isHeterochromia = target.id === 'heterochromia';

  const preview = isHeterochromia
    ? `${buildColorName(shadeEn, color.en)} and ${buildColorName(shade2En, color2.en)} eyes, heterochromia`
    : buildColorTag(shadeEn, color.en, target.en);

  const stepA = singleMode ? '①' : '②';
  const stepB = singleMode ? '②' : '③';

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

        {/* Target — hidden in single-target mode */}
        {!singleMode && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? '① 部位を選ぶ' : '① Target'}</div>
            <div className="flex flex-wrap gap-[0.3125rem] mb-3.5">
              {availableTargets.map(t => (
                <button key={t.id} onClick={() => setTarget(t)}
                  className={`rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono ${target.id === t.id ? 'bg-[#6c8fff22] border border-accent text-accent' : 'bg-surfalt border border-line text-fg'}`}>
                  {lang === 'ja' ? t.ja : t.en}
                </button>
              ))}
            </div>
          </>
        )}

        {isHeterochromia ? (
          /* Dual-color mode for heterochromia */
          <>
            <div className="text-[0.625rem] font-mono mb-1.5 tracking-[0.07em] font-bold" style={{ color: EYE1_ACCENT }}>
              {lang === 'ja' ? '② 左目の色' : '② Left eye'}
            </div>
            <div className="grid grid-cols-9 gap-[0.3125rem] mb-2">
              {COLOR_PALETTE.map(col => (
                <div key={col.en} onClick={() => setColor(col)} title={lang === 'ja' ? col.ja : col.en}
                  style={{
                    background: col.hex,
                    border: `2px solid ${color.en === col.en ? EYE1_ACCENT : 'transparent'}`,
                    boxShadow: color.en === col.en ? `0 0 0 2px ${EYE1_ACCENT}44` : 'none',
                    aspectRatio: '1',
                  }}
                  className="rounded-[0.4375rem] cursor-pointer transition-all duration-[120ms]"
                />
              ))}
            </div>
            <div className="flex gap-1.5 mb-4">
              {SHADES.map(s => (
                <button key={s.id} onClick={() => setShade(s.id)}
                  style={shade === s.id ? { background: EYE1_ACCENT + '22', borderColor: EYE1_ACCENT, color: EYE1_ACCENT } : {}}
                  className={`flex-1 rounded-[0.4375rem] p-2 text-xs cursor-pointer font-mono border ${shade === s.id ? 'font-bold' : 'bg-surfalt border-line text-fg font-normal'}`}>
                  {s.id === 'dark' ? '🌑 ' : s.id === 'light' ? '☀️ ' : '⚪ '}{lang === 'ja' ? s.ja : (s.en || 'normal')}
                </button>
              ))}
            </div>

            <div className="text-[0.625rem] font-mono mb-1.5 tracking-[0.07em] font-bold" style={{ color: EYE2_ACCENT }}>
              {lang === 'ja' ? '③ 右目の色' : '③ Right eye'}
            </div>
            <div className="grid grid-cols-9 gap-[0.3125rem] mb-2">
              {COLOR_PALETTE.map(col => (
                <div key={col.en + '_2'} onClick={() => setColor2(col)} title={lang === 'ja' ? col.ja : col.en}
                  style={{
                    background: col.hex,
                    border: `2px solid ${color2.en === col.en ? EYE2_ACCENT : 'transparent'}`,
                    boxShadow: color2.en === col.en ? `0 0 0 2px ${EYE2_ACCENT}44` : 'none',
                    aspectRatio: '1',
                  }}
                  className="rounded-[0.4375rem] cursor-pointer transition-all duration-[120ms]"
                />
              ))}
            </div>
            <div className="flex gap-1.5 mb-4">
              {SHADES.map(s => (
                <button key={s.id + '_2'} onClick={() => setShade2(s.id)}
                  style={shade2 === s.id ? { background: EYE2_ACCENT + '22', borderColor: EYE2_ACCENT, color: EYE2_ACCENT } : {}}
                  className={`flex-1 rounded-[0.4375rem] p-2 text-xs cursor-pointer font-mono border ${shade2 === s.id ? 'font-bold' : 'bg-surfalt border-line text-fg font-normal'}`}>
                  {s.id === 'dark' ? '🌑 ' : s.id === 'light' ? '☀️ ' : '⚪ '}{lang === 'ja' ? s.ja : (s.en || 'normal')}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Standard single-color mode */
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? `${stepA} 色を選ぶ` : `${stepA} Color`}</div>
            <div className="grid grid-cols-9 gap-[0.3125rem] mb-3.5">
              {COLOR_PALETTE.map(col => (
                <div key={col.en} onClick={() => setColor(col)} title={lang === 'ja' ? col.ja : col.en}
                  style={{
                    background: col.hex,
                    border: `2px solid ${color.en === col.en ? EYE1_ACCENT : 'transparent'}`,
                    boxShadow: color.en === col.en ? `0 0 0 2px ${EYE1_ACCENT}44` : 'none',
                    aspectRatio: '1',
                  }}
                  className="rounded-[0.4375rem] cursor-pointer transition-all duration-[120ms]"
                />
              ))}
            </div>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? `${stepB} 明暗` : `${stepB} Shade`}</div>
            <div className="flex gap-1.5 mb-4">
              {SHADES.map(s => (
                <button key={s.id} onClick={() => setShade(s.id)}
                  className={`flex-1 rounded-[0.4375rem] p-2 text-xs cursor-pointer font-mono ${shade === s.id ? 'bg-[#6c8fff22] border border-accent text-accent font-bold' : 'bg-surfalt border border-line text-fg font-normal'}`}>
                  {s.id === 'dark' ? '🌑 ' : s.id === 'light' ? '☀️ ' : '⚪ '}{lang === 'ja' ? s.ja : (s.en || 'normal')}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Preview */}
        <div className="bg-bg border border-line rounded-lg p-3 mb-3.5 flex items-center gap-3">
          {isHeterochromia ? (
            <div className="flex gap-0.5 flex-shrink-0">
              <div style={{ background: color.hex, filter: shadeFilter(shade) }} className="w-5 h-10 rounded-l-lg" />
              <div style={{ background: color2.hex, filter: shadeFilter(shade2) }} className="w-5 h-10 rounded-r-lg" />
            </div>
          ) : (
            <div style={{ background: color.hex, filter: shadeFilter(shade) }} className="w-10 h-10 rounded-lg flex-shrink-0" />
          )}
          <div>
            <div className="text-muted text-[0.5625rem] font-mono mb-[0.1875rem]">{lang === 'ja' ? '生成されるタグ' : 'Generated tag'}</div>
            <code className="text-prompt text-[0.8125rem] font-mono break-all">{preview}</code>
          </div>
        </div>

        <button
          onClick={() => onApply(shadeEn, color.en, target.en, target.id, shade2En, color2.en)}
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
