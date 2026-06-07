import { useState } from "react";
import { COLOR_PALETTE, SHADES, COLOR_TARGETS, HAIR_TYPES, FRONT_HAIR_TYPES, buildColorTag, buildColorName,
  CM_PRIMARY_OUTFIT_TAGS, CM_OUTFIT_TOPS, CM_OUTFIT_BOTTOMS, CM_OUTFIT_OUTER, CM_OUTFIT_FOOTWEAR, CM_OUTFIT_LEGWEAR,
} from "../../data/colors.js";
import { hasTag } from "../../data/constants.js";

const ACCENT   = '#6c8fff';
const HAIR_ACC = '#a78bfa';
const EYE2_ACC = '#ff6ca8';

function shadeFilter(id) {
  return id === 'dark' ? 'brightness(0.6)' : id === 'light' ? 'brightness(1.4)' : 'none';
}

function buildHairTags(type, targetEn, c1Name, c2Name) {
  const base = targetEn === 'hair'
    ? { gradient:'gradient hair', twotone:'two-tone hair', split:'split-color hair' }[type]
    : `gradient ${targetEn}`;
  return base
    ? [base, `${c1Name} ${targetEn}`, `${c2Name} ${targetEn}`]
    : [`${c1Name} ${targetEn}`];
}

function ColorSwatch({ sel, set, lang, acc }) {
  return (
    <div className="grid grid-cols-9 gap-[0.3125rem] mb-2">
      {COLOR_PALETTE.map(c => (
        <div key={c.en} onClick={() => set(c)} title={lang === 'ja' ? c.ja : c.en}
          style={{ background: c.hex, aspectRatio:'1',
            border:`2px solid ${sel.en === c.en ? acc : 'transparent'}`,
            boxShadow: sel.en === c.en ? `0 0 0 2px ${acc}44` : 'none' }}
          className="rounded-[0.4375rem] cursor-pointer transition-all duration-[120ms]" />
      ))}
    </div>
  );
}

function ShadeButtons({ sel, set, lang, acc }) {
  return (
    <div className="flex gap-1.5 mb-4">
      {SHADES.map(s => (
        <button key={s.id} onClick={() => set(s.id)}
          style={sel === s.id ? { background: acc + '22', borderColor: acc, color: acc } : {}}
          className={`flex-1 rounded-[0.4375rem] p-2 text-xs cursor-pointer font-mono border ${sel === s.id ? 'font-bold' : 'bg-surfalt border-line text-fg'}`}>
          {s.id === 'dark' ? '🌑 ' : s.id === 'light' ? '☀️ ' : '⚪ '}{lang === 'ja' ? s.ja : (s.en || 'normal')}
        </button>
      ))}
    </div>
  );
}

const STEP = ['①','②','③','④','⑤','⑥'];

const DYNAMIC_TARGET_MAP = {
  outfit_main: CM_PRIMARY_OUTFIT_TAGS,
  top:         CM_OUTFIT_TOPS,
  bottom:      CM_OUTFIT_BOTTOMS,
  outer:       CM_OUTFIT_OUTER,
  footwear:    CM_OUTFIT_FOOTWEAR,
  legwear:     CM_OUTFIT_LEGWEAR,
};
function getDynamicTag(targetId, blockText) {
  const list = DYNAMIC_TARGET_MAP[targetId];
  if (!list || !blockText) return null;
  return list.find(t => hasTag(blockText, t)) || null;
}

export default function ColorPickerModal({ lang, onApply, onClose, defaultTarget, allowedTargets, blockText }) {
  const available = allowedTargets
    ? COLOR_TARGETS.filter(t => allowedTargets.includes(t.id))
    : COLOR_TARGETS;

  const hairFull    = available.filter(t => t.hairGroup === 'full');
  const hairFront   = available.filter(t => t.hairGroup === 'front');
  const hairPartial = available.filter(t => t.hairGroup === 'partial');
  const nonHair     = available.filter(t => !t.hairGroup);
  const isHairMode  = hairFull.length > 0 || hairFront.length > 0 || hairPartial.length > 0;

  const getInitial = () => {
    const dt = COLOR_TARGETS.find(t => t.id === defaultTarget);
    if (dt && available.some(t => t.id === dt.id)) return dt;
    return available[0] ?? COLOR_TARGETS[0];
  };

  const [target,   setTarget]   = useState(getInitial);
  const [hairType, setHairType] = useState('single');
  const [shade,    setShade]    = useState('normal');
  const [color,    setColor]    = useState(COLOR_PALETTE[7]);
  const [shade2,   setShade2]   = useState('normal');
  const [color2,   setColor2]   = useState(COLOR_PALETTE[0]);

  const tg       = target?.hairGroup;
  const isHetero = target?.id === 'heterochromia';
  const isFull   = tg === 'full';
  const isFront  = tg === 'front';
  const isPart   = tg === 'partial';
  const isDual   = isHetero || ((isFull || isFront) && hairType !== 'single');
  const types    = isFull ? HAIR_TYPES : isFront ? FRONT_HAIR_TYPES : null;

  const sh1 = SHADES.find(s => s.id === shade)?.en  || '';
  const sh2 = SHADES.find(s => s.id === shade2)?.en || '';
  const c1Name = buildColorName(sh1, color.en);
  const c2Name = buildColorName(sh2, color2.en);

  const effectiveEn = getDynamicTag(target?.id, blockText) ?? target?.en ?? '';
  const preview = isHetero
    ? `${c1Name} and ${c2Name} eyes, heterochromia`
    : ((isFull || isFront) && hairType !== 'single')
      ? buildHairTags(hairType, target.en, c1Name, c2Name).join(', ')
      : buildColorTag(sh1, color.en, effectiveEn);

  const handleApply = () => {
    if (isHetero) { onApply([`${c1Name} and ${c2Name} eyes`, 'heterochromia'], target.id); return; }
    if ((isFull || isFront) && hairType !== 'single') { onApply(buildHairTags(hairType, target.en, c1Name, c2Name), target.id); return; }
    onApply([buildColorTag(sh1, color.en, effectiveEn)], target.id);
  };

  const setTgt = (t) => { setTarget(t); if (t.hairGroup !== 'full' && t.hairGroup !== 'front') setHairType('single'); };
  const acc    = isHairMode && (isFull || isFront || isPart) ? HAIR_ACC : ACCENT;
  const singleMode = !isHairMode && available.length === 1;

  // ステップ番号を動的に計算
  let si = 0;
  const showAreaStep   = !singleMode;
  const showFrontSub   = isFront && hairFront.length > 1;
  const showPartSub    = isPart;
  const showTypeStep   = Boolean(types);
  const areaStep  = showAreaStep   ? STEP[si++] : null;
  const frontStep = showFrontSub   ? STEP[si++] : null;
  const partStep  = showPartSub    ? STEP[si++] : null;
  const typeStep  = showTypeStep   ? STEP[si++] : null;
  const col1Step  = STEP[si++];
  const shd1Step  = isDual ? null : STEP[si++];
  const col2Step  = isDual ? STEP[si++] : null;
  if (isDual) si++; // reserve step slot for 2nd shade (not labeled in UI)

  const chipCls = (active) => `rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono ${active ? 'font-bold border' : 'bg-surfalt border border-line text-fg'}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[27.5rem] max-h-[88vh] overflow-y-auto p-[1.125rem]">

        <div className="flex items-center justify-between mb-3.5">
          <span className="text-fg text-sm font-bold">🎨 {lang === 'ja' ? 'カラーメーカー' : 'Color Maker'}</span>
          <button onClick={onClose} className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        {/* 部位 */}
        {showAreaStep && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {lang === 'ja' ? `${areaStep} 部位を選ぶ` : `${areaStep} Target`}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem] mb-3.5">
              {hairFull.length > 0 && (
                <button onClick={() => setTgt(hairFull[0])}
                  style={isFull ? { background: HAIR_ACC+'22', borderColor: HAIR_ACC, color: HAIR_ACC } : {}}
                  className={chipCls(isFull)}>
                  {lang === 'ja' ? '髪全体' : 'Full Hair'}
                </button>
              )}
              {hairFront.length > 0 && (
                <button onClick={() => setTgt(hairFront[0])}
                  style={isFront ? { background: HAIR_ACC+'22', borderColor: HAIR_ACC, color: HAIR_ACC } : {}}
                  className={chipCls(isFront)}>
                  {lang === 'ja' ? '前髪' : 'Front Hair'}
                </button>
              )}
              {hairPartial.length > 0 && (
                <button onClick={() => setTgt(hairPartial[0])}
                  style={isPart ? { background: HAIR_ACC+'22', borderColor: HAIR_ACC, color: HAIR_ACC } : {}}
                  className={chipCls(isPart)}>
                  {lang === 'ja' ? '部分カラー' : 'Partial Color'}
                </button>
              )}
              {nonHair.map(t => (
                <button key={t.id} onClick={() => setTgt(t)}
                  style={target?.id === t.id ? { background: ACCENT+'22', borderColor: ACCENT, color: ACCENT } : {}}
                  className={chipCls(target?.id === t.id)}>
                  {lang === 'ja' ? t.ja : t.en}
                </button>
              ))}
            </div>
          </>
        )}

        {/* 前髪のどれか */}
        {showFrontSub && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {lang === 'ja' ? `${frontStep} 前髪の種類` : `${frontStep} Front Hair`}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem] mb-3.5">
              {hairFront.map(t => (
                <button key={t.id} onClick={() => setTarget(t)}
                  style={target?.id === t.id ? { background: HAIR_ACC+'22', borderColor: HAIR_ACC, color: HAIR_ACC } : {}}
                  className={chipCls(target?.id === t.id)}>
                  {lang === 'ja' ? t.ja : t.en}
                </button>
              ))}
            </div>
          </>
        )}

        {/* 部分カラー：部位 */}
        {showPartSub && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {lang === 'ja' ? `${partStep} カラー部位` : `${partStep} Color Area`}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem] mb-3.5">
              {hairPartial.map(t => (
                <button key={t.id} onClick={() => setTarget(t)}
                  style={target?.id === t.id ? { background: HAIR_ACC+'22', borderColor: HAIR_ACC, color: HAIR_ACC } : {}}
                  className={chipCls(target?.id === t.id)}>
                  {lang === 'ja' ? t.ja : t.en}
                </button>
              ))}
            </div>
          </>
        )}

        {/* カラータイプ */}
        {showTypeStep && types && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
              {lang === 'ja' ? `${typeStep} カラータイプ` : `${typeStep} Color Type`}
            </div>
            <div className="flex flex-wrap gap-[0.3125rem] mb-1">
              {types.map(ht => (
                <button key={ht.id} onClick={() => setHairType(ht.id)}
                  style={hairType === ht.id ? { background: HAIR_ACC+'22', borderColor: HAIR_ACC, color: HAIR_ACC } : {}}
                  className={chipCls(hairType === ht.id)} title={ht.desc}>
                  {lang === 'ja' ? ht.ja : ht.en}
                </button>
              ))}
            </div>
            {hairType !== 'single' && types.find(t => t.id === hairType)?.desc && (
              <div className="text-dim text-[0.5625rem] font-mono mb-3">
                💡 {types.find(t => t.id === hairType).desc}
              </div>
            )}
            {hairType === 'single' && <div className="mb-3" />}
          </>
        )}

        {/* 色 / 明暗 */}
        {isHetero ? (
          <>
            <div className="text-[0.625rem] font-mono mb-1.5 font-bold tracking-[0.07em]" style={{ color: ACCENT }}>{lang === 'ja' ? `${col1Step} 左目の色` : `${col1Step} Left eye`}</div>
            <ColorSwatch sel={color} set={setColor} lang={lang} acc={ACCENT} />
            <ShadeButtons sel={shade} set={setShade} lang={lang} acc={ACCENT} />
            <div className="text-[0.625rem] font-mono mb-1.5 font-bold tracking-[0.07em]" style={{ color: EYE2_ACC }}>{lang === 'ja' ? `${col2Step} 右目の色` : `${col2Step} Right eye`}</div>
            <ColorSwatch sel={color2} set={setColor2} lang={lang} acc={EYE2_ACC} />
            <ShadeButtons sel={shade2} set={setShade2} lang={lang} acc={EYE2_ACC} />
          </>
        ) : isDual ? (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? `${col1Step} カラー①` : `${col1Step} Color 1`}</div>
            <ColorSwatch sel={color} set={setColor} lang={lang} acc={HAIR_ACC} />
            <ShadeButtons sel={shade} set={setShade} lang={lang} acc={HAIR_ACC} />
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? `${col2Step} カラー②` : `${col2Step} Color 2`}</div>
            <ColorSwatch sel={color2} set={setColor2} lang={lang} acc={HAIR_ACC} />
            <ShadeButtons sel={shade2} set={setShade2} lang={lang} acc={HAIR_ACC} />
          </>
        ) : (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? `${col1Step} 色を選ぶ` : `${col1Step} Color`}</div>
            <ColorSwatch sel={color} set={setColor} lang={lang} acc={acc} />
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? `${shd1Step} 明暗` : `${shd1Step} Shade`}</div>
            <ShadeButtons sel={shade} set={setShade} lang={lang} acc={acc} />
          </>
        )}

        {/* プレビュー */}
        <div className="bg-bg border border-line rounded-lg p-3 mb-3.5 flex items-center gap-3">
          {isDual ? (
            <div className="flex gap-0.5 flex-shrink-0">
              <div style={{ background: color.hex, filter: shadeFilter(shade) }} className="w-5 h-10 rounded-l-lg" />
              <div style={{ background: color2.hex, filter: shadeFilter(shade2) }} className="w-5 h-10 rounded-r-lg" />
            </div>
          ) : (
            <div style={{ background: color.hex, filter: shadeFilter(shade) }} className="w-10 h-10 rounded-lg flex-shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-muted text-[0.5625rem] font-mono mb-[0.1875rem]">{lang === 'ja' ? '生成されるタグ' : 'Generated tag'}</div>
            <code className="text-prompt text-[0.8125rem] font-mono break-all">{preview}</code>
          </div>
        </div>

        <button onClick={handleApply}
          className="w-full border-none rounded-[0.5625rem] py-[0.6875rem] text-white text-[0.8125rem] font-bold cursor-pointer tracking-[0.03em] bg-[linear-gradient(135deg,#4a6fff,#8a4fff)]">
          + {lang === 'ja' ? `「${target?.ja ?? '?'}」ブロックに追加` : 'Add to block'}
        </button>
        <div className="text-dim text-[0.625rem] font-mono text-center mt-2">
          {lang === 'ja' ? '※ 連続で追加できます' : '※ Add multiple in a row'}
        </div>
      </div>
    </div>
  );
}
