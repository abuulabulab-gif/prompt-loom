# LOOM — 本番プロジェクト（prompt-loom.com）

汎用AIイラスト プロンプト構築・キャラクター管理アプリ。
このフォルダは **段階B（本番化）** のスターターです。プロトタイプ（artifact）の全機能を
Vite + React + IndexedDB(Dexie) + PWA 構成に移植した状態になっています。

---

## これは何

- プロトタイプ（loom-v11.jsx）の完成版コンポーネントを `src/Loom.jsx` として収録
- artifact専用だった `window.storage` を **Dexie (IndexedDB)** に差し替え済み（`src/storage.js`）
- **PWA対応済み**（`vite.config.js` の VitePWA）。スマホ/PCにインストール可能
- リロードしてもデータが消えない（IndexedDB永続化）

## セットアップ

```bash
cd loom-app
npm install
npm run dev      # 開発サーバ（http://localhost:5173）
npm run build    # 本番ビルド → dist/
npm run preview  # ビルド結果をローカル確認
```

## デプロイ（prompt-loom.com / XServer）

`npm run build` で生成される `dist/` を XServer のドキュメントルートにアップロードするだけ。
SPAなので、サブパスでアクセスしたい場合のみ `vite.config.js` に `base` を追加。
PWAのサービスワーカーは https 環境（独自ドメイン）で有効になります。

---

## 実装済み機能（プロトタイプから移植）

- 12ブロック構成（品質/アートスタイル/キャラ属性/顔/体型/衣装/特徴/エフェクト/構図/背景/ライティング/ネガティブ）
- ブロック番号表示・並び替え・ON/OFF・折りたたみ・ロック
- タグのトグル挿入（クリックで追加、再クリックで削除、挿入済みハイライト ✓）
- 6段階強度プリセット（0.5/0.8/1.0/1.1/1.2/1.3）＋ ±0.05 微調整
- 複合タグのグループ括弧（`(a, b, c:1.2)`）
- タグ検索（日英）・カスタムタグ・お気に入り
- カラーメイカー（部位×色×明暗）
- キャラクター管理（複数・複製・カラー/絵文字・メモ）
- 衣装/構図プリセット保存・他キャラへコピー
- シーン合成（複数キャラ→1枚、位置・関係性・BREAK区切り）
- キャラ比較モード
- AIツール別フォーマット（NovelAI/SD/MJ/Flux/DALL-E、suffix・重み除去）
- 矛盾チェック（12ルール）
- プロンプト履歴（20件）・スナップショット
- JSON書き出し/読み込み
- ライト/ダークテーマ
- PC2列レイアウト・集中編集モード（広い画面のみ）
- 日英UI切替

---

## TODO（段階B〜Cでやること）

優先度順。`docs/gemini-spec.md` の指示書も参照。

### 段階B（本番品質に仕上げる）
1. **インラインスタイル → Tailwind 移行** 🟡 着手中
   - ✅ 土台完了: `tailwind.config.js` / `postcss.config.js` / `src/index.css`（design token をCSS変数化、`[data-theme]` でダーク/ライト切替）
   - ✅ `Loom.jsx` が `<html data-theme>` を切り替えるよう配線済み
   - ⬜ 残: 巨大な `Loom.jsx` をコンポーネント分割しつつ、インラインstyle（`C.xxx`）を Tailwind クラス（`bg-surface` `text-fg` `border-line` 等）へ順次置換
   - 移行の進め方: ①データ定義（`BLOCKS_DEF`・タグ・`THEMES`）を `src/data/` へ分離 → ②`BlockCard`・各モーダルを別ファイル化 → ③部品ごとにTailwind化して動作確認 → ④`C`オブジェクトを撤去
2. **ライトモードの細部仕上げ**（固定濃色 `#0d111e` `#0d1520` `#1a160a` `#2e1e0d` 等をトークン化）
3. **タグ整理**（`docs/phase-b-tag-cleanup.md` の指摘リストに沿って対応）
4. **サムネイル登録**（`storage.js` の `saveThumb/loadThumb` を利用、キャラ・プリセットにBase64画像）
5. **ショートカットキー**（コピー、ブロック開閉など）
6. **Supabase クラウド同期**（PC↔スマホ。state単一ドキュメントをpush/pull）

### 段階C（高度機能・クライアントサイドAI）
6. **画像→プロンプト**（Transformers.js + WD14 Tagger をブラウザで実行 → タグを各ブロックに振り分け）
7. **3Dポーズ→プロンプト**（React Three Fiber で簡易ボーン操作 → 関節角度をタグ化）
8. **海外対応の強化**（多言語タグ、UIローカライズ拡張）

### 検討事項（方針未確定）
- **NSFW対応**: 年齢確認ゲート＋デフォルト非表示トグル方式が定石。ホスティング/決済の規約確認必須。
- **マネタイズ**: 投げ銭（Ko-fi等）→ アフィリエイト（BTO PC・周辺機器）→ Pro機能サブスク の順で。
- **LOOM専用マスコットキャラ**: デフォルトキャラ同梱＋SNS運用で宣伝。

---

## ファイル構成

```
loom-app/
├─ package.json
├─ vite.config.js        # PWA設定込み
├─ tailwind.config.js    # design token（CSS変数にマップ）
├─ postcss.config.js
├─ index.html
├─ public/
│   └─ favicon.svg
├─ src/
│   ├─ main.jsx          # エントリ
│   ├─ Loom.jsx          # アプリ本体（プロトタイプ完成版）
│   ├─ storage.js        # Dexie永続化レイヤ
│   └─ index.css         # Tailwind directives + design token変数（ダーク/ライト）
└─ docs/
    ├─ gemini-spec.md          # Gemini作成の設計指示書
    └─ phase-b-tag-cleanup.md  # タグ整理の作業メモ
```

## 注意

- `Loom.jsx` は1ファイルに全部入っています（プロトタイプ由来）。段階Bのリファクタで
  ブロック定義（`BLOCKS_DEF`）、タグデータ、各モーダルコンポーネントを別ファイルに分割すると保守しやすくなります。
- アイコン画像（`pwa-192.png` `pwa-512.png` `apple-touch-icon.png`）は未同梱です。
  LOOMロゴから書き出して `public/` に置いてください。

---

## 置き場（フォルダの地図）

```
loom/
├─ README.md          … いま読んでいるもの（地図）
├─ CLAUDE.md          … ★実装の憲法（構成・命名・タグ棚の決めごと）。迷ったらここ
├─ AGENTS.md          … AIエージェント向けの申し送り
├─ BACKLOG.md         … ★積み残し・要望・改善の棚（次に何をやるか）
├─ TASKS.md           … 残タスクの入口（実体はBACKLOG.mdへのポインタ・全プロジェクト統一）
├─ ROADMAP.md         … リリース済みの履歴
├─ loom-manual.md     … 利用者向けの使い方
├─ loom-promo-v2.md   … 紹介文の原稿
├─ tags-list.md       … タグ棚の一覧（棚卸し用）
├─ SCREENSHOT_GUIDE.md … 画面写真の撮り方（審査・紹介用）
│
├─ index.html         … 入口（Viteが読む）
│
├─ src/               … ★本体。構成の説明は CLAUDE.md の「ディレクトリ構成」
├─ public/            … そのまま配られる静的ファイル
├─ docs/              … 設計メモ・レビュー記録
├─ tools/             … 道具（sim-random.mjs＝ランダム生成の分布を測る）
├─ tests/             … Playwrightの試験
│
├─ audit.mjs / audit2.mjs … 画面を撮って点検する使い捨てスクリプト
├─ check.mjs / check.cjs  … 軽い自己点検
│
└─ docs/specs/  … ★仕様メモ（機能ごと・実装の経緯と決めごと）
   ├─ docs/specs/random-gen-spec.md      … ランダム生成
   ├─ docs/specs/template-spec.md        … テンプレート
   ├─ docs/specs/color-maker-spec.md     … カラーメーカー
   ├─ docs/specs/cutout-maker-spec.md    … カットメーカー
   ├─ docs/specs/conflicts-system-spec.md … タグ競合
   ├─ docs/specs/natural-analyze-spec.md … 自然文・解析
   ├─ docs/specs/character-note-spec.md  … キャラノート
   ├─ docs/specs/cloud-sync-spec.md      … クラウド同期
   └─ docs/specs/data-migration-spec.md  … データ移行
```

### 片付いた（2026-07-27・ABUU裁定「LOOMの仕様メモは寄せよう」）
直下に並んでいた仕様メモ9枚を **`docs/specs/` へ移した**。根に並んでいると
「まず何を読むか」が見えにくかったため。参照は README と docs/phase2-review.md
だけだったので張り替え済み。**直下の .md は案内役と台帳だけになった。**

★この地図を実物に合わせ続ける。ファイル・フォルダを足したらここに1行。
　ズレは `tools/check-map.py`（RIN-OS共用）が毎回見る。
