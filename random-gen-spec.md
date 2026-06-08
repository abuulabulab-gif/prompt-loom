# LOOM ランダム生成システム 設計書

> 対象ファイル: `src/hooks/useRandomGen.js`, `src/utils/randomLayers.js`, `src/data/constants.js`, `src/data/conflicts.js`, `src/data/blocks.js`
> 最終更新: 2026-06-09（v2.5）

---

## 1. ブロック構成（タグプール）

ランダム生成の対象は `blocks.js` の `BLOCKS_DEF` に定義された以下のブロック。

| ブロックID | 名前 | 主なカテゴリ |
|-----------|------|------------|
| `quality` | 基本品質 | 品質, 仕上がり, 顔精細化, セーフティ |
| `artstyle` | 作風 | スタイル, 色調, レンダリング |
| `attribute` | キャラ | 年齢感, 種族, 性別・人数, ケモ耳・しっぽ・角, 幻想パーツ |
| `face` | 顔・表情 | 髪色, 髪型, 前髪, 目の色, 目つき, 眉, 表情, 口, 髪飾り, メイク |
| `body` | キャラ・体型 | 体型, 体型・骨格, 胸のサイズ, 肌色, 肌質感, 細部, ボディフォーカス, 状態, 足 |
| `outfit` | 衣装 | ジャンル, トップス, ボトムス, フットウェア |
| `outfit_detail` | 衣装ディテール | シルエット・形状, 素材・生地, 柄・装飾, 着脱・動作, 装飾アクセ |
| `effect` | 効果 | 魔法・オーラ, パーティクル, 天候・自然, 演出フィルタ |
| `composition` | 構図 | カメラ距離, カメラ角度, ポーズ, 手・指, 視線・演出, シチュ, 武器・小物 |
| `background` | 背景 | シンプル, 屋外, 屋内, 時間・天気, 季節・世界観, 雰囲気 |
| `lighting` | 照明 | 光源, 照明スタイル |
| `negative` | ネガティブ | **ランダム生成対象外** |

---

## 2. タグ分類システム

### 2-1. タグ属性フラグ

| フラグ | 宣言方法 | 意味 |
|--------|---------|------|
| 通常タグ | `tt('en', 'ja')` | ランダム生成対象（フル確率） |
| レアタグ | `ttr('en', 'ja')` | 通常タグが存在しない場合 or 20%確率で抽選 |
| 除外タグ | `excludeFromRandom: true` | ランダム生成から完全除外（手動専用） |

### 2-2. Tier3タグ（`TIER3_TAGS`）

ランダム生成で確率0%。コンボルール経由でのみ追加可能。

主なカテゴリ:
- ボディフォーカス系: `cleavage`, `sideboob`, `underboob`, `midriff`, `abs`, `thighs`, `bare thighs`, `navel` 等
- 足フォーカス: `soles`, `toes`, `foot focus`, `toenail polish`, `barefoot`
- 極端なポーズ: `all fours`, `split`, `lying on back`, `lying on stomach`, `on side`
- 極端な表情: `crying`, `tongue out`, `tongue between teeth`, `licking lips`
- センシティブアクセ: `collar`, `garter belt`
- タトゥー: `tattoo`, `arm tattoo`, `back tattoo`
- 手動専用フォーマット: `tarot card`, `character sheet`, `multiple views` 等

---

## 3. ランダム生成モード

### 3-1. chardesign（キャラ特化）モード

- **対象**: 顔・髪・体型・衣装・特徴パーツ中心
- **省略**: 構図・背景は最小限（`full body` または `portrait` 程度）
- **用途**: オリキャラのデザイン作業

### 3-2. illust（イラスト）モード

- **対象**: 上記に加えてポーズ・背景・ライティングも含めた全体生成
- **用途**: 1枚絵のシーン生成

### モード切替

`localStorage.loom_randomMode` に `'chardesign'` / `'illust'` を保存。
`useRandomGen` フック内の `randomMode` state が管理。
CommandPaletteまたは設定から切替可能。

---

## 4. 種族コンボルール（`applyComboRules`）

種族タグが選ばれた場合、対応パーツを自動付与するルール。

| 種族 | 自動追加パーツ |
|------|-------------|
| catgirl / cat ears | cat tail, paw pads |
| fox girl / fox ears | fox tail |
| bunny ears | bunny tail |
| wolf ears | wolf tail |
| dog ears | dog tail |
| elf / dark elf | elf ears |
| angel | angel wings, halo |
| demon | demon horns, demon wings, demon tail |
| dragon girl | dragon horns, dragon tail, scale skin |
| mermaid | mermaid tail, fin ears (30%確率) |
| lamia | lamia tail |
| harpy | feathered wings |
| fairy | fairy wings |
| oni | oni horns |
| demi-human | ランダムな動物耳＋対応しっぽ |

---

## 5. カラーメーカー連携（`applyColorMakerLayer`）

`src/utils/randomLayers.js` の `applyColorMakerLayer` が管理。

### ATTR_ACCENT_RULES テーブル

ランダムで種族パーツの色を設定する際のルール定義。
新しいアクセントターゲットは `ATTR_ACCENT_RULES` に追加するだけでよい。

```js
const ATTR_ACCENT_RULES = [
  { attr: 'cat ears',    target: 'ear',    chance: 0.7 },
  { attr: 'cat tail',    target: 'tail',   chance: 0.7 },
  // ...
];
```

---

## 6. コンフリクト検出との連携

ランダム生成の最終ステップでコンフリクトチェックを実行。
矛盾するタグが検出された場合、どちらかを除去して矛盾ゼロを保証。

使用: `CONFLICT_MAP`（`src/data/conflicts.js` からimport）
`CONFLICT_MAP` = `tag → Set<競合tag>` の逆引きMap。

---

## 7. ロック保護

`block.locked === true` のブロックはランダム生成対象外。
ユーザーが固定したい設定（LoRA対応の顔など）を守るための機能。

---

## 8. レイヤー構成（`randomLayers.js`）

`src/utils/randomLayers.js` に4つのレイヤー関数を分離。

| 関数 | 役割 |
|------|------|
| `applyOutfitStackPenalty` | 衣装タグの過剰スタックを抑制 |
| `applyColorMakerLayer` | 種族パーツへの色付け（ATTR_ACCENT_RULES駆動） |
| `applyFeatureMakerLayer` | 特徴メーカーと同ロジックでパーツを付与 |
| `applyAtmosphereLayer` | 雰囲気・ライティング・背景の調整 |

---

## 9. データフロー

```
generateRandomChar()
  ↓
ブロック別タグプール生成（BLOCKS_DEF + フラグフィルタ）
  ↓
性別判定 → 男性の場合は胸サイズ・女性向け衣装タグを除外
  ↓
種族コンボルール（applyComboRules）
  ↓
randomLayers適用（Outfit / Color / Feature / Atmosphere）
  ↓
コンフリクトチェック（CONFLICT_MAP）
  ↓
blocks へ反映（updateBlock）
```
