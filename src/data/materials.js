// ── マテリアルメーカー用データ ────────────────────────────────────
// カラーメーカー（colors.js）と対になる素材指定システム。
// buildMaterialTag('silk', 'skirt') → 'silk skirt'
// buildMaterialTag('lace', 'sleeves') → 'lace sleeves'

import { hasTag, appendTag } from './constants.js';

// ── 素材パレット ──────────────────────────────────────────────────
// adult: true → 成人コンテキスト外では重みを 0.1 倍に抑制
export const MATERIAL_PALETTE = [
  // 光沢・高級素材
  { en: 'silk',        ja: 'シルク',           weight: 1.0 },
  { en: 'satin',       ja: 'サテン',           weight: 1.0 },
  { en: 'velvet',      ja: 'ベルベット',       weight: 1.0 },
  // レース・装飾系
  { en: 'lace',        ja: 'レース',           weight: 1.2 },
  { en: 'lace-trimmed',ja: 'レーストリム',     weight: 0.9 },
  { en: 'embroidered', ja: '刺繍入り',         weight: 0.8 },
  { en: 'sequined',    ja: 'スパンコール入り', weight: 0.5 },
  // 特殊素材
  { en: 'leather',     ja: 'レザー',           weight: 0.9 },
  { en: 'fur',         ja: 'ファー',           weight: 0.7 },
  { en: 'knit',        ja: 'ニット',           weight: 0.9 },
  { en: 'mesh',        ja: 'メッシュ',         weight: 0.8 },
  // 条件付き・成人寄り
  { en: 'sheer',       ja: 'シアー',           weight: 0.7, adult: true },
  { en: 'fishnet',     ja: 'フィッシュネット', weight: 0.6, adult: true },
  { en: 'latex',       ja: 'ラテックス',       weight: 0.4, adult: true, rare: true },
];

// ── 衣装部位（素材の貼り先）─────────────────────────────────────
// triggers: この部位が有効になる衣装タグ
// combinable: nullなら全素材OK、Set指定なら許可素材のみ
export const MATERIAL_TARGETS = [
  {
    id: 'dress',
    ja: 'ドレス',
    en: 'dress',
    triggers: new Set(['dress','sundress','sweater dress','wedding dress','evening gown','cheongsam','hanfu','furisode','kimono','yukata','shrine maiden','maid outfit','witch outfit','magical girl','gothic lolita','idol costume','cheerleader','race queen','fantasy armor','bikini armor','bunny suit','bodysuit','leotard','swimsuit','one-piece swimsuit','school swimsuit','tracksuit']),
    combinable: null,
  },
  {
    id: 'skirt',
    ja: 'スカート',
    en: 'skirt',
    triggers: new Set(['skirt','pleated skirt','flared skirt','mini skirt','micro skirt','slit skirt','pencil skirt']),
    combinable: null,
  },
  {
    id: 'top',
    ja: 'トップス',
    en: 'top',
    triggers: new Set(['crop top','tank top','tube top','camisole','halter top','blouse','white shirt','dress shirt','off shoulder','sports bra']),
    combinable: null,
  },
  {
    id: 'jacket',
    ja: '上着',
    en: 'jacket',
    triggers: new Set(['jacket','coat','trench coat','cardigan','hoodie','sweater','vest','jacket over shoulder','jacket partially removed']),
    combinable: new Set(['leather','velvet','knit','fur','mesh']),
  },
  {
    id: 'sleeves',
    ja: '袖',
    en: 'sleeves',
    triggers: new Set(['blouse','dress shirt','dress','blazer uniform','school uniform','cardigan','witch outfit','gothic lolita']),
    combinable: new Set(['lace','sheer','lace-trimmed','silk','velvet','embroidered','mesh']),
  },
  {
    id: 'collar',
    ja: '衿',
    en: 'collar',
    triggers: new Set(['blouse','dress shirt','school uniform','sailor uniform','blazer uniform','white shirt','nun']),
    combinable: new Set(['lace','lace-trimmed','silk','velvet','embroidered']),
  },
  {
    id: 'hemline',
    ja: '裾',
    en: 'hemline',
    triggers: new Set(['dress','skirt','gothic lolita','magical girl','maid outfit','witch outfit']),
    combinable: new Set(['lace','lace-trimmed','embroidered','velvet','silk','fur']),
  },
  {
    id: 'stockings',
    ja: 'ストッキング',
    en: 'stockings',
    triggers: new Set(['thighhighs','tights','pantyhose','knee-high socks','fishnet legwear']),
    combinable: new Set(['lace','fishnet','sheer','silk','lace-trimmed','mesh']),
  },
  {
    id: 'gloves',
    ja: '手袋',
    en: 'gloves',
    triggers: new Set(['gloves','fingerless gloves','elbow gloves']),
    combinable: new Set(['lace','silk','velvet','leather','latex','sheer']),
  },
  {
    id: 'ribbon',
    ja: 'リボン',
    en: 'ribbon',
    triggers: new Set(['ribbons','bows','hair ribbon']),
    combinable: new Set(['silk','satin','velvet','lace']),
  },
  {
    id: 'bodysuit',
    ja: 'ボディスーツ',
    en: 'bodysuit',
    triggers: new Set(['bodysuit','leotard','bunny suit']),
    combinable: new Set(['latex','leather','sheer','sequined','mesh']),
  },
  {
    id: 'corset',
    ja: 'コルセット',
    en: 'corset',
    triggers: new Set(['corset']),
    combinable: new Set(['leather','latex','satin','velvet','lace','lace-trimmed']),
  },
];

// sequined が映える衣装ジャンル
const SEQUINED_FRIENDLY = new Set([
  'idol costume','evening gown','wedding dress','stage outfit','party dress',
  'bunny suit','magical girl','high fashion','dress',
]);

export function buildMaterialTag(materialEn, targetEn) {
  return `${materialEn} ${targetEn}`;
}

// ── 重みつきランダム（materials.js内部用）─────────────────────────
function wIdxM(weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  if (!total) return Math.floor(Math.random() * weights.length);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; }
  return weights.length - 1;
}

// ── マテリアルメーカー自動付与レイヤー ────────────────────────────
// useRandomGen.js の applyColorMakerLayer 呼び出し直後に呼ぶ
export function applyMaterialMakerLayer(blockMap, mode) {
  const overallProb = mode === 'chardesign' ? 0.25 : 0.40;
  if (Math.random() > overallProb) return;

  const outfitBlock  = blockMap.get('outfit');
  const detailBlock  = blockMap.get('feature');
  if (!outfitBlock && !detailBlock) return;

  const outfitText = outfitBlock?.text || '';
  const detailText = detailBlock?.text || '';
  const allText    = outfitText + ', ' + detailText;

  // sequined 許可判定：特定衣装ジャンルがあるときのみ確率UP
  const hasSequinedFriendly = [...SEQUINED_FRIENDLY].some(t => hasTag(allText, t));

  const MAX_MATERIAL_TAGS = 2;
  let added = 0;

  for (const target of MATERIAL_TARGETS) {
    if (added >= MAX_MATERIAL_TAGS) break;

    // どちらのブロックにトリガーがあるか確認
    const triggerInOutfit = [...target.triggers].some(k => hasTag(outfitText, k));
    const triggerInDetail = [...target.triggers].some(k => hasTag(detailText, k));
    if (!triggerInOutfit && !triggerInDetail) continue;
    if (Math.random() > 0.50) continue;

    const targetBlock = triggerInOutfit
      ? (outfitBlock && !outfitBlock.locked ? outfitBlock : null)
      : (detailBlock && !detailBlock.locked ? detailBlock : null);
    if (!targetBlock) continue;
    const blockId = triggerInOutfit ? 'outfit' : 'feature';

    // 使用可能な素材プール構築
    let pool = target.combinable
      ? MATERIAL_PALETTE.filter(m => target.combinable.has(m.en) && !m.rare)
      : MATERIAL_PALETTE.filter(m => !m.rare);

    // adult素材の重み抑制（成人コンテキスト外）
    const weights = pool.map(m => {
      let w = m.weight ?? 1.0;
      if (m.adult) w *= 0.15;
      // sequined: 相性衣装なければ極小確率
      if (m.en === 'sequined' && !hasSequinedFriendly) w *= 0.10;
      return w;
    });

    if (!pool.length) continue;

    const mat = pool[wIdxM(weights)];
    const tag = buildMaterialTag(mat.en, target.en);

    const currentText = blockMap.get(blockId)?.text || '';
    if (!hasTag(currentText, tag)) {
      const b = blockMap.get(blockId);
      blockMap.set(blockId, { ...b, text: appendTag(currentText, tag, b.strength) });
      added++;
    }
  }
}

// ── マテリアルメーカー生成タグの日本語変換 ──────────────────────────
// "[素材] [部位]" パターンを日本語ラベルに変換
export function resolveMaterialLabel(tagEn) {
  if (!tagEn) return null;
  const lower = tagEn.trim().toLowerCase();
  for (const mat of MATERIAL_PALETTE) {
    const prefix = mat.en.toLowerCase() + ' ';
    if (!lower.startsWith(prefix)) continue;
    const targetEn = lower.slice(prefix.length);
    const target = MATERIAL_TARGETS.find(t => t.en.toLowerCase() === targetEn);
    if (target) return { en: tagEn.trim(), ja: `${mat.ja}の${target.ja}` };
  }
  return null;
}

// ── 手動適用（CommandPalette等から呼び出し）──────────────────────
// blockMap は Map<id, block> 形式で渡す。変更後のblocks配列を返す。
export function applyMaterialMakerManual(blocks) {
  const blockMap = new Map(blocks.map(b => [b.id, { ...b }]));
  applyMaterialMakerLayer(blockMap, 'illust');
  return blocks.map(b => blockMap.has(b.id) ? blockMap.get(b.id) : b);
}
