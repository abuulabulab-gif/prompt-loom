import { splitTags, bareTag } from './constants.js';

// Helper: generate multiple {tags,ja,en} pairs from one trigger → many targets
// level: 'error' (default) = absolute conflict; 'warn' = unusual but not impossible
function mk(a, bs, ja, level) {
  return bs.map(b => ({ tags: [a, b], ja, en: `${a} + ${b}`, ...(level ? { level } : {}) }));
}

export const CONFLICT_RULES = [
  // ── 年齢・体型 ────────────────────────────────────────────────
  { tags:['loli','mature female'],      ja:'幼い体型と成熟体型が矛盾',        en:'loli + mature female' },
  { tags:['loli','adult'],              ja:'幼い体型と大人が矛盾',            en:'loli + adult' },
  { tags:['loli','young adult'],        ja:'幼い体型と青年が矛盾',            en:'loli + young adult' },
  { tags:['child','mature female'],     ja:'子どもと成熟体型が矛盾',            en:'child + mature female' },
  { tags:['child','muscular'],          ja:'子どもと筋肉質が矛盾',              en:'child + muscular' },
  { tags:['tall','short stature'],      ja:'高身長と低身長が矛盾',            en:'tall + short stature' },
  { tags:['slim','chubby'],             ja:'スリムとぽっちゃりが矛盾',        en:'slim + chubby' },
  { tags:['slender','muscular'],        ja:'細身と筋肉質が矛盾',              en:'slender + muscular' },
  { tags:['slim','curvy'],              ja:'スリムとグラマーが矛盾',          en:'slim + curvy' },
  { tags:['petite','tall'],             ja:'小柄と高身長が矛盾',              en:'petite + tall' },
  { tags:['toned','chubby'],            ja:'引き締まりとぽっちゃりが矛盾',    en:'toned + chubby' },
  { tags:['thick thighs','thigh gap'],  ja:'ムチムチ太ももと太もも隙間は反対の体型なので矛盾', en:'thick thighs + thigh gap' },
  { tags:['long legs','petite'],        ja:'長い脚と小柄な体型が矛盾',        en:'long legs + petite', level:'warn' },

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
  { tags:['smug','expressionless'],      ja:'ドヤ顔と無表情が矛盾',           en:'smug + expressionless' },
  { tags:['smug','serious'],             ja:'ドヤ顔と真剣が矛盾',             en:'smug + serious' },
  { tags:['smug','sad'],                 ja:'ドヤ顔と悲しいが矛盾',           en:'smug + sad' },
  { tags:['smug','crying'],              ja:'ドヤ顔と泣いているが矛盾',       en:'smug + crying' },
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
  { tags:['seiza','standing'],           ja:'正座と立ちが矛盾',               en:'seiza + standing' },
  { tags:['seiza','jumping'],            ja:'正座とジャンプが矛盾',           en:'seiza + jumping' },
  { tags:['seiza','running'],            ja:'正座と走りが矛盾',               en:'seiza + running' },
  { tags:['seiza','walking'],            ja:'正座と歩きが矛盾',               en:'seiza + walking' },
  { tags:['sitting cross-legged','standing'],ja:'あぐらと立ちが矛盾',         en:'sitting cross-legged + standing' },
  { tags:['sitting cross-legged','jumping'],ja:'あぐらとジャンプが矛盾',      en:'sitting cross-legged + jumping' },
  { tags:['sitting cross-legged','running'],ja:'あぐらと走りが矛盾',          en:'sitting cross-legged + running' },
  { tags:['sitting cross-legged','walking'],ja:'あぐらと歩きが矛盾',          en:'sitting cross-legged + walking' },
  { tags:['split','standing'],           ja:'開脚と立ちが矛盾',               en:'split + standing' },
  { tags:['split','running'],            ja:'開脚と走りが矛盾',               en:'split + running' },
  { tags:['split','kneeling'],           ja:'開脚と膝立ちが矛盾',             en:'split + kneeling' },
  { tags:['sleeping','standing'],        ja:'眠りと立ちが矛盾',               en:'sleeping + standing' },
  { tags:['sleeping','jumping'],         ja:'眠りとジャンプが矛盾',           en:'sleeping + jumping' },
  { tags:['sleeping','running'],         ja:'眠りと走りが矛盾',               en:'sleeping + running' },
  { tags:['sleeping','dancing'],         ja:'眠りとダンスが矛盾',             en:'sleeping + dancing' },
  { tags:['sleeping','fighting stance'], ja:'眠りと戦闘ポーズが矛盾',         en:'sleeping + fighting stance' },
  { tags:['sleeping','arms up'],         ja:'眠りと両腕上げが矛盾',           en:'sleeping + arms up' },
  { tags:['sleeping','skirt lift'],      ja:'眠りとスカートめくりが矛盾',     en:'sleeping + skirt lift' },
  { tags:['sleeping','adjusting clothes'],ja:'眠りと服を直す動作が矛盾',     en:'sleeping + adjusting clothes' },
  { tags:['sleeping','jacket on shoulders'],ja:'眠りと肩掛けジャケットが矛盾',en:'sleeping + jacket on shoulders' },
  { tags:['contrapposto','sitting'],     ja:'S字立ちと座りが矛盾',            en:'contrapposto + sitting' },
  { tags:['contrapposto','lying on back'],ja:'S字立ちと仰向けが矛盾',         en:'contrapposto + lying on back' },
  { tags:['contrapposto','lying on stomach'],ja:'S字立ちとうつ伏せが矛盾',   en:'contrapposto + lying on stomach' },
  { tags:['contrapposto','seiza'],       ja:'S字立ちと正座が矛盾',            en:'contrapposto + seiza' },
  { tags:['contrapposto','all fours'],   ja:'S字立ちと四つん這いが矛盾',      en:'contrapposto + all fours' },
  { tags:['contrapposto','sleeping'],    ja:'S字立ちと眠りが矛盾',            en:'contrapposto + sleeping' },
  ...mk('w sitting',    ['standing','jumping','running','walking'], 'W座りと立ち系ポーズが矛盾'),
  ...mk('crossed legs', ['standing','jumping','running','walking'], '脚組みと立ち系ポーズが矛盾'),
  ...mk('legs up',      ['standing','running','walking'],           '足上げと立ち系ポーズが矛盾'),

  // ── 人数 ─────────────────────────────────────────────────────
  { tags:['solo','2girls'],              ja:'ひとりと女の子2人が矛盾',         en:'solo + 2girls' },
  { tags:['solo','2boys'],               ja:'ひとりと男の子2人が矛盾',         en:'solo + 2boys' },
  { tags:['solo','multiple girls'],      ja:'ひとりと複数人が矛盾',            en:'solo + multiple girls' },
  { tags:['solo','multiple boys'],       ja:'ひとりと複数人が矛盾',            en:'solo + multiple boys' },
  { tags:['1girl','2girls'],             ja:'女の子の人数が矛盾',              en:'1girl + 2girls' },
  { tags:['1girl','multiple girls'],     ja:'女の子の人数が矛盾',              en:'1girl + multiple girls' },
  { tags:['1boy','2boys'],               ja:'男の子の人数が矛盾',              en:'1boy + 2boys' },
  { tags:['1boy','multiple boys'],       ja:'男の子の人数が矛盾',              en:'1boy + multiple boys' },

  // ── 種族×性別（~girl 系種族は 1boy と矛盾。cat ears 等パーツは 1boy でも可） ────────
  { tags:['catgirl',      '1boy'], ja:'catgirl種族と1boyが矛盾（ケモ耳系は cat ears+1boy で）', en:'catgirl + 1boy' },
  { tags:['fox girl',     '1boy'], ja:'fox girl種族と1boyが矛盾（ケモ耳系は fox ears+1boy で）', en:'fox girl + 1boy' },
  { tags:['dragon girl',  '1boy'], level:'warn', ja:'竜人タグは人型女性寄りの表現になりやすい',  en:'dragon girl + 1boy (may render feminine)' },
  { tags:['slime girl',   '1boy'], level:'warn', ja:'スライム系タグは人型女性寄りの表現になりやすい', en:'slime girl + 1boy (may render feminine)' },
  { tags:['goblin girl',  '1boy'], level:'warn', ja:'ゴブリン系タグは人型女性寄りの表現になりやすい', en:'goblin girl + 1boy (may render feminine)' },

  // ── 翼の種類（同時指定）───────────────────────────────────────────
  { tags:['fairy wings',    'demon wings'],      ja:'妖精翼と悪魔翼が同時指定で矛盾',          en:'fairy wings + demon wings' },
  { tags:['fairy wings',    'angel wings'],      ja:'妖精翼と天使翼が同時指定で矛盾',          en:'fairy wings + angel wings' },
  { tags:['fairy wings',    'feathered wings'],  ja:'妖精翼と鳥翼が同時指定で矛盾',            en:'fairy wings + feathered wings' },
  { tags:['fairy wings',    'mechanical wings'], ja:'妖精翼と機械翼が同時指定で矛盾',          en:'fairy wings + mechanical wings' },
  { tags:['fairy wings',    'dragon tail'],      level:'warn', ja:'妖精翼とドラゴン翼が混在（ハイブリッド）', en:'fairy wings + dragon tail (hybrid)' },
  { tags:['angel wings',    'demon wings'],      ja:'天使翼と悪魔翼が同時指定で矛盾',          en:'angel wings + demon wings' },
  { tags:['angel wings',    'mechanical wings'], ja:'天使翼と機械翼が同時指定で矛盾',          en:'angel wings + mechanical wings' },
  { tags:['feathered wings','demon wings'],      level:'warn', ja:'鳥翼と悪魔翼が同時指定（混在）',           en:'feathered wings + demon wings (mixed)' },
  { tags:['feathered wings','mechanical wings'], ja:'鳥翼と機械翼が同時指定で矛盾',            en:'feathered wings + mechanical wings' },
  { tags:['demon wings',    'mechanical wings'], ja:'悪魔翼と機械翼が同時指定で矛盾',          en:'demon wings + mechanical wings' },

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

  // ── 超クローズアップ × 広い構図 ───────────────────────────────────
  { tags:['extreme close-up on eyes','full body'],  ja:'目の超クローズアップと全身が矛盾',    en:'extreme close-up on eyes + full body' },
  { tags:['extreme close-up on eyes','upper body'], ja:'目の超クローズアップと上半身が矛盾',  en:'extreme close-up on eyes + upper body' },
  { tags:['extreme close-up on eyes','wide shot'],  ja:'目の超クローズアップとワイドが矛盾',  en:'extreme close-up on eyes + wide shot' },
  { tags:['macro shot','full body'],           ja:'マクロショットと全身が矛盾',              en:'macro shot + full body' },
  { tags:['macro shot','wide shot'],           ja:'マクロショットとワイドが矛盾',            en:'macro shot + wide shot' },
  { tags:['lower half of face','full body'],   ja:'顔の下半分と全身が矛盾',                 en:'lower half of face + full body' },
  { tags:['lower half of face','upper body'],  ja:'顔の下半分と上半身が矛盾',               en:'lower half of face + upper body' },
  { tags:['lower half of face','wide shot'],   ja:'顔の下半分とワイドが矛盾',               en:'lower half of face + wide shot' },
  { tags:['eye focus','full body'],            ja:'目フォーカスと全身が矛盾',               en:'eye focus + full body' },
  { tags:['eye focus','upper body'],           ja:'目フォーカスと上半身が矛盾',             en:'eye focus + upper body' },

  // ── 魚眼・広角 × シンプル背景（効果が減弱するが物理的に不可能ではない → warn）────
  { tags:['fisheye lens','simple background'], level:'warn', ja:'魚眼レンズとシンプル背景（歪み効果が薄れる）', en:'fisheye lens + simple background (distortion reduced)' },
  { tags:['fisheye lens','white background'],  level:'warn', ja:'魚眼レンズと白背景（歪み効果が薄れる）',      en:'fisheye lens + white background (distortion reduced)' },
  { tags:['extreme perspective','simple background'], level:'warn', ja:'極端なパースとシンプル背景（パース効果が薄れる）', en:'extreme perspective + simple background (perspective reduced)' },

  // ── カメラ角度 ─────────────────────────────────────────────────
  { tags:['front view','looking over shoulder'], level:'warn', ja:'正面向きと肩越しの振り返りが不自然', en:'front view + looking over shoulder (anatomically awkward)' },
  { tags:['from above','from below'],          ja:'見上げと見下ろしが矛盾',          en:'from above + from below' },
  { tags:['front view','back view'],           ja:'正面と後ろ向きが矛盾',            en:'front view + back view' },
  // 横向き構図 × 視聴者への直接アクション（横顔でカメラ目線・手差しは不自然 → warn）
  ...mk('side view',
    ['looking at viewer','eye contact','reaching toward viewer','pointing at viewer'],
    '横向き構図と視聴者への直接アクションが不自然', 'warn'),
  { tags:["bird's-eye view","worm's-eye view"],ja:'俯瞰とあおりが矛盾',             en:"bird's-eye view + worm's-eye view" },
  { tags:['from below',"bird's-eye view"],     ja:'見上げと俯瞰が矛盾',             en:"from below + bird's-eye view" },
  { tags:['from above',"worm's-eye view"],     ja:'見下ろしとあおりが矛盾',         en:"from above + worm's-eye view" },

  // ── 時間・照明 ─────────────────────────────────────────────────
  { tags:['day','night'],                ja:'昼と夜が矛盾',                    en:'day + night' },
  { tags:['sunlight','night'],           ja:'陽光と夜が矛盾',                  en:'sunlight + night' },
  { tags:['moonlight','day'],            ja:'月光と昼が矛盾',                  en:'moonlight + day' },
  { tags:['starry sky','day'],           ja:'星空と昼が矛盾',                  en:'starry sky + day' },
  { tags:['morning','night'],            ja:'朝と夜が矛盾',                    en:'morning + night' },
  { tags:['morning','sunset'],           ja:'朝と夕焼けが矛盾',                en:'morning + sunset' },
  { tags:['morning','dusk'],             ja:'朝と薄暮が矛盾',                  en:'morning + dusk' },
  { tags:['morning','moonlight'],        ja:'朝と月光が矛盾',                  en:'morning + moonlight' },
  { tags:['morning','starry sky'],       ja:'朝と星空が矛盾',                  en:'morning + starry sky' },
  { tags:['warm lighting','cold lighting'],ja:'暖色照明と寒色照明が矛盾',      en:'warm lighting + cold lighting' },
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
  { tags:['white background','cave'],        ja:'白背景と洞窟が矛盾',          en:'white background + cave' },
  { tags:['white background','desert'],      ja:'白背景と砂漠が矛盾',          en:'white background + desert' },
  { tags:['white background','river'],       ja:'白背景と川が矛盾',            en:'white background + river' },
  { tags:['white background','waterfall'],   ja:'白背景と滝が矛盾',            en:'white background + waterfall' },
  { tags:['white background','onsen'],       ja:'白背景と温泉が矛盾',          en:'white background + onsen' },
  { tags:['simple background','cityscape'],  ja:'シンプル背景と都市景観が矛盾', en:'simple background + cityscape' },
  { tags:['simple background','forest'],     ja:'シンプル背景と森が矛盾',      en:'simple background + forest' },
  { tags:['simple background','beach'],      ja:'シンプル背景とビーチが矛盾',  en:'simple background + beach' },
  { tags:['simple background','bedroom'],    ja:'シンプル背景と寝室が矛盾',    en:'simple background + bedroom' },
  { tags:['simple background','classroom'],  ja:'シンプル背景と教室が矛盾',    en:'simple background + classroom' },
  { tags:['simple background','cave'],       ja:'シンプル背景と洞窟が矛盾',    en:'simple background + cave' },
  { tags:['simple background','desert'],     ja:'シンプル背景と砂漠が矛盾',    en:'simple background + desert' },
  { tags:['simple background','river'],      ja:'シンプル背景と川が矛盾',      en:'simple background + river' },
  { tags:['simple background','waterfall'],  ja:'シンプル背景と滝が矛盾',      en:'simple background + waterfall' },
  { tags:['simple background','onsen'],      ja:'シンプル背景と温泉が矛盾',    en:'simple background + onsen' },

  // ── アートスタイル ─────────────────────────────────────────────
  { tags:['monochrome','vibrant colors'], ja:'モノクロと鮮やかな色が矛盾',    en:'monochrome + vibrant colors' },
  { tags:['monochrome','colorful'],       ja:'モノクロとカラフルが矛盾',      en:'monochrome + colorful' },
  { tags:['monochrome','neon colors'],    ja:'モノクロとネオンカラーが矛盾',  en:'monochrome + neon colors' },
  { tags:['monochrome','warm colors'],    ja:'モノクロと暖色が矛盾',          en:'monochrome + warm colors' },
  { tags:['monochrome','cool colors'],    ja:'モノクロと寒色が矛盾',          en:'monochrome + cool colors' },
  { tags:['monochrome','pastel colors'],  ja:'モノクロとパステルが矛盾',      en:'monochrome + pastel colors' },
  { tags:['realistic','anime'],           ja:'リアルとアニメスタイルが矛盾',  en:'realistic + anime' },
  { tags:['realistic','cel shading'],     ja:'リアルとセルシェードが矛盾',    en:'realistic + cel shading' },
  { tags:['realistic','manga style'],     ja:'リアルとマンガスタイルが矛盾',  en:'realistic + manga style' },
  { tags:['realistic','pixel art'],       ja:'リアルとピクセルアートが矛盾',  en:'realistic + pixel art' },
  { tags:['sketch','realistic'],          ja:'スケッチとリアルが矛盾',        en:'sketch + realistic' },
  { tags:['cel shading','watercolor'],    ja:'セルシェードと水彩が矛盾',      en:'cel shading + watercolor' },
  { tags:['pixel art','3D rendering'],    ja:'ピクセルアートと3Dレンダリングが矛盾', en:'pixel art + 3D rendering' },
  { tags:['manga style','3D rendering'],  ja:'マンガと3Dレンダリングが矛盾',  en:'manga style + 3D rendering' },
  { tags:['photorealistic','anime'],      ja:'フォトリアルとアニメが矛盾',    en:'photorealistic + anime' },
  { tags:['photorealistic','manga style'],ja:'フォトリアルとマンガが矛盾',    en:'photorealistic + manga style' },
  { tags:['photorealistic','cel shading'],ja:'フォトリアルとセルシェードが矛盾',en:'photorealistic + cel shading' },
  { tags:['photorealistic','pixel art'],  ja:'フォトリアルとピクセルアートが矛盾',en:'photorealistic + pixel art' },
  { tags:['photorealistic','chibi'],      ja:'フォトリアルとSDキャラが矛盾',  en:'photorealistic + chibi' },
  { tags:['ukiyo-e','realistic'],         ja:'浮世絵とリアルが矛盾',          en:'ukiyo-e + realistic' },
  { tags:['ukiyo-e','photorealistic'],    ja:'浮世絵とフォトリアルが矛盾',    en:'ukiyo-e + photorealistic' },
  { tags:['ukiyo-e','3D rendering'],      ja:'浮世絵と3Dレンダリングが矛盾',  en:'ukiyo-e + 3D rendering' },
  { tags:['light novel illustration','realistic'],       ja:'ライトノベル絵とリアルが矛盾',      en:'light novel illustration + realistic' },
  { tags:['light novel illustration','photorealistic'],  ja:'ライトノベル絵とフォトリアルが矛盾', en:'light novel illustration + photorealistic' },
  { tags:['light novel illustration','3D rendering'],    ja:'ライトノベル絵と3Dレンダリングが矛盾',en:'light novel illustration + 3D rendering' },

  // ── 種族×衣装（ハーピー：鳥足のため靴・ニーハイが不自然 → warn）────────
  ...mk('harpy', [
    'sneakers','loafers','oxford shoes','ballet flats','mary janes','sandals','geta','slippers',
    'heels','pumps','mules','high heels','platform shoes',
    'ankle boots','boots','knee-high boots','thigh-high boots','platform boots',
    'thighhighs','tights','pantyhose','knee-high socks','frilled socks','single thighhigh',
  ], 'ハーピーの鳥足と靴/ニーハイ類が不自然（アニメ設定では多様なため警告のみ）', 'warn'),

  // ── 種族×衣装（人魚） ─────────────────────────────────────────
  { tags:['mermaid','thighhighs'],        ja:'人魚とニーハイが矛盾（脚がない）',            en:'mermaid + thighhighs' },
  { tags:['mermaid','shorts'],            ja:'人魚とショーツが矛盾（脚がない）',            en:'mermaid + shorts' },
  { tags:['mermaid','skirt'],             ja:'人魚とスカートが矛盾（脚がない）',            en:'mermaid + skirt' },
  { tags:['mermaid','pants'],             ja:'人魚とパンツが矛盾（脚がない）',              en:'mermaid + pants' },
  { tags:['mermaid','barefoot'],          ja:'人魚と裸足が矛盾（脚がない）',               en:'mermaid + barefoot' },
  { tags:['mermaid','leggings'],          ja:'人魚とレギンスが矛盾（脚がない）',            en:'mermaid + leggings' },
  { tags:['mermaid','high heels'],        ja:'人魚とハイヒールが矛盾（脚がない）',          en:'mermaid + high heels' },
  { tags:['mermaid','pumps'],             ja:'人魚とパンプスが矛盾（脚がない）',            en:'mermaid + pumps' },
  { tags:['mermaid','platform shoes'],    ja:'人魚と厚底が矛盾（脚がない）',               en:'mermaid + platform shoes' },
  { tags:['mermaid','boots'],             ja:'人魚とブーツが矛盾（脚がない）',              en:'mermaid + boots' },
  { tags:['mermaid','knee-high boots'],   ja:'人魚とニーハイブーツが矛盾（脚がない）',      en:'mermaid + knee-high boots' },
  { tags:['mermaid','thigh-high boots'],  ja:'人魚とサイハイブーツが矛盾（脚がない）',      en:'mermaid + thigh-high boots' },
  { tags:['mermaid','ankle boots'],       ja:'人魚とアンクルブーツが矛盾（脚がない）',      en:'mermaid + ankle boots' },
  { tags:['mermaid','sneakers'],          ja:'人魚とスニーカーが矛盾（脚がない）',          en:'mermaid + sneakers' },
  { tags:['mermaid','loafers'],           ja:'人魚とローファーが矛盾（脚がない）',          en:'mermaid + loafers' },
  { tags:['mermaid','mary janes'],        ja:'人魚とメアリージェーンが矛盾（脚がない）',    en:'mermaid + mary janes' },
  { tags:['mermaid','sandals'],           ja:'人魚とサンダルが矛盾（脚がない）',            en:'mermaid + sandals' },
  { tags:['mermaid','slippers'],          ja:'人魚とスリッパが矛盾（脚がない）',            en:'mermaid + slippers' },
  { tags:['mermaid','socks'],             ja:'人魚と靴下が矛盾（脚がない）',               en:'mermaid + socks' },
  { tags:['mermaid','ankle socks'],       ja:'人魚とアンクルソックスが矛盾（脚がない）',    en:'mermaid + ankle socks' },
  { tags:['mermaid','knee-high socks'],   ja:'人魚とニーハイソックスが矛盾（脚がない）',    en:'mermaid + knee-high socks' },
  { tags:['mermaid','platform boots'],    ja:'人魚と厚底ブーツが矛盾（脚がない）',           en:'mermaid + platform boots' },
  { tags:['mermaid','leg warmers'],       ja:'人魚とレッグウォーマーが矛盾（脚がない）',      en:'mermaid + leg warmers' },
  { tags:['mermaid','frilled socks'],    ja:'人魚とフリルソックスが矛盾（脚がない）',        en:'mermaid + frilled socks' },
  { tags:['mermaid','single thighhigh'],ja:'人魚と片方ニーハイが矛盾（脚がない）',          en:'mermaid + single thighhigh' },
  { tags:['mermaid','mismatched legwear'],ja:'人魚と左右違い靴下が矛盾（脚がない）',        en:'mermaid + mismatched legwear' },
  { tags:['mermaid','fishnet legwear'],  ja:'人魚と網レッグウェアが矛盾（脚がない）',      en:'mermaid + fishnet legwear' },
  // 追加: geta・zettai ryouiki・スカート系・ボディフォーカス脚系
  { tags:['mermaid','geta'],            ja:'人魚と下駄が矛盾（脚がない）',                en:'mermaid + geta' },
  { tags:['mermaid','zettai ryouiki'],  ja:'人魚と絶対領域が矛盾（脚がない）',             en:'mermaid + zettai ryouiki' },
  { tags:['mermaid','tights'],          ja:'人魚とタイツが矛盾（脚がない）',               en:'mermaid + tights' },
  { tags:['mermaid','fishnet tights'],  ja:'人魚とフィッシュネットタイツが矛盾（脚がない）', en:'mermaid + fishnet tights' },
  ...mk('mermaid', ['flared skirt','mini skirt','micro skirt','slit skirt','pencil skirt'], '人魚とスカート類が矛盾（脚がない）'),
  ...mk('mermaid', ['bare thighs','thighs','thigh gap','thick thighs','long legs'], '人魚と脚部ボディフォーカスが矛盾（脚がない）'),

  // ── 種族×衣装（ラミア）─────────────────────────────────────────
  { tags:['lamia','thighhighs'],          ja:'ラミアとニーハイが矛盾（蛇の下半身）',        en:'lamia + thighhighs' },
  { tags:['lamia','shorts'],              ja:'ラミアとショーツが矛盾（蛇の下半身）',        en:'lamia + shorts' },
  { tags:['lamia','skirt'],               ja:'ラミアとスカートが矛盾（蛇の下半身）',        en:'lamia + skirt' },
  { tags:['lamia','pants'],               ja:'ラミアとパンツが矛盾（蛇の下半身）',          en:'lamia + pants' },
  { tags:['lamia','leggings'],            ja:'ラミアとレギンスが矛盾（蛇の下半身）',        en:'lamia + leggings' },
  { tags:['lamia','barefoot'],            ja:'ラミアと裸足が矛盾（蛇の下半身）',            en:'lamia + barefoot' },
  { tags:['lamia','high heels'],          ja:'ラミアとハイヒールが矛盾（蛇の下半身）',      en:'lamia + high heels' },
  { tags:['lamia','pumps'],               ja:'ラミアとパンプスが矛盾（蛇の下半身）',        en:'lamia + pumps' },
  { tags:['lamia','platform shoes'],      ja:'ラミアと厚底が矛盾（蛇の下半身）',            en:'lamia + platform shoes' },
  { tags:['lamia','boots'],               ja:'ラミアとブーツが矛盾（蛇の下半身）',          en:'lamia + boots' },
  { tags:['lamia','knee-high boots'],     ja:'ラミアとニーハイブーツが矛盾（蛇の下半身）',  en:'lamia + knee-high boots' },
  { tags:['lamia','thigh-high boots'],    ja:'ラミアとサイハイブーツが矛盾（蛇の下半身）',  en:'lamia + thigh-high boots' },
  { tags:['lamia','ankle boots'],         ja:'ラミアとアンクルブーツが矛盾（蛇の下半身）',  en:'lamia + ankle boots' },
  { tags:['lamia','sneakers'],            ja:'ラミアとスニーカーが矛盾（蛇の下半身）',      en:'lamia + sneakers' },
  { tags:['lamia','loafers'],             ja:'ラミアとローファーが矛盾（蛇の下半身）',      en:'lamia + loafers' },
  { tags:['lamia','mary janes'],          ja:'ラミアとメアリージェーンが矛盾（蛇の下半身）',en:'lamia + mary janes' },
  { tags:['lamia','sandals'],             ja:'ラミアとサンダルが矛盾（蛇の下半身）',        en:'lamia + sandals' },
  { tags:['lamia','socks'],               ja:'ラミアと靴下が矛盾（蛇の下半身）',            en:'lamia + socks' },
  { tags:['lamia','knee-high socks'],     ja:'ラミアとニーハイソックスが矛盾（蛇の下半身）',en:'lamia + knee-high socks' },
  { tags:['lamia','ankle socks'],         ja:'ラミアとアンクルソックスが矛盾（蛇の下半身）',en:'lamia + ankle socks' },
  { tags:['lamia','platform boots'],      ja:'ラミアと厚底ブーツが矛盾（蛇の下半身）',       en:'lamia + platform boots' },
  { tags:['lamia','leg warmers'],         ja:'ラミアとレッグウォーマーが矛盾（蛇の下半身）',  en:'lamia + leg warmers' },
  { tags:['lamia','frilled socks'],      ja:'ラミアとフリルソックスが矛盾（蛇の下半身）',    en:'lamia + frilled socks' },
  { tags:['lamia','single thighhigh'],  ja:'ラミアと片方ニーハイが矛盾（蛇の下半身）',      en:'lamia + single thighhigh' },
  { tags:['lamia','mismatched legwear'],ja:'ラミアと左右違い靴下が矛盾（蛇の下半身）',      en:'lamia + mismatched legwear' },
  { tags:['lamia','fishnet legwear'],  ja:'ラミアと網レッグウェアが矛盾（蛇の下半身）',    en:'lamia + fishnet legwear' },
  // 追加
  { tags:['lamia','geta'],            ja:'ラミアと下駄が矛盾（蛇の下半身）',              en:'lamia + geta' },
  { tags:['lamia','slippers'],        ja:'ラミアとスリッパが矛盾（蛇の下半身）',           en:'lamia + slippers' },
  { tags:['lamia','zettai ryouiki'],  ja:'ラミアと絶対領域が矛盾（蛇の下半身）',           en:'lamia + zettai ryouiki' },
  { tags:['lamia','tights'],          ja:'ラミアとタイツが矛盾（蛇の下半身）',             en:'lamia + tights' },
  { tags:['lamia','fishnet tights'],  ja:'ラミアとフィッシュネットタイツが矛盾（蛇の下半身）', en:'lamia + fishnet tights' },
  ...mk('lamia', ['flared skirt','mini skirt','micro skirt','slit skirt','pencil skirt'], 'ラミアとスカート類が矛盾（蛇の下半身）'),
  ...mk('lamia', ['bare thighs','thighs','thigh gap','thick thighs','long legs'], 'ラミアと脚部ボディフォーカスが矛盾（蛇の下半身）'),

  // ── 男性 × 胸サイズ ──────────────────────────────────────────
  { tags:['1boy','large breasts'],   ja:'男性と大きめ胸サイズが矛盾',  en:'1boy + large breasts' },
  { tags:['1boy','huge breasts'],    ja:'男性と大きめ胸サイズが矛盾',  en:'1boy + huge breasts' },
  { tags:['1boy','medium breasts'],  ja:'男性と中程度胸サイズが矛盾',  en:'1boy + medium breasts', level:'warn' },

  // ── 髪型 × 髪の長さ ───────────────────────────────────────────
  { tags:['drill hair','short hair'],     ja:'ドリルヘアとショートが矛盾（長さが必要）',    en:'drill hair + short hair' },
  { tags:['drill hair','very short hair'],ja:'ドリルヘアと超ショートが矛盾',               en:'drill hair + very short hair' },
  { tags:['hime cut','very short hair'],  ja:'姫カットと超ショートが矛盾（長さが必要）',    en:'hime cut + very short hair' },
  { tags:['wolf cut','very short hair'],  ja:'ウルフカットと超ショートが矛盾',              en:'wolf cut + very short hair' },
  { tags:['layered hair','very short hair'],ja:'レイヤードと超ショートが矛盾（長さが必要）', en:'layered hair + very short hair' },
  { tags:['layered hair','pixie cut'],    ja:'レイヤードとピクシーカットが矛盾',            en:'layered hair + pixie cut' },

  // ── アートスタイル（新追加）────────────────────────────────────
  { tags:['chibi','realistic'],           ja:'SD（ちび）とリアルが矛盾',                   en:'chibi + realistic' },
  { tags:['chibi','3D rendering'],        ja:'SDと3Dレンダリングが矛盾',                   en:'chibi + 3D rendering' },
  { tags:['flat design','realistic'],     ja:'フラットデザインとリアルが矛盾',              en:'flat design + realistic' },
  { tags:['flat design','3D rendering'],  ja:'フラットデザインと3Dが矛盾',                 en:'flat design + 3D rendering' },
  { tags:['flat design','painterly'],     ja:'フラットデザインとペインタリーが矛盾',        en:'flat design + painterly' },
  { tags:['flat design','watercolor'],    ja:'フラットデザインと水彩が矛盾',               en:'flat design + watercolor' },
  { tags:['soft shading','cel shading'],  ja:'ソフトシェーディングとセルシェードが矛盾',    en:'soft shading + cel shading' },
  { tags:['retro artstyle','realistic'],      ja:'レトロアニメとリアルが矛盾',          en:'retro artstyle + realistic' },
  { tags:['retro artstyle','photorealistic'], ja:'レトロアニメとフォトリアルが矛盾',    en:'retro artstyle + photorealistic' },
  { tags:['retro artstyle','3D rendering'],   ja:'レトロアニメと3Dレンダリングが矛盾',  en:'retro artstyle + 3D rendering' },
  { tags:['tarot card','realistic'],          ja:'タロットカードとリアルが矛盾',        en:'tarot card + realistic' },
  { tags:['tarot card','photorealistic'],     ja:'タロットカードとフォトリアルが矛盾',  en:'tarot card + photorealistic' },
  { tags:['tarot card','3D rendering'],       ja:'タロットカードと3Dレンダリングが矛盾',en:'tarot card + 3D rendering' },

  // ── 天候 ──────────────────────────────────────────────────────
  { tags:['lightning','clear sky'],       ja:'雷と晴れが矛盾',                             en:'lightning + clear sky' },

  // ── 宇宙 × 屋内 ────────────────────────────────────────────────
  { tags:['outer space','indoors'],       ja:'宇宙空間と屋内が矛盾',                       en:'outer space + indoors' },
  { tags:['outer space','bedroom'],       ja:'宇宙空間と寝室背景が矛盾',                   en:'outer space + bedroom' },
  { tags:['outer space','classroom'],     ja:'宇宙空間と教室背景が矛盾',                   en:'outer space + classroom' },
  { tags:['outer space','cafe'],          ja:'宇宙空間とカフェ背景が矛盾',                 en:'outer space + cafe' },

  // ══════════════════════════════════════════════════════════════════
  // ① 性別×胸・ボディフォーカス
  // ══════════════════════════════════════════════════════════════════
  ...mk('1boy', ['small breasts','medium breasts','large breasts','huge breasts'],
    '男性キャラと胸サイズが矛盾'),
  ...mk('1boy', ['cleavage','sideboob','underboob'],
    '男性キャラと胸フォーカスが矛盾'),

  // ── 男性キャラ×女性向け衣装・アイテム ─────────────────────────────
  ...mk('1boy', [
    'dress','sundress','sweater dress','wedding dress','evening gown',
    'sailor uniform','maid outfit','furisode','cheongsam','shrine maiden',
    'nurse','magical girl','gothic lolita','idol costume','cheerleader',
    'race queen','bikini armor','bunny suit','leotard',
    'school swimsuit','bikini','micro bikini','frilled bikini','string bikini','monokini','lingerie',
    'blouse','off shoulder','crop top','halter top','tube top','sports bra',
    'skirt','pleated skirt','mini skirt','micro skirt','pencil skirt','flared skirt','hot pants',
    'thighhighs','pantyhose','frilled socks',
  ], '男性キャラと女性向け衣装・アイテムが矛盾'),

  // ── 幼い体型×極端な描写 ─────────────────────────────────────────
  ...mk('loli',  ['huge breasts','large breasts'],                '幼い体型と大きな胸が矛盾'),
  ...mk('loli',  ['cleavage','sideboob','underboob',
                  'lingerie','micro bikini','string bikini','monokini'], '幼い体型と過激な描写が矛盾'),
  ...mk('child', ['huge breasts','large breasts'],               '子どもと大きな胸サイズが矛盾'),

  // ══════════════════════════════════════════════════════════════════
  // ② 衣装の重ね着パニック（全身服×ボトムス）
  // ══════════════════════════════════════════════════════════════════
  // ドレス類（スカート一体型）→ パンツ・レギンス追加は矛盾
  ...['dress','sundress','sweater dress','wedding dress','evening gown'].flatMap(o =>
    mk(o, ['pants','jeans','leggings','cargo pants'], `${o}とボトムスが重ね着で矛盾`)),
  // ワンピース型（全身カバー）→ ボトムス全般と矛盾
  ...['swimsuit','one-piece swimsuit','school swimsuit',
      'bunny suit','leotard','bodysuit'].flatMap(o =>
    mk(o, ['skirt','pleated skirt','mini skirt','micro skirt','pencil skirt','flared skirt',
           'pants','jeans','leggings','shorts','hot pants','cargo pants'], `${o}とボトムスが重ね着で矛盾`)),
  ...mk('maid outfit', ['pants','jeans','leggings','cargo pants'], 'メイド服とパンツ類が重ね着で矛盾'),
  ...mk('cheongsam',   ['pants','jeans','leggings','cargo pants'], 'チャイナドレスとパンツ類が重ね着で矛盾'),

  // ══════════════════════════════════════════════════════════════════
  // ③ 視点×ボディフォーカス（前後の同時指定）
  // ══════════════════════════════════════════════════════════════════
  ...mk('back view',
    ['cleavage','sideboob','underboob','midriff','navel','collarbone','navel cutout','cleavage cutout'],
    '後ろ姿と前面ボディフォーカスの同時指定が矛盾'),

  // ══════════════════════════════════════════════════════════════════
  // ④ 睡眠×視線・インタラクション
  // ══════════════════════════════════════════════════════════════════
  ...mk('sleeping', [
    'looking at viewer','looking away','looking down','looking up','eye contact',
    'wink','head tilt','waving','pointing','peace sign','v-sign','reaching toward viewer',
  ], '睡眠状態と視線・インタラクションが矛盾'),

  // ══════════════════════════════════════════════════════════════════
  // ⑤ 環境×衣装・エフェクト
  // ══════════════════════════════════════════════════════════════════
  // 冬・雪 × 水着・裸足（ファンサービスなど意図的な組み合わせもあるため warn）
  ...mk('snowy',
    ['bikini','micro bikini','frilled bikini','string bikini','monokini','swimsuit','one-piece swimsuit','school swimsuit','barefoot'],
    '雪の環境と夏向け衣装・裸足（ファンサービス系では意図的なこともある）', 'warn'),
  ...mk('snow',
    ['bikini','micro bikini','frilled bikini','string bikini','monokini','swimsuit','one-piece swimsuit','school swimsuit','barefoot'],
    '雪の環境と夏向け衣装・裸足（ファンサービス系では意図的なこともある）', 'warn'),
  // 水中 × 使用不可アイテム・エフェクト
  ...mk('underwater',
    ['holding umbrella','fire','explosion','embers','electricity'],
    '水中環境と相容れないアイテム・エフェクトが矛盾'),
  // 首元カバー衣装 × 鎖骨フォーカス
  ...mk('collarbone', ['turtleneck','high neck'], '首元が隠れる衣装と鎖骨フォーカスが矛盾'),

  // ══════════════════════════════════════════════════════════════════
  // ⑥ 髪型の物理法則（短い髪×結ぶ・編む系スタイル）
  //    ※same-cat なのでランダム生成には影響しないが手動選択時の UI 警告として機能
  // ══════════════════════════════════════════════════════════════════
  ...mk('very short hair', [
    'twin tails','two side up','ponytail','high ponytail','low ponytail','side ponytail',
    'hair updo','half updo','hair bun','double bun','braid','side braid',
  ], '超ショートヘアと長さが必要な髪型が矛盾'),
  ...mk('pixie cut', [
    'twin tails','two side up','ponytail','high ponytail','low ponytail','side ponytail',
    'hair updo','half updo','hair bun','double bun','braid','side braid',
  ], 'ピクシーカットと長さが必要な髪型が矛盾'),
  ...mk('short hair',
    ['twin tails','two side up','braid','side braid','hair updo','hair bun'],
    'ショートヘアと長さが必要な髪型が矛盾'),
  ...mk('bob cut',
    ['twin tails','braid','hair updo','hair bun','double bun'],
    'ボブカットと長さが必要な髪型が矛盾'),

  // ── 短い髪 × hair spread out ────────────────────────────────────
  ...mk('very short hair', ['hair spread out'], '超ショートヘアでは広がる髪が矛盾'),
  ...mk('short hair',      ['hair spread out'], 'ショートヘアでは広がる髪が矛盾'),
  ...mk('pixie cut',       ['hair spread out'], 'ピクシーカットでは広がる髪が矛盾'),
];

export const detectConflicts = text => {
  const bares = splitTags(text).map(s => bareTag(s).toLowerCase());
  return CONFLICT_RULES.filter(r => r.tags.every(t => bares.includes(t.toLowerCase())));
};

// Pre-built reverse lookup: tag → Set of conflicting tags (lowercase)
// Skips: level:'warn' rules (unusual but not impossible — allow in random gen)
//        rules with 3+ tags (complex multi-condition — would over-exclude in random gen)
export const CONFLICT_MAP = new Map();
for (const r of CONFLICT_RULES) {
  if (r.level === 'warn') continue;
  if (r.tags.length > 2) continue;
  for (let i = 0; i < r.tags.length; i++) {
    const key = r.tags[i].toLowerCase();
    if (!CONFLICT_MAP.has(key)) CONFLICT_MAP.set(key, new Set());
    for (let j = 0; j < r.tags.length; j++) {
      if (i !== j) CONFLICT_MAP.get(key).add(r.tags[j].toLowerCase());
    }
  }
}
