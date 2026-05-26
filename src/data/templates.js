export const TEMPLATES = [
  {
    id:'anime', name:'アニメ標準', nameEn:'Anime Standard', icon:'🌸',
    desc:'一般的なアニメ・イラスト向け', descEn:'Standard anime illustration',
    apply: {
      quality:  'masterpiece, best quality, ultra-detailed, highres, absurdres',
      artstyle: 'anime, vibrant colors, cel shading, smooth shading',
    },
  },
  {
    id:'photo', name:'フォトリアル', nameEn:'Photorealistic', icon:'📷',
    desc:'写真・リアル系生成向け', descEn:'Realistic photography style',
    apply: {
      quality:  'masterpiece, ultra-detailed, highres, sharp focus, detailed skin',
      artstyle: 'realistic, photorealistic, subsurface scattering, depth of field, bokeh',
    },
  },
  {
    id:'fantasy', name:'ファンタジー', nameEn:'Fantasy Art', icon:'⚔️',
    desc:'ゲーム・ファンタジー系イラスト', descEn:'Fantasy / game art style',
    apply: {
      quality:  'masterpiece, best quality, ultra-detailed, intricate details',
      artstyle: 'concept art, painterly, atmospheric, glowing, vibrant colors',
    },
  },
  {
    id:'asset', name:'素材・白背景', nameEn:'Clean Asset', icon:'🎨',
    desc:'立ち絵・透過素材・キャラ素材向け', descEn:'Character asset / transparent bg',
    // 役割: ノイズなしの純粋なキャラ単体素材。masterpiece追加でベースライン品質を統一
    sizeHintJa: '【推奨サイズ】縦長（Portrait）',
    sizeHintEn: '[Recommended] Portrait (vertical)',
    apply: {
      quality:    'masterpiece, best quality, ultra-detailed, highres, sharp focus',
      artstyle:   'illustration, flat color, cel shading, vibrant colors, hard shading',
      background: 'white background, simple background',
    },
  },
  {
    id:'sanmenzu', name:'三面図', nameEn:'3-View Sheet', icon:'📐',
    desc:'正面・側面・背面の三面参考図', descEn:'Front / side / back reference sheet',
    // 役割: 衣装構造把握用。lineart/soft shadingを削除しflat cel shadingに統一（塗りブレ防止）
    sizeHintJa: '【推奨サイズ】横長（Landscape / 16:9等）⚠️ 縦長で生成するとキャラの体が融合（キメラ化）する危険があります！',
    sizeHintEn: '[Recommended] Landscape (16:9 etc.) ⚠️ Portrait orientation may cause body fusion (chimera artifacts)!',
    apply: {
      quality:     'masterpiece, best quality, ultra-detailed, highres, sharp focus',
      artstyle:    'illustration, flat color, cel shading',
      composition: 'character sheet, multiple views, front view, side view, back view, full body, turnaround',
      background:  'white background, simple background',
    },
  },
  {
    id:'chardesign', name:'キャラ設定シート', nameEn:'Design Sheet', icon:'🎭',
    desc:'デザイン資料・設定画・表情集向け', descEn:'Character design reference / expression sheet',
    // 役割: キャラデザインのバイブル。lineart削除、color palette/notes/text追加で設定資料らしさ演出
    sizeHintJa: '【推奨サイズ】横長（Landscape）または正方形（Square）',
    sizeHintEn: '[Recommended] Landscape or Square',
    apply: {
      quality:     'masterpiece, best quality, ultra-detailed, highres, sharp focus',
      artstyle:    'concept art, illustration, digital art',
      composition: 'character design sheet, reference sheet, full body, expression sheet, color palette, notes, text',
      background:  'white background, simple background',
    },
  },
  // ── 構図・フェチ特化テンプレート（SFW）──
  {
    id: 'zettairyouiki',
    name: '絶対領域・太もも',
    nameEn: 'Zettai Ryouiki',
    icon: '🦵',
    desc: '太もも露出・絶対領域・脚フォーカス',
    descEn: 'Thigh focus / zettai ryouiki',
    apply: {
      composition: 'cowboy shot',
      body: 'crossed legs, leg focus, thighs, zettai ryouiki',
      outfit: 'skirt, thighhighs',
    },
  },
  {
    id: 'napeandback',
    name: 'うなじ・背中',
    nameEn: 'Nape & Back',
    icon: '🌸',
    desc: 'うなじ・肩・背中の美しさを引き出す構図',
    descEn: 'Nape, bare shoulder, bare back composition',
    apply: {
      composition: 'upper body, back view, looking back',
      body: 'nape, bare shoulders, bare back',
      face: 'hair updo',
    },
  },
  {
    id: 'footperspective',
    name: '足先・俯瞰パース',
    nameEn: 'Feet & Perspective',
    icon: '🦶',
    desc: '足先・俯瞰アングル・パース強調構図',
    descEn: 'Feet / bird-eye angle with foreshortening',
    apply: {
      composition: 'from above, high angle, sitting, looking up, foreshortening',
      body: 'barefoot, foot focus, toes',
    },
  },
  {
    id: 'armpitsleeveless',
    name: '脇・ノースリーブ',
    nameEn: 'Armpits Sleeveless',
    icon: '💪',
    desc: '脇・ノースリーブ・バストアップ特化構図',
    descEn: 'Armpits / sleeveless bust-up shot',
    apply: {
      composition: 'bust shot, arms behind head',
      body: 'armpits',
      outfit: 'tank top, sleeveless',
    },
  },
];
