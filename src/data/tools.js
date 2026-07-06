export const TOOLS = [
  { id:'general', name:'汎用',           nameEn:'General',        icon:'🌐', suffix:'',               note:'どのAIでも使用可',         noteEn:'Universal',                sep:', ' },
  { id:'mj',      name:'Midjourney',     nameEn:'Midjourney',     icon:'🟦', suffix:'--ar 3:2 --v 8', note:'--ar で比率変更可',        noteEn:'Change ratio with --ar',   sep:' ' },
  { id:'nai',     name:'NovelAI',        nameEn:'NovelAI',        icon:'📘', suffix:'',               note:'重みを{}形式に変換',       noteEn:'Converts weights to {}',   sep:', ' },
  { id:'sd',      name:'SD/WebUI',       nameEn:'SD/WebUI',       icon:'🖼️', suffix:'',               note:'Forge/ComfyUI対応',        noteEn:'Forge/ComfyUI',            sep:', ' },
  { id:'pixai',   name:'PixAI',          nameEn:'PixAI',          icon:'🎨', suffix:'',               note:'Danbooruタグ・()重み対応', noteEn:'Danbooru tags, () weights', sep:', ' },
  { id:'flux',    name:'Flux2',          nameEn:'Flux2',          icon:'⚡', suffix:'',               note:'重み構文を自動除去',       noteEn:'Auto-strips weights',      sep:', ', stripWeights:true },
  { id:'dalle',   name:'DALL-E/Copilot', nameEn:'DALL-E/Copilot', icon:'🪄', suffix:'',               note:'自然文タブへ自動切替',    noteEn:'Auto-switches to natural', sep:', ' },
];
