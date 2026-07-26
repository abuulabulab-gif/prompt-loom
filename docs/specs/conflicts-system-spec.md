# LOOM 競合タグシステム 仕様書

> 実装コード: `src/data/conflicts.js`
> 最終更新: 2026-06-09（v2.5）

---

## 1. 概要・目的

タグ間の意味的矛盾（例: 「smile + serious」「short hair + very long hair」）を検出し、  
① UIで警告（赤ハイライト）、② ランダム生成で自動回避、の2用途に使う。

---

## 2. データ構造

### 2-A. `CONFLICT_RULES`（UI警告用）

```js
export const CONFLICT_RULES = [
  { tags: ['smile', 'expressionless'], ja: '笑顔と無表情が矛盾', en: 'smile + expressionless' },
  // ... ~400件
];
```

| フィールド | 型 | 説明 |
|-----------|---|------|
| `tags` | `string[]` | 矛盾するタグのペア（2個以上も可） |
| `ja` | `string` | 日本語の警告メッセージ |
| `en` | `string` | 英語の警告メッセージ |

**ヘルパー関数 `mk(a, bs, ja)`:**
```js
function mk(a, bs, ja) {
  return bs.map(b => ({ tags: [a, b], ja, en: `${a} + ${b}` }));
}
```
1対多の競合（例: `mermaid` × `thighhighs`, `shorts`, `skirt`, ... 25種）を簡潔に記述するための内部ヘルパー。

---

### 2-B. `CONFLICT_MAP`（ランダム生成用）

```js
export const CONFLICT_MAP = new Map();
for (const r of CONFLICT_RULES) {
  for (let i = 0; i < r.tags.length; i++) {
    const key = r.tags[i].toLowerCase();
    if (!CONFLICT_MAP.has(key)) CONFLICT_MAP.set(key, new Set());
    for (let j = 0; j < r.tags.length; j++) {
      if (i !== j) CONFLICT_MAP.get(key).add(r.tags[j].toLowerCase());
    }
  }
}
```

**`CONFLICT_RULES` から自動生成される逆引き Map。**  
- Key: タグ名（lowercase）  
- Value: そのタグと競合する全タグの `Set<string>`  
- 例: `'smile'` → `Set { 'expressionless', 'serious', 'angry', 'grin'... }`

---

## 3. 2つのデータ構造の使い分け

| | `CONFLICT_RULES` | `CONFLICT_MAP` |
|--|-----------------|----------------|
| 使用箇所 | `Loom.jsx` → `BlockCard.jsx` → `TagBtn.jsx` | `useRandomGen.js`, `useVariations.js` |
| 用途 | UIの赤ハイライト・警告テキスト | ランダム生成時の除外タグセット |
| 呼び出し方 | `detectConflicts(text)` | `CONFLICT_MAP.get(tag)` |
| 生成タイミング | モジュール読み込み時（静的） | `CONFLICT_RULES` から自動生成（同じくモジュール読み込み時） |

### `detectConflicts(text)` の動作

```js
export const detectConflicts = text => {
  const bares = splitTags(text).map(s => bareTag(s).toLowerCase());
  return CONFLICT_RULES.filter(r => r.tags.every(t => bares.includes(t.toLowerCase())));
};
```

全ブロックの `text` を結合して呼ばれ、マッチしたルールの配列を返す。  
`TagBtn` はこの結果を受け取り、自分のタグが競合リストに含まれていれば赤表示する。

---

## 4. ランダム生成での CONFLICT_MAP 利用

```js
// useRandomGen.js / useVariations.js の pickBlockTags / pickForBlock 内（概略）
const globalExcluded = new Set();

for (const pickedTag of picks) {
  const conflicts = CONFLICT_MAP.get(pickedTag.toLowerCase()) ?? new Set();
  for (const c of conflicts) globalExcluded.add(c);
}
// 以降の抽選では globalExcluded に含まれるタグをスキップ
```

タグを1つ選ぶたびに `CONFLICT_MAP` でその競合タグを `globalExcluded` に追加し、  
それ以降の抽選候補から除外することで矛盾なしのプロンプトを生成する。

---

## 5. 競合ルールのカテゴリ別件数（概算）

| カテゴリ | 代表例 | 件数（概算） |
|---------|--------|------------|
| 年齢・体型 | loli×mature, tall×short stature | 10件 |
| 胸サイズ | flat chest×huge breasts | 4件 |
| 髪の長さ | short hair×very long hair | 14件 |
| 髪型×長さ | very short hair×twin tails | 30件 |
| 口・表情 | open mouth×closed mouth, smile×expressionless | 10件 |
| ポーズ | lying×jumping, all fours×standing | 20件 |
| 人数 | solo×2girls | 8件 |
| カメラ距離・角度 | close-up×full body, from above×from below | 25件 |
| 時間・照明 | day×night, warm lighting×cold lighting | 12件 |
| 天候 | clear sky×rainy, lightning×clear sky | 5件 |
| 背景 | white background×cityscape | 24件 |
| アートスタイル | monochrome×vibrant colors, realistic×anime | 30件 |
| 種族×衣装（人魚・ラミア） | mermaid×thighhighs | 48件 |
| 性別×胸・衣装 | 1boy×dress, 1boy×large breasts | 40件 |
| 幼い体型×過激描写 | loli×huge breasts | 6件 |
| 衣装重ね着 | dress×pants, bodysuit×skirt | 40件 |
| 視点×ボディフォーカス | back view×cleavage | 6件 |
| 睡眠×視線 | sleeping×looking at viewer | 12件 |
| 環境×衣装 | snowy×bikini, underwater×fire | 12件 |
| 宇宙×屋内 | outer space×indoors | 4件 |
| 翼×衣装 | angel wings×jacket, dragon wings×shirt | 8件 |
| 天候×天候 | clear sky×stormy, sunny×blizzard | 6件 |
| **合計** | | **約420件** |

---

## 6. 設計上の重要な特性

### ① `CONFLICT_MAP` は `CONFLICT_RULES` から自動生成される

`CONFLICT_RULES` に新しいルールを追加すれば `CONFLICT_MAP` も自動的に更新される。  
**「CONFLICT_RULESとCONFLICT_MAPが別ファイルで定義されて同期が必要」という問題は存在しない。**  
両者は同一ファイル (`conflicts.js`) 内で、後者が前者から生成される関係。

### ② 同カテゴリ内のタグはランダム生成でそもそも共存しない

髪の長さ・髪型・口の開閉など、同じカテゴリ内のタグは `pickBlockTags` が1カテゴリから1タグしか選ばないため、ランダム生成での矛盾は原理的に発生しない。

`CONFLICT_RULES` コードにも明示:
```js
// ── 髪型 × 髪の長さ ───────────────────────────────────────────
// ※same-cat なのでランダム生成には影響しないが手動選択時の UI 警告として機能
```

つまり `CONFLICT_MAP` でこれらをカバーするのは **手動選択後の再抽選やランダム追加時**のセーフガードとして機能する。

---

## 7. 現状の制限・改善余地

| # | 問題 | 影響 | 改善案 |
|---|------|------|--------|
| 1 | 3タグ以上の複合矛盾に未対応 | 例: `snowy + indoor + bikini` を3点セットで警告できない | タグ3個以上の `tags` 配列ルールの追加（現状2個のみ） |
| 2 | 衣装×アクセサリーの競合が少ない | ハット×ポニーテールなど物理的矛盾が未登録 | 髪型×帽子カテゴリ等の追加検討 |
| 3 | 「soft conflict」がない | 完全矛盾（赤）と正常（無色）の2値しかない | 「組み合わせが不自然だが禁止ではない」を黄色警告で表現できると丁寧 |
| 4 | `detectConflicts` が全ブロック結合テキストで動く | background と face が別ブロックでも競合チェックできる。一方で意図的な使い方を誤検出する可能性がある | ブロックをまたいだ競合 vs 同ブロック内競合のスコア差分を将来検討 |
| 5 | 新種族（centaur, harpy等）の衣装競合が未登録 | mermaid/lamia 以外の足なし種族の矛盾チェックなし | 種族追加時に conflicts.js への追記が必要（設計上は追記で対応可能） |

---

## 8. デバッグ時の確認観点

- [ ] `smile` と `expressionless` を同時に選択 → TagBtn 赤ハイライト、競合警告テキスト表示
- [ ] `mermaid` と `skirt` を選択 → 赤ハイライト
- [ ] ランダム生成で `short hair` と `very long hair` が同時に出ない
- [ ] `CONFLICT_MAP.get('smile')` に `'expressionless'`, `'serious'`, `'angry'` が含まれる
- [ ] `mk()` ヘルパーで展開されたルールが正しくCONFLICT_RULESに含まれる
