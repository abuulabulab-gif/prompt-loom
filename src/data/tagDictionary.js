// タグ辞書：名前だけでは意味がわかりにくいタグに日本語説明を付与する。
// 【執筆ルール】
//   ・ja欄は全角25〜50文字を目安に1〜2文で完結（複雑な概念のみ60文字まで例外）
//   ・構造：「【定義・何か】。【用途・効果】」の2文が基本
//   ・英語タグ名を文中に混在させない。カタカナ表記を使用すること
//   ・自明なタグ（例：blue hair）は不要。意味が取りにくいものだけ登録

export const TAG_DICT = {

  // ── ベース・品質 ──────────────────────────────────────────────
  'masterpiece':           { ja: 'AI品質向上の定番タグ。生成全体のクオリティが底上げされる', en: 'Core quality keyword that raises overall output fidelity' },
  'absurdres':             { ja: '超高解像度（8K超）を要求するタグ。処理が重く高スペック環境向け', en: 'Ultra-high resolution flag (beyond 8K); GPU-intensive' },
  'highres':               { ja: '高解像度を指定するタグ。拡大処理ツールと組み合わせると効果的', en: 'High-resolution flag; effective combined with upscalers' },
  'trending on pixiv':     { ja: 'pixivの人気作品風のスタイルに誘導する。アニメ・イラスト系に強い', en: 'Steers style toward popular pixiv illustration aesthetics' },
  'sharp focus':           { ja: '画全体をくっきり鮮明に描写する。ボケや滲みが抑えられる', en: 'Makes the whole image crisp with minimal blur' },
  'intricate details':     { ja: '細部まで複雑・精緻に描写させる。装飾・模様・テクスチャが増える', en: 'Adds complex fine details — patterns, textures, ornaments' },
  'professional artwork':  { ja: 'プロが制作したような完成度の高い仕上がりに誘導する', en: 'Biases output toward polished, commercial art quality' },

  // ── アートスタイル ─────────────────────────────────────────────
  'cel shading':           { ja: 'アニメ・ゲームのような輪郭線＋ベタ塗りスタイル。グラデーションなし', en: 'Flat shading with hard outlines — like classic anime or game art' },
  'impasto':               { ja: '油絵の厚塗り。絵具を盛り上げたような質感・タッチが出る', en: 'Thick, textured paint application like oil painting' },
  'painterly':             { ja: '絵画的なタッチ。手書きのブラシ感・筆致が全体ににじむ', en: 'Adds a hand-painted, artistic brush-stroke quality' },
  'bokeh':                 { ja: '背景に丸いボケ光源が散らばる写真的な表現。ポートレートに映える', en: 'Circular light blurs in the background — like a portrait camera lens' },
  'depth of field':        { ja: '被写界深度。焦点範囲外の前後をぼかしてカメラ風にする', en: 'Blurs near/far from focal point, like a real camera lens' },
  'bloom':                 { ja: '光が滲み出るような柔らかい発光演出。ファンタジー・幻想的な雰囲気に', en: 'Soft glow effect where light bleeds at edges — dreamy feel' },
  'flat color':            { ja: 'グラデーションなし・影なしの均一な色塗り。ポップアート・アイコン風', en: 'Solid colors with no gradients or shading — pop art look' },
  'lineart':               { ja: '線画のみ。色塗りなし・アウトラインだけの状態', en: 'Line drawing with no color fill — sketch outline only' },
  'atmospheric':           { ja: '空気感・雰囲気を重視したほんのり霞む表現', en: 'Hazy, moody atmosphere with soft gradation' },
  'smooth shading':        { ja: 'なめらかなグラデーションで立体感を表現するシェーディング', en: 'Gradual, smooth transitions between light and shadow' },

  // ── 顔：髪 ───────────────────────────────────────────────────
  'ahoge':                 { ja: '頭頂部から1本だけぴょんと跳ねる「アホ毛」。アニメキャラらしさが出る', en: 'Single strand of hair sticking up from the head — iconic anime trait' },
  'hair intakes':          { ja: '触角ヘア。こめかみ付近から2本跳ねるシャープな毛束', en: 'Sharp hair tufts at the temples, like antennae' },
  'sidelocks':             { ja: '顔の横に垂れる長めの髪束。ロング系キャラによく見られる', en: 'Long hair strands hanging along the sides of the face' },
  'inner hair color':      { ja: '内側の髪だけ別の色のインナーカラー染め', en: 'Different color on the inner/underneath layer of hair' },
  'underlights':           { ja: '下から照らすように内側が光るインナーカラーの表現', en: 'Inner hair that appears to glow from underneath' },
  'colored tips':          { ja: '毛先だけ別の色に染めたグラデーション染め', en: 'Hair with dyed tips of a contrasting color' },
  'hair between eyes':     { ja: '眉間・目の間を横切る前髪の一筋', en: 'A strand of hair crossing between the eyes' },
  'floating hair':         { ja: '風や魔力でなびく・浮かぶ髪。ダイナミックな演出に', en: 'Hair flowing or floating as if in wind or magical energy' },
  'hair spread out':       { ja: '床や水面などに扇状に広がった髪。仰向け・水中・浮遊ポーズと組み合わせると映える', en: 'Hair spread wide across a surface — pairs beautifully with lying-down, underwater, or floating poses' },
  'maromayu':              { ja: '麻呂眉。平安貴族風の丸くて太い眉。高い位置に描かれ独特の雰囲気が出る', en: 'Round, thick eyebrows placed high on the forehead — Heian-era aristocrat style' },

  // ── 顔：目・表情 ──────────────────────────────────────────────
  'heterochromia':         { ja: 'オッドアイ。片目ずつ異なる色を持つ瞳の表現', en: 'Each eye a different color' },
  'bedroom eyes':          { ja: 'うつろな半眼。妖艶で色気のある視線', en: 'Heavy-lidded, seductive expression' },
  'fang':                  { ja: '八重歯。キャラの可愛さ・やんちゃさを演出する小さな牙', en: 'Small protruding canine tooth — cute or mischievous character' },
  'star-shaped pupils':    { ja: '星型の瞳孔。ファンタジー・魔法系キャラの瞳の演出に', en: 'Star-shaped pupils instead of round — fantasy or magical effect' },
  'heart-shaped pupils':   { ja: 'ハート型の瞳孔。恋愛・魅了状態の表現に。星型瞳孔と対になるセット', en: 'Heart-shaped pupils — used for lovestruck or charmed expressions' },
  'sparkling eyes':        { ja: '目の中にキラキラとしたハイライトが入る', en: 'Eyes with shiny, sparkling highlights inside' },
  'sleepy eyes':           { ja: 'たれ目。目尻が下がってやさしい・眠そうな印象', en: 'Drooping outer corners of the eyes — gentle or drowsy look' },
  'upturned eyes':         { ja: 'つり目。目尻が上がって気が強い・凛とした印象', en: 'Eyes with raised outer corners — sharp, strong impression' },
  'dull eyes':             { ja: '「死んだ目」。感情が抜け落ちた虚ろな目つき。ゾンビ・疲弊・洗脳キャラに', en: 'Lifeless, vacant eyes — used for exhausted, brainwashed, or zombie-like characters' },
  'empty eyes':            { ja: '瞳の中が空洞のような無のまなざし。機械・幽霊・感情欠落の表現に', en: 'Hollow, soul-less eyes with no highlight — robotic, ghostly, or emotionally void look' },
  'smug':                  { ja: '自信満々のドヤ顔。目を細めた優越感あふれる得意げ表情。smirkより顔全体で感情が出る', en: 'Self-satisfied, arrogant expression with narrowed eyes — full-face smugness, more exaggerated than a smirk' },

  // ── 顔：口・メイク ────────────────────────────────────────────
  'detailed lips':         { ja: '唇の輪郭・ハイライト・質感を精細に描写させる指示タグ。唇フォーカステンプレートで使用', en: 'Directs detailed rendering of lip contour, highlights, and texture' },
  'eye focus':             { ja: '目を主役にした構図の指示タグ。虹彩・まつ毛の精細描写を促す。全身・上半身と矛盾', en: 'Directs AI to focus on the eyes — promotes detailed iris and eyelash rendering' },
  'detailed pupils':       { ja: '瞳孔・虹彩の細部（模様・反射・深度感）を精細に描写させる指示タグ。目フォーカステンプレートで使用', en: 'Prompts detailed pupil and iris rendering with fine patterning and reflections' },
  'parted lips':           { ja: 'わずかに開いた唇。自然な色気を出す', en: 'Lips slightly open — natural, subtle allure' },
  'licking lips':          { ja: '唇を舐める仕草。艶やかな印象に', en: 'Tongue touching the lips — sensual or playful gesture' },

  // ── 体型 ──────────────────────────────────────────────────────
  'thigh gap':             { ja: '直立時に太ももの内側に隙間ができる体型表現。細身・スリムさを補完するタグ', en: 'Visible gap between the inner thighs when standing — subtle slim-build emphasis' },
  'collarbone':            { ja: '鎖骨を目立たせた描写。色気や華奢さを演出する', en: 'Prominent, defined collarbone — adds elegance or appeal' },
  'toned':                 { ja: '引き締まった体型。細身だが適度な筋肉感あり', en: 'Lean and defined without being bulky — athletic slim build' },
  'loli':                  { ja: '幼い・小柄な体型の指定。成熟・大人タグとは共存できない', en: 'Small, childlike body proportions. Conflicts with adult/mature tags' },
  'mature female':         { ja: '成熟した大人の女性の体型・雰囲気。幼女体型タグとは矛盾する', en: 'Adult, voluptuous female proportions. Conflicts with loli/young' },
  'freckles':              { ja: 'そばかす。健康的・自然体な印象を加える小さな斑点模様', en: 'Small brown spots scattered across the face — natural, fresh look' },

  // ── ボディフォーカス ──────────────────────────────────────────
  'thighs':                { ja: '太もも全般を強調した描写。ミニスカやニーソックスとの組み合わせで映える', en: 'Emphasizes the thighs — pairs well with mini skirt or thighhighs' },
  'bare thighs':           { ja: '素の太もも。肌の露出を強調する', en: 'Exposed bare thighs — heightens sense of skin exposure' },
  'armpits':               { ja: '脇の下が見える構図・衣装。ノースリーブや水着との相性が良い', en: 'Visible armpits — suits sleeveless outfits or swimwear' },
  'nape':                  { ja: 'うなじ。首の後ろの肌。髪アップや後ろ向き構図で映える', en: 'Nape of the neck — elegant when hair is up or seen from behind' },
  'midriff':               { ja: 'お腹・腹部の露出。クロップトップや水着でよく使われる', en: 'Exposed midriff/abdomen — common with crop tops or swimwear' },
  'bare back':             { ja: '背中の素肌を見せる。バックレスドレスや後ろ向き構図で効果的', en: 'Exposed bare back — effective with back-view compositions or backless dresses' },
  'bare shoulders':        { ja: '肩が出た状態。オフショルダーや水着と組み合わせると自然に出る', en: 'Exposed bare shoulders — natural with off-shoulder tops or swimwear' },
  'cleavage':              { ja: '胸の谷間。ローカットやドレスで生まれる胸元の影', en: 'Visible cleavage between the chest — from low-cut tops or dresses' },
  'sideboob':              { ja: '横から胸の側面が見える状態。⚠️サービスによってはNSFW判定される', en: 'Breast visible from the side — ⚠️ may be flagged as NSFW depending on the service' },
  'underboob':             { ja: '胸の下側が見える状態。⚠️サービスによってはNSFW判定される', en: 'Underside of breast visible — ⚠️ borderline SFW; may be flagged NSFW by some services' },
  'wide hips':             { ja: '広めのヒップラインを強調。女性らしいシルエットを際立たせる', en: 'Wide hip silhouette — accentuates a feminine figure' },

  // ── 衣装 ──────────────────────────────────────────────────────
  'off shoulder':          { ja: '肩が出るデザインのトップス。鎖骨・肩ラインを強調する', en: 'Top with exposed shoulders and collarbone' },
  'tube top':              { ja: '肩ひもなしの筒状トップス。ストラップレスとも呼ばれる', en: 'Strapless tube-shaped top with no shoulder straps' },
  'fishnet':               { ja: '網目状の透け素材。タイツや衣装の素材として使われる', en: 'Open-mesh fabric showing skin through a grid pattern' },
  'see-through':           { ja: '薄い素材で下が透けて見える表現', en: 'Sheer fabric that reveals what is underneath' },
  'ruffles':               { ja: 'ひらひらした波型の装飾。フリルより大きめで豪華な印象', en: 'Wavy, gathered fabric trim — larger and more dramatic than frills' },
  'garter belt':           { ja: 'ストッキングを留める腰ベルト型の下着。太ももに装着する', en: 'Elastic belt worn around the waist/hips to hold up stockings' },
  'pantyhose':             { ja: 'パンスト。脚全体を覆う薄いナイロンのタイツ', en: 'Thin nylon tights covering legs and hips' },
  'thighhighs':            { ja: '太ももまでの長いオーバーニーソックス', en: 'Thigh-high socks or stockings' },
  'pleated skirt':         { ja: '細かいヒダ（プリーツ）のスカート。制服によく使われる', en: 'Skirt with knife-pleats, common in school uniforms' },
  'furisode':              { ja: '長い袖が特徴の振り袖。成人式・正装用の和装', en: 'Formal kimono with long flowing sleeves for special occasions' },
  'gothic lolita':         { ja: 'ゴスロリ。黒を基調にしたフリルたっぷりのロリータファッション', en: 'Black-dominant, Victorian-inspired frilly lolita fashion' },
  'sci-fi armor':          { ja: 'SFアーマー。ファンタジー鎧のSF版。未来的な素材・デザインの全身鎧', en: 'Futuristic full-body armor with sleek tech design' },
  'techwear':              { ja: 'テックウェア。防水・多機能ポケット・サイバー配色のアーバン系ファッション。機械化キャラやサイバーパンク背景と相性抜群', en: 'Urban tactical streetwear with a sci-fi edge — waterproof materials, utility pockets, cyberpunk palette' },
  'fingerless gloves':     { ja: '指先が出るグローブ。クール・アクション系キャラに映える', en: 'Gloves with exposed fingertips — action or edgy style' },
  'cheongsam':             { ja: 'チャイナドレス。高いスリット＋立て衿が特徴の中国伝統衣装', en: 'Traditional Chinese qipao dress with high slit and mandarin collar' },
  'hanfu':                 { ja: '漢服。古代中国の伝統衣装。広い袖・流れるような布地が特徴', en: 'Traditional Han Chinese clothing with flowing wide sleeves — ancient Chinese aesthetic' },
  'bunny suit':            { ja: 'バニーガールスーツ。うさ耳・カフス・コルセット型の露出コスチューム', en: 'Bunny-girl costume with rabbit ears, cuffs, and a corseted body' },
  'leotard':               { ja: 'レオタード。体にぴったりした一体型の水着に似た衣装。体操・ダンス系に', en: 'Tight one-piece body-hugging garment — like a swimsuit; worn in gymnastics/dance' },
  'race queen':            { ja: 'レースクイーン。モータースポーツイベントのキャンペーンガール衣装。ミニ丈＋ハイヒールが定番', en: 'Japanese motorsport promo-girl outfit — usually a mini dress with heels' },
  'bikini armor':          { ja: 'ビキニアーマー。ビキニ型の防具。ファンタジーRPGのセクシー戦士の定番衣装', en: 'Fantasy battle outfit — armor styled as a bikini; iconic skimpy warrior costume' },
  'magical girl':          { ja: '魔法少女衣装。ふわふわドレスにステッキ・リボンを組み合わせた変身ヒロイン風', en: 'Magical girl transformation outfit — frilly dress with ribbon and wand' },
  'micro bikini':          { ja: 'マイクロビキニ。布地が極端に小さく肌の露出が非常に多い水着', en: 'Extremely minimal bikini with tiny triangles of fabric — very high skin exposure' },
  'school swimsuit':       { ja: 'スクール水着。日本の学校で使われる紺色のワンピース競泳水着', en: 'Japanese school competition swimsuit — navy blue one-piece with name label' },
  'halter top':            { ja: 'ホルタートップ。首の後ろで紐を結ぶ形で背中が開いたトップス', en: 'Top that ties behind the neck, leaving the back and shoulders bare' },
  'sports bra':            { ja: 'スポーツブラ。運動用のサポートブラ。お腹出しスタイルによく使われる', en: 'Athletic supportive bra top — pairs with bare midriff activewear look' },
  'sweater vest':          { ja: 'セーターベスト（袖なしニット）。カジュアル知的系のアカデミックファッション', en: 'Sleeveless knit vest — academic or preppy style' },
  'cloak':                 { ja: 'クローク。肩から羽織る袖なしのマント状の外套。ファンタジー系に', en: 'Sleeveless outer robe draped over the shoulders — fantasy or medieval style' },
  'sleeveless':            { ja: 'ノースリーブ。袖がない衣装の総称。肩・二の腕・脇が露出し、軽快でアクティブな印象', en: 'Any top with no sleeves — exposes shoulders and upper arms; sporty or summer feel' },

  // ── 特殊パーツ ────────────────────────────────────────────────
  'ball joints':           { ja: '球体関節人形のような球形のジョイントパーツ。ドール系キャラに', en: 'Spherical ball-and-socket joints at limbs — doll aesthetic' },
  'mermaid tail':          { ja: '人魚の大きな尾ひれ。脚の代わりになる下半身パーツ', en: 'Large fish tail replacing legs — mermaid lower body' },
  'dragon tail':           { ja: '竜娘の長いトカゲ・ドラゴン型の尻尾', en: 'Long reptilian tail for dragon-girl characters' },
  'demon wings':           { ja: 'コウモリ型の翼膜がある悪魔の翼', en: 'Bat-like membrane wings for demon characters' },
  'demon tail':            { ja: '先が矢尻（♦）形の悪魔の尻尾', en: 'Arrow-tipped tail characteristic of demon characters' },
  'fairy wings':           { ja: '妖精の薄く透明な羽。トンボや蝶の形に似ている', en: 'Thin, translucent insect-like wings for fairy characters' },
  'halo':                  { ja: '天使の輪。頭上に浮かぶ金色の光の輪', en: 'Glowing ring floating above the head — angel characteristic' },
  'dragon horns':          { ja: 'ドラゴン系の大きな曲がった角。存在感が強い', en: 'Large curved horns for dragon-type characters' },
  'small horns':           { ja: '小さくて可愛い角。悪魔・サキュバス系キャラに多い', en: 'Small cute horns, common on demon or succubus characters' },
  'deer antlers':          { ja: '枝分かれした鹿のような角', en: 'Branching antler-type horns like a deer' },
  'elf ears':              { ja: '先端が尖った長いエルフの耳', en: 'Long pointed ears characteristic of elves' },
  'animal ears':           { ja: '獣耳の総称。猫耳・狐耳など種類を絞った方が精度が上がる汎用タグ', en: 'Generic animal ears — specify type (cat/fox/etc.) for better results' },
  'headphones':            { ja: 'ヘッドフォン装着。音楽系・サイバー系・無機質な雰囲気を加える', en: 'Wearing headphones — adds musical, cyber, or cool detached vibes' },
  'over-ear headphones':   { ja: '耳を覆うタイプの大きなヘッドフォン。存在感と迫力が強い', en: 'Large over-ear headphones covering the ears — more prominent and stylish' },
  'oni horns':             { ja: '鬼に特有の大きくて太い角。小さい角より迫力があり和風ファンタジーに', en: 'Large, thick horns characteristic of Japanese oni demons — more imposing than small horns' },
  'third eye':             { ja: '額などに現れる第三の目。神秘・呪術・超能力系キャラの象徴', en: 'An extra eye on the forehead — symbol of supernatural power or mysticism' },
  'scale skin':            { ja: '鱗状の皮膚。竜娘・蛇娘・爬虫類系キャラの体表に使う', en: 'Reptilian scaled skin texture — for dragon girls, lamia, or lizard-type characters' },
  'mechanical wings':      { ja: '金属・機械素材でできた翼。蒸気機械系・サイボーグ系キャラに', en: 'Wings made of metal or mechanical parts — steampunk, cyborg, or android characters' },
  'bunny tail':            { ja: 'うさぎの丸くて短いふわふわしっぽ。バニー系キャラや兎娘に', en: 'Small, round fluffy bunny tail — worn by bunny-girl characters or rabbit beastgirls' },
  'fluffy tail':           { ja: 'もふもふした大きくて丸みのある動物の尻尾。狐・狼系に多い', en: 'Large, soft, and fluffy animal tail — common on fox or wolf characters' },
  'multiple tails':        { ja: '複数本の尻尾。九尾の狐など多尾の妖怪・伝説キャラに', en: 'Multiple tails — as on nine-tailed fox spirits or legendary multi-tail creatures' },
  'paw pads':              { ja: '肉球。動物系キャラの手・足裏にある柔らかいクッション状のパーツ', en: 'Soft cushioned paw pads on the palms or feet of animal-type characters' },

  // ── 構図 ──────────────────────────────────────────────────────
  'macro shot':            { ja: '被写体の一部を超拡大したマクロ撮影構図。唇・瞳など細部の描写に。全身・ワイドと共存不可', en: 'Extreme close-up on a single feature — conflicts with full body or wide shot' },
  'lower half of face':    { ja: '顔の下半分（鼻・唇・顎）にフォーカスした構図。唇フォーカステンプレートの核。全身・上半身と矛盾', en: 'Framing that shows only the lower half of the face — key tag for lip-focus composition' },
  'extreme close-up on eyes': { ja: '目・瞳だけに極限まで寄った構図。虹彩・まつ毛・ハイライトを鮮明に。全身・ワイドと矛盾', en: 'Maximal zoom onto the eyes — renders iris and lashes in sharp detail; conflicts with full body' },
  'wide angle view':       { ja: '広角レンズで広い空間を収めた構図。背景を活かしつつキャラも含める', en: 'Wide-angle lens view capturing a broad scene alongside the character' },
  'fisheye lens':          { ja: '魚眼レンズを明示するタグ。通常の魚眼より強い歪みと球面収差を誘導する。単色背景では効果が薄れる', en: 'Explicit fisheye tag for stronger barrel distortion — loses effect on simple backgrounds' },
  'extreme perspective':   { ja: '超誇張されたパース。建物や廊下が急激に遠ざかる演出。魚眼やパース強調と組み合わせると特に強力', en: 'Hyper-exaggerated vanishing-point perspective — amplified by fisheye or foreshortening' },
  'distorted background':  { ja: '背景が歪んで見える演出。魚眼レンズ・広角・魔法エフェクトの補助タグとして使う', en: 'Background that appears warped or distorted — used alongside fisheye or wide-angle compositions' },
  'character sheet':       { ja: 'キャラクターシート形式の指示タグ。三面図・設定資料用の画像生成に使う。ランダム生成からは除外', en: 'Directive tag for a character reference sheet layout — excluded from random generation' },
  'reference sheet':       { ja: '参照シートを生成する指示タグ。複数アングルや設定情報を一枚にまとめた資料用', en: 'Tells the AI to produce a multi-view or reference-format composition' },
  'expression sheet':      { ja: '表情集シートを生成する指示タグ。同一キャラの複数表情を一枚に並べる', en: 'Generates a sheet of different facial expressions for the same character' },
  'color palette':         { ja: 'カラーパレットを画像に含める指示タグ。キャラの色見本付き資料を出力させる', en: 'Prompts the AI to include a color palette swatch alongside the character design' },
  'cowboy shot':           { ja: '太ももあたりまでのミッドショット。西部劇映画由来の呼称', en: 'Framing from the thighs up — classic cinematic mid-shot' },
  'bust shot':             { ja: '胸から上のショット。バストアップとほぼ同義', en: 'Framing from the chest/bust upward' },
  'dutch angle':           { ja: 'カメラを斜めに傾けた構図。緊張感・不安感・独特の雰囲気を演出する', en: 'Camera tilted diagonally — creates tension or psychological unease' },
  "bird's-eye view":       { ja: '真上または高所から見下ろした俯瞰構図', en: 'Overhead or high top-down perspective' },
  "worm's-eye view":       { ja: '地面レベルから真上を見上げる極端なローアングル', en: 'Extreme low-angle view from ground level looking upward' },
  'over the shoulder':     { ja: '人物の肩越しに前方のシーンを見る構図', en: "Camera looks over a character's shoulder into the scene" },
  'fisheye':               { ja: '魚眼レンズ。手足が極端に手前に迫るダイナミックなパース効果', en: 'Ultra-wide fisheye lens — extreme perspective distortion making near elements loom dramatically' },
  'dynamic':               { ja: '動きと躍動感にあふれる構図・演出', en: 'High-energy composition with strong sense of movement' },
  'all fours':             { ja: '四つん這い。両手と両膝で地面につくポーズ', en: 'On hands and knees — quadruped-style pose' },
  'on one knee':           { ja: '片膝をついたポーズ。プロポーズや誓いのシーンにも', en: 'One knee on the ground — heroic, knightly, or proposal pose' },
  'on side':               { ja: '横向きに寝た（または横たわった）ポーズ', en: 'Lying on one side — resting or relaxed horizontal pose' },
  'from above':            { ja: '斜め上から見下ろすアングル', en: 'Looking down at the subject from above' },
  'from below':            { ja: '斜め下から見上げるアングル', en: 'Looking up at the subject from below' },
  'low angle':             { ja: '低い位置からのアングル。迫力・威圧感が増す', en: 'Camera positioned low, making subject look imposing' },
  'high angle':            { ja: '高い位置からのアングル。俯瞰的・見下ろし気味になる', en: 'Camera positioned high, looking slightly down at the subject' },
  'foreshortening':        { ja: 'パース強調。カメラに向かって伸びた手足が極端に大きく見える遠近法の演出', en: 'Exaggerated perspective where limbs pointing at the camera appear dramatically enlarged' },
  'dynamic angle':         { ja: '大胆に傾けたカメラアングル。ポーズに躍動感を与える。パース強調と組み合わせると特に効果的', en: 'Boldly tilted camera angle that adds energy and movement — effective with foreshortening' },

  // ── ライティング ─────────────────────────────────────────────
  'rim light':             { ja: '被写体の輪郭を縁取る背面からの光。シルエットが光る', en: "Light from behind that outlines the subject's silhouette" },
  'volumetric lighting':   { ja: '光の筋・ゴッドレイ。霧や煙の中を光が通る体積光', en: 'Visible light rays through atmosphere — fog, dust, or mist' },
  'god rays':              { ja: '雲の隙間・木漏れ日など天から差す放射状の光線', en: 'Radiant beams of light breaking through clouds or foliage' },
  'bioluminescence':       { ja: '生物発光。海中の発光生物のような幻想的な青緑の輝き', en: 'Natural glowing light from living organisms — oceanic blue-green glow' },
  'caustics':              { ja: 'コースティクス。水面・水中シーンで肌や服に映る揺れる光の網目模様。水中シーンと組み合わせるとリアリティが爆上がりする', en: 'Water-refracted light patterns rippling on surfaces — pairs with underwater scenes for stunning realism' },
  'lens flare':            { ja: '強い光源に当たったレンズが作る光の星・滲み', en: 'Streaks and starbursts from direct light hitting the camera lens' },
  'backlight':             { ja: '逆光。背後から光が来てシルエット・後光のような表現に', en: 'Light source behind the subject — creates silhouette or halo' },
  'aurora':                { ja: 'オーロラ。夜空に揺れる緑・紫・青のカーテン状の光', en: 'Aurora borealis — shimmering green and purple curtains in the night sky' },
  'global illumination':   { ja: '光の反射・散乱を物理的にシミュレートしたリアルな照明（GI照明）', en: 'Physically accurate lighting that simulates how light bounces between surfaces' },
  'studio lighting':       { ja: 'スタジオ撮影のような均一で計算された照明', en: 'Controlled, balanced lighting like a professional photo studio' },
  'cinematic lighting':    { ja: '映画のような劇的な照明。明暗のコントラストが強くなる', en: 'Dramatic movie-style lighting with strong contrast' },
  'warm lighting':         { ja: 'オレンジ・黄色系の暖かい色温度の照明。夕日・キャンドル・室内灯のような雰囲気', en: 'Orange or amber color temperature light — like sunset, candlelight, or a warm indoor lamp' },
  'cold lighting':         { ja: '青・白系の冷たい色温度の照明。月光・蛍光灯・冬の屋外のような雰囲気', en: 'Blue or white color temperature light — like moonlight, fluorescent, or winter outdoor scenes' },

  // ── エフェクト ────────────────────────────────────────────────
  'chromatic aberration':  { ja: '色収差。レンズのズレによる赤・青のフリンジ。グリッチ・ローファイ感が出る', en: 'Color fringing at edges from lens distortion — lo-fi or glitch aesthetic' },
  'film grain':            { ja: 'フィルム写真のようなざらざらしたノイズ感', en: 'Grainy texture simulating old photographic film' },
  'vignette':              { ja: '画面の四隅が暗くなるレトロなフォトエフェクト', en: 'Darkened corners — retro photo or film effect' },
  'halftone':              { ja: '印刷・スクリーントーンのようなドット表現。マンガ的な質感', en: 'Dot-pattern effect from print/screen printing — manga-like' },
  'scanlines':             { ja: '古いブラウン管テレビのような横縞のエフェクト', en: 'Horizontal line effect like an old CRT television' },
  'motion blur':           { ja: '動いている物体がブレる表現。スピード・躍動感が出る', en: 'Blurred streaks on moving objects — conveys speed and motion' },
  'lens distortion':       { ja: '魚眼・広角レンズのような画面の歪み', en: 'Barrel or fisheye distortion from a wide-angle lens' },
  'noise texture':         { ja: '画面全体にランダムなノイズ・ざらつきを加えるテクスチャ', en: 'Random visual noise layered over the image' },
  'silhouette':            { ja: 'キャラを黒塗りシルエットで描写。逆光・神秘的・スタイリッシュな演出に。認識率が非常に高い', en: 'Character rendered as a dark silhouette — dramatic backlit or mysterious compositions; very high recognition rate' },
  'magic circle':          { ja: '幾何学的な文様の魔法陣。召喚・魔法系の演出に', en: 'Geometric magical summoning circle' },
  'glowing tattoo':        { ja: '皮膚上で発光する文様・ルーン。魔法系キャラに映える', en: 'Luminous glowing markings or runes on skin' },

  // ── 背景 ──────────────────────────────────────────────────────
  'simple background':     { ja: '単色や最小限の背景。キャラを際立たせたいときに有効', en: 'Minimal background to keep focus entirely on the character' },
  'abstract background':   { ja: '具体的な場所でなく抽象的なパターン・色面の背景', en: 'Non-representational shapes and colors as background' },
  'gradient background':   { ja: 'グラデーションの背景。おしゃれでシンプルな印象', en: 'Smooth color-transition background' },
  'bokeh background':      { ja: '背景がボケた丸い光の玉が散らばる。ポートレート写真的', en: 'Blurred circular light orbs in background — portrait photography look' },
  'rooftop':               { ja: 'ビルや建物の屋上。青空・夜景・街並みと合わせやすい背景', en: 'Rooftop of a building — pairs well with city skyline or night view' },
  'dungeon':               { ja: '石造りの地下迷宮・牢獄。RPGファンタジー系の背景', en: 'Stone underground labyrinth or prison — fantasy RPG setting' },
  'alley':                 { ja: '建物の間の薄暗い路地裏。都市的・ノワール系の雰囲気', en: 'Narrow urban alleyway — moody city or noir atmosphere' },
  'ruins':                 { ja: '崩れた古代遺跡や廃墟。ファンタジー・廃墟世界系の背景', en: 'Crumbled ancient structures or abandoned buildings — fantasy or post-apocalyptic' },
  'castle':                { ja: '西洋式の城。塔・城壁・石造りの雄大な建築', en: 'Western-style medieval stone castle with towers and battlements' },
  'outer space':           { ja: '宇宙空間。星や惑星・銀河を背景にしたSF・ファンタジー系', en: 'Space setting with stars, planets, or galaxies — sci-fi or cosmic feel' },
  'underwater':            { ja: '水中・海中シーン。光の揺らめきや泡・サンゴの演出に', en: 'Submerged underwater scene with light rays, bubbles, and marine elements' },
  'throne room':           { ja: '玉座と豪華な内装の王室の間。権威・ファンタジー系の背景', en: 'Royal throne hall with ornate decor — regal or fantasy setting' },
  'nostalgic':             { ja: '懐かしい・郷愁を誘う雰囲気。夕暮れ・古い街並み・フィルム写真のようなトーン', en: 'Wistful, longing mood — evokes memories through warm faded tones and familiar settings' },
  'dark atmosphere':       { ja: '暗く重苦しい不穏な雰囲気。ホラー・ダーク・ヴィラン系シーンに', en: 'Oppressive, brooding mood — suits horror, dark fantasy, or villain-character scenes' },

  // ── 品質・安全 ────────────────────────────────────────────────
  'SFW':                   { ja: '安全なコンテンツを指定するタグ。過激な表現を除外し、ネガティブに「nsfw」を自動追加する', en: 'Safe For Work — keeps content appropriate for public use; auto-adds nsfw to negative prompt' },
  'rating:safe':           { ja: '同人サイト由来の安全評価タグ。露出なし・暴力なしの最高クリーン度を指定', en: 'Safety rating tag — no nudity or violence, highest clean rating' },
  'official art':          { ja: 'アニメ・ゲームの公式ビジュアル風の丁寧な仕上がりに誘導する', en: 'Steers output toward polished anime/game official illustration style' },
  'detailed background':   { ja: '背景を省略せず細部まで丁寧に描くよう誘導するタグ', en: 'Prompts the AI to render a fully detailed, non-lazy background' },
  'chibi':                 { ja: '2〜3頭身のデフォルメキャラ。SDキャラ（スーパーデフォルメ）とも呼ばれる', en: 'Super-deformed 2–3 head-height exaggerated style (also called SD)' },
  'flat design':           { ja: '影なし・グラデなしのシンプルなフラットカラー。アイコン・ポスター風', en: 'Minimal vector-like design with no shadows or gradients — icon or poster look' },
  'retro artstyle':        { ja: '90年代アニメ風のセル画塗り。鮮やかな色使い・独特のハイライト・手描き感が特徴。現在のAIイラスト界で大流行中', en: '1990s-era anime cel-shading style — vibrant colors, distinctive flat highlights, and nostalgic hand-drawn look' },
  'tarot card':            { ja: 'タロットカード風。アールヌーヴォー調の装飾的な縦長フレームで囲まれ、神秘的・芸術的な雰囲気に', en: 'Tarot card format — art nouveau decorative border framing the image, instantly mystical and ornate' },
  'soft shading':          { ja: '影の境界がなだらかなやわらかいグラデーションシェーディング', en: 'Gentle, diffuse shading with soft transitions between light and shadow' },

  // ── 髪型 ──────────────────────────────────────────────────────
  'wolf cut':              { ja: 'ウルフカット。段差をつけてランダムに切り込んだワイルドな外ハネスタイル', en: 'Layered shaggy haircut with wispy ends — edgy, wild texture' },
  'hime cut':              { ja: '姫カット。眉ラインで水平に揃えた前髪＋サイドを直線に切り揃えたお姫様風', en: 'Princess cut: straight-across bangs with straight side curtains framing the face' },
  'two side up':           { ja: 'ツーサイドアップ。後ろ髪を下ろしたまま両サイドだけを結ぶ王道アニメ髪型。ツインテールと異なり後ろ髪が垂れる', en: 'Side-only updo — back hair left down, only the sides tied up; distinct from twin tails' },
  'hair updo':             { ja: 'アップヘア。髪をまとめて上に束ねたスタイルの総称。うなじが露わになり、知的・色っぽい印象に', en: 'Hair gathered and pinned up — exposes the nape; gives an elegant or alluring impression' },
  'drill hair':            { ja: 'ドリルヘア（縦ロール）。コルクスクリュー状に巻いた螺旋ツインテール。お嬢様系キャラに多い', en: 'Tight corkscrew spiral curls, usually in twintails — classic ojou-sama/princess style' },
  'swept back hair':       { ja: '前髪をかき上げて後ろに流したスッキリスタイル。知的・クール系の印象に', en: 'Hair brushed back from the forehead — clean, cool, or intellectual look' },
  'layered hair':          { ja: 'レイヤーカット。段差をつけて動きと軽さを出したスタイル', en: 'Layered cut with varying lengths for volume and movement' },
  'spiky hair':            { ja: '先端が尖って立ちあがるとがり毛。少年漫画のバトル系キャラに多い', en: 'Sharp upward-pointing spikes — common in shonen battle-anime characters' },

  // ── メイク ────────────────────────────────────────────────────
  'blush stickers':        { ja: '頬に貼られたシール状のデコ頬紅。可愛い・あどけない印象を加える', en: 'Decorative sticker-style blush marks on cheeks — cute, innocent look' },
  'mole under eye':        { ja: '目の下の涙ぼくろ。色気・ミステリアスな印象を加える定番のポイント', en: 'Beauty mark / tear mole below the eye — adds allure or a mysterious quality' },
  'nose blush':            { ja: '鼻先まで広がった赤み。アニメ特有の照れ・幼さを強調する表現', en: 'Blush that extends over the nose — exaggerated anime-style shyness or innocence' },
  'glitter':               { ja: 'ラメ・グリッターのキラキラした輝き。フェス系メイクやファンタジー演出に', en: 'Sparkling glitter or shimmer effect — festive makeup or magical character look' },
  'sweatdrop':             { ja: 'こめかみに飛ぶアニメ的な汗マーク。困惑・ツッコミ・焦りなどコミカルなリアクションに使う', en: 'Anime-style sweat bead flying off the temple — used for comic awkwardness or nervous reactions' },
  'steam':                 { ja: '頭の上から蒸気が出るアニメ的演出。照れ・怒り・過熱した感情の定番コミカル表現', en: 'Steam rising from the head — classic anime shorthand for embarrassment, anger, or overexcitement' },

  // ── 種族・特殊 ────────────────────────────────────────────────
  'kemonomimi':            { ja: '獣耳を持つ人間キャラの総称。猫娘より広い概念でどの獣耳でも使える汎用タグ', en: 'Generic term for animal-eared human characters — broader than catgirl; covers any animal ear type' },
  'oni':                   { ja: '日本の鬼。角・金棒・虎柄の腰巻きが定番。赤鬼・青鬼など様々なバリエーション', en: 'Japanese demon/ogre with horns and a club — red or blue skin, tiger-stripe loincloth design' },
  'succubus':              { ja: 'サキュバス。悪魔の種族で人を誘惑する魔物。翼・角・尻尾が特徴', en: 'Succubus — seductive demon with wings, horns, and a spaded tail' },
  'lamia':                 { ja: 'ラミア。上半身が人間・下半身が蛇の半妖怪。スケールのあるシルエットが特徴', en: 'Half-human half-snake mythological creature with a serpentine lower body' },
  'tanuki':                { ja: 'タヌキ（狸）。日本の妖怪・伝説の動物。大きな耳・尻尾・腹太鼓が特徴', en: 'Japanese raccoon dog spirit with magical shapeshifting powers' },

  // ── 状態 ──────────────────────────────────────────────────────
  'wet':                   { ja: '体・衣装全体が濡れた状態。雨・水中・入浴後などのシチュエーションに', en: 'Character appearing soaked or dripping wet — rain, pool, or post-bath scenarios' },
  'wet clothes':           { ja: '濡れた服が体に張り付いた表現。素肌感や体のラインが強調される', en: 'Wet fabric clinging to the body — emphasizes body lines through soaked clothing' },
  'wet hair':              { ja: '濡れてまとまった髪。入浴後・雨の中など、しっとりした色気を出す', en: 'Hair damp and clinging together — suggests bath, rain, or post-swim; adds subtle sensuality' },

  // ── 素材・装飾 ───────────────────────────────────────────────
  'skintight':             { ja: '体のラインに密着した衣装の素材感。ボディスーツ・レオタードと相性が良い', en: 'Clothing that fits skin-tight, emphasizing every body line — pairs well with bodysuit or leotard' },
  'cleavage cutout':       { ja: '胸元部分を四角や丸く切り抜いたデザイン。谷間の露出を意図的に強調する', en: 'Opening cut into the chest area of an outfit — deliberately frames or exposes cleavage' },
  'navel cutout':          { ja: 'おへそ周辺を切り抜いたウィンドウデザイン。へそ出しより局所的なカット', en: 'Small window opening in clothing over the navel — surgical navel exposure in the design' },
  'open shirt':            { ja: 'シャツのボタンを外してはだけた状態。カジュアルな色気・無造作感を演出する', en: 'Shirt worn unbuttoned and open, revealing the chest — casual, effortless allure' },
  'torn clothes':          { ja: '戦闘・ダメージで破れた衣装。バトル後・緊迫シーンの演出に使う。認識率が高く効果が出やすい', en: 'Clothing torn or shredded — battle damage or dramatic scene; highly responsive tag in AI models' },
  'partially undressed':   { ja: '衣装を途中まで脱いだ状態。肩・胸・腰などが自然な形で露出する', en: 'Outfit partially removed — natural, non-forced skin exposure at shoulders, chest, or waist' },

  // ── アクセサリー ─────────────────────────────────────────────
  'thigh strap':           { ja: '太もも部分に巻きつけるベルトやストラップ。アクション系・セクシー系のアクセントに', en: 'Strap or band worn around the thigh — action, tactical, or sexy outfit accent' },
  'arm warmers':           { ja: '手首から肘にかけての袖なしカバー。フィンガーレスグローブより長い', en: 'Fabric sleeves covering the wrist to elbow with no attached gloves' },
  'anklet':                { ja: '足首につけるブレスレット。ビーチ・ボヘミアン・和装に合わせやすい', en: 'Bracelet worn around the ankle — beach, bohemian, or summer styling' },

  // ── フットウェア ─────────────────────────────────────────────
  'pumps':                 { ja: 'パンプス。ヒールがあり甲を覆う最もオーソドックスな女性用ドレスシューズ', en: "Classic women's heeled dress shoes with a closed toe and no straps" },
  'platform shoes':        { ja: '厚底シューズ。靴底全体が分厚く高さのある靴。原宿系・ゴスロリ系に人気', en: 'Shoes with an extra-thick platform sole — Harajuku or gothic lolita style' },
  'mary janes':            { ja: 'メアリージェーン。甲に横ベルトのある丸つま先のシンプルなフラット靴。幼い印象に', en: 'Round-toe flat shoes with a strap across the instep — girlish, classic schoolgirl look' },
  'loafers':               { ja: 'ローファー。紐なしのスリップオン式の革靴。制服・学生スタイルに', en: 'Slip-on leather shoes with no laces — school uniform or smart-casual style' },
  'thigh-high boots':      { ja: '太ももまで覆うロングブーツ。ニーソックスや絶対領域との組み合わせが定番', en: 'Boots that reach all the way up to the thigh — often paired with miniskirts' },
  'knee-high boots':       { ja: '膝まで覆うロングブーツ', en: 'Boots reaching up to the knee' },
  'platform boots':        { ja: '靴底が特別に厚いブーツ。ゴスロリ・パンク・原宿系ファッションの定番', en: 'Boots with an extra-thick platform sole — goth, punk, or Harajuku fashion' },
  'leg warmers':           { ja: '足首から膝にかけてのカバー。ダンス・80年代ファッション・防寒用など幅広く使われる', en: 'Thick fabric tubes worn on the lower legs — dance, retro 80s, or cold-weather styling' },
  'zettai ryouiki':        { ja: '絶対領域。ミニスカートの裾とニーソックス上端の間に見える太もも素肌の通称。7:4:3（スカート:素肌:靴下）がゴールデン比とされる', en: 'The strip of bare thigh between a miniskirt hem and thigh-highs — "absolute territory"; 7:4:3 golden ratio' },

  // ── 持ち物・武器 ─────────────────────────────────────────────
  'holding fan':           { ja: '扇子（または団扇）を手に持つポーズ。和風・中華風・貴族系に映える', en: 'Holding a folding or flat fan — Japanese, Chinese, or aristocratic aesthetic' },
  'holding lantern':       { ja: '提灯やオイルランタンを手に持つ。和風・中世・ゴシック系の雰囲気に', en: 'Holding a paper lantern or oil lantern — historical, gothic, or Japanese ambiance' },

  // ── ポーズ ────────────────────────────────────────────────────
  'seiza':                 { ja: '正座。膝を揃えて足の甲の上に座る日本の伝統的な座り方。和風シーンに映える', en: 'Traditional Japanese sitting posture — kneeling with shins on the floor; suits Japanese settings' },
  'floating':              { ja: '地面から浮かんでいるポーズ。魔法・念力・霊体などの演出に', en: 'Character hovering above the ground — implies magic, psychic power, or supernatural nature' },
  'arms behind head':      { ja: '両腕を頭の後ろで組むポーズ。脇を見せる定番構図。リラックス・余裕・自信ある雰囲気に', en: 'Both arms raised and clasped behind the head — relaxed, confident pose that exposes the underarms' },
  'arms up':               { ja: '両腕を頭上に向けて挙げるポーズ。万歳・ストレッチ・降伏・興奮など幅広い状況に使える汎用タグ', en: 'Both arms raised overhead — versatile pose for cheering, stretching, surrender, or excitement' },
  'contrapposto':          { ja: 'コントラポスト。体重を片足に乗せ、腰と肩のラインを逆方向に傾けたS字立ちポーズ。認識率が高く自然な色気が出る', en: 'Classic contrapposto stance — weight on one leg, hips and shoulders counter-tilted into an S-curve; high recognition rate' },
  'looking over shoulder': { ja: '片方の肩越しに視線を送るポーズ。艶やか・謎めいた後ろ半振り向きの定番演出', en: 'Glancing back over one shoulder — alluring, mysterious partial-turn pose' },
  'split':                 { ja: '両脚を180度に開いた開脚ポーズ。柔軟性・ダンス・バトル系のキャラに映える', en: 'Legs spread 180° flat on the ground — showcases flexibility; suits dancers or fighters' },
  'pinup':                 { ja: 'ピンナップポスター風のポーズ。レトロ・官能的でエレガントな魅せ方。50年代のイラスト文化に由来', en: 'Classic pin-up poster pose — retro, alluring, and elegant; inspired by 1940s–50s poster art style' },

  // ── 手・指 ────────────────────────────────────────────────────
  'finger heart':          { ja: '親指と人差し指を交差して作る小さなハートジェスチャー。韓国のアイドル文化から広まった', en: 'Small heart shape made by crossing thumb and index finger — popularized by Korean idol culture' },
  'hand heart':            { ja: '両手で大きなハートを作るジェスチャー。愛情・ファンサービスの表現', en: 'Large heart formed with both hands together — affectionate fan-service gesture' },
  'pinky out':             { ja: '小指だけ立てたジェスチャー。上品さ・繊細さ・お嬢様らしさを表現する', en: 'Pinky finger extended — suggests elegance or refinement' },
  'finger to cheek':       { ja: '頬に人差し指を当てるしぐさ。考え中・甘え・可愛らしさの表現', en: 'Index finger pressed to the cheek — thinking, coy, or sweetly endearing expression' },
  'finger to lips':        { ja: '唇に人差し指を当てる「シー」のポーズ。秘密めかした・ミステリアス・妖艶な印象に', en: '"Shh" gesture with finger over lips — secretive, mysterious, or seductive nuance' },
  'head tilt':             { ja: '首をかしげるポーズ。かわいらしさ・疑問・甘えを表すアニメの定番しぐさ', en: 'Head tilted to one side — expresses curiosity, cuteness, or coy flirtation; classic anime gesture' },

  // ── 品質補足（ツール別）──────────────────────────────────────
  'very aesthetic':        { ja: 'NovelAI v3専用の品質向上タグ。美しさ・審美性を全体的に引き上げる。他のAIでは効果薄', en: 'NovelAI v3–specific tag that boosts overall aesthetic quality — limited effect outside NAI3' },
  'amazing quality':       { ja: 'NovelAI v3での最高品質タグ。他のAIでの「最高傑作タグ」に相当する', en: 'NAI3-specific top quality tag — equivalent to masterpiece but tuned for NovelAI v3' },
  'extremely detailed':    { ja: '超精細な描写を要求する仕上げタグ。高品質モデルで特に有効', en: 'Requests even finer detail than ultra-detailed — most impactful on high-quality models' },

  // ── アートスタイル補足 ───────────────────────────────────────
  'light novel illustration': { ja: '日本のライトノベルの表紙・挿絵のような透明感ある細密なアニメ絵柄', en: 'Style matching Japanese light novel cover/insert art — clean, detailed anime with translucent coloring' },
  'game cg':               { ja: 'ビジュアルノベルやギャルゲーのイベント画像風。精密な陰影と滑らかな塗りが特徴', en: 'PC visual novel or game event CG style — precise shading and polished smooth coloring' },
  'ukiyo-e':               { ja: '江戸時代の浮世絵スタイル。輪郭線＋平塗り＋和風の構図。北斎・広重風', en: 'Edo-period Japanese woodblock print style — bold outlines, flat color, Hokusai/Hiroshige aesthetic' },
};
