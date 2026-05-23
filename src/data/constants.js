// ── Character palette ────────────────────────────────────────
export const CHAR_COLORS = ['#f472b6','#c084fc','#60a5fa','#34d399','#fbbf24','#fb923c','#f87171','#22d3ee','#a78bfa','#86efac'];
export const CHAR_EMOJIS = ['✨','🌸','⭐','🔥','🌙','💫','🎀','🌊','🦋','🌺','🎭','👑','🐱','🦊','🐰','🐺','🐉','🌟'];

// ── Theme color objects (used by inline styles during migration) ──
export const THEMES = {
  dark:  { bg:'#08090f', surface:'#0e1017', surfaceAlt:'#13161f', border:'#1c2033', borderBright:'#2a3050', text:'#dde4ff', muted:'#52607a', dim:'#252a3a', panel:'#0c0f1a', inputBg:'#08090f' },
  light: { bg:'#f4f5fa', surface:'#ffffff', surfaceAlt:'#eef0f7', border:'#dde0ec', borderBright:'#c5cae0', text:'#1a1d2e', muted:'#7a82a0', dim:'#c0c5d8', panel:'#eef0f7', inputBg:'#ffffff' },
};

// ── Strength presets ─────────────────────────────────────────
export const STRENGTHS = [
  { v:'0.5', l:'最弱',  le:'Min'    },
  { v:'0.8', l:'弱',    le:'Weak'   },
  { v:'1.0', l:'標準',  le:'Norm'   },
  { v:'1.1', l:'やや強',le:'Mid'    },
  { v:'1.2', l:'強',    le:'Strong' },
  { v:'1.3', l:'最強',  le:'Max'    },
];

// ── Token length thresholds ──────────────────────────────────
export const WARN_LEN  = 500;
export const LIMIT_LEN = 750;

// ── Random-pick category priority ────────────────────────────
// Categories in this set are "optional" for 🎲 (picked with ~45% chance).
// Categories NOT in this set are "core" and always get a pick first.
export const OPTIONAL_CAT_NAMES = new Set([
  // 顔
  'インナーカラー', '前髪', '目つき・形', '眉', '口・歯', '髪飾り・毛流れ', 'メイク・顔演出',
  // 属性
  '年齢感', '特殊パーツ',
  // 体型
  '肌色', '細部', 'ボディフォーカス', '足',
  // 衣装
  '素材・装飾', '装飾アクセ',
  // 特徴
  'ピアス・刺青', '装備・ケア', '武器・小物',
  // エフェクト（全て任意）
  '魔法・オーラ', 'パーティクル', '天候・自然', '演出フィルタ',
  // 構図
  '手・指', '視線・演出', 'シチュ',
  // 背景
  '屋内', '時間・天気', '季節・雰囲気',
  // 品質
  '仕上がり', '顔の精細化',
  // アートスタイル（スタイルは外す → 常にコア扱い）
  '色調', 'レンダリング',
]);

// ── Species → Special Parts auto-link ───────────────────────
// When a species tag is toggled ON, these parts are auto-added to 特殊パーツ.
// When toggled OFF, parts are removed unless another active species still needs them.
export const SPECIES_PARTS_MAP = {
  'elf':         ['elf ears'],
  'dark elf':    ['elf ears'],
  'angel':       ['angel wings', 'halo'],
  'demon':       ['demon wings', 'demon tail', 'small horns'],
  'fairy':       ['fairy wings', 'elf ears'],
  'mermaid':     ['mermaid tail'],
  'dragon girl': ['dragon horns', 'dragon tail'],
  'kitsune':     ['fox ears', 'fox tail'],
  'doll':        ['ball joints'],
};

// ── Random generation: mutually exclusive category groups ────
// exclusiveGroups: within each inner array, at most one cat is picked
// skipIfPicked:    if cat[key] is picked, skip all cats in value[]
export const BLOCK_RANDOM_RULES = {
  background: {
    exclusiveGroups: [['シンプル', '屋外', '屋内']],
    skipIfPicked: { 'シンプル': ['時間・天気', '季節・雰囲気'] },
  },
};

// ── Utilities ────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 8);
export const tt  = (en, ja) => ({ en, ja });

export const fmtTag    = (en, str) => str === '1.0' ? en : `(${en}:${str})`;
export const appendTag = (cur, en, str) => {
  const f = fmtTag(en, str);
  const b = cur.trimEnd();
  return b ? (b.endsWith(',') ? b + ' ' + f : b + ', ' + f) : f;
};
export const countTags = t => t.split(',').map(s => s.trim()).filter(Boolean).length;
export const splitTags = t => t.split(',').map(s => s.trim()).filter(Boolean);
export const bareTag   = seg => {
  const m = seg.match(/^\(\s*(.+?)\s*:\s*[\d.]+\s*\)$/);
  if (m) return m[1].trim();
  return seg.replace(/^\(+|\)+$/g, '').trim();
};
export const hasTag    = (text, en) => splitTags(text).some(seg => bareTag(seg).toLowerCase() === en.toLowerCase());
export const removeTag = (text, en) => splitTags(text).filter(seg => bareTag(seg).toLowerCase() !== en.toLowerCase()).join(', ');
export const toggleTag = (text, en, str) => hasTag(text, en) ? removeTag(text, en) : appendTag(text, en, str);

export const deep = x => JSON.parse(JSON.stringify(x));
export const fmtTime = ts => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
export const downloadJSON = (data, name) => {
  const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const u = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = u; a.download = name; a.click();
  URL.revokeObjectURL(u);
};
export const stripWeights   = t => t.replace(/\(([^:()]+):[\d.]+\)/g, '$1');
export const toNaiWeights   = t => t.replace(/\(([^:()]+):([\d.]+)\)/g, '{$1:$2}');
export const clampW = v => {
  let n = Math.round(v * 100) / 100;
  if (n < 0.1) n = 0.1;
  if (n > 2.0) n = 2.0;
  return n.toFixed(2).replace(/0$/, '').replace(/\.$/, '');
};
