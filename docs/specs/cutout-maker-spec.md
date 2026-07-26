# カットアウトメーカー 仕様メモ

## 概要
衣装の「切り抜き・変形デザイン」を UI で選んで outfit_detail ブロックに追記するメーカーモーダル。
カラーメーカーと同じ Maker モーダル骨格（ACCENT/ACCENT_BG/ACCENT_HEX・chipCls）を使う。

---

## 目的・背景
- ブロックテンプレートで衣装をまるごと上書きするのではなく、  
  元の衣装の上にカットアウト系のディテールを重ねる方向に設計変更した
- そのためのタグを体系的に選べる専用 UI が欲しい

---

## 対象ブロック
`outfit_detail`（形状・カットカテゴリ）に追記

---

## タグ候補（カテゴリ別）

### 開口部・窓
| タグ (en) | 日本語 | 説明 |
|-----------|--------|------|
| `cleavage cutout` | 胸元カット | 胸の上あたりをくり抜いたデザイン |
| `navel cutout` | へそ出しカット | お腹・へそ部分の窓 |
| `shoulder cutout` | 肩カット | 肩をくり抜いたデザイン |
| `armpit cutout` | 脇くりぬき | 脇の下をくり抜いた形状 |
| `back cutout` | 背中カット | 背中側をくり抜いたデザイン |
| `side cutout` | サイドカット | 側面の切り込み・開口 |
| `underboob cutout` | アンダーカット | 胸の下側を出すカット |

### シルエット変形
| タグ (en) | 日本語 | 説明 |
|-----------|--------|------|
| `open back` | 背中開き | 背中が大きく開いているデザイン |
| `sideless outfit` | 脇カット/サイドレス | 横サイドが開いている衣装形状 |
| `off shoulder` | オフショルダー | 肩から外れて着ている状態（tops にも存在） |
| `high slit` | ハイスリット | 太ももまで入ったスリット |
| `side slit` | サイドスリット | 横のスリット入り |
| `low-rise` | ローライズ | 腰を低く見せるカット |

### 素材・質感系
| タグ (en) | 日本語 | 説明 |
|-----------|--------|------|
| `see-through` | シースルー | 透け素材 |
| `skintight` | ぴったり | 体にぴったり密着 |
| `torn clothes` | 破れた服 | 破れ・ダメージ加工 |

---

## UI イメージ

```
[ カットアウトメーカー ]
 ─────────────────────────────────
  [開口部・窓]
  ◻ 胸元カット  ◻ へそ出しカット  ◻ 肩カット
  ◻ 脇くりぬき  ◻ 背中カット     ◻ サイドカット
  ◻ アンダーカット

  [シルエット変形]
  ◻ 背中開き  ◻ 脇カット/サイドレス  ◻ オフショルダー
  ◻ ハイスリット  ◻ サイドスリット  ◻ ローライズ

  [素材・質感]
  ◻ シースルー  ◻ ぴったり  ◻ 破れた服
 ─────────────────────────────────
  [ 適用 → outfit_detail に追記 ]
```

---

## 実装方針（Maker モーダル骨格）

```jsx
// アクセントカラー定数
const ACCENT     = 'var(--c-pink)';    // または c-rose など
const ACCENT_BG  = 'rgb(var(--c-pink) / 0.1)';
const ACCENT_HEX = '#fb7185';

// チップスタイル（選択中/未選択）
const chipCls = (sel) => sel
  ? 'border rounded px-2 py-1 text-xs cursor-pointer font-mono transition-all'
    + ' bg-accent/20 border-accent text-accent-fg'
  : 'border rounded px-2 py-1 text-xs cursor-pointer font-mono transition-all'
    + ' bg-surface-alt border-dim text-muted';
```

- 複数選択可（チェックボックス式）
- 「適用」ボタンで選択済みタグを `outfit_detail` に merge
- Loom.jsx の `openCutoutMaker` / `closeCutoutMaker` で開閉
- ブロックが非表示でも適用できるように `updateBlock` 直接呼び出し

---

## TODO（実装時）
- [ ] `CutoutMakerModal.jsx` を `src/components/modals/` に作成
- [ ] `Loom.jsx` に `cutoutMakerOpen` state + ツールバーボタン追加
- [ ] タグ追加時は `precheck` でブロック定義との整合確認
- [ ] カラーメーカーと同様に CommandPalette からも呼び出せるとベスト
