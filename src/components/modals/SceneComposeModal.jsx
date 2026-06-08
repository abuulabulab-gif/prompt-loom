import { useState } from "react";

const SCENE_POSITIONS = [
  { id: 'left',   ja: '左',   en: 'on the left'        },
  { id: 'center', ja: '中央', en: 'in the center'       },
  { id: 'right',  ja: '右',   en: 'on the right'        },
  { id: 'back',   ja: '後ろ', en: 'in the background'   },
];
const SCENE_RELATIONS = [
  { ja: '見つめ合う',       en: 'looking at each other'    },
  { ja: '手をつなぐ',       en: 'holding hands'             },
  { ja: '背中合わせ',       en: 'back to back'              },
  { ja: '抱き合う',         en: 'hugging'                   },
  { ja: '並んで立つ',       en: 'standing side by side'     },
  { ja: '対決・向き合う',   en: 'facing each other'         },
  { ja: '対峙（対立感）',   en: 'standoff'                  },
  { ja: '睨み合い',         en: 'confrontation'             },
  { ja: 'ライバル',         en: 'rivals'                    },
  { ja: '激しい視線',       en: 'intense stare'             },
  { ja: '緊迫した空気',     en: 'tense atmosphere'          },
  { ja: '寄り添う',         en: 'leaning on each other'     },
  { ja: '指定なし',         en: ''                          },
];

// 共演時にBREAKセグメントから除外するタグ（全体の人数タグと競合するため）
const COLLAB_REMOVE_TAGS = new Set([
  'solo','1girl','1boy','2girls','2boys','multiple girls','multiple boys','1other',
  'androgynous','femboy','tomboy',
]);
const charBodyText = char => {
  const ids = ['attribute', 'face', 'body', 'outfit', 'feature', 'effect'];
  const segs = char.blocks
    .filter(b => b.enabled !== false && ids.includes(b.id) && b.text?.trim())
    .flatMap(b => b.text.trim().split(',').map(s => s.trim()).filter(Boolean));
  return segs.filter(seg => {
    const bare = seg.replace(/^\(+/, '').replace(/:[0-9.]+\)+$/, '').replace(/\)+$/, '').trim().toLowerCase();
    return !COLLAB_REMOVE_TAGS.has(bare);
  }).join(', ');
};

export default function SceneComposeModal({ characters, lang, theme, onClose, defaultQuality = 'masterpiece, best quality, ultra-detailed' }) {
  const [selected, setSelected] = useState([]);
  const [relation, setRelation] = useState(SCENE_RELATIONS[0]);
  const [globalQuality, setGlobalQuality] = useState(defaultQuality || 'masterpiece, best quality, ultra-detailed');
  const [useBreak, setUseBreak] = useState(true);
  const [copied, setCopied] = useState(false);

  const toggleChar = charId => {
    setSelected(prev => {
      if (prev.find(s => s.charId === charId)) return prev.filter(s => s.charId !== charId);
      if (prev.length >= 3) return prev;
      const posUsed = prev.map(s => s.position);
      const nextPos = SCENE_POSITIONS.find(p => !posUsed.includes(p.id))?.id || 'center';
      return [...prev, { charId, position: nextPos }];
    });
  };
  const setPos = (charId, position) => setSelected(prev => prev.map(s => s.charId === charId ? { ...s, position } : s));

  const countTag = (() => {
    const genders = selected.map(s => {
      const char = characters.find(c => c.id === s.charId);
      const attrText = char?.blocks?.find(b => b.id === 'attribute')?.text ?? '';
      if (/\b1boy\b|\bmale\b/.test(attrText)) return 'boy';
      return 'girl';
    });
    const girls = genders.filter(g => g === 'girl').length;
    const boys  = genders.filter(g => g === 'boy').length;
    if (genders.length === 1) return girls ? '1girl' : '1boy';
    if (genders.length === 2) {
      if (girls === 2) return '2girls';
      if (boys === 2)  return '2boys';
      return '1girl, 1boy';
    }
    if (genders.length === 3) {
      if (girls === 3) return '3girls';
      if (boys === 3)  return '3boys';
      if (girls === 2) return '2girls, 1boy';
      return '1girl, 2boys';
    }
    return '2girls';
  })();

  const sep = useBreak ? ' BREAK ' : ', ';
  const charParts = selected.map(s => {
    const char = characters.find(c => c.id === s.charId);
    const pos = SCENE_POSITIONS.find(p => p.id === s.position);
    const body = charBodyText(char);
    return [body, pos?.en].filter(Boolean).join(', ');
  }).filter(Boolean);

  const relEn = relation.en;
  const built = (() => {
    if (selected.length <= 1) return [globalQuality.trim(), countTag, relEn, ...charParts].filter(Boolean).join(', ');
    const head = [globalQuality.trim(), countTag, relEn].filter(Boolean).join(', ');
    return [head, ...charParts].filter(Boolean).join(sep);
  })();

  const doCopy = () => {
    if (!built) return;
    navigator.clipboard.writeText(built).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[38.75rem] max-h-[90vh] overflow-y-auto p-[1.125rem]">

        <div className="flex items-center justify-between mb-1.5">
          <span className="text-fg text-[0.9375rem] font-extrabold">🎬 {lang === 'ja' ? 'キャラ共演' : 'Collab'}</span>
          <button onClick={onClose} className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>
        <div className="text-muted text-[0.6875rem] mb-3.5">
          {lang === 'ja' ? '保存済みキャラを2〜3人選んで1枚の画像用プロンプトに合成します' : 'Combine 2-3 saved characters into one image prompt'}
        </div>

        {/* Step 1: select chars */}
        <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">
          {lang === 'ja' ? `① キャラを選ぶ（${selected.length}/3）` : `① Select characters (${selected.length}/3)`}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {characters.map(c => {
            const sel = selected.find(s => s.charId === c.id);
            return (
              <div key={c.id} onClick={() => toggleChar(c.id)}
                style={{
                  background: sel ? c.color + '22' : 'rgb(var(--surface-alt))',
                  border: `1px solid ${sel ? c.color : 'rgb(var(--border))'}`,
                }}
                className="flex items-center gap-1.5 rounded-[0.5625rem] px-[0.6875rem] py-[0.4375rem] cursor-pointer transition-all duration-[120ms]">
                <span className="text-[0.9375rem]">{c.emoji}</span>
                <span style={{ color: sel ? c.color : 'rgb(var(--text))' }} className="text-xs font-semibold">{c.name}</span>
                {sel && <span style={{ color: c.color }} className="text-[0.625rem] font-mono">✓</span>}
              </div>
            );
          })}
        </div>

        {/* Step 2: positions */}
        {selected.length > 0 && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? '② 配置を決める' : '② Positions'}</div>
            <div className="mb-3.5">
              {selected.map(s => {
                const c = characters.find(ch => ch.id === s.charId);
                return (
                  <div key={s.charId} className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">{c.emoji}</span>
                    <span style={{ color: c.color }} className="text-xs font-semibold min-w-[4.375rem]">{c.name}</span>
                    <div className="flex gap-1">
                      {SCENE_POSITIONS.map(p => (
                        <button key={p.id} onClick={() => setPos(s.charId, p.id)}
                          style={{
                            background: s.position === p.id ? c.color + '22' : 'rgb(var(--surface-alt))',
                            border: `1px solid ${s.position === p.id ? c.color : 'rgb(var(--border))'}`,
                            color: s.position === p.id ? c.color : 'rgb(var(--muted))',
                          }}
                          className="rounded-[0.3125rem] px-[0.5625rem] py-[0.1875rem] text-[0.625rem] cursor-pointer font-mono">
                          {lang === 'ja' ? p.ja : p.en}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Step 3: relation */}
        {selected.length > 1 && (
          <>
            <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? '③ 関係性' : '③ Relationship'}</div>
            <div className="flex flex-wrap gap-[0.3125rem] mb-3.5">
              {SCENE_RELATIONS.map(r => (
                <button key={r.ja} onClick={() => setRelation(r)}
                  style={relation.ja === r.ja ? { background: 'rgb(var(--c-blue) / 0.13)' } : undefined}
                  className={`rounded-md px-2.5 py-1 text-[0.6875rem] cursor-pointer font-mono ${relation.ja === r.ja ? 'border border-accent text-accent' : 'bg-surfalt border border-line text-fg'}`}>
                  {lang === 'ja' ? r.ja : (r.en || 'none')}
                </button>
              ))}
            </div>
          </>
        )}

        {/* BREAK option */}
        {selected.length > 1 && (
          <div className="flex items-center gap-2.5 mb-3.5 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer text-fg text-[0.6875rem]">
              <input type="checkbox" checked={useBreak} onChange={e => setUseBreak(e.target.checked)} style={{ accentColor: 'rgb(var(--c-blue))' }} />
              {lang === 'ja' ? 'BREAK で区切る（色移り対策・NovelAI/SD推奨）' : 'Separate with BREAK (prevents color bleed, recommended for SD/NAI)'}
            </label>
          </div>
        )}

        {/* Global quality */}
        <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? '共通品質タグ' : 'Global quality'}</div>
        <input
          value={globalQuality}
          onChange={e => setGlobalQuality(e.target.value)}
          className="w-full bg-inputbg border border-line rounded-[0.4375rem] text-fg text-[0.6875rem] px-2.5 py-[0.4375rem] outline-none font-mono box-border mb-3.5"
        />

        {/* Output */}
        <div className="text-muted text-[0.625rem] font-mono mb-1.5 tracking-[0.07em]">{lang === 'ja' ? '合成プロンプト' : 'Combined prompt'}</div>
        <div
          className={`bg-inputbg border border-output-border rounded-lg px-3 py-2.5 text-xs font-mono min-h-[3.75rem] max-h-[8.75rem] overflow-y-auto leading-[1.6] break-all mb-3 select-all ${built ? 'text-prompt' : 'text-muted'}`}
        >
          {built || (lang === 'ja' ? 'キャラを選ぶと合成プロンプトが表示されます' : 'Select characters to build')}
        </div>

        <button
          onClick={doCopy}
          disabled={!built}
          style={(() => {
            const goodColor = theme === 'dark' ? '#4fffb0' : '#059655';
            return {
              background: copied ? goodColor + '20' : built ? 'linear-gradient(135deg,#4a6fff,#8a4fff)' : 'rgb(var(--dim))',
              border: `1px solid ${copied ? goodColor + '60' : 'transparent'}`,
              color: copied ? goodColor : built ? 'white' : 'rgb(var(--muted))',
            };
          })()}
          className="w-full rounded-[0.5625rem] py-[0.6875rem] text-[0.8125rem] font-bold cursor-pointer disabled:cursor-default tracking-[0.03em]"
        >
          {copied ? '✓ Copied!' : '📋 ' + (lang === 'ja' ? '合成プロンプトをコピー' : 'Copy combined prompt')}
        </button>

        {selected.length > 1 && !useBreak && (
          <div className="text-warn text-[0.625rem] font-mono text-center mt-2">
            ⚠️ {lang === 'ja' ? 'BREAK無しは色移りが起きやすいです' : 'Without BREAK, color bleeding is likely'}
          </div>
        )}
      </div>
    </div>
  );
}
