import { splitTags, bareTag } from '../data/constants.js';

// ── Helpers ──────────────────────────────────────────────────────────────────
function getTagLabels(blockText, cats) {
  const active = splitTags(blockText).map(bareTag).filter(Boolean);
  const allDefs = cats.flatMap(c => c.t);
  // Unknown tags (custom / manually typed) fall back to {en, ja: en} so they're not silently dropped
  return active.map(en => allDefs.find(d => d.en.toLowerCase() === en.toLowerCase()) || { en, ja: en });
}

function getBlock(blocks, id) {
  const b = blocks.find(b => b.id === id);
  return b?.text?.trim() ? getTagLabels(b.text, b.cats) : [];
}

// Tags that act as the subject (ignore when building appearance list)
const SUBJECT_TAGS = new Set(['solo','1girl','1boy','2girls','2boys',
  'multiple girls','multiple boys','androgynous','tomboy','1other']);

// Body tags that need a noun prefix in Japanese to avoid ambiguity
// e.g. "large breasts" → "大きめ" alone is confusing, needs "胸が大きめ"
function jaBodyTag(tag) {
  const en = tag.en.toLowerCase();
  if (en.includes('breast') || en.includes('bosom') || en === 'flat chest' || en === 'oppai') {
    return `胸が${tag.ja}`;
  }
  return tag.ja;
}

// ── Japanese natural language ─────────────────────────────────────────────────
const JA_SUBJECT_MAP = {
  '1girl': '女の子', '1boy': '男の子', 'solo': '1人のキャラクター',
  '2girls': '2人の女の子', '2boys': '2人の男の子',
  'multiple girls': '複数の女の子', 'multiple boys': '複数の男の子',
  'androgynous': '中性的なキャラクター', 'tomboy': 'ボーイッシュな女の子',
  '1other': '謎めいた存在',
};

export function toNaturalJa(blocks) {
  const style   = getBlock(blocks, 'artstyle');
  const attr    = getBlock(blocks, 'attribute');
  const face    = getBlock(blocks, 'face');
  const body    = getBlock(blocks, 'body');
  const outfit  = getBlock(blocks, 'outfit');
  const feature = getBlock(blocks, 'feature');
  const comp    = getBlock(blocks, 'composition');
  const bg      = getBlock(blocks, 'background');
  const light   = getBlock(blocks, 'lighting');
  const effect  = getBlock(blocks, 'effect');

  const parts = [];

  // Style
  if (style.length) {
    parts.push(style.map(t => t.ja).join('・') + 'の作風で、');
  }

  // Subject
  const subjectTag = attr.find(t => SUBJECT_TAGS.has(t.en));
  const subject = subjectTag
    ? (JA_SUBJECT_MAP[subjectTag.en] || subjectTag.ja)
    : 'キャラクター';

  // Attributes other than subject (species, age, special parts)
  const charAttrs = attr.filter(t => !SUBJECT_TAGS.has(t.en));

  // Appearance (face + body) — body tags use jaBodyTag for noun context
  const appearance = [...face, ...body];

  if (appearance.length || charAttrs.length) {
    const faceAttrs = charAttrs.map(t => t.ja);
    const faceLabels = face.map(t => t.ja);
    const bodyLabels = body.map(jaBodyTag);
    const all = [...faceAttrs, ...faceLabels, ...bodyLabels];
    parts.push(all.join('・') + 'の' + subject + 'が、');
  } else {
    parts.push(subject + 'が、');
  }

  // Outfit & accessories
  if (outfit.length) {
    parts.push(outfit.map(t => t.ja).join('・') + 'を身に纏い、');
  }

  // Special features (piercing, weapons, etc.)
  if (feature.length) {
    parts.push(feature.map(t => t.ja).join('・') + 'を持ち、');
  }

  // Composition / pose
  if (comp.length) {
    parts.push(comp.map(t => t.ja).join('・') + 'のポーズで、');
  }

  // Background
  if (bg.length) {
    parts.push(bg.map(t => t.ja).join('・') + 'を背景に、');
  }

  // Lighting
  if (light.length) {
    parts.push(light.map(t => t.ja).join('と') + 'の光の下、');
  }

  // Effects
  if (effect.length) {
    parts.push(effect.map(t => t.ja).join('・') + 'のエフェクトが加わっています。');
  }

  // Fix trailing comma → period
  if (parts.length) {
    const last = parts[parts.length - 1];
    if (last.endsWith('、')) {
      parts[parts.length - 1] = last.slice(0, -1) + '。';
    }
  }

  // Custom blocks — append raw text as fallback
  const customBlks = blocks.filter(b => b.isCustomBlock && b.text?.trim() && b.enabled !== false);
  for (const b of customBlks) {
    const t = b.text.trim();
    parts.push(t.endsWith('。') ? t : t + '。');
  }

  return parts.join('') || '（プロンプトが空です）';
}

// ── English natural language ──────────────────────────────────────────────────
const EN_SUBJECT_MAP = {
  '1girl': 'a girl', '1boy': 'a boy', 'solo': 'a lone character',
  '2girls': 'two girls', '2boys': 'two boys',
  'multiple girls': 'multiple girls', 'multiple boys': 'multiple boys',
  'androgynous': 'an androgynous character', 'tomboy': 'a tomboy',
  '1other': 'a mysterious figure',
};

export function toNaturalEn(blocks) {
  const style   = getBlock(blocks, 'artstyle');
  const attr    = getBlock(blocks, 'attribute');
  const face    = getBlock(blocks, 'face');
  const body    = getBlock(blocks, 'body');
  const outfit  = getBlock(blocks, 'outfit');
  const feature = getBlock(blocks, 'feature');
  const comp    = getBlock(blocks, 'composition');
  const bg      = getBlock(blocks, 'background');
  const light   = getBlock(blocks, 'lighting');
  const effect  = getBlock(blocks, 'effect');

  const sentences = [];

  // Subject + appearance
  const subjectTag = attr.find(t => SUBJECT_TAGS.has(t.en));
  const subject = subjectTag
    ? (EN_SUBJECT_MAP[subjectTag.en] || subjectTag.en)
    : 'a character';

  const charAttrs = attr.filter(t => !SUBJECT_TAGS.has(t.en)).map(t => t.en);
  const appearance = [...face, ...body].map(t => t.en);
  const allAttrs = [...charAttrs, ...appearance];

  const intro = style.length
    ? style.map(t => t.en).join(', ') + ' illustration of '
    : '';

  if (allAttrs.length) {
    sentences.push(intro + subject + ' with ' + allAttrs.join(', '));
  } else {
    sentences.push(intro + subject);
  }

  // Outfit
  if (outfit.length) {
    sentences.push('Dressed in ' + outfit.map(t => t.en).join(', '));
  }

  // Features
  if (feature.length) {
    sentences.push('Featuring ' + feature.map(t => t.en).join(', '));
  }

  // Composition + pose
  if (comp.length) {
    sentences.push(comp.map(t => t.en).join(', '));
  }

  // Setting
  const setting = [];
  if (bg.length)    setting.push(bg.map(t => t.en).join(', '));
  if (light.length) setting.push(light.map(t => t.en).join(', '));
  if (setting.length) sentences.push(setting.join(', '));

  // Effects
  if (effect.length) {
    sentences.push('Visual effects: ' + effect.map(t => t.en).join(', '));
  }

  // Custom blocks — append raw text as fallback
  const customBlksEn = blocks.filter(b => b.isCustomBlock && b.text?.trim() && b.enabled !== false);
  for (const b of customBlksEn) {
    const t = b.text.trim();
    sentences.push(t.endsWith('.') ? t : t + '.');
  }

  return sentences.join('. ') + (sentences.length ? '.' : '') || '(prompt is empty)';
}
