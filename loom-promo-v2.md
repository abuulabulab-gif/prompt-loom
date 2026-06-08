# LOOM プレゼン資料 v2.5（2026-06-09）

> 旧版 loom-promo-brief.md の更新版。ターゲット：国内AIイラストユーザー（X/note）＋海外AIアートコミュニティ（Reddit/Global X）

---

## エレベーターピッチ

### 日本語
> **AIイラスト生成のプロンプトを、もっと速く・もっと自由に。**
> タグを選ぶだけでプロ級のプロンプトが完成する、キャラクター管理つきの無料Webアプリです。

### English
> **Faster, smarter prompt-building for AI illustration.**
> A free web app that generates pro-quality prompts just by clicking tags — with full character management built in.

---

## キャッチポイント（日英）

| 日本語 | English |
|--------|---------|
| 🔒 **ローカルファースト** — ブラウザ自動保存。外部送信なし | 🔒 **Local-first** — Auto-saved in browser. Nothing sent externally |
| ☁️ **クラウド同期** — Googleログインでスマホ↔PC共有 | ☁️ **Cloud sync** — Sign in with Google to sync across phone & PC |
| 🤖 **AI機能内蔵** — タグ提案・自然文変換・画像解析 | 🤖 **AI-powered** — Tag suggestions, text-to-tags & image analysis |
| 🌐 **完全日英対応** — UI・タグ・出力を日英で切替 | 🌐 **Full JA/EN support** — Switch UI, tags & output between languages |
| 📱 **PWA対応** — ホーム画面に追加してアプリとして起動 | 📱 **PWA-ready** — Install to home screen, use like a native app |

---

## スライド構成（10枚）

---

### スライド 1：タイトル＆概要

**素材：** PC版アプリ全体スクショ（ダークモード推奨）

**日本語**
- タイトル：🧵 LOOM — AIイラストのプロンプト管理ツール
- サブ：タグを選ぶだけでプロ級のプロンプトが完成。無料・キャラ管理つき。
- キャッチ5点（上記テーブル参照）

**English**
- Title: 🧵 LOOM — Prompt Manager for AI Illustration
- Sub: Build pro-quality prompts just by clicking tags. Free, with full character management.
- 5 key points (see table above)

---

### スライド 2：ブロック＆タグシステム

**素材：** 複数ブロックが並んだエディタ画面

**日本語**
- タイトル：🧱 ブロック＆タグシステム
- プロンプトを12種のブロックに分類（品質・スタイル・特徴・顔・体型・衣装・衣装ディテール・エフェクト・構図・背景・ライティング・ネガティブ）
- タグをクリックするだけで追加。ブロック単位で強度（0.8〜1.3）を設定
- MJ / NAI / SD / Flux / DALL-E の記法に自動変換
- カスタムタグは表示名（日本語）とプロンプトテキストを別設定可能

**English**
- Title: 🧱 Block & Tag System
- 12 prompt blocks: Quality, Style, Attribute, Face, Body, Outfit, Outfit Detail, Effect, Composition, Background, Lighting, Negative
- One click adds any tag. Set strength (0.8–1.3) per block
- Auto-formats for MJ / NAI / SD / Flux / DALL-E
- Custom tags: set display name (Japanese) and prompt text separately

---

### スライド 3：マルチキャラクター管理

**素材：** キャラタブが複数並んでいる画面、またはキャラ一覧モーダル

**日本語**
- タイトル：👥 マルチキャラクター管理（最大30体）
- 名前・カラー・絵文字でキャラを識別。タブをドラッグで並べ替え可能
- `≡` ボタンでキャラ一覧モーダルを開き、名前検索・クリックジャンプ・並べ替えが可能
- キャラクターごとにブロック設定・タグ・LoRA・バージョン履歴を独立保存
- .loomファイルとして書き出し・読み込み・他ユーザーと共有可能
- バージョン履歴（最大10件）を自動管理。任意の状態にワンクリック復元

**English**
- Title: 👥 Multi-Character Management (up to 30)
- Name, color & emoji per character. Drag tabs to reorder
- `≡` button opens Character List: search by name, click to jump, drag to reorder
- Per-character blocks, tags, LoRA info & version history stored independently
- Export / import as .loom files — shareable with anyone
- Auto version history (up to 10 snapshots) with one-click restore

---

### スライド 4：カスタムブロック＆ユーザーセクション

**素材：** カスタムブロックにユーザーセクションが作られている画面

**日本語**
- タイトル：🗂️ カスタムブロック & ユーザーセクション
- 好きな名前で独自ブロックを作成（スマホ3個 / PC5個まで）
- カスタムブロック内にセクションを自由に追加し、カスタムタグを分類管理
- 活用例：「二次創作キャラブロック」→「作品Aセクション」→「キャラ名のプロンプトタグ」
- カスタムタグは表示名（日本語可）＋プロンプトテキストを別設定

**English**
- Title: 🗂️ Custom Blocks & User Sections
- Create your own blocks with any name (3 on mobile / 5 on desktop)
- Add free-form sections inside custom blocks to organize custom tags
- Example: "Fan-art chars block" → "Series A section" → "Character name prompt tag"
- Custom tags: separate display name (can be Japanese) + prompt text

---

### スライド 5：タグ破綻チェックシステム

**素材：** 競合警告が表示されているタグボタン周辺のスクショ

**日本語**
- タイトル：🛡️ タグ破綻チェックシステム
- 矛盾タグをリアルタイム自動検出（例：short hair + very long hair / mermaid + boots / sunny + rainy）
- 100件以上の競合ルール内蔵（髪・種族・ポーズ・天候・背景を横断）
- おまかせランダム生成でも競合ルールが適用され、矛盾ゼロのプロンプトを自動生成
- ブロック健康診断で潜在的な問題を一括チェック

**English**
- Title: 🛡️ Conflict Detection System
- Real-time detection of conflicting tags (e.g. "short hair + very long hair," "mermaid + boots," "sunny + rainy")
- 100+ built-in conflict rules across hair, species, poses, weather, backgrounds
- Conflict rules also apply to the random generator — every auto-prompt is logically consistent
- Block health check to audit all potential issues at once

---

### スライド 6：おまかせランダム生成 ＆ バリエーション

**素材：** バリエーションパネルが展開されている画面

**日本語**
- タイトル：🎲 おまかせランダム生成 ＆ バリエーション
- 2モード：**キャラ特化**（顔・髪・体型・衣装）/ **イラスト**（構図・背景・ライティングも含む全体生成）
- 種族が選ばれると対応パーツを自動付与（ケモ耳なら尻尾・爪も自動追加）
- カラーメーカーロジックと連動し、色の組み合わせも矛盾なく生成
- バリエーション：現在のプロンプトから髪型・衣装・オプションを差し替えた3種類を即生成
- バリエーションはそのままブロックに適用して編集継続可能

**English**
- Title: 🎲 Random Generator & Variations
- 2 modes: **Character-focused** (face, hair, body, outfit) / **Illustration** (includes pose, background, lighting)
- Species parts auto-added when species is chosen (e.g. cat ears → tail + claws)
- Color Maker logic integrated — color combos are consistent and conflict-free
- Variations: instantly generate 3 variants by swapping hair, outfit & optional tags
- Apply any variation to your blocks and keep editing

---

### スライド 7：メーカー三兄弟

**素材：** カラーメーカーまたは特徴メーカーのモーダルスクショ

**日本語**
- タイトル：🎨 カラー・特徴・マテリアルメーカー
- **カラーメーカー**：髪・瞳・衣装・肌・アクセサリーの色をGUIで選択して一括適用。インナーカラー・ヘテロクロミア対応
- **特徴メーカー**：種族・幻想パーツ・ケモ耳系パーツをカテゴリ選択で一括適用
- **マテリアルメーカー**：衣装の素材・テクスチャ・仕上げ効果を選択して衣装ブロックに適用
- どれも適用先ブロックに自動振り分け

**English**
- Title: 🎨 Color, Feature & Material Makers
- **Color Maker**: Pick hair / eye / outfit / skin / accessory colors via GUI — applies in one shot. Inner color & heterochromia supported
- **Feature Maker**: Category-select species, fantasy parts & kemono parts — applied consistently
- **Material Maker**: Pick outfit material, texture & finish — auto-applied to outfit block
- All makers auto-route tags to the correct blocks

---

### スライド 8：AI機能

**素材：** 自然文変換モーダルまたはタグ提案が動いている画面

**日本語**
- タイトル：🤖 AI機能（Claude / OpenAI APIキーで解放）
- **タグ提案**：現在の選択タグからAIが次の一手を推薦
- **自然文→タグ変換**：「赤い服の明るい魔法少女」→ タグに自動分解
- **プロンプト整形**：AIが表現をブラッシュアップ
- **画像解析→タグ抽出**：参考画像をアップロードするだけ
- Claude / OpenAI どちらのAPIキーでも動作

**English**
- Title: 🤖 AI Features (unlock with Claude / OpenAI API key)
- **Tag suggestions**: AI recommends next tags based on your current selection
- **Natural text → tags**: "Bright magical girl in a red outfit" → auto-split into tags
- **Prompt polish**: AI refines and improves your prompt
- **Image-to-tags**: Upload any reference image and extract tags automatically
- Works with Claude or OpenAI API keys

---

### スライド 9：スマホ対応

**素材：** スマホ縦長UI（キーボード展開時）のスクショ

**日本語**
- タイトル：📱 スマホでもフル機能
- 完全レスポンシブ。PCと同じ機能をスマホでもすべて使用可能
- キーボード展開時に出力バーが自動でせり上がり、画面を離れずプロンプトを常に確認
- PWA対応。ホーム画面に追加してアプリとして起動
- キャラドット（丸型）をタップで選択、長押し250msでドラッグ並べ替え
- タグのタップ操作に最適化されたモバイルレイアウト

**English**
- Title: 📱 Full features on mobile too
- Fully responsive — everything available on mobile, same as desktop
- Output bar rises automatically with keyboard — always visible while typing
- PWA support — install to home screen and launch like a native app
- Character dots: tap to select, long-press 250ms to drag and reorder
- Touch-optimized layout for quick tag tapping

---

### スライド 10（最終）：機能まとめ

**素材：** なし（テキスト or アイコン）

**日本語**
- タイトル：✨ ほかにもこんなことができます
- ★ ピン留めでよく使うタグをブロック最上部に固定
- `Ctrl+K` コマンドパレットでキーボードだけで全操作
- 全ブロック横断タグ検索（カスタムタグも検索対象）
- タグにカーソルを当てると日英ツールチップで意味を確認
- 衣装・構図プリセットをワンタップで呼び出し
- スナップショット保存と過去バージョンの比較・復元
- キャラクターノート（プロフィール・プロンプトログ・タグ対応表）
- 出力エリアで直接テキスト編集してそのままコピー
- Natural Languageモードでタグを読みやすい一文に変換
- シンプル / ノーマル / エキスパートの3段階ビュー切り替え
- 2キャラのプロンプトを並べて比較（比較パネル）
- シーンコンポーズで複数キャラの合成プロンプトを生成

**English**
- Title: ✨ And there's more…
- ★ Pin favorite tags to the top of each block
- `Ctrl+K` command palette for full keyboard control
- Global tag search across all blocks (custom tags included)
- Bilingual tooltips (JA/EN) on hover for every tag
- Costume & shot presets recalled with one tap
- Snapshot your prompt and compare / restore past versions
- Character notes: profile sheet, prompt log, tag map
- Edit output text directly and copy without switching screens
- Natural Language mode: converts tags into a readable sentence
- Three view modes: Simple / Normal / Expert
- Side-by-side character output comparison
- Scene Compose for multi-character collab prompts

---

## トンマナ・デザイン指示

| 項目 | 指定 |
|------|------|
| メインカラー | ダークネイビー系背景 ＋ ブルーアクセント（#4a6fff系） |
| フォント | 日本語：Noto Sans JP / 英語：Inter または DM Sans |
| 雰囲気 | クリーン・テック系。装飾過多にしない |
| スクショ | 端末モックアップ（ブラウザ or スマホフレーム）に入れる |
| サイズ | 16:9（スライド標準） |

---

## 必要なスクショ一覧

| No | 内容 | 使用スライド |
|----|------|------------|
| 1 | PC版 全体UI（ダークモード） | スライド1 |
| 2 | 複数ブロックが並んだエディタ画面 | スライド2 |
| 3 | キャラタブ複数 + キャラ一覧モーダル | スライド3 |
| 4 | カスタムブロック＋ユーザーセクション | スライド4 |
| 5 | 競合タグ警告が表示されているUI | スライド5 |
| 6 | バリエーションパネルが展開されている画面 | スライド6 |
| 7 | カラーメーカーまたは特徴メーカーのモーダル | スライド7 |
| 8 | 自然文変換モーダル or タグ提案が動いている画面 | スライド8 |
| 9 | スマホ版縦長UI（キーボード展開時） | スライド9 |

---

## 納品物

- [ ] 日本語版スライド（10枚）
- [ ] 英語版スライド（10枚）
- [ ] X投稿用の正方形切り出し版（1200×1200px 想定）
