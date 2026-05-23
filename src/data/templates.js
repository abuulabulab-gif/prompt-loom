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
      quality:  'masterpiece, ultra-detailed, hyperrealistic, 8k, RAW photo, sharp focus',
      artstyle: 'realistic, photorealistic, depth of field, bokeh, cinematic',
    },
  },
  {
    id:'fantasy', name:'ファンタジー', nameEn:'Fantasy Art', icon:'⚔️',
    desc:'ゲーム・ファンタジー系イラスト', descEn:'Fantasy / game art style',
    apply: {
      quality:  'masterpiece, best quality, incredibly detailed, cinematic',
      artstyle: 'fantasy art, concept art, painterly, atmospheric, magical, glowing, dramatic lighting',
    },
  },
  {
    id:'asset', name:'素材・白背景', nameEn:'Clean Asset', icon:'🎨',
    desc:'立ち絵・透過素材・キャラ素材向け', descEn:'Character asset / transparent bg',
    apply: {
      quality:    'best quality, ultra-detailed, professional artwork, sharp focus',
      artstyle:   'illustration, flat color, cel shading, clean lines, vibrant colors',
      background: 'white background, simple background',
    },
  },
  {
    id:'sanmenzu', name:'三面図', nameEn:'3-View Sheet', icon:'📐',
    desc:'正面・側面・背面の三面参考図', descEn:'Front / side / back reference sheet',
    apply: {
      quality:     'best quality, ultra-detailed, professional artwork, sharp focus, highres',
      artstyle:    'illustration, clean lineart, flat color, simple shading, cel shading',
      composition: 'character sheet, multiple views, front view, side view, back view, full body, turnaround',
      background:  'white background, simple background',
    },
  },
  {
    id:'chardesign', name:'キャラ設定シート', nameEn:'Design Sheet', icon:'🎭',
    desc:'デザイン資料・設定画・表情集向け', descEn:'Character design reference / expression sheet',
    apply: {
      quality:     'masterpiece, best quality, ultra-detailed, professional artwork, highres',
      artstyle:    'concept art, illustration, digital art, clean lineart',
      composition: 'character design sheet, reference sheet, full body, expression sheet, color palette',
      background:  'white background, simple background',
    },
  },
];
