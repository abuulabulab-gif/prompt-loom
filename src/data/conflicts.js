import { splitTags, bareTag } from './constants.js';

export const CONFLICT_RULES = [
  // ── 年齢・体型 ────────────────────────────────────────────────
  { tags:['loli','mature female'],      ja:'幼い体型と成熟体型が矛盾',        en:'loli + mature female' },
  { tags:['loli','adult'],              ja:'幼い体型と大人が矛盾',            en:'loli + adult' },
  { tags:['loli','young adult'],        ja:'幼い体型と青年が矛盾',            en:'loli + young adult' },
  { tags:['young','mature female'],     ja:'幼いと成熟体型が矛盾',            en:'young + mature female' },
  { tags:['tall','short stature'],      ja:'高身長と低身長が矛盾',            en:'tall + short stature' },
  { tags:['slim','chubby'],             ja:'スリムとぽっちゃりが矛盾',        en:'slim + chubby' },
  { tags:['slender','muscular'],        ja:'細身と筋肉質が矛盾',              en:'slender + muscular' },
  { tags:['slim','curvy'],              ja:'スリムとグラマーが矛盾',          en:'slim + curvy' },
  { tags:['petite','tall'],             ja:'小柄と高身長が矛盾',              en:'petite + tall' },
  { tags:['toned','chubby'],            ja:'引き締まりとぽっちゃりが矛盾',    en:'toned + chubby' },

  // ── 胸サイズ ───────────────────────────────────────────────────
  { tags:['flat chest','huge breasts'],   ja:'胸サイズが矛盾',               en:'flat chest + huge breasts' },
  { tags:['flat chest','large breasts'],  ja:'胸サイズが矛盾',               en:'flat chest + large breasts' },
  { tags:['flat chest','medium breasts'], ja:'胸サイズが矛盾',               en:'flat chest + medium breasts' },
  { tags:['small breasts','huge breasts'],ja:'胸サイズが矛盾',               en:'small breasts + huge breasts' },

  // ── 髪の長さ ───────────────────────────────────────────────────
  { tags:['short hair','very long hair'],        ja:'髪の長さが矛盾',         en:'short hair + very long hair' },
  { tags:['short hair','long hair'],             ja:'髪の長さが矛盾',         en:'short hair + long hair' },
  { tags:['short hair','hair past waist'],       ja:'髪の長さが矛盾',         en:'short hair + hair past waist' },
  { tags:['short hair','hair past hips'],        ja:'髪の長さが矛盾',         en:'short hair + hair past hips' },
  { tags:['short hair','floor-length hair'],     ja:'髪の長さが矛盾',         en:'short hair + floor-length hair' },
  { tags:['very short hair','very long hair'],   ja:'髪の長さが矛盾',         en:'very short hair + very long hair' },
  { tags:['very short hair','long hair'],        ja:'髪の長さが矛盾',         en:'very short hair + long hair' },
  { tags:['very short hair','hair past shoulders'],ja:'髪の長さが矛盾',       en:'very short hair + hair past shoulders' },
  { tags:['very short hair','hair past waist'],  ja:'髪の長さが矛盾',         en:'very short hair + hair past waist' },
  { tags:['pixie cut','very long hair'],         ja:'ピクシーカットと超ロングが矛盾', en:'pixie cut + very long hair' },
  { tags:['pixie cut','long hair'],              ja:'ピクシーカットとロングが矛盾',  en:'pixie cut + long hair' },
  { tags:['bob cut','very long hair'],           ja:'ボブと超ロングが矛盾',    en:'bob cut + very long hair' },
  { tags:['bob cut','long hair'],                ja:'ボブとロングが矛盾',      en:'bob cut + long hair' },
  { tags:['bob cut','hair past shoulders'],      ja:'ボブと肩より長い髪が矛盾', en:'bob cut + hair past shoulders' },

  // ── 口 ───────────────────────────────────────────────────────
  { tags:['open mouth','closed mouth'],  ja:'口の開閉が矛盾',                 en:'open mouth + closed mouth' },
  { tags:['closed mouth','tongue out'],  ja:'口を閉じて舌が出せない',          en:'closed mouth + tongue out' },

  // ── 表情 ───────────────────────────────────────────────────────
  { tags:['smile','expressionless'],     ja:'笑顔と無表情が矛盾',             en:'smile + expressionless' },
  { tags:['grin','expressionless'],      ja:'笑顔と無表情が矛盾',             en:'grin + expressionless' },
  { tags:['smile','serious'],            ja:'笑顔と真剣が矛盾',               en:'smile + serious' },
  { tags:['grin','serious'],             ja:'満面笑顔と真剣が矛盾',           en:'grin + serious' },
  { tags:['angry','smile'],              ja:'怒りと笑顔が矛盾',               en:'angry + smile' },
  { tags:['sad','grin'],                 ja:'悲しいと満面笑顔が矛盾',         en:'sad + grin' },
  { tags:['pout','grin'],                ja:'むくれと満面笑顔が矛盾',         en:'pout + grin' },
  { tags:['angry','wink'],               ja:'怒りとウインクが矛盾',           en:'angry + wink' },

  // ── ポーズ ────────────────────────────────────────────────────
  { tags:['lying on back','lying on stomach'],  ja:'仰向けとうつ伏せが矛盾',  en:'lying on back + lying on stomach' },
  { tags:['sitting','jumping'],          ja:'座りとジャンプが矛盾',           en:'sitting + jumping' },
  { tags:['sitting','running'],          ja:'座りと走りが矛盾',               en:'sitting + running' },
  { tags:['lying','jumping'],            ja:'横たわりとジャンプが矛盾',       en:'lying + jumping' },
  { tags:['lying','running'],            ja:'横たわりと走りが矛盾',           en:'lying + running' },
  { tags:['kneeling','jumping'],         ja:'膝立ちとジャンプが矛盾',         en:'kneeling + jumping' },
  { tags:['all fours','standing'],       ja:'四つん這いと立ちが矛盾',         en:'all fours + standing' },
  { tags:['all fours','jumping'],        ja:'四つん這いとジャンプが矛盾',     en:'all fours + jumping' },
  { tags:['all fours','running'],        ja:'四つん這いと走りが矛盾',         en:'all fours + running' },
  { tags:['all fours','sitting'],        ja:'四つん這いと座りが矛盾',         en:'all fours + sitting' },

  // ── 人数 ─────────────────────────────────────────────────────
  { tags:['solo','2girls'],              ja:'ひとりと女の子2人が矛盾',         en:'solo + 2girls' },
  { tags:['solo','2boys'],               ja:'ひとりと男の子2人が矛盾',         en:'solo + 2boys' },
  { tags:['solo','multiple girls'],      ja:'ひとりと複数人が矛盾',            en:'solo + multiple girls' },
  { tags:['solo','multiple boys'],       ja:'ひとりと複数人が矛盾',            en:'solo + multiple boys' },
  { tags:['1girl','2girls'],             ja:'女の子の人数が矛盾',              en:'1girl + 2girls' },
  { tags:['1girl','multiple girls'],     ja:'女の子の人数が矛盾',              en:'1girl + multiple girls' },
  { tags:['1boy','2boys'],               ja:'男の子の人数が矛盾',              en:'1boy + 2boys' },
  { tags:['1boy','multiple boys'],       ja:'男の子の人数が矛盾',              en:'1boy + multiple boys' },

  // ── カメラ距離 ─────────────────────────────────────────────────
  { tags:['close-up','full body'],             ja:'クローズアップと全身が矛盾',      en:'close-up + full body' },
  { tags:['face close-up','full body'],        ja:'顔アップと全身が矛盾',            en:'face close-up + full body' },
  { tags:['extreme close-up','full body'],     ja:'超アップと全身が矛盾',            en:'extreme close-up + full body' },
  { tags:['extreme close-up','wide shot'],     ja:'超アップとワイドが矛盾',          en:'extreme close-up + wide shot' },
  { tags:['face close-up','wide shot'],        ja:'顔アップとワイドが矛盾',          en:'face close-up + wide shot' },
  { tags:['portrait','wide shot'],             ja:'ポートレートとワイドが矛盾',      en:'portrait + wide shot' },
  { tags:['portrait','full body'],             ja:'ポートレートと全身が矛盾',        en:'portrait + full body' },
  { tags:['close-up','wide shot'],             ja:'クローズアップとワイドが矛盾',    en:'close-up + wide shot' },
  { tags:['bust shot','wide shot'],            ja:'バストアップとワイドが矛盾',      en:'bust shot + wide shot' },

  // ── カメラ角度 ─────────────────────────────────────────────────
  { tags:['from above','from below'],          ja:'見上げと見下ろしが矛盾',          en:'from above + from below' },
  { tags:['front view','back view'],           ja:'正面と後ろ向きが矛盾',            en:'front view + back view' },
  { tags:["bird's-eye view","worm's-eye view"],ja:'俯瞰とあおりが矛盾',             en:"bird's-eye view + worm's-eye view" },
  { tags:['from below',"bird's-eye view"],     ja:'見上げと俯瞰が矛盾',             en:"from below + bird's-eye view" },
  { tags:['from above',"worm's-eye view"],     ja:'見下ろしとあおりが矛盾',         en:"from above + worm's-eye view" },

  // ── 時間・照明 ─────────────────────────────────────────────────
  { tags:['day','night'],                ja:'昼と夜が矛盾',                    en:'day + night' },
  { tags:['sunlight','night'],           ja:'陽光と夜が矛盾',                  en:'sunlight + night' },
  { tags:['moonlight','day'],            ja:'月光と昼が矛盾',                  en:'moonlight + day' },
  { tags:['starry sky','day'],           ja:'星空と昼が矛盾',                  en:'starry sky + day' },
  { tags:['sharp focus','motion blur'],  ja:'シャープとモーションブラーが矛盾', en:'sharp focus + motion blur' },

  // ── 天候 ──────────────────────────────────────────────────────
  { tags:['clear sky','cloudy'],         ja:'晴れと曇りが矛盾',                en:'clear sky + cloudy' },
  { tags:['clear sky','rainy'],          ja:'晴れと雨が矛盾',                  en:'clear sky + rainy' },
  { tags:['clear sky','foggy'],          ja:'晴れと霧が矛盾',                  en:'clear sky + foggy' },

  // ── 場所 ───────────────────────────────────────────────────────
  { tags:['indoors','outdoors'],         ja:'屋内と屋外が矛盾',                en:'indoors + outdoors' },

  // ── 背景 ─────────────────────────────────────────────────────
  { tags:['white background','cityscape'],   ja:'白背景と都市景観が矛盾',      en:'white background + cityscape' },
  { tags:['white background','forest'],      ja:'白背景と森が矛盾',            en:'white background + forest' },
  { tags:['white background','beach'],       ja:'白背景とビーチが矛盾',        en:'white background + beach' },
  { tags:['white background','ocean'],       ja:'白背景と海が矛盾',            en:'white background + ocean' },
  { tags:['white background','bedroom'],     ja:'白背景と寝室が矛盾',          en:'white background + bedroom' },
  { tags:['white background','classroom'],   ja:'白背景と教室が矛盾',          en:'white background + classroom' },
  { tags:['white background','garden'],      ja:'白背景と庭園が矛盾',          en:'white background + garden' },
  { tags:['simple background','cityscape'],  ja:'シンプル背景と都市景観が矛盾', en:'simple background + cityscape' },
  { tags:['simple background','forest'],     ja:'シンプル背景と森が矛盾',      en:'simple background + forest' },
  { tags:['simple background','beach'],      ja:'シンプル背景とビーチが矛盾',  en:'simple background + beach' },
  { tags:['simple background','bedroom'],    ja:'シンプル背景と寝室が矛盾',    en:'simple background + bedroom' },
  { tags:['simple background','classroom'],  ja:'シンプル背景と教室が矛盾',    en:'simple background + classroom' },

  // ── アートスタイル ─────────────────────────────────────────────
  { tags:['monochrome','vibrant colors'], ja:'モノクロと鮮やかな色が矛盾',    en:'monochrome + vibrant colors' },
  { tags:['monochrome','colorful'],       ja:'モノクロとカラフルが矛盾',      en:'monochrome + colorful' },
  { tags:['monochrome','neon colors'],    ja:'モノクロとネオンカラーが矛盾',  en:'monochrome + neon colors' },
  { tags:['realistic','anime'],           ja:'リアルとアニメスタイルが矛盾',  en:'realistic + anime' },
  { tags:['realistic','cel shading'],     ja:'リアルとセルシェードが矛盾',    en:'realistic + cel shading' },
  { tags:['realistic','manga style'],     ja:'リアルとマンガスタイルが矛盾',  en:'realistic + manga style' },
  { tags:['realistic','pixel art'],       ja:'リアルとピクセルアートが矛盾',  en:'realistic + pixel art' },
  { tags:['sketch','realistic'],          ja:'スケッチとリアルが矛盾',        en:'sketch + realistic' },
  { tags:['cel shading','watercolor'],    ja:'セルシェードと水彩が矛盾',      en:'cel shading + watercolor' },
  { tags:['pixel art','3D rendering'],    ja:'ピクセルアートと3Dレンダリングが矛盾', en:'pixel art + 3D rendering' },
  { tags:['manga style','3D rendering'],  ja:'マンガと3Dレンダリングが矛盾',  en:'manga style + 3D rendering' },

  // ── 種族×衣装 ────────────────────────────────────────────────
  { tags:['mermaid','thighhighs'],       ja:'人魚とニーハイが矛盾（脚がない）', en:'mermaid + thighhighs' },
  { tags:['mermaid','shorts'],           ja:'人魚とショーツが矛盾（脚がない）', en:'mermaid + shorts' },
  { tags:['mermaid','skirt'],            ja:'人魚とスカートが矛盾（脚がない）', en:'mermaid + skirt' },
  { tags:['mermaid','pants'],            ja:'人魚とパンツが矛盾（脚がない）',   en:'mermaid + pants' },
  { tags:['mermaid','barefoot'],         ja:'人魚と裸足が矛盾（脚がない）',     en:'mermaid + barefoot' },
  { tags:['mermaid','leggings'],         ja:'人魚とレギンスが矛盾（脚がない）', en:'mermaid + leggings' },
];

export const detectConflicts = text => {
  const bares = splitTags(text).map(s => bareTag(s).toLowerCase());
  return CONFLICT_RULES.filter(r => r.tags.every(t => bares.includes(t.toLowerCase())));
};
