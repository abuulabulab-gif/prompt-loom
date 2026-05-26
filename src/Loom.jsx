import { useState, useEffect, useRef } from "react";

const DONATE_URL = 'https://buymeacoffee.com/prompt_loom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import CharVersions from "./components/CharVersions.jsx";
import { useOutputDrag } from "./hooks/useOutputDrag.js";
import { useVariations } from "./hooks/useVariations.js";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import db, { loadState, saveState, saveCharImages, loadCharImages, deleteCharImages } from "./storage.js";
import WelcomeHint from "./components/WelcomeHint.jsx";
import LibraryModal from "./components/modals/LibraryModal.jsx";
import {
  CHAR_COLORS, CHAR_EMOJIS, WARN_LEN, LIMIT_LEN,
  uid, appendTag, splitTags, countTags, toggleTag, hasTag, removeTag,
  deep, downloadJSON, stripWeights, toNaiWeights, SPECIES_PARTS_MAP,
} from "./data/constants.js";
import { detectConflicts } from "./data/conflicts.js";
import { TOOLS } from "./data/tools.js";
import { buildColorTag } from "./data/colors.js";
import { makeCharacter, makeCustomBlock, BLOCKS_DEF } from "./data/blocks.js";
import PresetChip from "./components/PresetChip.jsx";
import BlockCard from "./components/BlockCard.jsx";
import HistoryModal from "./components/modals/HistoryModal.jsx";
import ComparePanel from "./components/modals/ComparePanel.jsx";
import TemplateModal from "./components/modals/TemplateModal.jsx";
import ColorPickerModal from "./components/modals/ColorPickerModal.jsx";
import SceneComposeModal from "./components/modals/SceneComposeModal.jsx";
import SettingsModal from "./components/modals/SettingsModal.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import GlobalTagSearch from "./components/GlobalTagSearch.jsx";
import { toNaturalJa, toNaturalEn } from "./utils/naturalLanguage.js";
import { callAI, callNaturalToTags, callTagSuggest } from "./utils/aiApi.js";
import NaturalToTagsModal from "./components/modals/NaturalToTagsModal.jsx";
import CharacterNote from "./CharacterNote/index.jsx";
import { useAuth } from "./hooks/useAuth.js";
import AuthButton from "./components/AuthButton.jsx";
import { useCloudSync } from "./hooks/useCloudSync.js";
import { useRandomGen } from "./hooks/useRandomGen.js";

// Merge saved blocks with current BLOCKS_DEF so newly added/removed tags
// are always reflected in existing characters without wiping user data.
function mergeCharacterBlocks(savedBlocks) {
  const defById = Object.fromEntries(BLOCKS_DEF.map(def => [def.id, def]));
  const processedIds = new Set();

  const merged = (savedBlocks || []).map(saved => {
    if (saved.isCustomBlock) return saved;
    const def = defById[saved.id];
    if (!def) return null;
    processedIds.add(saved.id);
    return {
      ...deep(def),
      text:       saved.text       ?? def.text,
      enabled:    saved.enabled    !== false,
      strength:   saved.strength   ?? def.strength,
      locked:     saved.locked     ?? false,
      favTags:    saved.favTags    ?? [],
      customTags: saved.customTags ?? [],
      collapsed:  saved.collapsed  !== undefined ? saved.collapsed : def.collapsed,
      catStates:  saved.catStates  ?? {},
    };
  }).filter(Boolean);

  const newBlocks = BLOCKS_DEF
    .filter(def => !processedIds.has(def.id))
    .map(def => deep(def));

  return [...merged, ...newBlocks];
}

export default function Loom() {
  const [characters, setCharacters] = useState([makeCharacter('キャラ 1', CHAR_COLORS[0], CHAR_EMOJIS[0])]);
  const [activeCharId, setActiveCharId] = useState(() => characters[0]?.id);
  const [charPanelOpen, setCharPanelOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 600 : true
  );
  const [lang, setLang] = useState('ja');
  const [activeTool, setActiveTool] = useState('general');
  const [toolSuffixes, setToolSuffixes] = useState(Object.fromEntries(TOOLS.map(t => [t.id, t.suffix])));
  const [editingSuffix, setEditingSuffix] = useState(false);
  const [outputTab, setOutputTab] = useState('positive');
  const [outputEditMode, setOutputEditMode] = useState(false);
  const [outputEditText, setOutputEditText] = useState('');
  const [copied, setCopied] = useState(false);
  const [snapped, setSnapped] = useState(false);
  const [shared, setShared] = useState(false);
  const [outputExpanded, setOutputExpanded] = useState(true);
  const [outputHeight, setOutputHeight] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 600 ? 185 : 220
  );
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [compareCharId, setCompareCharId] = useState(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [theme, setTheme] = useState('light');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [sceneOpen, setSceneOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [viewMode, setViewMode] = useState('normal'); // 'simple' | 'normal' | 'expert'
  const simpleMode = viewMode === 'simple';
  const expertMode = viewMode === 'expert';
  const cycleViewMode = () => setViewMode(m => m === 'normal' ? 'simple' : m === 'simple' ? 'expert' : 'normal');
  const [mainTab, setMainTab] = useState(() => localStorage.getItem('loom_mainTab') || 'editor');
  useEffect(() => { localStorage.setItem('loom_mainTab', mainTab); }, [mainTab]);
  const [thumbs, setThumbs] = useState({});
  const [thumbPreview, setThumbPreview] = useState(null);
  const [thumbDragOver, setThumbDragOver] = useState(false);
  const [layout, setLayout] = useState('1col');
  const [focusBlockId, setFocusBlockId] = useState(null);
  const prevFocusId = useRef(null);

  useEffect(() => {
    if (focusBlockId) {
      prevFocusId.current = focusBlockId;
    } else if (prevFocusId.current) {
      const id = prevFocusId.current;
      prevFocusId.current = null;
      requestAnimationFrame(() => {
        document.getElementById(`block-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [focusBlockId]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // ── Auth & cloud sync ──
  const { user, signInWithGoogle, signOut } = useAuth();

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isWide = vw >= 900;
  const isMobile = vw < 600;
  const effLayout = isWide ? layout : '1col';
  const contentMax = isWide ? '58.33rem' : '31.67rem';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const saveTimer = useRef(null);
  const statusTimer = useRef(null);
  const fileRef = useRef(null);
  const presetFileRef = useRef(null);
  const [settingsTab, setSettingsTab] = useState('shortcuts');

  // ── Feature states ──
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [analyzeText, setAnalyzeText] = useState('');
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const [toolPickerOpen, setToolPickerOpen] = useState(false);
  const [naturalLang, setNaturalLang] = useState('ja');
  const [apiConfig, setApiConfig] = useState({ provider: 'openai', apiKey: '' });
  const [aiResult, setAiResult] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [naturalToTagsOpen, setNaturalToTagsOpen] = useState(false);
  const [naturalToTagsTab, setNaturalToTagsTab] = useState('text'); // 'text' | 'image'
  const [importToast, setImportToast] = useState(null); // null | { name: string }
  const [autoLogToast, setAutoLogToast] = useState(false);
  const [orderUpdatedAt, setOrderUpdatedAt] = useState(0);
  const [settingsUpdatedAt, setSettingsUpdatedAt] = useState(0);
  const [tagSuggestOpen, setTagSuggestOpen] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [tagSuggestBusy, setTagSuggestBusy] = useState(false);
  const [tagSuggestError, setTagSuggestError] = useState('');
  const [jumpOpen, setJumpOpen] = useState(false);
  // Template undo buffer: stores block text snapshot before template apply
  const [templateUndoBuf, setTemplateUndoBuf] = useState(null); // null | { blockTexts: {[id]: string}, timer: any }
  const templateUndoTimerRef = useRef(null);
  const sidebarLastTapRef = useRef({});

  const activeChar = characters.find(c => c.id === activeCharId) || characters[0];
  const blocks = activeChar?.blocks || [];

  const { syncStatus, syncErrToast, setSyncErrToast, dataSizeToast, handleSignIn, markRemoteApply } = useCloudSync({
    user, signInWithGoogle, loaded,
    characters, orderUpdatedAt, settingsUpdatedAt,
    setCharacters, setOrderUpdatedAt, setSettingsUpdatedAt,
    theme, lang, viewMode, activeTool, toolSuffixes, history,
    setTheme, setLang, setViewMode, setActiveTool, setToolSuffixes, setHistory,
  });
  const { randomMode, setRandomMode, generateRandomChar } = useRandomGen({ blocks, lang, activeCharId, setCharacters });

  // ── Storage: load on mount ──
  useEffect(() => {
    (async () => {
      try {
        const d = await loadState();
        if (d) {
          if (d.characters?.length) {
            // Merge saved characters with current BLOCKS_DEF so newly added tags always appear
            const migrated = d.characters.map(c => ({
              ...c,
              blocks: mergeCharacterBlocks(c.blocks),
            }));
            setCharacters(migrated); setActiveCharId(migrated[0].id);
            // load thumbnails
            const tmap = {};
            for (const c of d.characters) {
              const imgs = await loadCharImages(c.id);
              if (imgs.length > 0) tmap[c.id] = imgs;
            }
            setThumbs(tmap);
          }
          markRemoteApply();
          if (d.history) setHistory(d.history);
          if (d.lang) setLang(d.lang);
          if (d.activeTool) setActiveTool(d.activeTool);
          if (d.toolSuffixes) setToolSuffixes(d.toolSuffixes);
          if (d.theme) setTheme(d.theme);
          if (d.viewMode) setViewMode(d.viewMode);
          if (d.outputHeight) setOutputHeight(d.outputHeight);
          if (d.orderUpdatedAt) setOrderUpdatedAt(d.orderUpdatedAt);
          if (d.settingsUpdatedAt) setSettingsUpdatedAt(d.settingsUpdatedAt);
        }
      } catch {}
      // First-visit welcome hint
      try {
        const seen = await db.kv.get('welcomeSeen');
        if (!seen) setShowWelcome(true);
      } catch {}
      // API config
      try {
        const ac = await db.kv.get('apiConfig');
        if (ac?.value) setApiConfig(ac.value);
      } catch {}
      // Check for ?share= URL param
      try {
        const sp = new URLSearchParams(window.location.search);
        const shareParam = sp.get('share');
        if (shareParam) {
          if (shareParam.length > 30000) return;
          const binStr = atob(shareParam);
          const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(binStr, c => c.charCodeAt(0))));
          if (payload?.blocks) {
            const imported = makeCharacter(payload.name || 'Shared', payload.color || CHAR_COLORS[0], payload.emoji || CHAR_EMOJIS[0]);
            imported.blocks = imported.blocks.map(b => {
              const src = payload.blocks.find(pb => pb.id === b.id);
              return src ? { ...b, text: src.text || '', enabled: src.enabled !== false } : b;
            });
            setCharacters(prev => [...prev, imported]);
            setActiveCharId(imported.id);
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
      } catch {}
      setLoaded(true);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Storage: auto-save on change ──
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveState({ characters, history, lang, activeTool, toolSuffixes, theme, viewMode, outputHeight, orderUpdatedAt, settingsUpdatedAt });
        setSaveStatus('saved');
        if (statusTimer.current) clearTimeout(statusTimer.current);
        statusTimer.current = setTimeout(() => setSaveStatus(''), 2600);
      } catch { setSaveStatus('err'); }
    }, 800);
  }, [characters, history, lang, activeTool, toolSuffixes, theme, viewMode, outputHeight, orderUpdatedAt, settingsUpdatedAt, loaded]);

  // ── Color picker apply ──
  const TARGET_TO_BLOCK = { hair: 'face', eyes: 'face', skin: 'body', dress: 'outfit', shirt: 'outfit', skirt: 'outfit', jacket: 'outfit', ribbon: 'outfit', shoes: 'outfit', theme: 'artstyle' };
  const applyColorTag = (shadeEn, colorEn, targetEn, targetId) => {
    const blockId = TARGET_TO_BLOCK[targetId] || 'outfit';
    const tag = targetId === 'theme' ? `${shadeEn}${colorEn} theme`.trim() : buildColorTag(shadeEn, colorEn, targetEn);
    setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, blocks: c.blocks.map(b => b.id === blockId ? { ...b, text: appendTag(b.text, tag, '1.0'), enabled: true } : b) } : c));
  };

  // ── Drag-and-drop ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setCharacters(prev => prev.map(c => {
      if (c.id !== activeCharId) return c;
      const oldIdx = c.blocks.findIndex(b => b.id === active.id);
      const newIdx = c.blocks.findIndex(b => b.id === over.id);
      return { ...c, blocks: arrayMove(c.blocks, oldIdx, newIdx) };
    }));
  };

  // ── Block helpers ──
  const updateBlock = (blockId, upd) => setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, blocks: c.blocks.map(b => b.id === blockId ? { ...b, ...upd } : b) } : c));

  // ── Auto-rename default character names on language switch ──
  useEffect(() => {
    if (!loaded) return;
    setCharacters(prev => prev.map(c => {
      const jaMatch = c.name.match(/^キャラ (\d+)$/);
      const enMatch = c.name.match(/^Character (\d+)$/);
      if (lang === 'en' && jaMatch) return { ...c, name: `Character ${jaMatch[1]}` };
      if (lang === 'ja' && enMatch) return { ...c, name: `キャラ ${enMatch[1]}` };
      return c;
    }));
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SFW ↔ nsfw (negative) auto-linkage ──
  useEffect(() => {
    if (!loaded) return;
    const qualBlock = blocks.find(b => b.id === 'quality');
    const negBlock  = blocks.find(b => b.id === 'negative');
    if (!qualBlock || !negBlock) return;
    const sfwOn     = hasTag(qualBlock.text, 'SFW');
    const nsfwInNeg = hasTag(negBlock.text, 'nsfw');
    if (sfwOn === nsfwInNeg) return;
    if (sfwOn) updateBlock('negative', { text: appendTag(negBlock.text, 'nsfw', '1.0') });
    else       updateBlock('negative', { text: removeTag(negBlock.text, 'nsfw') });
  }, [blocks, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wraps updateBlock; auto-links species → special parts for the attribute block
  const handleBlockUpdate = (blockId, upd) => {
    if (blockId === 'attribute' && upd.text !== undefined) {
      const attrBlock = blocks.find(b => b.id === 'attribute');
      if (attrBlock) {
        const oldText = attrBlock.text;
        const speciesEns = Object.keys(SPECIES_PARTS_MAP);
        let resultText = upd.text;
        for (const speciesEn of speciesEns) {
          const wasActive = hasTag(oldText, speciesEn);
          const isNowActive = hasTag(resultText, speciesEn);
          if (!wasActive && isNowActive) {
            for (const partEn of SPECIES_PARTS_MAP[speciesEn]) {
              if (!hasTag(resultText, partEn)) resultText = appendTag(resultText, partEn, attrBlock.strength || '1.0');
            }
          } else if (wasActive && !isNowActive) {
            for (const partEn of SPECIES_PARTS_MAP[speciesEn]) {
              const stillNeeded = speciesEns.some(
                other => other !== speciesEn && hasTag(resultText, other) && (SPECIES_PARTS_MAP[other] || []).includes(partEn)
              );
              if (!stillNeeded) resultText = removeTag(resultText, partEn);
            }
          }
        }
        upd = { ...upd, text: resultText };
      }
    }
    updateBlock(blockId, upd);
  };

  const moveBlock = (blockId, dir) =>setCharacters(prev => prev.map(c => { if (c.id !== activeCharId) return c; const bs = [...c.blocks]; const i = bs.findIndex(b => b.id === blockId); const j = i + dir; if (j < 0 || j >= bs.length) return c; [bs[i], bs[j]] = [bs[j], bs[i]]; return { ...c, blocks: bs }; }));
  const addCustomBlock = () => {
    const customCount = blocks.filter(b => b.isCustomBlock).length;
    const limit = isMobile ? 3 : 5;
    if (customCount >= limit) {
      alert(lang === 'ja' ? `カスタムブロックは${limit}つまでです` : `Custom blocks are limited to ${limit}`);
      return;
    }
    const suffix = customCount === 0 ? '' : String(customCount + 1);
    const jaLabel = `カスタム${suffix}`;
    const enLabel = `Custom${suffix}`;
    setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, blocks: [...c.blocks, makeCustomBlock(jaLabel, enLabel)] } : c));
  };
  const removeBlock = (blockId) => setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, blocks: c.blocks.filter(b => b.id !== blockId) } : c));
  const resetBlockOrder = () => {
    if (!window.confirm(lang === 'ja' ? 'ブロックの並び順を初期配列に戻しますか？\n（テキストやタグの内容は変わりません）' : 'Reset block order to default?\n(Text and tags are not affected)')) return;
    const defOrder = BLOCKS_DEF.map(d => d.id);
    setCharacters(prev => prev.map(c => {
      if (c.id !== activeCharId) return c;
      const sorted = [...c.blocks].sort((a, b) => {
        const ai = a.isCustomBlock ? Infinity : defOrder.indexOf(a.id);
        const bi = b.isCustomBlock ? Infinity : defOrder.indexOf(b.id);
        return ai - bi;
      });
      return { ...c, blocks: sorted };
    }));
  };
  const savePreset = (blockId, presetKey, name, text) => {
    if ((activeChar[presetKey] || []).length >= 50) { alert(lang === 'ja' ? 'プリセットは最大50件まで保存できます' : 'Preset limit: 50'); return; }
    setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, [presetKey]: [...(c[presetKey] || []), { id: uid(), name, text }] } : c));
  };
  const loadPreset = (blockId, text) => updateBlock(blockId, { text });
  const deletePreset = (presetKey, presetId) => setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, [presetKey]: (c[presetKey] || []).filter(p => p.id !== presetId) } : c));
  const copyPresetToChar = (presetKey, preset, targetCharId) => setCharacters(prev => prev.map(c => c.id === targetCharId ? { ...c, [presetKey]: [...(c[presetKey] || []), { ...preset, id: uid() }] } : c));

  // ── Character helpers ──
  const updateChar = (id, upd) => setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...upd, lastModified: Date.now() } : c));
  const dismissWelcome = async () => {
    setShowWelcome(false);
    try { await db.kv.put({ key: 'welcomeSeen', value: true }); } catch {}
  };
  const reshowWelcome = async () => {
    setSettingsOpen(false);
    try { await db.kv.delete('welcomeSeen'); } catch {}
    setShowWelcome(true);
  };

  const saveApiConfig = async (cfg) => {
    setApiConfig(cfg);
    setAiResult('');
    try { await db.kv.put({ key: 'apiConfig', value: cfg }); } catch {}
  };

  const handleAddTagsFromNatural = (tagsByBlock) => {
    setCharacters(prev => prev.map(c => {
      if (c.id !== activeCharId) return c;
      const newBlocks = c.blocks.map(b => {
        const tags = tagsByBlock[b.id];
        if (!tags?.length) return b;
        let text = b.text;
        tags.forEach(t => { text = appendTag(text, t, '1.0'); });
        return { ...b, text, enabled: true };
      });
      return { ...c, blocks: newBlocks };
    }));
  };

  const handleTagSuggest = async () => {
    if (!apiConfig.apiKey || !posText) return;
    setTagSuggestBusy(true); setTagSuggestError(''); setTagSuggestions([]);
    try {
      const res = await callTagSuggest({ provider: apiConfig.provider, apiKey: apiConfig.apiKey, currentTags: posText, lang });
      setTagSuggestions(res);
      setTagSuggestOpen(true);
    } catch (e) {
      setTagSuggestError(e.message);
      setTagSuggestOpen(true);
    } finally {
      setTagSuggestBusy(false);
    }
  };

  const handleAiPolish = async () => {
    if (!naturalText || !apiConfig.apiKey) return;
    setAiBusy(true);
    setAiError('');
    try {
      const result = await callAI({ provider: apiConfig.provider, apiKey: apiConfig.apiKey, text: naturalText, naturalLang });
      setAiResult(result);
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiBusy(false);
    }
  };

  const addCharacter = () => {
    if (characters.length >= 30) { alert(lang === 'ja' ? 'キャラクターは最大30体まで登録できます' : 'Character limit: 30'); return; }
    const ci = characters.length % CHAR_COLORS.length; const ei = characters.length % CHAR_EMOJIS.length; const c = makeCharacter(`${lang === 'ja' ? 'キャラ' : 'Character'} ${characters.length + 1}`, CHAR_COLORS[ci], CHAR_EMOJIS[ei]); setCharacters(prev => [...prev, c]); setActiveCharId(c.id); setCharPanelOpen(true); setOrderUpdatedAt(Date.now());
  };
  const duplicateCharacter = (id) => { const src = characters.find(c => c.id === id); if (!src) return; const copy = { ...deep(src), id: uid(), name: src.name + ' (コピー)' }; setCharacters(prev => { const i = prev.findIndex(c => c.id === id); const next = [...prev]; next.splice(i + 1, 0, copy); return next; }); setActiveCharId(copy.id); setOrderUpdatedAt(Date.now()); };
  const deleteCharacter = async (id) => {
    if (characters.length <= 1) return;
    const charName = characters.find(c => c.id === id)?.name ?? '';
    if (!window.confirm(lang === 'ja'
      ? `「${charName}」を削除しますか？（この操作は取り消せません）`
      : `Delete "${charName}"? This cannot be undone.`)) return;
    await deleteCharImages(id);
    setThumbs(prev => { const n = { ...prev }; delete n[id]; return n; });
    const r = characters.filter(c => c.id !== id);
    setCharacters(r);
    setOrderUpdatedAt(Date.now());
    if (activeCharId === id) setActiveCharId(r.find(c => !c.archived)?.id ?? r[0]?.id ?? null);
  };
  const archiveCharacter = (id, archive) => {
    const nonArchivedCount = characters.filter(c => !c.archived).length;
    if (archive && nonArchivedCount <= 1) return; // guard: can't archive last active char
    updateChar(id, { archived: archive });
    // If archiving the active character, switch to first non-archived char
    if (archive && id === activeCharId) {
      const next = characters.find(c => c.id !== id && !c.archived);
      if (next) setActiveCharId(next.id);
    }
  };
  const setCharFolder = (id, folder) => updateChar(id, { folder });

  // ── LoRA helpers ──
  const addLora = () => {
    if ((activeChar.loras || []).length >= 30) { alert(lang === 'ja' ? 'LoRAは最大30件まで登録できます' : 'LoRA limit: 30'); return; }
    updateChar(activeCharId, { loras: [...(activeChar.loras || []), { id: uid(), name: '', weight: '0.8' }] });
  };
  const updateLora = (lid, upd) => updateChar(activeCharId, { loras: (activeChar.loras || []).map(l => l.id === lid ? { ...l, ...upd } : l) });
  const deleteLora = (lid) => updateChar(activeCharId, { loras: (activeChar.loras || []).filter(l => l.id !== lid) });
  const loraString = (loras, tool) => {
    if (!loras?.length) return '';
    return loras.filter(l => l.name.trim()).map(l => tool === 'nai' ? `{${l.name.trim()}:${l.weight}}` : `<lora:${l.name.trim()}:${l.weight}>`).join(' ');
  };

  // ── Character version helpers ──
  const saveVersion = (name) => {
    if (!name?.trim()) return;
    const ver = { id: uid(), name: name.trim(), ts: Date.now(), blocks: deep(activeChar.blocks), memo: activeChar.memo };
    updateChar(activeCharId, { versions: [ver, ...(activeChar.versions || [])].slice(0, 10) });
  };
  const restoreVersion = (ver) => {
    if (!window.confirm(lang === 'ja' ? `"${ver.name}" を復元しますか？（現在のブロックが上書きされます）` : `Restore "${ver.name}"? Current blocks will be overwritten.`)) return;
    // mergeCharacterBlocks re-adds cats from BLOCKS_DEF (needed for cloud-loaded versions where cats were stripped)
    updateChar(activeCharId, { blocks: mergeCharacterBlocks(ver.blocks), memo: ver.memo });
  };
  const deleteVersion = (verId) => updateChar(activeCharId, { versions: (activeChar.versions || []).filter(v => v.id !== verId) });

  // ── Image compression (Canvas, max 600px long-edge, prefer WebP → JPEG fallback) ──
  const compressImage = (file) => new Promise((resolve) => {
    const MAX_PX = 600;
    const QUALITY = 0.72;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const webp = canvas.toDataURL('image/webp', QUALITY);
      resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });

  // ── Thumbnail helpers (multi-image, max 4) ──
  const handleThumbUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const mimeOk = ['image/jpeg', 'image/png'].includes(file.type);
    const extOk  = ['jpg', 'jpeg', 'png'].includes(ext);
    if (!mimeOk || !extOk) {
      alert(lang === 'ja' ? '対応フォーマットは JPG / PNG のみです' : 'Only JPG/PNG files are supported');
      e.target.value = '';
      return;
    }
    const current = thumbs[activeCharId] || [];
    if (current.length >= 4) return;
    const dataUrl = await compressImage(file);
    if (!dataUrl) return;
    const next = [...current, dataUrl];
    await saveCharImages(activeCharId, next);
    setThumbs(prev => ({ ...prev, [activeCharId]: next }));
    e.target.value = '';
  };
  const removeThumbAt = async (index) => {
    const current = thumbs[activeCharId] || [];
    const next = current.filter((_, i) => i !== index);
    await saveCharImages(activeCharId, next);
    setThumbs(prev => ({ ...prev, [activeCharId]: next }));
  };
  const handleThumbDrop = async (e) => {
    e.preventDefault();
    setThumbDragOver(false);
    const current = thumbs[activeCharId] || [];
    if (current.length >= 4) return;
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['image/jpeg', 'image/png'].includes(file.type) || !['jpg', 'jpeg', 'png'].includes(ext)) {
      alert(lang === 'ja' ? '対応フォーマットは JPG / PNG のみです' : 'Only JPG/PNG files are supported');
      return;
    }
    const dataUrl = await compressImage(file);
    if (!dataUrl) return;
    const next = [...current, dataUrl];
    await saveCharImages(activeCharId, next);
    setThumbs(prev => ({ ...prev, [activeCharId]: next }));
  };

  // ── Block transfer ──
  const transferBlock = (blockId, targetCharId) => {
    const srcBlock = blocks.find(b => b.id === blockId);
    if (!srcBlock) return;
    setCharacters(prev => prev.map(c => c.id === targetCharId ? { ...c, blocks: c.blocks.map(b => b.id === blockId ? { ...b, text: srcBlock.text } : b) } : c));
  };

  // ── Share URL ──
  const copyShareUrl = () => {
    try {
      // Only include non-empty enabled blocks to keep URL short
      const payload = { name: activeChar.name, emoji: activeChar.emoji, color: activeChar.color, blocks: activeChar.blocks.filter(b => b.enabled !== false && b.text?.trim()).map(b => ({ id: b.id, text: b.text })) };
      const bytes = new TextEncoder().encode(JSON.stringify(payload));
      const encoded = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
      const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
      navigator.clipboard.writeText(url).then(() => { setShared(true); setTimeout(() => setShared(false), 2000); });
    } catch {}
  };

  // ── Templates ──
  const applyTemplate = (tmpl) => {
    // Save undo snapshot of blocks that will be overwritten
    const snapshot = {};
    for (const b of activeChar.blocks) {
      if (tmpl.apply[b.id] !== undefined) snapshot[b.id] = b.text;
    }
    if (templateUndoTimerRef.current) clearTimeout(templateUndoTimerRef.current);
    setTemplateUndoBuf({ blockTexts: snapshot, negHintJa: tmpl.negHintJa, negHintEn: tmpl.negHintEn });
    templateUndoTimerRef.current = setTimeout(() => setTemplateUndoBuf(null), 12000);

    setCharacters(prev => prev.map(c => {
      if (c.id !== activeCharId) return c;
      return { ...c, blocks: c.blocks.map(b => { if (tmpl.apply[b.id] !== undefined) return { ...b, text: tmpl.apply[b.id] }; return b; }) };
    }));
    setTemplateOpen(false);
  };

  const undoTemplate = () => {
    if (!templateUndoBuf) return;
    setCharacters(prev => prev.map(c => {
      if (c.id !== activeCharId) return c;
      return { ...c, blocks: c.blocks.map(b => templateUndoBuf.blockTexts[b.id] !== undefined ? { ...b, text: templateUndoBuf.blockTexts[b.id] } : b) };
    }));
    clearTimeout(templateUndoTimerRef.current);
    setTemplateUndoBuf(null);
  };

  const undoSingleBlock = (blockId) => {
    if (!templateUndoBuf || templateUndoBuf.blockTexts[blockId] === undefined) return;
    const restoredText = templateUndoBuf.blockTexts[blockId];
    setCharacters(prev => prev.map(c => {
      if (c.id !== activeCharId) return c;
      return { ...c, blocks: c.blocks.map(b => b.id === blockId ? { ...b, text: restoredText } : b) };
    }));
    setTemplateUndoBuf(prev => {
      if (!prev) return null;
      const newBlockTexts = { ...prev.blockTexts };
      delete newBlockTexts[blockId];
      if (Object.keys(newBlockTexts).length === 0) {
        clearTimeout(templateUndoTimerRef.current);
        return null;
      }
      return { ...prev, blockTexts: newBlockTexts };
    });
  };

  // ── Output computation ──
  const posText = blocks.filter(b => b.enabled !== false && b.id !== 'negative' && b.text?.trim()).map(b => b.text.trim()).join(', ');
  const negBlock = blocks.find(b => b.id === 'negative');
  const negText = negBlock?.enabled !== false ? negBlock?.text?.trim() || '' : '';

  const tool = TOOLS.find(t => t.id === activeTool) || TOOLS[0];
  const suffix = toolSuffixes[activeTool] || '';
  let finalPosText = posText;
  if (tool.stripWeights) finalPosText = stripWeights(finalPosText);
  if (activeTool === 'nai') finalPosText = toNaiWeights(finalPosText);
  const loraStr = (activeTool === 'sd' || activeTool === 'nai') ? loraString(activeChar?.loras, activeTool) : '';
  if (loraStr) finalPosText = finalPosText + (finalPosText ? ', ' : '') + loraStr;
  if (suffix) finalPosText = finalPosText + (finalPosText ? (tool.sep || ', ') : '') + suffix;

  const naturalText = naturalLang === 'ja' ? toNaturalJa(blocks) : toNaturalEn(blocks);
  // Reset AI result when source text or language changes
  useEffect(() => { setAiResult(''); setAiError(''); }, [naturalText, naturalLang]); // eslint-disable-line react-hooks/exhaustive-deps
  // Auto-call AI when switching TO natural tab (not on every tag change)
  const prevOutputTabRef = useRef('positive');
  useEffect(() => {
    if (outputTab === 'natural' && prevOutputTabRef.current !== 'natural' && apiConfig.apiKey && naturalText) {
      handleAiPolish();
    }
    prevOutputTabRef.current = outputTab;
  }, [outputTab]); // eslint-disable-line react-hooks/exhaustive-deps
  const displayNaturalText = aiResult || naturalText;
  const currentText = outputTab === 'positive' ? finalPosText : outputTab === 'natural' ? displayNaturalText : negText;
  const textToCopy = outputEditMode ? outputEditText : currentText;
  const goodColor = theme === 'dark' ? '#4fffb0' : '#059655';
  const warnColor = theme === 'dark' ? '#fbbf24' : '#b45309';
  const dangerColor = theme === 'dark' ? '#f87171' : '#dc2626';
  const tokenColor = textToCopy.length > LIMIT_LEN ? dangerColor : textToCopy.length > WARN_LEN ? warnColor : goodColor;
  const conflicts = detectConflicts(posText);
  const conflictingTagSet = new Set(conflicts.flatMap(r => r.tags).map(t => t.toLowerCase()));

  // ── History ──
  const makeHistoryEntry = (isSnapshot = false) => {
    if (!posText) return null;
    // Strip cats from blocks — they're in BLOCKS_DEF and can be reconstructed on restore.
    // This prevents history from ballooning to megabytes and breaking cloud sync.
    const slimBlocks = activeChar.blocks.map(b =>
      b.isCustomBlock
        ? { id: b.id, name: b.name, nameEn: b.nameEn, icon: b.icon, color: b.color, text: b.text, enabled: b.enabled, strength: b.strength, locked: b.locked, isCustomBlock: true }
        : { id: b.id, text: b.text, enabled: b.enabled, strength: b.strength, locked: b.locked }
    );
    return { id: uid(), ts: Date.now(), isSnapshot, charId: activeChar.id, charName: activeChar.name, charColor: activeChar.color, charEmoji: activeChar.emoji, blocks: slimBlocks, posText, negText };
  };
  const pushHistory = (entry) => { if (!entry) return; setHistory(prev => [entry, ...prev.filter(e => e.posText !== posText)].slice(0, 20)); };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e) => {
      const inInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;

      // Ctrl/Cmd + K → command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(p => !p);
        return;
      }

      // Ctrl/Cmd + Enter → copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true); setTimeout(() => setCopied(false), 2200);
            pushHistory(makeHistoryEntry(false));
          });
        }
        return;
      }

      // Ctrl/Cmd + F → global tag search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setGlobalSearchOpen(p => !p);
        return;
      }

      // Escape → close top modal (or exit focus mode)
      if (e.key === 'Escape') {
        if (paletteOpen)      { setPaletteOpen(false);      return; }
        if (globalSearchOpen) { setGlobalSearchOpen(false); return; }
        if (libraryOpen)      { setLibraryOpen(false);      return; }
        if (settingsOpen)     { setSettingsOpen(false);     return; }
        if (historyOpen)      { setHistoryOpen(false);      return; }
        if (templateOpen)     { setTemplateOpen(false);     return; }
        if (colorPickerOpen)  { setColorPickerOpen(false);  return; }
        if (sceneOpen)        { setSceneOpen(false);        return; }
        if (analyzeOpen)      { setAnalyzeOpen(false); setAnalyzeText(''); return; }
        if (quickOpen)        { setQuickOpen(false);        return; }
        if (dataMenuOpen)     { setDataMenuOpen(false);     return; }
        if (focusBlockId)     { setFocusBlockId(null);      return; }
        return;
      }

      // ? → open settings (not in input)
      if (!inInput && e.key === '?') {
        setSettingsOpen(s => !s);
        return;
      }

      // Single-key shortcuts — skip when typing
      if (inInput) return;

      // H → history, T → template, G → global search, A → analyze
      if (e.key === 'h' || e.key === 'H') { setHistoryOpen(p => !p);      return; }
      if (e.key === 't' || e.key === 'T') { setTemplateOpen(p => !p);     return; }
      if (e.key === 'g' || e.key === 'G') { setGlobalSearchOpen(p => !p); return; }
      if (e.key === 'a' || e.key === 'A') {
        setAnalyzeOpen(p => { if (p) setAnalyzeText(''); return !p; });
        return;
      }

      // [ ] → fold / expand all
      if (e.key === '[') {
        setCharacters(prev => prev.map(c => c.id === activeCharId
          ? { ...c, blocks: c.blocks.map(b => ({ ...b, collapsed: true })) } : c));
        return;
      }
      if (e.key === ']') {
        setCharacters(prev => prev.map(c => c.id === activeCharId
          ? { ...c, blocks: c.blocks.map(b => ({ ...b, collapsed: false })) } : c));
        return;
      }

      // P / N → switch output tab
      if (e.key === 'p' || e.key === 'P') { setOutputTab('positive'); return; }
      if (e.key === 'n' || e.key === 'N') { setOutputTab('negative'); return; }

      // 1–6 → switch AI tool
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= TOOLS.length) {
        setActiveTool(TOOLS[num - 1].id);
        setEditingSuffix(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteOpen, globalSearchOpen, libraryOpen, analyzeOpen, historyOpen, templateOpen, colorPickerOpen, sceneOpen, settingsOpen, focusBlockId,
      activeCharId, currentText, posText, negText, activeChar]);

  // DALL-E selected → auto-switch to natural language tab; leaving DALL-E → back to positive
  const prevToolRef = useRef(activeTool);
  useEffect(() => {
    const prev = prevToolRef.current;
    prevToolRef.current = activeTool;
    if (activeTool === 'dalle') {
      setOutputTab('natural');
    } else if (prev === 'dalle') {
      setOutputTab('positive');
    }
  }, [activeTool]);

  const startOutputDrag = useOutputDrag(outputHeight, setOutputHeight);

  const addToPromptLog = (entry) =>
    setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, promptLog: [entry, ...(c.promptLog || [])].slice(0, 100) } : c));

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2200);
      pushHistory(makeHistoryEntry(false));
      if (outputTab === 'positive' && textToCopy && localStorage.getItem('loom_autolog_copy') !== 'false') {
        const log = activeChar.promptLog || [];
        const lastEntry = log[0];
        if (lastEntry && lastEntry.posText === textToCopy) {
          // Same content: update timestamp only, don't create duplicate entry
          setCharacters(prev => prev.map(c => c.id !== activeCharId ? c : {
            ...c, promptLog: [{ ...lastEntry, ts: Date.now() }, ...log.slice(1)],
          }));
          setAutoLogToast('saved');
          setTimeout(() => setAutoLogToast(false), 2200);
        } else if (log.length >= 100) {
          setAutoLogToast('full');
          setTimeout(() => setAutoLogToast(false), 2800);
        } else {
          const autoTitle = textToCopy.split(',')[0]?.trim().slice(0, 30) || '';
          const slimBlocks = activeChar.blocks.map(b => { const { cats, lastRandomPicks, ...r } = b; return r; });
          addToPromptLog({ id: uid(), ts: Date.now(), title: autoTitle, tool: activeTool, labels: [], posText: textToCopy, negText, memo: '', blocks: slimBlocks });
          setAutoLogToast('saved');
          setTimeout(() => setAutoLogToast(false), 2200);
        }
      }
    });
  };

  const handleSnapshot = () => {
    const e = makeHistoryEntry(true);
    if (!e) return;
    pushHistory(e);
    setSnapped(true); setTimeout(() => setSnapped(false), 1800);
  };

  const handleResetAll = () => {
    if (!window.confirm(
      lang === 'ja'
        ? 'すべてのブロックのプロンプトをリセットしますか？\n（テキストが全削除されます）'
        : 'Reset all block prompts?\n(All text will be cleared)'
    )) return;
    setCharacters(prev => prev.map(c =>
      c.id === activeCharId ? { ...c, blocks: c.blocks.map(b => ({ ...b, text: '' })) } : c
    ));
  };

  const restoreFromHistory = (entry) => {
    // Rebuild full block objects (with cats) from slim history snapshot
    setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, blocks: mergeCharacterBlocks(entry.blocks) } : c));
    setHistoryOpen(false);
  };

  // ── Export/Import (1 character) ──
  const handleExport = () => downloadJSON(
    { version: 'loom-v4', character: activeChar },
    `loom-${activeChar.name}-${Date.now()}.loom`
  );
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5_000_000) { alert(lang === 'ja' ? 'ファイルが大きすぎます（最大5MB）' : 'File too large (max 5 MB)'); e.target.value = ''; return; }
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        // Support new single-char format and old multi-char format
        const src = d.character ?? d.characters?.[0];
        if (!src) throw new Error('no data');
        const imported = { ...src, id: uid(), blocks: mergeCharacterBlocks(src.blocks) };
        setCharacters(prev => [...prev, imported]);
        setActiveCharId(imported.id);
        setOrderUpdatedAt(Date.now());
        setImportToast({ name: imported.name });
        setTimeout(() => setImportToast(null), 3500);
      } catch { alert(lang === 'ja' ? '読み込みに失敗しました' : 'Failed to import file'); }
    };
    r.readAsText(file);
    e.target.value = '';
  };

  // ── Preset export / import (costume & shot presets only) ──
  const handlePresetExport = () => {
    const { costumePresets = [], shotPresets = [] } = activeChar;
    downloadJSON({ version: 'loom-presets-v1', costumePresets, shotPresets }, `loom-presets-${Date.now()}.loom`);
  };
  const handlePresetImport = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 1_000_000) { alert(lang === 'ja' ? 'ファイルが大きすぎます（最大1MB）' : 'File too large (max 1 MB)'); e.target.value = ''; return; }
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        const merge = (existing, incoming) => {
          const ids = new Set((existing || []).map(p => p.name + p.text));
          return [...(existing || []), ...(incoming || []).filter(p => !ids.has(p.name + p.text)).map(p => ({ ...p, id: uid() }))];
        };
        setCharacters(prev => prev.map(c => c.id === activeCharId ? {
          ...c,
          costumePresets: merge(c.costumePresets, d.costumePresets),
          shotPresets:    merge(c.shotPresets,    d.shotPresets),
        } : c));
      } catch { alert(lang === 'ja' ? 'プリセットの読み込みに失敗しました' : 'Failed to import presets'); }
    };
    r.readAsText(file); e.target.value = '';
  };

  // ── Global tag toggle (for GlobalTagSearch) ──
  const handleGlobalTagToggle = (blockId, tagEn) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    handleBlockUpdate(blockId, { text: toggleTag(block.text, tagEn, block.strength || '1.0'), enabled: true });
  };

  const compareChar = compareCharId ? characters.find(c => c.id === compareCharId) : null;
  const tagCount = textToCopy ? countTags(textToCopy) : 0;

  // ── Block visibility ──
  const SIMPLE_BLOCK_IDS = ['quality', 'artstyle', 'face', 'outfit', 'composition', 'negative'];
  const hiddenBlockIds = new Set(activeChar.hiddenBlocks || []);
  const toggleHideBlock = (blockId) => {
    const hidden = activeChar.hiddenBlocks || [];
    updateChar(activeCharId, {
      hiddenBlocks: hidden.includes(blockId) ? hidden.filter(id => id !== blockId) : [...hidden, blockId],
    });
  };
  const visibleBlocks = simpleMode
    ? blocks.filter(b => (SIMPLE_BLOCK_IDS.includes(b.id) || b.isCustomBlock) && !hiddenBlockIds.has(b.id))
    : blocks.filter(b => !hiddenBlockIds.has(b.id));

  // ── Balance meter ──
  const balanceBlocks = blocks.filter(b => b.enabled !== false && b.id !== 'negative' && b.text?.trim());
  const totalTags = balanceBlocks.reduce((s, b) => s + countTags(b.text), 0);

  // ── Variation expansion ──
  const { variations, variationsOpen, setVariationsOpen, varCopied, generateVariations, copyVariation } = useVariations(blocks, tool);
  const [varNatSet, setVarNatSet] = useState(new Set());
  const toggleVarNat = (i) => setVarNatSet(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  // ── Variation ⇄ main swap system ──
  const [varSource, setVarSource] = useState('original');  // 'original' | 'var0' | 'var1' | 'var2'
  const [varBuffers, setVarBuffers] = useState({});         // { source: { blockId: text } }

  const captureBlockTexts = () => blocks.reduce((acc, b) => ({ ...acc, [b.id]: b.text }), {});

  const startVariations = () => {
    if (!posText) return;
    setVarBuffers({ original: captureBlockTexts() });
    setVarSource('original');
    generateVariations();
    setVarNatSet(new Set());
  };

  const applyVariation = (varIdx) => {
    const sourceKey = `var${varIdx}`;
    const buf = varBuffers[sourceKey];
    const targetVarBlocks = variations[varIdx]?.blocks ?? [];
    setVarBuffers(prev => ({ ...prev, [varSource]: captureBlockTexts() }));
    setCharacters(prev => prev.map(c => {
      if (c.id !== activeCharId) return c;
      return { ...c, blocks: c.blocks.map(b => {
        const text = buf?.[b.id] ?? (targetVarBlocks.find(vb => vb.id === b.id)?.text ?? b.text);
        return { ...b, text };
      })};
    }));
    setVarSource(sourceKey);
  };

  const restoreOriginal = () => {
    if (varSource === 'original') return;
    const buf = varBuffers.original;
    if (!buf) return;
    setVarBuffers(prev => ({ ...prev, [varSource]: captureBlockTexts() }));
    setCharacters(prev => prev.map(c => {
      if (c.id !== activeCharId) return c;
      return { ...c, blocks: c.blocks.map(b => ({ ...b, text: buf[b.id] ?? b.text })) };
    }));
    setVarSource('original');
  };

  // ── Command Palette commands ──
  const paletteCommands = [
    // Actions
    { id: 'copy', group: lang === 'ja' ? 'アクション' : 'Actions', icon: '📋', label: 'Copy prompt', labelJa: 'プロンプトをコピー', shortcut: 'Ctrl+Enter', action: () => { if (currentText) { navigator.clipboard.writeText(currentText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200); pushHistory(makeHistoryEntry(false)); }); } } },
    { id: 'snapshot', group: lang === 'ja' ? 'アクション' : 'Actions', icon: '📸', label: 'Snapshot', labelJa: 'スナップショット保存', action: handleSnapshot },
    { id: 'fold', group: lang === 'ja' ? 'アクション' : 'Actions', icon: '⊟', label: 'Fold all blocks', labelJa: '全ブロックを折りたたむ', shortcut: '[', action: () => setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, blocks: c.blocks.map(b => ({ ...b, collapsed: true })) } : c)) },
    { id: 'expand', group: lang === 'ja' ? 'アクション' : 'Actions', icon: '⊞', label: 'Expand all blocks', labelJa: '全ブロックを展開', shortcut: ']', action: () => setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, blocks: c.blocks.map(b => ({ ...b, collapsed: false })) } : c)) },
    { id: 'random-char', group: lang === 'ja' ? 'アクション' : 'Actions', icon: '🎲', label: 'Random character (all blocks)', labelJa: 'おまかせランダム生成（全ブロック）', action: generateRandomChar },
    { id: 'addchar', group: lang === 'ja' ? 'アクション' : 'Actions', icon: '👤', label: 'Add character', labelJa: '新キャラクターを追加', action: addCharacter },
    { id: 'dupchar', group: lang === 'ja' ? 'アクション' : 'Actions', icon: '⊕', label: 'Duplicate current character', labelJa: 'キャラクターを複製', action: () => duplicateCharacter(activeCharId) },
    // Panels
    { id: 'global-search', group: lang === 'ja' ? 'パネル' : 'Panels', icon: '🔍', label: 'Global tag search', labelJa: 'タグ全体検索', shortcut: 'G / Ctrl+F', action: () => setGlobalSearchOpen(true) },
    { id: 'analyze', group: lang === 'ja' ? 'パネル' : 'Panels', icon: '◎', label: 'Analyze prompt', labelJa: 'プロンプト逆解析', shortcut: 'A', action: () => { setAnalyzeOpen(true); setOutputExpanded(true); } },
    { id: 'open-history', group: lang === 'ja' ? 'パネル' : 'Panels', icon: '🕐', label: 'Open history', labelJa: '履歴を開く', shortcut: 'H', action: () => setHistoryOpen(true) },
    { id: 'open-template', group: lang === 'ja' ? 'パネル' : 'Panels', icon: '✦', label: 'Open templates', labelJa: 'テンプレートを開く', shortcut: 'T', action: () => setTemplateOpen(true) },
    { id: 'open-color', group: lang === 'ja' ? 'パネル' : 'Panels', icon: '🎨', label: 'Open color picker', labelJa: 'カラーピッカーを開く', action: () => setColorPickerOpen(true) },
    ...(characters.length > 1 ? [{ id: 'open-scene', group: lang === 'ja' ? 'パネル' : 'Panels', icon: '🎬', label: 'Open scene compose', labelJa: 'シーン合成を開く', action: () => setSceneOpen(true) }] : []),
    { id: 'open-settings', group: lang === 'ja' ? 'パネル' : 'Panels', icon: '⚙️', label: 'Open settings / shortcuts', labelJa: '設定・ショートカット', shortcut: '?', action: () => setSettingsOpen(true) },
    // AI Tools
    ...TOOLS.map((t, i) => ({ id: `tool-${t.id}`, group: lang === 'ja' ? 'AIツール' : 'AI Tools', icon: t.icon, label: t.name, labelJa: t.name, shortcut: String(i + 1), action: () => { setActiveTool(t.id); setEditingSuffix(false); } })),
    // App
    { id: 'tab-pos', group: lang === 'ja' ? 'アプリ設定' : 'App', icon: '✦', label: 'Switch to Positive tab', labelJa: 'Positive タブへ切替', shortcut: 'P', action: () => setOutputTab('positive') },
    { id: 'tab-neg', group: lang === 'ja' ? 'アプリ設定' : 'App', icon: '✕', label: 'Switch to Negative tab', labelJa: 'Negative タブへ切替', shortcut: 'N', action: () => setOutputTab('negative') },
    { id: 'view-mode', group: lang === 'ja' ? 'アプリ設定' : 'App', icon: viewMode === 'simple' ? '📋' : viewMode === 'expert' ? '🔧' : '🗂️', label: `View mode: ${viewMode} → cycle`, labelJa: `表示モード切替 (現在: ${viewMode === 'simple' ? 'シンプル' : viewMode === 'expert' ? 'エキスパート' : '通常'})`, action: cycleViewMode },
    { id: 'share-url', group: lang === 'ja' ? 'アプリ設定' : 'App', icon: '🔗', label: 'Share prompt', labelJa: 'プロンプトをシェア', action: copyShareUrl },
    { id: 'toggle-theme', group: lang === 'ja' ? 'アプリ設定' : 'App', icon: theme === 'dark' ? '☀️' : '🌙', label: 'Toggle theme', labelJa: 'テーマを切替', action: () => setTheme(t => t === 'dark' ? 'light' : 'dark') },
    { id: 'toggle-lang', group: lang === 'ja' ? 'アプリ設定' : 'App', icon: '🌐', label: 'Toggle language JA/EN', labelJa: '言語を切替 JA/EN', action: () => setLang(l => l === 'ja' ? 'en' : 'ja') },
    { id: 'export', group: lang === 'ja' ? 'アプリ設定' : 'App', icon: '💾', label: 'Backup character', labelJa: 'キャラをバックアップ', action: handleExport },
    // Characters
    ...characters.map(c => ({ id: `char-${c.id}`, group: lang === 'ja' ? 'キャラクター' : 'Characters', icon: c.emoji, label: c.name, labelJa: c.name, description: `${c.blocks?.filter(b => b.enabled !== false && b.text?.trim()).length || 0} active blocks`, action: () => { setActiveCharId(c.id); setCharPanelOpen(true); } })),
    // Blocks
    ...blocks.map(b => ({ id: `block-${b.id}`, group: lang === 'ja' ? 'ブロック' : 'Blocks', icon: b.icon, label: lang === 'ja' ? b.name : b.nameEn, labelJa: b.name, description: b.text ? b.text.slice(0, 50) : (lang === 'ja' ? '空' : 'empty'), action: () => { setFocusBlockId(null); setTimeout(() => { document.getElementById(`block-${b.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (b.collapsed) updateBlock(b.id, { collapsed: false }); }, 80); } })),
  ];

  return (
    <div className="bg-bg text-fg min-h-screen font-sans" style={{ paddingBottom: outputExpanded ? outputHeight : 80 }}>

      {/* ── HEADER ── */}
      <div className="bg-surface border-b border-line px-[14px] py-[9px] sticky top-0 z-50 flex items-center gap-[7px] flex-wrap">
        <div className="flex items-center gap-2">
          <div
            onClick={isMobile ? () => setJumpOpen(p => !p) : undefined}
            title={isMobile ? (lang === 'ja' ? 'ブロック一覧を開く' : 'Open block list') : undefined}
            className={`w-[30px] h-[30px] rounded-[8px] flex items-center justify-center flex-shrink-0 bg-[linear-gradient(135deg,#5a7fff,#b06fff)]${isMobile ? ' cursor-pointer active:opacity-70 select-none' : ''}`}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="white">
              <circle cx="2.5" cy="2.5" r="1.5"/><circle cx="7.5" cy="2.5" r="1.5"/><circle cx="12.5" cy="2.5" r="1.5"/>
              <circle cx="2.5" cy="7.5" r="1.5"/><circle cx="7.5" cy="7.5" r="1.5"/><circle cx="12.5" cy="7.5" r="1.5"/>
              <circle cx="2.5" cy="12.5" r="1.5"/><circle cx="7.5" cy="12.5" r="1.5"/><circle cx="12.5" cy="12.5" r="1.5"/>
            </svg>
          </div>
          <div>
            <div className="text-[20px] font-black tracking-[0.22em] leading-none" style={{ fontFamily: "'Century Gothic', 'AppleGothic', 'Gill Sans', sans-serif" }}>LOOM</div>
            <div className="text-[9px] text-muted tracking-[0.08em]">The Prompt Weaving Studio</div>
          </div>
        </div>
        <div className="flex-1" />
        {/* ☕ Donate */}
        <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
          title={lang === 'ja' ? '開発を支援する（Buy Me a Coffee）' : 'Support development'}
          className="bg-[#fbbf2412] border border-[#fbbf2440] rounded-[6px] px-[9px] py-1 text-warn text-[11px] font-mono no-underline flex-shrink-0 cursor-pointer">☕</a>
        {/* ✦ ツール dropdown: Template / Color / Scene / +Custom(Expert) / Reset order */}
        <div className="relative flex-shrink-0">
          <button onClick={() => setQuickOpen(p => !p)}
            title={lang === 'ja' ? 'テンプレート・カラー・シーン' : 'Template / Color / Scene'}
            className="flex items-center gap-[4px] rounded-[6px] px-[9px] py-1 cursor-pointer text-[10px] font-mono font-bold transition-colors duration-[120ms] whitespace-nowrap border text-accent"
            style={{ background: quickOpen ? 'rgb(var(--c-blue) / 0.19)' : 'rgb(var(--c-blue) / 0.08)', borderColor: quickOpen ? 'rgb(var(--c-blue) / 0.5)' : 'rgb(var(--c-blue) / 0.31)' }}>
            ✦{!isMobile && ` ${lang === 'ja' ? 'ツール' : 'Tools'}`} <span className="text-[8px] opacity-60">▾</span>
          </button>
          {quickOpen && (
            <>
              <div className="fixed inset-0 z-[199]" onClick={() => setQuickOpen(false)} />
              <div className="absolute right-0 top-full mt-[4px] z-[200] bg-surface border border-line rounded-[9px] shadow-xl py-[4px] min-w-[170px]">
                <button onClick={() => { setTemplateOpen(true); setQuickOpen(false); }}
                  className="w-full text-left px-[12px] py-[7px] text-[11px] font-mono cursor-pointer hover:bg-surfalt text-accent flex items-center gap-2">
                  ✦ {lang === 'ja' ? 'テンプレート' : 'Template'}
                </button>
                {apiConfig.apiKey && (
                  <button onClick={() => { setNaturalToTagsTab('text'); setNaturalToTagsOpen(true); setQuickOpen(false); }}
                    className="w-full text-left px-[12px] py-[7px] text-[11px] font-mono cursor-pointer hover:bg-surfalt flex items-center gap-2"
                    style={{ color: 'rgb(var(--c-blue))' }}>
                    ✍️ {lang === 'ja' ? '自然文からタグ生成' : 'Text to Tags'}
                  </button>
                )}
                {apiConfig.apiKey && (
                  <button onClick={() => { setNaturalToTagsTab('image'); setNaturalToTagsOpen(true); setQuickOpen(false); }}
                    className="w-full text-left px-[12px] py-[7px] text-[11px] font-mono cursor-pointer hover:bg-surfalt flex items-center gap-2"
                    style={{ color: 'rgb(var(--c-purple))' }}>
                    🖼 {lang === 'ja' ? '画像からタグ生成' : 'Image to Tags'}
                  </button>
                )}
                <button onClick={() => { setColorPickerOpen(true); setQuickOpen(false); }}
                  className="w-full text-left px-[12px] py-[7px] text-[11px] font-mono cursor-pointer hover:bg-surfalt flex items-center gap-2"
                  style={{ color: 'rgb(var(--c-purple))' }}>
                  🎨 {lang === 'ja' ? 'カラー' : 'Color'}
                </button>
                {characters.length > 1 && (
                  <button onClick={() => { setSceneOpen(true); setQuickOpen(false); }}
                    className="w-full text-left px-[12px] py-[7px] text-[11px] font-mono cursor-pointer hover:bg-surfalt flex items-center gap-2"
                    style={{ color: 'rgb(var(--c-green))' }}>
                    🎬 {lang === 'ja' ? 'シーン合成' : 'Scene'}
                  </button>
                )}
                {expertMode && (
                  <button onClick={() => { addCustomBlock(); setQuickOpen(false); }}
                    className="w-full text-left px-[12px] py-[7px] text-[11px] font-mono cursor-pointer hover:bg-surfalt text-muted flex items-center gap-2">
                    ✏️ {lang === 'ja' ? '+カスタムブロック' : '+Custom block'}
                  </button>
                )}
                <div className="border-t border-line mx-2 my-[3px]" />
                <button onClick={() => { resetBlockOrder(); setQuickOpen(false); }}
                  className="w-full text-left px-[12px] py-[7px] text-[11px] font-mono cursor-pointer hover:bg-surfalt text-muted flex items-center gap-2">
                  ↺ {lang === 'ja' ? 'ブロック順をリセット' : 'Reset block order'}
                </button>
              </div>
            </>
          )}
        </div>
        {/* 列表示切替 (PC wide only) */}
        {isWide && (
          <button
            onClick={() => { setLayout(l => l === '1col' ? '2col' : l === '2col' ? '3col' : '1col'); setFocusBlockId(null); }}
            title={lang === 'ja' ? '列数切替 (1→2→3)' : 'Cycle columns (1→2→3)'}
            className={`rounded-[5px] px-[9px] py-1 cursor-pointer text-[10px] font-mono flex-shrink-0 ${layout !== '1col' ? 'border' : 'bg-transparent border border-dim text-muted'}`}
            style={layout !== '1col' ? { background: 'rgb(var(--c-green) / 0.13)', borderColor: 'rgb(var(--c-green) / 0.38)', color: 'rgb(var(--c-green))' } : undefined}>
            {layout === '3col' ? `▦ ${lang === 'ja' ? '3列' : '3col'}` : layout === '2col' ? `▥ ${lang === 'ja' ? '2列' : '2col'}` : `▢ ${lang === 'ja' ? '1列' : '1col'}`}
          </button>
        )}
        {/* 🕐 履歴 */}
        <button onClick={() => setHistoryOpen(true)}
          title={lang === 'ja' ? 'プロンプト履歴 (H)' : 'Prompt history (H)'}
          className={`bg-transparent rounded-[6px] px-[9px] py-1 cursor-pointer text-[10px] font-mono whitespace-nowrap flex-shrink-0 border ${history.length > 0 ? 'text-accent' : 'border-dim text-muted'}`}
          style={history.length > 0 ? { borderColor: 'rgb(var(--c-blue) / 0.5)' } : undefined}>
          🕐 {isMobile ? history.length : `${lang === 'ja' ? '履歴' : 'Hist.'}${history.length > 0 ? ` · ${history.length}` : ''}`}
        </button>
        {/* 🔍 検索 / ⌘K (PC only) */}
        {!isMobile && <button onClick={() => setGlobalSearchOpen(true)} title={lang === 'ja' ? 'タグ全体検索 (G / Ctrl+F)' : 'Global tag search (G / Ctrl+F)'} className="bg-transparent border border-dim rounded-[6px] px-[9px] py-1 text-muted cursor-pointer text-[10px] font-mono whitespace-nowrap">🔍 {lang === 'ja' ? '検索' : 'Search'}</button>}
        {!isMobile && <button onClick={() => setPaletteOpen(true)} title={lang === 'ja' ? 'コマンドパレット (Ctrl+K)' : 'Command Palette (Ctrl+K)'} className="bg-transparent border border-dim rounded-[6px] px-[9px] py-1 text-muted cursor-pointer text-[10px] font-mono">⌘K</button>}
        {/* 💾 データ */}
        <div className="relative flex-shrink-0 flex items-center">
          <button onClick={() => setDataMenuOpen(p => !p)}
            title={lang === 'ja' ? 'キャラのバックアップ・復元' : 'Backup / Restore character'}
            className={`bg-transparent border rounded-[6px] px-[9px] py-1 text-muted cursor-pointer text-[10px] font-mono whitespace-nowrap ${dataMenuOpen ? 'border-accent/50 text-accent' : 'border-dim'}`}>
            💾{!isMobile && ` ${lang === 'ja' ? 'バックアップ' : 'Backup'}`} ▾
          </button>
          {dataMenuOpen && (
            <>
              <div className="fixed inset-0 z-[199]" onClick={() => setDataMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-[4px] z-[200] bg-surface border border-line rounded-[9px] shadow-xl py-[4px] min-w-[210px]">
                <div className="px-[10px] py-[4px] text-[9px] font-mono text-dim uppercase tracking-wider">
                  {lang === 'ja' ? `選択中: ${activeChar?.name}` : `Selected: ${activeChar?.name}`}
                </div>
                <button onClick={() => { handleExport(); setDataMenuOpen(false); }}
                  className="w-full text-left px-[12px] py-[6px] text-[11px] font-mono cursor-pointer hover:bg-surfalt text-muted flex items-center gap-2">
                  <span className="text-dim">↓</span>{lang === 'ja' ? 'キャラをバックアップ' : 'Backup character'}
                </button>
                <button onClick={() => { fileRef.current?.click(); setDataMenuOpen(false); }}
                  className="w-full text-left px-[12px] py-[6px] text-[11px] font-mono cursor-pointer hover:bg-surfalt text-muted flex items-center gap-2">
                  <span className="text-dim">↑</span>{lang === 'ja' ? 'バックアップから復元' : 'Restore from backup'}
                </button>
                <div className="border-t border-line mx-2 my-[4px]" />
                <div className="px-[10px] py-[4px] text-[9px] font-mono text-dim uppercase tracking-wider">{lang === 'ja' ? 'プリセット' : 'Presets'}</div>
                <button onClick={() => { handlePresetExport(); setDataMenuOpen(false); }}
                  className="w-full text-left px-[12px] py-[6px] text-[11px] font-mono cursor-pointer hover:bg-surfalt text-muted flex items-center gap-2">
                  <span className="text-dim">↓</span>{lang === 'ja' ? '衣装・構図プリセット書き出し' : 'Export costume & shot presets'}
                </button>
                <button onClick={() => { presetFileRef.current?.click(); setDataMenuOpen(false); }}
                  className="w-full text-left px-[12px] py-[6px] text-[11px] font-mono cursor-pointer hover:bg-surfalt text-muted flex items-center gap-2">
                  <span className="text-dim">↑</span>{lang === 'ja' ? 'プリセットを追加読み込み' : 'Add presets from file'}
                </button>
              </div>
            </>
          )}
        </div>
        {/* 🔐 Auth */}
        <AuthButton
          user={user}
          loading={user === undefined}
          onSignIn={handleSignIn}
          onSignOut={signOut}
          syncStatus={syncStatus}
          lang={lang}
        />
        {/* ⚙️ 設定 */}
        <button onClick={() => setSettingsOpen(true)} title={lang === 'ja' ? 'テーマ・言語・表示モード・ショートカット (?)' : 'Theme / Language / View mode / Shortcuts (?)'}
          className="bg-transparent border border-dim rounded-[6px] px-[9px] py-1 text-muted cursor-pointer text-[10px] font-mono whitespace-nowrap">
          ⚙️{!isMobile && ` ${lang === 'ja' ? '設定' : 'Settings'}`}
        </button>
        <input ref={fileRef} type="file" accept=".json,.loom" onChange={handleImport} className="hidden" />
        <input ref={presetFileRef} type="file" accept=".json,.loom" onChange={handlePresetImport} className="hidden" />
      </div>

      {/* ── CHARACTER BAR ── */}
      <div className="bg-surface border-b border-line px-[14px] py-[7px] flex items-center gap-[5px] overflow-x-auto">
        {characters.filter(c => !c.archived || c.id === activeCharId).map(c => (
          <div key={c.id} className="relative flex-shrink-0">
            {isMobile ? (
              <div
                onClick={() => { setActiveCharId(c.id); setCharPanelOpen(true); setCompareCharId(null); }}
                title={c.name}
                style={{ background: c.color, outline: activeCharId === c.id ? `2px solid white` : `2px solid transparent`, outlineOffset: '2px' }}
                className="w-[22px] h-[22px] rounded-full cursor-pointer transition-all duration-150 flex-shrink-0"
              />
            ) : (
              <div onClick={() => { setActiveCharId(c.id); setCharPanelOpen(true); setCompareCharId(null); }}
                style={{ background: activeCharId === c.id ? c.color + '22' : 'rgb(var(--surface-alt))', border: `1px solid ${activeCharId === c.id ? c.color + '70' : 'rgb(var(--border))'}` }}
                className="flex items-center gap-1 rounded-[20px] px-[9px] py-1 cursor-pointer transition-all duration-150">
                <span style={{ background: c.color }} className="w-[7px] h-[7px] rounded-full flex-shrink-0" />
                <span className="text-[12px]">{c.emoji}</span>
                <span style={{ color: activeCharId === c.id ? c.color : 'rgb(var(--text))' }} className="text-[12px] font-semibold whitespace-nowrap">{c.name}</span>
                <span onClick={e => { e.stopPropagation(); duplicateCharacter(c.id); }} title={lang === 'ja' ? '複製' : 'Dup'}
                  className="text-dim text-[10px] cursor-pointer px-px leading-none"
                  onMouseOver={e => e.target.style.color = c.color} onMouseOut={e => e.target.style.color = 'rgb(var(--dim))'}>⊕</span>
                {characters.length > 1 && <span onClick={e => { e.stopPropagation(); deleteCharacter(c.id); }}
                  className="text-dim text-[10px] cursor-pointer px-px leading-none"
                  onMouseOver={e => e.target.style.color = '#f87171'} onMouseOut={e => e.target.style.color = 'rgb(var(--dim))'}>✕</span>}
              </div>
            )}
          </div>
        ))}
        <button onClick={addCharacter} className="bg-transparent border border-dashed border-muted/60 rounded-[20px] px-[11px] py-1 text-fg/65 cursor-pointer text-[11px] flex-shrink-0 whitespace-nowrap">+ {lang === 'ja' ? '新キャラ' : 'New'}</button>
        <button onClick={() => setLibraryOpen(true)}
          title={lang === 'ja' ? 'キャラクター格納庫' : 'Character Library'}
          className="bg-transparent border border-dim rounded-[20px] px-[9px] py-1 text-muted cursor-pointer text-[11px] flex-shrink-0 whitespace-nowrap">
          📚{characters.some(c => c.archived) ? ` ${characters.filter(c => c.archived).length}` : ''}
        </button>
        <div className="flex-1" />
        {characters.length > 1 && (
          <select value={compareCharId || ''} onChange={e => setCompareCharId(e.target.value || null)}
            style={{ border: `1px solid ${compareCharId ? '#fbbf2460' : 'rgb(var(--dim))'}`, color: compareCharId ? '#fbbf24' : 'rgb(var(--muted))' }}
            className="bg-surfalt rounded-[6px] px-[7px] py-1 text-[10px] cursor-pointer font-mono outline-none flex-shrink-0">
            <option value="">{lang === 'ja' ? '🆚 比較' : '🆚 Compare'}</option>
            {characters.filter(c => c.id !== activeCharId).map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        )}
        {isMobile && <button onClick={() => setCharPanelOpen(p => !p)} className="bg-transparent border border-dim rounded-[5px] text-muted cursor-pointer text-[11px] px-[9px] py-1 flex-shrink-0 whitespace-nowrap">{charPanelOpen ? '▲' : '▼'} {lang === 'ja' ? '詳細' : 'Info'}</button>}
        <div className="flex gap-[4px] flex-shrink-0">
          <button onClick={() => setMainTab('editor')}
            style={mainTab === 'editor' ? { background: activeChar?.color + '22', borderColor: activeChar?.color, color: activeChar?.color } : undefined}
            className={`rounded-[5px] px-[9px] py-1 text-[10px] font-mono cursor-pointer transition-all duration-[120ms] ${mainTab === 'editor' ? 'border font-bold' : 'border border-dim text-muted'}`}>
            🧩{isMobile ? '' : (' ' + (lang === 'ja' ? 'エディタ' : 'Editor'))}
          </button>
          <button onClick={() => setMainTab('note')}
            style={mainTab === 'note' ? { background: activeChar?.color + '22', borderColor: activeChar?.color, color: activeChar?.color } : undefined}
            className={`rounded-[5px] px-[9px] py-1 text-[10px] font-mono cursor-pointer transition-all duration-[120ms] ${mainTab === 'note' ? 'border font-bold' : 'border border-dim text-muted'}`}>
            📖{isMobile ? '' : (' ' + (lang === 'ja' ? 'キャラノート' : 'Note'))}
          </button>
        </div>
      </div>

      {/* ── COMPARE PANEL ── */}
      {compareCharId && compareChar && <ComparePanel charA={activeChar} charB={compareChar} lang={lang} onClose={() => setCompareCharId(null)} />}

      {/* ── CHARACTER PANEL (mobile: toggle, PC: compact strip always) ── */}
      {activeChar && isMobile && charPanelOpen && (
        <div className="bg-panel border-b border-line px-[14px] py-[11px]">
          <div style={{ maxWidth: contentMax }} className="mx-auto">
            <div className="flex flex-col gap-[6px] mb-[9px]">
              <div className="flex items-center gap-[6px]">
                <input value={activeChar.name} onChange={e => updateChar(activeChar.id, { name: e.target.value })}
                  style={{ background: 'rgb(var(--bg))', border: `1px solid ${activeChar.color}60`, color: 'rgb(var(--text))' }}
                  className="rounded-[7px] text-[13px] font-bold px-[10px] py-[5px] outline-none flex-1 min-w-0" />
                <button onClick={() => duplicateCharacter(activeChar.id)}
                  title={lang === 'ja' ? '複製' : 'Duplicate'}
                  className="flex-shrink-0 rounded-[6px] px-[9px] py-[5px] text-[11px] cursor-pointer font-mono border border-dim text-muted bg-transparent">⊕</button>
                {characters.length > 1 && (
                  <button onClick={() => deleteCharacter(activeChar.id)}
                    title={lang === 'ja' ? '削除' : 'Delete'}
                    className="flex-shrink-0 rounded-[6px] px-[9px] py-[5px] text-[11px] cursor-pointer font-mono border border-dim text-muted bg-transparent">✕</button>
                )}
              </div>
              <div className="flex items-center gap-[6px]">
                <div className="flex gap-[3px] items-center flex-shrink-0">
                  {CHAR_COLORS.map(col => <div key={col} onClick={() => updateChar(activeChar.id, { color: col })}
                    style={{ background: col, border: `2px solid ${activeChar.color === col ? 'white' : 'rgba(0,0,0,0.18)'}` }}
                    className="w-[15px] h-[15px] rounded-full cursor-pointer box-border transition-all duration-[120ms]" />)}
                </div>
              </div>
            </div>
            <div className="mb-[9px]">
              <div className="flex items-center justify-between mb-[3px]">
                <div className="text-muted text-[10px] font-mono tracking-[0.07em]">📝 {lang === 'ja' ? 'キャラクターメモ（LoRA・設定・コツなど）' : 'Character Memo'}</div>
                <div className="flex items-center gap-[4px]">
                  <button onClick={() => setRandomMode(m => { const n = m === 'chardesign' ? 'illust' : 'chardesign'; localStorage.setItem('loom_randomMode', n); return n; })}
                    title={randomMode === 'chardesign' ? (lang === 'ja' ? 'キャラデザモード（クリックで切替）' : 'Char.Design mode (click to switch)') : (lang === 'ja' ? 'イラストモード（クリックで切替）' : 'Illust mode (click to switch)')}
                    className="flex-shrink-0 border border-dashed rounded-[5px] px-[6px] py-[2px] cursor-pointer text-[10px] font-mono bg-transparent"
                    style={{ borderColor: 'rgb(var(--c-purple) / 0.35)', color: 'rgb(var(--muted))' }}>
                    {randomMode === 'chardesign' ? '🧍' : '🖼️'}
                  </button>
                  <button onClick={generateRandomChar}
                    className="flex-shrink-0 border border-dashed rounded-[5px] px-[7px] py-[2px] cursor-pointer text-[10px] font-mono bg-transparent"
                    style={{ borderColor: 'rgb(var(--c-purple) / 0.5)', color: 'rgb(var(--c-purple))' }}>
                    🎲 {lang === 'ja' ? 'おまかせ' : 'Random'}
                  </button>
                </div>
              </div>
              <textarea value={activeChar.memo} onChange={e => updateChar(activeChar.id, { memo: e.target.value })}
                placeholder={lang === 'ja' ? 'LoRA名、使用モデル、生成のコツなど自由にメモ...' : 'LoRA names, model, tips...'}
                style={{ background: 'rgb(var(--bg))', border: `1px solid ${activeChar.color}40`, color: 'rgb(var(--text))' }}
                className="w-full min-h-[46px] rounded-[7px] text-[12px] px-[10px] py-[7px] font-mono resize-y box-border outline-none leading-[1.6]"
                onFocus={e => e.target.style.borderColor = activeChar.color + '80'}
                onBlur={e => e.target.style.borderColor = activeChar.color + '40'} />
            </div>
            <div className="flex gap-0 mb-[5px] min-h-[28px]">
              {[
                { key: 'costumePresets', label: lang === 'ja' ? '🎀 衣装' : '🎀 Costume', blockId: 'outfit' },
                { key: 'shotPresets',    label: lang === 'ja' ? '📐 構図' : '📐 Shot',    blockId: 'composition' },
              ].map(({ key, label, blockId }, i) => (
                <div key={key} className={`flex-1 flex flex-col gap-[4px] min-w-0 ${i === 0 ? 'pr-[8px]' : 'pl-[8px] border-l border-dim'}`}>
                  <span className="text-muted text-[10px] font-mono flex-shrink-0">{label}:</span>
                  <div className="flex flex-wrap gap-[4px]">
                    {(activeChar[key] || []).length === 0
                      ? <span className="text-dim text-[10px] font-mono">{lang === 'ja' ? '（💾で保存）' : '(use 💾)'}</span>
                      : (activeChar[key] || []).map(p => (
                          <PresetChip key={p.id} preset={p} color={activeChar.color} lang={lang}
                            otherChars={characters.filter(c => c.id !== activeCharId)}
                            onLoad={() => loadPreset(blockId, p.text)} onDelete={() => deletePreset(key, p.id)}
                            onCopyTo={(tid) => copyPresetToChar(key, p, tid)} />
                        ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-[9px]">
              <div className="flex items-center gap-2 mb-[5px]">
                <span className="text-muted text-[10px] font-mono">🔗 LoRA</span>
                {(activeTool === 'sd' || activeTool === 'nai') && (activeChar.loras || []).some(l => l.name.trim()) && (
                  <span className="text-muted text-[10px] font-mono">{lang === 'ja' ? '→ 出力に自動追加中' : '→ auto-appended'}</span>
                )}
                <button onClick={addLora} style={{ color: activeChar.color, borderColor: activeChar.color + '60' }} className="ml-auto border rounded-[5px] px-[7px] py-[2px] text-[10px] cursor-pointer font-mono bg-transparent">+ LoRA</button>
              </div>
              {(activeChar.loras || []).length === 0
                ? <span className="text-dim text-[11px] font-mono">{lang === 'ja' ? '（SD/NAI使用時は出力に自動追加されます）' : '(auto-added to output for SD/NAI)'}</span>
                : (activeChar.loras || []).map(l => (
                  <div key={l.id} className="flex gap-[5px] items-center mb-[3px]">
                    <input value={l.name} onChange={e => updateLora(l.id, { name: e.target.value })}
                      placeholder={lang === 'ja' ? 'LoRA名' : 'LoRA name'}
                      style={{ border: `1px solid ${activeChar.color}40` }}
                      className="flex-1 bg-bg rounded-[5px] text-[11px] px-[7px] py-[3px] outline-none font-mono text-fg" />
                    <input value={l.weight} onChange={e => updateLora(l.id, { weight: e.target.value })}
                      type="number" step="0.05" min="0.1" max="1.5"
                      style={{ border: `1px solid ${activeChar.color}40` }}
                      className="w-[54px] bg-bg rounded-[5px] text-[11px] px-[5px] py-[3px] outline-none font-mono text-fg" />
                    <button onClick={() => deleteLora(l.id)} className="text-dim text-[11px] cursor-pointer px-1">✕</button>
                  </div>
                ))
              }
            </div>
            <CharVersions activeChar={activeChar} lang={lang} onSave={saveVersion} onRestore={restoreVersion} onDelete={deleteVersion} color={activeChar.color} />
            <div>
              <div className="flex items-center justify-between mb-[6px]">
                <span className="text-muted text-[10px] font-mono">🖼 {lang === 'ja' ? `サムネイル (${(thumbs[activeCharId] || []).length}/4)` : `Images (${(thumbs[activeCharId] || []).length}/4)`}</span>
                <button onClick={copyShareUrl}
                  style={shared ? { borderColor: goodColor + '60', color: goodColor } : undefined}
                  className="border border-dim rounded-[5px] px-[7px] py-[2px] text-dim text-[10px] cursor-pointer font-mono">
                  {shared ? `✓ ${lang === 'ja' ? 'コピー済み' : 'Copied!'}` : `🔗 ${lang === 'ja' ? 'プロンプトをシェア' : 'Share prompt'}`}
                </button>
              </div>
              <div className="flex items-center gap-[6px] flex-wrap">
                {(thumbs[activeCharId] || []).map((img, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={img} alt={`thumb-${i}`} onClick={() => setThumbPreview(img)} className="w-[52px] h-[52px] rounded-[6px] object-cover border border-line cursor-pointer hover:opacity-85 transition-opacity" />
                    <button onClick={() => removeThumbAt(i)}
                      className="absolute -top-[5px] -right-[5px] bg-surface border border-dim rounded-full w-[15px] h-[15px] text-[8px] flex items-center justify-center cursor-pointer text-muted leading-none">✕</button>
                  </div>
                ))}
                {(thumbs[activeCharId] || []).length < 4 && (
                  <label style={{ borderColor: activeChar.color + '50', color: activeChar.color }}
                    className="w-[52px] h-[52px] border border-dashed rounded-[6px] flex items-center justify-center text-[18px] cursor-pointer flex-shrink-0">
                    +
                    <input type="file" accept=".jpg,.jpeg,.png" onChange={handleThumbUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHARACTER PANEL (PC: compact strip always + collapsible detail) ── */}
      {activeChar && !isMobile && (
        <div className="bg-panel border-b border-line px-[14px] py-[7px]">
          <div style={{ maxWidth: contentMax }} className="mx-auto">
            {/* Compact 1-line strip */}
            <div className="flex items-center gap-[9px]">
              <input value={activeChar.name} onChange={e => updateChar(activeChar.id, { name: e.target.value })}
                style={{ background: 'rgb(var(--bg))', border: `1px solid ${activeChar.color}60`, color: 'rgb(var(--text))' }}
                className="rounded-[7px] text-[13px] font-bold px-[10px] py-[4px] outline-none min-w-[90px] max-w-[150px]" />
              <div className="flex gap-[3px] items-center flex-shrink-0">
                {CHAR_COLORS.map(col => <div key={col} onClick={() => updateChar(activeChar.id, { color: col })}
                  style={{ background: col, border: `2px solid ${activeChar.color === col ? 'white' : 'rgba(0,0,0,0.18)'}` }}
                  className="w-[14px] h-[14px] rounded-full cursor-pointer box-border transition-all duration-[120ms]" />)}
              </div>
              <div className="w-px h-[12px] bg-dim flex-shrink-0" />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(11, auto)', gap:'2px' }}>
                {CHAR_EMOJIS.map(em => <span key={em} onClick={() => updateChar(activeChar.id, { emoji: em })}
                  style={{ background: activeChar.emoji === em ? activeChar.color + '30' : 'transparent' }}
                  className="text-[12px] cursor-pointer p-[1px] leading-none rounded-[3px] text-center">{em}</span>)}
              </div>
              <div className="flex-1" />
              <button onClick={() => setRandomMode(m => { const n = m === 'chardesign' ? 'illust' : 'chardesign'; localStorage.setItem('loom_randomMode', n); return n; })}
                title={randomMode === 'chardesign' ? (lang === 'ja' ? 'キャラデザモード（クリックでイラストモードへ）' : 'Char.Design mode (click for Illust)') : (lang === 'ja' ? 'イラストモード（クリックでキャラデザモードへ）' : 'Illust mode (click for Char.Design)')}
                className="flex-shrink-0 border border-dashed rounded-[5px] px-[7px] py-[3px] cursor-pointer text-[10px] font-mono bg-transparent"
                style={{ borderColor: 'rgb(var(--c-purple) / 0.35)', color: 'rgb(var(--muted))' }}>
                {randomMode === 'chardesign' ? '🧍' : '🖼️'}
              </button>
              <button onClick={generateRandomChar} title={lang === 'ja' ? (randomMode === 'chardesign' ? 'キャラデザモードでランダム生成' : 'イラストモードでランダム生成') : (randomMode === 'chardesign' ? 'Random (Char.Design)' : 'Random (Illust)')}
                className="flex-shrink-0 border border-dashed rounded-[5px] px-[8px] py-[3px] cursor-pointer text-[10px] font-mono bg-transparent"
                style={{ borderColor: 'rgb(var(--c-purple) / 0.5)', color: 'rgb(var(--c-purple))' }}>
                🎲 {lang === 'ja' ? 'おまかせ' : 'Random'}
              </button>
              <button onClick={() => setCharPanelOpen(p => !p)}
                className="flex-shrink-0 border border-dim rounded-[5px] px-[8px] py-[3px] text-muted cursor-pointer text-[10px] font-mono whitespace-nowrap">
                {charPanelOpen ? `▲ ${lang === 'ja' ? '閉じる' : 'Close'}` : `⚙ ${lang === 'ja' ? '詳細' : 'Details'}`}
              </button>
            </div>

            {/* Detail section */}
            {charPanelOpen && (
              <div className="mt-[10px] pt-[10px] border-t border-line">
                {/* Memo */}
                <div className="mb-[9px]">
                  <div className="text-muted text-[10px] font-mono tracking-[0.07em] mb-[3px]">📝 {lang === 'ja' ? 'キャラクターメモ（LoRA・設定・コツなど）' : 'Character Memo'}</div>
                  <textarea value={activeChar.memo} onChange={e => updateChar(activeChar.id, { memo: e.target.value })}
                    placeholder={lang === 'ja' ? 'LoRA名、使用モデル、生成のコツなど自由にメモ...' : 'LoRA names, model, tips...'}
                    style={{ background: 'rgb(var(--bg))', border: `1px solid ${activeChar.color}40`, color: 'rgb(var(--text))' }}
                    className="w-full min-h-[38px] rounded-[7px] text-[12px] px-[10px] py-[6px] font-mono resize-y box-border outline-none leading-[1.6]"
                    onFocus={e => e.target.style.borderColor = activeChar.color + '80'}
                    onBlur={e => e.target.style.borderColor = activeChar.color + '40'} />
                </div>
                {/* Preset row */}
                <div className="flex gap-0 mb-[9px] min-h-[28px]">
                  {[
                    { key: 'costumePresets', label: lang === 'ja' ? '🎀 衣装' : '🎀 Costume', blockId: 'outfit' },
                    { key: 'shotPresets',    label: lang === 'ja' ? '📐 構図' : '📐 Shot',    blockId: 'composition' },
                  ].map(({ key, label, blockId }, i) => (
                    <div key={key} className={`flex-1 flex flex-col gap-[4px] min-w-0 ${i === 0 ? 'pr-[8px]' : 'pl-[8px] border-l border-dim'}`}>
                      <span className="text-muted text-[10px] font-mono flex-shrink-0">{label}:</span>
                      <div className="flex flex-wrap gap-[4px]">
                        {(activeChar[key] || []).length === 0
                          ? <span className="text-dim text-[10px] font-mono">{lang === 'ja' ? '（💾で保存）' : '(use 💾)'}</span>
                          : (activeChar[key] || []).map(p => (
                              <PresetChip key={p.id} preset={p} color={activeChar.color} lang={lang}
                                otherChars={characters.filter(c => c.id !== activeCharId)}
                                onLoad={() => loadPreset(blockId, p.text)} onDelete={() => deletePreset(key, p.id)}
                                onCopyTo={(tid) => copyPresetToChar(key, p, tid)} />
                            ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* LoRA / Versions / Thumbnails in 3-col grid */}
                <div className="grid grid-cols-3 gap-[16px]">
                  <div>
                    <div className="flex items-center gap-2 mb-[5px]">
                      <span className="text-muted text-[10px] font-mono">🔗 LoRA</span>
                      {(activeTool === 'sd' || activeTool === 'nai') && (activeChar.loras || []).some(l => l.name.trim()) && (
                        <span className="text-muted text-[9px] font-mono">{lang === 'ja' ? '→ 出力追加中' : '→ appended'}</span>
                      )}
                      <button onClick={addLora} style={{ color: activeChar.color, borderColor: activeChar.color + '60' }} className="ml-auto border rounded-[5px] px-[7px] py-[2px] text-[10px] cursor-pointer font-mono bg-transparent">+ LoRA</button>
                    </div>
                    {(activeChar.loras || []).length === 0
                      ? <span className="text-dim text-[10px] font-mono">{lang === 'ja' ? 'SD/NAI用（出力に自動追加）' : 'SD/NAI: auto-appended'}</span>
                      : (activeChar.loras || []).map(l => (
                        <div key={l.id} className="flex gap-[5px] items-center mb-[3px]">
                          <input value={l.name} onChange={e => updateLora(l.id, { name: e.target.value })}
                            placeholder={lang === 'ja' ? 'LoRA名' : 'LoRA name'}
                            style={{ border: `1px solid ${activeChar.color}40` }}
                            className="flex-1 bg-bg rounded-[5px] text-[11px] px-[7px] py-[3px] outline-none font-mono text-fg min-w-0" />
                          <input value={l.weight} onChange={e => updateLora(l.id, { weight: e.target.value })}
                            type="number" step="0.05" min="0.1" max="1.5"
                            style={{ border: `1px solid ${activeChar.color}40` }}
                            className="w-[54px] bg-bg rounded-[5px] text-[11px] px-[5px] py-[3px] outline-none font-mono text-fg flex-shrink-0" />
                          <button onClick={() => deleteLora(l.id)} className="text-dim text-[11px] cursor-pointer px-1 flex-shrink-0">✕</button>
                        </div>
                      ))
                    }
                  </div>
                  <div>
                    <CharVersions activeChar={activeChar} lang={lang} onSave={saveVersion} onRestore={restoreVersion} onDelete={deleteVersion} color={activeChar.color} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-[5px]">
                      <span className="text-muted text-[10px] font-mono">🖼 {lang === 'ja' ? `サムネイル (${(thumbs[activeCharId] || []).length}/4)` : `Images (${(thumbs[activeCharId] || []).length}/4)`}</span>
                      <button onClick={copyShareUrl}
                        style={shared ? { borderColor: goodColor + '60', color: goodColor } : undefined}
                        className="border border-dim rounded-[5px] px-[7px] py-[2px] text-dim text-[10px] cursor-pointer font-mono">
                        {shared ? `✓ ${lang === 'ja' ? 'コピー済み' : 'Copied!'}` : `🔗 ${lang === 'ja' ? 'プロンプトをシェア' : 'Share prompt'}`}
                      </button>
                    </div>
                    {(() => {
                      const thumbCount = (thumbs[activeCharId] || []).length;
                      return (
                        <div
                          className="flex items-center gap-[5px] flex-wrap rounded-[7px] transition-all duration-150"
                          style={thumbDragOver && thumbCount < 4 ? { outline: `2px dashed ${activeChar.color}90`, background: activeChar.color + '0d', padding: '4px', margin: '-4px' } : undefined}
                          onDragOver={thumbCount < 4 ? e => { e.preventDefault(); setThumbDragOver(true); } : undefined}
                          onDragLeave={() => setThumbDragOver(false)}
                          onDrop={thumbCount < 4 ? handleThumbDrop : undefined}
                        >
                          {(thumbs[activeCharId] || []).map((img, i) => (
                            <div key={i} className="relative flex-shrink-0">
                              <img src={img} alt={`thumb-${i}`} onClick={() => setThumbPreview(img)} className="w-[48px] h-[48px] rounded-[6px] object-cover border border-line cursor-pointer hover:opacity-85 transition-opacity" />
                              <button onClick={() => removeThumbAt(i)}
                                className="absolute -top-[5px] -right-[5px] bg-surface border border-dim rounded-full w-[15px] h-[15px] text-[8px] flex items-center justify-center cursor-pointer text-muted leading-none">✕</button>
                            </div>
                          ))}
                          {thumbCount < 4 && (
                            <label
                              style={{
                                borderColor: thumbDragOver ? activeChar.color : activeChar.color + '50',
                                color: activeChar.color,
                                background: thumbDragOver ? activeChar.color + '18' : undefined,
                              }}
                              title={lang === 'ja' ? '画像をドラッグ＆ドロップ、またはクリックして選択（JPG/PNG）' : 'Drag & drop or click to select (JPG/PNG)'}
                              className="w-[48px] h-[48px] border border-dashed rounded-[6px] flex items-center justify-center text-[20px] cursor-pointer flex-shrink-0 transition-all duration-150"
                            >
                              {thumbDragOver ? '↓' : '+'}
                              <input type="file" accept=".jpg,.jpeg,.png" onChange={handleThumbUpload} className="hidden" />
                            </label>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CHARACTER NOTE ── */}
      {mainTab === 'note' && activeChar && (
        <CharacterNote
          char={activeChar}
          lang={lang}
          activeTool={activeTool}
          posText={finalPosText}
          negText={negText}
          onUpdateChar={upd => updateChar(activeCharId, upd)}
          onRestoreBlocks={savedBlocks => { updateChar(activeCharId, { blocks: mergeCharacterBlocks(savedBlocks) }); setMainTab('editor'); }}
        />
      )}

      {/* ── BLOCKS ── */}
      {mainTab === 'editor' && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleBlocks.map(b => b.id)} strategy={rectSortingStrategy}>
            {(() => {
              const focusBlock = focusBlockId ? visibleBlocks.find(b => b.id === focusBlockId) : null;
              const otherChars = characters.filter(c => c.id !== activeCharId);
              const renderCard = (block, idx, isFocusMode = false) => (
                <BlockCard key={block.id} block={block} lang={lang} orderNum={idx + 1}
                  onUpdate={upd => handleBlockUpdate(block.id, upd)}
                  onMove={dir => moveBlock(block.id, dir)}
                  isFirst={idx === 0} isLast={idx === visibleBlocks.length - 1}
                  onSavePreset={block.isPresetBlock ? (name, text) => savePreset(block.id, block.presetKey, name, text) : undefined}
                  onFocus={() => setFocusBlockId(focusBlockId === block.id ? null : block.id)}
                  focused={focusBlockId === block.id}
                  otherChars={isMobile ? [] : otherChars}
                  onTransfer={(blockId, targetCharId) => transferBlock(blockId, targetCharId)}
                  conflictTags={conflictingTagSet}
                  onRemove={block.isCustomBlock ? () => removeBlock(block.id) : undefined}
                  onHide={expertMode ? () => toggleHideBlock(block.id) : undefined}
                  isMobile={isMobile}
                  focusMode={isFocusMode}
                  isCompact={effLayout === '3col' && !focusBlockId}
                  sceneActive={sceneOpen}
                  analyzeText={analyzeText}
                  allBlocks={blocks}
                  onUndoBackup={templateUndoBuf?.blockTexts[block.id] !== undefined ? () => undoSingleBlock(block.id) : undefined}
                  isLight={theme === 'light'} />
              );

              if (isWide && focusBlock) {
                const focusIdx = visibleBlocks.findIndex(b => b.id === focusBlockId);
                const focusTagMapRows = (activeChar.tagMap || []).filter(r => r.targetBlock === focusBlockId);
                const insertTagMapRow = row => {
                  const tags = splitTags(row.promptTags);
                  if (tags.length === 0) return;
                  const target = visibleBlocks.find(b => b.id === row.targetBlock);
                  if (!target) return;
                  let text = target.text;
                  for (const tag of tags) text = appendTag(text, tag, target.strength || '1.0');
                  handleBlockUpdate(target.id, { text });
                };
                return (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-[248] bg-black/60 backdrop-blur-[2px]" onClick={() => setFocusBlockId(null)} />
                    {/* 3-pane modal */}
                    <div className="fixed inset-0 z-[249] flex items-start justify-center pt-[12px] px-4 pb-4 pointer-events-none">
                      <div className="w-full max-w-[72rem] flex gap-3 items-start pointer-events-auto" style={{ maxHeight: 'calc(100vh - 24px)' }}>
                        {/* Left: BlockCard */}
                        <div className="flex-1 min-w-0 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 24px)' }}>
                          <div className="mb-2 flex items-center gap-2 flex-shrink-0">
                            <span style={{ background: focusBlock.color + '22', border: `1px solid ${focusBlock.color}80`, color: focusBlock.color, textShadow: '0 0 8px currentColor' }} className="text-[12px] font-mono font-bold px-[10px] py-[3px] rounded-full tracking-[0.08em]">
                              🔍 {lang === 'ja' ? '集中編集モード' : 'FOCUS MODE'}
                            </span>
                            <button onClick={() => setFocusBlockId(null)}
                              style={{ borderColor: focusBlock.color + '60', color: focusBlock.color }}
                              className="ml-auto border rounded-[5px] px-[9px] py-[3px] text-[11px] font-mono font-semibold cursor-pointer bg-transparent">
                              {lang === 'ja' ? '閉じる' : 'Close'} ✕
                            </button>
                          </div>
                          <div className="overflow-y-auto flex-1">{renderCard(focusBlock, focusIdx, true)}</div>
                        </div>

                        {/* Center: mini TagMap for this block */}
                        {focusTagMapRows.length > 0 && (
                          <div className="w-[210px] flex-shrink-0 flex flex-col" style={{ maxHeight: 'calc(100vh - 24px)' }}>
                            <div className="text-muted text-[9px] font-mono mb-2 tracking-[0.06em] flex-shrink-0">
                              🔗 {lang === 'ja' ? 'タグ対応表' : 'Tag Map'}
                            </div>
                            <div className="overflow-y-auto flex-1">
                              {focusTagMapRows.map(row => (
                                <div key={row.id} className="bg-surface border border-line rounded-[7px] px-[9px] py-[7px] mb-[5px]">
                                  <div className="text-fg text-[10px] font-mono font-semibold mb-[4px] truncate">{row.label}</div>
                                  <div className="text-prompt text-[9px] font-mono break-all leading-[1.4] mb-[6px] opacity-80">{row.promptTags}</div>
                                  {row.notes && <div className="text-dim text-[9px] font-mono mb-[5px] leading-tight">{row.notes}</div>}
                                  <button onClick={() => insertTagMapRow(row)}
                                    style={{ borderColor: activeChar.color + '60', color: activeChar.color }}
                                    className="border rounded-[4px] px-[7px] py-[2px] text-[9px] font-mono font-bold cursor-pointer bg-transparent">
                                    → {lang === 'ja' ? '挿入' : 'Insert'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Right: block navigation */}
                        <div className="w-[170px] flex-shrink-0 flex flex-col" style={{ maxHeight: 'calc(100vh - 24px)' }}>
                          <div className="text-muted text-[9px] font-mono mb-2 tracking-[0.06em] flex-shrink-0">{lang === 'ja' ? '他のブロック' : 'Other blocks'}</div>
                          <div className="flex-1 flex flex-col justify-between gap-[3px]">
                            {visibleBlocks.filter(b => b.id !== focusBlockId).map(b => {
                              const num = visibleBlocks.findIndex(x => x.id === b.id) + 1;
                              return (
                                <div key={b.id} onClick={() => setFocusBlockId(b.id)}
                                  style={{ borderLeft: `3px solid ${b.enabled !== false ? b.color : 'rgb(var(--dim))'}`, opacity: b.enabled === false ? 0.5 : 1 }}
                                  className="bg-surface border border-line flex items-center gap-[6px] rounded-[6px] px-[7px] py-[5px] cursor-pointer transition-all duration-[120ms]"
                                  onMouseOver={e => e.currentTarget.style.background = 'rgb(var(--surface-alt))'}
                                  onMouseOut={e => e.currentTarget.style.background = 'rgb(var(--surface))'}>
                                  <span style={{ background: b.color + '22', border: `1px solid ${b.color}60`, color: b.color }} className="min-w-[16px] h-[16px] rounded-full text-[9px] font-bold flex items-center justify-center font-mono flex-shrink-0">{num}</span>
                                  <span className="text-[11px]">{b.icon}</span>
                                  <span className="text-fg text-[10px] font-semibold truncate flex-1">{lang === 'ja' ? b.name : b.nameEn}</span>
                                  {b.text && <span style={{ color: b.color + '99' }} className="text-[9px] font-mono flex-shrink-0">{countTags(b.text)}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              }

              if (isWide && effLayout === '3col') {
                const cols = [[], [], []];
                visibleBlocks.forEach((b, i) => cols[i % 3].push([b, i]));
                return (
                  <div className="max-w-[58.33rem] mx-auto px-[14px] py-[13px] flex gap-3 items-start">
                    {cols.map((col, ci) => (
                      <div key={ci} className="flex-1 min-w-0">{col.map(([b, i]) => renderCard(b, i))}</div>
                    ))}
                  </div>
                );
              }

              if (isWide && effLayout === '2col') {
                const col1 = [], col2 = [];
                visibleBlocks.forEach((b, i) => (i % 2 === 0 ? col1 : col2).push([b, i]));
                return (
                  <div className="max-w-[58.33rem] mx-auto px-[14px] py-[13px] flex gap-3 items-start">
                    <div className="flex-1 min-w-0">{col1.map(([b, i]) => renderCard(b, i))}</div>
                    <div className="flex-1 min-w-0">{col2.map(([b, i]) => renderCard(b, i))}</div>
                  </div>
                );
              }

              return (
                <div className="max-w-[58.33rem] mx-auto px-[14px] py-[13px]">
                  {visibleBlocks.map((b, i) => renderCard(b, i))}
                </div>
              );
            })()}
          </SortableContext>
        </DndContext>
      )}

      {/* ── Mobile focus mode fullscreen overlay ── */}
      {isMobile && focusBlockId && mainTab === 'editor' && (() => {
        const mFocusBlock = visibleBlocks.find(b => b.id === focusBlockId);
        if (!mFocusBlock) return null;
        const mFocusIdx = visibleBlocks.findIndex(b => b.id === focusBlockId);
        return (
          <div className="fixed inset-0 z-[260] bg-bg overflow-y-auto">
            <div className="px-[14px] py-[12px]">
              <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                <span className="text-fg text-[12px] font-bold font-mono">🔍 {lang === 'ja' ? '集中編集' : 'Focus'}</span>
                <span className="text-muted text-[10px] font-mono">{mFocusBlock.icon} {lang === 'ja' ? mFocusBlock.name : mFocusBlock.nameEn}</span>
                <button onClick={() => setFocusBlockId(null)}
                  className="ml-auto bg-transparent border border-dim rounded-[6px] px-[10px] py-[4px] text-[11px] font-mono text-muted cursor-pointer">
                  ✕ {lang === 'ja' ? '閉じる' : 'Close'}
                </button>
              </div>
              <BlockCard block={mFocusBlock} lang={lang} orderNum={mFocusIdx + 1}
                onUpdate={upd => handleBlockUpdate(mFocusBlock.id, upd)}
                onMove={dir => moveBlock(mFocusBlock.id, dir)}
                isFirst={mFocusIdx === 0} isLast={mFocusIdx === visibleBlocks.length - 1}
                onFocus={undefined}
                focused={true}
                otherChars={[]}
                onTransfer={undefined}
                conflictTags={conflictingTagSet}
                onRemove={mFocusBlock.isCustomBlock ? () => { removeBlock(mFocusBlock.id); setFocusBlockId(null); } : undefined}
                onHide={undefined}
                isMobile={true}
                focusMode={true}
                isCompact={false}
                sceneActive={sceneOpen}
                analyzeText={analyzeText}
                allBlocks={blocks}
                isLight={theme === 'light'} />
            </div>
          </div>
        );
      })()}

      {/* ── Mobile sidebar drawer — opened by LOOM logo icon ── */}
      {isMobile && jumpOpen && (
        <>
          <div className="fixed inset-0 z-[200] bg-black/50" onClick={() => setJumpOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 z-[201] w-[220px] bg-surface border-r border-line flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line flex-shrink-0">
              <span className="text-[12px] font-bold text-fg font-mono">
                {lang === 'ja' ? 'ブロック一覧' : 'Blocks'}
              </span>
              <button onClick={() => setJumpOpen(false)} className="text-muted text-[18px] cursor-pointer bg-transparent border-none leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {visibleBlocks.map(b => {
                if (b.isCustomBlock) {
                  const handleCustomTap = () => {
                    const now = Date.now();
                    const last = sidebarLastTapRef.current[b.id] || 0;
                    if (now - last < 350 && last !== 0) {
                      sidebarLastTapRef.current[b.id] = 0;
                      const msg = lang === 'ja'
                        ? `"${b.name}" を非表示にしますか？\n※ ⚙️ 設定 → 使い方Tipsタブから再表示できます。`
                        : `Hide "${b.name}"?\n※ To restore, open ⚙️ Settings → Tips tab.`;
                      if (window.confirm(msg)) {
                        toggleHideBlock(b.id);
                        setJumpOpen(false);
                      }
                    } else {
                      sidebarLastTapRef.current[b.id] = now;
                      const savedTs = now;
                      setTimeout(() => {
                        if (sidebarLastTapRef.current[b.id] === savedTs) {
                          const newName = window.prompt(
                            lang === 'ja' ? '新しいブロック名を入力してください' : 'Enter new block name',
                            b.name
                          );
                          if (newName?.trim()) {
                            const trimmed = newName.trim().slice(0, 20);
                            updateBlock(b.id, { name: trimmed, nameEn: trimmed });
                          }
                        }
                      }, 350);
                    }
                  };
                  return (
                    <button
                      key={b.id}
                      onClick={handleCustomTap}
                      className="w-full flex items-center gap-[8px] px-3 py-[10px] text-left cursor-pointer bg-transparent border-b border-line last:border-b-0"
                      style={{ borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: b.enabled !== false ? b.color : 'rgb(var(--dim))' }}
                    >
                      <span className="text-[14px] flex-shrink-0">{b.icon}</span>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="text-[11px] font-mono truncate" style={{ color: b.enabled !== false ? 'rgb(var(--text))' : 'rgb(var(--muted))' }}>
                          {b.name}
                        </span>
                        <span className="text-[8px] font-mono text-dim leading-none mt-[2px]">
                          {lang === 'ja' ? 'タップ:名前変更 · 2回:非表示' : 'Tap:rename · 2×:hide'}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-dim flex-shrink-0">✎</span>
                      {b.text && (
                        <span className="text-[9px] font-mono font-bold flex-shrink-0" style={{ color: b.color }}>
                          {countTags(b.text)}t
                        </span>
                      )}
                    </button>
                  );
                }
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      document.getElementById(`block-${b.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      setJumpOpen(false);
                    }}
                    className="w-full flex items-center gap-[8px] px-3 py-[10px] text-left cursor-pointer bg-transparent border-b border-line last:border-b-0"
                    style={{ borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: b.enabled !== false ? b.color : 'rgb(var(--dim))' }}
                  >
                    <span className="text-[14px] flex-shrink-0">{b.icon}</span>
                    <span className="text-[11px] font-mono flex-1 truncate" style={{ color: b.enabled !== false ? 'rgb(var(--text))' : 'rgb(var(--muted))' }}>
                      {lang === 'ja' ? b.name : b.nameEn}
                    </span>
                    {b.text && (
                      <span className="text-[9px] font-mono font-bold flex-shrink-0" style={{ color: b.color }}>
                        {countTags(b.text)}t
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Add custom block button — expert mode only */}
            {expertMode && blocks.filter(b => b.isCustomBlock).length < 3 && (
              <div className="flex-shrink-0 border-t border-line p-2">
                <button
                  onClick={() => { addCustomBlock(); setJumpOpen(false); }}
                  className="w-full rounded-[7px] py-[8px] text-[11px] font-mono cursor-pointer border border-dashed flex items-center justify-center gap-[5px]"
                  style={{ borderColor: 'rgb(var(--dim))', color: 'rgb(var(--muted))', background: 'transparent' }}
                >
                  ＋ {lang === 'ja' ? 'カスタムブロック追加' : 'Add custom block'}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── OUTPUT BAR ── */}
      {mainTab === 'note' ? null : /* output bar shown only in editor mode */
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] bg-surface border-t-2 border-output-border shadow-[0_-8px_32px_rgba(0,0,0,0.5)] flex flex-col"
        style={{ height: outputExpanded ? outputHeight : undefined }}
      >
        {/* Drag handle — visible only when expanded */}
        {outputExpanded && (
          <div
            onMouseDown={startOutputDrag}
            onTouchStart={startOutputDrag}
            className="flex-shrink-0 h-[14px] flex items-center justify-center cursor-ns-resize group select-none"
            style={{ touchAction: 'none' }}
            title={lang === 'ja' ? 'ドラッグで高さ調整' : 'Drag to resize'}
          >
            <div className="w-10 h-[3px] rounded-full bg-dim group-hover:bg-muted transition-colors duration-150" />
          </div>
        )}
        <div style={{ maxWidth: contentMax }} className="mx-auto px-[14px] pb-2 pt-1 flex flex-col flex-1 min-h-0 w-full overflow-hidden">

          {/* ── Output controls: Tool + Tabs + Actions ── */}
          {isMobile ? (
            <>
              {/* Mobile Row 1: Tool picker + Tab buttons */}
              <div className="flex-shrink-0 flex items-center gap-[5px] mb-[5px]">
                <div className="relative flex-shrink-0">
                  <button onClick={() => setToolPickerOpen(p => !p)} title={lang === 'ja' ? tool.note : tool.noteEn}
                    className="flex items-center gap-[4px] rounded-[6px] px-[8px] py-[4px] text-[11px] font-mono font-bold cursor-pointer whitespace-nowrap"
                    style={{ background: 'rgb(var(--tint-accent))', border: '1px solid rgb(var(--c-blue) / 0.35)', color: 'rgb(var(--c-blue-s))' }}>
                    {tool.icon} {lang === 'ja' ? tool.name : tool.nameEn}<span className="text-[9px] opacity-40 ml-[2px]">▾</span>
                  </button>
                  {toolPickerOpen && (
                    <>
                      <div className="fixed inset-0 z-[149]" onClick={() => setToolPickerOpen(false)} />
                      <div className="absolute left-0 top-full mt-[4px] z-[150] bg-surface border border-line rounded-[9px] shadow-xl py-[4px] min-w-[220px]">
                        {TOOLS.map(t => (
                          <button key={t.id} onClick={() => { setActiveTool(t.id); setEditingSuffix(false); setToolPickerOpen(false); }}
                            className="w-full text-left px-[12px] py-[7px] text-[11px] font-mono cursor-pointer hover:bg-surfalt flex items-center gap-2"
                            style={{ color: activeTool === t.id ? 'rgb(var(--c-blue-s))' : 'rgb(var(--text) / 0.8)' }}>
                            <span className="w-4 text-center text-[10px]">{activeTool === t.id ? '✓' : ''}</span>
                            <span className="flex-1">{t.icon} {t.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {[{ id: 'positive', label: '✦ Pos', col: 'rgb(var(--c-blue))', bg: 'rgb(var(--c-blue) / 0.12)', bd: 'rgb(var(--c-blue) / 0.5)' }, { id: 'negative', label: '✕ Neg', col: 'rgb(var(--c-red))', bg: 'rgb(var(--c-red) / 0.12)', bd: 'rgb(var(--c-red) / 0.5)' }, { id: 'natural', label: lang === 'ja' ? '✎ 文' : '✎ Nat', col: 'rgb(var(--c-green))', bg: 'rgb(var(--c-green) / 0.12)', bd: 'rgb(var(--c-green) / 0.5)' }].map(tab => (
                  <button key={tab.id} onClick={() => { setOutputTab(tab.id); setOutputEditMode(false); }}
                    style={{ background: outputTab === tab.id ? tab.bg : 'transparent', border: `1px solid ${outputTab === tab.id ? tab.bd : 'rgb(var(--dim))'}`, color: outputTab === tab.id ? tab.col : 'rgb(var(--muted))', fontWeight: outputTab === tab.id ? 700 : 400 }}
                    className="rounded-[6px] px-[9px] py-[3px] text-[11px] cursor-pointer font-mono transition-all duration-[120ms] flex-shrink-0 whitespace-nowrap">
                    {tab.label}
                  </button>
                ))}
                {outputTab === 'natural' && (
                  <>
                    <button onClick={() => setNaturalLang(l => l === 'ja' ? 'en' : 'ja')}
                      className="rounded-[6px] px-[6px] py-[3px] text-[10px] font-mono cursor-pointer flex-shrink-0"
                      style={{ background: 'rgb(var(--c-green) / 0.1)', border: '1px solid rgb(var(--c-green) / 0.35)', color: 'rgb(var(--c-green))' }}>
                      {naturalLang === 'ja' ? 'JA' : 'EN'}
                    </button>
                    {apiConfig.apiKey && (
                      aiBusy
                        ? <span className="text-[10px] font-mono text-muted flex-shrink-0">✨...</span>
                        : <button onClick={handleAiPolish} disabled={!naturalText}
                            className="rounded-[6px] px-[7px] py-[3px] text-[10px] font-mono cursor-pointer flex-shrink-0 disabled:opacity-40"
                            style={{ background: 'rgb(var(--c-purple) / 0.1)', border: '1px solid rgb(var(--c-purple) / 0.4)', color: 'rgb(var(--c-purple))' }}
                            title={lang === 'ja' ? '再生成' : 'Regenerate'}>🔄</button>
                    )}
                    {aiResult && (
                      <button onClick={() => setAiResult('')}
                        className="rounded-[6px] px-[6px] py-[3px] text-[10px] font-mono cursor-pointer flex-shrink-0 text-muted border border-dim bg-transparent"
                        title={lang === 'ja' ? 'AIテキストをクリア' : 'Clear AI text'}>✕</button>
                    )}
                  </>
                )}
              </div>
              {/* Mobile Row 2: Action buttons — PC order: ▼ 📸 🗑 ✏️ | flex-1 | token | COPY */}
              <div className={`flex-shrink-0 flex items-center gap-[5px] ${outputExpanded ? 'mb-[6px]' : 'mb-0'}`}>
                <button onClick={() => setOutputExpanded(p => !p)}
                  className="bg-transparent border border-dim rounded-[6px] text-muted cursor-pointer text-[11px] px-[7px] py-[5px]">{outputExpanded ? '▼' : '▲'}</button>
                <button onClick={handleSnapshot} disabled={!posText} title={lang === 'ja' ? 'スナップショット（履歴に手動保存）' : 'Snapshot'}
                  style={{ background: snapped ? '#fbbf2415' : 'none', border: `1px solid ${snapped ? '#fbbf2460' : 'rgb(var(--dim))'}` }}
                  className={`rounded-[6px] px-[9px] py-[5px] text-[12px] inline-flex items-center justify-center leading-none transition-all duration-200 ${snapped ? 'text-warn' : 'text-muted'} ${posText ? 'cursor-pointer' : 'cursor-default'}`}>📸</button>
                <button onClick={handleResetAll} title={lang === 'ja' ? 'プロンプトをすべてリセット' : 'Reset all'}
                  className="rounded-[6px] px-[9px] py-[5px] text-[11px] cursor-pointer font-mono border border-dim text-muted"
                  onMouseOver={e => { e.currentTarget.style.borderColor = dangerColor + '80'; e.currentTarget.style.color = dangerColor; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}>🗑</button>
                {outputTab !== 'natural' && (
                  <button onClick={() => { if (!outputEditMode) { if (!outputEditText) setOutputEditText(currentText); setOutputEditMode(true); setOutputExpanded(true); } else { setOutputEditMode(false); } }}
                    disabled={!currentText} title={lang === 'ja' ? 'コピー前に手直し' : 'Edit before copy'}
                    style={{ background: outputEditMode ? '#fbbf2422' : 'none', border: `1px solid ${outputEditMode ? '#fbbf2460' : 'rgb(var(--dim))'}`, color: outputEditMode ? '#fbbf24' : 'rgb(var(--muted))' }}
                    className="rounded-[6px] px-[9px] py-[5px] text-[11px] transition-all duration-200 cursor-pointer disabled:cursor-default font-mono">✏️</button>
                )}
                {/* Mobile MJ AR chips */}
                {activeTool === 'mj' && outputTab !== 'natural' && (() => {
                  const sfxVal = toolSuffixes[activeTool] || '';
                  const currentAr = sfxVal.match(/--ar\s+(\S+)/)?.[1] ?? null;
                  const applyAr = (ratio) => {
                    const replaced = sfxVal.replace(/--ar\s+\S+/, `--ar ${ratio}`).trim();
                    const next = replaced.includes('--ar') ? replaced : (sfxVal ? `${sfxVal} --ar ${ratio}` : `--ar ${ratio}`);
                    setToolSuffixes(prev => ({ ...prev, [activeTool]: next }));
                  };
                  return (
                    <div className="flex flex-shrink-0 rounded-[6px] overflow-hidden border border-dim">
                      {['1:1', '3:2', '16:9', '9:16'].map(r => (
                        <button key={r} onClick={() => applyAr(r)}
                          className="bg-transparent border-r border-dim last:border-r-0 px-[6px] py-[3px] text-[9px] font-mono cursor-pointer whitespace-nowrap transition-colors duration-100"
                          style={{ background: currentAr === r ? 'rgb(var(--c-blue) / 0.15)' : 'transparent', color: currentAr === r ? 'rgb(var(--c-blue))' : 'rgb(var(--muted))' }}>
                          {r}
                        </button>
                      ))}
                    </div>
                  );
                })()}
                <div className="flex-1" />
                {outputTab !== 'natural' && tagCount > 0 && (
                  <span style={{ color: tokenColor, background: tokenColor + '15', border: `1px solid ${tokenColor}40` }}
                    className="text-[10px] font-mono px-[6px] py-[3px] rounded-[4px] whitespace-nowrap">
                    {tagCount}t·{textToCopy.length}
                  </span>
                )}
                <button onClick={handleCopy} disabled={!textToCopy}
                  style={{ background: copied ? goodColor + '20' : textToCopy ? 'linear-gradient(135deg,#4a6fff,#8a4fff)' : 'rgb(var(--dim))', border: `1px solid ${copied ? goodColor + '60' : 'transparent'}`, color: copied ? goodColor : textToCopy ? 'white' : 'rgb(var(--muted))', cursor: textToCopy ? 'pointer' : 'default', letterSpacing: '0.04em' }}
                  className="rounded-[8px] px-[16px] py-[6px] text-[12px] font-bold transition-all duration-200 min-w-[76px]">
                  {copied ? '✓' : '📋 COPY'}
                </button>
              </div>
            </>
          ) : (
            /* PC: 2-row layout */
            <div className="flex-shrink-0 flex flex-col gap-[5px]">
              {/* Row 1: Tool | │ | ポジティブ ネガティブ 自然文 [JA/EN] | flex-1 | 🎲バリエ | ◎解析 */}
              <div className="flex items-center gap-[6px]">
                {/* Tool picker */}
                <div className="relative flex-shrink-0">
                  <button onClick={() => setToolPickerOpen(p => !p)} title={lang === 'ja' ? tool.note : tool.noteEn}
                    className="flex items-center gap-[5px] rounded-[6px] px-[9px] py-[4px] text-[11px] font-mono font-bold cursor-pointer whitespace-nowrap"
                    style={{ background: 'rgb(var(--tint-accent))', border: '1px solid rgb(var(--c-blue) / 0.35)', color: 'rgb(var(--c-blue-s))' }}>
                    {tool.icon} {lang === 'ja' ? tool.name : tool.nameEn}
                    {tool.stripWeights && <span className="text-[9px] text-warn font-normal">w-off</span>}
                    <span className="text-[9px] opacity-40">▾</span>
                  </button>
                  {toolPickerOpen && (
                    <>
                      <div className="fixed inset-0 z-[149]" onClick={() => setToolPickerOpen(false)} />
                      <div className="absolute left-0 top-full mt-[4px] z-[150] bg-surface border border-line rounded-[9px] shadow-xl py-[4px] min-w-[240px]">
                        {TOOLS.map(t => (
                          <button key={t.id} onClick={() => { setActiveTool(t.id); setEditingSuffix(false); setToolPickerOpen(false); }}
                            className="w-full text-left px-[12px] py-[7px] text-[11px] font-mono cursor-pointer hover:bg-surfalt flex items-center gap-2"
                            style={{ color: activeTool === t.id ? 'rgb(var(--c-blue-s))' : 'rgb(var(--text) / 0.8)' }}>
                            <span className="w-4 text-center text-[10px]">{activeTool === t.id ? '✓' : ''}</span>
                            <span className="flex-1">{t.icon} {t.name}</span>
                            <span className="text-[10px] text-dim">{lang === 'ja' ? t.note : t.noteEn}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <span className="text-dim flex-shrink-0 select-none text-[11px]">│</span>
                {/* Tabs */}
                {[{ id: 'positive', label: lang === 'ja' ? '✦ ポジティブ' : '✦ Positive', col: 'rgb(var(--c-blue))', bg: 'rgb(var(--c-blue) / 0.12)', bd: 'rgb(var(--c-blue) / 0.5)' }, { id: 'negative', label: lang === 'ja' ? '✕ ネガティブ' : '✕ Negative', col: 'rgb(var(--c-red))', bg: 'rgb(var(--c-red) / 0.12)', bd: 'rgb(var(--c-red) / 0.5)' }, { id: 'natural', label: lang === 'ja' ? '✎ 自然文' : '✎ Natural', col: 'rgb(var(--c-green))', bg: 'rgb(var(--c-green) / 0.12)', bd: 'rgb(var(--c-green) / 0.5)' }].map(tab => (
                  <button key={tab.id} onClick={() => { setOutputTab(tab.id); setOutputEditMode(false); }}
                    style={{ background: outputTab === tab.id ? tab.bg : 'transparent', border: `1px solid ${outputTab === tab.id ? tab.bd : 'rgb(var(--dim))'}`, color: outputTab === tab.id ? tab.col : 'rgb(var(--muted))', fontWeight: outputTab === tab.id ? 700 : 400 }}
                    className="rounded-[6px] px-[10px] py-1 text-[11px] cursor-pointer font-mono transition-all duration-[120ms] flex-shrink-0">
                    {tab.label}
                  </button>
                ))}
                {outputTab === 'natural' && (
                  <>
                    <button onClick={() => setNaturalLang(l => l === 'ja' ? 'en' : 'ja')}
                      title={lang === 'ja' ? '日本語/英語を切替' : 'Toggle Japanese / English'}
                      className="rounded-[6px] px-[8px] py-1 text-[10px] font-mono cursor-pointer flex-shrink-0"
                      style={{ background: 'rgb(var(--c-green) / 0.1)', border: '1px solid rgb(var(--c-green) / 0.35)', color: 'rgb(var(--c-green))' }}>
                      {naturalLang === 'ja' ? '日本語' : 'EN'}
                    </button>
                    {apiConfig.apiKey && (
                      aiBusy
                        ? <span className="text-[10px] font-mono text-muted flex-shrink-0">✨...</span>
                        : <button onClick={handleAiPolish} disabled={!naturalText}
                            className="rounded-[6px] px-[8px] py-1 text-[10px] font-mono cursor-pointer flex-shrink-0 disabled:opacity-40"
                            style={{ background: 'rgb(var(--c-purple) / 0.1)', border: '1px solid rgb(var(--c-purple) / 0.4)', color: 'rgb(var(--c-purple))' }}
                            title={lang === 'ja' ? '再生成' : 'Regenerate'}>🔄</button>
                    )}
                    {aiResult && (
                      <button onClick={() => setAiResult('')}
                        className="rounded-[6px] px-[7px] py-1 text-[10px] font-mono cursor-pointer flex-shrink-0 text-muted border border-dim bg-transparent"
                        title={lang === 'ja' ? 'AIテキストをクリア' : 'Clear AI text'}>✕</button>
                    )}
                  </>
                )}
                <span className="text-dim flex-shrink-0 select-none text-[11px] mx-[2px]">│</span>
                {/* バリエ + 解析 */}
                <button onClick={startVariations} disabled={!posText}
                  title={lang === 'ja' ? 'バリエーションを3種類生成' : 'Generate 3 variations'}
                  style={{ background: variationsOpen ? 'rgb(var(--tint-accent))' : 'none', border: `1px solid ${variationsOpen ? 'rgb(var(--c-blue) / 0.5)' : 'rgb(var(--dim))'}`, color: variationsOpen ? 'rgb(var(--c-blue-s))' : 'rgb(var(--muted))' }}
                  className="rounded-[6px] px-[9px] py-[4px] text-[11px] cursor-pointer disabled:cursor-default font-mono flex-shrink-0">
                  🎲 {lang === 'ja' ? 'バリエ' : 'Vary'}
                </button>
                <button onClick={() => { setAnalyzeOpen(p => { if (p) setAnalyzeText(''); return !p; }); setOutputExpanded(true); }}
                  title={lang === 'ja' ? 'プロンプト逆解析 — 貼り付けたプロンプトのタグをハイライト (A)' : 'Analyze prompt — highlight matching tags (A)'}
                  style={{ background: analyzeOpen ? 'rgb(var(--c-teal) / 0.13)' : 'none', border: `1px solid ${analyzeOpen ? 'rgb(var(--c-teal) / 0.4)' : 'rgb(var(--dim))'}`, color: analyzeOpen ? 'rgb(var(--c-teal))' : 'rgb(var(--muted))' }}
                  className="rounded-[6px] px-[9px] py-[4px] text-[11px] cursor-pointer font-mono flex-shrink-0">
                  ◎ {lang === 'ja' ? '解析' : 'Analyze'}
                </button>
              </div>
              {/* Row 2: ▼ 📸 🗑 ✏️ [sfx] | flex-1 | [token] [COPY] */}
              <div className={`flex items-center gap-[6px] ${outputExpanded ? 'mb-[2px]' : 'mb-0'}`}>
                {/* Left: collapse + snapshot + reset + edit */}
                <button onClick={() => setOutputExpanded(p => !p)} title={lang === 'ja' ? '出力エリアを折りたたむ/展開' : 'Collapse/expand output'}
                  className="bg-transparent border border-dim rounded-[6px] text-muted cursor-pointer text-[11px] px-[7px] py-[4px] flex-shrink-0">{outputExpanded ? '▼' : '▲'}</button>
                <button onClick={handleSnapshot} disabled={!posText} title={lang === 'ja' ? 'スナップショット（履歴に手動保存）' : 'Snapshot'}
                  style={{ background: snapped ? '#fbbf2415' : 'none', border: `1px solid ${snapped ? '#fbbf2460' : 'rgb(var(--dim))'}` }}
                  className={`rounded-[6px] px-[9px] py-[4px] text-[12px] inline-flex items-center justify-center leading-none transition-all duration-200 flex-shrink-0 ${snapped ? 'text-warn' : 'text-muted'} ${posText ? 'cursor-pointer' : 'cursor-default'}`}>📸</button>
                <button onClick={handleResetAll} title={lang === 'ja' ? 'プロンプトをすべてリセット' : 'Reset all prompts'}
                  className="rounded-[6px] px-[9px] py-[4px] text-[11px] cursor-pointer font-mono border border-dim text-muted transition-all duration-200 flex-shrink-0"
                  onMouseOver={e => { e.currentTarget.style.borderColor = dangerColor + '80'; e.currentTarget.style.color = dangerColor; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}>🗑</button>
                {outputTab !== 'natural' && (
                  <button onClick={() => { if (!outputEditMode) { if (!outputEditText) setOutputEditText(currentText); setOutputEditMode(true); setOutputExpanded(true); } else { setOutputEditMode(false); } }}
                    disabled={!currentText} title={lang === 'ja' ? 'コピー前に手直し' : 'Edit before copy'}
                    style={{ background: outputEditMode ? '#fbbf2422' : 'none', border: `1px solid ${outputEditMode ? '#fbbf2460' : 'rgb(var(--dim))'}`, color: outputEditMode ? '#fbbf24' : 'rgb(var(--muted))' }}
                    className="rounded-[6px] px-[9px] py-[4px] text-[11px] transition-all duration-200 cursor-pointer disabled:cursor-default font-mono flex-shrink-0">✏️</button>
                )}
                {apiConfig.apiKey && outputTab === 'positive' && (
                  <button onClick={() => { if (tagSuggestOpen) { setTagSuggestOpen(false); } else { handleTagSuggest(); setOutputExpanded(true); } }}
                    disabled={tagSuggestBusy || !posText}
                    title={lang === 'ja' ? 'AIタグ提案' : 'AI tag suggestions'}
                    style={{ background: tagSuggestOpen ? 'rgb(var(--c-green) / 0.13)' : 'none', border: `1px solid ${tagSuggestOpen ? 'rgb(var(--c-green) / 0.5)' : 'rgb(var(--dim))'}`, color: tagSuggestOpen ? 'rgb(var(--c-green))' : 'rgb(var(--muted))' }}
                    className="rounded-[6px] px-[9px] py-[4px] text-[11px] cursor-pointer disabled:opacity-40 disabled:cursor-default font-mono flex-shrink-0 transition-all duration-150">
                    {tagSuggestBusy ? '🤖...' : `🤖 ${lang === 'ja' ? '提案' : 'Suggest'}`}
                  </button>
                )}
                {/* Suffix editor + AR chips */}
                {activeTool !== 'general' && (() => {
                  const sfxVal = toolSuffixes[activeTool] || '';
                  const currentAr = sfxVal.match(/--ar\s+(\S+)/)?.[1] ?? null;
                  const applyAr = (ratio) => {
                    const replaced = sfxVal.replace(/--ar\s+\S+/, `--ar ${ratio}`).trim();
                    const next = replaced.includes('--ar') ? replaced : (sfxVal ? `${sfxVal} --ar ${ratio}` : `--ar ${ratio}`);
                    setToolSuffixes(prev => ({ ...prev, [activeTool]: next }));
                  };
                  return (
                    <>
                      {editingSuffix ? (
                        <>
                          <input autoFocus value={sfxVal}
                            onChange={e => setToolSuffixes(prev => ({ ...prev, [activeTool]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingSuffix(false); }}
                            placeholder="e.g. --ar 16:9 --v 8"
                            className="bg-bg rounded-[5px] text-fg text-[11px] px-[9px] py-[3px] outline-none font-mono flex-shrink-0"
                            style={{ border: '1px solid rgb(var(--c-blue) / 0.4)', width: '150px' }}
                          />
                          <button onClick={() => setEditingSuffix(false)}
                            className="bg-transparent border border-dim rounded-[6px] text-muted px-[7px] py-[4px] text-[11px] cursor-pointer flex-shrink-0">✓</button>
                        </>
                      ) : (
                        <button onClick={() => setEditingSuffix(s => !s)} title={lang === 'ja' ? 'suffixを編集' : 'Edit suffix'}
                          className="rounded-[6px] px-[7px] py-[4px] text-[10px] font-mono cursor-pointer whitespace-nowrap flex-shrink-0"
                          style={{ background: sfxVal ? 'rgb(var(--tint-accent))' : 'transparent', border: `1px solid ${sfxVal ? 'rgb(var(--c-blue) / 0.4)' : 'rgb(var(--dim))'}`, color: sfxVal ? 'rgb(var(--c-blue))' : 'rgb(var(--muted))' }}>
                          {sfxVal ? (sfxVal.length > 16 ? sfxVal.slice(0, 16) + '…' : sfxVal) : '+ sfx'}
                        </button>
                      )}
                      {/* AR ratio quick chips — shown alongside sfx */}
                      {!editingSuffix && (
                        <div className="flex flex-shrink-0 rounded-[6px] overflow-hidden border border-dim">
                          {['1:1', '3:2', '16:9', '9:16'].map(r => (
                            <button key={r} onClick={() => applyAr(r)}
                              className="bg-transparent border-r border-dim last:border-r-0 px-[6px] py-[3px] text-[9px] font-mono cursor-pointer whitespace-nowrap transition-colors duration-100"
                              style={{ background: currentAr === r ? 'rgb(var(--c-blue) / 0.15)' : 'transparent', color: currentAr === r ? 'rgb(var(--c-blue))' : 'rgb(var(--muted))' }}>
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
                <div className="flex-1 min-w-0" />
                {/* Right: token count + COPY */}
                {outputTab !== 'natural' && tagCount > 0 && (
                  <span style={{ color: tokenColor, background: tokenColor + '15', border: `1px solid ${tokenColor}40` }}
                    className="text-[10px] font-mono px-2 py-[3px] rounded-[4px] whitespace-nowrap flex-shrink-0">
                    {tagCount}{lang === 'ja' ? 'タグ' : 't'} · {textToCopy.length}{lang === 'ja' ? '字' : 'ch'}{textToCopy.length > WARN_LEN && ' ⚠️'}
                  </span>
                )}
                <button onClick={handleCopy} disabled={!textToCopy}
                  style={{ background: copied ? goodColor + '20' : textToCopy ? 'linear-gradient(135deg,#4a6fff,#8a4fff)' : 'rgb(var(--dim))', border: `1px solid ${copied ? goodColor + '60' : 'transparent'}`, color: copied ? goodColor : textToCopy ? 'white' : 'rgb(var(--muted))', cursor: textToCopy ? 'pointer' : 'default', letterSpacing: '0.04em' }}
                  className="rounded-[8px] px-[20px] py-[6px] text-[13px] font-bold transition-all duration-200 min-w-[90px] flex-shrink-0">
                  {copied ? '✓ Copied!' : '📋 COPY'}
                </button>
              </div>
            </div>
          )}

          {/* Tag suggest panel */}
          {outputExpanded && tagSuggestOpen && (
            <div className="flex-shrink-0 mb-[6px] p-[10px] rounded-[8px]"
              style={{ background: 'rgb(var(--c-green) / 0.04)', border: '1px solid rgb(var(--c-green) / 0.2)' }}>
              <div className="flex items-center justify-between mb-[8px]">
                <span className="text-[10px] font-mono font-bold" style={{ color: 'rgb(var(--c-green))' }}>
                  🤖 {lang === 'ja' ? 'AIタグ提案' : 'AI Tag Suggestions'}
                </span>
                <button onClick={() => setTagSuggestOpen(false)}
                  className="text-[10px] font-mono text-muted cursor-pointer bg-transparent border-none">✕</button>
              </div>
              {tagSuggestError && (
                <div className="text-[11px] font-mono text-red-400 mb-[6px]">{tagSuggestError}</div>
              )}
              <div className="flex flex-col gap-[5px]">
                {tagSuggestions.map((s, i) => {
                  const block = blocks.find(b => b.id === s.block);
                  return (
                    <div key={i} className="flex items-center gap-[8px] bg-surface rounded-[6px] px-[10px] py-[7px]">
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-mono text-fg font-bold">{s.tag}</span>
                        <span className="text-[10px] font-mono text-dim ml-[7px]">→ {block?.name ?? s.block}</span>
                        <div className="text-[10px] font-mono text-muted mt-[1px]">{s.reason}</div>
                      </div>
                      <button
                        onClick={() => {
                          if (!block) return;
                          updateBlock(block.id, { text: appendTag(block.text, s.tag, '1.0'), enabled: true });
                          setTagSuggestions(prev => prev.filter((_, j) => j !== i));
                        }}
                        disabled={!block}
                        className="rounded-[5px] px-[9px] py-[4px] text-[10px] font-mono cursor-pointer disabled:opacity-40 flex-shrink-0 border-none text-white"
                        style={{ background: 'rgb(var(--c-green) / 0.8)' }}>
                        + {lang === 'ja' ? '追加' : 'Add'}
                      </button>
                    </div>
                  );
                })}
                {tagSuggestions.length === 0 && !tagSuggestError && (
                  <div className="text-[11px] font-mono text-muted text-center py-[4px]">
                    {lang === 'ja' ? 'すべて追加しました' : 'All suggestions added'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analyze panel */}
          {outputExpanded && analyzeOpen && (
            <div className="flex-shrink-0 mb-[6px] p-[8px] rounded-[7px]"
              style={{ background: 'rgb(var(--c-teal) / 0.05)', border: '1px solid rgb(var(--c-teal) / 0.2)' }}>
              <div className="flex items-center gap-2 mb-[5px]">
                <span className="text-[10px] font-mono font-bold" style={{ color: 'rgb(var(--c-teal))' }}>◎ {lang === 'ja' ? 'プロンプト逆解析' : 'Prompt Analyze'}</span>
                {analyzeText && (
                  <span className="text-[10px] font-mono text-muted">
                    — {blocks.reduce((s, b) => s + b.cats.flatMap(c => c.t).filter(t => { try { return analyzeText && analyzeText.split(',').some(seg => seg.trim().replace(/^\([^:]+:|[\d.]+\)$/g, '').trim().toLowerCase() === t.en.toLowerCase()); } catch { return false; } }).length, 0)}{lang === 'ja' ? '件一致' : ' matched'}
                  </span>
                )}
                <button onClick={() => { setAnalyzeText(''); setAnalyzeOpen(false); }}
                  className="ml-auto text-[10px] text-muted cursor-pointer bg-transparent border-none">✕ {lang === 'ja' ? '閉じる' : 'Close'}</button>
              </div>
              <textarea
                value={analyzeText}
                onChange={e => setAnalyzeText(e.target.value)}
                placeholder={lang === 'ja' ? 'プロンプトをここに貼り付け → 一致するタグが緑でハイライトされます' : 'Paste a prompt here → matching tags are highlighted green in the blocks above'}
                className="w-full bg-bg border border-dim rounded-[5px] text-fg text-[11px] font-mono px-[9px] py-[6px] outline-none resize-none"
                style={{ minHeight: '54px' }}
              />
            </div>
          )}

          {/* Balance Meter */}
          {outputExpanded && totalTags > 0 && outputTab === 'positive' && (
            <div className="flex-shrink-0 mb-[6px]">
              <div className="flex h-[6px] rounded-full overflow-hidden gap-[1px]" title={lang === 'ja' ? 'ブロック別タグ配分' : 'Tag distribution by block'}>
                {balanceBlocks.map(b => (
                  <div key={b.id} style={{ background: b.color, flex: countTags(b.text) / totalTags }}
                    title={`${lang === 'ja' ? b.name : b.nameEn}: ${countTags(b.text)}${lang === 'ja' ? 'タグ' : 't'}`}
                    className="h-full min-w-[3px] opacity-80" />
                ))}
              </div>
              <div className="flex gap-[6px] flex-wrap mt-[3px]">
                {balanceBlocks.map(b => (
                  <span key={b.id} style={{ color: b.color }} className="text-[10px] font-mono font-semibold">
                    {b.icon}{countTags(b.text)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {outputExpanded && conflicts.length > 0 && outputTab === 'positive' && (
            <div className="flex-shrink-0 mb-[6px] px-[10px] py-[6px] bg-tint-warn border border-[#fbbf2450] rounded-[7px] flex items-center gap-2 flex-wrap">
              <span className="text-warn-text text-[10px] font-bold flex-shrink-0">⚠️ {lang === 'ja' ? '矛盾の可能性' : 'Possible conflict'}</span>
              {conflicts.map((c, i) => (
                <span key={i} className="text-warn-text/80 text-[10px] font-mono bg-tint-warn-tag px-[7px] py-[2px] rounded-[4px]">
                  {lang === 'ja' ? c.ja : c.en}
                </span>
              ))}
            </div>
          )}
          {/* Variation panel */}
          {outputExpanded && variationsOpen && variations.length > 0 && outputTab === 'positive' && (
            <div className="flex-shrink-0 mb-[6px] bg-bg border border-linebright rounded-[8px] overflow-hidden">
              <div className="flex items-center justify-between px-3 py-[6px] border-b border-line">
                <div className="flex items-center gap-[6px]">
                  <span className="text-[10px] font-mono text-muted">🎲 {lang === 'ja' ? `バリエーション (${variations.length}種)` : `Variations (${variations.length})`}</span>
                  {/* Source indicator */}
                  <span className="text-[9px] font-mono px-[5px] py-[1px] rounded-[3px]"
                    style={varSource === 'original'
                      ? { background: 'rgb(var(--surface-alt))', color: 'rgb(var(--muted))' }
                      : { background: 'rgb(var(--c-blue) / 0.15)', color: 'rgb(var(--c-blue))' }}>
                    {varSource === 'original' ? `🏠 ${lang === 'ja' ? 'オリジナル' : 'Original'}` : `🎲${parseInt(varSource.slice(3)) + 1} ${lang === 'ja' ? '編集中' : 'Editing'}`}
                  </span>
                </div>
                <div className="flex gap-[6px] items-center">
                  {varSource !== 'original' && varBuffers.original && (
                    <button onClick={restoreOriginal}
                      className="text-[9px] font-mono cursor-pointer border border-dim rounded-[4px] px-[6px] py-[1px] text-muted">
                      🏠 {lang === 'ja' ? '戻す' : 'Restore'}
                    </button>
                  )}
                  <button onClick={startVariations} className="text-accent text-[10px] font-mono cursor-pointer border border-[#4a6fff50] rounded-[4px] px-[7px] py-[1px]">↻ {lang === 'ja' ? '再生成' : 'Re-roll'}</button>
                  <button onClick={() => setVariationsOpen(false)} className="text-dim text-[10px] cursor-pointer">✕</button>
                </div>
              </div>
              <div className="divide-y divide-line max-h-[240px] overflow-y-auto">
                {variations.map((v, i) => {
                  const isNat = varNatSet.has(i);
                  const natText = naturalLang === 'ja' ? toNaturalJa(v.blocks) : toNaturalEn(v.blocks);
                  const natColor = theme === 'dark' ? '#34d399' : '#0a7a4a';
                  const isActive = varSource === `var${i}`;
                  return (
                    <div key={i} className="flex gap-2 items-start px-3 py-[7px]"
                      style={isActive ? { background: 'rgb(var(--c-blue) / 0.06)' } : undefined}>
                      <span className="text-muted text-[10px] font-mono font-semibold flex-shrink-0 mt-[2px]">{i + 1}</span>
                      <span className={`text-[11px] flex-1 break-words leading-[1.6] select-all ${isNat ? 'font-sans' : 'font-mono break-all text-prompt'}`}
                        style={isNat ? { color: natColor } : undefined}>
                        {isNat ? natText : v.prompt}
                      </span>
                      <div className="flex gap-[5px] flex-shrink-0 items-center">
                        {/* Apply to main */}
                        <button onClick={() => applyVariation(i)}
                          className="rounded-[4px] px-[6px] py-[2px] text-[9px] font-mono cursor-pointer border"
                          style={isActive
                            ? { background: 'rgb(var(--c-blue) / 0.15)', borderColor: 'rgb(var(--c-blue) / 0.5)', color: 'rgb(var(--c-blue))' }
                            : { background: 'transparent', borderColor: 'rgb(var(--dim))', color: 'rgb(var(--muted))' }}>
                          {isActive ? (lang === 'ja' ? '✏️ 編集中' : '✏️ Editing') : (lang === 'ja' ? '→ 適用' : '→ Apply')}
                        </button>
                        <button onClick={() => toggleVarNat(i)}
                          className="rounded-[4px] px-[6px] py-[2px] text-[9px] font-mono cursor-pointer border"
                          style={isNat
                            ? { background: natColor + '20', borderColor: natColor + '60', color: natColor }
                            : { background: 'transparent', borderColor: 'rgb(var(--dim))', color: 'rgb(var(--muted))' }}>
                          {isNat ? '📝' : '🗣'}
                        </button>
                        <button onClick={() => copyVariation(v.prompt, i)}
                          style={{ background: varCopied === i ? goodColor + '20' : 'linear-gradient(135deg,#4a6fff,#8a4fff)', color: varCopied === i ? goodColor : 'white' }}
                          className="rounded-[5px] px-[8px] py-[2px] text-[10px] font-bold cursor-pointer border-none">
                          {varCopied === i ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {outputExpanded && aiError && outputTab === 'natural' && (
            <div className="flex-shrink-0 mb-[5px] px-[10px] py-[6px] rounded-[7px] text-[11px] font-mono text-red-400 bg-red-400/10 border border-red-400/30">
              ⚠ {aiError}
            </div>
          )}
          {outputExpanded && (outputEditMode && outputTab !== 'natural' ? (
            <textarea
              value={outputEditText}
              onChange={e => setOutputEditText(e.target.value)}
              style={{ border: `2px solid #fbbf2460` }}
              className="flex-1 min-h-[42px] bg-bg rounded-[8px] px-3 py-[9px] text-[12px] font-mono leading-[1.65] break-all text-prompt outline-none resize-none"
              autoFocus
              placeholder={lang === 'ja' ? 'テキストを手直ししてからコピー...' : 'Edit text then copy...'}
            />
          ) : (
            <div style={{
                border: `1px solid ${outputTab === 'natural' ? (theme === 'dark' ? '#34d39940' : '#0a7a4a40') : outputTab === 'positive' ? 'rgb(var(--output-border))' : 'rgb(var(--tint-danger))'}`,
                color: outputTab === 'natural' ? (theme === 'dark' ? '#34d399' : '#0a7a4a') : undefined,
              }}
              className={`flex-1 min-h-[42px] overflow-y-auto bg-bg rounded-[8px] px-3 py-[9px] leading-[1.75] break-words select-all ${outputTab === 'natural' ? 'text-[13px] font-sans' : 'text-[12px] font-mono break-all'} ${currentText ? outputTab === 'positive' ? 'text-prompt' : outputTab === 'natural' ? '' : 'text-[#ff8090]' : 'text-muted'}`}>
              {currentText || (outputTab === 'positive' ? (lang === 'ja' ? '← ブロックを有効にしてタグをクリック' : '← Enable blocks and click tags') : outputTab === 'natural' ? (lang === 'ja' ? '← ブロックにタグを追加すると自然文が生成されます' : '← Add tags to blocks to generate natural language') : (lang === 'ja' ? '← ネガティブブロックにタグを追加' : '← Add tags to Negative block'))}
            </div>
          ))}
        </div>
      </div>}

      {/* ── MODALS ── */}
      {libraryOpen && <LibraryModal characters={characters} activeCharId={activeCharId} lang={lang} onClose={() => setLibraryOpen(false)}
        onActivate={id => { setActiveCharId(id); setCharPanelOpen(true); }}
        onArchive={archiveCharacter}
        onDelete={deleteCharacter}
        onSetFolder={setCharFolder} />}
      {historyOpen && <HistoryModal history={history} lang={lang} onClose={() => setHistoryOpen(false)} onRestore={restoreFromHistory} onDelete={id => setHistory(prev => prev.filter(h => h.id !== id))} />}
      {naturalToTagsOpen && <NaturalToTagsModal lang={lang} apiConfig={apiConfig} blocks={blocks} onAddTags={handleAddTagsFromNatural} onClose={() => setNaturalToTagsOpen(false)} initialTab={naturalToTagsTab} />}
      {templateOpen && <TemplateModal lang={lang} isMobile={isMobile} onApply={applyTemplate} onClose={() => setTemplateOpen(false)} />}
      {colorPickerOpen && <ColorPickerModal lang={lang} onApply={applyColorTag} onClose={() => setColorPickerOpen(false)} />}
      {sceneOpen && <SceneComposeModal characters={characters} lang={lang} activeTool={activeTool} theme={theme} onClose={() => setSceneOpen(false)} />}
      {settingsOpen && <SettingsModal lang={lang} isMobile={isMobile} defaultTab={settingsTab} onClose={() => { setSettingsOpen(false); setSettingsTab('shortcuts'); }}
        hiddenBlockIds={hiddenBlockIds} allBlocks={blocks}
        onRestoreBlock={blockId => toggleHideBlock(blockId)}
        onRestoreAllBlocks={() => updateChar(activeCharId, { hiddenBlocks: [] })}
        theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        viewMode={viewMode} onSetViewMode={setViewMode}
        onToggleLang={() => setLang(l => l === 'ja' ? 'en' : 'ja')}
        onShowWelcome={reshowWelcome}
        apiConfig={apiConfig} onSaveApiConfig={saveApiConfig} />}
      {paletteOpen && <CommandPalette commands={paletteCommands} lang={lang} onClose={() => setPaletteOpen(false)} />}

      {/* ── THUMBNAIL PREVIEW MODAL ── */}
      {thumbPreview && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setThumbPreview(null)}
        >
          <img
            src={thumbPreview}
            alt="preview"
            className="max-w-[90vw] max-h-[88vh] rounded-[12px] shadow-2xl object-contain"
          />
          <button
            onClick={() => setThumbPreview(null)}
            className="absolute top-[16px] right-[16px] bg-surface border border-dim rounded-full w-[32px] h-[32px] flex items-center justify-center text-muted cursor-pointer text-[14px] leading-none"
          >✕</button>
        </div>
      )}

      {/* ── SAVE TOAST ── */}
      {(saveStatus === 'saved' || saveStatus === 'err') && (
        <div className="fixed top-[68px] left-0 right-0 flex justify-center z-[500] pointer-events-none">
          <div className="flex items-center gap-[6px] px-[14px] py-[7px] rounded-[20px] text-[12px] font-mono font-semibold shadow-lg"
            style={{
              animation: 'loom-toast-full 2.6s ease-out forwards',
              background: saveStatus === 'saved' ? goodColor + '20' : 'rgb(var(--c-red) / 0.15)',
              border: `1px solid ${saveStatus === 'saved' ? goodColor + '50' : 'rgb(var(--c-red) / 0.4)'}`,
              color: saveStatus === 'saved' ? goodColor : 'rgb(var(--c-red))',
              backdropFilter: 'blur(8px)',
            }}>
            {saveStatus === 'saved' ? `💾 ${lang === 'ja' ? '保存済み' : 'Saved'}` : '⚠️ save err'}
          </div>
        </div>
      )}

      {/* ── Stacked toast container (bottom-right) ── */}
      <div
        className="fixed z-[500] right-4 flex flex-col-reverse gap-[8px]"
        style={{ bottom: (outputExpanded ? outputHeight : 80) + 12 }}
      >
        {/* Template undo snackbar */}
        {templateUndoBuf && (
          <div className="bg-surface border border-accent/40 rounded-[10px] shadow-xl px-4 py-3 text-[11px] font-mono max-w-[280px]">
            <div className="flex items-center gap-3">
              <span className="text-fg flex-1">{lang === 'ja' ? '✦ テンプレートを適用しました' : '✦ Template applied'}</span>
              <button
                onClick={undoTemplate}
                className="border border-accent/60 rounded-[6px] px-[10px] py-[4px] text-accent text-[10px] font-bold cursor-pointer bg-transparent whitespace-nowrap"
              >
                {lang === 'ja' ? '元に戻す' : 'Undo'}
              </button>
              <button onClick={() => { clearTimeout(templateUndoTimerRef.current); setTemplateUndoBuf(null); }} className="text-dim cursor-pointer bg-transparent border-none text-[11px] leading-none p-0">×</button>
            </div>
            {(lang === 'ja' ? templateUndoBuf.negHintJa : templateUndoBuf.negHintEn) && (
              <div className="mt-[6px] text-[9px] font-mono leading-[1.5] px-[6px] py-[3px] rounded-[4px]"
                style={{ background: 'rgb(var(--accent) / 0.08)', color: 'rgb(var(--accent))', border: '1px solid rgb(var(--accent) / 0.25)' }}>
                💡 {lang === 'ja' ? `ネガ推奨: ${templateUndoBuf.negHintJa}` : `Neg hint: ${templateUndoBuf.negHintEn}`}
              </div>
            )}
          </div>
        )}

        {/* Data size warning toast */}
        {dataSizeToast && (
          <div
            className="bg-surface border rounded-[10px] shadow-xl px-4 py-3 text-[11px] font-mono max-w-[280px]"
            style={{ borderColor: 'rgb(var(--c-orange, var(--c-warn)) / 0.5)' }}
          >
            <div className="font-bold mb-1" style={{ color: 'rgb(var(--warn-text, var(--c-orange)))' }}>
              ⚠ {lang === 'ja' ? 'データが大きすぎます' : 'Data too large'}
            </div>
            <div className="text-muted leading-[1.55]">
              {lang === 'ja'
                ? 'クラウド同期できませんでした。プロンプトログを削除してデータを減らしてください。'
                : 'Cloud sync failed. Delete some prompt log entries to reduce data size.'}
            </div>
          </div>
        )}

        {/* Auto-log toast */}
        {autoLogToast && (
          <div
            className="bg-surface border rounded-[10px] shadow-xl px-4 py-3 text-[11px] font-mono max-w-[280px]"
            style={{ borderColor: autoLogToast === 'full' ? 'rgb(var(--c-red) / 0.4)' : 'rgb(var(--c-blue) / 0.4)' }}
          >
            <div className="font-bold" style={{ color: autoLogToast === 'full' ? 'rgb(var(--c-red))' : 'rgb(var(--c-blue))' }}>
              {autoLogToast === 'full'
                ? (lang === 'ja' ? '⚠ ログが100件に達しています。手動で削除してください。' : '⚠ Log full (100 entries). Delete old entries first.')
                : (lang === 'ja' ? '📝 プロンプトログに自動記録しました' : '📝 Auto-saved to Prompt Log')}
            </div>
          </div>
        )}

        {/* Import success toast */}
        {importToast && (
          <div
            className="bg-surface border rounded-[10px] shadow-xl px-4 py-3 text-[11px] font-mono max-w-[260px]"
            style={{ borderColor: 'rgb(var(--c-teal) / 0.5)' }}
          >
            <div className="font-bold" style={{ color: 'rgb(var(--c-teal))' }}>
              ✓ {lang === 'ja' ? `「${importToast.name}」を追加しました` : `"${importToast.name}" added`}
            </div>
          </div>
        )}

        {/* Sync error toast */}
        {syncErrToast && user && (
          <div className="bg-surface border border-red-400/50 rounded-[10px] shadow-xl px-4 py-3 text-[11px] font-mono max-w-[240px]">
            <div className="font-bold mb-1" style={{ color: 'rgb(var(--c-red))' }}>
              ⚠ {lang === 'ja' ? '同期に失敗しました' : 'Sync failed'}
            </div>
            <div className="text-muted leading-[1.55]">
              {lang === 'ja'
                ? 'ネットワークを確認してください。データはこの端末に保存されています。'
                : 'Check your network. Data is saved locally on this device.'}
            </div>
            <button
              onClick={() => setSyncErrToast(false)}
              className="mt-2 text-dim cursor-pointer bg-transparent border-none text-[10px] p-0"
            >
              {lang === 'ja' ? '閉じる' : 'Dismiss'}
            </button>
          </div>
        )}
      </div>

      {showWelcome && loaded && (
        <WelcomeHint
          lang={lang}
          theme={theme}
          onSetLang={setLang}
          onSetTheme={setTheme}
          onDismiss={dismissWelcome}
          onOpenGuide={() => { setSettingsTab('guide'); dismissWelcome(); setSettingsOpen(true); }}
          onOpenSettings={() => { setSettingsTab('api'); dismissWelcome(); setSettingsOpen(true); }}
        />
      )}
      <GlobalTagSearch
        open={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        blocks={blocks}
        lang={lang}
        onToggleTag={handleGlobalTagToggle}
      />
    </div>
  );
}
