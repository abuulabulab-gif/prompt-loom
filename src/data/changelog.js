// 更新履歴の一次ソース（2026-08-06 一元化）。
// ここに書けば ①設定画面のバージョン履歴（ja/en） ②ROADMAP.md（npm run roadmap で転記）
// の両方に出る＝同じ内容を2ヶ所に書かない（分岐の芽を断つ）。新しい版は先頭に足す。

export const CHANGELOG = [
  {
    v: 'v2.10',
    ja: '🎨多色髪カテゴリ新設（顔・表情ブロック）：ツートン髪・多色髪・インナーカラー・グラデ髪・左右分け色・メッシュ髪・毛先カラーの7タグ（全てDanbooru実在・タグ辞書の解説つき）。これまで自由入力でしか組めなかった「ベース色＋差し色」の髪（インナーカラー等）が棚から選べるように。衣装まわりに立襟・詰襟（形状・カット）とケープレット・短マント（コスプレ・ファンタジー）を追加。きっかけ＝キャラ立ち絵の量産テストで、多色髪の層が棚に丸ごと無いと判明したため',
    en: '🎨 New Multicolor Hair category (Face block): two-tone, multicolored, colored inner hair, gradient, split-color, streaked, and colored tips — 7 Danbooru-verified tags with dictionary entries. Base-plus-accent hair styles (inner color etc.) no longer require custom input. Also added high collar (Shape/Cut) and capelet (Cosplay) to outfit shelves. Prompted by a character-sheet production test that revealed the multicolor-hair layer was missing from the shelves entirely.',
  },
  {
    v: 'v2.9',
    ja: '🌓左右メーカー新設：「片方だけ（片手袋・片ソックス・片耳イヤリング等）・左右で丈違い・左右別デザイン」を部位ごと（髪/肩袖/手袋/レッグ/靴/服全体/アクセ）に選んで、それぞれの持ち場のブロックへ一括追加。衣装・衣装ディテールブロックと✦ツールメニューに🌓ボタン、Ctrl+Kにも登録。カットメーカーの片肩出し・アシンメトリー衣装は左右メーカーへ引っ越し（左右系の家は1つ）。静的タグ拡充：袖4種（片分離袖・左右違い袖ほか）・手袋4種・レッグ5種（片脚ストッキング・オーバーニー・縞ニーハイ等）・靴3種（片靴・左右違い靴等）・前短後長スカート・アシンメトリードレス・片耳イヤリング・アシメ前髪/ヘア・片側お団子（全てタグ辞書に解説つき。片靴・片ブーツ・片脚スト・左右違い靴はおまかせのレア枠）。破綻チェック拡充：左右系の重ね掛け13ルール（片方ニーハイ×両脚ニーハイ等＝おまかせ生成からも自動除外）＋人魚・ラミア表の抜け7種（オックスフォード・バレエ・ミュール・ヒール・左右で丈違い等）を補修。🩺健康診断を強化：素体の抜け（肌色・身長感＝まとめて1件）・ブロック間の同タグ重複・全体タグ過密（46以上）を注意に追加、ツールチップに詳細。メーカー生成タグの日本語訳を機械で総点検＝2,283通り全部解決済み（抜けゼロを確認）。⊞キャラ設定シートに「一覧で編集」モード＝全節・全項目をアコーディオン無しで1画面に並べ、Enterで次の欄へ飛びながら一気に書き込める（スプレッドシート感覚。切替はシート上部の⊞ボタン・タグ欄と項目管理はフォーム表示のまま）。内部整理：カット・左右メーカーを共通部品（グループメーカー）に一本化＝次のメーカーはデータ定義だけで作れる。更新履歴を一次ソース1ヶ所（changelog.js）に一元化しROADMAPへは自動転記',
    en: '🌓 Asymmetry Maker: pick single-side (single glove, single sock, single earring…), uneven-length, and mismatched designs per body zone (hair / sleeves / gloves / legwear / shoes / whole outfit / accessories) — tags route to their home blocks in one apply. 🌓 button on Outfit & Outfit Detail blocks, ✦ Tools menu, and Ctrl+K. Single bare shoulder & asymmetrical clothes moved from Cutout Maker (asymmetry now has one home). New static tags with dictionary entries: 4 sleeve, 4 glove, 5 legwear (single leg pantyhose, over-kneehighs, striped thighhighs…), 3 footwear, high-low skirt, asymmetrical dress, single earring, asymmetrical bangs/hair, single hair bun (theatrical singles are rare in random). Conflict rules: 13 new asymmetry-stacking rules (single thighhigh × thighhighs etc. — also auto-excluded from random gen) plus 7 missing mermaid/lamia footwear rules patched. 🩺 Health check upgraded: base-body gaps (skin tone / height), cross-block duplicate tags, and overall crowding (46+) added with tooltip details. Machine-swept all 2,283 maker-generated tags for Japanese labels — zero gaps confirmed ⊞ Character sheet gains a Grid edit mode — every section and field on one screen, no accordions, Enter jumps to the next field (spreadsheet-style; toggle via the ⊞ button; tag rows stay in form view). Internals: Cutout & Asymmetry makers unified into one shared Group Maker component — future makers are data-only. Changelog unified into a single source (changelog.js) with auto-transcription to ROADMAP.',
  },
  {
    v: 'v2.8',
    ja: '✂️カットメーカー拡張：新グループ「留め・編み上げ」（ジッパー・Oリング・編み上げ）を追加。シルエット変形にハイレグ・ホルターネック・クロスホルター・深Vネック・片肩出し・アシンメトリー衣装、開口部・窓にハートくり抜き、素材・質感に半透明（シースルーと重ねる同義補強向け）を追加——全11タグにタグ辞書の解説つき。採用タグはDanbooru実在＆投票数を確認済み（単体で票が入らない語は見送り）。⭐基本品質ブロックが最初から折りたたまれた状態に：定番の品質タグ（masterpiece等）は最初から選択済みで出力に入るので、開いて調整するのはこだわりたい人だけでOK——新規キャラ作成時に最初に目に入るのが「キャラ作り」になるように',
    en: '✂️ Cutout Maker expanded: new "Fastening" group (zipper, o-ring, cross-laced), plus highleg, halterneck, criss-cross halter, plunging neckline, single bare shoulder, and asymmetrical clothes in Silhouette, heart cutout in Cutouts, and translucent in Texture (stack with see-through for reinforcement) — all 11 tags with dictionary entries, each verified against Danbooru post counts (dead-vote words skipped). ⭐ Quality block now starts collapsed: proven defaults (masterpiece etc.) are pre-selected and always included in output, so newcomers land straight on character building — open it only when you want to fine-tune.',
  },
  {
    v: 'v2.7',
    ja: '📦プリセット束化：衣装プリセットが衣装ディテール（窓・素材・トリム）込み、構図プリセットが背景・照明・効果込みで保存＆適用されるように（旧プリセットは従来どおり動作）。プリセットに「🚫ネガ差分」（適用時にネガティブへ自動追記——衣装ごとの禁止タグを持ち歩ける）と「📝メモ」（構造ノート）を追加、チップの⋯メニューから編集。メーカー製タグ（🎨🎯🧵印つき）をクリックすると、そのブロックに配置されたメーカーが開くように（破線下線が目印）。特徴メーカー大幅拡充：リボン位置（首/腕/脚/足首/背中）・タトゥーの柄（花/ハート/龍/蝶/トライバル）＆位置7箇所・フェイスマーク「位置×図形」（頬＝星/ハート/三角/四角/ダイヤ/十字ほか・目の下＝民族風/ライン/三角/ドット）・傷跡「目を縦断」・包帯「片目/頭」。マテリアルメーカーにリブ編み・シースルー素材と「セーター」部位を追加、色付きタグ（black turtleneck等）でも部位トリガーが効くよう修正。カラーメーカーに靴ひも・帯・チョーカー・ベルト・カチューシャ・タトゥー・フェイスマークの色スロット新設（体型ブロックにも🎨追加）。衣装ディテールに袖カテゴリ（分離袖・二層袖・萌え袖等）、着物系にショート着物・帯、レッグウェアに左右で丈違い、ボトムスにデニムショーパン・カットオフ等を追加（新タグは全てタグ辞書に解説つき）。PixAIツールプロファイル追加。✦ツールメニューの横幅拡大（素体モードの見切れ解消）',
    en: '📦 Preset bundles: costume presets now save & apply with Outfit Detail (cutouts, fabrics, trims), shot presets with background/lighting/effects (legacy presets still work). Presets gain 🚫 negative-diff (auto-appended to Negative on load) and 📝 memo, editable from the chip ⋯ menu. Maker-made tags (🎨🎯🧵 marked) are now clickable — opens the maker placed on that block (dashed underline). Feature Maker greatly expanded: ribbon positions (neck/arm/leg/ankle/back), tattoo motifs (flower/heart/dragon/butterfly/tribal) & 7 positions, face marks as a position×shape matrix (cheek: star/heart/triangle/square/diamond/cross…, under-eyes: tribal/line/triangle/dots), scar across eye, bandage over one eye / head. Material Maker: ribbed & see-through materials, new sweater target, and colored tags (black turtleneck etc.) now trigger targets correctly. Color Maker: new slots for shoelaces, obi, choker, belt, hairband, tattoo, and facial mark (Body block gains 🎨). New static tags with dictionary entries: sleeves category (detached/layered/past-wrists…), short kimono & obi, uneven legwear, denim shorts & cutoffs. PixAI tool profile. Wider ✦ Tools menu.',
  },
  {
    v: 'v2.6',
    ja: '🧍素体モード追加（✦ツール内）：シーン系5ブロック（作風・効果・構図・背景・照明）を一括で一時OFF/ON。タグは保持したまま「キャラクター情報のみのプロンプト」をワンタッチで出力——キャラの一貫性運用（素体→テンプレ派生→復帰）の起点に。キャラ固定用タグを公式化：体型に「低身長（short stature）」・肌色に「色白（fair skin）」・髪飾りに「黒/赤/白リボン」を追加',
    en: '🧍 Base-body mode added (in ✦ Tools): mute/unmute the 5 scene blocks (artstyle, effect, composition, background, lighting) at once — output a character-only prompt in one tap while keeping all tags. New official tags for character consistency: short stature (Body Type), fair skin (Skin), black/red/white ribbon (Hair Detail).',
  },
  {
    v: 'v2.5',
    ja: '✂️カットメーカー追加：衣装ディテールへ「開口部・窓／シルエット変形／素材・質感」の切り抜き系タグを複数選択で追記（既存タグは✓表示・重複は自動除外）。テンプレートに「ベース」機構を導入：初適用時に全ブロックの状態（タグ＋ON/OFF）を自動記録し、テンプレを何連続で重ねても「⟲ベースに戻す」やブロック単位⟲でいつでも派生前へ完全復帰（📌でベース更新も可能）。フォーカス系（瞳・口元）／シート系（素材白背景・三面図・設定シート）テンプレは、ノイズになるブロックを削除せず一時OFFに（タグ保持・スイッチで即復活）。おまかせ生成の性別比を調整（女の子78%／男の子14%／男の娘5%／中性3%）。破綻チェック拡充（child・loli×胸サイズ/過激衣装）。特徴メーカーを衣装→衣装ディテールへ移動',
    en: 'Cutout Maker added: layer cutout / silhouette / fabric tags onto Outfit Detail with multi-select (existing tags marked ✓, duplicates skipped). Template "base" system: on first apply, all block states (tags + on/off) are auto-recorded — chain any number of templates and fully return via "Restore base" or per-block ⟲ (📌 to re-anchor). Focus (eye/lip) and sheet (asset/3-view/design sheet) templates now mute noisy blocks instead of deleting (tags kept, one-tap re-enable). Random gender ratio tuned (girl 78% / boy 14% / femboy 5% / androgynous 3%). Conflict rules expanded (child/loli × bust size & revealing outfits). Feature Maker moved from Outfit to Outfit Detail.',
  },
  {
    v: 'v2.4',
    ja: 'カラーメーカー衣装着色を動的タグ検出方式に全面刷新（巫女服→black shrine maiden等、実際の衣装タグに直接色を付与）。ボトムス・フットウェア・レッグウェア・メイクアップ（アイシャドウ・口紅）・ストッキングのカラースロットを新設。体型ブロックに体型・骨格カテゴリ新設（wide hips・thick thighs・long legs・thigh gap・broad shoulders）。ボディフォーカスにnavel・collarboneを追加し衣装連動で自動付与。ランダム生成にSFW/NSFWガード（品質にSFW・ネガティブにnsfw必ず付与）と衣装連動のソシャゲ系ボディフォーカス緩和を追加。特徴メーカーに眉ピアスを追加。破綻チェックにthick thighs/thigh gap・collarbone/ハイネック等の新ルール追加。プロンプト健康診断に一貫性チェック（髪色・目の色・タグ数）を追加',
    en: 'Color Maker outfit coloring fully rewritten with dynamic tag detection (e.g. shrine maiden→black shrine maiden). New color slots: bottoms, footwear, legwear, makeup (eyeshadow/lipstick), stockings. New Body Structure category (wide hips, thick thighs, long legs, thigh gap, broad shoulders). Body Focus gains navel/collarbone with outfit-triggered auto-assignment. Random gen adds SFW/NSFW guard (SFW in quality, nsfw in negative always) and low-probability social-game-style body focus relaxation. Feature Maker: eyebrow piercing added. Conflict checker: new rules for thick thighs/thigh gap, collarbone/high neck, etc. Health diagnosis adds consistency check (hair color, eye color, tag count).',
  },
  {
    v: 'v2.3',
    ja: 'マテリアルメーカー追加：衣装内容から素材と部位を2ステップ選択してタグ生成。バリエーション生成に全自動付与レイヤー追加（カラー・マテリアル・特徴・雰囲気を自動ブレンド）。テンプレート全面見直し：ダイナミック/フェチ構図/真俯瞰など新規追加、negHintをネガティブブロックへ自動追記。衣装ブロック再編（形状・カット/レッグウェア/フットウェア分離）。ランダムロジック改善。シンプルモードのブロック構成見直し・全ブロック初期展開。カラー・特徴・マテリアルメーカーのUIデザイン統一',
    en: 'Material Maker added: 2-step flow (material → target part) generates tags based on current outfit. Variations gain auto-layer system (color, material, feature, atmosphere blended automatically). Full template overhaul: new dynamic/feti/birdseye templates, negHint auto-appended to Negative block. Outfit block restructured (separate shape/cut, legwear, footwear categories). Random logic improvements. Simple mode block layout revised with all blocks expanded by default. Color / Feature / Material Maker UI design unified.',
  },
  {
    v: 'v2.2',
    ja: 'キャラクターパネル強化：背景暗転・幅拡大・ブロックドット大型化。プロンプト健康診断をキャラパネルに追加（良/小/中/大の4段階評価）：競合タグルール違反とブロック過密（14タグ超）を自動検出してリスク表示。キャラ名20文字・キャラメモ500文字の上限設定（メモ欄に残字数カウンター表示）。キャラバーのボタン間隔調整（比較/エディタ/キャラノート）',
    en: 'Character panel improvements: darkened backdrop, wider panel, larger block dots. Prompt health diagnosis added to character panel — auto-detects tag conflicts and block crowding (14+ tags), displays risk as 良/小/中/大. Character name capped at 20 chars; character memo capped at 500 chars with live counter. Wider spacing between Compare / Editor / Note buttons in the character bar.',
  },
  {
    v: 'v2.1',
    ja: 'カラーメーカーv2：髪グラデ・ツートン・スプリット対応、背景・爪・しっぽカラー追加。特徴メーカー拡張：眼鏡サブタイプ選択、絆創膏（顔/ボディ）・ボディほくろ・ピアス追加。キャラクターパネル（PCグリッドアイコン）：縦リストでサムネ/絵文字・ブロックドット・充実度バー・タグ数を一覧表示、クリックでキャラ切替・新キャラ追加も可能。絵文字カスタム入力：プリセット外の任意絵文字を直接入力可能に。ユニコーン🦄を絵文字一覧に追加（22種）。衣装ブロックにレッグウェア・フットウェアカテゴリ分離追加。LOOMロゴクリック・タップでページリロード。目つき・表情に新タグ追加。シーン合成→キャラ共演に改名',
    en: 'Color Maker v2: gradient, two-tone, and split hair types; background/nail/tail colors added. Feature Maker expanded: glasses subtype selection, face/body bandaid, body mole, piercing. Character Panel (PC grid icon): vertical list showing thumbnail/emoji, block dots, fill bar, and tag count — click to switch characters or add new ones. Custom emoji input: type any emoji beyond the preset list. Unicorn 🦄 added to emoji presets (22 total). Outfit block now has separate Legwear and Footwear categories. LOOM logo click/tap reloads page. New eye and expression tags. Scene Compose renamed to Collab.',
  },
  {
    v: 'v2.0',
    ja: 'カラーメーカー追加：部分カラー（インナー・メッシュ・毛先・サイドヘア）・前髪系・オッドアイ（2色ピッカー）・爪色・しっぽ色。矛盾する色名の自動修正。特徴メーカー追加：ほくろ・そばかす・傷跡・あざ・眼鏡（6種）・サングラス・眼帯・包帯・タトゥー・絆創膏・ピアスを3ステップで追加。フォーカスモードをスマホに対応（フルスクリーンオーバーレイ）。アクティブタグストリップ追加（クリックでカテゴリジャンプ＆ハイライト）。高DPI/FHD向けremベース・レスポンシブフォント。ランダム生成を2モード再設計（🧍キャラ特化/🖼️イラスト）。逆解析に一括適用・未認識タグのカスタム登録。クラウド同期に「今すぐ同期」ボタン・オフライン復帰自動再Push。競合タグ警告を2段階化（エラー/ソフト）。タグ名変更エイリアス・カテゴリ安定ID対応',
    en: 'Color Maker added: partial hair colors (inner/streak/tips/sidelocks), forelock, heterochromia dual-picker, nail/tail color; auto-fix for contradictory color names. Feature Maker added: moles, freckles, scars, birthmarks, glasses (6 types), sunglasses, eyepatch, bandage, tattoo, bandaid, piercing — 3-step flow. Focus mode on mobile (fullscreen overlay). Active tag strip — click chip to jump to category. Responsive rem-based font for HiDPI/FHD. Random gen redesigned: 2 modes (🧍 Char.Focused / 🖼️ Illust). Analyze: batch apply + custom-import for unknown tags. Cloud sync: "Sync now", auto-retry on reconnect. Conflict warnings now two-level. Tag alias migration + stable category IDs.',
  },
  {
    v: 'v1.9',
    ja: '極限クローズアップテンプレート追加（口元・目・魚眼）。テンプレートにネガ推奨タグ（negHint）表示。全テンプレートタグをブロックで個別選択可能に統一。ブロック別テンプレート適用取り消し（↩）ボタン追加。キャラノート設定シートにAIタグフィールド・TSVエクスポート・エディタからのインポートを統合。プロンプトログの重複自動記録防止・タグ対応表の挿入時重複スキップ。ランダム生成から特定タグを除外するexcludeFromRandomフラグ追加。競合ルール・タグ辞書拡充',
    en: 'New extreme close-up templates (lip focus, eye focus, fisheye). Templates show negHint suggestions. All template tags now individually selectable in blocks. Per-block template undo (↩) button. Character note profile sheet gains per-field AI tag rows, TSV export, and editor import. Prompt log dedup on COPY, tag map insert dedup. excludeFromRandom flag to prevent extreme tags in random generation. Expanded conflict rules and tag dictionary.',
  },
  {
    v: 'v1.8',
    ja: 'コードアーキテクチャ刷新：クラウド同期ロジックをuseCloudSync・ランダム生成ロジックをuseRandomGenフックに分離。新追加種族タグ（catgirl・dark elf・dragon girl・android・slime girl等）・artstyleタグ（retro artstyle・tarot card）・髪型タグ（layered hair）対応。競合ルール追加（レトロアニメ/タロットカード×リアル・3D、レイヤードヘア×ショート）。タグ辞書・破綻チェック全面監査',
    en: 'Architecture refactor: cloud sync extracted to useCloudSync hook, random generation to useRandomGen hook. New species tags (catgirl, dark elf, dragon girl, android, slime girl, etc.), artstyle tags (retro artstyle, tarot card), hairstyle tag (layered hair). New conflict rules (retro artstyle/tarot card vs realistic/3D, layered hair vs short). Full tag dictionary & conflict audit.',
  },
  {
    v: 'v1.7',
    ja: 'ランダム生成システム全面再構築。Tier3タグ分類・おまかせ2モード（🧍キャラ特化/🖼️イラスト）・排他ルール（フレーミング×下半身・環境×エフェクト・ポーズ・表情・スタイル矛盾）・コンボシステム（武器→fighting stance・人魚→underwater等）。バリエーション生成を固定ブロック（種族・顔・体型）＋再ロールブロック（衣装・構図・背景・エフェクト・照明）方式に変更。武器タグ低確率枠（約12%）で追加。モード設定をLocalStorageで記憶。タグ・辞書・競合ルール追加',
    en: 'Random generation system overhaul: Tier3 tag classification, 2-mode random (🧍 Char.Focused / 🖼️ Illust), exclusion rules (framing × lower-body, environment × effects, pose, expression, style conflicts), combo system (weapon→fighting stance, mermaid→underwater, etc.). Variations redesigned: fixed blocks (attribute/face/body) + reroll blocks (outfit/composition/background/effect/lighting). Weapon tags at ~12% probability. Mode saved to LocalStorage. New tags, dictionary entries, conflict rules.',
  },
  {
    v: 'v1.6',
    ja: '画像からタグ生成（OpenAI/Claude Vision対応）。データ入出力を1キャラクター単位に統一。UI用語整理（バックアップ/復元/プロンプトをシェア）。ログイン案内強化・同期失敗トースト・APIキー取得リンク追加。URLシェアペイロード最適化',
    en: 'Image-to-tags via vision API (OpenAI/Claude). Data import/export unified to single-character unit. UI label cleanup (Backup/Restore/Share prompt). Prominent sync login, sync-fail toast, API key acquisition links. Share URL payload optimization',
  },
  {
    v: 'v1.5',
    ja: 'AI機能追加：自然文タブのAI文章整形・✦ツールに自然文→タグ変換・出力バーにAIタグ提案（OpenAI/Claude対応）。PWAアイコン修正。ユーザーAPIキー方式を採用',
    en: 'AI features: AI polish in Natural Text tab, Text→Tags in ✦ Tools, AI tag suggestions in output bar (OpenAI & Claude). PWA icon fix. User-provided API key approach.',
  },
  {
    v: 'v1.4',
    ja: '絵文字を種族・職業系21種に刷新・セキュリティ強化・破綻タグの検出と生成防止拡充・ヘッダーグリッドアイコン・タグ辞書追加・設定にスマホ/PC差異タブ追加',
    en: 'Emoji overhaul (21 species/archetype), security hardening, expanded conflict detection + generation prevention, grid header icon, tag dictionary additions, Mobile vs PC comparison tab in Settings',
  },
  {
    v: 'v1.3',
    ja: 'SFWタグ自動連携（ネガティブにnsfw自動追加/削除）・タグ大幅拡充（衣装・髪型・フットウェアほか）・単一キャラ生成保証・バリエーション同キャラ維持強化',
    en: 'SFW auto-link (auto-add/remove nsfw in negative), major tag additions (outfits, hairstyles, footwear, etc.), single-character generation guaranteed, improved variations for same-character looks',
  },
  {
    v: 'v1.2',
    ja: 'Googleログイン＆Firestoreクラウド同期・.loom独自拡張子・スマホデータ入出力・ウェルカムヒントライトモード視認性改善・英語ローカライズ修正',
    en: 'Google login & Firestore cloud sync, .loom file format, mobile export/import, welcome hint light-mode contrast fix, EN localization fixes',
  },
  {
    v: 'v1.1',
    ja: 'ボーダー描画バグ修正・フォーカスモードタグサイズ修正・スマホキャラパネルUI改善・ウェルカムヒント再表示ボタン・トースト再設計・Vercel Analytics導入',
    en: 'Border rendering bug fixes, focus mode tag size fix, mobile char panel improvements, welcome hint re-show, toast redesign, Vercel Analytics',
  },
  {
    v: 'v1.0',
    ja: 'NAI重み{}変換・DALL-E自動自然文切替・バリエーション別自然文トグル・キャラパネルコンパクト化・ツール出力差別化・The Prompt Weaving Studio公開',
    en: 'NAI {} weight conversion, DALL-E auto natural text, per-variation natural text toggle, compact character panel, tool output differentiation, public launch as The Prompt Weaving Studio',
  },
  {
    v: 'v0.9',
    ja: 'UI統一・全カラーCSS変数化・スマホMJ ARチップ・ブロック順リセット・✦ツールメニュー刷新・COPYボタン拡大・バリエーション3パターン化',
    en: 'UI unification, full CSS-var colors, mobile MJ AR chips, block order reset, ✦ Tools menu overhaul, larger COPY, 3-variation output',
  },
  {
    v: 'v0.8',
    ja: '自然文生成・PC/スマホUI全面刷新・ブロックジャンプサイドバー・ダブルタップ非表示・出力バー再設計',
    en: 'Natural text output, full PC/mobile UI overhaul, block jump sidebar, double-tap hide, output bar redesign',
  },
  {
    v: 'v0.7',
    ja: 'モバイル対応・おまかせ生成・バリエーション改善・ガイド拡充',
    en: 'Mobile responsive, random gen, improved variations, expanded guide',
  },
  {
    v: 'v0.6',
    ja: 'Expert/Simpleモード・ブロック非表示・カスタムブロックリネーム',
    en: 'Expert/Simple mode, block hiding, custom block rename',
  },
  {
    v: 'v0.5',
    ja: 'キャラノート（PromptLog・TagMap）・バージョン管理',
    en: 'Character notes (PromptLog, TagMap), version control',
  },
  {
    v: 'v0.4',
    ja: 'テンプレート・カラーピッカー・シーン合成・コマンドパレット',
    en: 'Templates, color picker, scene compose, command palette',
  },
  {
    v: 'v0.3',
    ja: '複数キャラ管理・履歴・スナップショット・PWA対応',
    en: 'Multi-character, history, snapshot, PWA support',
  },
  {
    v: 'v0.1–0.2',
    ja: '基本ブロックエディタ・タグシステム・LoRA管理',
    en: 'Basic block editor, tag system, LoRA management',
  },
];
