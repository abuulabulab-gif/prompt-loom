// Tag descriptions for tags whose meaning isn't obvious from the name alone.
// Shown as a tooltip on hover in BlockCard.
// Only include tags that benefit from explanation — not self-evident ones like "blue hair".

export const TAG_DICT = {

  // ── ベース・品質 ──────────────────────────────────────────────
  'masterpiece':           { ja: 'AI品質向上の定番タグ。「最高傑作」を意味し、全体的なクオリティが上がる', en: 'Core quality keyword — tells the AI to aim for best possible output' },
  'absurdres':             { ja: '8K超の超高解像度フラグ。VRAM消費が大きいため高スペックGPU向け', en: 'Ultra-high resolution flag (beyond 8K); GPU-intensive' },
  'highres':               { ja: '高解像度フラグ。アップスケーラーと組み合わせると効果的', en: 'High-resolution flag; effective combined with upscalers' },
  'trending on pixiv':     { ja: 'pixivの人気イラスト風のスタイルに誘導する。アニメ・イラスト系に強い', en: 'Steers style toward popular pixiv illustration aesthetics' },
  'sharp focus':           { ja: '全体をくっきり鮮明に。ボケや滲みが抑えられる', en: 'Makes the whole image crisp with minimal blur' },
  'intricate details':     { ja: '細部まで複雑・精緻に描写。装飾・模様・テクスチャが増える', en: 'Adds complex fine details — patterns, textures, ornaments' },
  'professional artwork':  { ja: 'プロのアート作品らしい仕上がりに誘導する', en: 'Biases output toward polished, commercial art quality' },

  // ── アートスタイル ─────────────────────────────────────────────
  'cel shading':           { ja: 'アニメ・ゲームの塗りのような輪郭線＋ベタ塗りスタイル。グラデなし', en: 'Flat shading with hard outlines — like classic anime or game art' },
  'impasto':               { ja: '油絵の厚塗り。絵具を盛り上げたような質感・タッチが出る', en: 'Thick, textured paint application like oil painting' },
  'painterly':             { ja: '絵画的なタッチ。手書きのブラシ感・筆致が増す', en: 'Adds a hand-painted, artistic brush-stroke quality' },
  'bokeh':                 { ja: '背景に丸いボケ光源が散らばる写真的な表現。ポートレートに映える', en: 'Circular light blurs in the background — like a portrait camera lens' },
  'depth of field':        { ja: '被写界深度。ピント範囲外の前後をぼかしてカメラっぽくなる', en: 'Blurs near/far from focal point, like a real camera lens' },
  'bloom':                 { ja: '光が滲み出るような柔らかい発光演出。ファンタジー・ドリーミーな雰囲気に', en: 'Soft glow effect where light bleeds at edges — dreamy feel' },
  'flat color':            { ja: 'グラデなし・影なしの均一な色塗り。ポップアート・アイコン風', en: 'Solid colors with no gradients or shading — pop art look' },
  'lineart':               { ja: '線画のみ。色塗りなし・アウトラインだけの状態', en: 'Line drawing with no color fill — sketch outline only' },
  'atmospheric':           { ja: '空気感・雰囲気を重視した霞みのある表現', en: 'Hazy, moody atmosphere with soft gradation' },
  'smooth shading':        { ja: 'なめらかなグラデーションで立体感を表現するシェーディング', en: 'Gradual, smooth transitions between light and shadow' },

  // ── 顔：髪 ───────────────────────────────────────────────────
  'ahoge':                 { ja: '頭頂部から1本だけぴょんと跳ねる"アホ毛"。アニメキャラらしさが出る', en: 'Single strand of hair sticking up from the head — iconic anime trait' },
  'hair intakes':          { ja: '"触角ヘア"。こめかみから2本跳ねるシャープな毛束', en: 'Sharp hair tufts at the temples, like antennae' },
  'sidelocks':             { ja: '顔の横に垂れる長めの髪束。ロング系キャラによく見られる', en: 'Long hair strands hanging along the sides of the face' },
  'inner hair color':      { ja: '内側の髪だけ別の色のインナーカラー染め', en: 'Different color on the inner/underneath layer of hair' },
  'underlights':           { ja: '下から照らしたような内側が光るインナーカラー表現', en: 'Inner hair that appears to glow from underneath' },
  'colored tips':          { ja: '毛先だけ別の色のグラデ染め', en: 'Hair with dyed tips of a contrasting color' },
  'hair between eyes':     { ja: '眉間・目の間を横切る前髪の一筋', en: 'A strand of hair crossing between the eyes' },
  'floating hair':         { ja: '風や魔力でなびく・浮かぶ髪。ダイナミックな演出に', en: 'Hair flowing or floating as if in wind or magical energy' },

  'maromayu':              { ja: '麻呂眉。平安貴族風の丸く太い眉。高い位置に描かれ独特の雰囲気が出る', en: 'Round, thick eyebrows placed high on the forehead — Heian-era aristocrat style' },

  // ── 顔：目・表情 ──────────────────────────────────────────────
  'heterochromia':         { ja: 'オッドアイ。左右の目の色が異なる', en: 'Each eye a different color' },
  'bedroom eyes':          { ja: 'うつろな・妖艶な半眼。色気のある視線', en: 'Heavy-lidded, seductive expression' },
  'fang':                  { ja: '八重歯。キャラの可愛さ・やんちゃさを演出する小さな牙', en: 'Small protruding canine tooth — cute or mischievous character' },
  'star-shaped pupils':    { ja: '星型の瞳孔。ファンタジー・魔法系キャラに', en: 'Star-shaped pupils instead of round — fantasy or magical effect' },
  'sparkling eyes':        { ja: '目の中にキラキラとしたハイライトが入る', en: 'Eyes with shiny, sparkling highlights inside' },
  'sleepy eyes':           { ja: 'たれ目。目尻が下がってやさしい・眠そうな印象', en: 'Drooping outer corners of the eyes — gentle or drowsy look' },
  'upturned eyes':         { ja: 'つり目。目尻が上がって気の強い・凛とした印象', en: 'Eyes with raised outer corners — sharp, strong impression' },

  // ── 顔：口・メイク ────────────────────────────────────────────
  'parted lips':           { ja: 'わずかに開いた唇。自然な色気を出す', en: 'Lips slightly open — natural, subtle allure' },
  'licking lips':          { ja: '唇を舐める仕草。艶やかな印象に', en: 'Tongue touching the lips — sensual or playful gesture' },

  // ── 体型 ──────────────────────────────────────────────────────
  'thigh gap':             { ja: '太ももの隙間を強調した表現。絶対領域とも', en: 'Emphasized gap between the inner thighs' },
  'collarbone':            { ja: '鎖骨を目立たせた描写。色気や華奢さを演出', en: 'Prominent, defined collarbone — adds elegance or appeal' },
  'toned':                 { ja: '引き締まった体。細身だが適度な筋肉感あり', en: 'Lean and defined without being bulky — athletic slim build' },
  'loli':                  { ja: '幼い・小柄な体型の指定。mature/adult/young adultと共存不可', en: 'Small, childlike body proportions. Conflicts with adult/mature tags' },
  'mature female':         { ja: '成熟した大人の女性の体型・雰囲気。loliと共存不可', en: 'Adult, voluptuous female proportions. Conflicts with loli/young' },
  'freckles':              { ja: 'そばかす。健康的・自然体な印象を加える', en: 'Small brown spots scattered across the face — natural, fresh look' },

  // ── ボディフォーカス ──────────────────────────────────────────
  'thighs':                { ja: '太もも全般を強調した描写。ミニスカやニーハイとの組み合わせで映える', en: 'Emphasizes the thighs — pairs well with mini skirt or thighhighs' },
  'bare thighs':           { ja: '素の太もも。スキンシップや肌の露出を強調', en: 'Exposed bare thighs — heightens sense of skin exposure' },
  'armpits':               { ja: '脇の下が見える構図・衣装。ノースリーブや水着との相性が良い', en: 'Visible armpits — suits sleeveless outfits or swimwear' },
  'nape':                  { ja: 'うなじ。首の後ろの肌。髪をアップにしたときや後ろ向き構図で映える', en: 'Nape of the neck — elegant when hair is up or seen from behind' },
  'midriff':               { ja: 'お腹・腹部の露出。クロップトップや水着でよく使われる', en: 'Exposed midriff/abdomen — common with crop tops or swimwear' },
  'bare back':             { ja: '背中の素肌を見せる。後ろ向き構図やバックレスドレスで効果的', en: 'Exposed bare back — effective with back-view compositions or backless dresses' },
  'bare shoulders':        { ja: '肩が出た状態。オフショルダーや水着との組み合わせで自然に出る', en: 'Exposed bare shoulders — natural with off-shoulder tops or swimwear' },
  'cleavage':              { ja: '胸の谷間。ローカットやドレスで生まれる胸元の影', en: 'Visible cleavage between the chest — from low-cut tops or dresses' },
  'wide hips':             { ja: '広めのヒップラインを強調。女性らしいシルエットを際立たせる', en: 'Wide hip silhouette — accentuates a feminine figure' },

  // ── 衣装 ──────────────────────────────────────────────────────
  'off shoulder':          { ja: '肩が出るデザインのトップス。鎖骨・肩ラインを強調', en: 'Top with exposed shoulders and collarbone' },
  'tube top':              { ja: '肩ひもなしの筒状のトップス（ストラップレス）', en: 'Strapless tube-shaped top with no shoulder straps' },
  'fishnet':               { ja: '網目状の透け素材。タイツや下着・衣装に使われる', en: 'Open-mesh fabric showing skin through a grid pattern' },
  'see-through':           { ja: '薄い素材で下が透けて見える表現', en: 'Sheer fabric that reveals what is underneath' },
  'ruffles':               { ja: 'ひらひらとした波型の装飾。フリルより大きめで豪華な印象', en: 'Wavy, gathered fabric trim — larger and more dramatic than frills' },
  'garter belt':           { ja: 'ストッキングを留めるベルト型の下着。太ももに巻く', en: 'Elastic belt worn around the waist/hips to hold up stockings' },
  'pantyhose':             { ja: 'パンスト。脚全体を覆う薄いナイロンタイツ', en: 'Thin nylon tights covering legs and hips' },
  'thighhighs':            { ja: '太ももまでの長いオーバーニーソックス', en: 'Thigh-high socks or stockings' },
  'pleated skirt':         { ja: '細かいヒダ（プリーツ）のスカート。制服によく使われる', en: 'Skirt with knife-pleats, common in school uniforms' },
  'furisode':              { ja: '長い袖が特徴の振り袖。成人式・正装用の着物', en: 'Formal kimono with long flowing sleeves for special occasions' },
  'gothic lolita':         { ja: 'ゴスロリ。黒を基調にしたフリルたっぷりのロリータファッション', en: 'Black-dominant, Victorian-inspired frilly lolita fashion' },
  'fingerless gloves':     { ja: '指先が出るグローブ。クール・アクション系キャラに映える', en: 'Gloves with exposed fingertips — action or edgy style' },

  // ── 特殊パーツ ────────────────────────────────────────────────
  'ball joints':           { ja: '球体関節。人形（ドール）の関節に見られる球形パーツ', en: 'Spherical ball-and-socket joints at limbs — doll aesthetic' },
  'mermaid tail':          { ja: '人魚の下半身の大きな尾ひれ。足の代わりになる', en: 'Large fish tail replacing legs — mermaid lower body' },
  'dragon tail':           { ja: '竜娘の長いトカゲ・ドラゴン型の尻尾', en: 'Long reptilian tail for dragon-girl characters' },
  'demon wings':           { ja: 'コウモリ型の悪魔の翼。翼膜が透けた形が多い', en: 'Bat-like membrane wings for demon characters' },
  'demon tail':            { ja: '先が矢尻（♦）形の悪魔の尻尾', en: 'Arrow-tipped tail characteristic of demon characters' },
  'fairy wings':           { ja: '妖精の薄く透明な羽。トンボや蝶の羽に似た形', en: 'Thin, translucent insect-like wings for fairy characters' },
  'halo':                  { ja: '天使の輪。頭上に浮かぶ金色の光の輪', en: 'Glowing ring floating above the head — angel characteristic' },
  'dragon horns':          { ja: 'ドラゴン系の大きな曲がった角。存在感が強い', en: 'Large curved horns for dragon-type characters' },
  'small horns':           { ja: '小さくて可愛い角。悪魔・サキュバス系に多い', en: 'Small cute horns, common on demon or succubus characters' },
  'deer antlers':          { ja: '枝分かれした鹿のような角', en: 'Branching antler-type horns like a deer' },
  'elf ears':              { ja: '先端が尖った長いエルフ耳', en: 'Long pointed ears characteristic of elves' },
  'animal ears':           { ja: '獣耳の総称。種類未指定の汎用タグ。種類を指定した方が精度が高い', en: 'Generic animal ears — specify type (cat/fox/etc.) for better results' },

  'headphones':            { ja: 'ヘッドフォン装着。音楽系・サイバー系・無機質な雰囲気を加える', en: 'Wearing headphones — adds musical, cyber, or cool detached vibes' },
  'over-ear headphones':   { ja: '耳を覆うタイプの大きなヘッドフォン。存在感が強い', en: 'Large over-ear headphones covering the ears — more prominent and stylish' },

  // ── 構図 ──────────────────────────────────────────────────────
  'cowboy shot':           { ja: '太ももあたりまでのミッドショット。西部劇映画由来の呼称', en: 'Framing from the thighs up — classic cinematic mid-shot' },
  'bust shot':             { ja: '胸（バスト）から上のショット', en: 'Framing from the chest/bust upward' },
  'dutch angle':           { ja: 'カメラを斜めに傾けた構図。緊張感・不安感・独特の雰囲気を演出', en: 'Camera tilted diagonally — creates tension or psychological unease' },
  "bird's-eye view":       { ja: '真上または高所から見下ろした俯瞰構図', en: 'Overhead or high top-down perspective' },
  "worm's-eye view":       { ja: '地面レベルから真上を見上げる極端なローアングル', en: 'Extreme low-angle view from ground level looking upward' },
  'over the shoulder':     { ja: '人物の肩越しに前方のシーンを見る構図', en: 'Camera looks over a character\'s shoulder into the scene' },
  'dynamic':               { ja: '動きのある躍動感あふれる構図', en: 'High-energy composition with strong sense of movement' },
  'all fours':             { ja: '四つん這い。両手と両膝で地面につくポーズ', en: 'On hands and knees — quadruped-style pose' },
  'on one knee':           { ja: '片膝をついたポーズ。プロポーズや誓いのシーンにも', en: 'One knee on the ground — heroic, knightly, or proposal pose' },
  'on side':               { ja: '横向きに寝た（または寝転がった）ポーズ', en: 'Lying on one side — resting or relaxed horizontal pose' },
  'from above':            { ja: '見下ろし視点。斜め上から撮ったアングル', en: 'Looking down at the subject from above' },
  'from below':            { ja: '見上げ視点。斜め下から撮ったアングル', en: 'Looking up at the subject from below' },
  'low angle':             { ja: '低い位置からのアングル。迫力・威圧感が増す', en: 'Camera positioned low, making subject look imposing' },
  'high angle':            { ja: '高い位置からのアングル。俯瞰的・見下ろし気味', en: 'Camera positioned high, looking slightly down at the subject' },

  // ── ライティング ─────────────────────────────────────────────
  'rim light':             { ja: '被写体の輪郭を縁取る背面からの光。シルエットが光る', en: 'Light from behind that outlines the subject\'s silhouette' },
  'volumetric lighting':   { ja: '光筋・ゴッドレイ。霧や煙の中を光が通る体積光', en: 'Visible light rays through atmosphere — fog, dust, or mist' },
  'god rays':              { ja: '雲の隙間・木漏れ日など天から差す放射状の光線', en: 'Radiant beams of light breaking through clouds or foliage' },
  'bioluminescence':       { ja: '生物発光。海中の発光生物や発光植物の幻想的な青緑の輝き', en: 'Natural glowing light from living organisms — oceanic blue-green glow' },
  'lens flare':            { ja: '強い光源に当たったレンズが作る光の星・滲み', en: 'Streaks and starbursts from direct light hitting the camera lens' },
  'backlight':             { ja: '逆光。背後から光が来てシルエット・後光のような表現に', en: 'Light source behind the subject — creates silhouette or halo' },
  'aurora':                { ja: 'オーロラ。夜空に揺れる緑・紫・青のカーテン状の光', en: 'Aurora borealis — shimmering green and purple curtains in the night sky' },
  'global illumination':   { ja: 'GI照明。光の反射・散乱を物理的にシミュレートしたリアルな照明', en: 'Physically accurate lighting that simulates how light bounces between surfaces' },
  'studio lighting':       { ja: 'スタジオ撮影のような均一で計算されたライティング', en: 'Controlled, balanced lighting like a professional photo studio' },
  'cinematic lighting':    { ja: '映画のような劇的なライティング。明暗のコントラストが強い', en: 'Dramatic movie-style lighting with strong contrast' },

  // ── エフェクト ────────────────────────────────────────────────
  'chromatic aberration':  { ja: '色収差。レンズのズレによる赤/青のフリンジ。グリッチ・ローファイ感', en: 'Color fringing at edges from lens distortion — lo-fi or glitch aesthetic' },
  'film grain':            { ja: 'フィルム写真のようなざらざらしたノイズ感', en: 'Grainy texture simulating old photographic film' },
  'vignette':              { ja: '画面の四隅が暗くなるレトロなフォトエフェクト', en: 'Darkened corners — retro photo or film effect' },
  'halftone':              { ja: '印刷・スクリーントーンのようなドット表現。マンガ的', en: 'Dot-pattern effect from print/screen printing — manga-like' },
  'scanlines':             { ja: '古いブラウン管TVのような横縞のCRTエフェクト', en: 'Horizontal line effect like an old CRT television' },
  'motion blur':           { ja: '動いている物体がブレる表現。スピード・躍動感が出る', en: 'Blurred streaks on moving objects — conveys speed and motion' },
  'lens distortion':       { ja: '魚眼・広角レンズのような画面の歪み', en: 'Barrel or fisheye distortion from a wide-angle lens' },
  'noise texture':         { ja: '画面全体にランダムなノイズ・ざらつきを加えるテクスチャ', en: 'Random visual noise layered over the image' },
  'magic circle':          { ja: '幾何学的な文様の魔法陣。召喚・魔法系演出に', en: 'Geometric magical summoning circle' },
  'glowing tattoo':        { ja: '皮膚上で発光する文様・ルーン。魔法系キャラに映える', en: 'Luminous glowing markings or runes on skin' },

  // ── 背景 ──────────────────────────────────────────────────────
  'simple background':     { ja: '単色や最小限の背景。キャラを際立たせたいときに有効', en: 'Minimal background to keep focus entirely on the character' },
  'abstract background':   { ja: '具体的な場所でなく抽象的なパターン・色面の背景', en: 'Non-representational shapes and colors as background' },
  'gradient background':   { ja: 'グラデーションの背景。おしゃれでシンプルな印象', en: 'Smooth color-transition background' },
  'bokeh background':      { ja: '背景がボケた丸い光の玉が散らばる。ポートレート写真的', en: 'Blurred circular light orbs in background — portrait photography look' },
  'rooftop':               { ja: 'ビルや建物の屋上。青空・夜景・街並みと合わせやすい', en: 'Rooftop of a building — pairs well with city skyline or night view' },
  'dungeon':               { ja: '石造りの地下迷宮・牢獄。RPGファンタジー系の背景', en: 'Stone underground labyrinth or prison — fantasy RPG setting' },
  'alley':                 { ja: '建物の間の薄暗い路地裏。都市的・ノワール系の雰囲気', en: 'Narrow urban alleyway — moody city or noir atmosphere' },
  'ruins':                 { ja: '崩れた古代遺跡や廃墟。ファンタジー・ポストアポカリプス系に', en: 'Crumbled ancient structures or abandoned buildings — fantasy or post-apocalyptic' },
  'castle':                { ja: '西洋式の城。塔・城壁・石造りの雄大な建築', en: 'Western-style medieval stone castle with towers and battlements' },
  'outer space':           { ja: '宇宙空間。星や惑星・銀河を背景にしたSF・ファンタジー系', en: 'Space setting with stars, planets, or galaxies — sci-fi or cosmic feel' },
  'underwater':            { ja: '水中・海中シーン。光の揺らめきや泡・サンゴなどの演出に', en: 'Submerged underwater scene with light rays, bubbles, and marine elements' },
  'throne room':           { ja: '玉座と豪華な内装の王室の間。権威・ファンタジー系に映える', en: 'Royal throne hall with ornate decor — regal or fantasy setting' },

  // ── 品質・安全 ────────────────────────────────────────────────
  'SFW':                   { ja: 'Safe For Work。職場・公共でも見られるよう露出・過激表現を除外し、ネガティブにnsfwを自動追加する', en: 'Safe For Work — keeps content appropriate for public use; auto-adds nsfw to negative prompt' },
  'rating:safe':           { ja: 'Danbooruの安全評価タグ。露出なし・暴力なしの最高クリーン度を指定', en: 'Danbooru safety rating tag — no nudity or violence, highest clean rating' },
  'official art':          { ja: 'アニメ・ゲームの公式ビジュアル風の丁寧な仕上がりに誘導する', en: 'Steers output toward polished anime/game official illustration style' },
  'detailed background':   { ja: '背景を省略せず細部まで丁寧に描くよう誘導する', en: 'Prompts the AI to render a fully detailed, non-lazy background' },
  'chibi':                 { ja: '頭身が低い2〜3頭身のデフォルメキャラ。SD（スーパーデフォルメ）とも', en: 'Super-deformed 2–3 head-height exaggerated style (also called SD)' },
  'flat design':           { ja: 'シャドウなし・グラデなしのシンプルなフラットカラー。アイコン・ポスター風', en: 'Minimal vector-like design with no shadows or gradients — icon or poster look' },
  'soft shading':          { ja: '影の境界がなだらかなやわらかいグラデーションシェーディング', en: 'Gentle, diffuse shading with soft transitions between light and shadow' },

  // ── 髪型 ──────────────────────────────────────────────────────
  'wolf cut':              { ja: 'ウルフカット。段差を付けてランダムに切り込んだワイルドな外ハネスタイル', en: 'Layered shaggy haircut with wispy ends — edgy, wild texture' },
  'hime cut':              { ja: '姫カット。眉ラインで水平に揃えた前髪＋サイドを直線に切り揃えたお姫様風', en: 'Princess cut: straight-across bangs with straight side curtains framing the face' },
  'drill hair':            { ja: 'ドリルヘア（縦ロール）。コルクスクリュー状に巻いた螺旋ツインテール。お嬢様系キャラに多い', en: 'Tight corkscrew spiral curls, usually in twintails — classic ojou-sama/princess style' },
  'swept back hair':       { ja: '前髪をかき上げて後ろに流したスッキリしたスタイル。知的・クール系に', en: 'Hair brushed back from the forehead — clean, cool, or intellectual look' },
  'layered hair':          { ja: 'レイヤーカット。段差を付けて動きと軽さを出したスタイル', en: 'Layered cut with varying lengths for volume and movement' },
  'spiky hair':            { ja: '先端が尖って立ちあがるとがり毛。少年マンガのバトル系キャラに多い', en: 'Sharp upward-pointing spikes — common in shonen battle-anime characters' },

  // ── メイク ────────────────────────────────────────────────────
  'blush stickers':        { ja: '頬に貼られたシール状のデコ頬紅。可愛い・あどけない印象を加える', en: 'Decorative sticker-style blush marks on cheeks — cute, innocent look' },
  'mole under eye':        { ja: '目の下の涙ぼくろ。色気・ミステリアスな印象を加える定番ポイント', en: 'Beauty mark / tear mole below the eye — adds allure or a mysterious quality' },

  // ── 種族・特殊 ────────────────────────────────────────────────
  'succubus':              { ja: 'サキュバス。悪魔の種族で男性を誘惑する魔物。羽・角・尻尾が特徴的', en: 'Succubus — seductive demon with wings, horns, and a spaded tail' },
  'lamia':                 { ja: 'ラミア。上半身が人間・下半身が蛇の半妖怪。スケールのあるシルエットが特徴', en: 'Half-human half-snake mythological creature with a serpentine lower body' },
  'tanuki':                { ja: 'タヌキ（狸）。日本の妖怪・信仰の動物。大きな耳・尻尾・腹太鼓が特徴', en: 'Japanese raccoon dog spirit with magical shapeshifting powers' },
  'paw pads':              { ja: '肉球。動物系キャラの手・足裏にある柔らかいクッション状のパーツ', en: 'Soft cushioned paw pads on the palms or feet of animal-type characters' },
  'fluffy tail':           { ja: 'もふもふした大きくて丸みのある動物の尻尾。キツネ・オオカミ系に多い', en: 'Large, soft, and fluffy animal tail — common on fox or wolf characters' },
  'multiple tails':        { ja: '複数本の尻尾。九尾のキツネなど多尾の妖怪・伝説キャラに', en: 'Multiple tails — as on nine-tailed fox spirits or legendary multi-tail creatures' },

  // ── 衣装 ──────────────────────────────────────────────────────
  'cheongsam':             { ja: 'チャイナドレス（旗袍 / qipao）。高いスリット＋立て衿が特徴の中国伝統衣装', en: 'Traditional Chinese qipao dress with high slit and mandarin collar' },
  'hanfu':                 { ja: '漢服。古代中国の伝統衣装。広い袖・流れるような布地が特徴', en: 'Traditional Han Chinese clothing with flowing wide sleeves — ancient Chinese aesthetic' },
  'bunny suit':            { ja: 'バニーガールスーツ。ウサギ耳・カフス・コルセット型の肌出しコスチューム', en: 'Playboy Bunny-style costume with rabbit ears, cuffs, and a corseted body' },
  'leotard':               { ja: 'レオタード。体にぴったりした一体型の水着に似た衣装。体操・ダンス系に', en: 'Tight one-piece body-hugging garment — like a swimsuit; worn in gymnastics/dance' },
  'race queen':            { ja: 'レースクイーン。日本のモータースポーツイベントのキャンペーンガール衣装。ミニ丈＋ハイヒールが定番', en: 'Japanese motorsport promo-girl outfit — usually a mini dress or tight uniform with heels' },
  'bikini armor':          { ja: 'ビキニアーマー。ビキニ型の防具。ファンタジーRPGのセクシー戦士の定番衣装', en: 'Fantasy battle outfit — armor styled as a bikini; iconic skimpy warrior costume' },
  'magical girl':          { ja: '魔法少女衣装。セーラー服やふわふわドレスにステッキ・リボンを組み合わせた変身ヒロイン風', en: 'Magical girl transformation outfit — frilly dress with ribbon and wand, mahou shoujo style' },
  'micro bikini':          { ja: 'マイクロビキニ。布地が極端に小さく肌の露出が非常に多い水着', en: 'Extremely minimal bikini with tiny triangles of fabric — very high skin exposure' },
  'school swimsuit':       { ja: 'スクール水着。日本の学校で使われる紺色のワンピース競泳水着', en: 'Japanese school competition swimsuit — navy blue one-piece with name label' },
  'halter top':            { ja: 'ホルタートップ。首の後ろで紐を結ぶ形で背中が開いたトップス', en: 'Top that ties behind the neck, leaving the back and shoulders bare' },
  'sports bra':            { ja: 'スポーツブラ。運動用のサポートブラ。ミドリフ見せスタイルに多用', en: 'Athletic supportive bra top — pairs with bare midriff activewear look' },
  'sweater vest':          { ja: 'セーターベスト（袖なしニット）。カジュアル知的系のアカデミックファッションに', en: 'Sleeveless knit vest — academic or preppy style' },
  'cloak':                 { ja: 'クローク。肩から羽織る袖なしのマント状の外套。ファンタジー系に', en: 'Sleeveless outer robe draped over the shoulders — fantasy or medieval style' },

  // ── フットウェア ─────────────────────────────────────────────
  'pumps':                 { ja: 'パンプス。ヒールがあり甲部分を覆う最もオーソドックスな女性用ドレスシューズ', en: 'Classic women\'s heeled dress shoes with a closed toe and no straps' },
  'platform shoes':        { ja: '厚底シューズ。靴底全体が分厚く高さのある靴。原宿系・ゴスロリ系に人気', en: 'Shoes with an extra-thick platform sole — Harajuku or gothic lolita style' },
  'mary janes':            { ja: 'メアリージェーン。甲に横ベルトのある丸つま先のシンプルなフラット靴。幼い印象に', en: 'Round-toe flat shoes with a strap across the instep — girlish, classic schoolgirl look' },
  'loafers':               { ja: 'ローファー。紐なしのスリップオン式の革靴。制服・学生スタイルに', en: 'Slip-on leather shoes with no laces — school uniform or smart-casual style' },
  'thigh-high boots':      { ja: '太ももまで覆うロングブーツ。絶対領域との組み合わせが定番', en: 'Boots that reach all the way up to the thigh — often paired with miniskirts' },
  'knee-high boots':       { ja: 'ニーハイブーツ。膝まで覆うロングブーツ', en: 'Boots reaching up to the knee' },

  // ── 持ち物・武器 ─────────────────────────────────────────────
  'holding fan':           { ja: '扇子（または団扇）を手に持つポーズ。和風・中華風・貴族系に映える', en: 'Holding a folding or flat fan — Japanese, Chinese, or aristocratic aesthetic' },
  'holding lantern':       { ja: '提灯やオイルランタンを手に持つ。和風・中世・ゴシック系の雰囲気に', en: 'Holding a paper lantern or oil lantern — historical, gothic, or Japanese ambiance' },
};
