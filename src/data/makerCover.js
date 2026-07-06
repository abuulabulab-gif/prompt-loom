// ── メーカー置き換え・カバレッジ判定 ──────────────────────────────
// カラー/マテリアル/特徴/カットメーカーが生成する「修飾付きタグ」
// （例: black blazer uniform / silk skirt / inner orange hair）と、
// タグボタンで選んだ「素のタグ」（blazer uniform / skirt）の2重を解消する。
//
// 中核は stripMakerBase()：メーカーが付ける修飾語（色・明暗・素材・
// ヘアタイプ・左右）をタグ先頭から剥がして「ベースタグ」を得る。
//   black blazer uniform → blazer uniform
//   dark red hair        → hair
//   silk skirt           → skirt
//   inner orange hair    → inner hair（インナーは髪全体と別スロット扱い）
//
// これを使って、
//   applyMakerTags()    … 適用時に同ベースの旧タグを除去してから追記（置き換え）
//   isTagActive()       … ベースタグのボタンを「カバー中」も選択表示のまま維持
//   removeCoveringTags()… カバー中のボタンをOFFした時にメーカータグごと除去

import { splitTags, bareTag, hasTag, appendTag } from './constants.js';
import { COLOR_PALETTE, SHADES, COLOR_NAME_OVERRIDES } from './colors.js';
import { MATERIAL_PALETTE } from './materials.js';

// blocks.js の cats 側にありパレットに無い色語（blonde hair / golden eyes 等）
const EXTRA_COLOR_WORDS = ['blonde', 'grey', 'golden', 'amber', 'aqua', 'multicolored'];
// 髪カラータイプ（gradient hair 等 → ベースは hair）
const HAIR_TYPE_WORDS = ['gradient', 'two-tone', 'split-color'];
// カラーメーカーの左右指定（left bangs 等）
const SIDE_WORDS = ['left', 'right'];

// 長い語から先にマッチさせる（light blue が light より優先されるように）
const MAKER_PREFIXES = [...new Set([
  ...SHADES.map(s => s.en.trim()).filter(Boolean),
  ...COLOR_PALETTE.map(c => c.en.toLowerCase()),
  ...Object.values(COLOR_NAME_OVERRIDES).map(v => v.toLowerCase()),
  ...EXTRA_COLOR_WORDS,
  ...MATERIAL_PALETTE.map(m => m.en.toLowerCase()),
  ...HAIR_TYPE_WORDS,
  ...SIDE_WORDS,
])].sort((a, b) => b.length - a.length);

// タグ先頭のメーカー修飾語を剥がしてベースタグを返す（lowercase）
export function stripMakerBase(tagEn) {
  let t = tagEn.trim().toLowerCase();
  if (/^inner .+ hair$/.test(t)) return 'inner hair';   // インナーカラー専用スロット
  if (/^.+ and .+ eyes$/.test(t)) return 'eyes';        // オッドアイ（red and blue eyes）
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of MAKER_PREFIXES) {
      if (t.length > p.length + 1 && t.startsWith(p + ' ')) {
        t = t.slice(p.length + 1);
        changed = true;
        break;
      }
    }
  }
  return t;
}

// text 内に en をベースとするメーカータグがあるか（en そのものは除く）
export function isCoveredTag(text, en) {
  const enL = en.trim().toLowerCase();
  return splitTags(text).some(seg => {
    const bare = bareTag(seg).toLowerCase();
    return bare !== enL && stripMakerBase(bare) === enL;
  });
}

// タグボタンの選択表示：直接選択 or メーカータグにカバーされていれば ON
export const isTagActive = (text, en) => hasTag(text, en) || isCoveredTag(text, en);

// en 本体と、en をベースとするメーカータグをまとめて除去
export function removeCoveringTags(text, en) {
  const enL = en.trim().toLowerCase();
  return splitTags(text).filter(seg => {
    const bare = bareTag(seg).toLowerCase();
    return bare !== enL && stripMakerBase(bare) !== enL;
  }).join(', ');
}

// メーカータグ適用（置き換え式）：
// 1) 新タグと完全一致する旧タグを除去（重み付け直しも兼ねる）
// 2) 新タグと同じベースを持つ旧タグを除去（red hair → blonde hair を置換 等）
// 3) extraRemove で指定された素タグを除去（COLOR_BASE_REMOVE 等）
// その後、新タグを順に追記する。
export function applyMakerTags(text, tags, extraRemove = []) {
  const tagArray = Array.isArray(tags) ? tags : [tags];
  if (!tagArray.length) return text;
  const newSet = new Set(tagArray.map(t => t.trim().toLowerCase()));
  const bases  = new Set(tagArray.map(t => stripMakerBase(t)));
  const extra  = new Set(extraRemove.map(t => t.trim().toLowerCase()));
  const kept = splitTags(text).filter(seg => {
    const bare = bareTag(seg).toLowerCase();
    if (newSet.has(bare)) return false;
    if (extra.has(bare)) return false;
    if (bases.has(stripMakerBase(bare))) return false;
    return true;
  }).join(', ');
  return tagArray.reduce((acc, t) => appendTag(acc, t, '1.0'), kept);
}
