# LOOM データ移行システム仕様書

> 実装コード: `src/Loom.jsx` (`mergeCharacterBlocks`), `src/storage.js`, `src/data/blocks.js`
> 最終更新: 2026-06-09（v2.5）

---

## 1. 概要・目的

アプリのアップデートで `BLOCKS_DEF`（タグ定義）に変更が加わっても、  
**ユーザーの既存データ（選択済みタグ・設定）を失わずに**新しい定義を反映する仕組み。

対象の変更例:
- 新しいブロックを追加（例: `lighting` ブロックを新設）
- 既存ブロックに新カテゴリ・新タグを追加
- タグの `ja` 名称を修正

---

## 2. `mergeCharacterBlocks` の動作

```js
// src/Loom.jsx L42–69
function mergeCharacterBlocks(savedBlocks) {
  const defById = Object.fromEntries(BLOCKS_DEF.map(def => [def.id, def]));
  const processedIds = new Set();

  const merged = (savedBlocks || []).map(saved => {
    if (saved.isCustomBlock) return saved;       // カスタムブロックはそのまま保持
    const resolvedId = LEGACY_BLOCK_IDS[saved.id] ?? saved.id;  // 旧IDを新IDに変換
    const def = defById[resolvedId];
    if (!def) return null;                        // 廃止ブロック → 削除（nullでフィルタ）
    processedIds.add(saved.id);
    return {
      ...deep(def),                              // 最新BLOCKS_DEFの全フィールドを採用
      text:       saved.text       ?? def.text,  // ユーザーデータで上書き
      enabled:    saved.enabled    !== false,
      strength:   saved.strength   ?? def.strength,
      locked:     saved.locked     ?? false,
      favTags:    saved.favTags    ?? [],
      customTags: saved.customTags ?? [],
      collapsed:  saved.collapsed  !== undefined ? saved.collapsed : def.collapsed,
      catStates:  saved.catStates  ?? {},
    };
  }).filter(Boolean);

  // BLOCKS_DEF に新規追加されたブロック（保存データにないもの）を末尾に追加
  const newBlocks = BLOCKS_DEF
    .filter(def => !processedIds.has(def.id))
    .map(def => deep(def));

  return [...merged, ...newBlocks];
}
```

### 処理フロー

```
IndexedDB から savedBlocks をロード
        ↓
mergeCharacterBlocks(savedBlocks)
        ↓
 ┌──────────────────────────────────────────┐
 │ savedBlocks の各ブロックを処理            │
 │  isCustomBlock → そのまま保持             │
 │  def が存在しない → null（後で除外）       │
 │  def が存在する →                        │
 │    deep(def) でタグ定義を最新化           │
 │    ユーザーフィールドで上書き             │
 └──────────────────────────────────────────┘
        ↓
 BLOCKS_DEF の新規ブロックを末尾追加
        ↓
 キャラクター.blocks として使用
```

---

## 3. 保持されるフィールド vs 最新定義で上書きされるフィールド

### ユーザーデータとして保持されるフィールド

| フィールド | 説明 |
|-----------|------|
| `text` | 選択済みタグ（カンマ区切り） |
| `enabled` | ブロック有効/無効 |
| `strength` | ブロック強度（1.0〜1.2等） |
| `locked` | ロック状態 |
| `favTags` | ピン留めタグ配列 |
| `customTags` | ユーザーが手動追加したタグ |
| `collapsed` | 折りたたみ状態 |
| `catStates` | カテゴリ折りたたみ状態 |

### 最新 BLOCKS_DEF で上書きされるフィールド

| フィールド | 説明 | 理由 |
|-----------|------|------|
| `cats` | タグカテゴリ定義（タグ一覧） | 新タグ追加を即座に反映するため |
| `name` / `nameEn` | ブロック名 | 名称変更を反映するため |
| `icon` | アイコン | 変更を反映するため |
| `color` | ブロックカラー | 変更を反映するため |

---

## 4. 呼び出しタイミング

```
// Loom.jsx の loadState useEffect 内
const saved = await loadState();
const loadedChars = (saved?.characters ?? []).map(char => ({
  ...char,
  blocks: mergeCharacterBlocks(char.blocks),   // ← 毎回マージ
}));
```

- **アプリ起動時（IndexedDBロード後）** に毎回実行
- **クラウドからのpull後** にも同様に実行（`setCharacters` のコールバックは
  `mergeCharacterBlocks` を呼ぶ）
- バリエーションからの復元（`applyVariant`）時にも実行

---

## 5. `deep(def)` の役割

```js
// constants.js（概略）
export const deep = obj => JSON.parse(JSON.stringify(obj));
```

`BLOCKS_DEF` の定義オブジェクトを**深いコピー**する。  
これがないと全キャラクターが同じ `cats` 配列の参照を共有してしまい、  
1キャラクターの変更が他のキャラクターに波及するバグが起きる。

---

## 6. カスタムブロックの扱い

```js
if (saved.isCustomBlock) return saved;  // そのまま保持
```

カスタムブロック（`isCustomBlock: true`）は `BLOCKS_DEF` に定義がないため、  
マージ処理をスキップして保存データをそのまま返す。  
カスタムブロックの上限はスマホ3個・PC5個（`addCustomBlock` 内で判定）。

---

## 7. IndexedDB と Firestore のスリム化

### `storage.js`（IndexedDB）

```js
// saveState で保存されるもの
{
  characters: chars,   // mergeCharacterBlocks 前の raw データが保存される
  // ... settings
}
```

IndexedDB には `cats` も含む完全なデータが保存される。  
ロード後に `mergeCharacterBlocks` で最新定義と統合する。

### `firestore.js`（クラウド同期）

```js
const slimVersionBlock = (b) => {
  const { cats, lastRandomPicks, ...rest } = b;  // cats と lastRandomPicks を除去
  return rest;
};
```

クラウドへの push 時、各ブロックから `cats` と `lastRandomPicks` を除去してサイズを削減。  
`cats` は pull 後の `mergeCharacterBlocks` で BLOCKS_DEF から再構築されるため不要。  
`lastRandomPicks` は揮発性UIステートなのでクラウド同期不要。

---

## 8. 現状の制限・改善余地

| # | 問題 | 影響 | 改善案 |
|---|------|------|--------|
| 1 | 廃止ブロックは無言でデータ消失 | `if (!def) return null` で消えるため、誤って廃止したとき気づきにくい | 開発時ログ `console.warn('Block removed:', saved.id)` を追加するだけで十分 |
| 2 | タグのen名称変更に未対応 | `text` には `en` 名で格納されているため、`en` 名を変更すると選択済みタグが無効になる | タグ名変更時は `en` を変えずに表示名を変えるルールを維持する必要がある |
| 3 | `catStates` のキーは `cat.name`（日本語）依存 | カテゴリ名を変更すると `catStates` が機能しなくなる（折りたたみ状態がリセット）| カテゴリにIDを付与し `catStates` をID参照に変更する（ただし影響大） |
| 4 | `mergeCharacterBlocks` が全キャラ・毎起動で実行 | キャラクター数が増えると起動時のマージコストが増加する | 実用上はキャラ数 <50 なので問題ないが、`BLOCKS_DEF` バージョンハッシュを保存して差分のみ再マージする最適化は将来的に検討可 |
| 5 | バリエーション履歴（`versions`）のブロックはマージされない | バージョン復元時に `mergeCharacterBlocks` が実行されるが、バージョン自体のブロックは旧定義のまま保存される | バージョン復元後に `mergeCharacterBlocks` が正しく動くため実害なし。ただしバージョン内のタグ一覧UIを表示する場合は注意が必要 |

---

## 9. BLOCKS_DEF 変更時の安全な手順

```
1. blocks.js で cats 配列に新タグを追加（安全: 次回起動で全キャラに反映）
2. blocks.js でブロックを新規追加（安全: mergeCharacterBlocks の末尾追加で全キャラに追加）
3. blocks.js でタグの ja 名称を変更（安全: cats が上書きされるため即反映）
4. blocks.js でタグの en 名称を変更（危険: text 内の古いen名が「未認識タグ」になる）
   → 代わりに旧en名を残したまま新タグを追加するか、マイグレーション関数を書く
5. blocks.js でブロックを削除（注意: 全キャラのそのブロックデータが消える）
   → 削除前にブロックの `enabled: false` のデフォルト化や非表示化を検討
```

---

## 10. デバッグ時の確認観点

- [ ] `blocks.js` に新タグ追加 → 既存キャラのそのブロックに新タグがUIに表示される
- [ ] `blocks.js` に新ブロック追加 → 既存キャラのブロックリスト末尾に新ブロックが出現
- [ ] 既存キャラの `text` に保存済みタグが消えていない
- [ ] カスタムブロックが失われていない
- [ ] `collapsed` 状態が保持されている（折りたたんで再起動しても折りたたまれている）
