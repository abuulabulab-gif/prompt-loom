// ── 左右メーカー用データ ────────────────────────────────────────
// 「左右非対称（アシンメトリー）・片方だけ・丈違い」系タグを一括で組むためのメーカー。
// ブロック＝基礎、メーカー＝制御（位置・左右・掛け方）のレイヤー原則（CLAUDE.md）の「左右」担当。
// ここに並ぶ en は すべて blocks.js の対応カテゴリに存在する（= 日本語名・ランダム・
// 破綻チェックは既存定義を共有）。新タグを足すときは必ず blocks.js にも同じ en/ja を追加すること。
// 語彙の使い分け（v2.7のレッグウェアで確立した3系統）：
//   single〜   = 片方だけ着ける
//   uneven〜   = 左右で丈が違う
//   mismatched = 左右で別デザイン・別柄
// 出典：ai-nante.com 左右非対称の服装プロンプト集（ABUU提供 2026-08-06）＋Danbooru実在タグ優先。
// item の block が無ければ group の block に入る。

export const ASYM_GROUPS = [
  {
    id: 'hair',
    label: { ja: '髪', en: 'Hair' },
    acc: '#c084fc',
    block: 'face',
    items: [
      { en: 'asymmetrical bangs', ja: 'アシメ前髪' },
      { en: 'asymmetrical hair',  ja: 'アシメヘア' },
      { en: 'hair over one eye',  ja: '片目かくし' },
      { en: 'single hair bun',    ja: '片側お団子' },
    ],
  },
  {
    id: 'shoulder',
    label: { ja: '肩・袖', en: 'Shoulders / Sleeves' },
    acc: '#fb7185',
    block: 'outfit_detail',
    items: [
      { en: 'single bare shoulder',   ja: '片肩出し' },
      { en: 'single sleeve',          ja: '片袖' },
      { en: 'single detached sleeve', ja: '片分離袖' },
      { en: 'asymmetrical sleeves',   ja: '左右違い袖' },
      { en: 'uneven sleeves',         ja: '左右で丈違い袖' },
      { en: 'mismatched sleeves',     ja: '左右別デザイン袖' },
    ],
  },
  {
    id: 'gloves',
    label: { ja: '手袋・腕', en: 'Gloves / Arms' },
    acc: '#f59e0b',
    block: 'outfit_detail',
    items: [
      { en: 'single glove',       ja: '片手袋' },
      { en: 'single elbow glove', ja: '片ロンググローブ' },
      { en: 'mismatched gloves',  ja: '左右違い手袋' },
      { en: 'uneven gloves',      ja: '左右で丈違い手袋' },
    ],
  },
  {
    id: 'legs',
    label: { ja: 'レッグ', en: 'Legwear' },
    acc: '#60a5fa',
    block: 'outfit',
    items: [
      { en: 'single thighhigh',     ja: '片方ニーハイ' },
      { en: 'single sock',          ja: '片ソックス' },
      { en: 'single leg pantyhose', ja: '片脚ストッキング' },
      { en: 'uneven legwear',       ja: '左右で丈違い' },
      { en: 'mismatched legwear',   ja: '左右違い靴下' },
      { en: 'asymmetrical legwear', ja: '左右違いレッグ' },
    ],
  },
  {
    id: 'shoes',
    label: { ja: '靴', en: 'Footwear' },
    acc: '#34d399',
    block: 'outfit',
    items: [
      { en: 'single shoe',         ja: '片靴' },
      { en: 'single boot',         ja: '片ブーツ' },
      { en: 'mismatched footwear', ja: '左右違い靴' },
    ],
  },
  {
    id: 'whole',
    label: { ja: '服全体・スカート', en: 'Whole outfit / Skirt' },
    acc: '#22d3ee',
    block: 'outfit_detail',
    items: [
      { en: 'asymmetrical clothes', ja: 'アシンメトリー衣装' },
      { en: 'asymmetrical dress',   ja: 'アシンメトリードレス', block: 'outfit' },
      { en: 'high-low skirt',       ja: '前短後長スカート',     block: 'outfit' },
    ],
  },
  {
    id: 'acc',
    label: { ja: 'アクセ', en: 'Accessories' },
    acc: '#a78bfa',
    block: 'outfit_detail',
    items: [
      { en: 'single earring', ja: '片耳イヤリング' },
    ],
  },
];

// 汎用グループメーカーの設定（GroupMakerModal用・2026-08-06共通化。
// 入れ先ごとの振り分けはGroupMakerModalが持つ＝旧groupAsymByBlockは吸収・撤去）
export const ASYM_MAKER = {
  icon: '🌓', ja: '左右メーカー', en: 'Asymmetry Maker',
  introJa: '「片方だけ・左右で丈違い・左右別デザイン」を部位ごとに選択（複数可）。それぞれの持ち場のブロックに入ります。',
  introEn: 'Pick single / uneven-length / mismatched asymmetry per body zone (multi-select). Tags go to their home blocks.',
  gradient: 'linear-gradient(135deg,#60a5fa,#7c3aed)',
  groups: ASYM_GROUPS,
};
