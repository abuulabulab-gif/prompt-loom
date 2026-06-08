import { useState, useRef, useEffect, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { STRENGTHS, uid, appendTag, countTags, hasTag, toggleTag, clampW, removeTag, splitTags, bareTag, OPTIONAL_CAT_NAMES, RARE_OPT_CAT_NAMES, BLOCK_RANDOM_RULES, TIER3_TAGS, RANDOM_EXCLUDE_TAGS, RANDOM_EXCLUSION_RULES, WEAPON_TAGS, WEAPON_PICK_PROB, HAND_POSE_TAGS, TAG_PAIR_COMBOS, TAG_SPECIES_COMBOS } from "../data/constants.js";
import { CONFLICT_MAP } from "../data/conflicts.js";
import { EXPRESSION_PRESETS, ALL_EXPR_TAGS } from "../data/expressions.js";
import { NEG_PRESETS } from "../data/negSuggestions.js";
import TagBtn from "./TagBtn.jsx";
import { TAG_DICT } from "../data/tagDictionary.js";
import { resolveColorLabel } from "../data/colors.js";
import { resolveFeatureLabel } from "../data/features.js";
import { resolveMaterialLabel } from "../data/materials.js";

// Category IDs that start collapsed; all others start open.
// Uses cat.id (stable, defined in blocks.js) — not cat.n (Japanese name).
const CATS_CLOSED = new Set([
  // 顔
  'face_innerhair', 'face_bangs', 'face_eyeshape', 'face_eyebrows', 'face_mouth', 'face_hairdetail', 'face_makeup',
  // 属性
  'attr_age', 'attr_kemono', 'attr_parts',
  // 体型
  'body_skin', 'body_detail', 'body_focus', 'body_feet',
  // 衣装
  'outfit_tops', 'outfit_bottoms', 'outfit_fabric', 'outfit_accessories',
  // 特徴
  'feature_piercing', 'feature_equipment',
  // エフェクト
  'effect_particles', 'effect_weather', 'effect_filter',
  // 構図
  'comp_hands', 'comp_gaze', 'comp_situation',
  // 背景
  'bg_indoor', 'bg_time', 'bg_season',
  // ライティング
  'light_style',
  // 品質
  'quality_finish', 'quality_face',
  // アートスタイル
  'style_color', 'style_render',
  // ネガティブ
  'neg_other',
]);

const SCENE_MANAGED_TAGS = new Set(['2girls', '2boys', 'multiple girls', 'multiple boys', '1other']);

export default function BlockCard({ block, lang, orderNum, onUpdate, onMove, isFirst, isLast, onSavePreset, onFocus, focused, otherChars, onTransfer, conflictTags, onRemove, onHide, isMobile, isCompact, focusMode, sceneActive, analyzeText, allBlocks, onUndoBackup, isLight, onColorPicker, onFeatureMaker, onMaterialMaker }) {
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [pName, setPName] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [editingCustomId, setEditingCustomId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [addingSectionName, setAddingSectionName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState('');
  const [addingTagInSection, setAddingTagInSection] = useState(null);
  const [secTagText, setSecTagText] = useState('');
  const [secTagLabel, setSecTagLabel] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(block.name);

  const blockColor = isLight ? (block.colorLight ?? block.color) : block.color;

  // en→ja lookup for active tag chips
  const enToJa = useMemo(() => {
    const m = new Map();
    for (const cat of block.cats) for (const t of cat.t) if (!m.has(t.en.toLowerCase())) m.set(t.en.toLowerCase(), t.ja);
    return m;
  }, [block.cats]);

  // Refs to each TagBtn DOM node (keyed by en.toLowerCase()) for jump scroll
  const tagRefs = useRef({});
  const [pendingScrollTag, setPendingScrollTag] = useState(null);

  // After accordion opens (catStates changes), scroll to pending tag.
  // setTimeout gives React two extra frames to mount newly-opened accordion items.
  useEffect(() => {
    if (!pendingScrollTag) return;
    const t = setTimeout(() => {
      const el = tagRefs.current[pendingScrollTag];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          el.classList.add('tag-highlight');
          setTimeout(() => el.classList.remove('tag-highlight'), 1200);
        }, 300);
      }
      setPendingScrollTag(null);
    }, 80);
    return () => clearTimeout(t);
  }, [pendingScrollTag, block.catStates]);

  const handleChipJump = (bare) => {
    const bareLower = bare.toLowerCase();
    const targetCat = block.cats.find(cat => cat.t.some(t => t.en.toLowerCase() === bareLower));
    if (!targetCat) return;
    if (!isCatOpen(targetCat)) {
      onUpdate({ catStates: { ...(block.catStates || {}), [targetCat.id]: true } });
    }
    setPendingScrollTag(bareLower);
  };

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

  // Category accordion state — persisted in block.catStates via onUpdate.
  // Key is cat.id (stable), not cat.n (Japanese name that may change).
  const isCatOpen = cat => block.catStates?.[cat.id] ?? !CATS_CLOSED.has(cat.id);
  const toggleCat = cat => onUpdate({ catStates: { ...(block.catStates || {}), [cat.id]: !isCatOpen(cat) } });

  const handleAddCustom = () => {
    if (!customInput.trim()) return;
    const entry = { id: uid(), text: customInput.trim() };
    if (customLabel.trim()) entry.label = customLabel.trim();
    onUpdate({ customTags: [...(block.customTags || []), entry] });
    setCustomInput(''); setCustomLabel(''); setAddingCustom(false);
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
      return;
    }
    const willBeOn = !hasTag(block.text, en);
    let newText = toggleTag(block.text, en, block.strength);

    if (block.id === 'attribute') {
      const enLower = en.toLowerCase();
      // Bidirectional pair: sync companion tag
      const pair = TAG_PAIR_COMBOS.get(enLower);
      if (pair) {
        if (willBeOn) {
          if (!hasTag(newText, pair)) newText = appendTag(newText, pair, block.strength);
        } else {
          newText = removeTag(newText, pair);
        }
      }
      // Species → parts: add when turning ON
      if (willBeOn) {
        const parts = TAG_SPECIES_COMBOS.get(enLower);
        if (parts) {
          for (const part of parts) {
            if (!hasTag(newText, part)) newText = appendTag(newText, part, block.strength);
          }
        }
      }
    }

    onUpdate({ text: newText });
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
        borderLeftColor: block.enabled !== false ? blockColor : 'rgb(var(--dim))',
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      className={`bg-surface border border-line border-l-[3px] rounded-card overflow-hidden mb-1.5 transition-opacity duration-200${block.enabled === false ? ' opacity-45' : ''}${isDragging ? ' shadow-2xl opacity-60 z-[999]' : ''}`}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 px-3 ${focusMode ? 'py-[0.8125rem]' : 'py-[0.5625rem]'}${block.collapsed ? '' : ' bg-surfalt border-b border-line'}`}
      >
        {/* LEFT: drag + move + toggle + badge + icon + name — takes all available space */}
        {/* On mobile: w-full forces full row → buttons wrap to row 2 and right-align via ml-auto */}
        <div className={`flex items-center gap-1.5 ${isMobile ? 'w-full' : 'flex-1 min-w-[8.125rem]'}`}>
        {/* Drag handle */}
        <button
          {...listeners}
          title={lang === 'ja' ? 'ドラッグで並べ替え' : 'Drag to reorder'}
          className="bg-transparent border-none text-dim cursor-grab active:cursor-grabbing px-1 py-0.5 flex-shrink-0 text-sm leading-none select-none touch-none"
        >⠿</button>

        {/* Move buttons — hidden on mobile (drag to reorder) */}
        {!isMobile && (
          <div className="flex flex-col gap-[0.0625rem] flex-shrink-0">
            {['▲', '▼'].map((a, i) => (
              <button key={a}
                onClick={() => onMove(i === 0 ? -1 : 1)}
                disabled={i === 0 ? isFirst : isLast}
                className={`bg-transparent border-none px-0.5 text-[0.625rem] leading-[1.2] cursor-pointer disabled:cursor-default ${(i === 0 ? isFirst : isLast) ? 'text-dim' : 'text-muted'}`}
              >{a}</button>
            ))}
          </div>
        )}

        {/* Toggle switch */}
        <div
          onClick={() => onUpdate({ enabled: block.enabled === false })}
          style={block.enabled !== false ? { background: blockColor } : undefined}
          className={`w-7 h-4 rounded-full relative cursor-pointer flex-shrink-0 transition-colors duration-200${block.enabled !== false ? '' : ' bg-dim'}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-[left] duration-200 ${block.enabled !== false ? 'left-3.5' : 'left-0.5'}`} />
        </div>

        {/* Order badge */}
        {orderNum && (
          <span
            style={{ background: blockColor + '22', border: `1px solid ${blockColor}60`, color: blockColor }}
            className="flex-shrink-0 min-w-[1.125rem] h-[1.125rem] rounded-full text-[0.625rem] font-bold font-mono flex items-center justify-center"
          >{orderNum}</span>
        )}

        <span
          className={`text-sm flex-shrink-0${block.isCustomBlock && onHide ? ' cursor-pointer select-none' : ''}`}
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
              style={{ border: `1px solid ${blockColor}80` }}
              className="text-[0.8125rem] font-bold bg-bg rounded-[0.3125rem] px-1.5 py-[0.0625rem] outline-none text-fg flex-1 min-w-0 font-mono"
            />
          ) : (
            <span
              onClick={() => { setNameInput(block.name); setEditingName(true); }}
              title={lang === 'ja' ? 'クリックで名前を変更' : 'Click to rename'}
              className={`${focusMode ? 'text-base' : 'text-[0.8125rem]'} font-bold flex-1 min-w-0 leading-snug break-words cursor-text group ${isLocked ? 'text-muted' : 'text-fg'}`}
            >
              {lang === 'ja' ? block.name : block.nameEn}
              <span className="ml-1 text-[0.625rem] text-dim opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
            </span>
          )
        ) : (
          <span
            className={`${focusMode ? 'text-base' : 'text-[0.8125rem]'} font-bold flex-1 min-w-0 leading-snug break-words ${isLocked ? 'text-muted' : 'text-fg'}${onHide ? ' cursor-pointer select-none' : ''}`}
            onDoubleClick={onHide ? hideConfirm : undefined}
            onTouchStart={onHide ? handleDoubleTap : undefined}
            title={onHide ? (lang === 'ja' ? 'ダブルタップで非表示' : 'Double-tap to hide') : undefined}
          >
            {lang === 'ja' ? block.name : block.nameEn}
            {isLocked && <span className="ml-1.5 text-[0.6875rem]">🔒</span>}
          </span>
        )}
        </div>{/* END LEFT group */}

        {/* RIGHT: action buttons — never shrink, right-align when wrapping to 2nd row */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
        {/* Analyze match badge */}
        {analyzedCount > 0 && (
          <span className="text-[0.5625rem] font-mono font-bold px-[0.3125rem] py-0.5 rounded flex-shrink-0"
            style={{ background: 'rgb(var(--c-teal) / 0.1)', border: '1px solid rgb(var(--c-teal) / 0.32)', color: 'rgb(var(--c-teal))' }}>
            ◎ {analyzedCount}
          </span>
        )}

        {/* Lock */}
        <button
          onClick={() => onUpdate({ locked: !block.locked })}
          style={isLocked ? { border: `1px solid ${blockColor}`, color: blockColor } : undefined}
          className={`bg-transparent rounded-[0.3125rem] ${focusMode ? 'px-[0.5625rem] py-1 text-[0.8125rem]' : 'px-1.5 py-0.5 text-[0.625rem]'} cursor-pointer flex-shrink-0${isLocked ? '' : ' border border-dim text-dim'}`}
        >{isLocked ? '🔒' : '🔓'}</button>


        {/* Tag count — same height as adjacent buttons */}
        {block.text && (
          <span
            style={{ background: blockColor + '20', border: `1px solid ${blockColor}70`, color: blockColor }}
            className={`inline-flex items-center font-mono font-bold rounded flex-shrink-0 ${focusMode ? 'text-[0.8125rem] px-2 py-[0.1875rem] h-[1.875rem]' : 'text-[0.625rem] px-[0.3125rem] py-0.5 h-[1.375rem]'}`}
          >
            {countTags(block.text)}{lang === 'ja' ? 'タグ' : 't'}
          </span>
        )}

        {/* Template block undo */}
        {onUndoBackup !== undefined && (
          <button
            onClick={onUndoBackup}
            title={lang === 'ja' ? 'テンプレート適用前に戻す' : 'Revert this block'}
            className={`bg-transparent border border-dim rounded-[0.3125rem] text-dim cursor-pointer flex-shrink-0 ${focusMode ? 'px-[0.5625rem] py-1 text-[0.8125rem]' : 'px-1.5 py-0.5 text-[0.625rem]'}`}
          >↩</button>
        )}

        {/* Color picker shortcut */}
        {onColorPicker && !isLocked && (
          <button
            onClick={onColorPicker}
            title={lang === 'ja' ? 'カラーメーカーで色を追加' : 'Add color with Color Maker'}
            className={`bg-transparent border border-dim rounded-[0.3125rem] text-muted cursor-pointer flex-shrink-0 ${focusMode ? 'px-[0.5625rem] py-1 text-[0.8125rem]' : 'px-1.5 py-0.5 text-[0.625rem]'}`}
          >🎨</button>
        )}

        {/* Feature maker shortcut */}
        {onFeatureMaker && !isLocked && (
          <button
            onClick={onFeatureMaker}
            title={lang === 'ja' ? '特徴メーカーで特徴を追加' : 'Add feature with Feature Maker'}
            className={`bg-transparent border border-dim rounded-[0.3125rem] text-muted cursor-pointer flex-shrink-0 ${focusMode ? 'px-[0.5625rem] py-1 text-[0.8125rem]' : 'px-1.5 py-0.5 text-[0.625rem]'}`}
          >🎯</button>
        )}

        {/* Material maker shortcut */}
        {onMaterialMaker && !isLocked && (
          <button
            onClick={onMaterialMaker}
            title={lang === 'ja' ? 'マテリアルメーカーで素材感を付与' : 'Apply material textures'}
            className={`bg-transparent border border-dim rounded-[0.3125rem] text-muted cursor-pointer flex-shrink-0 ${focusMode ? 'px-[0.5625rem] py-1 text-[0.8125rem]' : 'px-1.5 py-0.5 text-[0.625rem]'}`}
          >🧵</button>
        )}

        {/* Focus mode */}
        {onFocus && (
          <button
            onClick={onFocus}
            title={focused ? (lang === 'ja' ? '集中モード解除' : 'Exit focus') : (lang === 'ja' ? '集中編集' : 'Focus')}
            style={{
              background: focused ? blockColor + '22' : 'none',
              border: `1px solid ${focused ? blockColor : 'rgb(var(--dim))'}`,
              color: focused ? blockColor : 'rgb(var(--muted))',
            }}
            className={`rounded-[0.3125rem] cursor-pointer flex-shrink-0 ${focusMode ? 'px-[0.5625rem] py-1 text-[0.8125rem]' : 'px-1.5 py-0.5 text-[0.625rem]'}`}
          >{focused ? '⊗' : '⊕'}</button>
        )}


        {/* Remove custom block */}
        {block.isCustomBlock && onRemove && (
          <button
            onClick={() => { if (!window.confirm(lang === 'ja' ? 'このカスタムブロックを削除しますか？' : 'Remove this custom block?')) return; onRemove(); }}
            title={lang === 'ja' ? 'ブロックを削除' : 'Remove block'}
            className="bg-transparent border border-dim rounded text-[0.625rem] px-[0.3125rem] py-0.5 cursor-pointer text-muted"
          >🗑</button>
        )}

        {/* Clear */}
        <button
          onClick={() => {
            if (countTags(block.text) >= 1 && !window.confirm(lang === 'ja' ? 'ブロックのタグを一括消去しますか？' : 'Clear all tags in this block?')) return;
            onUpdate({ text: '', collapsed: false, lastRandomPicks: [] });
          }}
          disabled={isLocked}
          title={lang === 'ja' ? 'テキストをクリア' : 'Clear text'}
          className={`bg-transparent border border-dim rounded-[0.3125rem] cursor-pointer disabled:cursor-default disabled:opacity-30 ${focusMode ? 'text-[0.8125rem] px-2.5 py-1' : 'text-[0.625rem] px-1.5 py-0.5'} ${isLocked ? 'text-dim' : 'text-muted'}`}
        >✕</button>

        {/* Collapse block */}
        <button
          onClick={() => onUpdate({ collapsed: !block.collapsed })}
          title={lang === 'ja' ? (block.collapsed ? '展開' : '折りたたむ') : (block.collapsed ? 'Expand' : 'Collapse')}
          className={`bg-transparent border border-dim rounded-[0.3125rem] cursor-pointer text-muted ${focusMode ? 'text-[0.8125rem] px-2.5 py-1' : 'text-[0.625rem] px-1.5 py-0.5'}`}
        >{block.collapsed ? '▼' : '▲'}</button>
        </div>{/* END RIGHT group */}
      </div>

      {/* ── Preset save row ────────────────────────────────── */}
      {saving && (
        <div className="flex gap-1.5 items-center px-3 py-[0.4375rem] bg-bg border-b border-line">
          <span style={{ color: blockColor }} className="text-[0.6875rem] flex-shrink-0">
            {lang === 'ja' ? 'プリセット名:' : 'Name:'}
          </span>
          <input
            value={pName}
            onChange={e => setPName(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') doSave(); if (e.key === 'Escape') { setSaving(false); setPName(''); } }}
            placeholder={lang === 'ja' ? '例: 夏服' : 'e.g. summer outfit'}
            style={{ border: `1px solid ${blockColor}60` }}
            className="flex-1 rounded-[0.3125rem] text-xs px-[0.5625rem] py-1 outline-none font-mono bg-bg text-fg"
          />
          <button
            onClick={doSave}
            style={{ background: blockColor }}
            className="border-none rounded-[0.3125rem] text-black px-3 py-1 text-[0.6875rem] cursor-pointer font-bold"
          >{lang === 'ja' ? '保存' : 'Save'}</button>
          <button
            onClick={() => { setSaving(false); setPName(''); }}
            className="bg-transparent rounded-[0.3125rem] px-2 py-1 text-[0.6875rem] cursor-pointer border border-dim text-muted"
          >×</button>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────── */}
      {!block.collapsed && (
        <div className="p-[12px_14px]">

          {/* Negative suggestions — negative block only */}
          {block.id === 'negative' && (
            <div className="mb-2.5">
              <div className="text-muted text-[0.625rem] font-mono font-semibold tracking-[0.08em] mb-[0.3125rem] uppercase">
                {lang === 'ja' ? '🚫 クイック追加' : '🚫 Quick Add'}
              </div>
              <div className="flex gap-1 flex-wrap">
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
                    className="rounded-md px-[0.4375rem] py-[0.1875rem] text-[0.6875rem] cursor-pointer disabled:cursor-default border border-dim text-muted font-mono transition-all duration-[120ms]"
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
              <div className="mb-2.5">
                <div className="text-muted text-[0.625rem] font-mono font-semibold tracking-[0.08em] mb-[0.3125rem] uppercase">
                  {lang === 'ja' ? '😊 表情プリセット' : '😊 Expression'}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {EXPRESSION_PRESETS.map(preset => {
                    const active = activePreset?.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => applyExpr(preset)}
                        disabled={isLocked}
                        title={preset.tags.join(', ')}
                        style={active ? { background: blockColor + '22', border: `1px solid ${blockColor}`, color: blockColor } : undefined}
                        className={`rounded-md px-[0.4375rem] py-[0.1875rem] text-[0.6875rem] cursor-pointer disabled:cursor-default transition-all duration-[120ms] font-mono ${active ? 'font-bold' : 'border border-dim text-muted font-normal'}`}
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
                      className="rounded-md px-[0.4375rem] py-[0.1875rem] text-[0.625rem] cursor-pointer disabled:cursor-default border border-dim text-dim font-mono"
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
            className={`w-full ${focusMode ? 'min-h-[5rem] max-h-[10rem] text-sm' : 'min-h-[3.375rem] max-h-[7.5rem] text-xs'} rounded-[0.4375rem] px-[0.6875rem] py-[0.5625rem] font-mono resize-y box-border outline-none leading-[1.65] bg-bg ${block.text ? '' : 'text-muted'} ${isLocked ? 'border border-dim opacity-50' : 'border border-linebright'}`}
            onFocus={e => { if (!isLocked) e.target.style.borderColor = blockColor + '80'; }}
            onBlur={e => { e.target.style.borderColor = ''; }}
          />

          {/* ── Unified active-tag panel ──────────────────────── */}
          {(() => {
            if (!block.text) return null;
            const activeTags = splitTags(block.text);
            if (activeTags.length === 0) return null;
            const randomPickSet = new Set(
              (block.lastRandomPicks || [])
                .filter(t => hasTag(block.text, t.en))
                .flatMap(t => {
                  const keys = [t.en.toLowerCase()];
                  if (Array.isArray(t.extraEn)) keys.push(...t.extraEn.map(e => e.toLowerCase()));
                  else if (t.extraEn) keys.push(t.extraEn.toLowerCase());
                  return keys;
                })
            );
            const randomTags = activeTags.filter(raw => randomPickSet.has(bareTag(raw).toLowerCase()));
            const manualTags  = activeTags.filter(raw => !randomPickSet.has(bareTag(raw).toLowerCase()));
            if (randomTags.length === 0 && manualTags.length === 0) return null;

            const renderChip = (raw, idx) => {
              const bare         = bareTag(raw);
              const bareLower    = bare.toLowerCase();
              const isJumpable   = enToJa.has(bareLower);
              const colorInfo    = !isJumpable ? resolveColorLabel(bare)    : null;
              const featureInfo  = !isJumpable ? resolveFeatureLabel(bare)  : null;
              const materialInfo = !isJumpable ? resolveMaterialLabel(bare) : null;
              const makerIcon    = colorInfo ? '🎨' : featureInfo ? '🎯' : materialInfo ? '🧵' : null;
              const label        = lang === 'ja'
                ? (enToJa.get(bareLower) ?? colorInfo?.ja ?? featureInfo?.ja ?? materialInfo?.ja ?? bare)
                : bare;
              return (
                <span
                  key={idx}
                  onClick={isJumpable ? () => handleChipJump(bare) : undefined}
                  title={isJumpable ? (lang === 'ja' ? 'クリックでジャンプ' : 'Click to jump') : (makerIcon ? (lang === 'ja' ? 'メーカーで追加' : 'Added via maker') : undefined)}
                  style={{ background: blockColor + '15', border: `1px solid ${blockColor}50`, color: blockColor }}
                  className={`inline-flex items-center gap-[0.1875rem] rounded font-mono ${focusMode ? 'px-2 py-[0.1875rem] text-xs' : 'px-1.5 py-0.5 text-[0.6875rem]'}${isJumpable ? ' cursor-pointer underline underline-offset-2 decoration-1' : ''}`}
                >
                  {makerIcon && <span className="opacity-70 text-[0.5625rem] leading-none">{makerIcon}</span>}
                  {label}
                </span>
              );
            };

            return (
              <div className="mt-1.5 mb-1 flex flex-col gap-[0.3125rem]">
                {randomTags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1">
                    <span className={`text-muted font-mono font-semibold flex-shrink-0 ${focusMode ? 'text-[0.6875rem]' : 'text-[0.625rem]'}`}>
                      🎲 {lang === 'ja' ? '追加:' : 'added:'}
                    </span>
                    {randomTags.map(renderChip)}
                    <button
                      onClick={() => onUpdate({ lastRandomPicks: [] })}
                      title={lang === 'ja' ? 'ランダムマーカーを消去' : 'Clear random marker'}
                      className="text-dim text-[0.625rem] cursor-pointer ml-1 flex-shrink-0 p-0.5 leading-none"
                    >×</button>
                  </div>
                )}
                {manualTags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1">
                    <span className={`text-muted font-mono font-semibold flex-shrink-0 ${focusMode ? 'text-[0.6875rem]' : 'text-[0.625rem]'}`}>
                      👤 {lang === 'ja' ? '追加:' : 'added:'}
                    </span>
                    {manualTags.map(renderChip)}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Strength + controls row */}
          <div className="my-[0.5625rem] mb-[0.6875rem]">
            <div className={isMobile ? 'relative' : undefined}>
            <div className={`flex items-center ${isMobile ? 'flex-nowrap overflow-x-auto gap-[0.1875rem]' : `flex-wrap ${isCompact ? 'gap-[0.1875rem]' : 'gap-[0.3125rem]'}`}`}>
              <span className={`${focusMode ? 'text-[0.8125rem]' : 'text-[0.625rem]'} font-mono font-semibold text-muted`}>{lang === 'ja' ? '強度:' : 'Str:'}</span>

              {(isMobile ? STRENGTHS.filter(s => s.v === '1.0' || s.v === '1.2') : STRENGTHS).map(s => (
                <button key={s.v}
                  disabled={isLocked}
                  onClick={() => onUpdate({ strength: s.v })}
                  title={s.v}
                  style={block.strength === s.v ? { background: blockColor + '22', border: `1px solid ${blockColor}`, color: blockColor } : undefined}
                  className={`rounded-[0.3125rem] cursor-pointer disabled:cursor-default font-mono whitespace-nowrap transition-all duration-[120ms] ${focusMode ? 'py-[0.3125rem] text-[0.8125rem]' : 'py-0.5 text-[0.625rem]'} ${isCompact ? 'px-1' : (focusMode ? 'px-2.5' : 'px-1.5')} ${block.strength === s.v ? 'font-bold' : 'font-normal border border-dim text-muted'}`}
                >
                  {lang === 'ja' ? s.l : s.le}
                  {!isCompact && <span className="ml-[0.1875rem] text-[0.5625rem]">{s.v}</span>}
                </button>
              ))}

              {/* ±0.05 fine adjust */}
              <div className="flex items-center gap-0 ml-[0.1875rem]">
                <button disabled={isLocked} onClick={() => adjustWeight(-0.05)} title="-0.05"
                  className={`bg-transparent border border-dim text-muted rounded-[5px_0_0_5px] cursor-pointer disabled:cursor-default font-mono ${focusMode ? 'px-[0.5625rem] py-[0.3125rem] text-sm' : 'px-1.5 py-0.5 text-[0.6875rem]'}`}>−</button>
                <span
                  style={block.strength !== '1.0' ? { color: blockColor } : undefined}
                  className={`font-mono text-center px-0 bg-bg border-t border-b border-dim${block.strength !== '1.0' ? '' : ' text-muted'} ${focusMode ? 'text-[0.8125rem] min-w-10 py-[0.3125rem]' : 'text-[0.625rem] min-w-[1.875rem] py-0.5'}`}
                >{block.strength}</span>
                <button disabled={isLocked} onClick={() => adjustWeight(0.05)} title="+0.05"
                  className={`bg-transparent border border-dim text-muted rounded-[0_5px_5px_0] cursor-pointer disabled:cursor-default font-mono ${focusMode ? 'px-[0.5625rem] py-[0.3125rem] text-sm' : 'px-1.5 py-0.5 text-[0.6875rem]'}`}>＋</button>
              </div>

              {/* Select/group mode */}
              <button
                disabled={isLocked}
                onClick={() => { setSelectMode(m => !m); setSelectedTags([]); }}
                title={lang === 'ja' ? '複数選択して括弧でまとめる' : 'Select multiple to group'}
                style={{
                  background: selectMode ? blockColor + '22' : 'transparent',
                  border: `1px solid ${selectMode ? blockColor : 'rgb(var(--dim))'}`,
                  color: selectMode ? blockColor : 'rgb(var(--muted))',
                }}
                className={`rounded-[0.3125rem] cursor-pointer disabled:cursor-default font-mono ${focusMode ? 'px-2.5 py-[0.3125rem] text-[0.8125rem]' : 'px-2 py-0.5 text-[0.625rem]'}`}
              >{selectMode ? (lang === 'ja' ? '選択中' : 'Selecting') : (lang === 'ja' ? '⊞まとめ' : '⊞Group')}</button>

              {/* Random inspiration */}
              {!isLocked && block.id !== 'negative' && (
                <button
                  onClick={() => {
                    // Remove previously added random picks before re-rolling
                    let baseText = block.text;
                    for (const t of (block.lastRandomPicks || [])) baseText = removeTag(baseText, t.en);

                    // Collect exclusions from all other enabled blocks first (cross-block awareness)
                    const excluded = new Set();
                    for (const other of (allBlocks || [])) {
                      if (other.id === block.id || other.enabled === false) continue;
                      splitTags(other.text || '').forEach(seg => {
                        const en = bareTag(seg).toLowerCase();
                        const excl = RANDOM_EXCLUSION_RULES.get(en);
                        if (excl) excl.forEach(e => excluded.add(e.toLowerCase()));
                        const cfMap = CONFLICT_MAP.get(en);
                        if (cfMap) cfMap.forEach(e => excluded.add(e));
                      });
                    }
                    // Then add exclusions from this block's own baseText
                    baseText.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).forEach(en => {
                      const excl = RANDOM_EXCLUSION_RULES.get(en);
                      if (excl) excl.forEach(e => excluded.add(e.toLowerCase()));
                      const cfMap = CONFLICT_MAP.get(en);
                      if (cfMap) cfMap.forEach(e => excluded.add(e));
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
                        return !hasTag(baseText, t.en)
                          && !t.excludeFromRandom
                          && !RANDOM_EXCLUDE_TAGS.has(t.en)
                          && !TIER3_TAGS.has(en)
                          && !excluded.has(en);
                      });
                      if (unused.length === 0) return;
                      const normalT = unused.filter(t => !t.rareInRandom);
                      const rareT   = unused.filter(t =>  t.rareInRandom);
                      let pick;
                      if (normalT.length === 0) {
                        pick = rareT[Math.floor(Math.random() * rareT.length)];
                      } else if (rareT.length > 0 && Math.random() < 0.20) {
                        pick = rareT[Math.floor(Math.random() * rareT.length)];
                      } else {
                        pick = normalT[Math.floor(Math.random() * normalT.length)];
                      }
                      if (!pick) return;
                      if (WEAPON_TAGS.has(pick.en.toLowerCase()) && Math.random() > WEAPON_PICK_PROB) return;
                      picks.push(pick);
                      if (WEAPON_TAGS.has(pick.en.toLowerCase())) {
                        HAND_POSE_TAGS.forEach(t => excluded.add(t.toLowerCase()));
                      }
                      const newExcl = RANDOM_EXCLUSION_RULES.get(pick.en.toLowerCase());
                      if (newExcl) newExcl.forEach(e => excluded.add(e.toLowerCase()));
                      const cfMap = CONFLICT_MAP.get(pick.en.toLowerCase());
                      if (cfMap) cfMap.forEach(e => excluded.add(e));
                      (rules.skipIfPicked?.[cat.n] || []).forEach(n => skippedCats.add(n));
                    };

                    for (const cat of coreCats) tryPick(cat);
                    const shuffledOpt = [...optCats].sort(() => Math.random() - 0.5);
                    for (const cat of shuffledOpt) {
                      if (picks.length >= maxPicks || skippedCats.has(cat.n)) continue;
                      const prob = RARE_OPT_CAT_NAMES.has(cat.n) ? 0.15 : 0.40;
                      if (Math.random() < prob) tryPick(cat);
                    }

                    if (picks.length === 0) return;
                    let text = baseText;
                    for (const t of picks) text = appendTag(text, t.en, block.strength);
                    onUpdate({ text, collapsed: false, lastRandomPicks: picks });
                  }}
                  title={lang === 'ja' ? (displayPicks.length > 0 ? '再抽選' : 'ランダムでタグ追加') : (displayPicks.length > 0 ? 'Re-roll' : 'Add random tags')}
                  style={displayPicks.length > 0 ? { borderColor: blockColor, color: blockColor } : undefined}
                  className={`border border-dim text-muted rounded-[0.3125rem] cursor-pointer font-mono ${focusMode ? 'px-[0.5625rem] py-[0.3125rem] text-sm' : 'px-1.5 py-0.5 text-[0.75rem]'}`}
                >🎲{displayPicks.length > 0 ? ' ↻' : ''}</button>
              )}
            </div>
            {isMobile && <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-full w-5" style={{ background: 'linear-gradient(to left, rgb(var(--surface)), transparent)' }} />}
            </div>

            {/* Search — always on its own row for clean layout */}
            <div className="flex items-center gap-1 rounded-md px-2 py-[0.1875rem] mt-1.5 bg-bg border border-line/50">
              <span className="text-[0.625rem] text-muted">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'ja' ? 'タグ検索...' : 'Search tags...'}
                className={`bg-transparent border-none outline-none flex-1 font-mono text-fg ${focusMode ? 'text-sm' : 'text-[0.6875rem]'}`}
              />
              {search && (
                <span onClick={() => setSearch('')} className="cursor-pointer text-[0.625rem] text-muted">×</span>
              )}
            </div>
          </div>


          {/* Select mode bar */}
          {selectMode && (
            <div
              style={{ background: blockColor + '12', border: `1px dashed ${blockColor}60` }}
              className="flex items-center gap-2 flex-wrap mb-2.5 px-2.5 py-2 rounded-[0.4375rem]"
            >
              <span style={{ color: blockColor }} className="text-[0.625rem] font-mono">
                {lang === 'ja' ? `⊞ ${selectedTags.length}個選択中` : `⊞ ${selectedTags.length} selected`}
              </span>
              {selectedTags.length >= 2 && (
                <code className="text-[0.625rem] font-mono px-1.5 py-0.5 rounded text-accent bg-bg">
                  {block.strength === '1.0' ? `(${selectedTags.join(', ')})` : `(${selectedTags.join(', ')}:${block.strength})`}
                </code>
              )}
              <div className="flex-1" />
              <button
                disabled={selectedTags.length < 2}
                onClick={applyGroup}
                style={selectedTags.length >= 2 ? { background: blockColor } : undefined}
                className={`border-none rounded-[0.3125rem] px-3 py-1 text-[0.625rem] cursor-pointer disabled:cursor-default font-bold ${selectedTags.length >= 2 ? 'text-black' : 'bg-dim text-muted'}`}
              >{lang === 'ja' ? '括弧でまとめて追加' : 'Group & add'}</button>
              <button
                onClick={() => { setSelectMode(false); setSelectedTags([]); }}
                className="bg-transparent rounded-[0.3125rem] px-2 py-1 text-[0.625rem] cursor-pointer border border-dim text-muted"
              >{lang === 'ja' ? 'やめる' : 'Cancel'}</button>
            </div>
          )}

          {/* ⭐ Favorites — always on top, not collapsible (案C) */}
          {block.favTags?.length > 0 && !search && (
            <div className="mb-2.5 px-2.5 py-2 rounded-[0.4375rem] bg-tint-warn border border-warn/20">
              <div className="text-[0.625rem] font-mono mb-[0.3125rem] text-warn-text">
                ⭐ {lang === 'ja' ? 'お気に入り' : 'Favorites'}
              </div>
              <div className="flex flex-wrap gap-1">
                {block.favTags.map(en => {
                  const tag = allTags.find(t => t.en === en);
                  if (!tag) return null;
                  return (
                    <TagBtn key={en} tag={tag} color={blockColor} lang={lang} isFav disabled={isLocked}
                      active={hasTag(block.text, en)} selectMode={selectMode} selected={selectedTags.includes(en)}
                      conflict={conflictTags?.has(en.toLowerCase()) && hasTag(block.text, en) ? conflictTags.get(en.toLowerCase()) : false}
                      desc={TAG_DICT[en]} large={focusMode}
                      onInsert={() => onTagClick(en)} onToggleFav={() => toggleFav(en)} />
                  );
                })}
              </div>
            </div>
          )}

          {/* Search results */}
          {search && (
            <div className="mb-2.5">
              <div className="text-[0.625rem] font-mono mb-[0.3125rem] text-accent">
                🔍 {lang === 'ja' ? `${searchResults.length}件` : `${searchResults.length} results`}
              </div>
              {searchResults.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {searchResults.map(tag => (
                    <TagBtn key={tag.en} tag={tag} color={blockColor} lang={lang}
                      isFav={block.favTags?.includes(tag.en)} disabled={isLocked}
                      active={hasTag(block.text, tag.en)}
                      analyzed={!!analyzeText && hasTag(analyzeText, tag.en) && !hasTag(block.text, tag.en)}
                      selectMode={selectMode} selected={selectedTags.includes(tag.en)}
                      conflict={conflictTags?.has(tag.en.toLowerCase()) && hasTag(block.text, tag.en) ? conflictTags.get(tag.en.toLowerCase()) : false}
                      desc={TAG_DICT[tag.en]} large={focusMode}
                      onInsert={() => onTagClick(tag.en)} onToggleFav={() => toggleFav(tag.en)} />
                  ))}
                </div>
              ) : (
                <div className="text-[0.6875rem] font-mono p-1 text-muted">
                  {lang === 'ja' ? '見つかりません' : 'Not found'}
                </div>
              )}
            </div>
          )}

          {/* Category accordion */}
          {!search && block.cats.map(cat => {
            const isOpen = isCatOpen(cat);
            const isUserSec = !!cat.isUserSection;
            const tagCount = [...new Map(cat.t.map(t => [t.en, t])).values()].length;
            return (
              <div key={cat.id || cat.n}>
                {/* Section header */}
                {isUserSec && editingSectionId === cat.id ? (
                  <div className="flex gap-1.5 items-center py-1">
                    <input
                      value={editingSectionName}
                      onChange={e => setEditingSectionName(e.target.value)}
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter' && editingSectionName.trim()) {
                          const n = editingSectionName.trim();
                          onUpdate({ cats: block.cats.map(c => c.id === cat.id ? { ...c, n, nEn: n } : c) });
                          setEditingSectionId(null);
                        }
                        if (e.key === 'Escape') setEditingSectionId(null);
                      }}
                      style={{ border: `1px solid ${blockColor}60` }}
                      className="flex-1 rounded-[0.3125rem] text-[0.6875rem] px-2 py-0.5 outline-none font-mono bg-bg text-fg"
                    />
                    <button
                      onClick={() => {
                        if (!editingSectionName.trim()) return;
                        const n = editingSectionName.trim();
                        onUpdate({ cats: block.cats.map(c => c.id === cat.id ? { ...c, n, nEn: n } : c) });
                        setEditingSectionId(null);
                      }}
                      style={{ background: blockColor }}
                      className="border-none rounded-[0.3125rem] text-black px-2 py-0.5 text-[0.6875rem] cursor-pointer font-bold"
                    >{lang === 'ja' ? '保存' : 'Save'}</button>
                    <button onClick={() => setEditingSectionId(null)}
                      className="bg-transparent border border-dim rounded-[0.3125rem] text-muted px-1.5 py-0.5 text-[0.6875rem] cursor-pointer">×</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 py-1">
                    <button
                      onClick={() => toggleCat(cat)}
                      className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-left select-none min-w-0 flex-1"
                    >
                      <span style={isOpen ? { color: blockColor } : undefined} className={`text-[0.625rem] flex-shrink-0 font-bold${isOpen ? '' : ' text-muted'}`}>
                        {isOpen ? '▼' : '▶'}
                      </span>
                      <span className={`${focusMode ? 'text-[0.8125rem]' : 'text-[0.6875rem]'} font-mono font-medium ${isOpen ? 'text-fg' : 'text-muted'} truncate`}>
                        {lang === 'ja' ? cat.n : cat.nEn}
                      </span>
                      <span className="text-[0.625rem] font-mono text-muted flex-shrink-0">({tagCount})</span>
                    </button>
                    {!isUserSec && <div className="flex-1 h-px bg-line" />}
                    {isUserSec && (
                      <>
                        <div className="flex-1 h-px bg-line" />
                        <button
                          onClick={() => { setEditingSectionId(cat.id); setEditingSectionName(cat.n); }}
                          title={lang === 'ja' ? 'セクション名を変更' : 'Rename section'}
                          className="bg-transparent border-none text-dim hover:text-fg cursor-pointer text-[0.625rem] px-1 flex-shrink-0"
                        >✎</button>
                        <button
                          onClick={() => {
                            if (!window.confirm(lang === 'ja' ? `セクション「${cat.n}」を削除しますか？\n（タグはOFFになります）` : `Delete section "${cat.n}"?\n(Active tags will be deselected)`)) return;
                            let newText = block.text;
                            for (const tag of cat.t) newText = removeTag(newText, tag.en);
                            onUpdate({ cats: block.cats.filter(c => c.id !== cat.id), text: newText });
                          }}
                          onMouseOver={e => e.currentTarget.style.color = '#f87171'}
                          onMouseOut={e => e.currentTarget.style.color = ''}
                          title={lang === 'ja' ? 'セクションを削除' : 'Delete section'}
                          className="bg-transparent border-none text-dim cursor-pointer text-[0.625rem] px-1 flex-shrink-0"
                        >✕</button>
                      </>
                    )}
                  </div>
                )}

                {/* Section body */}
                {isOpen && (
                  <div className={`flex flex-wrap gap-1 pt-[0.1875rem] ${isUserSec ? 'pb-1' : 'pb-2'}`}>
                    {(sceneActive && cat.n === '性別・人数'
                      ? cat.t.filter(tag => !SCENE_MANAGED_TAGS.has(tag.en))
                      : cat.t
                    ).filter((tag, i, arr) => arr.findIndex(t => t.en === tag.en) === i)
                    .map(tag => (
                      isUserSec ? (
                        <div
                          key={tag.en}
                          style={{
                            background: hasTag(block.text, tag.en) ? blockColor + '22' : 'rgb(var(--surface-alt))',
                            border: `1px solid ${hasTag(block.text, tag.en) ? blockColor + '90' : blockColor + '40'}`,
                          }}
                          className="inline-flex items-center rounded-[0.3125rem] overflow-hidden"
                        >
                          <button
                            disabled={isLocked}
                            onClick={() => onUpdate({ text: toggleTag(block.text, tag.en, block.strength) })}
                            title={tag.ja !== tag.en ? tag.en : undefined}
                            style={{ color: blockColor }}
                            className={`bg-transparent border-none px-2 py-[0.1875rem] text-[0.6875rem] cursor-pointer disabled:cursor-default font-mono ${hasTag(block.text, tag.en) ? 'font-bold' : 'font-normal'}`}
                          >{hasTag(block.text, tag.en) ? '✓ ' : ''}{tag.ja}</button>
                          <button
                            onClick={() => {
                              let newText = hasTag(block.text, tag.en) ? removeTag(block.text, tag.en) : block.text;
                              onUpdate({ cats: block.cats.map(c => c.id === cat.id ? { ...c, t: c.t.filter(t => t.en !== tag.en) } : c), text: newText });
                            }}
                            onMouseOver={e => e.currentTarget.style.color = '#f87171'}
                            onMouseOut={e => e.currentTarget.style.color = ''}
                            className="bg-transparent border-l border-dim text-dim px-1.5 py-1 cursor-pointer text-xs flex items-center"
                          >✕</button>
                        </div>
                      ) : (
                        <TagBtn key={tag.en} tag={tag} color={blockColor} lang={lang}
                          isFav={block.favTags?.includes(tag.en)} disabled={isLocked}
                          active={hasTag(block.text, tag.en)}
                          analyzed={!!analyzeText && hasTag(analyzeText, tag.en) && !hasTag(block.text, tag.en)}
                          selectMode={selectMode} selected={selectedTags.includes(tag.en)}
                          conflict={conflictTags?.has(tag.en.toLowerCase()) && hasTag(block.text, tag.en) ? conflictTags.get(tag.en.toLowerCase()) : false}
                          desc={TAG_DICT[tag.en]} large={focusMode}
                          wrapperRef={el => { if (el) tagRefs.current[tag.en.toLowerCase()] = el; else delete tagRefs.current[tag.en.toLowerCase()]; }}
                          onInsert={() => onTagClick(tag.en)} onToggleFav={() => toggleFav(tag.en)} />
                      )
                    ))}
                    {sceneActive && cat.n === '性別・人数' && (
                      <span className="text-[0.625rem] font-mono text-muted self-center px-1">
                        {lang === 'ja' ? '複数人数はキャラ共演で設定' : 'Multi-person: use Collab'}
                      </span>
                    )}

                    {/* Add tag to user section */}
                    {isUserSec && (
                      <div className="w-full mt-1">
                        {addingTagInSection === cat.id ? (
                          <div className="flex flex-col gap-1">
                            <input
                              value={secTagLabel}
                              onChange={e => setSecTagLabel(e.target.value)}
                              autoFocus
                              onKeyDown={e => { if (e.key === 'Escape') { setAddingTagInSection(null); setSecTagText(''); setSecTagLabel(''); } }}
                              placeholder={lang === 'ja' ? '表示名（日本語可・省略可）' : 'Display name (optional)'}
                              style={{ border: `1px solid ${blockColor}40` }}
                              className="rounded-[0.3125rem] text-[0.6875rem] px-2 py-1 outline-none font-mono bg-bg text-fg"
                            />
                            <div className="flex gap-1.5 items-center">
                              <input
                                value={secTagText}
                                onChange={e => setSecTagText(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && secTagText.trim()) {
                                    const tag = { en: secTagText.trim(), ja: secTagLabel.trim() || secTagText.trim() };
                                    onUpdate({ cats: block.cats.map(c => c.id === cat.id ? { ...c, t: [...c.t, tag] } : c) });
                                    setSecTagText(''); setSecTagLabel(''); setAddingTagInSection(null);
                                  }
                                  if (e.key === 'Escape') { setAddingTagInSection(null); setSecTagText(''); setSecTagLabel(''); }
                                }}
                                placeholder={lang === 'ja' ? 'プロンプト（英語推奨）...' : 'Prompt tag (English)...'}
                                style={{ border: `1px solid ${blockColor}60` }}
                                className="flex-1 rounded-[0.3125rem] text-[0.6875rem] px-2 py-1 outline-none font-mono bg-bg text-fg"
                              />
                              <button
                                onClick={() => {
                                  if (!secTagText.trim()) return;
                                  const tag = { en: secTagText.trim(), ja: secTagLabel.trim() || secTagText.trim() };
                                  onUpdate({ cats: block.cats.map(c => c.id === cat.id ? { ...c, t: [...c.t, tag] } : c) });
                                  setSecTagText(''); setSecTagLabel(''); setAddingTagInSection(null);
                                }}
                                style={{ background: blockColor }}
                                className="border-none rounded-[0.3125rem] text-black px-2.5 py-1 text-[0.6875rem] cursor-pointer font-bold"
                              >{lang === 'ja' ? '追加' : 'Add'}</button>
                              <button
                                onClick={() => { setAddingTagInSection(null); setSecTagText(''); setSecTagLabel(''); }}
                                className="bg-transparent border border-dim rounded-[0.3125rem] text-muted px-1.5 py-1 text-[0.6875rem] cursor-pointer"
                              >×</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingTagInSection(cat.id)}
                            disabled={isLocked}
                            style={{ borderColor: blockColor + '50', color: blockColor }}
                            className="bg-transparent border border-dashed rounded-[0.3125rem] px-2 py-[0.1875rem] text-[0.625rem] font-mono cursor-pointer disabled:cursor-default disabled:opacity-40"
                          >+ {lang === 'ja' ? 'タグ追加' : 'Add tag'}</button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom tags */}
          {!search && (block.customTags || []).length > 0 && (
            <div className="mb-2 p-2 rounded-[0.4375rem] bg-bg" style={{ border: `1px solid ${blockColor}30` }}>
              <div className="flex items-center justify-between mb-[0.3125rem]">
                <span style={{ color: blockColor }} className="text-[0.625rem] font-mono">
                  ✏️ {lang === 'ja' ? 'カスタム' : 'Custom'}
                </span>
                <button
                  onClick={() => {
                    if (!window.confirm(lang === 'ja' ? 'カスタムタグをすべて削除しますか？' : 'Delete all custom tags?')) return;
                    onUpdate({ customTags: [] });
                  }}
                  className="text-[0.5625rem] text-dim hover:text-red-400 bg-transparent border-none cursor-pointer px-1"
                >{lang === 'ja' ? '全て消す' : 'Clear all'}</button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(block.customTags || []).map(ct => (
                  <div key={ct.id} className="w-full">
                    {editingCustomId === ct.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          value={editLabel}
                          onChange={e => setEditLabel(e.target.value)}
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Escape') setEditingCustomId(null); }}
                          placeholder={lang === 'ja' ? '表示名（日本語可・省略可）' : 'Display name (optional)'}
                          style={{ border: `1px solid ${blockColor}40` }}
                          className="rounded-[0.3125rem] text-[0.6875rem] px-[0.5625rem] py-1 outline-none font-mono bg-surface text-fg"
                        />
                        <div className="flex gap-1.5 items-center">
                          <input
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && editText.trim()) {
                                const updated = { ...ct, text: editText.trim() };
                                if (editLabel.trim()) updated.label = editLabel.trim(); else delete updated.label;
                                const newText = ct.text !== updated.text && hasTag(block.text, ct.text)
                                  ? toggleTag(toggleTag(block.text, ct.text, block.strength), updated.text, block.strength)
                                  : block.text;
                                onUpdate({ customTags: (block.customTags || []).map(x => x.id === ct.id ? updated : x), text: newText });
                                setEditingCustomId(null);
                              }
                              if (e.key === 'Escape') setEditingCustomId(null);
                            }}
                            placeholder={lang === 'ja' ? 'プロンプト（英語推奨）...' : 'Prompt tag (English)...'}
                            style={{ border: `1px solid ${blockColor}60` }}
                            className="flex-1 rounded-[0.3125rem] text-[0.6875rem] px-[0.5625rem] py-1 outline-none font-mono bg-surface text-fg"
                          />
                          <button
                            onClick={() => {
                              if (!editText.trim()) return;
                              const updated = { ...ct, text: editText.trim() };
                              if (editLabel.trim()) updated.label = editLabel.trim(); else delete updated.label;
                              const newText = ct.text !== updated.text && hasTag(block.text, ct.text)
                                ? toggleTag(toggleTag(block.text, ct.text, block.strength), updated.text, block.strength)
                                : block.text;
                              onUpdate({ customTags: (block.customTags || []).map(x => x.id === ct.id ? updated : x), text: newText });
                              setEditingCustomId(null);
                            }}
                            style={{ background: blockColor }}
                            className="border-none rounded-[0.3125rem] text-black px-2.5 py-1 text-[0.6875rem] cursor-pointer font-bold"
                          >{lang === 'ja' ? '保存' : 'Save'}</button>
                          <button
                            onClick={() => setEditingCustomId(null)}
                            className="bg-transparent rounded-[0.3125rem] px-[0.4375rem] py-1 text-[0.6875rem] cursor-pointer border border-dim text-muted"
                          >×</button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: hasTag(block.text, ct.text) ? blockColor + '22' : 'rgb(var(--surface-alt))',
                          border: `1px solid ${hasTag(block.text, ct.text) ? blockColor + '90' : blockColor + '40'}`,
                        }}
                        className="inline-flex items-center rounded-[0.3125rem] overflow-hidden"
                      >
                        <button
                          disabled={isLocked}
                          onClick={() => onUpdate({ text: toggleTag(block.text, ct.text, block.strength) })}
                          title={ct.label ? ct.text : undefined}
                          style={{ color: blockColor }}
                          className={`bg-transparent border-none px-2 py-[0.1875rem] text-[0.6875rem] cursor-pointer disabled:cursor-default font-mono ${hasTag(block.text, ct.text) ? 'font-bold' : 'font-normal'}`}
                        >{hasTag(block.text, ct.text) ? '✓ ' : ''}{ct.label || ct.text}</button>
                        <button
                          onClick={() => { setEditingCustomId(ct.id); setEditText(ct.text); setEditLabel(ct.label || ''); }}
                          title={lang === 'ja' ? '編集' : 'Edit'}
                          className="bg-transparent border-l border-dim text-dim hover:text-fg px-1.5 py-1 cursor-pointer text-[0.625rem] flex items-center"
                        >✎</button>
                        <button
                          onClick={() => {
                            if (!window.confirm(lang === 'ja' ? `カスタムタグ「${ct.label || ct.text}」を削除しますか？` : `Delete custom tag "${ct.label || ct.text}"?`)) return;
                            onUpdate({ customTags: (block.customTags || []).filter(x => x.id !== ct.id) });
                          }}
                          onMouseOver={e => e.target.style.color = '#f87171'}
                          onMouseOut={e => e.target.style.color = ''}
                          className="bg-transparent border-l border-dim text-dim px-2 py-1 cursor-pointer text-xs min-w-[1.75rem] flex items-center justify-center"
                        >✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── カスタムエリア（全ブロック共通セパレーター） ─────── */}
          {!search && (
            <div className="mt-2 pt-1.5 border-t border-dim">
              {addingCustom ? (
                <div className="flex flex-col gap-1">
                  <input
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Escape') { setAddingCustom(false); setCustomInput(''); setCustomLabel(''); } }}
                    placeholder={lang === 'ja' ? '表示名（日本語可・省略可）' : 'Display name (optional)'}
                    style={{ border: `1px solid ${blockColor}40` }}
                    className="rounded-[0.3125rem] text-[0.6875rem] px-[0.5625rem] py-1 outline-none font-mono bg-bg text-fg"
                  />
                  <div className="flex gap-1.5 items-center">
                    <input
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddCustom(); if (e.key === 'Escape') { setAddingCustom(false); setCustomInput(''); setCustomLabel(''); } }}
                      placeholder={lang === 'ja' ? 'プロンプト（英語推奨）...' : 'Prompt tag (English)...'}
                      style={{ border: `1px solid ${blockColor}60` }}
                      className="flex-1 rounded-[0.3125rem] text-[0.6875rem] px-[0.5625rem] py-1 outline-none font-mono bg-bg text-fg"
                    />
                    <button onClick={handleAddCustom} style={{ background: blockColor }}
                      className="border-none rounded-[0.3125rem] text-black px-2.5 py-1 text-[0.6875rem] cursor-pointer font-bold">
                      {lang === 'ja' ? '追加' : 'Add'}
                    </button>
                    <button onClick={() => { setAddingCustom(false); setCustomInput(''); setCustomLabel(''); }}
                      className="bg-transparent rounded-[0.3125rem] px-[0.4375rem] py-1 text-[0.6875rem] cursor-pointer border border-dim text-muted">×</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setAddingCustom(true)}
                        disabled={isLocked}
                        onMouseOver={e => { if (!isLocked) e.target.style.borderColor = blockColor; }}
                        onMouseOut={e => e.target.style.borderColor = isLocked ? 'rgb(var(--dim))' : blockColor + '60'}
                        style={{
                          border: `1px dashed ${isLocked ? 'rgb(var(--dim))' : blockColor + '60'}`,
                          color: isLocked ? 'rgb(var(--muted))' : blockColor,
                        }}
                        className="bg-transparent rounded-[0.3125rem] px-2.5 py-[0.1875rem] text-[0.625rem] cursor-pointer disabled:cursor-default font-mono"
                      >+ {lang === 'ja' ? 'カスタムタグ追加' : 'Add custom tag'}</button>
                      {block.isCustomBlock && !isAddingSection && (
                        <button
                          onClick={() => setIsAddingSection(true)}
                          disabled={isLocked}
                          style={{ borderColor: blockColor + '50', color: blockColor }}
                          className="bg-transparent border border-dashed rounded-[0.3125rem] px-2.5 py-[0.1875rem] text-[0.625rem] cursor-pointer disabled:cursor-default disabled:opacity-40 font-mono"
                        >+ {lang === 'ja' ? 'セクション追加' : 'Add section'}</button>
                      )}
                    </div>
                    {block.isCustomBlock && isAddingSection && (
                      <div className="flex gap-1.5 items-center">
                        <input
                          value={addingSectionName}
                          onChange={e => setAddingSectionName(e.target.value)}
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter' && addingSectionName.trim()) {
                              const n = addingSectionName.trim();
                              onUpdate({ cats: [...(block.cats || []), { id: uid(), n, nEn: n, t: [], isUserSection: true }] });
                              setAddingSectionName(''); setIsAddingSection(false);
                            }
                            if (e.key === 'Escape') { setIsAddingSection(false); setAddingSectionName(''); }
                          }}
                          placeholder={lang === 'ja' ? 'セクション名...' : 'Section name...'}
                          style={{ border: `1px solid ${blockColor}60` }}
                          className="flex-1 rounded-[0.3125rem] text-[0.6875rem] px-2 py-1 outline-none font-mono bg-bg text-fg"
                        />
                        <button
                          onClick={() => {
                            if (!addingSectionName.trim()) return;
                            const n = addingSectionName.trim();
                            onUpdate({ cats: [...(block.cats || []), { id: uid(), n, nEn: n, t: [], isUserSection: true }] });
                            setAddingSectionName(''); setIsAddingSection(false);
                          }}
                          style={{ background: blockColor }}
                          className="border-none rounded-[0.3125rem] text-black px-2.5 py-1 text-[0.6875rem] cursor-pointer font-bold"
                        >{lang === 'ja' ? '追加' : 'Add'}</button>
                        <button
                          onClick={() => { setIsAddingSection(false); setAddingSectionName(''); }}
                          className="bg-transparent border border-dim rounded-[0.3125rem] text-muted px-1.5 py-1 text-[0.6875rem] cursor-pointer"
                        >×</button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* 転送ボタン */}
                    {otherChars?.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setTransferOpen(o => !o)}
                          title={lang === 'ja' ? '他のキャラへ転送' : 'Transfer to character'}
                          className="bg-transparent border border-dim rounded-[0.3125rem] px-[0.3125rem] py-[0.1875rem] text-dim text-[0.625rem] cursor-pointer"
                        >→</button>
                        {transferOpen && (
                          <div className="absolute right-0 bottom-full mb-1 z-50 bg-surface border border-linebright rounded-lg overflow-hidden shadow-lg min-w-[7.5rem] max-w-[10rem]">
                            {otherChars.map(c => (
                              <button key={c.id} onClick={() => { onTransfer?.(block.id, c.id); setTransferOpen(false); }}
                                className="w-full text-left px-2.5 py-1.5 text-[0.6875rem] text-fg cursor-pointer flex items-center gap-1"
                                onMouseOver={e => e.currentTarget.style.background = 'rgb(var(--surface-alt))'}
                                onMouseOut={e => e.currentTarget.style.background = ''}>
                                <span className="flex-shrink-0">{c.emoji}</span><span style={{ color: c.color }} className="truncate">{c.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {/* プリセット保存 */}
                    {block.isPresetBlock && !isLocked && (
                      <button
                        onClick={() => setSaving(s => !s)}
                        style={saving
                          ? { background: blockColor + '18', border: `1px solid ${blockColor}`, color: blockColor }
                          : { border: `1px solid rgb(var(--dim))`, color: 'rgb(var(--muted))' }}
                        className="bg-transparent rounded-[0.3125rem] px-[0.4375rem] py-[0.1875rem] text-[0.625rem] cursor-pointer font-mono"
                      >📌 {lang === 'ja' ? 'プリセット保存' : 'Save preset'}</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
