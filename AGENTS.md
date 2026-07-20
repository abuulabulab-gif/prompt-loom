# LOOM App — AI Work Guide

## 概要
AI向けイラストプロンプト管理Webアプリ（prompt-loom.com）。
Vite + React 18 + Tailwind CSS + Dexie（IndexedDB）+ PWA。

---

## ディレクトリ構成

```
src/
├── Loom.jsx                  ← メインコンポーネント（全状態管理）
├── storage.js                ← IndexedDB 読み書き（Dexie）
├── data/
│   ├── blocks.js             ← BLOCKS_DEF：全ブロック定義（タグ含む）
│   ├── constants.js          ← uid, toggleTag, countTags 等ユーティリティ
│   ├── tools.js              ← AIツール定義（MJ/NAI/SD/Flux/DALL-E）
│   ├── templates.js          ← プリセットテンプレート
│   ├── conflicts.js          ← タグ競合チェックルール
│   ├── colors.js             ← カラーピッカー用データ
│   ├── expressions.js        ← 表情プリセット
│   └── negSuggestions.js     ← ネガティブ提案データ
├── components/
│   ├── BlockCard.jsx         ← 1ブロック分のUI（タグ一覧、強度、折りたたみ）
│   ├── TagBtn.jsx            ← タグボタン（★ピン留め、アクティブ状態、競合表示）
│   ├── GlobalTagSearch.jsx   ← 全ブロック横断タグ検索モーダル
│   ├── CommandPalette.jsx    ← Ctrl+K コマンドパレット
│   ├── CharVersions.jsx      ← キャラバージョン管理
│   ├── PresetChip.jsx        ← 衣装・構図プリセットチップ
│   └── modals/
│       ├── SettingsModal.jsx ← 設定・バージョン履歴・非表示ブロック復元
│       ├── HistoryModal.jsx  ← スナップショット履歴
│       ├── TemplateModal.jsx ← テンプレート適用
│       ├── ColorPickerModal.jsx
│       ├── SceneComposeModal.jsx
│       └── ComparePanel.jsx
├── CharacterNote/
│   ├── index.jsx             ← キャラノートタブ切り替え
│   ├── ProfileSheet.jsx      ← キャラ設定シート（10セクション＋カスタム項目）
│   ├── PromptLog.jsx         ← プロンプトログ
│   ├── TagMap.jsx            ← タグ対応表
│   ├── PromptLogEntry.jsx
│   └── RecordModal.jsx
├── hooks/
│   ├── useVariations.js      ← バリエーション生成（3種類）
│   ├── useOutputDrag.js      ← 出力エリアのリサイズドラッグ
│   ├── useCloudSync.js       ← クラウド同期（pull/push/visibility）・設定変更検知
│   └── useRandomGen.js       ← ランダム生成（pickBlockTags・applyComboRules・generateRandomChar）
└── utils/
    └── naturalLanguage.js    ← 自然文生成（JA/EN）
```

### `data/conflicts.js` エクスポート
- `CONFLICT_RULES` — 競合ルール配列（detectConflicts が使用）
- `detectConflicts(text)` — テキスト内の競合タグ検出
- `CONFLICT_MAP` — ランダム生成用逆引きMap（`tag → Set<競合tag>`）、useRandomGen が import して使用

---

## 主要な状態（Loom.jsx）

| 状態 | 型 | 説明 |
|------|----|------|
| `characters` | Character[] | 全キャラデータ（ブロック含む） |
| `activeCharId` | string | 現在選択中のキャラID |
| `blocks` | Block[] | `activeChar.blocks`の参照 |
| `visibleBlocks` | Block[] | hiddenBlocks・simpleMode フィルタ済み |
| `isMobile` | boolean | `vw < 600` |
| `expertMode` | boolean | `viewMode === 'expert'` |
| `simpleMode` | boolean | `viewMode === 'simple'` |
| `mainTab` | 'editor'｜'note' | エディタ⇄キャラノート切替 |
| `outputTab` | 'positive'｜'negative'｜'natural' | 出力タブ |
| `jumpOpen` | boolean | スマホ用サイドバー開閉 |
| `hiddenBlockIds` | Set<string> | `activeChar.hiddenBlocks`から生成 |

### フックが管理する状態（Loom.jsx では宣言しない）

| フック | 管理する値 |
|--------|------------|
| `useCloudSync` | `syncStatus`, `syncErrToast`, `dataSizeToast`, `handleSignIn`, `isApplyingRemoteSettings` |
| `useRandomGen` | `randomMode`, `setRandomMode`, `generateRandomChar` |

### Loom.jsx のセクション順序（目安）
1. imports（~35行）
2. `mergeCharacterBlocks()` ユーティリティ関数
3. `export default function Loom()` — state宣言（~130行）
4. `activeChar` / `blocks` 導出
5. **`useCloudSync` / `useRandomGen` フック呼び出し**
6. storage load/save useEffect（IndexedDB）
7. ブロック・キャラ操作ヘルパー（updateBlock, handleBlockUpdate, addCustomBlock …）
8. キャラ管理ヘルパー（addCharacter, deleteCharacter …）
9. 出力計算（posText, negText, finalPosText …）
10. History / Keyboard shortcuts
11. `return (...)` JSX

---

## キャラクターデータ構造

```js
{
  id: string,
  name: string,
  color: string,
  emoji: string,
  blocks: Block[],          // ブロック配列（順序維持）
  hiddenBlocks: string[],   // 非表示ブロックのID配列
  versions: Version[],      // バージョン履歴（最大10件）
  loras: Lora[],
  profile: ProfileData,     // キャラ設定シートデータ
  memo: string,
  costumePresets: Preset[],
  shotPresets: Preset[],
}
```

## ブロックデータ構造

```js
{
  id: string,               // 'face' | 'body' | 'outfit' | ... | カスタムはuid
  name: string,             // 日本語名
  nameEn: string,           // 英語名
  icon: string,
  color: string,            // ブロックの識別色
  text: string,             // 現在選択中のタグ（カンマ区切り）
  strength: string,         // '1.0' | '1.1' | '1.2' | '0.9' | '0.8'
  enabled: boolean,
  locked: boolean,
  collapsed: boolean,
  favTags: string[],        // ピン留めタグ（en名）
  customTags: string[],
  cats: Category[],         // タグカテゴリ配列
  isCustomBlock?: boolean,  // カスタムブロックフラグ
}
```

---

## 命名・実装ルール

- **タグの操作**: `toggleTag`, `appendTag`, `countTags`, `splitTags`, `bareTag` を `constants.js` から使用
- **ブロック更新**: `updateBlock(blockId, { key: val })` — Loom.jsx内のヘルパーを必ず使う
- **キャラ更新**: `updateChar(charId, { key: val })`
- **ブロック非表示**: `toggleHideBlock(blockId)` — `activeChar.hiddenBlocks`配列を操作
- **スタイル**: Tailwind CSS + CSS変数（`rgb(var(--surface))` 等）を使用。インラインstyle はcolor・border等の動的値のみ
- **isMobile**: `vw < 600`。レスポンシブ分岐は常にこのフラグで判定

---

## CSS変数（テーマ）

```css
--surface      /* カード背景 */
--surface-alt  /* 薄いアクセント背景 */
--border       /* 通常の境界線 */
--dim          /* 薄い境界線・無効色 */
--muted        /* 補助テキスト */
--text         /* メインテキスト */
--fg           /* フォアグラウンド */
--bg           /* ページ背景 */
```

---

## よくある作業パターン

### ブロックにフィールドを追加する
1. `blocks.js` の該当ブロックの `cats` 配列に `tt('en', 'ja')` で追加
2. 既存キャラには `mergeCharacterBlocks()` により自動的に反映される

### 新しいブロック定義を追加する
1. `blocks.js` の `BLOCKS_DEF` 配列に追加
2. `naturalLanguage.js` で新ブロックIDを使う場合は `getBlock(blocks, 'newId')` を追加
3. `simpleMode` で表示したい場合は `SIMPLE_BLOCK_IDS` に追加

### スマホ/PC 分岐
```jsx
{isMobile ? (
  /* スマホ向けUI */
) : (
  /* PC向けUI */
)}
```

### モーダルを追加する
- `z-index` は既存のレイヤーに注意: output bar=100, sidebar=201, モーダル=300
- 背景クリックで閉じる: `onClick={e => e.target === e.currentTarget && onClose()}`

---

## フェーズ管理

- **フェーズ2完了**: 基本UI・スマホ/PC出力バー・ブロック非表示・キャラノート・バリエーション・ARチップ
- **次フェーズ候補**: スマホARチップ、タグ補足tooltip（ENモード）、クイックプリセット

---

## 注意点

- `window.confirm` / `window.prompt` はスマホで標準ダイアログが出る（意図的）
- `favTags`（ピン留め）はBlockCard内に専用エリアとして既に実装済み
- `collapsed` はキャラデータに自動保存される（手動保存不要）
- バリエーション生成数は3（`useVariations.js`の `v < 3`）
- カスタムブロック上限: スマホ3 / PC5（`addCustomBlock`内で判定）
