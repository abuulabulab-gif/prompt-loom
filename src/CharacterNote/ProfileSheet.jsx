import { useState } from "react";

const uid = () => Math.random().toString(36).slice(2, 9);

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
    id: 'memo', icon: '📝', ja: '背景・その他メモ', en: 'Background & Notes',
    fields: [
      { key: 'background',     ja: '設定・背景・世界観',  en: 'Background & lore', multi: true },
    ],
  },
];

const DEFAULT_OPEN = new Set(['basic', 'appearance', 'outfit', 'ai']);

// ── FieldRow ───────────────────────────────────────────────────────────────
function FieldRow({ label, value, onChange, color, multi }) {
  const base = "flex-1 bg-bg border border-line rounded-[5px] text-[12px] px-[8px] py-[5px] font-mono text-fg outline-none";
  const onFocus = e => { e.target.style.borderColor = color + '80'; };
  const onBlur  = e => { e.target.style.borderColor = ''; };
  return (
    <div className="flex gap-[8px] mb-[5px] items-start">
      <span className="text-muted text-[10px] font-mono w-[120px] flex-shrink-0 pt-[6px] leading-tight break-keep">{label}</span>
      {multi ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder="—"
          className={`${base} resize-y min-h-[48px] leading-[1.65]`}
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
    const s = { _custom: true };
    SECTIONS.forEach(sec => { s[sec.id] = DEFAULT_OPEN.has(sec.id); });
    return s;
  });
  const [copied, setCopied] = useState(false);

  const profile = char.profile || {};

  // Backward-compat read: old top-level background/relationships are merged into their sections
  const getSection = (id) => {
    const base = profile[id] || {};
    if (id === 'memo')     return { background: profile.background || '', ...base };
    if (id === 'relations') return { relationships: profile.relationships || '', ...base };
    return base;
  };

  const setField = (sectionId, key, val) => {
    onUpdate({ profile: { ...profile, [sectionId]: { ...(profile[sectionId] || {}), [key]: val } } });
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

  // Section header toggle
  const SecHeader = ({ sec }) => (
    <button
      onClick={() => setOpenSecs(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
      className="w-full flex items-center gap-[6px] text-[11px] font-bold font-mono mb-[7px] mt-[14px] cursor-pointer bg-transparent border-none p-0 text-left group"
    >
      <span style={{ color: char.color }}>{sec.icon} {lang === 'ja' ? sec.ja : sec.en}</span>
      <span className="flex-1 border-b border-line mx-[4px]" />
      <span className="text-dim text-[10px]">{openSecs[sec.id] ? '▲' : '▼'}</span>
    </button>
  );

  // Copy all filled fields as plain text
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
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div>
      {/* Standard sections */}
      {SECTIONS.map(sec => {
        const data = getSection(sec.id);
        return (
          <div key={sec.id}>
            <SecHeader sec={sec} />
            {openSecs[sec.id] && sec.fields.map(f => (
              <FieldRow
                key={f.key}
                label={lang === 'ja' ? f.ja : f.en}
                value={data[f.key] || ''}
                onChange={v => setField(sec.id, f.key, v)}
                color={char.color}
                multi={f.multi}
              />
            ))}
          </div>
        );
      })}

      {/* ── Custom fields ── */}
      <button
        onClick={() => setOpenSecs(prev => ({ ...prev, _custom: !prev._custom }))}
        className="w-full flex items-center gap-[6px] text-[11px] font-bold font-mono mb-[7px] mt-[14px] cursor-pointer bg-transparent border-none p-0 text-left group"
      >
        <span style={{ color: char.color }}>✏️ {lang === 'ja' ? 'カスタム項目' : 'Custom Fields'}</span>
        <span className="flex-1 border-b border-line mx-[4px]" />
        <span className="text-dim text-[10px]">{openSecs._custom ? '▲' : '▼'}</span>
      </button>
      {openSecs._custom && (
        <>
          {customFields.map(f => (
            <div key={f.id} className="flex gap-[8px] mb-[5px] items-start group">
              <span className="text-muted text-[10px] font-mono w-[120px] flex-shrink-0 pt-[6px] leading-tight flex items-start gap-[2px]">
                <span className="break-all flex-1 leading-tight">{f.label}</span>
                <button onClick={() => removeCustomField(f.id)}
                  className="opacity-0 group-hover:opacity-100 text-[11px] cursor-pointer bg-transparent border-none text-dim hover:text-red-400 flex-shrink-0 leading-none">✕</button>
              </span>
              {f.multi ? (
                <textarea value={f.value} onChange={e => updateCustomField(f.id, 'value', e.target.value)} placeholder="—"
                  className="flex-1 bg-bg border border-line rounded-[5px] text-[12px] px-[8px] py-[5px] font-mono text-fg outline-none resize-y min-h-[48px] leading-[1.65]"
                  onFocus={e => e.target.style.borderColor = char.color + '80'} onBlur={e => e.target.style.borderColor = ''} />
              ) : (
                <input value={f.value} onChange={e => updateCustomField(f.id, 'value', e.target.value)} placeholder="—"
                  className="flex-1 bg-bg border border-line rounded-[5px] text-[12px] px-[8px] py-[5px] font-mono text-fg outline-none"
                  onFocus={e => e.target.style.borderColor = char.color + '80'} onBlur={e => e.target.style.borderColor = ''} />
              )}
              <button
                onClick={() => updateCustomField(f.id, 'multi', !f.multi)}
                title={lang === 'ja' ? '1行 / 複数行を切替' : 'Toggle single / multi-line'}
                className="text-[9px] font-mono cursor-pointer bg-transparent border border-dim rounded-[4px] px-[5px] py-[4px] text-muted flex-shrink-0 mt-[2px] whitespace-nowrap">
                {f.multi ? '1L' : '多L'}
              </button>
            </div>
          ))}
          <button onClick={addCustomField}
            className="w-full rounded-[7px] py-[7px] text-[11px] font-mono cursor-pointer border border-dashed mt-[4px] flex items-center justify-center gap-[5px]"
            style={{ borderColor: 'rgb(var(--dim))', color: 'rgb(var(--muted))', background: 'transparent' }}>
            ＋ {lang === 'ja' ? '項目を追加' : 'Add custom field'}
          </button>
        </>
      )}

      {/* Copy button */}
      <div className="mt-[20px] flex justify-end">
        <button onClick={copyProfile}
          style={copied ? { borderColor: char.color + '60', color: char.color } : undefined}
          className="border border-dim rounded-[6px] px-[12px] py-[5px] text-[10px] font-mono cursor-pointer bg-transparent text-muted">
          {copied
            ? `✓ ${lang === 'ja' ? 'コピー済み' : 'Copied!'}`
            : `📋 ${lang === 'ja' ? '設定をテキストコピー' : 'Copy as text'}`}
        </button>
      </div>
    </div>
  );
}
