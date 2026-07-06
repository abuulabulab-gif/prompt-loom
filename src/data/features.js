export const FEATURE_CATS = [
  { id:'face',      ja:'顔の特徴',    en:'Face',        icon:'✨' },
  { id:'body',      ja:'体の特徴',    en:'Body',        icon:'💫' },
  { id:'accessory', ja:'小物・アクセ', en:'Accessories', icon:'💍' },
];

// item.replaces: このメーカー項目を適用した時に除去する「素のタグ」（2重防止）。
//   { block, tag } … 指定ブロックからそのタグを除去（クロスブロック可）
// item.replacesSelf: 'blockId' … 適用タグと同名のタグを指定ブロックから除去
//   （額のマーク等、attribute 側に同名タグが存在するケース用）
export const FEATURE_ITEMS = {
  face: [
    {
      id:'mole', ja:'ほくろ', en:'Mole',
      targetBlock:'face',
      lrWarning:true,
      replaces:[{ block:'face', tag:'mole under eye' }],
      options:[
        { ja:'左目の下',       en:'small mole under left eye' },
        { ja:'右目の下',       en:'small mole under right eye' },
        { ja:'左頬',           en:'small mole on left cheek' },
        { ja:'右頬',           en:'small mole on right cheek' },
        { ja:'泣きぼくろ（口元）', en:'beauty mark near mouth' },
      ],
    },
    {
      id:'freckles', ja:'そばかす', en:'Freckles',
      targetBlock:'face',
      replaces:[{ block:'face', tag:'freckles' }],
      options:[
        { ja:'頬に',     en:'freckles on cheeks' },
        { ja:'鼻に薄く', en:'light freckles across nose' },
        { ja:'薄く',     en:'subtle freckles' },
      ],
    },
    {
      id:'face_scar', ja:'傷跡', en:'Scar',
      targetBlock:'face',
      lrWarning:true,
      replaces:[{ block:'body', tag:'scar' }],
      options:[
        { ja:'左頬',     en:'small scar on left cheek' },
        { ja:'右頬',     en:'small scar on right cheek' },
        { ja:'左眉の上', en:'subtle scar over left eyebrow' },
        { ja:'右眉の上', en:'subtle scar over right eyebrow' },
        { ja:'鼻',       en:'scar on nose' },
        { ja:'目を縦断（歴戦風）', en:'scar across eye' },
      ],
    },
    {
      id:'birthmark', ja:'あざ', en:'Birthmark',
      targetBlock:'face',
      replaces:[{ block:'body', tag:'birthmark' }],
      options:[
        { ja:'頬', en:'small birthmark on cheek' },
        { ja:'首', en:'subtle birthmark on neck' },
      ],
    },
    {
      id:'bandaid_face', ja:'絆創膏', en:'Bandaid',
      targetBlock:'face',
      lrWarning:true,
      replaces:[{ block:'body', tag:'bandaid' }],
      options:[
        { ja:'左頬', en:'bandaid on left cheek' },
        { ja:'右頬', en:'bandaid on right cheek' },
        { ja:'鼻',   en:'bandaid on nose' },
        { ja:'額',   en:'bandaid on forehead' },
      ],
    },
    {
      id:'forehead_mark', ja:'額のマーク', en:'Forehead Mark',
      targetBlock:'face',
      replacesSelf:'attribute',
      options:[
        { ja:'宝石',     en:'forehead jewel' },
        { ja:'星紋',     en:'star mark on forehead' },
        { ja:'三日月紋', en:'crescent mark on forehead' },
        { ja:'ルーン',   en:'rune mark on forehead' },
        { ja:'魔法陣',   en:'magic seal on forehead' },
        { ja:'呪印',     en:'occult mark on forehead' },
      ],
    },
    {
      id:'face_paint_mark', ja:'フェイスマーク', en:'Face Mark',
      targetBlock:'face',
      replaces:[],
      subtypes:[
        {
          id:'cheek', ja:'頬',
          options:[
            { ja:'マーク（汎用）',       en:'facial mark' },
            { ja:'星',                   en:'star mark on cheek' },
            { ja:'ハート',               en:'heart mark on cheek' },
            { ja:'三角',                 en:'triangle mark on cheek' },
            { ja:'四角',                 en:'square mark on cheek' },
            { ja:'ダイヤ',               en:'diamond mark on cheek' },
            { ja:'十字',                 en:'cross mark on cheek' },
            { ja:'ひげ風（動物系）',     en:'whisker markings' },
            { ja:'ペイント',             en:'facepaint' },
          ],
        },
        {
          id:'undereye', ja:'目の下',
          options:[
            { ja:'マーク（民族風）', en:'facial mark under eyes' },
            { ja:'ライン',           en:'line markings under eyes' },
            { ja:'三角',             en:'triangle marks under eyes' },
            { ja:'ドット',           en:'dots under eyes' },
          ],
        },
      ],
    },
  ],
  body: [
    {
      id:'body_mole', ja:'ほくろ', en:'Mole',
      targetBlock:'body',
      lrWarning:true,
      replaces:[{ block:'body', tag:'mole' }],
      options:[
        { ja:'首',       en:'small mole on neck' },
        { ja:'鎖骨',     en:'small mole on collarbone' },
        { ja:'肩',       en:'small mole on shoulder' },
        { ja:'胸元',     en:'small mole on upper chest' },
        { ja:'太もも',   en:'small mole on thigh' },
      ],
    },
    {
      id:'body_scar', ja:'傷跡', en:'Scar',
      targetBlock:'body',
      replaces:[{ block:'body', tag:'scar' }],
      options:[
        { ja:'肩',     en:'small scar on shoulder' },
        { ja:'腕',     en:'small scar on arm' },
        { ja:'太もも', en:'small scar on thigh' },
      ],
    },
    {
      id:'body_birthmark', ja:'あざ', en:'Birthmark',
      targetBlock:'body',
      replaces:[{ block:'body', tag:'birthmark' }],
      options:[
        { ja:'肩',     en:'subtle birthmark on shoulder' },
        { ja:'太もも', en:'subtle birthmark on upper thigh' },
        { ja:'背中',   en:'birthmark on back' },
      ],
    },
    {
      id:'tattoo', ja:'タトゥー', en:'Tattoo',
      targetBlock:'body',
      replaces:[{ block:'body', tag:'tattoo' }],
      options:[
        { ja:'腕',     en:'small tattoo on arm' },
        { ja:'肩',     en:'tattoo on shoulder' },
        { ja:'背中',   en:'back tattoo' },
        { ja:'胸元',   en:'chest tattoo' },
        { ja:'首',     en:'neck tattoo' },
        { ja:'太もも', en:'thigh tattoo' },
        { ja:'お腹',   en:'stomach tattoo' },
      ],
    },
    {
      // 位置アイテムと併用可：柄＋位置の2タグが重なって「花のタトゥーが腕に」の票になる
      id:'tattoo_motif', ja:'タトゥーの柄', en:'Tattoo Motif',
      targetBlock:'body',
      replaces:[{ block:'body', tag:'tattoo' }],
      options:[
        { ja:'花',         en:'flower tattoo' },
        { ja:'ハート',     en:'heart tattoo' },
        { ja:'龍',         en:'dragon tattoo' },
        { ja:'蝶',         en:'butterfly tattoo' },
        { ja:'トライバル', en:'tribal tattoo' },
      ],
    },
    {
      id:'bandage', ja:'包帯', en:'Bandage',
      targetBlock:'body',
      replaces:[{ block:'body', tag:'bandages' }],
      options:[
        { ja:'腕',   en:'bandage on arm' },
        { ja:'脚',   en:'bandage on leg' },
        { ja:'片目', en:'bandage over one eye' },
        { ja:'頭',   en:'bandaged head' },
      ],
    },
    {
      id:'bandaid_body', ja:'絆創膏', en:'Bandaid',
      targetBlock:'body',
      replaces:[{ block:'body', tag:'bandaid' }],
      options:[
        { ja:'腕', en:'bandaid on arm' },
        { ja:'膝', en:'bandaid on knee' },
        { ja:'脚', en:'bandaid on leg' },
      ],
    },
  ],
  accessory: [
    {
      id:'piercing_pos', ja:'ピアス', en:'Piercing',
      targetBlock:'body',
      lrWarning:true,
      replaces:[{ block:'body', tag:'piercing' }],
      options:[
        { ja:'両耳',   en:'ear piercing' },
        { ja:'左耳',   en:'ear piercing left ear' },
        { ja:'右耳',   en:'ear piercing right ear' },
        { ja:'眉',     en:'eyebrow piercing' },
        { ja:'へそ',   en:'navel piercing' },
        { ja:'リップ', en:'lip piercing' },
        { ja:'鼻',     en:'nose piercing' },
      ],
    },
    {
      id:'ribbon_pos', ja:'リボン', en:'Ribbon',
      targetBlock:'outfit_detail',
      replaces:[{ block:'outfit_detail', tag:'ribbons' }],
      options:[
        { ja:'首',           en:'neck ribbon' },
        { ja:'腕',           en:'arm ribbon' },
        { ja:'脚',           en:'leg ribbon' },
        { ja:'足首',         en:'ankle ribbon' },
        { ja:'背中（大リボン）', en:'back bow' },
      ],
    },
    {
      id:'glasses_pos', ja:'眼鏡', en:'Glasses',
      targetBlock:'outfit',
      replaces:[{ block:'outfit_detail', tag:'glasses' }, { block:'outfit_detail', tag:'goggles' }],
      subtypes:[
        {
          id:'normal', ja:'ノーマル',
          options:[
            { ja:'着用中',     en:'wearing glasses' },
            { ja:'頭に乗せる', en:'glasses on head' },
          ],
        },
        {
          id:'under_rim', ja:'アンダーリム',
          options:[
            { ja:'着用中',     en:'under-rim glasses' },
            { ja:'頭に乗せる', en:'under-rim glasses on head' },
          ],
        },
        {
          id:'half_rim', ja:'ハーフリム',
          options:[
            { ja:'着用中',     en:'half-rim glasses' },
            { ja:'頭に乗せる', en:'half-rim glasses on head' },
          ],
        },
        {
          id:'round', ja:'丸メガネ',
          options:[
            { ja:'着用中',     en:'round eyewear' },
            { ja:'頭に乗せる', en:'round eyewear on head' },
          ],
        },
        {
          id:'square', ja:'スクエア',
          options:[
            { ja:'着用中',     en:'square eyewear' },
            { ja:'頭に乗せる', en:'square eyewear on head' },
          ],
        },
        {
          id:'goggles', ja:'ゴーグル',
          options:[
            { ja:'着用中',     en:'goggles' },
            { ja:'頭に乗せる', en:'goggles on head' },
          ],
        },
      ],
    },
    {
      id:'sunglasses_pos', ja:'サングラス', en:'Sunglasses',
      targetBlock:'outfit',
      replaces:[{ block:'outfit_detail', tag:'sunglasses' }],
      options:[
        { ja:'着用中',       en:'wearing sunglasses' },
        { ja:'頭に乗せる',   en:'sunglasses on head' },
        { ja:'首元にかける', en:'sunglasses hanging from collar' },
      ],
    },
    {
      id:'eyepatch_pos', ja:'眼帯', en:'Eyepatch',
      targetBlock:'face',
      lrWarning:true,
      replaces:[{ block:'outfit_detail', tag:'eyepatch' }],
      options:[
        { ja:'左目', en:'eyepatch over left eye' },
        { ja:'右目', en:'eyepatch over right eye' },
      ],
    },
    {
      id:'headphones_pos', ja:'ヘッドホン', en:'Headphones',
      targetBlock:'outfit',
      replaces:[{ block:'outfit_detail', tag:'headphones' }],
      options:[
        { ja:'着用中',     en:'wearing headphones' },
        { ja:'首にかける', en:'headphones around neck' },
      ],
    },
    {
      id:'face_mask_pos', ja:'マスク', en:'Face Mask',
      targetBlock:'face',
      replaces:[{ block:'outfit_detail', tag:'face mask' }],
      options:[
        { ja:'着用中',     en:'wearing face mask' },
        { ja:'下げている', en:'face mask pulled down' },
      ],
    },
  ],
};

// ── 特徴メーカー生成タグの日本語変換マップ ──────────────────────────────
// applyFeatureMakerLayer / FeatureMakerModal が生成する位置付き特殊タグ → ja ラベル
export const FEATURE_TAG_JA = {
  // リボン（位置）
  'neck ribbon':                '首リボン',
  'arm ribbon':                 '腕リボン',
  'leg ribbon':                 '脚リボン',
  'ankle ribbon':               '足首リボン',
  'back bow':                   '背中の大きなリボン',
  // タトゥー（位置）
  'chest tattoo':               '胸元にタトゥー',
  'neck tattoo':                '首にタトゥー',
  'thigh tattoo':               '太ももにタトゥー',
  'stomach tattoo':             'お腹にタトゥー',
  // タトゥー（柄）
  'flower tattoo':              '花のタトゥー',
  'heart tattoo':               'ハートのタトゥー',
  'dragon tattoo':              '龍のタトゥー',
  'butterfly tattoo':           '蝶のタトゥー',
  'tribal tattoo':              'トライバルタトゥー',
  // フェイスマーク
  'facial mark':                '頬のマーク',
  'star mark on cheek':         '頬に星マーク',
  'heart mark on cheek':        '頬にハートマーク',
  'triangle mark on cheek':     '頬に三角マーク',
  'square mark on cheek':       '頬に四角マーク',
  'diamond mark on cheek':      '頬にダイヤマーク',
  'cross mark on cheek':        '頬に十字マーク',
  'facial mark under eyes':     '目の下のマーク',
  'line markings under eyes':   '目の下にライン',
  'triangle marks under eyes':  '目の下に三角マーク',
  'dots under eyes':            '目の下にドット',
  'whisker markings':           'ひげ風の頬マーク',
  'facepaint':                  'フェイスペイント',
  // 傷・包帯（位置）
  'scar across eye':            '目を縦断する傷',
  'bandage over one eye':       '片目に包帯（眼帯風）',
  'bandaged head':              '頭に包帯',
  // ほくろ（顔）
  'mole under left eye':        '左目の下にほくろ',
  'mole under right eye':       '右目の下にほくろ',
  'mole near mouth':            '口元にほくろ',
  'mole on cheek':              '頬にほくろ',
  'mole on neck':               '首にほくろ',
  'mole on collarbone':         '鎖骨にほくろ',
  'small mole under left eye':  '左目の下に小さなほくろ',
  'small mole under right eye': '右目の下に小さなほくろ',
  'small mole on left cheek':   '左頬にほくろ',
  'small mole on right cheek':  '右頬にほくろ',
  'beauty mark near mouth':     '口元に泣きぼくろ',
  // ほくろ（ボディ）
  'small mole on neck':         '首にほくろ',
  'small mole on collarbone':   '鎖骨にほくろ',
  'small mole on shoulder':     '肩にほくろ',
  'small mole on upper chest':  '胸元にほくろ',
  'small mole on thigh':        '太ももにほくろ',
  // そばかす
  'freckles on cheeks':         '頬にそばかす',
  'light freckles across nose': '鼻に薄いそばかす',
  'subtle freckles':            'うっすらそばかす',
  // 傷跡（顔）
  'facial scar':                '顔の傷',
  'scar above eyebrow':         '眉上の傷',
  'scar on cheek':              '頬の傷',
  'scar on neck':               '首の傷',
  'small scar on left cheek':   '左頬に傷',
  'small scar on right cheek':  '右頬に傷',
  'subtle scar over left eyebrow':  '左眉上に傷',
  'subtle scar over right eyebrow': '右眉上に傷',
  'scar on nose':               '鼻に傷',
  // 傷跡（ボディ）
  'small scar on shoulder':     '肩に傷',
  'small scar on arm':          '腕に傷',
  'small scar on thigh':        '太ももに傷',
  // あざ（顔）
  'birthmark on cheek':         '頬のあざ',
  'birthmark on neck':          '首のあざ',
  'birthmark on shoulder':      '肩のあざ',
  'small birthmark on cheek':   '頬に小さなあざ',
  'subtle birthmark on neck':   '首にあざ',
  // あざ（ボディ）
  'subtle birthmark on shoulder':   '肩にあざ',
  'subtle birthmark on upper thigh':'太ももにあざ',
  'birthmark on back':          '背中にあざ',
  // タトゥー
  'small tattoo on arm':        '腕にタトゥー',
  'tattoo on shoulder':         '肩にタトゥー',
  'back tattoo':                '背中にタトゥー',
  'tattoo on upper arm':        '上腕にタトゥー',
  'tattoo on back':             '背中にタトゥー',
  'tattoo on thigh':            '太ももにタトゥー',
  // 絆創膏（顔）
  'bandaid on cheek':           '頬に絆創膏',
  'bandaid on left cheek':      '左頬に絆創膏',
  'bandaid on right cheek':     '右頬に絆創膏',
  'bandaid on nose':            '鼻に絆創膏',
  'bandaid on forehead':        '額に絆創膏',
  // 絆創膏（ボディ）
  'bandaid on arm':             '腕に絆創膏',
  'bandaid on knee':            '膝に絆創膏',
  'bandaid on leg':             '脚に絆創膏',
  // 包帯
  'bandage on arm':             '腕に包帯',
  'bandage on leg':             '脚に包帯',
  // 眼帯
  'eyepatch over left eye':     '左目に眼帯',
  'eyepatch over right eye':    '右目に眼帯',
  // ピアス
  'ear piercing':               '耳ピアス',
  'ear piercing left ear':      '左耳ピアス',
  'ear piercing right ear':     '右耳ピアス',
  'eyebrow piercing':           '眉ピアス',
  'navel piercing':             'へそピアス',
  'lip piercing':               'リップピアス',
  'nose piercing':              '鼻ピアス',
  // 眼鏡・サングラス
  'wearing glasses':            '眼鏡着用',
  'glasses on head':            '眼鏡を頭に乗せる',
  'under-rim glasses':          'アンダーリム眼鏡',
  'under-rim glasses on head':  'アンダーリム眼鏡を頭に',
  'half-rim glasses':           'ハーフリム眼鏡',
  'half-rim glasses on head':   'ハーフリム眼鏡を頭に',
  'round eyewear':              '丸メガネ',
  'round eyewear on head':      '丸メガネを頭に乗せる',
  'square eyewear':             'スクエアメガネ',
  'square eyewear on head':     'スクエアメガネを頭に乗せる',
  'goggles on head':            'ゴーグルを頭に乗せる',
  'wearing sunglasses':         'サングラス着用',
  'sunglasses on head':         'サングラスを頭に乗せる',
  'sunglasses hanging from collar': 'サングラスを首元にかける',
  // 額のマーク
  'forehead jewel':             '額に宝石',
  'star mark on forehead':      '額に星紋',
  'crescent mark on forehead':  '額に三日月紋',
  'rune mark on forehead':      '額にルーン',
  'magic seal on forehead':     '額に魔法陣',
  'occult mark on forehead':    '額に呪印',
  // ヘッドフォン・マスク
  'wearing headphones':         'ヘッドフォン着用',
  'headphones around neck':     'ヘッドフォンを首にかける',
  'wearing face mask':          'マスク着用',
  'face mask pulled down':      'マスクを下げる',
};

export function resolveFeatureLabel(tagEn) {
  if (!tagEn) return null;
  const ja = FEATURE_TAG_JA[tagEn.trim().toLowerCase()];
  return ja ? { en: tagEn.trim(), ja } : null;
}

// ── オプションen → 置き換えリストの逆引き ──────────────────────────
// applyFeatureTag が「素のタグとの2重」を除去するために使う。
// 返り値: [{ block, tag }] （タグが見つからなければ []）
const OPTION_REPLACES = (() => {
  const m = new Map();
  for (const items of Object.values(FEATURE_ITEMS)) {
    for (const item of items) {
      const opts = item.subtypes ? item.subtypes.flatMap(s => s.options) : (item.options || []);
      for (const o of opts) {
        const removals = [...(item.replaces || [])];
        if (item.replacesSelf) removals.push({ block: item.replacesSelf, tag: o.en });
        if (removals.length) m.set(o.en.toLowerCase(), removals);
      }
    }
  }
  return m;
})();

export function getFeatureReplaces(optionEn) {
  if (!optionEn) return [];
  return OPTION_REPLACES.get(optionEn.trim().toLowerCase()) || [];
}
