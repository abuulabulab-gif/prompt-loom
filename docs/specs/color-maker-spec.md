# カラーメーカー 仕様書

> 実装コード: `src/components/modals/ColorPickerModal.jsx`, `src/data/colors.js`, `src/utils/randomLayers.js`
> 最終更新: 2026-06-09（v2.5）

---

## 1. データ構造（`src/data/colors.js`）

```
COLOR_PALETTE       18色  { ja, en, hex }
SHADES              3段階  { id:'dark'|'normal'|'light', ja, en(prefix) }
COLOR_TARGETS       部位定義 { id, ja, en, allowedTargets? }
TARGET_TO_BLOCK     { targetId → blockId } マッピング
buildColorTag       (shadeEn, colorEn, targetEn) => "dark blue hair"
```

### COLOR_TARGETS と適用先ブロック

| targetId | 日本語名 | 適用ブロック | 備考 |
|----------|---------|------------|------|
| hair | 髪 | face | |
| inner_hair | インナーカラー | face | 選択後に hair 部位のタグとして追加 |
| eyes | 目 | face | |
| eye_left / eye_right | 左目 / 右目 | face | heterochromia用。片方ずつ色を設定 |
| skin | 肌 | body | |
| dress | ドレス | outfit | |
| shirt | シャツ | outfit | |
| skirt | スカート | outfit | |
| jacket | ジャケット | outfit | |
| ribbon | リボン | outfit | |
| shoes | 靴 | outfit | |
| stockings | ストッキング | outfit | v2.3追加 |
| accessories | アクセサリー | outfit | v2.3追加 |
| makeup | メイク | face | v2.3追加 |
| theme | テーマ色 | artstyle | |

### allowedTargets（ブロック固有ターゲット制限）

一部ターゲットはブロックに応じて自動的に対象が絞られる（`ColorPickerModal` が `defaultTarget` prop を受け取ったとき）。

---

## 2. UI フロー（`ColorPickerModal.jsx`）

1. ① 部位選択（チップボタン群、allowedTargets で対象を絞れる）
2. ② 色選択（18色のスウォッチグリッド）
3. ③ 明暗選択（濃い / 標準 / 薄い）
4. プレビュー（色サンプル + 生成タグ名）
5. 「〇〇ブロックに追加」ボタン → `appendTag(block.text, tag)` で追加

**連続追加可能**（モーダルは自動で閉じない）

### エントリポイント

- ナビバーの 🎨 ボタン → カラーメーカーを開く
- コマンドパレット（Ctrl+K → 「カラーピッカー」）
- ブロックヘッダーの 🎨 ボタン（face/body/outfit ブロックで表示）→ `defaultTarget` を自動セット

---

## 3. 特殊部位の処理

### インナーカラー（inner_hair）

```js
// 生成タグ例
"inner color dark blue hair"
// → face ブロックに追加
```

inner_hair 選択時は `buildColorTag` で `inner color {shade} {color} hair` 形式のタグを生成。

### ヘテロクロミア（eye_left / eye_right）

左右それぞれ別の色を選んで適用。両方適用すると `heterochromia` タグが自動追加される。

```js
// eye_left = blue eyes → face ブロックに "blue eyes"
// eye_right = red eyes → face ブロックに "red eyes" + "heterochromia"
```

### 色名オーバーライド

一部ターゲットは生成タグ名の末尾を変更する。例:

| targetId | 通常タグ例 | オーバーライド後 |
|----------|-----------|----------------|
| makeup | `red makeup` | `red lips` / `red eyeshadow` 等 |
| accessories | `blue accessories` | `blue earrings` / `blue necklace` 等 |

---

## 4. ランダム生成との連携（`applyColorMakerLayer`）

`src/utils/randomLayers.js` の `applyColorMakerLayer` が管理。

### ATTR_ACCENT_RULES テーブル

種族パーツが選ばれたとき、関連部位の色を設定するルール。テーブル駆動で追加・削除が容易。

```js
const ATTR_ACCENT_RULES = [
  { attr: 'cat ears',    target: 'ear',    chance: 0.7 },
  { attr: 'cat tail',    target: 'tail',   chance: 0.7 },
  { attr: 'fox ears',    target: 'ear',    chance: 0.6 },
  { attr: 'fox tail',    target: 'tail',   chance: 0.6 },
  { attr: 'dragon tail', target: 'tail',   chance: 0.5 },
  // ...
];
```

ランダム生成時に該当する種族パーツが選ばれると、`chance` の確率で対応部位に COLOR_PALETTE からランダム色を適用する。

---

## 5. `applyColorTag` 関数（`Loom.jsx`）

```js
const applyColorTag = (shadeEn, colorEn, targetEn, targetId) => {
  const blockId = TARGET_TO_BLOCK[targetId] || 'outfit';
  const tag = targetId === 'theme'
    ? `${shadeEn}${colorEn} theme`.trim()
    : buildColorTag(shadeEn, colorEn, targetEn);
  // blocks に appendTag で追加
  updateBlock(blockId, { text: appendTag(block.text, tag, '1.0') });
};
```

---

## 6. 現状の制限・既知の課題

| # | 問題 | 影響 |
|---|------|------|
| 1 | Color Maker が生成するシェード付きタグ（`dark blue hair` 等）は `blocks.js` 未定義のため TagBtn に日本語ラベルが付かない | テキストとして追加されるがカテゴリ内でハイライトされない |
| 2 | 追加後フィードバックがない | 追加先ブロックが折りたたまれていると変化が見えない |
| 3 | 900 KB 制限に引っかかる場合、カラータグが原因となることは少ないが、画像を多用するとリスクあり | クラウド同期のサイズ制限に注意 |

---

## 7. デバッグ時の確認観点

- [ ] 髪色・目の色・衣装色をそれぞれ別のターゲットで追加できる
- [ ] インナーカラーを追加すると face ブロックに `inner color * hair` 形式で入る
- [ ] 左目・右目に別の色を設定すると `heterochromia` が自動追加される
- [ ] ストッキング・アクセサリー・メイクが outfit/face ブロックに正しく振り分けられる
- [ ] テーマカラーが artstyle ブロックに入る
- [ ] ブロックヘッダーの 🎨 ボタンからモーダルを開くと該当部位がデフォルト選択されている
