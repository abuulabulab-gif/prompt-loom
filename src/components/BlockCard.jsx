import { useState, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { STRENGTHS, uid, appendTag, countTags, hasTag, toggleTag, clampW, removeTag, OPTIONAL_CAT_NAMES, BLOCK_RANDOM_RULES, TIER3_TAGS, RANDOM_EXCLUSION_RULES, WEAPON_TAGS, WEAPON_PICK_PROB, HAND_POSE_TAGS } from "../data/constants.js";
import { EXPRESSION_PRESETS, ALL_EXPR_TAGS } from "../data/expressions.js";
import { NEG_PRESETS } from "../data/negSuggestions.js";
import TagBtn from "./TagBtn.jsx";
import { TAG_DICT } from "../data/tagDictionary.js";

// Categories that start collapsed; all others start open.
const CATS_CLOSED = new Set([
  // 顔
  'インナーカラー', '前髪', '目つき・形', '眉', '口・歯', '髪飾り・毛流れ', 'メイク・顔演出',
  // 属性
  '年齢感', '特殊パーツ',
  // 体型
  '肌色', '細部', 'ボディフォーカス', '足',
  // 衣装
  'トップス', 'ボトムス', '素材・装飾', '装飾アクセ',
  // 特徴
  'ピアス・刺青', '装備・ケア',
  // エフェクト
  'パーティクル', '天候・自然', '演出フィルタ',
  // 構図
  '手・指', '視線・演出', 'シチュ',
  // 背景
  '屋内', '時間・天気', '季節・雰囲気',
  // ライティング
  '照明スタイル',
  // 品質
  '仕上がり', '顔の精細化',
  // アートスタイル
  '色調', 'レンダリング',
  // ネガティブ
  'その他NG',
]);

const SCENE_MANAGED_TAGS = new Set(['2girls', '2boys', 'multiple girls', 'multiple boys', '1other']);

export default function BlockCard({ block, lang, orderNum, onUpdate, onMove, isFirst, isLast, onSavePreset, onFocus, focused, otherChars, onTransfer, conflictTags, onRemove, onHide, isMobile, isCompact, focusMode, sceneActive, analyzeText }) {
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [pName, setPName] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(block.name);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const lastTapRef = useRef(0);
  const hideConfirm = () => {
    if (!onHide) return;
    const tabName = isMobile
      ? (lang === 'ja' ? '使い方Tips' : 'Tips')
      : (lang === 'ja' ? 'ショートカット' : 'Shortcuts');
    const msg = lang === 'ja'
      ? `このブロックを非表示にしますか？\n※ ⚙️ 設定 → ${tabName}タブから再表示できます。`
      : `Hide this block?\n※ To restore it, open ⚙️ Settings → ${tabName} tab.`;
    if (window.confirm(msg)) onHide();
  };
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) { hideConfirm(); lastTapRef.current = 0; }
    else { lastTapRef.current = now; }
  };

  const isLocked = block.locked;
  const allTags = block.cats.flatMap(c => c.t);
  // Only show random picks that are still present in block.text (auto-clears when tag is removed)
  const displayPicks = (block.lastRandomPicks || []).filter(t => hasTag(block.text, t.en));
  const searchResults = search.trim().length > 0
    ? allTags.filter(t => t.en.toLowerCase().includes(search.toLowerCase()) || t.ja.includes(search))
    : [];

  // Analyze mode: count tags matching the pasted prompt
  const analyzedCount = analyzeText
    ? allTags.filter(t => hasTag(analyzeText, t.en)).length
    : 0;

  // Category accordion state — persisted in block.catStates via onUpdate
  const isCatOpen = cat => block.catStates?.[cat.n] ?? !CATS_CLOSED.has(cat.n);
  const toggleCat = cat => onUpdate({ catStates: { ...(block.catStates || {}), [cat.n]: !isCatOpen(cat) } });

  const handleAddCustom = () => {
    if (!customInput.trim()) return;
    onUpdate({ customTags: [...(block.customTags || []), { id: uid(), text: customInput.trim() }] });
    setCustomInput(''); setAddingCustom(false);
  };
  const doSave = () => {
    if (!pName.trim()) return;
    onSavePreset(pName.trim(), block.text);
    setPName(''); setSaving(false);
  };
  const toggleFav = en => {
    const f = block.favTags || [];
    onUpdate({ favTags: f.includes(en) ? f.filter(x => x !== en) : [...f, en] });
  };
  const onTagClick = en => {
    if (isLocked) return;
    navigator.vibrate?.(8);
    if (selectMode) {
      setSelectedTags(prev => prev.includes(en) ? prev.filter(x => x !== en) : [...prev, en]);
    } else {
      onUpdate({ text: toggleTag(block.text, en, block.strength) });
    }
  };
  const applyGroup = () => {
    if (selectedTags.length < 2) return;
    const inner = selectedTags.join(', ');
    const grouped = block.strength === '1.0' ? `(${inner})` : `(${inner}:${block.strength})`;
    onUpdate({ text: appendTag(block.text, grouped, '1.0') });
    setSelectedTags([]); setSelectMode(false);
  };
  const adjustWeight = delta => {
    const cur = parseFloat(block.strength) || 1.0;
    onUpdate({ strength: clampW(cur + delta) });
  };

  return (
    <div
      ref={setNodeRef}
      id={`block-${block.id}`}
      style={{
        borderLeftColor: block.enabled !== false ? block.color : 'rgb(var(--dim))',
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      className={`bg-surface border border-line border-l-[3px] rounded-card overflow-hidden mb-[6px] transition-opacity duration-200${block.enabled === false ? ' opacity-45' : ''}${isDragging ? ' shadow-2xl opacity-60 z-[999]' : ''}`}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className={`flex items-start gap-[6px] px-3 py-[9px]${block.collapsed ? '' : ' bg-surfalt border-b border-line'}`}
      >
        {/* LEFT: drag + move + toggle + badge + icon + name — takes all available space */}
        <div className="flex items-start gap-[6px] flex-1 min-w-0">
        {/* Drag handle */}
        <button
          {...listeners}
          title={lang === 'ja' ? 'ドラッグで並べ替え' : 'Drag to reorder'}
          className="bg-transparent border-none text-dim cursor-grab active:cursor-grabbing px-[4px] py-[2px] flex-shrink-0 text-[14px] leading-none select-none touch-none"
        >⠿</button>

        {/* Move buttons — hidden on mobile (drag to reorder) */}
        {!isMobile && (
          <div className="flex flex-col gap-[1px] flex-shrink-0">
            {['▲', '▼'].map((a, i) => (
              <button key={a}
                onClick={() => onMove(i === 0 ? -1 : 1)}
                disabled={i === 0 ? isFirst : isLast}
                className={`bg-transparent border-none px-[2px] text-[10px] leading-[1.2] cursor-pointer disabled:cursor-default ${(i === 0 ? isFirst : isLast) ? 'text-dim' : 'text-muted'}`}
              >{a}</button>
            ))}
          </div>
        )}

        {/* Toggle switch */}
        <div
          onClick={() => onUpdate({ enabled: block.enabled === false })}
          style={block.enabled !== false ? { background: block.color } : undefined}
          className={`w-7 h-4 rounded-full relative cursor-pointer flex-shrink-0 transition-colors duration-200${block.enabled !== false ? '' : ' bg-dim'}`}
        >
          <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-[left] duration-200 ${block.enabled !== false ? 'left-[14px]' : 'left-[2px]'}`} />
        </div>

        {/* Order badge */}
        {orderNum && (
          <span
            style={{ background: block.color + '22', border: `1px solid ${block.color}60`, color: block.color }}
            className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold font-mono flex items-center justify-center"
          >{orderNum}</span>
        )}

        <span
          className={`text-[14px] flex-shrink-0${block.isCustomBlock && onHide ? ' cursor-pointer select-none' : ''}`}
          onDoubleClick={block.isCustomBlock && onHide ? hideConfirm : undefined}
          onTouchStart={block.isCustomBlock && onHide ? handleDoubleTap : undefined}
          title={block.isCustomBlock && onHide ? (lang === 'ja' ? 'ダブルタップで非表示' : 'Double-tap to hide') : undefined}
        >{block.icon}</span>

        {/* Name — custom blocks are renameable */}
        {block.isCustomBlock ? (
          editingName ? (
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              maxLength={20}
              onBlur={() => {
                const n = nameInput.trim() || block.name;
                onUpdate({ name: n, nameEn: n });
                setEditingName(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') { const n = nameInput.trim() || block.name; onUpdate({ name: n, nameEn: n }); setEditingName(false); }
                if (e.key === 'Escape') { setNameInput(block.name); setEditingName(false); }
              }}
              autoFocus
              onClick={e => e.stopPropagation()}
              style={{ border: `1px solid ${block.color}80` }}
              className="text-[13px] font-bold bg-bg rounded-[5px] px-[6px] py-[1px] outline-none text-fg flex-1 min-w-0 font-mono"
            />
          ) : (
            <span
              onClick={() => { setNameInput(block.name); setEditingName(true); }}
              title={lang === 'ja' ? 'クリックで名前を変更' : 'Click to rename'}
              className={`${focusMode ? 'text-[16px]' : 'text-[13px]'} font-bold flex-1 min-w-0 leading-snug cursor-text group ${isLocked ? 'text-muted' : 'text-fg'}`}
            >
              {lang === 'ja' ? block.name : block.nameEn}
              <span className="ml-[4px] text-[10px] text-dim opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
            </span>
          )
        ) : (
          <span
            className={`${focusMode ? 'text-[16px]' : 'text-[13px]'} font-bold flex-1 min-w-0 leading-snug ${isLocked ? 'text-muted' : 'text-fg'}${onHide ? ' cursor-pointer select-none' : ''}`}
            onDoubleClick={onHide ? hideConfirm : undefined}
            onTouchStart={onHide ? handleDoubleTap : undefined}
            title={onHide ? (lang === 'ja' ? 'ダブルタップで非表示' : 'Double-tap to hide') : undefined}
          >
            {lang === 'ja' ? block.name : block.nameEn}
            {isLocked && <span className="ml-[6px] text-[11px]">🔒</span>}
          </span>
        )}
        </div>{/* END LEFT group */}

        {/* RIGHT: action buttons — never shrink, align to top */}
        <div className="flex items-start gap-[6px] flex-shrink-0">
        {/* Analyze match badge */}
        {analyzedCount > 0 && (
          <span className="text-[9px] font-mono font-bold px-[5px] py-[2px] rounded-[4px] flex-shrink-0"
            style={{ background: 'rgb(var(--c-teal) / 0.1)', border: '1px solid rgb(var(--c-teal) / 0.32)', color: 'rgb(var(--c-teal))' }}>
            ◎ {analyzedCount}
          </span>
        )}

        {/* Lock */}
        <button
          onClick={() => onUpdate({ locked: !block.locked })}
          style={isLocked ? { border: `1px solid ${block.color}`, color: block.color } : undefined}
          className={`bg-transparent rounded-[5px] px-[6px] py-[2px] text-[10px] cursor-pointer flex-shrink-0${isLocked ? '' : ' border border-dim text-dim'}`}
        >{isLocked ? '🔒' : '🔓'}</button>

        {/* Preset save */}
        {block.isPresetBlock && !isLocked && (
          <button
            onClick={() => setSaving(s => !s)}
            style={{
              background: saving ? block.color + '22' : 'none',
              border: `1px solid ${saving ? block.color : 'rgb(var(--dim))'}`,
              color: saving ? block.color : 'rgb(var(--muted))',
            }}
            className="rounded-[5px] px-[7px] py-[2px] text-[10px] cursor-pointer"
          >💾{!isMobile && (lang === 'ja' ? '保存' : ' Save')}</button>
        )}

        {/* Tag count */}
        {block.text && (
          <span
            style={{ background: block.color + '20', border: `1px solid ${block.color}70`, color: block.color }}
            className="text-[10px] font-mono font-bold px-[5px] py-[2px] rounded-[4px] flex-shrink-0 leading-none"
          >
            {countTags(block.text)}{lang === 'ja' ? 'タグ' : 't'}
          </span>
        )}

        {/* Focus mode */}
        {onFocus && (
          <button
            onClick={onFocus}
            title={focused ? (lang === 'ja' ? '集中モード解除' : 'Exit focus') : (lang === 'ja' ? '集中編集' : 'Focus')}
            style={{
              background: focused ? block.color + '22' : 'none',
              border: `1px solid ${focused ? block.color : 'rgb(var(--dim))'}`,
              color: focused ? block.color : 'rgb(var(--muted))',
            }}
            className="rounded-[5px] px-[6px] py-[2px] text-[10px] cursor-pointer flex-shrink-0"
          >{focused ? '⊗' : '⊕'}</button>
        )}

        {/* Transfer to other character */}
        {otherChars?.length > 0 && (
          <div className="relative flex-shrink-0 flex items-center">
            <button
              onClick={() => setTransferOpen(o => !o)}
              title={lang === 'ja' ? '他のキャラへ転送' : 'Transfer to character'}
              className="bg-transparent border border-dim rounded-[5px] px-[5px] py-[2px] text-dim text-[10px] cursor-pointer"
            >→</button>
            {transferOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-linebright rounded-[8px] overflow-hidden shadow-lg min-w-[120px]">
                {otherChars.map(c => (
                  <button key={c.id} onClick={() => { onTransfer?.(block.id, c.id); setTransferOpen(false); }}
                    className="w-full text-left px-[10px] py-[6px] text-[11px] text-fg cursor-pointer flex items-center gap-1"
                    onMouseOver={e => e.currentTarget.style.background = 'rgb(var(--surface-alt))'}
                    onMouseOut={e => e.currentTarget.style.background = ''}>
                    <span>{c.emoji}</span><span style={{ color: c.color }}>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Remove custom block */}
        {block.isCustomBlock && onRemove && (
          <button
            onClick={() => { if (!window.confirm(lang === 'ja' ? 'このカスタムブロックを削除しますか？' : 'Remove this custom block?')) return; onRemove(); }}
            title={lang === 'ja' ? 'ブロックを削除' : 'Remove block'}
            className="bg-transparent border border-dim rounded-[4px] text-[10px] px-[5px] py-[2px] cursor-pointer text-muted"
          >🗑</button>
        )}

        {/* Clear */}
        <button
          onClick={() => {
            if (block.text && !window.confirm(lang === 'ja' ? 'ブロックのテキストをすべて削除しますか？' : 'Clear all text in this block?')) return;
            onUpdate({ text: '', collapsed: false, lastRandomPicks: [] });
          }}
          disabled={isLocked}
          title={lang === 'ja' ? 'テキストをクリア' : 'Clear text'}
          className={`bg-transparent border border-dim rounded-[5px] text-[10px] px-[6px] py-[2px] cursor-pointer disabled:cursor-default disabled:opacity-30 ${isLocked ? 'text-dim' : 'text-muted'}`}
        >✕</button>

        {/* Collapse block */}
        <button
          onClick={() => onUpdate({ collapsed: !block.collapsed })}
          title={lang === 'ja' ? (block.collapsed ? '展開' : '折りたたむ') : (block.collapsed ? 'Expand' : 'Collapse')}
          className="bg-transparent border border-dim rounded-[5px] text-[10px] px-[6px] py-[2px] cursor-pointer text-muted"
        >{block.collapsed ? '▼' : '▲'}</button>
        </div>{/* END RIGHT group */}
      </div>

      {/* ── Preset save row ────────────────────────────────── */}
      {saving && (
        <div className="flex gap-[6px] items-center px-3 py-[7px] bg-bg border-b border-line">
          <span style={{ color: block.color }} className="text-[11px] flex-shrink-0">
            {lang === 'ja' ? 'プリセット名:' : 'Name:'}
          </span>
          <input
            value={pName}
            onChange={e => setPName(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') doSave(); if (e.key === 'Escape') { setSaving(false); setPName(''); } }}
            placeholder={lang === 'ja' ? '例: 夏服' : 'e.g. summer outfit'}
            style={{ border: `1px solid ${block.color}60` }}
            className="flex-1 rounded-[5px] text-[12px] px-[9px] py-1 outline-none font-mono bg-bg text-fg"
          />
          <button
            onClick={doSave}
            style={{ background: block.color }}
            className="border-none rounded-[5px] text-black px-3 py-1 text-[11px] cursor-pointer font-bold"
          >{lang === 'ja' ? '保存' : 'Save'}</button>
          <button
            onClick={() => { setSaving(false); setPName(''); }}
            className="bg-transparent rounded-[5px] px-2 py-1 text-[11px] cursor-pointer border border-dim text-muted"
          >×</button>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────── */}
      {!block.collapsed && (
        <div className="p-[12px_14px]">

          {/* Negative suggestions — negative block only */}
          {block.id === 'negative' && (
            <div className="mb-[10px]">
              <div className="text-muted text-[10px] font-mono font-semibold tracking-[0.08em] mb-[5px] uppercase">
                {lang === 'ja' ? '🚫 クイック追加' : '🚫 Quick Add'}
              </div>
              <div className="flex gap-[4px] flex-wrap">
                {NEG_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      if (isLocked) return;
                      let text = block.text;
                      for (const tag of preset.tags) {
                        if (!hasTag(text, tag)) text = appendTag(text, tag, '1.0');
                      }
                      onUpdate({ text });
                    }}
                    disabled={isLocked}
                    title={preset.tags.slice(0, 4).join(', ') + '...'}
                    className="rounded-[6px] px-[7px] py-[3px] text-[11px] cursor-pointer disabled:cursor-default border border-dim text-muted font-mono transition-all duration-[120ms]"
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'rgb(var(--c-red))'; e.currentTarget.style.color = 'rgb(var(--c-red))'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
                  >
                    {preset.icon} {lang === 'ja' ? preset.ja : preset.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expression Presets — face block only */}
          {block.id === 'face' && (() => {
            const applyExpr = (preset) => {
              if (isLocked) return;
              const isActive = preset.tags.every(tag => hasTag(block.text, tag));
              let text = block.text;
              for (const tag of ALL_EXPR_TAGS) text = removeTag(text, tag);
              if (!isActive) {
                for (const tag of preset.tags) text = appendTag(text, tag, block.strength);
              }
              onUpdate({ text });
            };
            const clearExpr = () => {
              if (isLocked) return;
              let text = block.text;
              for (const tag of ALL_EXPR_TAGS) text = removeTag(text, tag);
              onUpdate({ text });
            };
            const activePreset = EXPRESSION_PRESETS.find(p => p.tags.every(tag => hasTag(block.text, tag)));
            const hasAny = EXPRESSION_PRESETS.some(p => p.tags.some(tag => hasTag(block.text, tag)));
            return (
              <div className="mb-[10px]">
                <div className="text-muted text-[10px] font-mono font-semibold tracking-[0.08em] mb-[5px] uppercase">
                  {lang === 'ja' ? '😊 表情プリセット' : '😊 Expression'}
                </div>
                <div className="flex gap-[4px] flex-wrap">
                  {EXPRESSION_PRESETS.map(preset => {
                    const active = activePreset?.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => applyExpr(preset)}
                        disabled={isLocked}
                        title={preset.tags.join(', ')}
                        style={active ? { background: block.color + '22', border: `1px solid ${block.color}`, color: block.color } : undefined}
                        className={`rounded-[6px] px-[7px] py-[3px] text-[11px] cursor-pointer disabled:cursor-default transition-all duration-[120ms] font-mono ${active ? 'font-bold' : 'border border-dim text-muted font-normal'}`}
                      >
                        {preset.icon} {lang === 'ja' ? preset.ja : preset.en}
                      </button>
                    );
                  })}
                  {hasAny && (
                    <button
                      onClick={clearExpr}
                      disabled={isLocked}
                      title={lang === 'ja' ? '表情タグをすべて削除' : 'Remove all expression tags'}
                      className="rounded-[6px] px-[7px] py-[3px] text-[10px] cursor-pointer disabled:cursor-default border border-dim text-dim font-mono"
                    >✕ {lang === 'ja' ? 'クリア' : 'clear'}</button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Textarea */}
          <textarea
            value={block.text}
            readOnly={isLocked}
            onChange={e => !isLocked && onUpdate({ text: e.target.value })}
            placeholder={isLocked
              ? (lang === 'ja' ? '🔒 ロック中' : '🔒 Locked')
              : block.isCustomBlock
                ? (lang === 'ja' ? 'カスタムプロンプトを入力' : 'Enter custom prompt')
                : (lang === 'ja' ? `${block.name}のプロンプト` : `${block.nameEn} prompt`)}
            style={{ color: block.text ? 'rgb(var(--prompt-text))' : undefined }}
            className={`w-full ${focusMode ? 'min-h-[80px] max-h-[160px] text-[14px]' : 'min-h-[54px] max-h-[120px] text-[12px]'} rounded-[7px] px-[11px] py-[9px] font-mono resize-y box-border outline-none leading-[1.65] bg-bg ${block.text ? '' : 'text-muted'} ${isLocked ? 'border border-dim opacity-50' : 'border border-linebright'}`}
            onFocus={e => { if (!isLocked) e.target.style.borderColor = block.color + '80'; }}
            onBlur={e => { e.target.style.borderColor = ''; }}
          />

          {/* Strength + controls row */}
          <div className="my-[9px] mb-[11px]">
            <div className={`flex items-center flex-wrap ${isCompact ? 'gap-[3px]' : 'gap-[5px]'}`}>
              <span className="text-[10px] font-mono font-semibold text-muted">{lang === 'ja' ? '強度:' : 'Str:'}</span>

              {(isMobile ? STRENGTHS.filter(s => s.v === '1.0' || s.v === '1.2') : STRENGTHS).map(s => (
                <button key={s.v}
                  disabled={isLocked}
                  onClick={() => onUpdate({ strength: s.v })}
                  title={s.v}
                  style={block.strength === s.v ? { background: block.color + '22', border: `1px solid ${block.color}`, color: block.color } : undefined}
                  className={`rounded-[5px] py-[2px] text-[10px] cursor-pointer disabled:cursor-default font-mono whitespace-nowrap transition-all duration-[120ms] ${isCompact ? 'px-[4px]' : 'px-[6px]'} ${block.strength === s.v ? 'font-bold' : 'font-normal border border-dim text-muted'}`}
                >
                  {lang === 'ja' ? s.l : s.le}
                  {!isCompact && <span className="opacity-50 ml-[3px] text-[9px]">{s.v}</span>}
                </button>
              ))}

              {/* ±0.05 fine adjust */}
              <div className="flex items-center gap-[2px] ml-[2px]">
                <button disabled={isLocked} onClick={() => adjustWeight(-0.05)} title="-0.05"
                  className="bg-transparent border border-dim text-muted rounded-[5px_0_0_5px] px-[6px] py-[2px] text-[11px] cursor-pointer disabled:cursor-default font-mono">−</button>
                <span
                  style={block.strength !== '1.0' ? { color: block.color } : undefined}
                  className={`text-[10px] font-mono min-w-[30px] text-center px-0 py-[2px] bg-bg border-t border-b border-dim${block.strength !== '1.0' ? '' : ' text-muted'}`}
                >{block.strength}</span>
                <button disabled={isLocked} onClick={() => adjustWeight(0.05)} title="+0.05"
                  className="bg-transparent border border-dim text-muted rounded-[0_5px_5px_0] px-[6px] py-[2px] text-[11px] cursor-pointer disabled:cursor-default font-mono">＋</button>
              </div>

              {/* Select/group mode */}
              <button
                disabled={isLocked}
                onClick={() => { setSelectMode(m => !m); setSelectedTags([]); }}
                title={lang === 'ja' ? '複数選択して括弧でまとめる' : 'Select multiple to group'}
                style={{
                  background: selectMode ? block.color + '22' : 'transparent',
                  border: `1px solid ${selectMode ? block.color : 'rgb(var(--dim))'}`,
                  color: selectMode ? block.color : 'rgb(var(--muted))',
                }}
                className="rounded-[5px] px-2 py-[2px] text-[10px] cursor-pointer disabled:cursor-default font-mono"
              >{selectMode ? (lang === 'ja' ? '選択中' : 'Selecting') : (lang === 'ja' ? '⊞まとめ' : '⊞Group')}</button>

              {/* Random inspiration */}
              {!isLocked && block.id !== 'negative' && (
                <button
                  onClick={() => {
                    // Remove previously added random picks before re-rolling
                    let baseText = block.text;
                    for (const t of (block.lastRandomPicks || [])) baseText = removeTag(baseText, t.en);

                    // Collect exclusions from tags already in baseText
                    const excluded = new Set();
                    baseText.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).forEach(en => {
                      const excl = RANDOM_EXCLUSION_RULES.get(en);
                      if (excl) excl.forEach(e => excluded.add(e.toLowerCase()));
                    });

                    // Apply BLOCK_RANDOM_RULES: resolve mutually exclusive category groups
                    const rules = BLOCK_RANDOM_RULES[block.id] || {};
                    const disabledCats = new Set();
                    for (const group of (rules.exclusiveGroups || [])) {
                      const present = group.filter(n => block.cats.some(c => c.n === n));
                      if (present.length < 2) continue;
                      const winner = present[Math.floor(Math.random() * present.length)];
                      present.forEach(n => { if (n !== winner) disabledCats.add(n); });
                    }

                    const coreCats = block.cats.filter(c => !OPTIONAL_CAT_NAMES.has(c.n) && !disabledCats.has(c.n));
                    const optCats  = block.cats.filter(c =>  OPTIONAL_CAT_NAMES.has(c.n) && !disabledCats.has(c.n));
                    const maxPicks = Math.min(2 + Math.floor(block.cats.length / 3), 6);

                    const picks = [];
                    const skippedCats = new Set(disabledCats);
                    const tryPick = (cat) => {
                      if (picks.length >= maxPicks || skippedCats.has(cat.n)) return;
                      const unused = cat.t.filter(t => {
                        const en = t.en.toLowerCase();
                        return !hasTag(baseText, t.en) && !TIER3_TAGS.has(en) && !excluded.has(en);
                      });
                      if (unused.length === 0) return;
                      const pick = unused[Math.floor(Math.random() * unused.length)];
                      // 武器タグは追加ゲート
                      if (WEAPON_TAGS.has(pick.en.toLowerCase()) && Math.random() > WEAPON_PICK_PROB) return;
                      picks.push(pick);
                      if (WEAPON_TAGS.has(pick.en.toLowerCase())) {
                        HAND_POSE_TAGS.forEach(t => excluded.add(t.toLowerCase()));
                      }
                      const newExcl = RANDOM_EXCLUSION_RULES.get(pick.en.toLowerCase());
                      if (newExcl) newExcl.forEach(e => excluded.add(e.toLowerCase()));
                      (rules.skipIfPicked?.[cat.n] || []).forEach(n => skippedCats.add(n));
                    };

                    for (const cat of coreCats) tryPick(cat);
                    const shuffledOpt = [...optCats].sort(() => Math.random() - 0.5);
                    for (const cat of shuffledOpt) {
                      if (picks.length >= maxPicks || skippedCats.has(cat.n)) continue;
                      if (Math.random() < 0.45) tryPick(cat);
                    }

                    if (picks.length === 0) return;
                    let text = baseText;
                    for (const t of picks) text = appendTag(text, t.en, block.strength);
                    onUpdate({ text, collapsed: false, lastRandomPicks: picks });
                  }}
                  title={lang === 'ja' ? (displayPicks.length > 0 ? '再抽選' : 'ランダムでタグ追加') : (displayPicks.length > 0 ? 'Re-roll' : 'Add random tags')}
                  style={displayPicks.length > 0 ? { borderColor: block.color, color: block.color } : undefined}
                  className="border border-dim text-muted rounded-[5px] px-[5px] py-[2px] text-[11px] cursor-pointer font-mono"
                >🎲{displayPicks.length > 0 ? ' ↻' : ''}</button>
              )}
            </div>

            {/* Search — always on its own row for clean layout */}
            <div className="flex items-center gap-1 rounded-[6px] px-2 py-[3px] mt-[6px] bg-bg border border-line/50">
              <span className="text-[10px] text-muted">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'ja' ? 'タグ検索...' : 'Search tags...'}
                className="bg-transparent border-none outline-none text-[11px] flex-1 font-mono text-fg"
              />
              {search && (
                <span onClick={() => setSearch('')} className="cursor-pointer text-[10px] text-muted">×</span>
              )}
            </div>
          </div>

          {/* Last random picks indicator — auto-hides when tags are removed from text */}
          {displayPicks.length > 0 && (
            <div className="flex items-center gap-[5px] flex-wrap mb-[8px]">
              <span className="text-muted text-[10px] font-mono font-semibold">{lang === 'ja' ? '🎲 追加:' : '🎲 added:'}</span>
              {displayPicks.map(t => (
                <span key={t.en}
                  style={{ background: block.color + '22', border: `1px solid ${block.color}60`, color: block.color }}
                  className="text-[10px] font-mono px-[6px] py-[1px] rounded-[4px] font-semibold"
                >{lang === 'ja' ? t.ja : t.en}</span>
              ))}
              <button onClick={() => onUpdate({ lastRandomPicks: [] })} className="text-dim text-[9px] cursor-pointer ml-[2px]">×</button>
            </div>
          )}

          {/* Select mode bar */}
          {selectMode && (
            <div
              style={{ background: block.color + '12', border: `1px dashed ${block.color}60` }}
              className="flex items-center gap-2 flex-wrap mb-[10px] px-[10px] py-2 rounded-[7px]"
            >
              <span style={{ color: block.color }} className="text-[10px] font-mono">
                {lang === 'ja' ? `⊞ ${selectedTags.length}個選択中` : `⊞ ${selectedTags.length} selected`}
              </span>
              {selectedTags.length >= 2 && (
                <code className="text-[10px] font-mono px-[6px] py-[2px] rounded text-accent bg-bg">
                  {block.strength === '1.0' ? `(${selectedTags.join(', ')})` : `(${selectedTags.join(', ')}:${block.strength})`}
                </code>
              )}
              <div className="flex-1" />
              <button
                disabled={selectedTags.length < 2}
                onClick={applyGroup}
                style={selectedTags.length >= 2 ? { background: block.color } : undefined}
                className={`border-none rounded-[5px] px-3 py-1 text-[10px] cursor-pointer disabled:cursor-default font-bold ${selectedTags.length >= 2 ? 'text-black' : 'bg-dim text-muted'}`}
              >{lang === 'ja' ? '括弧でまとめて追加' : 'Group & add'}</button>
              <button
                onClick={() => { setSelectMode(false); setSelectedTags([]); }}
                className="bg-transparent rounded-[5px] px-2 py-1 text-[10px] cursor-pointer border border-dim text-muted"
              >{lang === 'ja' ? 'やめる' : 'Cancel'}</button>
            </div>
          )}

          {/* ⭐ Favorites — always on top, not collapsible (案C) */}
          {block.favTags?.length > 0 && !search && (
            <div className="mb-[10px] px-[10px] py-[8px] rounded-[7px] bg-tint-warn border border-warn/20">
              <div className="text-[10px] font-mono mb-[5px] text-warn-text">
                ⭐ {lang === 'ja' ? 'お気に入り' : 'Favorites'}
              </div>
              <div className="flex flex-wrap gap-1">
                {block.favTags.map(en => {
                  const tag = allTags.find(t => t.en === en);
                  if (!tag) return null;
                  return (
                    <TagBtn key={en} tag={tag} color={block.color} lang={lang} isFav disabled={isLocked}
                      active={hasTag(block.text, en)} selectMode={selectMode} selected={selectedTags.includes(en)}
                      conflict={conflictTags?.has(en.toLowerCase()) && hasTag(block.text, en)}
                      desc={TAG_DICT[en]} large={focusMode}
                      onInsert={() => onTagClick(en)} onToggleFav={() => toggleFav(en)} />
                  );
                })}
              </div>
            </div>
          )}

          {/* Search results */}
          {search && (
            <div className="mb-[10px]">
              <div className="text-[10px] font-mono mb-[5px] text-accent">
                🔍 {lang === 'ja' ? `${searchResults.length}件` : `${searchResults.length} results`}
              </div>
              {searchResults.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {searchResults.map(tag => (
                    <TagBtn key={tag.en} tag={tag} color={block.color} lang={lang}
                      isFav={block.favTags?.includes(tag.en)} disabled={isLocked}
                      active={hasTag(block.text, tag.en)}
                      analyzed={!!analyzeText && hasTag(analyzeText, tag.en) && !hasTag(block.text, tag.en)}
                      selectMode={selectMode} selected={selectedTags.includes(tag.en)}
                      conflict={conflictTags?.has(tag.en.toLowerCase()) && hasTag(block.text, tag.en)}
                      desc={TAG_DICT[tag.en]} large={focusMode}
                      onInsert={() => onTagClick(tag.en)} onToggleFav={() => toggleFav(tag.en)} />
                  ))}
                </div>
              ) : (
                <div className="text-[11px] font-mono p-1 text-muted">
                  {lang === 'ja' ? '見つかりません' : 'Not found'}
                </div>
              )}
            </div>
          )}

          {/* Category accordion (案A) */}
          {!search && block.cats.map(cat => {
            const isOpen = isCatOpen(cat);
            return (
              <div key={cat.n}>
                <button
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center gap-[6px] py-[4px] bg-transparent border-none cursor-pointer text-left select-none"
                >
                  <span style={isOpen ? { color: block.color } : undefined} className={`text-[10px] flex-shrink-0 font-bold${isOpen ? '' : ' text-muted'}`}>
                    {isOpen ? '▼' : '▶'}
                  </span>
                  <span className={`${focusMode ? 'text-[13px]' : 'text-[11px]'} font-mono font-medium ${isOpen ? 'text-fg' : 'text-muted'}`}>
                    {lang === 'ja' ? cat.n : cat.nEn}
                  </span>
                  <span className="text-[10px] font-mono text-muted">({[...new Map(cat.t.map(t => [t.en, t])).values()].length})</span>
                  <div className="flex-1 h-px bg-line" />
                </button>
                {isOpen && (
                  <div className="flex flex-wrap gap-1 pt-[3px] pb-[8px]">
                    {(sceneActive && cat.n === '性別・人数'
                      ? cat.t.filter(tag => !SCENE_MANAGED_TAGS.has(tag.en))
                      : cat.t
                    ).filter((tag, i, arr) => arr.findIndex(t => t.en === tag.en) === i)
                    .map(tag => (
                      <TagBtn key={tag.en} tag={tag} color={block.color} lang={lang}
                        isFav={block.favTags?.includes(tag.en)} disabled={isLocked}
                        active={hasTag(block.text, tag.en)}
                        analyzed={!!analyzeText && hasTag(analyzeText, tag.en) && !hasTag(block.text, tag.en)}
                        selectMode={selectMode} selected={selectedTags.includes(tag.en)}
                        conflict={conflictTags?.has(tag.en.toLowerCase()) && hasTag(block.text, tag.en)}
                        desc={TAG_DICT[tag.en]} large={focusMode}
                        onInsert={() => onTagClick(tag.en)} onToggleFav={() => toggleFav(tag.en)} />
                    ))}
                    {sceneActive && cat.n === '性別・人数' && (
                      <span className="text-[10px] font-mono text-muted self-center px-[4px]">
                        {lang === 'ja' ? '複数人数はシーン合成で設定' : 'Multi-person: use Scene Compose'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom tags */}
          {!search && (block.customTags || []).length > 0 && (
            <div className="mb-2 p-2 rounded-[7px] bg-bg" style={{ border: `1px solid ${block.color}30` }}>
              <div style={{ color: block.color }} className="text-[10px] font-mono mb-[5px]">
                ✏️ {lang === 'ja' ? 'カスタム' : 'Custom'}
              </div>
              <div className="flex flex-wrap gap-1">
                {(block.customTags || []).map(ct => (
                  <div
                    key={ct.id}
                    style={{
                      background: hasTag(block.text, ct.text) ? block.color + '22' : 'rgb(var(--surface-alt))',
                      border: `1px solid ${hasTag(block.text, ct.text) ? block.color + '90' : block.color + '40'}`,
                    }}
                    className="inline-flex items-center rounded-[5px] overflow-hidden"
                  >
                    <button
                      disabled={isLocked}
                      onClick={() => onUpdate({ text: toggleTag(block.text, ct.text, block.strength) })}
                      style={{ color: block.color }}
                      className={`bg-transparent border-none px-2 py-[3px] text-[11px] cursor-pointer disabled:cursor-default font-mono ${hasTag(block.text, ct.text) ? 'font-bold' : 'font-normal'}`}
                    >{hasTag(block.text, ct.text) ? '✓ ' : ''}{ct.text}</button>
                    <button
                      onClick={() => {
                        if (!window.confirm(lang === 'ja' ? `カスタムタグ「${ct.text}」を削除しますか？` : `Delete custom tag "${ct.text}"?`)) return;
                        onUpdate({ customTags: (block.customTags || []).filter(x => x.id !== ct.id) });
                      }}
                      onMouseOver={e => e.target.style.color = '#f87171'}
                      onMouseOut={e => e.target.style.color = ''}
                      className="bg-transparent border-l border-line text-dim px-[5px] py-[3px] cursor-pointer text-[9px]"
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add custom tag */}
          {!search && (
            addingCustom ? (
              <div className="flex gap-[6px] items-center mt-1">
                <input
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCustom(); if (e.key === 'Escape') { setAddingCustom(false); setCustomInput(''); } }}
                  placeholder={lang === 'ja' ? 'タグを入力（英語推奨）...' : 'Enter tag text...'}
                  style={{ border: `1px solid ${block.color}60` }}
                  className="flex-1 rounded-[5px] text-[11px] px-[9px] py-1 outline-none font-mono bg-bg text-fg"
                />
                <button onClick={handleAddCustom} style={{ background: block.color }}
                  className="border-none rounded-[5px] text-black px-[10px] py-1 text-[11px] cursor-pointer font-bold">
                  {lang === 'ja' ? '追加' : 'Add'}
                </button>
                <button onClick={() => { setAddingCustom(false); setCustomInput(''); }}
                  className="bg-transparent rounded-[5px] px-[7px] py-1 text-[11px] cursor-pointer border border-dim text-muted">×</button>
              </div>
            ) : (
              <button
                onClick={() => setAddingCustom(true)}
                disabled={isLocked}
                onMouseOver={e => { if (!isLocked) e.target.style.borderColor = block.color; }}
                onMouseOut={e => e.target.style.borderColor = isLocked ? 'rgb(var(--dim))' : block.color + '60'}
                style={{
                  border: `1px dashed ${isLocked ? 'rgb(var(--dim))' : block.color + '60'}`,
                  color: isLocked ? 'rgb(var(--muted))' : block.color,
                }}
                className="bg-transparent rounded-[5px] px-[10px] py-[3px] text-[10px] cursor-pointer disabled:cursor-default font-mono mt-1"
              >+ {lang === 'ja' ? 'カスタムタグ追加' : 'Add custom tag'}</button>
            )
          )}

        </div>
      )}
    </div>
  );
}
