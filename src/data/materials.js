// ── マテリアルメーカー用データ ────────────────────────────────────
// カラーメーカー（colors.js）と対になる素材指定システムの下準備。
// 実装時は useRandomGen.js の applyColorMakerLayer 直後に
// applyMaterialMakerLayer(blockMap, mode) を呼び出す。
//
// 生成するタグ例:
//   buildMaterialTag('lace', 'sleeves') → 'lace sleeves'
//   buildMaterialTag('silk', 'skirt')   → 'silk skirt'
//   buildMaterialTag('fishnet', 'stockings') → 'fishnet stockings'

// ── 素材パレット ──────────────────────────────────────────────────
export const MATERIAL_PALETTE = [
  // ── 光沢・高級素材 ─────────────────────────────────────────────
  { en: 'silk',      ja: 'シルク',       weight: 1.0 },
  { en: 'satin',     ja: 'サテン',       weight: 1.0 },
  { en: 'velvet',    ja: 'ベルベット',   weight: 1.0 },
  // ── 透け・網目系 ───────────────────────────────────────────────
  { en: 'lace',      ja: 'レース',       weight: 1.2 },
  { en: 'sheer',     ja: 'シアー',       weight: 0.9 },
  { en: 'fishnet',   ja: 'フィッシュネット', weight: 0.8 },
  { en: 'chiffon',   ja: 'シフォン',     weight: 0.9 },
  // ── 特殊素材 ───────────────────────────────────────────────────
  { en: 'leather',   ja: 'レザー',       weight: 0.8 },
  { en: 'latex',     ja: 'ラテックス',   weight: 0.5, rare: true },
  { en: 'fur',       ja: 'ファー',       weight: 0.7 },
  { en: 'denim',     ja: 'デニム',       weight: 0.8 },
  // ── ナチュラル系 ───────────────────────────────────────────────
  { en: 'knit',      ja: 'ニット',       weight: 0.9 },
  { en: 'cotton',    ja: 'コットン',     weight: 0.7 },
  { en: 'wool',      ja: 'ウール',       weight: 0.7 },
  // ── 装飾素材（単体でも使えるが部位指定時に光る）───────────────
  { en: 'sequined',  ja: 'スパンコール入り', weight: 0.7 },
  { en: 'embroidered', ja: '刺繍入り',   weight: 0.8 },
  { en: 'lace-trimmed', ja: 'レーストリム', weight: 0.9 },
];

// ── 衣装部位（素材の貼り先）─────────────────────────────────────
// triggers: この部位が有効になる outfit ブロックのタグ
// combinable: AIモデルが認識しやすい素材+部位の組み合わせ（一部素材のみ許可する場合）
export const MATERIAL_TARGETS = [
  {
    id: 'dress',
    ja: 'ドレス全体',
    en: 'dress',
    triggers: new Set(['dress','sundress','sweater dress','wedding dress','evening gown','cheongsam','hanfu']),
    combinable: null, // null = 全素材OK
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
    triggers: new Set(['crop top','tank top','tube top','camisole','halter top','blouse','white shirt','dress shirt','off shoulder']),
    combinable: null,
  },
  {
    id: 'jacket',
    ja: '上着',
    en: 'jacket',
    triggers: new Set(['jacket','coat','trench coat','cardigan','hoodie','sweater','vest']),
    combinable: new Set(['leather','velvet','wool','knit','denim','fur']),
  },
  {
    id: 'sleeves',
    ja: '袖',
    en: 'sleeves',
    triggers: new Set(['blouse','dress shirt','dress','blazer uniform','school uniform','shirt','cardigan','witch outfit','gothic lolita']),
    combinable: new Set(['lace','sheer','lace-trimmed','chiffon','silk','velvet','embroidered']),
  },
  {
    id: 'collar',
    ja: '衿',
    en: 'collar',
    triggers: new Set(['blouse','dress shirt','school uniform','sailor uniform','blazer uniform','white shirt','nun']),
    combinable: new Set(['lace','lace-trimmed','silk','velvet','embroidered']),
  },
  {
    id: 'hem',
    ja: '裾',
    en: 'hem',
    triggers: new Set(['dress','skirt','gothic lolita','magical girl','maid outfit','witch outfit']),
    combinable: new Set(['lace','lace-trimmed','frills','embroidered','velvet','silk']),
  },
  {
    id: 'stockings',
    ja: 'ストッキング',
    en: 'stockings',
    triggers: new Set(['thighhighs','tights','pantyhose','knee-high socks']),
    combinable: new Set(['lace','fishnet','sheer','silk','lace-trimmed']),
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
    combinable: new Set(['latex','leather','sheer','sequined']),
  },
  {
    id: 'corset',
    ja: 'コルセット',
    en: 'corset',
    triggers: new Set(['corset']),
    combinable: new Set(['leather','latex','satin','velvet','lace','lace-trimmed']),
  },
];

// ── タグビルダー ──────────────────────────────────────────────────
// 素材＋部位を組み合わせたプロンプトタグを生成
// 例: buildMaterialTag('lace', 'sleeves') → 'lace sleeves'
export function buildMaterialTag(materialEn, targetEn) {
  return `${materialEn} ${targetEn}`;
}

// ── ランダム生成への統合ポイント（未実装）────────────────────────
// 実装時は useRandomGen.js の applyColorMakerLayer 呼び出し直後に追加:
//
// export function applyMaterialMakerLayer(blockMap, mode) {
//   const overallProb = mode === 'chardesign' ? 0.30 : 0.45;
//   if (Math.random() > overallProb) return;
//
//   const outfitBlock = blockMap.get('outfit');
//   if (!outfitBlock || outfitBlock.locked || !outfitBlock.text) return;
//
//   const outfitText = outfitBlock.text;
//   const MAX_MATERIAL_TAGS = 2;
//   let added = 0;
//
//   for (const target of MATERIAL_TARGETS) {
//     if (added >= MAX_MATERIAL_TAGS) break;
//     if (![...target.triggers].some(k => hasTag(outfitText, k))) continue;
//     if (Math.random() > 0.50) continue;
//
//     // combinable フィルタ
//     const pool = target.combinable
//       ? MATERIAL_PALETTE.filter(m => target.combinable.has(m.en) && !m.rare)
//       : MATERIAL_PALETTE.filter(m => !m.rare);
//     if (!pool.length) continue;
//
//     const weights = pool.map(m => m.weight ?? 1.0);
//     const mat = pool[wIdx(weights)];
//     const tag = buildMaterialTag(mat.en, target.en);
//
//     if (!hasTag(outfitText, tag)) {
//       blockMap.set('outfit', { ...outfitBlock, text: appendTag(outfitBlock.text, tag, outfitBlock.strength) });
//       added++;
//     }
//   }
// }
