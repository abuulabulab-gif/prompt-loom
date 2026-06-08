# LOOM 自然文生成・プロンプト逆解析 仕様書

> 実装コード: `src/utils/naturalLanguage.js`, `src/utils/aiApi.js`, `src/Loom.jsx`
> 最終更新: 2026-06-09（v2.5）

---

## 1. 自然文生成（Non-AIモード）

### 目的・コンセプト

AIイラストのタグ羅列プロンプトを、**人間が読める自然言語の描写文**に変換する。
用途は「キャラクター設定の言語化」「AIへのリファレンス送付」「prompt-loom.com 外でのシェア」など。

### 出力先

出力エリアの `自然文` タブに表示。JA/EN 切替ボタンあり。

### 実装ファイル

- `src/utils/naturalLanguage.js` — テンプレートベース変換（AI不使用）
- `src/utils/aiApi.js` — AI polish（オプション：APIキー設定時のみ動作）

---

### 1-A. テンプレート変換ロジック（AI不使用）

#### 処理概要

```
blocks → getBlock(id) でブロックごとに選択中タグを取得
       → JA/EN の固定テンプレートに当てはめて文章化
```

#### `getBlock(blocks, id)` の動作

1. 対象ブロックの `text` を `splitTags` → `bareTag` で正規化
2. 各 en タグを `block.cats` 内の定義から `{en, ja}` オブジェクトに解決
3. 解決できなかったタグ（カスタムタグ等）は除外

#### 日本語テンプレート（`toNaturalJa`）

```
{artstyle}の作風で、
{charAttrs}・{face}・{body}の{subject}が、
{outfit}を身に纏い、
{feature}を持ち、
{composition}のポーズで、
{background}を背景に、
{lighting}の光の下、
{effect}のエフェクトが加わっています。
```

| ブロック | 結合方法 | 末尾助詞 | 備考 |
|---------|---------|---------|------|
| artstyle | `・` | `の作風で、` | |
| attribute（subject除く） + face + body | `・` | `の{subject}が、` | subject = 1girl/1boy等 |
| outfit | `・` | `を身に纏い、` | |
| outfit_detail | `・` | `（ディテール）` | 衣装素材・形状 |
| feature | `・` | `を持ち、` | 武器・小物・アクセ等すべて同じ助詞 |
| composition | `・` | `のポーズで、` | |
| background | `・` | `を背景に、` | |
| lighting | `と` | `の光の下、` | |
| effect | `・` | `のエフェクトが加わっています。` | |

**特殊処理:**
- `jaBodyTag()`: 胸関連タグに限り「胸が大きめ」のように名詞プレフィックスを付与
- 末尾処理: 最終パーツの末尾 `、` → `。` に変換
- 空ブロックは文中から除外

#### 英語テンプレート（`toNaturalEn`）

```
{style} illustration of {subject} with {charAttrs, face, body}.
Dressed in {outfit}.
Featuring {feature}.
{composition}.
{background}, {lighting}.
Visual effects: {effect}.
```

---

### 1-B. AI polish（オプション）

設定でAPIキー登録時のみ動作。

| 項目 | 内容 |
|------|------|
| 発火タイミング | 自然文タブへの切替時（自動）or 🔄ボタン（手動） |
| 入力 | `toNaturalJa/En` が生成した文章 |
| 処理 | AIがより自然な描写文に整形（意味は変えない） |
| 出力 | `aiResult` state に保存、`displayNaturalText = aiResult || naturalText` |
| 対応プロバイダー | OpenAI（gpt-4o-mini）、Claude（claude-haiku-4-5-20251001） |
| AIクリア | `✕` ボタンで `aiResult` を空に戻す |

**SYSTEM_POLISH プロンプト方針（JA）:**
> 意味・内容を変えず、余分な説明を加えず、読みやすい描写文に整える

---

### 1-C. 現状の制限・改善余地

| # | 問題 | 影響 | 改善案 |
|---|------|------|--------|
| 1 | `feature` が一律「〜を持ち」 | ピアス・タトゥー・眼鏡等でも「持ち」になり不自然 | 武器系→「手に〜を持ち」、装飾系→「〜を身に着け」、小物系→「〜を携え」等のカテゴリ判定 |
| 2 | カスタムブロックが完全無視 | ユーザーの自由入力が自然文に反映されない | カスタムブロックを末尾にそのまま追記する fallback |
| 3 | カスタムタグが無視（`getTagLabels`で解決できないと除外） | ユーザーが手動入力したタグが消える | 未解決タグを `{en}（独自タグ）` としてフォールバック出力 |
| 4 | 全ブロックが `・` 結合で単調 | 「セーラー服・ミニスカ・ニーハイ」が美しくない | コンテキスト別結合：2個以下→「と」、3個以上→「、…、と」など |
| 5 | 構図の助詞が一律「のポーズで」 | 「wide shot・distant view のポーズで」は不自然 | composition は「構図で」と「ポーズで」を文脈で切り替え |
| 6 | EN が文構造最弱（Dressed in / Featuring の繰り返し） | AIなしだと機械的すぎる | EN にも context-aware sentence builder を導入 |
| 7 | DALL-E 使用時は自然文タブが自動選択されるが AI polish は手動 | UX の一貫性 | DALL-E 選択時の AI polish を自動実行オプション化 |

---

## 2. プロンプト逆解析（Analyze モード）

### 目的・コンセプト

他ツールや過去のプロンプトを LOOM に「読み込む」機能。外部プロンプトを貼り付けると、**LOOM のタグデータベースに存在するタグがブロック内でハイライト**表示され、クリックで即座に選択できる。

### 起動方法

- ヘッダーの `◎ 解析` ボタン（出力エリアと連動して展開）
- キーボードショートカット: `A`
- コマンドパレット（Ctrl+K）からも起動可能

---

### 2-A. 解析ロジック

```
入力: analyzeText（ユーザーが貼り付けた外部プロンプト文字列）
出力: ブロック内の各タグにハイライト表示（analyzed フラグ）
```

#### 解析パネルの UI フロー

```
1. ◎ 解析ボタン → analyzeOpen: true → 出力エリア下に textarea 展開
2. ユーザーが外部プロンプト貼り付け → analyzeText にセット
3. analyzeText が全 BlockCard に props として渡される
4. 各 TagBtn が analyzed={hasTag(analyzeText, tag.en) && !hasTag(block.text, tag.en)} を受け取る
5. analyzed=true のタグは緑色ハイライトで表示（未選択の場合のみ）
6. ユーザーが緑タグをクリック → 通常の onTagClick と同じ挙動で選択
7. ブロックヘッダーに「◎ N」バッジ（N = そのブロックの一致数）
8. 解析パネルのヘッダーに総一致数を表示
```

#### `analyzed` フラグの条件

```
analyzed = hasTag(analyzeText, tag.en) && !hasTag(block.text, tag.en)
```
- **analyzeText に含まれている** かつ **まだブロックに選択されていない** タグが緑ハイライト
- 既に選択済みのタグは通常の active 表示（緑ハイライトは出ない）

#### `hasTag` の動作（ウェイト除去）

`hasTag` は内部でウェイト記法 `(tag:1.2)` を正規化してから比較するため、NAI/SD の重み付きプロンプトにも対応している。

---

### 2-B. 現状の制限・改善余地

| # | 問題 | 影響 | 改善案 |
|---|------|------|--------|
| 1 | 一括適用ボタンがない | 一致タグが30件あれば30回クリック必要 | 「解析結果を一括追加」ボタン：analyzed=true のタグを全ブロックに自動追加 |
| 2 | LOOMデータベース外のタグが完全無視 | 「distorted background」等の独自タグが可視化されない | 解析パネルに「未認識タグ: N件」セクションを追加、タグ一覧表示 |
| 3 | 一致数バッジの計算ロジックが Loom.jsx のインライン式（複雑） | `analyzeText.split(',').some(seg => seg.trim().replace(...)...)` が冗長で壊れやすい | `countAnalyzeMatches(analyzeText, block)` ユーティリティに切り出す |
| 4 | NAI の `[tag]` 弱め記法に未対応 | NAI プロンプトの一部タグが一致しない | `hasTag` または解析前処理で `[tag]` → `tag` 正規化 |
| 5 | ブロックが一致数順にソートされない | 一致が多いブロックが画面下に埋もれる | analyze モード ON 時にブロック並び順を一致数降順に（元順は保持） |
| 6 | analyzeText の一致率サマリーが「N件一致」のみ | 「50タグ中30件認識」なのか「5タグ中3件認識」なのか判断できない | `{認識済み} / {analyzeText 総タグ数} 件一致（未認識 {M}件）` 形式に |
| 7 | 解析結果をプロンプトログに保存できない | 逆解析で復元したプロンプトをログ記録できない | analyze + 一括適用 → ログ記録ボタンのワークフロー整備 |
| 8 | カスタムブロックのタグと一致しても analyzed フラグが立たない | カスタムブロックのタグが逆解析できない | カスタムブロックの `customTags` も解析対象に含める |

---

## 3. 関連機能：自然文 → タグ変換（AI使用）

### 目的

逆方向：**自然言語の説明文 → LOOMブロックへのタグ自動振り分け**。プロンプト逆解析とは異なり、AIがタグを推論する。

### 実装

`src/components/modals/NaturalToTagsModal.jsx` + `callNaturalToTags` / `callImageToTags`

### 2モード

| モード | 入力 | API |
|--------|------|-----|
| テキストモード | 自由記述の説明文 | `callNaturalToTags` → GPT/Claude |
| 画像モード | イラスト画像（base64） | `callImageToTags` → GPT-4o-mini/Claude vision |

### フロー

```
入力文/画像 → AI → JSON {"face":["tag1"],"outfit":["tag2"],...}
           → 各ブロックに appendTag で追加
           → インポート件数トースト表示
```

### 現状の制限・改善余地

| # | 問題 | 改善案 |
|---|------|--------|
| 1 | AIが返したタグがLOOMのデータベースに存在しない場合、カスタムタグとして追加されず消える | 未存在タグはカスタムタグに自動登録するオプション |
| 2 | AI出力のJSONが壊れると `JSON.parse` がクラッシュするが、エラーメッセージが不親切 | try/catch でパース失敗時に生テキストを表示してユーザーに判断を委ねる |
| 3 | 画像モードで `detail: 'low'` 固定 | 精度と速度のトレードオフとして `high` オプション追加 |

---

## 4. 全体設計上の課題と改善提案

### A. 「自然文」と「逆解析」の非対称性

| 方向 | 機能 | AI依存 | 完成度 |
|------|------|--------|--------|
| タグ → 自然文 | toNaturalJa/En | 不要（テンプレート）| 動作するが文章が単調 |
| 自然文 → タグ | NaturalToTagsModal | 必須（GPT/Claude） | AI精度に依存 |
| 外部プロンプト → タグハイライト | Analyze モード | 不要 | 一括適用がなく手間 |
| 画像 → タグ | NaturalToTagsModal（画像） | 必須 | 動作するが精度可変 |

**改善提案:** 「逆解析の一括適用」を実装すれば、AI不使用で外部プロンプトを LOOM に取り込む完全なパスが完成する。

### B. `callAI` の polish に使うモデルの選定

現状 `gpt-4o-mini` / `claude-haiku-4-5-20251001`。自然文 polish 程度のタスクなら Haiku で十分だが、`callNaturalToTags` と `callImageToTags` は精度重視なら Sonnet 以上が望ましい。

### C. APIキー管理

APIキーがフロントエンドの state（`localStorage` 経由）に保存されており、ブラウザから直接 API を叩く構造。セキュリティリスクについて利用者への明示が必要。

---

## 5. デバッグ時の確認観点

### 自然文
- [ ] 全ブロック空 → `（プロンプトが空です）` と表示
- [ ] subject なし（属性ブロック空）→ 「キャラクターが、」にフォールバック
- [ ] body に breast 系タグ → 「胸が大きめ」等の名詞プレフィックス付与
- [ ] JA/EN 切替でテキスト変化
- [ ] AI polish ボタンが apiKey なしで非表示

### 逆解析
- [ ] 貼り付けプロンプトのタグが既選択の場合は緑ハイライトが出ない（analyzed=false）
- [ ] ウェイト付き `(tag:1.2)` が正規化されて一致する
- [ ] `◎ N` バッジが正しい件数を表示
- [ ] `A` キーで開閉できる
- [ ] 解析パネル閉じると `analyzeText` がリセットされ緑ハイライトが消える
