# LOOM クラウド同期システム仕様書

> 実装コード: `src/hooks/useCloudSync.js`, `src/sync/firestore.js`
> 最終更新: 2026-06-09（v2.5）

---

## 1. 概要・目的

ユーザーがGoogleアカウントでサインインすると、プロンプトデータ（キャラクター全件）と設定を  
Firestore に自動同期する。複数デバイス・ブラウザ間でのデータ共有が目的。

---

## 2. アーキテクチャ

```
IndexedDB（ローカル永続）
    ↕ loadState / saveState（毎変更）
Loom.jsx の state（characters, settings）
    ↕ useCloudSync（自動 push/pull）
Firestore（クラウド）
  └── /users/{uid}/data/state（1ドキュメント）
```

- **ローカル永続**: Dexie（IndexedDB）。サインイン不要で常に機能。
- **クラウド同期**: Firestore。サインイン時のみ機能。ローカルと独立して動く。
- **競合解決**: last-write-wins（タイムスタンプ比較）。

---

## 3. Firestore ドキュメント構造

```js
// /users/{uid}/data/state
{
  characters: Character[],      // スリム化済み（cats・lastRandomPicksなし）
  characterOrder: string[],     // キャラIDの順序配列
  orderUpdatedAt: number,       // 並び替え操作のタイムスタンプ
  settings: {
    theme, lang, viewMode,
    activeTool, toolSuffixes, history,
  },
  settingsUpdatedAt: number,    // 設定変更のタイムスタンプ
  updatedAt: serverTimestamp(), // Firestore サーバー時刻
}
```

**設計上の制約**: ユーザーデータは1ドキュメントに全キャラを格納。  
Firestore の1ドキュメント上限 **1 MiB** に対し、`pushToCloud` は **900 KB** を警告閾値とする。

---

## 4. スリム化処理（push時のサイズ削減）

```js
// firestore.js
const slimVersionBlock = (b) => {
  const { cats, lastRandomPicks, ...rest } = b;
  return rest;
};

const toCloudChars = (chars) =>
  chars.map(c => {
    const { _thumbs, versions, promptLog, ...rest } = c;
    const slimVersions = (versions || []).map(ver => ({
      ...ver, blocks: (ver.blocks || []).map(slimVersionBlock),
    }));
    const slimPromptLog = (promptLog || []).map(entry => ({
      ...entry, blocks: entry.blocks ? entry.blocks.map(slimVersionBlock) : undefined,
    }));
    return { ...rest, versions: slimVersions, promptLog: slimPromptLog };
  });
```

| 除去フィールド | 理由 |
|--------------|------|
| `cats` | BLOCKS_DEF から pull 後に再構築可能 |
| `lastRandomPicks` | 揮発性UIステート |
| `_thumbs` | キャラサムネイル画像（IndexedDB 別テーブル管理） |

---

## 5. 同期トリガー

### プル（Firestore → ローカル）

| トリガー | 条件 | 実装 |
|---------|------|------|
| ログイン後 | `user?.uid` + `loaded` が揃ったとき | `useEffect([user?.uid, loaded])` |
| タブ/PWA復帰 | `visibilityState === 'visible'` かつ前回プルから **30秒以上** 経過 | `visibilitychange` イベント + `lastCloudPullAt.current` |

### プッシュ（ローカル → Firestore）

| トリガー | 遅延 | 実装 |
|---------|------|------|
| `characters` 変化 | **3秒デバウンス** | `useEffect([characters, orderUpdatedAt, settingsUpdatedAt])` |
| `orderUpdatedAt` 変化 | 同上 | 同上 |
| `settingsUpdatedAt` 変化 | 同上 | 同上 |

---

## 6. 競合解決（`mergeCharacters`）

```js
// firestore.js
export function mergeCharacters(local, remote, remoteOrder, localOrderAt, remoteOrderAt) {
  const map = new Map();
  for (const c of local) map.set(c.id, c);
  for (const rc of remote) {
    const lc = map.get(rc.id);
    if (!lc) {
      map.set(rc.id, rc);                                      // クラウドのみ → 追加
    } else {
      if ((rc.lastModified ?? 0) > (lc.lastModified ?? 0))
        map.set(rc.id, rc);                                    // クラウドが新しい → 上書き
      // ローカルが新しい or 同時 → ローカル維持（上書きしない）
    }
  }

  const useRemoteOrder = remoteOrder && (remoteOrderAt ?? 0) > (localOrderAt ?? 0);
  // 並び順: orderUpdatedAt が大きい方を採用
}
```

| ケース | 結果 |
|--------|------|
| ローカルにないキャラがクラウドにある | クラウドから追加 |
| クラウドにないキャラがローカルにある | ローカルを維持 |
| 両方に同IDのキャラがある | `lastModified` が大きい方を採用 |
| 並び順の競合 | `orderUpdatedAt` が大きい方を採用 |

**`lastModified` の更新**: `updateBlock` 等のキャラ変更関数が `character.lastModified = Date.now()` をセット。

---

## 7. 競合状態の防止

### ① プル中のプッシュ防止

```js
const isSyncingFromCloud = useRef(false);

// プル開始
isSyncingFromCloud.current = true;
// ... pull処理 ...
// プル完了
isSyncingFromCloud.current = false;

// プッシュ useEffect
if (!user || !loaded || isSyncingFromCloud.current) return;  // ← プル中はスキップ
```

### ② リモート設定適用によるループ防止

```js
const isApplyingRemoteSettings = useRef(false);

// リモート設定を適用する直前にフラグを立てる
isApplyingRemoteSettings.current = true;
setTheme(s.theme);  // ← この変更が settingsUpdatedAt を増やして再プッシュをトリガーしそうだが...

// settingsUpdatedAt を更新する useEffect 内でフラグをチェック
useEffect(() => {
  if (!loaded) return;
  if (isApplyingRemoteSettings.current) {
    isApplyingRemoteSettings.current = false;
    return;  // ← リモート由来の設定変更は settingsUpdatedAt を更新しない
  }
  setSettingsUpdatedAt(Date.now());
}, [theme, lang, viewMode, activeTool, toolSuffixes, history, loaded]);
```

---

## 8. 同期状態の UI 表示

| `syncStatus` | 表示 | 意味 |
|-------------|------|------|
| `''` | なし | 初期状態（未サインイン含む） |
| `'syncing'` | ⟳ または spinner | 通信中 |
| `'synced'` | ✓ またはチェックマーク | 成功 |
| `'error'` | エラートースト（7秒） | 通信失敗 |

`dataSizeToast`: 900 KB 超えた場合の警告トースト（6秒）。

---

## 9. 現状の制限・改善余地

| # | 問題 | 影響 | 改善案 |
|---|------|------|--------|
| 1 | last-write-wins のため **複数デバイス同時編集は後勝ち** | デバイスAで編集中にデバイスBで上書きされると、Aの変更は次のプッシュで上書きされる | ユーザーに「別タブで開いた場合に競合する可能性」を設定画面で明示するだけで十分（実装変更なし） |
| 2 | 1キャラ単位のマージだが **ブロック単位のマージは未実装** | 同一キャラを複数デバイスで異なるブロックを編集 → `lastModified` が古い方が丸ごと消える | ブロックレベルマージはかなり複雑。まず `lastModified` を必ず全操作で更新することを徹底する方が現実的 |
| 3 | 900 KB 超でプッシュが完全失敗 | 画像なし・テキストのみでも大量キャラ + 長いプロンプトログで超える可能性 | 超えた場合にユーザーへの具体的な対処案を表示する（「古いキャラを削除してください」等） |
| 4 | タブ復帰プルが30秒スロットルのため **直前の変更を見落とす可能性** | デバイスAで保存→すぐデバイスBで開くと30秒以内なら古いデータ表示 | 手動「今すぐ同期」ボタンの追加（SettingsModal か ヘッダーに配置） |
| 5 | オフライン時のプッシュは単純にエラー扱い（再試行なし） | オフライン編集→オンライン復帰時にプッシュされない場合がある | `navigator.onLine` チェック + オンライン復帰時にプッシュを再実行するイベントリスナー |
| 6 | `promptLog`（ログ）と `versions`（スナップショット履歴）がクラウド同期される | 記録が多いと 900 KB に達しやすい | 同期する項目を設定で選択できるように（キャラ本体のみ / ログ込み）|
| 7 | `_thumbs`（サムネイル）は除外されるためクラウド同期なし | 別デバイスでサムネイルが表示されない | Firestore ではなく Firebase Storage か Cloudflare R2 等にサムネイルを別保存 |

---

## 10. デバッグ時の確認観点

### プル
- [ ] サインイン直後にクラウドのデータがローカルにマージされる
- [ ] タブを隠して戻ると 30 秒後に再プルされる（`Network` タブで Firestore リクエスト確認）
- [ ] クラウドのキャラを手動削除 → プルすると消えたキャラがローカルにも消える（`mergeCharacters` はUnionなので消えない。これは仕様）

### プッシュ
- [ ] ブロック編集 → 3 秒後に Firestore ドキュメントが更新される
- [ ] 900 KB 超のデータを作成 → `dataSizeToast` が表示される

### 競合解決
- [ ] 2ブラウザで同じキャラを編集 → 後から保存した方の `lastModified` が大きいため勝つ
- [ ] キャラ並び替え → 後に並び替えた方の `orderUpdatedAt` が大きいため勝つ
- [ ] リモート設定を適用しても `settingsUpdatedAt` が再度更新されない（ループなし）
