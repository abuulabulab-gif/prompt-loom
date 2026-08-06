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
│   ├── templates.js          ← プリセットテンプレート（apply=上書き/merge、mute=一時OFF指定）
│   ├── cutouts.js            ← カットメーカー用データ（CUTOUT_GROUPS、対象=outfit_detail）
│   ├── asymmetry.js          ← 左右メーカー用データ（ASYM_GROUPS・部位7グループ・入れ先ブロック別）
│   ├── changelog.js          ← ★更新履歴の一次ソース（設定画面表示＋npm run roadmapでROADMAP転記）
│   ├── extraTags.js          ← 追加タグ定義
│   ├── conflicts.js          ← タグ競合チェックルール
│   ├── makerCover.js         ← メーカー置き換え（stripMakerBase/applyMakerTags/isTagActive）
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
│       ├── GroupMakerModal.jsx   ← ✂️🌓共通のグループメーカー（configで変身＝cutouts.js/asymmetry.jsのCUTOUT_MAKER/ASYM_MAKER。2026-08-06に2枚を一本化）
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
│   ├── useColorPicker.js     ← メーカー適用の共通口（applyColorTag/Feature/Material/Cutout/Asymmetry）
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
- **v2.7〜v2.9＝リリース済み**（2026-08-06現在。内容の一次ソース＝`ROADMAP.md`。v2.9＝🌓左右メーカー・破綻チェック左右系・健康診断強化）。旧「v2.7作業中」の細目はROADMAP v2.7の項へ畳んだ（2ヶ所に持たない）
- **タグ棚の憲法（ABUU 2026-07-06）**: むやみに静的タグを追加しない。色×部位/素材×衣服のような組み合わせタグはメーカー（既存・改修・新設）で合成する。静的タグを追加する場合はタグ辞書（tagDictionary.js）への登録必須。メーカー生成タグの日本語は各resolver（FEATURE_TAG_JA / resolveMaterialLabel / resolveColorLabel）に必ず対応させる（チップ表示と自然文の両方が参照）
- **ブロック＝基礎、メーカー＝制御（ABUU 2026-07-06・レイヤー設計の原則）**: 基礎タグ（リボン・タトゥー・包帯・眼鏡…「何を付けるか」）はブロックに置く。それを**どうするか**（位置・左右・掛け方・素材・色）の制御はメーカーが担う＝「こだわるならの設計」。体の複数箇所に付けられるもの（多位置アイテム）は特徴メーカーの品揃えに追加していく。単一位置の装飾（チョーカー等）はタグのままでよい。メーカーのoptionsに使う英語はDanbooruに実在するタグを優先（造語は票が入らない）
- **次フェーズ候補**: スマホARチップ、タグ補足tooltip（ENモード）、クイックプリセット
- **キャラ一貫性の後日枠（2026-07-06合意）**:
  1. ~~一貫性監査の拡張~~ **✅ v2.9で実装（2026-08-06）**＝健康診断に素体の抜け（肌色・身長感＝まとめて1件の注意。シグネチャ特徴は狼少年化するので見送り）・ブロック間の同タグ重複・全体タグ過密（46以上）を追加
  2. 素体コピー — ベース（tmplBase）の内容だけをワンクリックでクリップボードへ（他AIへの持ち出し用）

---

## プリセット束（v2.7・costumePresets/shotPresets）

- 要素の形: `{ id, name, text, bundle?, negAdd?, memo? }`（旧形式＝textのみの要素も互換動作）
- `bundle` = `{ blockId: text }`。保存時に `PRESET_BUNDLE`（Loom.jsx）の対象ブロックを同梱：
  衣装＝outfit_detail込み／構図＝background・lighting・effect込み。適用で各ブロックにtext復元＋enabled:true
- `negAdd` = 適用時にネガブロックへ追記するタグ（例：衣装の禁止タグ sideless outfit）
- `memo` = 構造ノート（タグにできない指定を記録）。チップに📝表示・title tooltipで閲覧、⋯メニューから編集
- タグの並び順はブロックtextごと保存されるため、隣接補強（素材タグを服タグ直後に置く等）が束ごと再現される

## テンプレートのベース機構（v2.5）

- テンプレ初適用時、全ブロックの `text`＋`enabled` を `character.tmplBase` に自動記録（IndexedDB永続）。
- 復帰：`restoreTemplateBase()`（全体）／ブロック⟲（12秒バッファ優先→ベースにフォールバック）／`saveTemplateBase()`（📌再記録）。
- テンプレ定義の `mute: ['blockId']` は該当ブロックを**削除せず** `enabled:false` に（タグ温存・出力のみ除外）。フォーカス系＝body/outfit/outfit_detail、シート系＝effect/lighting に設定済み。
- ランダム生成の性別比は `useRandomGen.js` の `pickRandomGenderEn()`（女78/男14/男の娘5/中性3）。変更はここ一箇所。

## 注意点

- `window.confirm` / `window.prompt` はスマホで標準ダイアログが出る（意図的）
- `favTags`（ピン留め）はBlockCard内に専用エリアとして既に実装済み
- `collapsed` はキャラデータに自動保存される（手動保存不要）
- バリエーション生成数は3（`useVariations.js`の `v < 3`）
- カスタムブロック上限: スマホ3 / PC5（`addCustomBlock`内で判定）
