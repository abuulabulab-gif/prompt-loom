import { BLOCKS_DEF } from './blocks.js';

// ── テンプレート等で使われる「ブロック未登録」特殊タグの en→ja 辞書 ──────────
// ブロック cats・color/feature/material リゾルバで解決できないタグの日本語フォールバック。
// テンプレ適用後のブロック表示(BlockCard)・自然文(naturalLanguage)・
// テンプレプレビュー(TemplateModal) で共有する。
// ※ cats に登録済みのタグはここに重複させない（cats が優先されるため不要）。
//   新テンプレで cats に無いタグを使ったら、ここに en/ja を必ず追加すること。

export const EXTRA_TAG_JA = new Map([
  // ── 品質・レンダリング ──────────────────────────────
  ['smooth shading',           'スムースシェード'],
  ['intricate details',        '緻密な描写'],
  ['high quality',             '高品質'],
  ['realistic details',        'リアルな描写'],
  ['clean lineart',            '綺麗な線画'],
  ['detailed illustration',    '緻密なイラスト'],
  ['cute illustration',        'かわいいイラスト'],
  // ── ちびキャラ ──────────────────────────────────────
  ['kawaii',                   'かわいい'],
  ['simple shading',           'シンプルシェード'],
  // ── ドット絵 ────────────────────────────────────────
  ['pixel perfect',            'ピクセルパーフェクト'],
  ['retro game',               'レトロゲーム'],
  ['retro game style',         'レトロゲーム調'],
  ['crisp pixels',             'くっきりドット'],
  ['limited palette',          '限定パレット（少ない色数）'],
  ['8-bit',                    '8ビット'],
  // ── 壁紙・背景 ──────────────────────────────────────
  ['scenery',                  '情景・風景'],
  ['wide composition',         'ワイド構図'],
  ['detailed background',      '詳細な背景'],
  // ── ライダーキック・ダイナミック ────────────────────
  ['kicking',                  '蹴り'],
  ['midair',                   '空中'],
  ['flying kick',              '飛び蹴り'],
  ['rider kick',               'ライダーキック'],
  // ── 風・なびき ──────────────────────────────────────
  ['clothes fluttering',       '衣装がなびく'],
  ['flowing clothes',          'なびく衣装'],
  ['cinematic',                'シネマティック'],
  // ── 仰向け・抱き枕・寝具 ────────────────────────────
  ['hair spread out',          '髪を広げた'],
  ['hair disheveled',          '髪が乱れた'],
  ['relaxed pose',             'リラックスポーズ'],
  ['neutral pose',             'ニュートラルポーズ'],
  ['simple pose',              'シンプルなポーズ'],
  ['dakimakura',               '抱き枕'],
  ['white floor',              '白いフロア'],
  ['white sheets',             '白いシーツ'],
  ['bed sheet',                'ベッドシーツ'],
  ['soft lighting',            '柔らかい光'],
  ['fabric',                   '布地'],
  ['wrinkles',                 'しわ'],
  ['vacant expression',        '虚ろな表情'],
  // ── 撮影スタイル ────────────────────────────────────
  ['selfie',                   '自撮り'],
  ['selfie angle',             '自撮りアングル'],
  // ── 構図・視点 ──────────────────────────────────────
  ['foreshortening',           '短縮遠近法'],
  ['extreme perspective',      '超パース'],
  ['fisheye',                  '魚眼'],
  ['fisheye lens',             '魚眼レンズ'],
  ['wide angle view',          '広角'],
  ['character turnaround',     'ターンアラウンド（回転図）'],
  ['lower body focus',         '下半身フォーカス'],
  ['lower half of face',       '顔の下半分'],
  ['lips focus',               '唇フォーカス'],
  ['finger to lower lip',      '下唇に指'],
  ['eye focus',                '目フォーカス'],
  ['extreme close-up on eyes', '目の超アップ'],
  ['macro shot',               'マクロショット'],
  ['leaning over viewer',      'こちらに乗りかかる'],
  ['legs stretched toward viewer', '脚をカメラへ伸ばす'],
  // ── ポーズ詳細 ──────────────────────────────────────
  ['on elbows',                '肘をつく'],
  ['on all fours',             '四つん這い'],
  ['leg up',                   '足を上げる'],
  ['foot up',                  '足を上げる'],
  ['one knee bent',            '片膝を曲げる'],
  ['one knee up',              '片膝立て'],
  ['one leg extended',         '片脚を伸ばす'],
  ['sole facing viewer',       '足裏をカメラへ'],
  ['hugging own legs',         '膝を抱える'],
  ['knees up',                 '膝立て'],
  ['on floor',                 '床の上'],
  ['standing split',           '立位開脚（I字バランス）'],
  ['vertical split',           '垂直開脚'],
  ['flexibility',              '柔軟・しなやか'],
  // ── ボディ ──────────────────────────────────────────
  ['armpit focus',             '脇アップ'],
  ['armpit crease',            '脇のくぼみ'],
  ['spread armpit',            '脇を広げる'],
  ['midriff focus',            'お腹アップ'],
  ['soft thighs',              '柔らかい太もも'],
  ['thigh press',              '太ももの押し当て'],
  ['plump',                    'ぽっちゃり'],
  ['voluptuous',               'グラマラス'],
  // ── フェイス ────────────────────────────────────────
  ['detailed eyes',            '精細な瞳'],
  ['detailed lips',            '詳細な唇'],
  ['detailed pupils',          '詳細な瞳'],
  ['looking down at viewer',   '見下ろし目線'],
  ['looking up at viewer',     '見上げ目線'],
  // ── エフェクト ──────────────────────────────────────
  ['distorted background',     '歪んだ背景'],
  // ── 衣装ディテール ──────────────────────────────────
  ['lifted top',               'めくれたトップス'],
]);

// en → {en, ja} | null （color/feature/material リゾルバと同じ形）
export function resolveExtraLabel(tagEn) {
  if (!tagEn) return null;
  const ja = EXTRA_TAG_JA.get(tagEn.trim().toLowerCase());
  return ja ? { en: tagEn.trim(), ja } : null;
}

// ── 全ブロック cats 横断の en→ja マップ ────────────────────────────
// あるブロックのタグが別ブロックに適用される場合（テンプレ等）でも日本語化できるよう、
// ブロックローカルな enToJa の後段フォールバックとして使う。
const CAT_JA = new Map();
for (const b of BLOCKS_DEF) {
  for (const c of (b.cats || [])) {
    for (const t of c.t) {
      if (t.en && t.ja && !CAT_JA.has(t.en.toLowerCase())) CAT_JA.set(t.en.toLowerCase(), t.ja);
    }
  }
}

// en → {en, ja} | null （どのブロックの cats に登録されていても解決する）
export function resolveCatLabel(tagEn) {
  if (!tagEn) return null;
  const ja = CAT_JA.get(tagEn.trim().toLowerCase());
  return ja ? { en: tagEn.trim(), ja } : null;
}
