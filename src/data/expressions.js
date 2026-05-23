export const EXPRESSION_PRESETS = [
  { id: 'smile',         icon: '😊', ja: '微笑み',   en: 'Smile',     tags: ['smile', 'closed mouth'] },
  { id: 'laugh',         icon: '😄', ja: '大笑い',   en: 'Laugh',     tags: ['grin', 'open mouth', ':d'] },
  { id: 'blush',         icon: '😳', ja: '照れ笑い', en: 'Blush',     tags: ['smile', 'blushing', 'embarrassed'] },
  { id: 'serious',       icon: '😐', ja: '真剣',     en: 'Serious',   tags: ['serious', 'closed mouth'] },
  { id: 'sad',           icon: '😢', ja: '悲しい',   en: 'Sad',       tags: ['sad', 'teardrop'] },
  { id: 'surprised',     icon: '😲', ja: '驚き',     en: 'Surprised', tags: ['surprised', 'wide eyes', 'open mouth'] },
  { id: 'angry',         icon: '😠', ja: '怒り',     en: 'Angry',     tags: ['angry', 'angry eyebrows'] },
  { id: 'expressionless',icon: '😶', ja: '無表情',   en: 'Blank',     tags: ['expressionless'] },
  { id: 'wink',          icon: '😉', ja: 'ウインク', en: 'Wink',      tags: ['wink', 'light smile'] },
  { id: 'pout',          icon: '😤', ja: 'むくれ',   en: 'Pout',      tags: ['pout'] },
  { id: 'smirk',         icon: '😏', ja: 'ニヤリ',   en: 'Smirk',     tags: ['smirk', 'half-closed eyes'] },
  { id: 'cry',           icon: '😭', ja: '号泣',     en: 'Crying',    tags: ['sad', 'tear', 'open mouth'] },
  { id: 'nervous',       icon: '😅', ja: '汗顔',     en: 'Nervous',   tags: ['light smile', 'sweat'] },
  { id: 'excited',       icon: '🤩', ja: '興奮',     en: 'Excited',   tags: ['excited', 'wide eyes'] },
];

export const ALL_EXPR_TAGS = [...new Set(EXPRESSION_PRESETS.flatMap(p => p.tags))];
