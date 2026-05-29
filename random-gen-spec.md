# LOOM ランダム生成システム 設計書

**対象ファイル:** `src/hooks/useRandomGen.js`, `src/data/constants.js`, `src/data/conflicts.js`, `src/data/blocks.js`
**最終更新:** 2026-05-29

---

## 1. ブロック一覧（タグプール構造）

ランダム生成の対象は `blocks.js` の `BLOCKS_DEF` に定義された以下のブロック。

| ブロックID | 名前 | カテゴリ数 | 主なカテゴリ |
|-----------|------|-----------|------------|
| `quality` | 基本品質 | 4 | 品質, 仕上がり, 顔精細化, セーフティ |
| `artstyle` | 作風 | 3 | スタイル, 色調, レンダリング |
| `attribute` | キャラ | 4 | 年齢感, 種族, 性別・人数, 特殊パーツ |
| `face` | 顔・表情 | 11 | 髪色, インナーカラー, 髪型, 前髪, 目の色, 目つき・形, 眉, 表情, 口・歯, 髪飾り, メイク |
| `body` | キャラ・体型 | 8 | 体型, 胸サイズ, 肌色, 肌質感, 細部, ボディフォーカス, 状態, 足 |
| `outfit` | 衣装 | 6 | ジャンル, トップス, ボトムス, 素材装飾, 装飾アクセ, フットウェア |
| `feature` | 特徴・アクセ | 3 | ピアス・刺青, 装備・ケア, 武器・小物 |
| `effect` | 効果 | 4 | 魔法・オーラ, パーティクル, 天候・自然, 演出フィルタ |
| `composition` | 構図 | 7 | カメラ距離, カメラ角度, ポーズ, 手・指, 視線演出, シチュ, シート資料 |
| `background` | 背景 | 5 | シンプル, 屋外, 屋内, 時間・天気, 季節・雰囲気 |
| `lighting` | 照明 | 2 | 光源, 照明スタイル |
| `negative` | ネガティブ | 3 | ランダム生成対象外 |

---

## 2. タグ分類システム

### 2-1. タグ属性フラグ

| フラグ | 宣言方法 | 意味 |
|--------|---------|------|
| 通常タグ | `tt('en', 'ja')` | ランダム生成対象（フル確率） |
| レアタグ | `ttr('en', 'ja')` / `rareInRandom: true` | 通常タグが存在しない場合 or 20%確率で抽選 |
| 除外タグ | `excludeFromRandom: true` | ランダム生成から完全除外（手動専用） |

### 2-2. Tier 3 タグ（`TIER3_TAGS`）

ランダム生成で確率0%。コンボルール経由でのみ追加可能。

主なカテゴリ:
- ボディフォーカス系: `cleavage`, `sideboob`, `underboob`, `midriff`, `bare thighs`, `leg focus`, `wide hips` など
- 足フォーカス: `soles`, `toes`, `foot focus`, `toenail polish`
- 極端なポーズ: `all fours`, `split`, `lying on back`, `lying on stomach`, `on side`
- 極端な表情: `crying`, `drunk`, `saliva`, `tongue out`, `tongue between teeth`, `licking lips`
- センシティブアクセ: `collar`, `garter belt`
- タトゥー: `tattoo`, `arm tattoo`, `back tattoo`
- 手動専用フォーマット: `tarot card`
- 種族専用パーツ（コンボ経由のみ）: `ball joints`, `cybernetics`, `scale skin`, `translucent skin`, `liquid body`, `porcelain skin`

### 2-3. Tier 2 ブロック（`TIER2_BLOCK_IDS`）

ブロック単位で inclusion に確率がかかる。

| ブロック | モード | inclusion確率 |
|---------|--------|-------------|
| `lighting` | illust | 80%（skip確率20%） |
| `lighting` | chardesign | 0%（常にスキップ） |
| `effect` | illust | 80% |
| `effect` | chardesign | 0%（常にスキップ） |

### 2-4. カテゴリ選択確率（`OPTIONAL_CAT_NAMES`）

| 区分 | 選択確率 | 対象カテゴリ例 |
|------|---------|--------------|
| コアカテゴリ | 100% | 品質, 髪色, 髪型, 体型, 肌色, スタイルなど |
| オプションカテゴリ | 40% | インナーカラー, 前髪, 目つき形, 眉, 口, メイク, 状態, 足, 武器・小物など |
| レアオプション（`RARE_OPT_CAT_NAMES`） | 15% | 肌質感, ピアス・刺青, 装備・ケア |

### 2-5. 武器タグ（`WEAPON_TAGS`）

カテゴリ選択率40% × WEAPON_PICK_PROB(30%) = 実質**約12%**でランダム出現。

対象: `holding sword`, `holding spear`, `holding dagger`, `holding knife`, `holding shield`, `holding staff`, `holding wand`, `holding bow`, `holding gun`, `holding rifle`

---

## 3. ランダム生成アルゴリズム

### 3-1. ブロック単位の処理（`pickBlockTags`）

```
1. BLOCK_RANDOM_RULES の exclusiveGroups を処理
   → グループ内のカテゴリのうち1つのみ有効化（ランダム選出）
   → background: [シンプル, 屋外, 屋内] のいずれか1つ
   → outfit: ジャンルが選ばれたら トップス/ボトムス をスキップ

2. コアカテゴリを全件順に処理 → 各1タグ選択
3. オプションカテゴリをシャッフルして確率で処理

4. 各カテゴリの選択ロジック:
   - validT = タグ一覧から除外タグ・TIER3・globalExcluded を除いたリスト
   - normalT = validT のうち rareInRandom でないもの
   - rareT  = validT のうち rareInRandom のもの
   - normalT が空なら rareT から選択
   - rareT が存在し Math.random() < 0.20 なら rareT から選択
   - それ以外は normalT からランダム選択

5. 武器タグが選ばれた場合、追加で Math.random() > 0.30 なら不採用
6. 採用されたタグの競合タグを globalExcluded に追加
7. skipIfPicked ルールに従い後続カテゴリをスキップ

8. maxPicks = min(2 + floor(cats.length / 3), 6) で上限制御
```

### 3-2. カラーカテゴリの特別処理

`face_haircolor`（髪色）と `face_eyecolor`（目の色）は専用ロジックで処理。

**目の色**: 10%確率でオッドアイ（ヘテロクロミア）になり、異なる色相グループから2色を選んで `"{色1} and {色2} eyes, heterochromia"` を生成。

**カラー生成ロジック**:
- `COLOR_PALETTE`（全色）からランダム選択
- シェード確率: normal 65% / light 20% / dark 15%
- `buildColorTag(shade, color, target)` で英語タグ生成

### 3-3. コンボルール適用（`applyComboRules`）

全ブロックのタグを走査し、トリガータグが存在すれば対象ブロックにタグを追加。

| トリガー | 追加先 | 追加タグ | 確率 |
|---------|--------|---------|------|
| `holding sword/spear/dagger/knife/bow/gun/rifle/shield` | composition | `fighting stance` | 100% |
| `mermaid` / `mermaid tail` | background | `underwater` | 100% |
| `mermaid` / `mermaid tail` / `underwater` | lighting | `caustics` | 100% |
| `rainy` | effect | `rain` | 100% |
| `snowy` | effect | `snowfall` | 100% |
| `night` / `starry sky` | lighting | `moonlight` | 100% |
| `magical girl` | effect | `magic circle` | 100% |
| `bikini` / `micro bikini` | body | `cleavage` | 100% |
| `swimsuit` | body | `bare back` | 100% |
| `beach` | body | `barefoot` | 100% |
| `rainy` | body | `wet hair` | 100% |
| `action` | composition | `fighting stance` | 100% |
| `slime girl` | body | `translucent skin`, `liquid body` | 100% |
| `doll` | body | `porcelain skin` | 100% |
| `oni` | body | `red skin` | 25% |
| `demon` | body | `blue skin` | 25% |
| `dragon girl` / `monster girl` | body | `red skin` | 10% |
| `elf` / `dark elf` | body | `grey skin` | 25% |
| `barefoot` | body | `toenail polish` | 25% |

### 3-4. 種族パーツ自動付与（`buildSpeciesText`）

種族タグが選ばれた場合、`SPECIES_PARTS_MAP` に従い特殊パーツを自動追加。

| 種族 | 自動追加パーツ |
|------|-------------|
| elf / dark elf | elf ears |
| angel | angel wings, halo |
| demon | demon horns, demon tail, demon wings |
| fairy | fairy wings |
| mermaid | mermaid tail |
| dragon girl | dragon horns, dragon tail, scale skin |
| catgirl | cat ears, cat tail |
| oni | oni horns |
| doll | ball joints |
| android | cybernetics |
| kemonomimi | `KEMONOMIMI_PAIRS` からランダム1セット（cat/fox/wolf/dog/bunny/cow 耳+しっぽ） |
| human | 10%確率でケモ耳セット付与 |

### 3-5. ポストプロセス：シンプル背景検出

background に `white background`, `simple background`, `gradient background`, `bokeh background`, `abstract background` のいずれかがある場合 → `effect` と `lighting` ブロックをクリア（illustモードのみ）。

---

## 4. 生成モード

### 4-1. illust モード（デフォルト）

一枚絵向けドラマチックな生成。

- `quality`: `masterpiece, best quality, ultra-detailed, highres, absurdres`
- `artstyle`, `background`, `composition`: ランダム通常選択
- `lighting`, `effect`: 80%で包含（Tier2）
- 構図/照明/エフェクトにブースト確率70%（ドラマチックタグ優先）
- 除外タグ: `white background`, `simple background`, `gradient background`, `concept art`, `character design` など
- シンプル背景が選ばれた場合 → lighting/effect を強制クリア

**ブーストタグ一覧（70%優先）:**

| ブロック | ブーストタグ |
|---------|------------|
| 構図 | `dutch angle`, `from below`, `from above`, `low angle`, `high angle`, `dynamic angle`, `bird's eye view`, `over the shoulder`, `extreme close-up`, `close-up` |
| 照明 | `cinematic lighting`, `dramatic lighting`, `rim lighting`, `god rays`, `neon lights`, `golden hour`, `backlight`, `spotlight`, `moonlight`, `caustics`, `studio lighting`, `sunset light` |
| エフェクト | `particle effects`, `magic circle`, `sparkles`, `petals`, `leaves`, `rain`, `snowfall`, `fire`, `embers`, `electricity`, `lens flare`, `bloom`, `chromatic aberration`, `fog`, `mist`, `bokeh` |

### 4-2. chardesign モード（キャラ設定資料特化）

設定画・資料向けの厳格モード。

| ブロック | 処理方式 |
|---------|---------|
| quality | 固定: `masterpiece, best quality, ultra-detailed, highres, sharp focus` |
| artstyle | 固定: `illustration, character design, flat color, cel shading, vibrant colors, hard shading` |
| background | 固定: `white background, simple background` |
| composition | 固定: `full body, front view, standing` |
| lighting | 常にクリア（生成対象外） |
| effect | 常にクリア（生成対象外） |

**顔ブロック制限:**
- スキップカテゴリ: 口・歯
- 許可表情のみ: `smile`, `light smile`, `expressionless`, `smirk`, `serious`, `sleepy`, `determined`, `shy`, `embarrassed`, `wink`, `blushing`, `pout`
- メイク・顔演出: 物理的個性タグのみ（`fang`, `freckles`, `mole under eye`）
- 髪飾り・毛流れ: `floating hair` を除外

**体型ブロック制限:**
- スキップカテゴリ: 状態, ボディフォーカス, 肌質感

**特徴ブロック制限:**
- スキップカテゴリ: 武器・小物

**コンボルール制限:**
- `fixedBlocks` に登録されたブロック（quality/artstyle/background/composition/effect/lighting）はコンボルールによる変更不可

---

## 5. 競合解決システム

### 5-1. CONFLICT_MAP（ランダム生成用）

タグ選択時に `globalExcluded` に追加される逆引きMap。`warn`レベルと3タグ以上の複合ルールは除外。

**主な競合グループ:**

| カテゴリ | 競合例 |
|---------|-------|
| 年齢・体型 | loli ↔ mature female/adult/young adult、tall ↔ short stature、slim ↔ chubby/curvy |
| 胸サイズ | flat chest ↔ huge/large/medium breasts |
| 髪の長さ | short hair ↔ long hair/very long hair/hair past waist |
| 口 | open mouth ↔ closed mouth |
| 表情 | smile ↔ expressionless/serious/angry |
| ポーズ | lying ↔ standing/jumping/running、all fours ↔ standing |
| カメラ距離 | close-up ↔ full body/wide shot、portrait ↔ full body/wide shot |
| カメラ角度 | from above ↔ from below、front view ↔ back view |
| 時間・照明 | day ↔ night、sunlight ↔ night、warm lighting ↔ cold lighting |
| 場所 | indoors ↔ outdoors |
| アートスタイル | monochrome ↔ vibrant colors/colorful/neon colors、realistic ↔ anime/cel shading/pixel art |

### 5-2. RANDOM_EXCLUSION_RULES（除外ルール）

タグ採用後に globalExcluded へ追加される除外セット。

| トリガー | 除外対象 |
|---------|---------|
| `extreme close-up`, `close-up`, `face close-up`, `portrait`, `bust shot`, `upper body`, `cowboy shot` | フットウェア全般、下半身タグ全般、歩き/走り/跳びポーズ |
| `mermaid`, `lamia` | フットウェア全般、スカート/パンツ類全般 |
| `barefoot` | フットウェア全般（靴・ソックス類） |
| `underwater` | fire, explosion, embers, electricity, lightning, lens flare, god rays, sparkles |
| `outer space` | rain, snowfall, wind, mist, fire, explosion, sunlight |
| `lying on back/stomach` | standing, walking, running, jumping, fighting stance |
| `all fours`, `seiza`, `sitting cross-legged` | standing, jumping, running, fighting stance |
| `smile`, `grin`, `laughing` | crying, sad, angry, expressionless など |
| `crying`, `angry`, `expressionless` | smile, grin, laughing, wink, excited など |
| `pixel art` | depth of field, bokeh, smooth shading, painterly, bloom |
| `monochrome` | vibrant colors, colorful, neon colors, warm colors, cool colors, pastel colors |
| `flat chest` | large breasts, huge breasts, cleavage, sideboob |
| `back view` | smile, grin, open mouth, cleavage, sideboob |
| `doll/robot/android` | sweat, blush, tears, crying, saliva |
| ケモ耳系 | demon horns, oni horns, halo と相互排他 |
| angel/demon wings | 他翼と相互排他 |
| 肌色（porcelain/translucent/red/blue/grey skin） | 他の肌色タグ全て |

---

## 6. 全タグ数サマリー

| ブロック | カテゴリ数 | タグ総数（概算） |
|---------|-----------|----------------|
| quality | 4 | 約20 |
| artstyle | 3 | 約50 |
| attribute | 4 | 約60 |
| face | 11 | 約150 |
| body | 8 | 約70 |
| outfit | 6 | 約120 |
| feature | 3 | 約40 |
| effect | 4 | 約40 |
| composition | 7 | 約110 |
| background | 5 | 約80 |
| lighting | 2 | 約25 |
| negative | 3 | 約30 |
| **合計** | **60** | **約800** |

---

## 7. 生成フロー全体図

```
generateRandomChar(mode)
  │
  ├─ [各ブロックを順に処理]
  │    │
  │    ├─ locked/negative → スキップ
  │    ├─ Tier2ブロック → mode別skip確率
  │    ├─ quality → mode別固定テキスト
  │    ├─ chardesign固定ブロック → 直接代入
  │    └─ 通常ブロック → pickBlockTags() or pickBlockTagsBoosted()
  │         │
  │         ├─ exclusiveGroups でカテゴリ絞り込み
  │         ├─ コア/オプション分類 → 確率で選択
  │         ├─ カラーカテゴリ → buildColorTag/pickHeterochromiaPair
  │         ├─ 通常タグ選択 (normal/rare 比率)
  │         ├─ 武器タグ → WEAPON_PICK_PROB フィルタ
  │         └─ globalExcluded 更新 + skipIfPicked 適用
  │
  ├─ attribute: buildSpeciesText() で種族パーツ自動付与
  │
  ├─ applyComboRules() → トリガー検出 → タグ追記
  │
  └─ [illustのみ] シンプル背景検出 → lighting/effect クリア
```
