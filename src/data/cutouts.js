// ── カットメーカー用データ ────────────────────────────────────────
// 衣装の「切り抜き・変形・質感」系タグを outfit_detail に追記するためのメーカー。
// ここに並ぶ en は すべて blocks.js の outfit_detail → 形状・カット(outfit_shape)
// カテゴリに存在する（= 日本語名・ランダム・破綻チェックは既存定義を共有）。
// 新タグを足すときは必ず blocks.js の outfit_shape にも同じ en/ja を追加すること。

export const CUTOUT_TARGET_BLOCK = 'outfit_detail';

export const CUTOUT_GROUPS = [
  {
    id: 'opening',
    label: { ja: '開口部・窓', en: 'Cutouts' },
    acc: '#fb7185',
    items: [
      { en: 'cleavage cutout',  ja: '胸元カット' },
      { en: 'underboob cutout', ja: 'アンダーカット' },
      { en: 'navel cutout',     ja: 'へそ出しカット' },
      { en: 'shoulder cutout',  ja: '肩カット' },
      { en: 'armpit cutout',    ja: '脇くりぬき' },
      { en: 'back cutout',      ja: '背中カット' },
      { en: 'side cutout',      ja: 'サイドカット' },
    ],
  },
  {
    id: 'silhouette',
    label: { ja: 'シルエット変形', en: 'Silhouette' },
    acc: '#f59e0b',
    items: [
      { en: 'open back',       ja: '背中開き' },
      { en: 'off shoulder',    ja: 'オフショルダー' },
      { en: 'sleeveless',      ja: 'ノースリーブ' },
      { en: 'sideless outfit', ja: '脇カット/サイドレス' },
      { en: 'high slit',       ja: 'ハイスリット' },
      { en: 'side slit',       ja: 'サイドスリット' },
      { en: 'low-rise',        ja: 'ローライズ' },
      { en: 'high neck',       ja: 'ハイネック' },
      { en: 'open collar',     ja: '開けた衿' },
    ],
  },
  {
    id: 'texture',
    label: { ja: '素材・質感', en: 'Texture' },
    acc: '#64748b',
    items: [
      { en: 'see-through', ja: 'シースルー' },
      { en: 'skintight',   ja: 'ぴったり' },
      { en: 'torn clothes', ja: '破れた服' },
    ],
  },
];

// 全カットタグの en→ja 逆引き（必要に応じて利用）
export const CUTOUT_LABEL_MAP = new Map(
  CUTOUT_GROUPS.flatMap(g => g.items.map(it => [it.en.toLowerCase(), it.ja]))
);
