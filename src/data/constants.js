// ── Character palette ────────────────────────────────────────
export const CHAR_COLORS       = ['#f472b6','#c084fc','#60a5fa','#34d399','#fbbf24','#fb923c','#f87171','#22d3ee','#a78bfa','#86efac'];
export const CHAR_COLORS_LIGHT = ['#9d174d','#6d28d9','#1e40af','#065f46','#92400e','#c2410c','#b91c1c','#155e75','#4c1d95','#14532d'];
// Species: cat/rabbit/dog/deer/horse/fox/wolf/snake/dragon/fairy/mermaid/elf/vampire/angel/demon/android/ghost
// Archetypes: royalty/idol/knight/mage
export const CHAR_EMOJIS = ['🐱','🐰','🐶','🦌','🐴','🦊','🐺','🐍','🐉','🧚','🧜','🧝','🧛','👼','😈','🤖','👻','👑','🎭','⚔️','🧙'];

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
// Categories picked at reduced probability (~15%) — neither core nor standard optional
export const RARE_OPT_CAT_NAMES = new Set(['肌質感', 'ピアス・刺青', '装備・ケア', '衣装アクセント']);

export const OPTIONAL_CAT_NAMES = new Set([
  // 顔
  'インナーカラー', '前髪', '目つき・形', '眉', '口・歯', '髪飾り・毛流れ', 'メイク・顔演出',
  // 属性
  '年齢感', '特殊パーツ',
  // 体型（肌色はコア化 → 常に1つ選ばれる）
  '肌質感', '細部', 'ボディフォーカス', '状態', '足',
  // 衣装
  '素材・装飾', '装飾アクセ', '服装スタイル', '衣装アクセント',
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
  // 照明（Tier 2: ブロックレベル確率で制御するためカテゴリもオプション扱い）
  '光源', '照明スタイル',
]);

// ── Species → Special Parts auto-link ───────────────────────
// When a species tag is toggled ON, these parts are auto-added to 特殊パーツ.
// When toggled OFF, parts are removed unless another active species still needs them.
export const SPECIES_PARTS_MAP = {
  'elf':         ['elf ears'],
  'dark elf':    ['elf ears'],
  'angel':       ['angel wings', 'halo'],
  'demon':       ['demon horns', 'demon tail', 'demon wings'],
  'fairy':       ['fairy wings'],
  'mermaid':     ['mermaid tail'],
  'lamia':       ['lamia tail'],
  'dragon girl': ['dragon horns', 'dragon tail', 'scale skin'],
  'catgirl':     ['cat ears', 'cat tail'],
  'oni':         ['oni horns'],
  'doll':        ['ball joints'],
  'android':     ['cybernetics'],
};

// ── UI combo: bidirectional pairs (clicking either tag syncs the other) ──
export const TAG_PAIR_COMBOS = new Map([
  ['cat ears',    'cat tail'],   ['cat tail',    'cat ears'],
  ['fox ears',    'fox tail'],   ['fox tail',    'fox ears'],
  ['wolf ears',   'wolf tail'],  ['wolf tail',   'wolf ears'],
  ['dog ears',    'dog tail'],   ['dog tail',    'dog ears'],
  ['bunny ears',  'bunny tail'], ['bunny tail',  'bunny ears'],
  ['horse ears',  'horse tail'], ['horse tail',  'horse ears'],
  ['cow ears',    'cow tail'],   ['cow tail',    'cow ears'],
  ['dragon horns','dragon tail'],['dragon tail', 'dragon horns'],
  ['demon horns', 'demon tail'], ['demon tail',  'demon horns'],
  ['angel wings', 'halo'],       ['halo',        'angel wings'],
]);

// ── UI combo: species → parts (one-way, fires only when species toggled ON) ──
export const TAG_SPECIES_COMBOS = new Map([
  ['catgirl',     ['cat ears', 'cat tail']],
  ['angel',       ['angel wings', 'halo']],
  ['demon',       ['demon horns', 'demon tail', 'demon wings']],
  ['elf',         ['elf ears']],
  ['dark elf',    ['elf ears']],
  ['oni',         ['oni horns']],
  ['dragon girl', ['dragon horns', 'dragon tail', 'scale skin']],
  ['mermaid',     ['mermaid tail']],
  ['lamia',       ['lamia tail']],
  ['fairy',       ['fairy wings']],
  ['doll',        ['ball joints']],
  ['android',     ['cybernetics']],
]);

// ── Random: kemonomimi base pairs (ears + tail sets) ──
export const KEMONOMIMI_PAIRS = [
  ['cat ears',   'cat tail'],
  ['fox ears',   'fox tail'],
  ['wolf ears',  'wolf tail'],
  ['dog ears',   'dog tail'],
  ['bunny ears', 'bunny tail'],
  ['cow ears',   'cow tail'],
];

// ── Random generation: mutually exclusive category groups ────
// exclusiveGroups: within each inner array, at most one cat is picked
// skipIfPicked:    if cat[key] is picked, skip all cats in value[]
// Tags excluded from random generation to enforce single-character output
export const RANDOM_EXCLUDE_TAGS = new Set(['2girls', '2boys', 'multiple girls', 'multiple boys', '1other']);

export const BLOCK_RANDOM_RULES = {
  background: {
    exclusiveGroups: [['シンプル', '屋外', '屋内']],
    skipIfPicked: { 'シンプル': ['時間・天気', '季節・雰囲気'] },
  },
  outfit: {
    // If a complete-outfit Genre tag is picked, skip individual tops/bottoms
    skipIfPicked: { 'ジャンル': ['トップス', 'ボトムス'] },
  },
};

// ── Tier 3 tags (0% from おまかせ; only added via combo rules) ──
export const TIER3_TAGS = new Set([
  // ボディフォーカス（センシティブ寄り）
  'cleavage','sideboob','underboob','bare back','armpits','armpit focus','midriff','midriff focus',
  'bare thighs','thighs','leg focus','wide hips',
  // 足フォーカス
  'soles','toes','foot focus','toenail polish',
  // アイテム系保持タグ（武器はWEAPON_TAGSへ移動）
  'holding flower','holding umbrella','holding cup','holding drink','holding ice cream',
  'holding book','holding plush toy','holding smartphone','holding microphone',
  'holding fan','holding key','holding lantern','holding torch',
  // 極端なポーズ
  'all fours','split','lying on back','lying on stomach','on side',
  // 極端な表情・口
  'crying','drunk','saliva','tongue out','tongue between teeth','licking lips',
  // センシティブアクセサリー
  'collar','garter belt',
  // タトゥー
  'tattoo','arm tattoo','back tattoo',
  // 特殊フォーマット（手動選択専用）
  'tarot card',
  // 種族専用パーツ（コンボルール経由でのみ付与）
  'ball joints','cybernetics','scale skin','translucent skin','liquid body','porcelain skin',
  // 下半身置換パーツ — 種族が一致しない限り付与禁止（妖精に人魚尾ひれなど防止）
  'mermaid tail','lamia tail',
  // レア肌色はコンボルール経由または rareInRandom で低確率付与（TIER3除外）
]);

// ── Weapon tags (格上げ: Tier3 → 低確率枠) ──────────────────
// カテゴリ選択率40% × WEAPON_PICK_PROB = 実質約12%でおまかせに出現
export const WEAPON_TAGS = new Set([
  'holding sword','holding spear','holding dagger','holding knife','holding shield',
  'holding staff','holding wand','holding bow','holding gun','holding rifle',
]);
export const WEAPON_PICK_PROB = 0.30;

// 武器保持と同時に選ばれてはいけない手・指ポーズ
export const HAND_POSE_TAGS = new Set([
  'peace sign','v-sign','finger gun','pointing','pointing at viewer','pointing up',
  'pointing to the side','finger to mouth','finger to chin','finger to cheek',
  'finger to lips','ok sign','thumbs up','thumbs down','spread fingers',
  'counting','waving','clapping','hand heart','finger heart','pinky out',
]);

// ── Tier 2 blocks (40% inclusion in おまかせ) ────────────────
export const TIER2_BLOCK_IDS  = new Set(['lighting', 'effect']);
export const TIER2_BLOCK_PROB = 0.40;

// ── Random exclusion rules (frame-out + incompatibility) ─────
// Key = tag that was picked; Value = Set of tags that must be removed
const LOWER_BODY_FRAME_OUT = new Set([
  'sneakers','loafers','mary janes','sandals','slippers','heels','pumps',
  'high heels','platform shoes','ankle boots','boots','knee-high boots',
  'thigh-high boots','platform boots','leg warmers','ankle socks','socks',
  'knee-high socks','thighhighs','white thighhighs','black thighhighs','pantyhose',
  'barefoot','soles','toes','foot focus','pointed toes','toenail polish',
  'crossed legs','thigh gap','thigh strap',
  'mini skirt','micro skirt','hot pants','shorts','leggings',
  'bare thighs','thighs','leg focus','wide hips',
  // ポーズ（クローズアップ構図と矛盾するもの）
  'walking','running','jumping','dancing','fighting stance',
]);

export const RANDOM_EXCLUSION_RULES = new Map([
  // フレーミング → 下半身タグ除外
  ['extreme close-up', LOWER_BODY_FRAME_OUT],
  ['close-up',         LOWER_BODY_FRAME_OUT],
  ['face close-up',    LOWER_BODY_FRAME_OUT],
  ['portrait',         LOWER_BODY_FRAME_OUT],
  ['bust shot',        LOWER_BODY_FRAME_OUT],
  ['upper body',       LOWER_BODY_FRAME_OUT],
  ['cowboy shot',      LOWER_BODY_FRAME_OUT],
  // 種族 × 衣装・足元（下半身がない種族）
  ['mermaid', new Set([
    'sneakers','loafers','mary janes','sandals','slippers','heels','pumps','high heels',
    'platform shoes','ankle boots','boots','knee-high boots','thigh-high boots','platform boots',
    'ankle socks','socks','knee-high socks','thighhighs','white thighhighs','black thighhighs',
    'pantyhose','leg warmers','barefoot',
    'shorts','hot pants','mini skirt','micro skirt','skirt','pleated skirt','slit skirt','pants','jeans','leggings',
  ])],
  ['lamia', new Set([
    'sneakers','loafers','mary janes','sandals','slippers','heels','pumps','high heels',
    'platform shoes','ankle boots','boots','knee-high boots','thigh-high boots','platform boots',
    'ankle socks','socks','knee-high socks','thighhighs','white thighhighs','black thighhighs',
    'pantyhose','leg warmers','barefoot',
    'shorts','hot pants','mini skirt','micro skirt','skirt','pleated skirt','slit skirt','pants','jeans','leggings',
  ])],
  // 裸足 → フットウェア全般を除外
  ['barefoot', new Set([
    'sneakers','loafers','mary janes','sandals','slippers','heels','pumps','high heels',
    'platform shoes','ankle boots','boots','knee-high boots','thigh-high boots','platform boots',
    'leg warmers','ankle socks','socks','knee-high socks','thighhighs','white thighhighs',
    'black thighhighs','pantyhose',
  ])],
  // 背景環境の矛盾
  ['underwater',   new Set(['fire','explosion','embers','electricity','lightning','lens flare','god rays','sparkles'])],
  ['outer space',  new Set(['rain','snowfall','wind','mist','fire','explosion','sunlight'])],
  // 時間帯 × 照明の矛盾（クロスブロック）
  ['day',   new Set(['moonlight'])],
  ['night', new Set(['sunlight'])],
  // ポーズの矛盾
  ['lying on back',    new Set(['standing','walking','running','jumping','kneeling','on one knee','crouching','fighting stance','dancing'])],
  ['lying on stomach', new Set(['standing','walking','running','jumping','kneeling','on one knee','crouching','fighting stance'])],
  ['all fours',        new Set(['standing','jumping','running','sitting','sitting cross-legged','seiza','fighting stance','dancing'])],
  ['seiza',            new Set(['standing','jumping','running','walking','fighting stance','dancing'])],
  ['sitting cross-legged', new Set(['standing','jumping','running','walking','fighting stance'])],
  // 表情の矛盾
  ['smile',        new Set(['crying','sad','angry','disgusted','worried','pout','expressionless'])],
  ['grin',         new Set(['crying','sad','angry','disgusted','expressionless'])],
  ['laughing',     new Set(['crying','sad','angry','disgusted','expressionless','serious'])],
  ['crying',       new Set(['smile','grin','laughing','wink','excited','blushing','shy','smirk'])],
  ['angry',        new Set(['smile','light smile','grin','laughing','wink','excited','blushing','shy','embarrassed'])],
  ['pout',         new Set(['grin','laughing','wink','excited'])],
  ['expressionless',new Set(['smile','grin','laughing','wink','excited','crying','shy','embarrassed','blushing'])],
  ['serious',      new Set(['laughing','grin','excited','blushing','embarrassed','shy'])],
  // アートスタイルとレンダリングの矛盾
  ['pixel art',       new Set(['depth of field','bokeh','subsurface scattering','smooth shading','soft shading','painterly','bloom'])],
  ['lineart',         new Set(['watercolor','oil painting','depth of field','bokeh','subsurface scattering','smooth shading','soft shading'])],
  ['sketch',          new Set(['cel shading','depth of field','bokeh','subsurface scattering','smooth shading','bloom','glowing'])],
  ['flat design',     new Set(['depth of field','bokeh','subsurface scattering','smooth shading','soft shading','painterly','bloom','glowing'])],
  ['retro artstyle',  new Set(['depth of field','bokeh','subsurface scattering','smooth shading','soft shading','painterly'])],
  ['monochrome',      new Set(['vibrant colors','colorful','neon colors','warm colors','cool colors','pastel colors','cel shading'])],
  // fighting stance（コンボで追加された際の事後クリーンアップ用）
  ['fighting stance', new Set(['lying on back','lying on stomach','all fours','seiza','sitting cross-legged','sleeping'])],
  // 肌色の相互排他（コンボルール追加時に既存肌色をクリーンアップ）
  ['porcelain skin',   new Set(['fair skin','pale skin','tan skin','dark skin','olive skin','red skin','blue skin','grey skin','translucent skin'])],
  ['translucent skin', new Set(['fair skin','pale skin','tan skin','dark skin','olive skin','red skin','blue skin','grey skin','porcelain skin'])],
  ['red skin',         new Set(['fair skin','pale skin','tan skin','dark skin','olive skin','blue skin','grey skin','porcelain skin','translucent skin'])],
  ['blue skin',        new Set(['fair skin','pale skin','tan skin','dark skin','olive skin','red skin','grey skin','porcelain skin','translucent skin'])],
  ['grey skin',        new Set(['fair skin','pale skin','tan skin','dark skin','olive skin','red skin','blue skin','porcelain skin','translucent skin'])],
  // 体型の矛盾防止
  ['flat chest',    new Set(['large breasts','huge breasts','medium breasts','breast hold','breast grab','cleavage','sideboob','underboob'])],
  ['large breasts', new Set(['flat chest','small breasts'])],
  ['huge breasts',  new Set(['flat chest','small breasts'])],
  ['curvy',         new Set(['flat chest','small breasts','petite'])],
  ['petite',        new Set(['large breasts','huge breasts','curvy'])],
  // back view: 顔表情・正面強調タグ除外
  ['back view', new Set([
    'smile','light smile','grin','laughing','wink','smirk','expressionless',
    'open mouth','embarrassed','blushing','blush','tears','crying','shy','pout',
    'angry','surprised','confused','cleavage','sideboob','breast hold',
  ])],
  // 非生物: 生体反応 + 有機的な動物パーツを除外
  ['doll',      new Set(['sweat','blush','blushing','tears','crying','saliva','drooling','panting','drunk'])],
  ['robot',     new Set(['sweat','blush','blushing','tears','crying','saliva','drooling','panting','drunk',
    'cat ears','bunny ears','fox ears','wolf ears','dog ears','horse ears','cow ears','animal ears',
    'cat tail','fox tail','wolf tail','fluffy tail','bunny tail','dog tail','horse tail','cow tail'])],
  ['android',   new Set(['sweat','blush','blushing','tears','crying','saliva','drooling','panting','drunk',
    'cat ears','bunny ears','fox ears','wolf ears','dog ears','horse ears','cow ears','animal ears',
    'cat tail','fox tail','wolf tail','fluffy tail','bunny tail','dog tail','horse tail','cow tail'])],
  ['mannequin', new Set(['sweat','blush','blushing','tears','crying','saliva','drooling'])],
  // 種族パーツの重複防止（ケモ耳 × ホーン/ハロ系）
  ['dog ears',    new Set(['demon horns','oni horns','goat horns','deer antlers','halo','angel halo'])],
  ['cat ears',    new Set(['demon horns','oni horns','goat horns','deer antlers','halo','angel halo'])],
  ['fox ears',    new Set(['demon horns','oni horns','goat horns','deer antlers','halo','angel halo'])],
  ['wolf ears',   new Set(['demon horns','oni horns','goat horns','deer antlers','halo','angel halo'])],
  ['bunny ears',  new Set(['demon horns','oni horns','goat horns','deer antlers','halo','angel halo'])],
  ['horse ears',  new Set(['demon horns','oni horns','goat horns','deer antlers'])],
  ['demon horns', new Set(['dog ears','cat ears','fox ears','wolf ears','bunny ears','horse ears','deer antlers','halo','angel halo'])],
  ['oni horns',   new Set(['dog ears','cat ears','fox ears','wolf ears','bunny ears','horse ears','deer antlers','halo','angel halo'])],
  ['halo',        new Set(['demon horns','oni horns','goat horns'])],
  ['angel halo',  new Set(['demon horns','oni horns','goat horns'])],
  ['angel wings', new Set(['demon wings','bat wings','dragon wings'])],
  ['demon wings', new Set(['angel wings','dragon wings','feathered wings'])],
  ['bat wings',   new Set(['angel wings','feathered wings'])],
  // 横向き構図: 視聴者への直接アクションは不自然
  ['side view', new Set([
    'reaching toward viewer','pointing at viewer','eye contact','looking at viewer','waving',
    'v-sign','peace sign','finger heart','hand heart',
  ])],
  // 人魚・ラミアの尻尾にも足元除外を適用（buildSpeciesTextで自動追加されるため）
  ['mermaid tail', new Set([
    'sneakers','loafers','mary janes','sandals','slippers','heels','pumps','high heels',
    'platform shoes','ankle boots','boots','knee-high boots','thigh-high boots','platform boots',
    'leg warmers','ankle socks','socks','knee-high socks','thighhighs','white thighhighs',
    'black thighhighs','pantyhose','barefoot',
    'shorts','hot pants','mini skirt','micro skirt','skirt','pleated skirt','slit skirt','pants','jeans','leggings',
  ])],
  ['lamia tail', new Set([
    'sneakers','loafers','mary janes','sandals','slippers','heels','pumps','high heels',
    'platform shoes','ankle boots','boots','knee-high boots','thigh-high boots','platform boots',
    'leg warmers','ankle socks','socks','knee-high socks','thighhighs','white thighhighs',
    'black thighhighs','pantyhose','barefoot',
    'shorts','hot pants','mini skirt','micro skirt','skirt','pleated skirt','slit skirt','pants','jeans','leggings',
  ])],
]);

// ── Combo rules: trigger tag → add tag in another block ──────
export const RANDOM_COMBO_RULES = [
  { trigger: 'holding sword',  blockId: 'composition', tag: 'fighting stance' },
  { trigger: 'holding spear',  blockId: 'composition', tag: 'fighting stance' },
  { trigger: 'holding dagger', blockId: 'composition', tag: 'fighting stance' },
  { trigger: 'holding knife',  blockId: 'composition', tag: 'fighting stance' },
  { trigger: 'holding bow',    blockId: 'composition', tag: 'fighting stance' },
  { trigger: 'holding gun',    blockId: 'composition', tag: 'fighting stance' },
  { trigger: 'holding rifle',  blockId: 'composition', tag: 'fighting stance' },
  { trigger: 'holding shield', blockId: 'composition', tag: 'fighting stance' },
  { trigger: 'mermaid',        blockId: 'background',  tag: 'underwater' },
  { trigger: 'mermaid tail',   blockId: 'background',  tag: 'underwater' },
  { trigger: 'mermaid',        blockId: 'lighting',    tag: 'caustics' },
  { trigger: 'mermaid tail',   blockId: 'lighting',    tag: 'caustics' },
  { trigger: 'underwater',     blockId: 'lighting',    tag: 'caustics' },
  { trigger: 'rainy',          blockId: 'effect',      tag: 'rain' },
  { trigger: 'snowy',          blockId: 'effect',      tag: 'snowfall' },
  { trigger: 'night',          blockId: 'lighting',    tag: 'moonlight' },
  { trigger: 'starry sky',     blockId: 'lighting',    tag: 'moonlight' },
  { trigger: 'magical girl',   blockId: 'effect',      tag: 'magic circle' },
  { trigger: 'bikini',         blockId: 'body',        tag: 'cleavage' },
  { trigger: 'micro bikini',   blockId: 'body',        tag: 'cleavage' },
  { trigger: 'swimsuit',       blockId: 'body',        tag: 'bare back' },
  { trigger: 'beach',          blockId: 'body',        tag: 'barefoot' },
  { trigger: 'rainy',          blockId: 'body',        tag: 'wet hair' },
  { trigger: 'action',         blockId: 'composition', tag: 'fighting stance' },
  { trigger: 'slime girl',     blockId: 'body',        tag: 'translucent skin' },
  { trigger: 'slime girl',     blockId: 'body',        tag: 'liquid body' },
  { trigger: 'doll',           blockId: 'body',        tag: 'porcelain skin' },
  // レア肌色：種族トリガー時に確率付与
  { trigger: 'oni',            blockId: 'body',        tag: 'red skin',  prob: 0.25 },
  { trigger: 'demon',          blockId: 'body',        tag: 'blue skin', prob: 0.25 },
  { trigger: 'dragon girl',    blockId: 'body',        tag: 'red skin',  prob: 0.10 },
  { trigger: 'monster girl',   blockId: 'body',        tag: 'red skin',  prob: 0.10 },
  { trigger: 'elf',            blockId: 'body',        tag: 'grey skin',      prob: 0.25 },
  { trigger: 'dark elf',       blockId: 'body',        tag: 'grey skin',      prob: 0.25 },
  // 裸足のとき低確率でフットネイル付与
  { trigger: 'barefoot',       blockId: 'body',        tag: 'toenail polish', prob: 0.25 },
];

// ── キャラデザモード：設定資料特化の厳格ルール ────────────
export const CHARDESIGN_MODE_CONFIG = {
  // ブロック単位の固定テキスト（ランダム抽選を行わず強制上書き）
  qualityText:     'masterpiece, best quality, ultra-detailed, highres, sharp focus',
  artstyleText:    'illustration, character design, flat color, cel shading, vibrant colors, hard shading',
  backgroundText:  'white background, simple background',
  compositionText: 'full body, front view, standing',

  // 顔ブロック：表情はキャラの個性を伝える控えめな表情タグのみ許可
  allowedExpressions: new Set([
    'smile', 'light smile', 'expressionless', 'smirk', 'serious',
    'sleepy', 'determined', 'shy', 'embarrassed', 'wink', 'blushing', 'pout',
  ]),

  // 顔ブロック：抽選しないカテゴリ（動作・感情表現）
  skipFaceCats: new Set(['口・歯']),

  // メイク・顔演出から抽選を許可する物理的個性タグのみ（八重歯・そばかす・泣きぼくろ）
  faceMakeupPhysical: new Set(['fang', 'freckles', 'mole under eye']),

  // 顔ブロック：カテゴリは残すが特定タグを除外
  // floating hair（動きのある髪）+ 全身絵では視認できない特殊瞳タグ
  skipFaceTags: new Set(['floating hair', 'star-shaped pupils', 'heart-shaped pupils', 'white pupils']),

  // 体型ブロック：抽選しないカテゴリ（状態・ボディフォーカス）
  skipBodyCats: new Set(['状態', 'ボディフォーカス', '肌質感']),

  // 特徴ブロック：抽選しないカテゴリ（武器・アクション小物）
  skipFeatureCats: new Set(['武器・小物']),

  // コンボルールが変更してはいけないブロックID（固定ブロック）
  fixedBlocks: new Set(['quality', 'artstyle', 'background', 'composition', 'effect', 'lighting']),
};

// ── イラストモード：ドラマチックな一枚絵のためのブースト設定 ──
export const ILLUST_MODE_CONFIG = {
  // 構図ブロックで70%確率で優先されるドラマチックタグ
  boostCompositionTags: new Set([
    'dutch angle','from below','from above','low angle','high angle',
    'dynamic angle','bird\'s eye view','over the shoulder',
    'extreme close-up','close-up','fish-eye lens','panoramic',
  ]),
  // 照明ブロックで優先されるシネマティックタグ
  boostLightingTags: new Set([
    'cinematic lighting','dramatic lighting','rim lighting','god rays',
    'neon lights','golden hour','backlight','spotlight','moonlight',
    'caustics','studio lighting','sunset light',
  ]),
  // エフェクトブロックで優先されるドラマチックタグ
  boostEffectTags: new Set([
    'particle effects','magic circle','sparkles','petals','leaves',
    'rain','snowfall','fire','embers','electricity',
    'lens flare','bloom','chromatic aberration','fog','mist','bokeh',
  ]),
  // イラストモードから除外するタグ（設定画・シンプル背景系）
  excludedTags: new Set([
    'white background','simple background','gradient background',
    'concept art','character design','character sheet','reference sheet','model sheet',
  ]),
  // extreme/face close-up時にSoft Penalty（70%確率で除去）するタグ
  closeupSoftPenaltyTags: new Set([
    // 体型（近距離では見えにくい）
    'slim','petite','athletic','tall','slender','toned','muscular','curvy','chubby',
    // 胸サイズ（顔寄り構図では画面外）
    'flat chest','small breasts','medium breasts','large breasts','huge breasts',
    // 全身前提ポーズ（LOWER_BODY_FRAME_OUTにないもの）
    'crouching','floating','kneeling','on one knee','split','lying','on side',
    // 露出ディテール（close-upでは画面外）
    'side slit','open back','side cutout','slit skirt',
    // 遠景背景（close-upではボケ・抽象化されやすく情報が乗りにくい）
    'mountain','desert','forest','field','lake','castle','waterfall','cityscape',
  ]),
  // 顔を隠すタグ × 顔を見せるタグのペア [hidingTag, showingTag]
  faceHidePenaltyPairs: [
    ['sunglasses', 'heterochromia'],
    ['sunglasses', 'eye contact'],
    ['face mask', 'parted lips'],
    ['face mask', 'open mouth'],
    ['eyepatch', 'beautiful detailed eyes'],
  ],
};

// ── Utilities ────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 8);
export const tt  = (en, ja) => ({ en, ja });
export const ttr = (en, ja) => ({ en, ja, rareInRandom: true }); // rare in random pick (~20% weight)

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
