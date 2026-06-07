export const COLOR_PALETTE = [
  { ja:'赤',      en:'red',        hex:'#e23b3b' },
  { ja:'ピンク',  en:'pink',       hex:'#f06fa0' },
  { ja:'橙',      en:'orange',     hex:'#f08c3b' },
  { ja:'黄',      en:'yellow',     hex:'#f0d23b' },
  { ja:'緑',      en:'green',      hex:'#4caf50' },
  { ja:'青緑',    en:'teal',       hex:'#1fb8a6' },
  { ja:'水色',    en:'light blue', hex:'#5ec8f0' },
  { ja:'青',      en:'blue',       hex:'#3b6fe2' },
  { ja:'紺',      en:'navy blue',  hex:'#1e3a6e' },
  { ja:'紫',      en:'purple',     hex:'#9b4fe0' },
  { ja:'藤色',    en:'lavender',   hex:'#c9a6f0' },
  { ja:'茶',      en:'brown',      hex:'#8a5a3b' },
  { ja:'ベージュ',en:'beige',      hex:'#d8c0a0' },
  { ja:'白',      en:'white',      hex:'#f5f5f5' },
  { ja:'灰',      en:'gray',       hex:'#9098a8' },
  { ja:'黒',      en:'black',      hex:'#2a2a2e' },
  { ja:'金',      en:'gold',       hex:'#e0b84f' },
  { ja:'銀',      en:'silver',     hex:'#c0c8d0' },
];

export const SHADES = [
  { id:'dark',   ja:'濃い', en:'dark '  },
  { id:'normal', ja:'標準', en:''       },
  { id:'light',  ja:'薄い', en:'light ' },
];

export const COLOR_TARGETS = [
  // ── 髪全体（カラータイプ選択あり）─────────────────────────────
  { id:'hair',          ja:'髪全体',        en:'hair',           hairGroup:'full'    },
  // ── 前髪系（カラータイプ選択あり）──────────────────────────────
  { id:'bangs',         ja:'前髪',          en:'bangs',          hairGroup:'front'   },
  { id:'forelock',      ja:'前髪の一束',    en:'forelock',       hairGroup:'front'   },
  // ── 部分カラー（単色のみ）──────────────────────────────────────
  { id:'inner_hair',    ja:'インナー',      en:'inner hair',     hairGroup:'partial' },
  { id:'bang_streak',   ja:'メッシュ',      en:'streak in bangs',hairGroup:'partial' },
  { id:'hair_tips',     ja:'毛先',          en:'hair tips',      hairGroup:'partial' },
  { id:'sidelocks',     ja:'サイドヘア',    en:'sidelocks',      hairGroup:'partial' },
  // ── 瞳 ────────────────────────────────────────────────────────
  { id:'eyes',          ja:'瞳',            en:'eyes'             },
  { id:'heterochromia', ja:'オッドアイ',    en:'heterochromia'    },
  // ── キャラパーツ ──────────────────────────────────────────────
  { id:'nails',         ja:'爪',            en:'nails'       },
  { id:'tail_color',    ja:'しっぽ',        en:'tail'        },
  // ── 衣装 ──────────────────────────────────────────────────────
  { id:'dress',         ja:'服',            en:'dress'       },
  { id:'shirt',         ja:'シャツ',        en:'shirt'       },
  { id:'skirt',         ja:'スカート',      en:'skirt'       },
  { id:'jacket',        ja:'上着',          en:'jacket'      },
  { id:'ribbon',        ja:'リボン',        en:'ribbon'      },
  { id:'accents',       ja:'アクセント色',  en:'accents'     },
  { id:'trim',          ja:'縁取り',        en:'trim'        },
  { id:'embroidery',    ja:'刺繍',          en:'embroidery'  },
  { id:'lace',          ja:'レース',        en:'lace'        },
  { id:'shoes',         ja:'靴',            en:'footwear'    },
  { id:'stockings',    ja:'ストッキング',   en:'stockings'   },
  // ── メイク ────────────────────────────────────────────────────
  { id:'eyeshadow',    ja:'アイシャドウ',   en:'eyeshadow'   },
  { id:'lipstick',     ja:'口紅',           en:'lipstick'    },
  // ── その他 ────────────────────────────────────────────────────
  { id:'bg_color',      ja:'背景カラー',    en:'background'  },
];

// 髪カラータイプ（髪全体・前髪系用）
export const HAIR_TYPES = [
  { id:'single',   ja:'単色',       en:'Single',   desc:'単色で染める' },
  { id:'gradient', ja:'グラデ',     en:'Gradient', desc:'2色がグラデーションで変化' },
  { id:'twotone',  ja:'ツートン',   en:'Two-tone', desc:'2色がはっきり分かれる' },
  { id:'split',    ja:'スプリット', en:'Split',    desc:'左右で2色に分かれる' },
];

// 前髪用タイプ（グラデまでに限定）
export const FRONT_HAIR_TYPES = [
  { id:'single',   ja:'単色',   en:'Single',   desc:'単色で染める' },
  { id:'gradient', ja:'グラデ', en:'Gradient', desc:'2色がグラデーションで変化' },
];

// Overrides for shade+color combos that produce nonsensical/contradictory prompt text.
// Key = `${shadeEn}${colorEn}`.trim() — only problematic combinations are listed.
export const COLOR_NAME_OVERRIDES = {
  'light light blue': 'pale blue',
  'dark light blue':  'cerulean',
  'light navy blue':  'steel blue',
  'dark navy blue':   'midnight blue',
  'light black':      'charcoal',
  'dark black':       'jet black',
  'light white':      'ivory',
  'dark white':       'ash',
  'light gold':       'pale gold',
  'dark gold':        'antique gold',
};

export function buildColorName(shadeEn, colorEn) {
  const key = `${shadeEn}${colorEn}`.trim().toLowerCase();
  return COLOR_NAME_OVERRIDES[key] ?? `${shadeEn}${colorEn}`.trim();
}

export const buildColorTag = (shadeEn, colorEn, targetEn) => {
  const name = buildColorName(shadeEn, colorEn);
  if (targetEn === 'inner hair') return `inner ${name} hair`;
  return `${name} ${targetEn}`.trim();
};

// Hue groups for heterochromia random gen — picks from different groups to avoid same-hue pairs
export const HUE_GROUPS = [
  ['red', 'pink'],
  ['orange', 'yellow'],
  ['green', 'teal'],
  ['light blue', 'blue'],
  ['navy blue', 'purple'],
  ['lavender'],
  ['brown', 'beige', 'gold', 'silver'],
  ['white', 'gray'],
  ['black'],
];

// Reverse map: overrideValue → { shade, colorEn } — built once at module load
const _overrideReverse = (() => {
  const m = new Map();
  for (const [key, val] of Object.entries(COLOR_NAME_OVERRIDES)) {
    const spaceIdx = key.indexOf(' ');
    if (spaceIdx < 0) continue;
    const shadeId = key.slice(0, spaceIdx);
    const colorEn = key.slice(spaceIdx + 1);
    const shade   = SHADES.find(s => s.id === shadeId);
    if (shade) m.set(val.toLowerCase(), { shade, colorEn });
  }
  return m;
})();

function _resolveColorName(nameLower) {
  const rev = _overrideReverse.get(nameLower);
  if (rev) {
    const color = COLOR_PALETTE.find(c => c.en.toLowerCase() === rev.colorEn);
    if (color) return { shade: rev.shade, color };
  }
  const sortedShades = [...SHADES].sort((a, b) => b.en.length - a.en.length);
  for (const shade of sortedShades) {
    const prefix = shade.en.toLowerCase();
    if (prefix && !nameLower.startsWith(prefix)) continue;
    const colorEn = nameLower.slice(prefix.length);
    const color = COLOR_PALETTE.find(c => c.en.toLowerCase() === colorEn);
    if (color) return { shade, color };
  }
  return null;
}

// 髪カラータイプタグの日本語ラベル
const HAIR_TYPE_LABELS = {
  'gradient hair': 'グラデ髪', 'two-tone hair': 'ツートン髪',
  'split-color hair': 'スプリット髪', 'multicolored hair': 'マルチカラー髪',
};

// Reverse-parse a tag string to a Japanese label. Returns { en, ja } or null.
export function resolveColorLabel(tagEn) {
  if (!tagEn) return null;
  const tagLower = tagEn.trim().toLowerCase();

  // Hair type tags
  if (HAIR_TYPE_LABELS[tagLower]) return { en: tagEn.trim(), ja: HAIR_TYPE_LABELS[tagLower] };

  // Inner hair: "inner {name} hair"
  const innerM = tagLower.match(/^inner (.+) hair$/);
  if (innerM) {
    const r = _resolveColorName(innerM[1]);
    if (!r) return null;
    const ja = r.shade.id !== 'normal'
      ? `${r.shade.ja}${r.color.ja}インナー`
      : `${r.color.ja}インナー`;
    return { en: tagEn.trim(), ja };
  }

  // Normal: {shade}{color} {target}
  const sortedShades = [...SHADES].sort((a, b) => b.en.length - a.en.length);
  for (const shade of sortedShades) {
    const prefix = shade.en;
    if (prefix && !tagLower.startsWith(prefix)) continue;
    const withoutShade = tagLower.slice(prefix.length);
    for (const target of COLOR_TARGETS) {
      if (target.id === 'inner_hair' || target.id === 'heterochromia') continue;
      const suffix = ' ' + target.en.toLowerCase();
      if (!withoutShade.endsWith(suffix)) continue;
      const colorEn = withoutShade.slice(0, -suffix.length);
      const colorMatch = COLOR_PALETTE.find(c => c.en.toLowerCase() === colorEn);
      if (!colorMatch) continue;
      const ja = shade.id !== 'normal'
        ? `${shade.ja}${colorMatch.ja}${target.ja}`
        : `${colorMatch.ja}${target.ja}`;
      return { en: tagEn.trim(), ja };
    }
  }

  // Overridden color names: e.g., "pale blue eyes", "cerulean hair"
  for (const target of COLOR_TARGETS) {
    if (target.id === 'inner_hair' || target.id === 'heterochromia') continue;
    const suffix = ' ' + target.en.toLowerCase();
    if (!tagLower.endsWith(suffix)) continue;
    const namePart = tagLower.slice(0, -suffix.length);
    const rev = _overrideReverse.get(namePart);
    if (!rev) continue;
    const colorMatch = COLOR_PALETTE.find(c => c.en.toLowerCase() === rev.colorEn);
    if (!colorMatch) continue;
    return { en: tagEn.trim(), ja: `${rev.shade.ja}${colorMatch.ja}${target.ja}` };
  }

  return null;
}
