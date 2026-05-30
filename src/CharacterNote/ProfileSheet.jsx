import { useState, useEffect, useRef, useMemo } from "react";
import { appendTag, hasTag, splitTags } from "../data/constants.js";

const uid = () => Math.random().toString(36).slice(2, 9);

// Static block option fallbacks (mirrors TagMap.jsx)
const BLOCK_OPTS = [
  { id: 'face',        ja: '顔・髪',         en: 'Face / Hair' },
  { id: 'attribute',   ja: '属性',           en: 'Attribute' },
  { id: 'body',        ja: '体型',           en: 'Body' },
  { id: 'outfit',      ja: '衣装',           en: 'Outfit' },
  { id: 'feature',     ja: '特徴',           en: 'Feature' },
  { id: 'effect',      ja: 'エフェクト',     en: 'Effect' },
  { id: 'artstyle',    ja: 'アートスタイル', en: 'Art Style' },
  { id: 'composition', ja: '構図',           en: 'Composition' },
  { id: 'background',  ja: '背景',           en: 'Background' },
  { id: 'lighting',    ja: 'ライティング',   en: 'Lighting' },
  { id: 'quality',     ja: '品質',           en: 'Quality' },
  { id: 'negative',    ja: 'ネガティブ',     en: 'Negative' },
];

// ── Section definitions ────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'basic', icon: '📌', ja: '基本情報', en: 'Basic Info',
    fields: [
      { key: 'species',     ja: '種族・出自',         en: 'Species / Origin' },
      { key: 'gender',      ja: '性別',               en: 'Gender' },
      { key: 'personality', ja: '性格',               en: 'Personality' },
      { key: 'age_child',   ja: '外見年齢（子ども）',  en: 'Age appearance (child)' },
      { key: 'age_adult',   ja: '外見年齢（大人）',    en: 'Age appearance (adult)' },
      { key: 'birthday',    ja: '誕生日',             en: 'Birthday' },
      { key: 'pronoun',     ja: '一人称',             en: '1st-person pronoun' },
      { key: 'voice',       ja: '声のイメージ',        en: 'Voice type' },
      { key: 'origin',      ja: '国・出自のイメージ',  en: 'Country / Origin' },
    ],
  },
  {
    id: 'appearance', icon: '🎨', ja: '外見設定', en: 'Appearance',
    fields: [
      { key: 'hair',         ja: '髪色・ヘアスタイル',       en: 'Hair color & style' },
      { key: 'bangs',        ja: '前髪',                     en: 'Bangs' },
      { key: 'inner_color',  ja: 'インナーカラー',            en: 'Inner hair color' },
      { key: 'eyes',         ja: '瞳の色・特徴',              en: 'Eye color & features' },
      { key: 'eye_shape',    ja: '目の形・印象',              en: 'Eye shape / impression' },
      { key: 'eyebrow',      ja: '眉の形',                   en: 'Eyebrow shape' },
      { key: 'expression',   ja: '得意な表情',                en: 'Signature expression' },
      { key: 'skin',         ja: '肌の色・質感',              en: 'Skin tone & texture' },
      { key: 'nail',         ja: '爪の色',                   en: 'Nail color' },
      { key: 'ear',          ja: '耳の形',                   en: 'Ear shape' },
      { key: 'body',         ja: '体型・スタイル傾向',         en: 'Body type & style' },
      { key: 'height_child', ja: '身長（子ども）',            en: 'Height (child)' },
      { key: 'height_adult', ja: '身長（大人）',              en: 'Height (adult)' },
      { key: 'bust',         ja: 'バストサイズ',              en: 'Bust size' },
      { key: 'special',      ja: '身体的特徴・特殊パーツ',     en: 'Physical features' },
      { key: 'color_main',   ja: 'イメージカラー（メイン）',   en: 'Theme color (main)' },
      { key: 'color_sub',    ja: 'サブカラー',                en: 'Sub color' },
      { key: 'accessories',  ja: '装飾品・アクセサリー',       en: 'Accessories' },
      { key: 'posture',      ja: '歩き方・姿勢の特徴',         en: 'Walk & posture' },
      { key: 'other',        ja: 'その他外見メモ',            en: 'Other appearance notes' },
    ],
  },
  {
    id: 'outfit', icon: '👗', ja: '衣装・見た目', en: 'Outfits',
    fields: [
      { key: 'outfit_main',    ja: 'メイン衣装（詳細）',  en: 'Main outfit (details)', multi: true },
      { key: 'outfit_outdoor', ja: '外出衣装',            en: 'Outdoor outfit' },
      { key: 'outfit_casual',  ja: '部屋着',              en: 'Casual / home wear' },
      { key: 'outfit_sleep',   ja: 'パジャマ・寝具',      en: 'Sleepwear' },
    ],
  },
  {
    id: 'ai', icon: '🤖', ja: 'AI用メモ', en: 'AI Notes',
    fields: [
      { key: 'ai_tags',        ja: 'よく使うAIタグ',          en: 'Common AI tags', multi: true },
      { key: 'ai_visual',      ja: 'ビジュアル・構図の指針',   en: 'Visual & composition guidance', multi: true },
    ],
  },
  {
    id: 'speech', icon: '💬', ja: '話し方・感情', en: 'Speech & Emotions',
    fields: [
      { key: 'speech_style',  ja: '話し方の特徴・口調',         en: 'Speech style & tone' },
      { key: 'voice_change',  ja: '声のトーン変化（感情ごと）',  en: 'Voice tone by emotion' },
      { key: 'spoiled',       ja: '甘えるときの行動・セリフ',    en: 'When spoiled (behavior)', multi: true },
      { key: 'angry',         ja: '怒ったときのセリフ例',        en: 'Angry speech example' },
      { key: 'shy',           ja: '照れポイント・照れ方',        en: 'Blushing triggers' },
      { key: 'joy',           ja: '喜びの表現・セリフ',          en: 'Joy expression' },
      { key: 'sadness',       ja: '悲しみの表現',               en: 'Sadness expression' },
      { key: 'excited',       ja: '楽しさの表現',               en: 'Excitement expression' },
      { key: 'preferences',   ja: 'フェチ・嗜好',               en: 'Preferences / Fetish' },
    ],
  },
  {
    id: 'lifestyle', icon: '🏠', ja: '生活スタイル', en: 'Lifestyle',
    fields: [
      { key: 'daily_rhythm',   ja: '生活リズム',          en: 'Daily rhythm' },
      { key: 'daily_behavior', ja: '日常行動の特徴',       en: 'Daily behavior traits' },
      { key: 'social_style',   ja: '他者との関わり方',     en: 'Social style' },
      { key: 'morning',        ja: '起床時の様子',         en: 'Morning habits' },
      { key: 'night',          ja: '就寝時の特徴・寝相',   en: 'Sleep habits' },
    ],
  },
  {
    id: 'likes', icon: '❤️', ja: '好き・嫌い・趣味', en: 'Likes & Hobbies',
    fields: [
      { key: 'hobbies',        ja: '趣味',                en: 'Hobbies' },
      { key: 'dislikes',       ja: '苦手なもの・嫌いなもの', en: 'Dislikes' },
      { key: 'food',           ja: '食の好み',             en: 'Food preferences' },
      { key: 'entertainment',  ja: '好きな作品・エンタメ',  en: 'Favourite media & entertainment' },
    ],
  },
  {
    id: 'relations', icon: '🔗', ja: '関係性・持ち物', en: 'Relationships',
    fields: [
      { key: 'relationships',  ja: '他キャラとの関係性',       en: 'Relationships with others', multi: true },
      { key: 'belongings',     ja: '大切にしている物・持ち物',  en: 'Important belongings' },
      { key: 'personal_space', ja: '居場所・プライベート空間',  en: 'Personal space' },
    ],
  },
  {
    id: 'special', icon: '⚔️', ja: '特殊設定・能力', en: 'Special Abilities',
    fields: [
      { key: 'race_ability',   ja: '種族能力・属性',     en: 'Species ability / Attribute' },
      { key: 'combat',         ja: '戦闘スタイル',       en: 'Combat style' },
      { key: 'transform',      ja: '変身・解放形態',     en: 'Transformation / Release form', multi: true },
    ],
  },
  {
    id: 'memo', icon: '📝', ja: '背景・その他メモ', en: 'Background & Notes',
    fields: [
      { key: 'background',     ja: '設定・背景・世界観',  en: 'Background & lore', multi: true },
    ],
  },
];

const DEFAULT_OPEN = new Set(['basic', 'appearance', 'outfit', 'ai']);

// Fields where AI tag binding is visually meaningful for image generation
const VISUAL_TAG_FIELDS = new Set([
  'species', 'gender', 'age_child', 'age_adult', 'origin',
  'hair', 'bangs', 'inner_color', 'eyes', 'eye_shape', 'eyebrow', 'expression',
  'skin', 'nail', 'ear', 'body', 'height_child', 'height_adult', 'bust', 'special',
  'color_main', 'color_sub', 'accessories',
  'belongings',
  'race_ability', 'transform',
  'outfit_main', 'outfit_outdoor', 'outfit_casual', 'outfit_sleep',
]);

// ── TagRow ─────────────────────────────────────────────────────────────────
function TagRow({ ft, color, blockOptions, charBlockIds, lang, onChange, onInsert }) {
  const [inserted, setInserted] = useState(false);
  const tags    = ft?.tags  || '';
  const blockId = ft?.block || blockOptions[0]?.id || 'face';
  const blockOk = charBlockIds.has(blockId);
  const canInsert = tags.trim() && blockOk;

  return (
    <div className="flex gap-2 items-center mb-[0.4375rem]">
      <span className="w-[7.5rem] flex-shrink-0" />
      <div className="flex-1 flex gap-[0.3125rem] items-center min-w-0">
        <input
          value={tags}
          onChange={e => onChange({ block: blockId, tags: e.target.value })}
          placeholder={lang === 'ja' ? 'AIタグ（例: silver hair, long hair）' : 'AI tags (e.g. silver hair, long hair)'}
          className="flex-1 min-w-0 bg-bg border border-dashed rounded-[0.3125rem] text-[0.6875rem] px-[0.4375rem] py-[0.1875rem] font-mono text-prompt outline-none"
          style={{ borderColor: tags ? color + '55' : 'rgb(var(--dim))' }}
        />
        <select
          value={blockId}
          onChange={e => onChange({ tags, block: e.target.value })}
          title={!blockOk ? (lang === 'ja' ? 'このブロックは存在しません' : 'Block not found') : undefined}
          className="bg-bg border rounded text-[0.625rem] px-1 py-[0.1875rem] font-mono text-muted outline-none cursor-pointer flex-shrink-0"
          style={{ borderColor: blockOk ? 'rgb(var(--dim))' : 'rgb(var(--c-warn, 234 179 8) / 0.6)', maxWidth: '88px' }}
        >
          {blockOptions.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
        <button
          onClick={() => {
            if (!canInsert) return;
            onInsert();
            setInserted(true);
            setTimeout(() => setInserted(false), 1500);
          }}
          disabled={!canInsert}
          title={
            !blockOk      ? (lang === 'ja' ? 'ブロックが存在しません' : 'Block not found') :
            !tags.trim()  ? (lang === 'ja' ? 'タグを入力してください' : 'Enter tags first') :
                             (lang === 'ja' ? 'ブロックに挿入（重複スキップ）' : 'Insert to block (dedup)')
          }
          style={canInsert ? { borderColor: color + '60', color } : undefined}
          className="border border-dim rounded px-1.5 py-0.5 text-[0.625rem] font-mono cursor-pointer bg-transparent flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {inserted ? '✓' : '→'}
        </button>
      </div>
    </div>
  );
}

// ── FieldRow ───────────────────────────────────────────────────────────────
function FieldRow({ label, value, onChange, color, multi }) {
  const base = "flex-1 bg-bg border border-line rounded-[0.3125rem] text-xs px-2 py-[0.3125rem] font-mono text-fg outline-none";
  const onFocus = e => { e.target.style.borderColor = color + '80'; };
  const onBlur  = e => { e.target.style.borderColor = ''; };
  return (
    <div className="flex gap-2 mb-[0.3125rem] items-start">
      <span className="text-muted text-[0.625rem] font-mono w-[7.5rem] flex-shrink-0 pt-1.5 leading-tight break-keep">{label}</span>
      {multi ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder="—"
          className={`${base} resize-y min-h-12 leading-[1.65]`}
          onFocus={onFocus} onBlur={onBlur} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="—"
          className={base} onFocus={onFocus} onBlur={onBlur} />
      )}
    </div>
  );
}

// ── ProfileSheet ───────────────────────────────────────────────────────────
export default function ProfileSheet({ char, lang, onUpdate }) {
  const [openSecs, setOpenSecs] = useState(() => {
    try {
      const raw = localStorage.getItem(`loom_note_sections_${char.id}`);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {}
    const s = { _custom: true };
    SECTIONS.forEach(sec => { s[sec.id] = DEFAULT_OPEN.has(sec.id); });
    return s;
  });
  const [copied, setCopied] = useState(false); // false | 'text' | 'tsv'
  const [showTagFields, setShowTagFields] = useState(() => {
    try { return localStorage.getItem('loom_profile_tagfields') === 'true'; } catch {} return false;
  });

  const charIdRef = useRef(char.id);
  useEffect(() => { charIdRef.current = char.id; });

  // Reset section state on char switch
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`loom_note_sections_${char.id}`);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) { setOpenSecs(parsed); return; }
    } catch {}
    const s = { _custom: true };
    SECTIONS.forEach(sec => { s[sec.id] = DEFAULT_OPEN.has(sec.id); });
    setOpenSecs(s);
  }, [char.id]);

  // Persist section state
  useEffect(() => {
    try { localStorage.setItem(`loom_note_sections_${charIdRef.current}`, JSON.stringify(openSecs)); } catch {}
  }, [openSecs]);

  const profile    = char.profile || {};
  const fieldTags  = profile.fieldTags || {};

  // Block options: char.blocks first, then static fallbacks for IDs not present
  const blockOptions = useMemo(() => {
    const charBlocks = char.blocks || [];
    const charIds = new Set(charBlocks.map(b => b.id));
    const result = charBlocks.map(b => ({
      id: b.id,
      label: lang === 'ja' ? (b.name || b.nameEn || b.id) : (b.nameEn || b.name || b.id),
    }));
    BLOCK_OPTS.forEach(opt => {
      if (!charIds.has(opt.id)) result.push({ id: opt.id, label: lang === 'ja' ? opt.ja : opt.en });
    });
    return result;
  }, [char.blocks, lang]);

  const charBlockIds = useMemo(() => new Set((char.blocks || []).map(b => b.id)), [char.blocks]);

  // Backward-compat read: old top-level fields merged into sections
  const getSection = (id) => {
    const base = profile[id] || {};
    if (id === 'memo')      return { background: profile.background || '', ...base };
    if (id === 'relations') return { relationships: profile.relationships || '', ...base };
    return base;
  };

  const setField = (sectionId, key, val) => {
    onUpdate({ profile: { ...profile, [sectionId]: { ...(profile[sectionId] || {}), [key]: val } } });
  };

  // fieldTags stored as profile.fieldTags[`${sectionId}.${fieldKey}`] = { tags, block }
  const setFieldTag = (key, upd) => {
    const ft = profile.fieldTags || {};
    onUpdate({ profile: { ...profile, fieldTags: { ...ft, [key]: { ...(ft[key] || {}), ...upd } } } });
  };

  // Insert tags into a block, skipping duplicates
  const insertToBlock = (tags, blockId) => {
    const blocks = char.blocks || [];
    const target = blocks.find(b => b.id === blockId);
    if (!target || !tags.trim()) return;
    let text = target.text;
    for (const tag of splitTags(tags)) {
      if (!hasTag(text, tag)) text = appendTag(text, tag, target.strength || '1.0');
    }
    onUpdate({ blocks: blocks.map(b => b.id === blockId ? { ...b, text } : b) });
  };

  // Custom fields
  const customFields = profile.customFields || [];
  const addCustomField = () => {
    const label = window.prompt(lang === 'ja' ? '項目名を入力してください' : 'Enter field name');
    if (!label?.trim()) return;
    onUpdate({ profile: { ...profile, customFields: [...customFields, { id: uid(), label: label.trim(), value: '', multi: false }] } });
  };
  const updateCustomField = (id, key, val) => {
    onUpdate({ profile: { ...profile, customFields: customFields.map(f => f.id === id ? { ...f, [key]: val } : f) } });
  };
  const removeCustomField = (id) => {
    if (!window.confirm(lang === 'ja' ? 'この項目を削除しますか？' : 'Remove this field?')) return;
    onUpdate({ profile: { ...profile, customFields: customFields.filter(f => f.id !== id) } });
  };

  // ── TSV export ─────────────────────────────────────────────────────────
  const copyTSV = () => {
    const blockLabel = id => (blockOptions.find(o => o.id === id)?.label) ?? id;
    const esc = s => (s || '').trim().replace(/\t/g, ' ').replace(/\n+/g, ' ');
    const header = lang === 'ja'
      ? '設定項目\t設定内容\tAIプロンプトタグ\t対象ブロック'
      : 'Field\tValue\tAI Prompt Tags\tTarget Block';
    const lines = [header];
    for (const sec of SECTIONS) {
      const data = getSection(sec.id);
      for (const f of sec.fields) {
        const val  = esc(data[f.key]);
        const ft   = fieldTags[`${sec.id}.${f.key}`];
        const tags = esc(ft?.tags);
        const blk  = ft?.block ? blockLabel(ft.block) : '';
        if (val || tags) lines.push(`${lang === 'ja' ? f.ja : f.en}\t${val}\t${tags}\t${blk}`);
      }
    }
    for (const cf of customFields) {
      const val  = esc(cf.value);
      const ft   = fieldTags[`custom.${cf.id}`];
      const tags = esc(ft?.tags);
      const blk  = ft?.block ? blockLabel(ft.block) : '';
      if (val || tags) lines.push(`${esc(cf.label)}\t${val}\t${tags}\t${blk}`);
    }
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied('tsv'); setTimeout(() => setCopied(false), 1800);
    });
  };

  // ── Editor → fieldTags import ──────────────────────────────────────────
  const importFromEditor = () => {
    const blocks = char.blocks || [];
    const ft = profile.fieldTags || {};
    const updated = { ...ft };
    let count = 0;
    for (const [key, val] of Object.entries(ft)) {
      if (!val?.block) continue;
      const blk = blocks.find(b => b.id === val.block);
      if (!blk?.text?.trim()) continue;
      const newTags = blk.text.trim();
      if (val.tags === newTags) continue;
      updated[key] = { ...val, tags: newTags };
      count++;
    }
    if (count === 0) {
      alert(lang === 'ja'
        ? '取り込み対象が見つかりません。先にタグ欄でブロックを指定してください。'
        : 'No tag fields with block assignments. Set target blocks in tag rows first.');
      return;
    }
    if (window.confirm(lang === 'ja'
      ? `${count}件のタグ欄をエディタの現在のブロック内容で更新します。`
      : `Update ${count} tag field(s) from current editor blocks?`)) {
      onUpdate({ profile: { ...profile, fieldTags: updated } });
    }
  };

  // ── Text copy ──────────────────────────────────────────────────────────
  const copyProfile = () => {
    const lines = [`【${char.name}】`];
    for (const sec of SECTIONS) {
      const data = getSection(sec.id);
      const secLines = sec.fields
        .map(f => {
          const v = data[f.key];
          return v?.trim() ? `${lang === 'ja' ? f.ja : f.en}: ${v.replace(/\n+/g, ' ')}` : null;
        })
        .filter(Boolean);
      if (secLines.length) {
        lines.push('');
        lines.push(`▶ ${lang === 'ja' ? sec.ja : sec.en}`);
        lines.push(...secLines);
      }
    }
    const cf = customFields.filter(f => f.value?.trim());
    if (cf.length) {
      lines.push('');
      lines.push('▶ ' + (lang === 'ja' ? 'カスタム項目' : 'Custom Fields'));
      cf.forEach(f => lines.push(`${f.label}: ${f.value.replace(/\n+/g, ' ')}`));
    }
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied('text'); setTimeout(() => setCopied(false), 1800);
    });
  };

  const toggleShowTag = () => {
    const next = !showTagFields;
    setShowTagFields(next);
    try { localStorage.setItem('loom_profile_tagfields', String(next)); } catch {}
  };

  const SecHeader = ({ sec }) => (
    <button
      onClick={() => setOpenSecs(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
      className="w-full flex items-center gap-1.5 text-[0.6875rem] font-bold font-mono mb-[0.4375rem] mt-3.5 cursor-pointer bg-transparent border-none p-0 text-left group"
    >
      <span style={{ color: char.color }}>{sec.icon} {lang === 'ja' ? sec.ja : sec.en}</span>
      <span className="flex-1 border-b border-line mx-1" />
      <span className="text-dim text-[0.625rem]">{openSecs[sec.id] ? '▲' : '▼'}</span>
    </button>
  );

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex gap-[0.3125rem] flex-wrap items-center mb-3">
        <button
          onClick={toggleShowTag}
          style={showTagFields
            ? { background: char.color + '18', borderColor: char.color + '60', color: char.color }
            : undefined}
          className={`rounded-md px-[0.5625rem] py-1 text-[0.625rem] font-mono cursor-pointer border transition-all ${showTagFields ? 'font-bold' : 'border-dim text-muted'}`}
          title={lang === 'ja' ? '全フィールドのAIタグ入力欄を表示/非表示' : 'Show / hide AI tag rows for all fields'}
        >
          🏷 {lang === 'ja' ? (showTagFields ? 'タグ欄 ON' : 'タグ欄') : (showTagFields ? 'Tags ON' : 'Tags')}
        </button>

        <button
          onClick={importFromEditor}
          className="border border-dim rounded-md px-[0.5625rem] py-1 text-[0.625rem] font-mono cursor-pointer bg-transparent text-muted"
          title={lang === 'ja' ? 'エディタの各ブロック内容でタグ欄を上書き（ブロック設定済み欄のみ）' : 'Overwrite tag rows from current editor blocks (only rows with a block set)'}
        >
          🔄 {lang === 'ja' ? 'エディタから取り込む' : 'Import from editor'}
        </button>

        <div className="flex-1" />

        <button
          onClick={copyProfile}
          style={copied === 'text' ? { borderColor: char.color + '60', color: char.color } : undefined}
          className="border border-dim rounded-md px-[0.5625rem] py-1 text-[0.625rem] font-mono cursor-pointer bg-transparent text-muted"
        >
          {copied === 'text'
            ? `✓ ${lang === 'ja' ? 'コピー済み' : 'Copied!'}`
            : `📋 ${lang === 'ja' ? 'テキスト' : 'Text'}`}
        </button>

        <button
          onClick={copyTSV}
          style={copied === 'tsv' ? { borderColor: char.color + '60', color: char.color } : undefined}
          className="border border-dim rounded-md px-[0.5625rem] py-1 text-[0.625rem] font-mono cursor-pointer bg-transparent text-muted"
          title={lang === 'ja' ? 'Google Sheetsなどにそのままペーストできるタブ区切り形式でコピー' : 'Copy as TSV — paste directly into Google Sheets etc.'}
        >
          {copied === 'tsv'
            ? `✓ ${lang === 'ja' ? 'コピー済み' : 'Copied!'}`
            : `📊 ${lang === 'ja' ? 'スプレッドシート用' : 'Spreadsheet'}`}
        </button>
      </div>

      {/* ── Standard sections ── */}
      {SECTIONS.map(sec => {
        const data = getSection(sec.id);
        return (
          <div key={sec.id}>
            <SecHeader sec={sec} />
            {openSecs[sec.id] && sec.fields.map(f => {
              const ftKey   = `${sec.id}.${f.key}`;
              const ft      = fieldTags[ftKey];
              const showTag = (showTagFields && VISUAL_TAG_FIELDS.has(f.key)) || !!ft?.tags;
              return (
                <div key={f.key}>
                  <FieldRow
                    label={lang === 'ja' ? f.ja : f.en}
                    value={data[f.key] || ''}
                    onChange={v => setField(sec.id, f.key, v)}
                    color={char.color}
                    multi={f.multi}
                  />
                  {showTag && (
                    <TagRow
                      ft={ft}
                      color={char.color}
                      blockOptions={blockOptions}
                      charBlockIds={charBlockIds}
                      lang={lang}
                      onChange={upd => setFieldTag(ftKey, upd)}
                      onInsert={() => insertToBlock(ft?.tags || '', ft?.block || '')}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* ── Custom fields ── */}
      <button
        onClick={() => setOpenSecs(prev => ({ ...prev, _custom: !prev._custom }))}
        className="w-full flex items-center gap-1.5 text-[0.6875rem] font-bold font-mono mb-[0.4375rem] mt-3.5 cursor-pointer bg-transparent border-none p-0 text-left group"
      >
        <span style={{ color: char.color }}>✏️ {lang === 'ja' ? 'カスタム項目' : 'Custom Fields'}</span>
        <span className="flex-1 border-b border-line mx-1" />
        <span className="text-dim text-[0.625rem]">{openSecs._custom ? '▲' : '▼'}</span>
      </button>
      {openSecs._custom && (
        <>
          {customFields.map(f => {
            const ftKey   = `custom.${f.id}`;
            const ft      = fieldTags[ftKey];
            const showTag = showTagFields || !!ft?.tags;
            return (
              <div key={f.id}>
                <div className="flex gap-2 mb-[0.3125rem] items-start group">
                  <span className="text-muted text-[0.625rem] font-mono w-[7.5rem] flex-shrink-0 pt-1.5 leading-tight flex items-start gap-0.5">
                    <span className="break-all flex-1 leading-tight">{f.label}</span>
                    <button onClick={() => removeCustomField(f.id)}
                      className="opacity-0 group-hover:opacity-100 text-[0.6875rem] cursor-pointer bg-transparent border-none text-dim hover:text-red-400 flex-shrink-0 leading-none">✕</button>
                  </span>
                  {f.multi ? (
                    <textarea value={f.value} onChange={e => updateCustomField(f.id, 'value', e.target.value)} placeholder="—"
                      className="flex-1 bg-bg border border-line rounded-[0.3125rem] text-xs px-2 py-[0.3125rem] font-mono text-fg outline-none resize-y min-h-12 leading-[1.65]"
                      onFocus={e => e.target.style.borderColor = char.color + '80'} onBlur={e => e.target.style.borderColor = ''} />
                  ) : (
                    <input value={f.value} onChange={e => updateCustomField(f.id, 'value', e.target.value)} placeholder="—"
                      className="flex-1 bg-bg border border-line rounded-[0.3125rem] text-xs px-2 py-[0.3125rem] font-mono text-fg outline-none"
                      onFocus={e => e.target.style.borderColor = char.color + '80'} onBlur={e => e.target.style.borderColor = ''} />
                  )}
                  <button
                    onClick={() => updateCustomField(f.id, 'multi', !f.multi)}
                    title={lang === 'ja' ? '1行 / 複数行を切替' : 'Toggle single / multi-line'}
                    className="text-[0.5625rem] font-mono cursor-pointer bg-transparent border border-dim rounded px-[0.3125rem] py-1 text-muted flex-shrink-0 mt-0.5 whitespace-nowrap">
                    {f.multi ? '1L' : '多L'}
                  </button>
                </div>
                {showTag && (
                  <TagRow
                    ft={ft}
                    color={char.color}
                    blockOptions={blockOptions}
                    charBlockIds={charBlockIds}
                    lang={lang}
                    onChange={upd => setFieldTag(ftKey, upd)}
                    onInsert={() => insertToBlock(ft?.tags || '', ft?.block || '')}
                  />
                )}
              </div>
            );
          })}
          <button onClick={addCustomField}
            className="w-full rounded-[0.4375rem] py-[0.4375rem] text-[0.6875rem] font-mono cursor-pointer border border-dashed mt-1 flex items-center justify-center gap-[0.3125rem]"
            style={{ borderColor: 'rgb(var(--dim))', color: 'rgb(var(--muted))', background: 'transparent' }}>
            ＋ {lang === 'ja' ? '項目を追加' : 'Add custom field'}
          </button>
        </>
      )}
    </div>
  );
}
