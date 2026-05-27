import { useState, useEffect } from "react";

const APP_VERSION = 'v2.0';
const APP_YEAR = '2026';

const SHORTCUTS = (lang) => [
  {
    group: lang === 'ja' ? '出力' : 'Output',
    items: [
      { keys: ['Ctrl', 'Enter'], action: lang === 'ja' ? 'プロンプトをコピー' : 'Copy prompt' },
      { keys: ['P'], action: lang === 'ja' ? 'Positive タブに切替' : 'Switch to Positive tab' },
      { keys: ['N'], action: lang === 'ja' ? 'Negative タブに切替' : 'Switch to Negative tab' },
    ],
  },
  {
    group: lang === 'ja' ? 'ブロック' : 'Blocks',
    items: [
      { keys: ['['], action: lang === 'ja' ? '全ブロックを折りたたむ' : 'Fold all blocks' },
      { keys: [']'], action: lang === 'ja' ? '全ブロックを展開' : 'Expand all blocks' },
    ],
  },
  {
    group: lang === 'ja' ? 'AIツール' : 'AI Tools',
    items: [
      { keys: ['1'], action: lang === 'ja' ? '汎用' : 'General' },
      { keys: ['2'], action: 'Midjourney' },
      { keys: ['3'], action: 'NovelAI' },
      { keys: ['4'], action: 'SD/WebUI' },
      { keys: ['5'], action: 'Flux2' },
      { keys: ['6'], action: 'DALL-E/Copilot' },
    ],
  },
  {
    group: lang === 'ja' ? 'パネル' : 'Panels',
    items: [
      { keys: ['G'], action: lang === 'ja' ? 'タグ全体検索' : 'Global tag search' },
      { keys: ['Ctrl', 'F'], action: lang === 'ja' ? 'タグ全体検索 (同上)' : 'Global tag search (same)' },
      { keys: ['H'], action: lang === 'ja' ? '履歴を開く' : 'Open history' },
      { keys: ['T'], action: lang === 'ja' ? 'テンプレートを開く' : 'Open templates' },
      { keys: ['A'], action: lang === 'ja' ? 'プロンプト逆解析' : 'Analyze prompt' },
      { keys: ['Ctrl', 'K'], action: lang === 'ja' ? 'コマンドパレット' : 'Command palette' },
    ],
  },
  {
    group: lang === 'ja' ? 'その他' : 'Other',
    items: [
      { keys: ['Escape'], action: lang === 'ja' ? 'モーダルを閉じる / 集中解除' : 'Close modal / Exit focus' },
      { keys: ['?'], action: lang === 'ja' ? 'この設定画面を開く' : 'Open this settings panel' },
    ],
  },
];

const MOBILE_TIPS = (lang) => [
  {
    icon: '☰',
    text: lang === 'ja'
      ? 'ヘッダー左のLOOMアイコンをタップするとブロック一覧が表示され、目的のブロックへ瞬時にジャンプできます'
      : 'Tap the LOOM icon (top-left) to open the block list. Tap any entry to instantly scroll to that block',
  },
  {
    icon: '🎲',
    text: lang === 'ja'
      ? 'キャラクターメモ欄の右の「🎲おまかせ」ボタンで全ブロックをまとめてランダム生成。ゼロから素早くキャラ作成できます'
      : '"🎲 Random" auto-generates all blocks at once — great for quick character ideas from scratch',
  },
  {
    icon: '📐',
    text: lang === 'ja'
      ? 'Midjourneyツール選択時、出力バーにARチップ（16:9・9:16など）が表示されます。タップするとアスペクト比パラメータが自動追加されます'
      : 'When Midjourney is selected, AR chips (16:9, 9:16, etc.) appear. Tap to auto-append the aspect ratio parameter',
  },
  {
    icon: '🗣️',
    text: lang === 'ja'
      ? 'バリエーション生成後、各行の🗣/📝ボタンで通常プロンプトと自然文を1行ずつ切り換えられます'
      : 'After generating variations, tap 🗣/📝 on each row to individually toggle between prompt and natural text format',
  },
  {
    icon: '🎨',
    text: lang === 'ja'
      ? 'DALL-E/Copilotツールを選択すると、出力タブが自動的に「自然文」に切り替わります。JA/ENも切替可能'
      : 'Selecting DALL-E/Copilot automatically switches the output tab to Natural Text mode. JA/EN toggle available',
  },
  {
    icon: '💪',
    text: lang === 'ja'
      ? 'ブロックの強度はスマホでは「標準・強」の2段階表示。±ボタンで0.05刻みの細かい調整も可能'
      : 'Block strength shows Standard and Strong on mobile. Use ± buttons for fine-grained 0.05 adjustments',
  },
  {
    icon: '🔧',
    text: lang === 'ja'
      ? 'Expertモードでブロック名をダブルタップ → 確認後に非表示。この設定画面の非表示ブロック欄から再表示できます'
      : 'In Expert mode, double-tap a block name to hide it. Restore from the Hidden Blocks section in this panel',
  },
  {
    icon: '⊕',
    text: lang === 'ja'
      ? 'ブロック右上の⊕ボタンでフルスクリーンの集中編集モードに切替。1ブロックだけを大きく表示して操作できます'
      : 'Tap ⊕ in the block header to enter fullscreen focus mode — edit one block at a time with more space',
  },
  {
    icon: '▼',
    text: lang === 'ja'
      ? '画面下の出力バーは▼ボタンで折りたたみ可能。ドラッグハンドルで高さを自由に調整できます'
      : 'The output bar can be collapsed (▼). Drag the handle bar to resize it freely',
  },
  {
    icon: '📋',
    text: lang === 'ja'
      ? 'COPYボタンでプロンプトをクリップボードへコピー。✏️ボタンでコピー前に最終テキストを手直しできます'
      : 'COPY button copies the prompt. Tap ✏️ to manually edit the final text right before copying',
  },
  {
    icon: '💡',
    text: lang === 'ja'
      ? 'テンプレートに「💡 ネガ推奨:」が表示される場合、記載のタグをネガティブブロックに追加すると構図が安定します（例：魚眼レンズ → simple background をネガに追加）'
      : 'When a template shows "💡 Neg hint:", add those tags to the Negative block for better composition (e.g. fisheye → add simple background to negative)',
  },
];

const GUIDE = (lang) => [
  {
    icon: '🌱',
    label: lang === 'ja' ? '初心者向け — まずここから' : 'Beginner — Start here',
    color: 'rgb(var(--c-green))',
    iconBg: 'rgb(var(--c-green) / 0.1)',
    iconBd: 'rgb(var(--c-green) / 0.28)',
    items: [
      { icon: '🏷️', text: lang === 'ja' ? 'タグをクリックしてプロンプトに追加・削除。アクティブなタグは色付き表示される' : 'Click tags to add/remove from prompt. Active tags are color-highlighted' },
      { icon: '📋', text: lang === 'ja' ? 'COPYボタン（Ctrl+Enter）でプロンプトをクリップボードへコピー。AIツールに貼り付けて使用する' : 'COPY (Ctrl+Enter) copies the prompt. Paste into your AI tool to generate' },
      { icon: '🎲', text: lang === 'ja' ? '「🎲おまかせ」ボタンでゼロからランダムキャラクターを自動生成（🧍キャラデザ/🖼️イラストの2モード）。ネガティブ・ロック済みブロックは対象外' : '"🎲 Random" auto-generates a character from scratch — two modes: 🧍 Char.Design or 🖼️ Illust. Skips Negative and locked blocks' },
      { icon: '✦/✕', text: lang === 'ja' ? 'Positive（追加ワード）とNegative（除外ワード）タブで管理。タブ切替はP・Nキーでも可能' : 'Positive (include) and Negative (exclude) tabs. P / N keys also switch tabs' },
      { icon: '1〜6', text: lang === 'ja' ? 'AIツールボタンでMJ・NAI・SD・Flux・DALL-Eの出力形式を切替（1〜6キー）。ツールごとに出力が最適化される' : 'AI tool buttons switch output for MJ, NAI, SD, Flux, DALL-E (keys 1–6). Each tool has optimized output' },
      { icon: 'Simple', text: lang === 'ja' ? '⚙️ 設定の「表示モード」でシンプル/ノーマル/エキスパートを切替。シンプルは初心者向けブロックのみ表示。一部の高度な機能はExpertモードでのみ現れる' : '⚙️ Settings → View mode: Simple / Normal / Expert. Simple shows beginner blocks only; some advanced features appear only in Expert mode' },
      { icon: '⚙️', text: lang === 'ja' ? 'テーマ（ダーク/ライト）・言語（JA/EN）・表示モードは ⚙️ 設定の上部から変更できる' : 'Theme, language, and view mode are changed at the top of the ⚙️ Settings panel' },
      { icon: '✦ Tool', text: lang === 'ja' ? 'ヘッダーの「✦ ツール」からテンプレート・カラーピッカー・シーン合成・AIタグ生成へアクセス' : '"✦ Tools" in the header opens Template, Color Picker, Scene Compose, and AI tag generation' },
      { icon: '🗣️', text: lang === 'ja' ? '自然文タブで選択中のタグを日本語・英語の読みやすい散文で出力。DALL-E選択時は自動で切替' : 'Natural Text tab outputs active tags as readable prose in JA or EN. Auto-activates with DALL-E' },
      { icon: '🤖 AI', text: lang === 'ja' ? 'APIキーを設定（⚙️ 設定 → API）すると4つのAI機能が使えます：①自然文タブでAI散文整形、②✦ツール→「自然文からタグ生成」でテキスト→タグ変換、③✦ツール→「画像からタグ生成」で画像解析、④出力バーの🤖提案でプロンプト改善' : 'Set an API key (⚙️ Settings → API) to unlock 4 AI features: ① AI polish in Natural Text, ② ✦ Tools → "Text to Tags", ③ ✦ Tools → "Image to Tags" (vision), ④ 🤖 Suggest in the output bar' },
    ],
  },
  {
    icon: '🌿',
    label: lang === 'ja' ? '中級者向け — もっと使いこなす' : 'Intermediate — Level up',
    color: 'rgb(var(--c-blue))',
    iconBg: 'rgb(var(--c-blue) / 0.1)',
    iconBd: 'rgb(var(--c-blue) / 0.28)',
    items: [
      { icon: '⚡', text: lang === 'ja' ? '強度ボタン（弱〜強）でタグの重みを調整。±ボタンで0.05刻みで微調整。Fluxツールでは重みが自動除去される' : 'Strength buttons set tag weight. ± fine-tunes by 0.05 steps. Flux auto-strips weight syntax' },
      { icon: '⭐', text: lang === 'ja' ? 'タグの★でお気に入り登録するとブロック上部に常時表示。よく使うタグへ素早くアクセスできる' : '★ marks tags as favorites and pins them to the top of the block for quick access' },
      { icon: '🏷 Strip', text: lang === 'ja' ? 'ブロックヘッダーのアクティブタグ帯で現在選択中のタグを一覧表示。チップをクリックするとそのカテゴリにジャンプしてタグをハイライト' : 'Active tag strip in each block header lists all selected tags. Click a chip to jump to its category and highlight the tag' },
      { icon: '🎨', text: lang === 'ja' ? 'カラーピッカーで髪・目・肌・衣装の色をビジュアルで選択してタグ自動追加。RGB・16進数入力も可能' : 'Color picker visually selects colors for hair, eyes, skin, clothing — auto-adds the tag. RGB/hex input supported' },
      { icon: '💾', text: lang === 'ja' ? 'ブロック右上の💾でプリセット保存。衣装・構図を名前付きで保存してワンクリックで切替できる' : '💾 in block header saves named presets. Switch costumes or compositions instantly' },
      { icon: '🎲 Vary', text: lang === 'ja' ? '「🎲バリエ」で同じキャラの派生プロンプトを3パターン一括生成。各行の🗣/📝ボタンで自然文に切替可能。タグが1つ以上あるときに有効' : '"🎲 Vary" generates 3 derivatives. Toggle 🗣/📝 per row for natural text. Active when at least one tag is set' },
      { icon: 'NAI {}', text: lang === 'ja' ? '【NovelAI選択時のみ】重みの構文が (tag:1.2)→{tag:1.2} 形式に自動変換される。他ツールでは通常の () 形式のまま' : '[NovelAI only] Weight syntax auto-converts from (tag:1.2) to {tag:1.2}. Other tools keep standard () format' },
      { icon: '🔗 LoRA', text: lang === 'ja' ? '【SD/NAI選択時のみ】LoRAをキャラ詳細パネルで設定すると出力に自動付与される。MJ・Flux・DALL-E時は付与されない' : '[SD/NAI only] LoRA set in the character panel auto-appends to output. Not appended for MJ, Flux, or DALL-E' },
      { icon: '👤', text: lang === 'ja' ? 'キャラを複数登録して⊕複製。🆚比較はキャラが2体以上のときキャラバーのエディタボタン左に表示。🎬シーン合成は✦ツールメニューから' : 'Multiple characters: ⊕ to duplicate. 🆚 compare appears left of the editor tab when 2+ characters exist. 🎬 Scene compose is in ✦ Tools' },
      { icon: '🕐', text: lang === 'ja' ? '🕐ボタンで自動履歴（コピー時に保存、最大20件）。📸スナップショットで任意のタイミングで手動保存し、その時点の状態に戻せる' : '🕐 auto-saves on copy (up to 20). 📸 snapshot manually saves any state so you can restore it later' },
      { icon: '⚠️', text: lang === 'ja' ? '出力バーのコンフリクト検出で矛盾タグを⚠️警告。バランスメーターでブロック別の配分を可視化' : 'Output bar shows conflict warnings (⚠️) for contradictory tags and a tag distribution balance meter' },
    ],
  },
  {
    icon: '🌳',
    label: lang === 'ja' ? '上級者向け — フル活用' : 'Advanced — Power user',
    color: 'rgb(var(--c-purple))',
    iconBg: 'rgb(var(--c-purple) / 0.1)',
    iconBd: 'rgb(var(--c-purple) / 0.28)',
    items: [
      { icon: '🔧 Hide', text: lang === 'ja' ? '【Expertモード限定】ブロック名をダブルタップして非表示に。⚙️ 設定の非表示ブロック欄から再表示できる' : '[Expert mode only] Double-tap a block name to hide it. Restore from ⚙️ Settings → this tab' },
      { icon: '✏️ +Custom', text: lang === 'ja' ? '「✏️+カスタム」で自由記述ブロックを追加（PC5個・スマホ3個まで）。上限に達した状態で追加しようとすると警告が表示される' : '"✏️ +Custom" adds free-text blocks (up to 5 on PC, 3 on mobile). Attempting to exceed the limit shows a warning' },
      { icon: '⊕', text: lang === 'ja' ? 'ブロックの⊕で集中モード。PCはブロック拡大＋サムネイルサイドバー表示、スマホはフルスクリーンオーバーレイ。Simple/Normal/Expertすべてで使用可能' : '⊕ enters focus mode — PC: block expands with thumbnail sidebar; Mobile: fullscreen overlay. Available in all view modes' },
      { icon: '⊞ Group', text: lang === 'ja' ? '⊞まとめモードで複数タグを選択して括弧グループ化。(tag1, tag2:1.2) の形式で一括追加。Simple/Normal/Expertすべてで使用可能' : '⊞ Group mode: select multiple tags to batch-add as (tag1, tag2:1.2). Available in all view modes (Simple/Normal/Expert)' },
      { icon: '✏️ Edit', text: lang === 'ja' ? 'COPY前に✏️編集ボタンで最終テキストを手直し。生成直前の微調整に便利' : '✏️ Edit-before-copy lets you tweak the final output text right before copying' },
      { icon: '🗑', text: lang === 'ja' ? '出力バー左側の🗑ボタンで全ブロックのテキストを一括リセット。展開/折りたたみ・📸・✏️と同じ行の左詰め側に並んでいる。確認ダイアログあり' : 'The 🗑 button in the output bar\'s left cluster resets all block text at once. A confirmation dialog appears' },
      { icon: '🕐 Ver', text: lang === 'ja' ? 'バージョン管理でブロック設定を名前付きスナップショットで保存。任意の時点に復元可能（最大10件）' : 'Version control saves named block-state snapshots. Restore to any of up to 10 saved points' },
      { icon: '⌘K', text: lang === 'ja' ? 'Ctrl+K コマンドパレットで全機能にキーボードからアクセス。「おまかせ」もここから実行可' : 'Ctrl+K command palette gives keyboard access to all features including Random generation' },
      { icon: '▦ Col', text: lang === 'ja' ? '【PC限定】列数切替（▢/▥/▦）でブロックを1/2/3列表示。ヘッダー右側に表示される' : '[PC only] Column toggle (▢/▥/▦) for 1/2/3-column block layout. Appears in the top-right header' },
      { icon: '↩ Undo', text: lang === 'ja' ? 'テンプレート適用後、変更されたブロックのヘッダーに↩ボタンが表示される。ブロック単位でテンプレート適用前の状態に戻せる（5秒間有効）' : 'After applying a template, ↩ appears on each changed block. Click to revert that block individually (active for 5 seconds)' },
      { icon: '↺ Reset', text: lang === 'ja' ? '✦ ツールメニューの「↺ブロック順リセット」でブロックの並び順をデフォルトに戻す。カスタムブロックは末尾に残る' : '"↺ Reset block order" in ✦ Tools restores the default arrangement. Custom blocks stay at end' },
      { icon: '💾 Backup', text: lang === 'ja' ? '💾バックアップでキャラデータをファイルに保存・別端末に移せる。🔗プロンプトをシェアでタグをURLに変換、リンクを開くだけで相手のLOOMに読み込まれる' : '💾 Backup saves character data to a file for transfer or safekeeping. 🔗 Share prompt encodes tags into a URL — opening the link loads it directly into LOOM' },
    ],
  },
  {
    icon: '📖',
    label: lang === 'ja' ? 'キャラシート — キャラクター管理ノート' : 'Character Sheet — Notes & Records',
    color: 'rgb(var(--c-orange))',
    iconBg: 'rgb(var(--c-orange) / 0.1)',
    iconBd: 'rgb(var(--c-orange) / 0.28)',
    items: [
      { icon: '📋 Profile', text: lang === 'ja' ? 'プロフィールシート：性格・口調・外見・設定など10項目＋カスタム項目でキャラクターの詳細を記録できる。🏷 AIタグボタンをONにすると各フィールドにプロンプトタグ欄が展開され「→」でブロックに直接挿入可能' : 'Profile Sheet: 10 sections + custom fields for character details. Toggle 🏷 Tags to reveal per-field prompt tag rows — "→" inserts directly into the matching block' },
      { icon: '📊 TSV', text: lang === 'ja' ? 'プロフィールシート右上の📊ボタンでTSV（タブ区切り）形式にコピー。Googleスプレッドシートに直接貼り付けてキャラ設定表として管理できる' : '📊 in the Profile Sheet header copies all data as TSV. Paste directly into Google Sheets for organized character management' },
      { icon: '🔄 Import', text: lang === 'ja' ? 'プロフィールシートの🔄ボタンで現在のエディタのブロックタグをAIタグフィールドに一括インポート。ブロックの内容を設定シートに反映させるのに便利' : '🔄 Import pulls the current editor block tags into the matching AI tag fields in the Profile Sheet' },
      { icon: '📋 Log', text: lang === 'ja' ? 'プロンプトログ：生成したプロンプトを記録して後から参照。ラベルやツールでフィルタリングも可能。COPYのたびに自動記録されるが、同じプロンプトは重複保存されない' : 'Prompt Log: records prompts automatically on COPY — deduplicates identical consecutive entries. Filter by label or tool' },
      { icon: '🔗 Map', text: lang === 'ja' ? 'タグ対応表：キャラクターの設定（日本語）とプロンプトタグ（英語）を紐付けて管理。「→」でブロックに直接挿入（重複タグは自動スキップ）' : 'Tag Map: link character settings (JA) to prompt tags (EN). "→" inserts into a block — duplicate tags are auto-skipped' },
      { icon: '🕐 Ver', text: lang === 'ja' ? 'バージョン管理：ブロック状態をスナップショット保存（最大10件）。衣装違い・設定差分の管理に便利' : 'Version Control: snapshot block states (up to 10). Great for managing outfit variants or setting differences' },
      { icon: '🖼', text: lang === 'ja' ? 'サムネイル：生成した画像をキャラクターに紐付けて視覚的な参照として保存（最大4枚）' : 'Thumbnail: attach up to 4 generated images to the character as visual references' },
      { icon: '📝 Memo', text: lang === 'ja' ? 'キャラクターメモ：LoRA名・使用モデル・生成のコツなど、プロンプト以外の情報を自由に記録' : 'Character Memo: freely record LoRA names, model info, tips — anything beyond the prompt itself' },
      { icon: '📖 Tab', text: lang === 'ja' ? 'キャラバー右の「📖キャラノート」タブで全ノート機能にアクセス。エディタとシームレスに切替可能' : 'Access all note features via the "📖 Note" tab in the character bar — seamlessly switches with the editor' },
    ],
  },
  {
    icon: '🎛',
    label: lang === 'ja' ? 'その他の機能一覧' : 'More Features',
    color: 'rgb(var(--muted))',
    iconBg: 'rgb(var(--dim) / 0.3)',
    iconBd: 'rgb(var(--dim) / 0.6)',
    items: [
      { icon: '🎬 Scene', text: lang === 'ja' ? '【キャラ2体以上で有効】シーン合成（✦ツール→🎬）：2〜3キャラのプロンプトを1つに合成。BREAKタグ区切り・比重調整に対応' : '[2+ characters required] Scene Compose (✦ Tools → 🎬): merge 2–3 character prompts. Supports BREAK separators and weight ratios' },
      { icon: '🆚 Diff', text: lang === 'ja' ? '【キャラ2体以上で有効】比較パネル（🆚）：キャラバーのエディタボタン左に現れるボタンから起動。2キャラのブロック設定を横並びで差分確認できる' : '[2+ characters required] Compare Panel (🆚): launched from the button left of the editor tab in the character bar. View two characters side-by-side' },
      { icon: 'A 解析', text: lang === 'ja' ? 'プロンプト逆解析（Aキー）：既存プロンプトを貼り付けてブロックに自動振り分け。他ツールからの移行に便利' : 'Analyze Prompt (A key): paste any existing prompt to auto-distribute tags into blocks. Great for migrating from other tools' },
      { icon: '⚠️ Check', text: lang === 'ja' ? 'コンフリクト検出：矛盾する組み合わせ（例: 水着×コート）に⚠️を表示。タグ編集の破綻チェックに活用' : 'Conflict detection: flags contradictory tag pairs (e.g. swimsuit + winter coat) with a ⚠️ warning' },
      { icon: '📊 Meter', text: lang === 'ja' ? 'バランスメーター：出力バー下部でブロック別タグ配分を横棒で可視化。プロンプトの偏りを確認できる' : 'Balance meter: bar below output shows tag distribution per block — spot imbalances at a glance' },
      { icon: '🌸 種族', text: lang === 'ja' ? '種族連動：エルフ・天使・魔物娘など種族タグをONにすると特殊パーツ（耳・翼・尻尾など）が自動追加・削除される' : 'Species auto-link: toggling species tags (elf, angel, etc.) auto-adds or removes related special parts' },
      { icon: '📁 Lib', text: lang === 'ja' ? 'ライブラリ・フォルダ：キャラをフォルダで整理。アーカイブ済みキャラは非表示になるが削除されない' : 'Library & Folders: organize characters with folders. Archived characters are hidden but not deleted' },
      { icon: '✦ Trans', text: lang === 'ja' ? '【キャラ2体以上で有効】ブロック転送（✦ツールメニュー）：選択ブロックの設定を別キャラへコピー。キャラ間でパーツを使い回せる' : '[2+ characters required] Block Transfer (✦ Tools): copy a block\'s settings to another character' },
      { icon: '📱 PWA', text: lang === 'ja' ? 'PWAインストール対応：ブラウザの「インストール」でアプリ化。オフラインでも動作し、ホーム画面から起動できる' : 'PWA support: install from the browser for an app-like experience. Works offline; launchable from home screen' },
    ],
  },
];

const PLATFORM_DIFF = (lang) => [
  {
    category: lang === 'ja' ? 'キャラクター識別' : 'Character ID',
    rows: [
      { feature: lang === 'ja' ? 'バー表示' : 'Bar display', mobile: lang === 'ja' ? '色の丸のみ' : 'Color dot only', pc: lang === 'ja' ? '色 + 種族絵文字 + 名前' : 'Color + species emoji + name' },
      { feature: lang === 'ja' ? '絵文字の変更' : 'Change emoji', mobile: lang === 'ja' ? '設定なし（色のみ）' : 'Not available (color only)', pc: lang === 'ja' ? 'キャラパネルで種族絵文字を設定' : 'Set species emoji in char panel', mobileNa: true },
    ],
  },
  {
    category: lang === 'ja' ? 'レイアウト' : 'Layout',
    rows: [
      { feature: lang === 'ja' ? 'ブロック列数' : 'Block columns', mobile: lang === 'ja' ? '1列固定' : '1 column fixed', pc: lang === 'ja' ? '1/2/3列を切替（▢/▥/▦）' : '1/2/3 columns (▢/▥/▦)' },
      { feature: lang === 'ja' ? '集中モード' : 'Focus mode', mobile: lang === 'ja' ? '対応（フルスクリーンオーバーレイ）' : 'Supported (fullscreen overlay)', pc: lang === 'ja' ? '⊕でブロック拡大＋サムネイルサイドバー' : '⊕ expands block + thumbnail sidebar' },
    ],
  },
  {
    category: lang === 'ja' ? 'ブロック操作' : 'Block Controls',
    rows: [
      { feature: lang === 'ja' ? 'カスタムブロック上限' : 'Custom block limit', mobile: lang === 'ja' ? '最大3個' : 'Max 3', pc: lang === 'ja' ? '最大5個' : 'Max 5' },
      { feature: lang === 'ja' ? '強度ボタン表示' : 'Strength buttons', mobile: lang === 'ja' ? '標準・強の2段階' : '2 levels (Norm / Strong)', pc: lang === 'ja' ? '6段階すべて表示' : 'All 6 levels shown' },
      { feature: lang === 'ja' ? 'ブロックへのジャンプ' : 'Jump to block', mobile: lang === 'ja' ? 'グリッドアイコン → ドロワー一覧' : 'Grid icon → drawer list', pc: lang === 'ja' ? 'スクロールで移動' : 'Scroll to navigate' },
      { feature: lang === 'ja' ? 'ブロックの非表示' : 'Hide block', mobile: lang === 'ja' ? 'Expertモード：ダブルタップ' : 'Expert: double-tap', pc: lang === 'ja' ? 'Expertモード：ダブルタップ' : 'Expert: double-tap' },
    ],
  },
  {
    category: lang === 'ja' ? '操作・機能' : 'Controls & Features',
    rows: [
      { feature: lang === 'ja' ? 'キーボードショートカット' : 'Keyboard shortcuts', mobile: lang === 'ja' ? '非対応' : 'Not available', pc: lang === 'ja' ? 'Ctrl+K / Ctrl+Enter など多数' : 'Ctrl+K, Ctrl+Enter and more', mobileNa: true },
      { feature: lang === 'ja' ? 'データ入出力' : 'Export / Import', mobile: lang === 'ja' ? 'キャラパネル内のボタン' : 'Buttons in char panel', pc: lang === 'ja' ? 'ヘッダー ✦ ツールメニュー' : 'Header ✦ Tools menu' },
      { feature: lang === 'ja' ? '出力バーの高さ調整' : 'Output bar resize', mobile: lang === 'ja' ? '▼で折りたたみのみ' : 'Collapse only (▼)', pc: lang === 'ja' ? 'ドラッグで自由に高さ調整' : 'Drag to resize freely' },
      { feature: lang === 'ja' ? 'クラウド同期' : 'Cloud sync', mobile: lang === 'ja' ? '対応（Google ログイン）' : 'Supported (Google login)', pc: lang === 'ja' ? '対応（Google ログイン）' : 'Supported (Google login)' },
    ],
  },
];

export default function SettingsModal({ onClose, lang, isMobile, hiddenBlockIds = new Set(), allBlocks = [], onRestoreBlock, onRestoreAllBlocks, theme, onToggleTheme, viewMode, onSetViewMode, onToggleLang, onShowWelcome, defaultTab, apiConfig, onSaveApiConfig }) {
  const [tab, setTab] = useState(defaultTab || 'shortcuts');
  const [localInput, setLocalInput]   = useState({ openai: '', claude: '' });
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiSaved, setApiSaved]       = useState(false);

  useEffect(() => {
    setLocalInput({ openai: '', claude: '' });
    setApiKeyVisible(false);
  }, [apiConfig]);
  const [openSections, setOpenSections] = useState(new Set(['🌱']));

  const toggleSection = (icon) => setOpenSections(prev => {
    const next = new Set(prev);
    next.has(icon) ? next.delete(icon) : next.add(icon);
    return next;
  });

  const hiddenBlocks = allBlocks.filter(b => hiddenBlockIds.has(b.id));

  const TABS = [
    { id: 'shortcuts', label: isMobile ? (lang === 'ja' ? '📱 Tips' : '📱 Tips') : (lang === 'ja' ? '⌨️ ショートカット' : '⌨️ Shortcuts') },
    { id: 'guide',     label: lang === 'ja' ? '📘 ガイド' : '📘 Guide' },
    { id: 'platform',  label: lang === 'ja' ? '📱/💻 版の違い' : '📱/💻 Platforms' },
    { id: 'api',       label: lang === 'ja' ? '🤖 API' : '🤖 API' },
    { id: 'about',     label: lang === 'ja' ? 'ℹ️ About' : 'ℹ️ About' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-[300] flex items-start justify-center px-4 pt-[6dvh] pb-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[33.75rem] overflow-hidden flex flex-col h-[80dvh]">

        {/* Header */}
        <div className="px-[1.125rem] py-[0.8125rem] border-b border-line flex items-center justify-between flex-shrink-0">
          <span className="text-fg text-sm font-bold">⚙️ {lang === 'ja' ? '設定' : 'Settings'}</span>
          <button onClick={onClose}
            className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        {/* ── Display settings — always visible ── */}
        <div className="px-3.5 py-2.5 border-b border-line flex-shrink-0 flex flex-wrap gap-x-4 gap-y-2 items-center">
          {/* Theme */}
          <div className="flex items-center gap-[0.4375rem]">
            <span className="text-muted text-[0.625rem] font-mono whitespace-nowrap">{lang === 'ja' ? 'テーマ' : 'Theme'}</span>
            <button onClick={onToggleTheme}
              className="flex items-center gap-[0.3125rem] rounded-[0.3125rem] px-[0.5625rem] py-1 text-[0.6875rem] font-mono font-bold cursor-pointer border transition-all duration-150 bg-surfalt border-line text-fg">
              {theme === 'dark' ? '🌙' : '☀️'}
              <span>{theme === 'dark' ? (lang === 'ja' ? 'ダーク' : 'Dark') : (lang === 'ja' ? 'ライト' : 'Light')}</span>
            </button>
          </div>
          {/* Language */}
          <div className="flex items-center gap-[0.4375rem]">
            <span className="text-muted text-[0.625rem] font-mono whitespace-nowrap">{lang === 'ja' ? '言語' : 'Language'}</span>
            <button onClick={onToggleLang}
              className="rounded-[0.3125rem] px-[0.5625rem] py-1 text-[0.6875rem] font-mono font-bold cursor-pointer border bg-surfalt border-line text-fg">
              {lang === 'ja' ? '🇯🇵 日本語' : '🇺🇸 English'}
            </button>
          </div>
          {/* View mode */}
          <div className="flex items-center gap-[0.4375rem]">
            <span className="text-muted text-[0.625rem] font-mono whitespace-nowrap">{lang === 'ja' ? '表示モード' : 'View mode'}</span>
            <div className="flex rounded-[0.3125rem] overflow-hidden border border-line">
              {([
                ['simple', '📋', lang === 'ja' ? 'シンプル' : 'Simple',  'rgb(var(--warn-text))', 'rgb(var(--warn-text) / 0.13)', 'rgb(var(--warn-text) / 0.38)'],
                ['normal', '🗂',  lang === 'ja' ? 'ノーマル' : 'Normal',  'rgb(var(--c-blue))',    'rgb(var(--tint-accent))',       'rgb(var(--c-blue) / 0.38)'],
                ['expert', '🔧', lang === 'ja' ? 'エキスパート' : 'Expert', 'rgb(var(--c-purple))', 'rgb(var(--c-purple) / 0.13)', 'rgb(var(--c-purple) / 0.38)'],
              ]).map(([mode, icon, label, col, bg, border]) => (
                <button key={mode} onClick={() => onSetViewMode(mode)}
                  className="px-[0.5625rem] py-1 text-[0.625rem] font-mono cursor-pointer border-r border-line last:border-r-0 transition-all duration-100 whitespace-nowrap"
                  style={viewMode === mode
                    ? { background: bg, color: col, borderColor: border }
                    : { background: 'transparent', color: 'rgb(var(--muted))' }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
          {/* Re-show welcome hint */}
          {onShowWelcome && (
            <button
              onClick={onShowWelcome}
              className="flex items-center gap-[0.3125rem] rounded-[0.3125rem] px-[0.5625rem] py-1 text-[0.6875rem] font-mono cursor-pointer border bg-surfalt border-line text-muted transition-colors duration-150"
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgb(var(--c-blue) / 0.5)'; e.currentTarget.style.color = 'rgb(var(--c-blue))'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
            >
              🧵 {lang === 'ja' ? '利用ヒントを再表示' : 'Show welcome hint'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line flex-shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-[0.5625rem] text-[0.625rem] font-mono font-semibold cursor-pointer transition-colors duration-150 ${
                tab === t.id
                  ? 'bg-tint-accent text-accent border-b-2 border-accent'
                  : 'bg-transparent text-muted'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 min-h-0">

          {/* ── Shortcuts / Mobile Tips tab ── */}
          {tab === 'shortcuts' && (
            <div className="px-[1.125rem] py-3.5 space-y-[1.125rem]">
              {isMobile ? (
                <>
                  <p className="text-muted text-[0.6875rem] font-mono bg-surfalt rounded-[0.4375rem] px-3 py-2">
                    📱 {lang === 'ja' ? 'スマホでの便利な使い方' : 'Tips for using LOOM on mobile'}
                  </p>
                  <div className="space-y-2.5">
                    {MOBILE_TIPS(lang).map((tip, i) => (
                      <div key={i} className="flex gap-2.5 items-start bg-surfalt rounded-lg px-3 py-[0.5625rem]">
                        <span className="text-lg flex-shrink-0 leading-none mt-[0.0625rem]">{tip.icon}</span>
                        <span className="text-fg text-xs leading-[1.65]">{tip.text}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted text-[0.6875rem] font-mono bg-surfalt rounded-[0.4375rem] px-3 py-2">
                    {lang === 'ja'
                      ? '⚠️ テキスト入力中（input / textarea フォーカス時）は無効です'
                      : '⚠️ Shortcuts are inactive while typing in input / textarea fields'}
                  </p>
                  {SHORTCUTS(lang).map(group => (
                    <div key={group.group}>
                      <div className="text-muted text-[0.625rem] font-mono font-bold tracking-[0.1em] uppercase mb-2">
                        {group.group}
                      </div>
                      <div className="space-y-1.5">
                        {group.items.map(item => (
                          <div key={item.keys.join('+')} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {item.keys.map((k, i) => (
                                <span key={k}>
                                  <kbd className="inline-flex items-center justify-center bg-surfalt border border-linebright rounded-[0.3125rem] px-2 py-[0.1875rem] text-[0.6875rem] font-mono text-fg min-w-7">
                                    {k}
                                  </kbd>
                                  {i < item.keys.length - 1 && (
                                    <span className="text-muted text-[0.625rem] mx-0.5">+</span>
                                  )}
                                </span>
                              ))}
                            </div>
                            <span className="text-fg text-xs flex-1">{item.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Hidden blocks section — shared between mobile and PC */}
              {hiddenBlocks.length > 0 && (
                <div>
                  <div className="text-muted text-[0.625rem] font-mono font-bold tracking-[0.1em] uppercase mb-2">
                    🚫 {lang === 'ja' ? '非表示中のブロック' : 'Hidden blocks'}
                  </div>
                  <div className="space-y-[0.3125rem]">
                    {hiddenBlocks.map(b => (
                      <div key={b.id} className="flex items-center gap-2 bg-surfalt rounded-[0.4375rem] px-2.5 py-1.5">
                        <span className="text-[0.8125rem]">{b.icon}</span>
                        <span className="text-fg text-xs font-semibold flex-1">{lang === 'ja' ? b.name : b.nameEn}</span>
                        <button onClick={() => onRestoreBlock(b.id)}
                          style={{ borderColor: b.color + '60', color: b.color }}
                          className="border rounded-[0.3125rem] px-2 py-[0.1875rem] text-[0.625rem] font-mono font-semibold cursor-pointer bg-transparent">
                          👁 {lang === 'ja' ? '表示に戻す' : 'Restore'}
                        </button>
                      </div>
                    ))}
                    {hiddenBlocks.length > 1 && (
                      <button
                        onClick={onRestoreAllBlocks}
                        className="w-full text-center border border-dim rounded-md py-[0.3125rem] text-[0.625rem] font-mono text-muted cursor-pointer bg-transparent mt-1">
                        {lang === 'ja' ? `すべて表示に戻す (${hiddenBlocks.length}件)` : `Restore all (${hiddenBlocks.length})`}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Guide tab ── */}
          {tab === 'guide' && (
            <div className="px-[1.125rem] py-3.5 space-y-2.5">
              <p className="text-muted text-[0.6875rem] font-mono bg-surfalt rounded-[0.4375rem] px-3 py-[0.4375rem]">
                {lang === 'ja'
                  ? '💡 LOOMの主要機能を習熟度別に紹介します。クリックで展開'
                  : '💡 LOOM features organized by experience level. Click to expand'}
              </p>

              {GUIDE(lang).map(section => {
                const isOpen = openSections.has(section.icon);
                return (
                  <div key={section.icon} className="rounded-[0.625rem] overflow-hidden border border-line">
                    <button
                      onClick={() => toggleSection(section.icon)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-[0.6875rem] bg-surfalt border-none cursor-pointer text-left"
                    >
                      <span className="text-lg">{section.icon}</span>
                      <span style={{ color: section.color }} className="text-xs font-bold flex-1">
                        {section.label}
                      </span>
                      <span className="text-muted text-[0.6875rem]">{isOpen ? '▲' : '▼'}</span>
                    </button>

                    {isOpen && (
                      <div className="px-3.5 py-2.5 space-y-2">
                        {section.items.map((item, i) => (
                          <div key={i} className="flex gap-2.5 items-start">
                            <span
                              style={{ background: section.iconBg || (section.color + '18'), color: section.color, border: `1px solid ${section.iconBd || (section.color + '40')}` }}
                              className="text-[0.5625rem] font-mono font-bold px-[0.3125rem] py-0.5 rounded flex-shrink-0 mt-[0.0625rem] min-w-9 text-center leading-tight whitespace-nowrap"
                            >
                              {item.icon}
                            </span>
                            <span className="text-fg text-xs leading-[1.65] flex-1">
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="text-center text-muted text-[0.625rem] font-mono pt-1 pb-0.5">
                {lang === 'ja' ? '機能は随時追加予定 · prompt-loom.com' : 'More features coming · prompt-loom.com'}
              </div>
            </div>
          )}

          {/* ── Platform comparison tab ── */}
          {tab === 'platform' && (
            <div className="px-[1.125rem] py-3.5 space-y-4">
              <p className="text-muted text-[0.6875rem] font-mono bg-surfalt rounded-[0.4375rem] px-3 py-[0.4375rem]">
                {lang === 'ja'
                  ? '📱 スマホ版と 💻 PC版（600px以上）の主な機能差異をまとめています'
                  : '📱 Mobile (below 600 px) vs 💻 PC — key feature differences at a glance'}
              </p>

              {PLATFORM_DIFF(lang).map(section => (
                <div key={section.category}>
                  <div className="text-muted text-[0.625rem] font-mono font-bold tracking-[0.1em] uppercase mb-2">
                    {section.category}
                  </div>
                  <div className="rounded-[0.625rem] overflow-hidden border border-line">
                    {/* Header row */}
                    <div className="grid grid-cols-[1fr_1fr_1fr] bg-surfalt border-b border-line">
                      <div className="px-2.5 py-1.5 text-[0.5625rem] font-mono text-muted uppercase tracking-[0.08em]">
                        {lang === 'ja' ? '機能' : 'Feature'}
                      </div>
                      <div className="px-2.5 py-1.5 text-[0.5625rem] font-mono text-muted uppercase tracking-[0.08em] border-l border-line">
                        📱 {lang === 'ja' ? 'スマホ' : 'Mobile'}
                      </div>
                      <div className="px-2.5 py-1.5 text-[0.5625rem] font-mono text-muted uppercase tracking-[0.08em] border-l border-line">
                        💻 PC
                      </div>
                    </div>
                    {section.rows.map((row, i) => (
                      <div key={i} className={`grid grid-cols-[1fr_1fr_1fr] ${i < section.rows.length - 1 ? 'border-b border-line' : ''}`}>
                        <div className="px-2.5 py-2 text-[0.6875rem] text-muted font-mono">
                          {row.feature}
                        </div>
                        <div className={`px-2.5 py-2 text-[0.6875rem] border-l border-line leading-snug ${row.mobileNa ? 'text-dim' : 'text-fg'}`}>
                          {row.mobile}
                        </div>
                        <div className={`px-2.5 py-2 text-[0.6875rem] border-l border-line leading-snug ${row.pcNa ? 'text-dim' : 'text-fg'}`}>
                          {row.pc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <p className="text-muted text-[0.625rem] font-mono text-center pt-0.5">
                {lang === 'ja' ? '画面幅 600px 以上で PC版レイアウトに切替わります' : 'PC layout activates at viewport width ≥ 600 px'}
              </p>
            </div>
          )}

          {/* ── API tab ── */}
          {tab === 'api' && (
            <div className="px-[1.125rem] py-[1.125rem] space-y-5">
              <p className="text-muted text-[0.6875rem] font-mono bg-surfalt rounded-[0.4375rem] px-3 py-2 leading-[1.7]">
                {lang === 'ja'
                  ? 'APIキーを設定すると3つのAI機能が有効になります。①自然文タブでAIが散文を整形、②✦ツールの「自然文からタグ生成」でキャラ説明をタグに変換、③出力バーの🤖提案で改善タグを提案。キーはこの端末のみに保存されます。'
                  : 'Setting an API key enables 3 AI features: ① AI polish in the Natural Text tab, ② "Text to Tags" in ✦ Tools to convert character descriptions to tags, ③ 🤖 Suggest in the output bar for tag recommendations. Keys are stored on this device only.'}
              </p>

              {/* API key acquisition links */}
              <div className="rounded-lg border border-line bg-surfalt px-3.5 py-[0.6875rem] space-y-2">
                <div className="text-muted text-[0.625rem] font-mono font-bold tracking-widest uppercase mb-1">
                  {lang === 'ja' ? 'APIキーの取得先' : 'Where to get API keys'}
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[0.6875rem] font-mono text-fg min-w-[6.875rem]">OpenAI (GPT-4o mini)</span>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent text-[0.6875rem] font-mono underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    platform.openai.com/api-keys →
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[0.6875rem] font-mono text-fg min-w-[6.875rem]">Claude (Haiku)</span>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent text-[0.6875rem] font-mono underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    console.anthropic.com →
                  </a>
                </div>
                <p className="text-muted text-[0.625rem] font-mono leading-[1.6] pt-0.5">
                  {lang === 'ja'
                    ? '無料枠あり。どちらも登録後すぐにキーを発行できます。利用料金はご自身のアカウントで発生します。'
                    : 'Both have free tiers. Keys can be issued immediately after registration. Usage fees apply to your own account.'}
                </p>
              </div>

              {/* Provider rows — one at a time: saving one locks the other */}
              {[
                { v: 'openai', label: 'OpenAI (GPT-4o mini)', placeholder: 'sk-...' },
                { v: 'claude', label: 'Claude (Haiku)', placeholder: 'sk-ant-...' },
              ].map(({ v, label, placeholder }) => {
                const isSaved = !!(apiConfig?.apiKey?.trim()) && apiConfig?.provider === v;
                const isLocked = !!(apiConfig?.apiKey?.trim()) && apiConfig?.provider !== v;
                const inputVal = localInput[v] ?? '';
                return (
                  <div key={v} className={`space-y-1.5 transition-opacity duration-150 ${isLocked ? 'opacity-30 pointer-events-none select-none' : ''}`}>
                    <div className="text-muted text-[0.625rem] font-mono font-bold tracking-widest uppercase">
                      {label}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type={isSaved && !apiKeyVisible ? 'password' : 'text'}
                        value={isSaved ? apiConfig.apiKey : inputVal}
                        readOnly={isSaved}
                        onChange={e => !isSaved && setLocalInput(prev => ({ ...prev, [v]: e.target.value }))}
                        placeholder={placeholder}
                        className="flex-1 rounded-[0.4375rem] px-2.5 py-[0.4375rem] text-xs font-mono outline-none border bg-bg text-fg"
                        style={isSaved ? { borderColor: 'rgb(var(--c-green) / 0.5)', opacity: 0.75 } : { borderColor: 'rgb(var(--border))' }}
                        spellCheck={false}
                      />
                      {isSaved ? (
                        <>
                          <button onClick={() => setApiKeyVisible(x => !x)}
                            className="rounded-[0.4375rem] px-2.5 py-[0.4375rem] text-[0.6875rem] border border-line bg-surfalt text-muted cursor-pointer shrink-0">
                            {apiKeyVisible ? '🙈' : '👁'}
                          </button>
                          <button
                            onClick={() => { onSaveApiConfig?.({ provider: v, apiKey: '' }); }}
                            className="rounded-[0.4375rem] px-2.5 py-[0.4375rem] text-[0.6875rem] font-mono border border-dim bg-surfalt text-muted cursor-pointer shrink-0">
                            {lang === 'ja' ? '削除' : 'Delete'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { if (!inputVal.trim()) return; onSaveApiConfig?.({ provider: v, apiKey: inputVal }); setApiSaved(v); setTimeout(() => setApiSaved(false), 2000); }}
                          disabled={!inputVal.trim()}
                          className="rounded-[0.4375rem] px-3.5 py-[0.4375rem] text-[0.6875rem] font-bold cursor-pointer border-none text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-default shrink-0"
                          style={{ background: apiSaved === v ? 'rgb(var(--c-green))' : 'rgb(var(--c-blue))' }}
                        >
                          {apiSaved === v ? '✓' : (lang === 'ja' ? '保存' : 'Save')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── About tab ── */}
          {tab === 'about' && (
            <div className="px-[1.125rem] py-[1.125rem] space-y-5">

              {/* App identity */}
              <div className="text-center pt-2 pb-1">
                <img src="/logo.png" alt="LOOM" className="w-[16.25rem] h-[6.25rem] object-contain mx-auto mb-1.5" />
                <div className="text-muted text-xs font-mono mb-1.5">The Prompt Weaving Studio</div>
                <div className="inline-flex items-center gap-1.5 bg-tint-accent border border-accent/30 rounded-full px-3 py-1">
                  <span className="text-accent text-[0.6875rem] font-mono font-bold">{APP_VERSION}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-surfalt rounded-[0.625rem] px-3.5 py-3">
                <div className="text-muted text-[0.625rem] font-mono font-semibold uppercase tracking-[0.08em] mb-1.5">
                  {lang === 'ja' ? 'このアプリについて' : 'About'}
                </div>
                <p className="text-fg text-xs leading-[1.7]">
                  {lang === 'ja'
                    ? 'LOOMは、AIイラスト生成ツール（Midjourney・NovelAI・Stable Diffusion・Flux・DALL-Eなど）向けのプロンプトを、タグ単位でビジュアルに管理・構築するためのブラウザアプリです。'
                    : 'LOOM is a browser-based app for visually building and managing prompts for AI image tools like Midjourney, NovelAI, Stable Diffusion, Flux, and DALL-E.'}
                </p>
                <p className="text-muted text-[0.6875rem] leading-[1.7] mt-2">
                  {lang === 'ja'
                    ? 'すべてのデータはお使いのブラウザ内（IndexedDB）に保存されます。外部サーバーへの送信はありません。'
                    : 'All data is stored locally in your browser (IndexedDB). Nothing is sent to external servers.'}
                </p>
                <p className="text-muted text-[0.6875rem] leading-[1.7] mt-1.5">
                  {lang === 'ja' ? '公式X（Twitter）: ' : 'Official X (Twitter): '}
                  <a href="https://x.com/prompt_loom" target="_blank" rel="noopener noreferrer"
                    className="text-accent underline underline-offset-2">
                    @prompt_loom
                  </a>
                  {lang === 'ja' ? ' — 最新情報・アップデートはこちら' : ' — follow for updates and announcements'}
                </p>
              </div>

              {/* Tech stack */}
              <div>
                <div className="text-muted text-[0.625rem] font-mono font-semibold uppercase tracking-[0.08em] mb-2">
                  {lang === 'ja' ? '技術スタック' : 'Built with'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['React 18', 'Vite', 'Tailwind CSS', 'IndexedDB (Dexie)', 'PWA', '@dnd-kit'].map(tech => (
                    <span key={tech} className="bg-surfalt border border-line rounded-[0.3125rem] px-2 py-[0.1875rem] text-muted text-[0.625rem] font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Version history */}
              <div>
                <div className="text-muted text-[0.625rem] font-mono font-semibold uppercase tracking-[0.08em] mb-2">
                  {lang === 'ja' ? 'バージョン履歴（主要マイルストーン）' : 'Version milestones'}
                </div>
                <div className="space-y-[0.3125rem]">
                  {[
                    { v: 'v2.0', note: lang === 'ja' ? 'フォーカスモードをスマホに対応（フルスクリーンオーバーレイ）。アクティブタグストリップ追加（クリックでカテゴリジャンプ＆ハイライト）。高DPI/FHD向けremベース・レスポンシブフォント。ランダム生成を2モード再設計（🧍キャラデザ/🖼️イラスト）。逆解析に一括適用・未認識タグのカスタム登録。クラウド同期に「今すぐ同期」ボタン・オフライン復帰自動再Push・履歴オートスライス。競合タグ警告を2段階化（エラー/ソフト）。タグ名変更エイリアス・カテゴリ安定ID対応（データ移行堅牢化）' : 'Focus mode now on mobile (fullscreen overlay). Active tag strip — click chip to jump to its category with highlight. Responsive rem-based font for HiDPI/FHD. Random gen redesigned: 2 modes (🧍 Char.Design / 🖼️ Illust). Analyze: batch apply + custom-import for unknown tags. Cloud sync: "Sync now" force-pull, auto-retry on reconnect, history auto-slice. Conflict warnings now two-level (error / soft). Tag alias migration + stable category IDs for data robustness.' },
                    { v: 'v1.9', note: lang === 'ja' ? '極限クローズアップテンプレート追加（口元・目・魚眼）。テンプレートにネガ推奨タグ（negHint）表示。全テンプレートタグをブロックで個別選択可能に統一。ブロック別テンプレート適用取り消し（↩）ボタン追加。キャラノート設定シートにAIタグフィールド・TSVエクスポート・エディタからのインポートを統合。プロンプトログの重複自動記録防止・タグ対応表の挿入時重複スキップ。ランダム生成から特定タグを除外するexcludeFromRandomフラグ追加。競合ルール・タグ辞書拡充' : 'New extreme close-up templates (lip focus, eye focus, fisheye). Templates show negHint suggestions. All template tags now individually selectable in blocks. Per-block template undo (↩) button. Character note profile sheet gains per-field AI tag rows, TSV export, and editor import. Prompt log dedup on COPY, tag map insert dedup. excludeFromRandom flag to prevent extreme tags in random generation. Expanded conflict rules and tag dictionary.' },
                    { v: 'v1.8', note: lang === 'ja' ? 'コードアーキテクチャ刷新：クラウド同期ロジックをuseCloudSync・ランダム生成ロジックをuseRandomGenフックに分離。新追加種族タグ（catgirl・dark elf・dragon girl・android・slime girl等）・artstyleタグ（retro artstyle・tarot card）・髪型タグ（layered hair）対応。競合ルール追加（レトロアニメ/タロットカード×リアル・3D、レイヤードヘア×ショート）。タグ辞書・破綻チェック全面監査' : 'Architecture refactor: cloud sync extracted to useCloudSync hook, random generation to useRandomGen hook. New species tags (catgirl, dark elf, dragon girl, android, slime girl, etc.), artstyle tags (retro artstyle, tarot card), hairstyle tag (layered hair). New conflict rules (retro artstyle/tarot card vs realistic/3D, layered hair vs short). Full tag dictionary & conflict audit.' },
                    { v: 'v1.7', note: lang === 'ja' ? 'ランダム生成システム全面再構築。Tier3タグ分類・おまかせ2モード（🧍キャラデザ/🖼️イラスト）・排他ルール（フレーミング×下半身・環境×エフェクト・ポーズ・表情・スタイル矛盾）・コンボシステム（武器→fighting stance・人魚→underwater等）。バリエーション生成を固定ブロック（種族・顔・体型）＋再ロールブロック（衣装・構図・背景・エフェクト・照明）方式に変更。武器タグ低確率枠（約12%）で追加。モード設定をLocalStorageで記憶。タグ・辞書・競合ルール追加' : 'Random generation system overhaul: Tier3 tag classification, 2-mode random (🧍 Char.Design / 🖼️ Illust), exclusion rules (framing × lower-body, environment × effects, pose, expression, style conflicts), combo system (weapon→fighting stance, mermaid→underwater, etc.). Variations redesigned: fixed blocks (attribute/face/body) + reroll blocks (outfit/composition/background/effect/lighting). Weapon tags at ~12% probability. Mode saved to LocalStorage. New tags, dictionary entries, conflict rules.' },
                    { v: 'v1.6', note: lang === 'ja' ? '画像からタグ生成（OpenAI/Claude Vision対応）。データ入出力を1キャラクター単位に統一。UI用語整理（バックアップ/復元/プロンプトをシェア）。ログイン案内強化・同期失敗トースト・APIキー取得リンク追加。URLシェアペイロード最適化' : 'Image-to-tags via vision API (OpenAI/Claude). Data import/export unified to single-character unit. UI label cleanup (Backup/Restore/Share prompt). Prominent sync login, sync-fail toast, API key acquisition links. Share URL payload optimization' },
                    { v: 'v1.5', note: lang === 'ja' ? 'AI機能追加：自然文タブのAI文章整形・✦ツールに自然文→タグ変換・出力バーにAIタグ提案（OpenAI/Claude対応）。PWAアイコン修正。ユーザーAPIキー方式を採用' : 'AI features: AI polish in Natural Text tab, Text→Tags in ✦ Tools, AI tag suggestions in output bar (OpenAI & Claude). PWA icon fix. User-provided API key approach.' },
                    { v: 'v1.4', note: lang === 'ja' ? '絵文字を種族・職業系21種に刷新・セキュリティ強化・破綻タグの検出と生成防止拡充・ヘッダーグリッドアイコン・タグ辞書追加・設定にスマホ/PC差異タブ追加' : 'Emoji overhaul (21 species/archetype), security hardening, expanded conflict detection + generation prevention, grid header icon, tag dictionary additions, Mobile vs PC comparison tab in Settings' },
                    { v: 'v1.3', note: lang === 'ja' ? 'SFWタグ自動連携（ネガティブにnsfw自動追加/削除）・タグ大幅拡充（衣装・髪型・フットウェアほか）・単一キャラ生成保証・バリエーション同キャラ維持強化' : 'SFW auto-link (auto-add/remove nsfw in negative), major tag additions (outfits, hairstyles, footwear, etc.), single-character generation guaranteed, improved variations for same-character looks' },
                    { v: 'v1.2', note: lang === 'ja' ? 'Googleログイン＆Firestoreクラウド同期・.loom独自拡張子・スマホデータ入出力・ウェルカムヒントライトモード視認性改善・英語ローカライズ修正' : 'Google login & Firestore cloud sync, .loom file format, mobile export/import, welcome hint light-mode contrast fix, EN localization fixes' },
                    { v: 'v1.1', note: lang === 'ja' ? 'ボーダー描画バグ修正・フォーカスモードタグサイズ修正・スマホキャラパネルUI改善・ウェルカムヒント再表示ボタン・トースト再設計・Vercel Analytics導入' : 'Border rendering bug fixes, focus mode tag size fix, mobile char panel improvements, welcome hint re-show, toast redesign, Vercel Analytics' },
                    { v: 'v1.0', note: lang === 'ja' ? 'NAI重み{}変換・DALL-E自動自然文切替・バリエーション別自然文トグル・キャラパネルコンパクト化・ツール出力差別化・The Prompt Weaving Studio公開' : 'NAI {} weight conversion, DALL-E auto natural text, per-variation natural text toggle, compact character panel, tool output differentiation, public launch as The Prompt Weaving Studio' },
                    { v: 'v0.9', note: lang === 'ja' ? 'UI統一・全カラーCSS変数化・スマホMJ ARチップ・ブロック順リセット・✦ツールメニュー刷新・COPYボタン拡大・バリエーション3パターン化' : 'UI unification, full CSS-var colors, mobile MJ AR chips, block order reset, ✦ Tools menu overhaul, larger COPY, 3-variation output' },
                    { v: 'v0.8', note: lang === 'ja' ? '自然文生成・PC/スマホUI全面刷新・ブロックジャンプサイドバー・ダブルタップ非表示・出力バー再設計' : 'Natural text output, full PC/mobile UI overhaul, block jump sidebar, double-tap hide, output bar redesign' },
                    { v: 'v0.7', note: lang === 'ja' ? 'モバイル対応・おまかせ生成・バリエーション改善・ガイド拡充' : 'Mobile responsive, random gen, improved variations, expanded guide' },
                    { v: 'v0.6', note: lang === 'ja' ? 'Expert/Simpleモード・ブロック非表示・カスタムブロックリネーム' : 'Expert/Simple mode, block hiding, custom block rename' },
                    { v: 'v0.5', note: lang === 'ja' ? 'キャラノート（PromptLog・TagMap）・バージョン管理' : 'Character notes (PromptLog, TagMap), version control' },
                    { v: 'v0.4', note: lang === 'ja' ? 'テンプレート・カラーピッカー・シーン合成・コマンドパレット' : 'Templates, color picker, scene compose, command palette' },
                    { v: 'v0.3', note: lang === 'ja' ? '複数キャラ管理・履歴・スナップショット・PWA対応' : 'Multi-character, history, snapshot, PWA support' },
                    { v: 'v0.1–0.2', note: lang === 'ja' ? '基本ブロックエディタ・タグシステム・LoRA管理' : 'Basic block editor, tag system, LoRA management' },
                  ].map(({ v, note }) => (
                    <div key={v} className="flex gap-2.5 items-start text-[0.6875rem]">
                      <span className="font-mono font-bold text-accent flex-shrink-0 w-[2.625rem]">{v}</span>
                      <span className="text-muted leading-[1.5]">{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-surfalt rounded-[0.625rem] px-3.5 py-3">
                <div className="text-muted text-[0.625rem] font-mono font-semibold uppercase tracking-[0.08em] mb-1.5">
                  {lang === 'ja' ? '免責事項' : 'Disclaimer'}
                </div>
                <ul className="space-y-[0.3125rem]">
                  {(lang === 'ja' ? [
                    '本アプリは現状のまま（as-is）提供されます。動作・出力内容に関して、開発者は明示・黙示を問わず一切の保証を行いません。',
                    'ブラウザのデータクリア・キャッシュ削除等によるデータ消失について、開発者は責任を負いません。定期的にJSONバックアップをご利用ください。',
                    '本アプリで生成したプロンプト・コンテンツの利用は、各AIサービス（Midjourney・NovelAI等）の利用規約に従ってください。当開発者はその内容について一切の責任を負いません。',
                    '本アプリの利用によって生じた損害（データ損失・生成物に関するトラブル等）について、開発者は一切の賠償責任を負わないものとします。',
                  ] : [
                    'This app is provided "as-is" without any warranty, express or implied. The developer makes no guarantees regarding operation or output.',
                    'The developer is not liable for data loss caused by browser cache clearing or storage limits. Please use JSON export for regular backups.',
                    'Use of prompts and content generated by this app is subject to each AI service\'s terms of use (Midjourney, NovelAI, etc.). The developer bears no responsibility for such content.',
                    'The developer shall not be liable for any damages arising from use of this app, including data loss or issues related to generated content.',
                  ]).map((text, i) => (
                    <li key={i} className="flex gap-1.5 items-start text-muted text-[0.625rem] leading-[1.6]">
                      <span className="flex-shrink-0 mt-0.5">·</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Copyright */}
              <div className="border-t border-line pt-3.5 text-center space-y-1">
                <div className="text-fg text-[0.6875rem] font-mono font-semibold">
                  © {APP_YEAR} LOOM Project
                </div>
                <div className="text-muted text-[0.625rem] font-mono">
                  <a href="https://prompt-loom.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">prompt-loom.com</a>
                  {' · '}
                  <a href="https://x.com/prompt_loom" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">@prompt_loom</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
