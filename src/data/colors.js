export const COLOR_PALETTE = [
  { ja:'赤',     en:'red',        hex:'#e23b3b' },
  { ja:'ピンク', en:'pink',       hex:'#f06fa0' },
  { ja:'橙',     en:'orange',     hex:'#f08c3b' },
  { ja:'黄',     en:'yellow',     hex:'#f0d23b' },
  { ja:'緑',     en:'green',      hex:'#4caf50' },
  { ja:'青緑',   en:'teal',       hex:'#1fb8a6' },
  { ja:'水色',   en:'light blue', hex:'#5ec8f0' },
  { ja:'青',     en:'blue',       hex:'#3b6fe2' },
  { ja:'紺',     en:'navy blue',  hex:'#1e3a6e' },
  { ja:'紫',     en:'purple',     hex:'#9b4fe0' },
  { ja:'藤色',   en:'lavender',   hex:'#c9a6f0' },
  { ja:'茶',     en:'brown',      hex:'#8a5a3b' },
  { ja:'ベージュ',en:'beige',     hex:'#d8c0a0' },
  { ja:'白',     en:'white',      hex:'#f5f5f5' },
  { ja:'灰',     en:'gray',       hex:'#9098a8' },
  { ja:'黒',     en:'black',      hex:'#2a2a2e' },
  { ja:'金',     en:'gold',       hex:'#e0b84f' },
  { ja:'銀',     en:'silver',     hex:'#c0c8d0' },
];

// dark / (none) / light prefix added before color name
export const SHADES = [
  { id:'dark',   ja:'濃い', en:'dark '  },
  { id:'normal', ja:'標準', en:''       },
  { id:'light',  ja:'薄い', en:'light ' },
];

export const COLOR_TARGETS = [
  { id:'hair',   ja:'髪',       en:'hair'      },
  { id:'eyes',   ja:'瞳',       en:'eyes'      },
  { id:'dress',  ja:'服',       en:'dress'     },
  { id:'shirt',  ja:'シャツ',   en:'shirt'     },
  { id:'skirt',  ja:'スカート', en:'skirt'     },
  { id:'jacket', ja:'上着',     en:'jacket'    },
  { id:'ribbon', ja:'リボン',   en:'ribbon'    },
  { id:'shoes',  ja:'靴',       en:'footwear'  },
  { id:'skin',   ja:'肌',       en:'skin'      },
  { id:'theme',  ja:'テーマ色', en:'theme'     },
];

export const buildColorTag = (shade, colorEn, targetEn) =>
  `${shade}${colorEn} ${targetEn}`.trim();
