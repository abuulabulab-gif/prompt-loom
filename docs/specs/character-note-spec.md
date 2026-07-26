# キャラノート機能 仕様書

> prompt-loom.com — AIイラストプロンプト管理アプリ
> 対象バージョン: v2.5（2026-06-09現在）

---

## 概要

「キャラノート」は、キャラクターごとに紐付く3タブ構成のサブ機能。
メインのエディタとは独立したビュー（`mainTab === 'note'`）として表示される。

```
src/CharacterNote/
├── index.jsx           タブ切替 (profile / log / tagmap)
├── ProfileSheet.jsx    設定シート（10セクション + カスタム項目）
├── PromptLog.jsx       プロンプトログ（一覧 + 操作）
├── PromptLogEntry.jsx  ログ1件分のUI
├── TagMap.jsx          タグ対応表
└── RecordModal.jsx     手動記録モーダル
```

### データ格納先

すべてキャラクターオブジェクト（IndexedDB）の中に格納。
クラウド同期（Firestore）にも含まれる。

| フィールド | 型 | 用途 |
|---|---|---|
| `char.profile` | `{ [sectionId]: { [fieldKey]: string }, customFields: CustomField[] }` | 設定シートデータ |
| `char.promptLog` | `LogEntry[]` | プロンプトログ |
| `char.tagMap` | `TagMapRow[]` | タグ対応表 |

---

## 1. 設定シート（ProfileSheet）

### 目的

キャラの設定・外見・口調・衣装などをメモする参照用シート。
AIプロンプト作成時のリファレンスとして使う。

### セクション構成（全10 + カスタム）

| セクションID | アイコン | 日本語名 | デフォルト開閉 |
|---|---|---|---|
| `basic` | 📌 | 基本情報 | **開** |
| `appearance` | 🎨 | 外見設定 | **開** |
| `speech` | 💬 | 話し方・感情 | 閉 |
| `lifestyle` | 🏠 | 生活スタイル | 閉 |
| `background` | 📖 | 背景・設定 | 閉 |
| `relations` | 🤝 | 人間関係 | 閉 |
| `worldview` | 🌍 | 世界観・設定 | 閉 |
| `outfit_notes` | 👗 | 衣装メモ | 閉 |
| `prompt_notes` | 🧵 | プロンプトメモ | 閉 |
| `misc` | 📝 | その他メモ | 閉 |
| `custom` | ➕ | カスタム項目 | — |

### カスタム項目

`customFields: CustomField[]` に自由な項目を追加可能。

```ts
type CustomField = {
  id: string,
  label: string,
  value: string,
}
```

### データ保存タイミング

各フィールドの `onBlur` または `onChange` でキャラクターオブジェクトを更新。
IndexedDB への保存はデバウンス処理あり（`saveState`）。

---

## 2. プロンプトログ（PromptLog）

### 目的

プロンプトの生成履歴をキャラクターごとに記録・管理する。

### ログ1件のデータ構造

```ts
type LogEntry = {
  id: string,           // uid()
  timestamp: number,    // Date.now()
  positive: string,     // ポジティブプロンプト
  negative: string,     // ネガティブプロンプト
  tool: string,         // 使用AIツール (mj / nai / sd / flux / dalle)
  memo: string,         // ユーザーメモ
  tags: string[],       // タグ（手動付与）
  image?: string,       // サムネイル（base64、オプション）
}
```

### 記録タイミング

- **自動記録**：コピーボタンを押したとき（プロンプトが空でない場合）
- **手動記録**：RecordModal からの手動保存

### 上限

明示的な上限なし（ユーザーが手動削除可能）

---

## 3. タグ対応表（TagMap）

### 目的

キャラ固有のタグとその意味・用途を対応表形式で管理する。

### データ構造

```ts
type TagMapRow = {
  id: string,
  tag: string,       // タグ（英語プロンプト）
  label: string,     // 表示名（日本語可）
  note: string,      // メモ
}
```

### 用途例

| タグ | 表示名 | メモ |
|------|--------|------|
| `crimson ribbon` | 赤いリボン | アイデンティティアイテム |
| `white coat` | 白衣 | 医者設定のときのみ使用 |

---

## 4. ナビゲーション

キャラノートはメイン画面右上の **📋 ノート** ボタン（`mainTab === 'note'`）で切替。

エディタに戻るには **🧩 エディタ** ボタン（`mainTab === 'editor'`）。

---

## 5. データ同期

- **ローカル（IndexedDB）**: `saveState()` により自動保存
- **クラウド（Firestore）**: `useCloudSync` フックが変更を検知して自動push
- キャラクターオブジェクト全体がまとめて同期されるため、ノートデータも自動的に含まれる
