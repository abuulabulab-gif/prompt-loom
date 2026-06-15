import { useState } from "react";
import { appendTag, removeTag, hasTag } from "../data/constants.js";
import { TARGET_TO_BLOCK, COLOR_BASE_REMOVE,
  CM_ANIMAL_EAR_TAGS, CM_HORN_TAGS, CM_WING_TAGS, CM_TAIL_TAGS,
} from "../data/colors.js";

export function useColorPicker({ activeCharId, blocks, setCharacters, pushHistory, makeHistoryEntry, lang }) {
  const [colorPickerOpen, setColorPickerOpen]                   = useState(false);
  const [colorPickerAllowedTargets, setColorPickerAllowedTargets] = useState(null);
  const [colorPickerDefaultTarget, setColorPickerDefaultTarget]   = useState('hair');
  const [colorPickerBlockText, setColorPickerBlockText]           = useState(null);
  const [colorToast, setColorToast]                               = useState(null);

  const applyColorTag = (tags, targetId) => {
    const blockId = targetId === 'heterochromia' ? 'face' : (TARGET_TO_BLOCK[targetId] || 'outfit');
    const tagArray = Array.isArray(tags) ? tags : [tags];
    const baseToRemove = COLOR_BASE_REMOVE[targetId];

    pushHistory(makeHistoryEntry(false));
    setCharacters(prev => prev.map(c => c.id !== activeCharId ? c : ({
      ...c,
      blocks: c.blocks.map(b => b.id !== blockId ? b : ({
        ...b,
        text: (() => {
          let t = tagArray.reduce((acc, tag) => appendTag(acc, tag, '1.0'), b.text);
          if (baseToRemove) t = removeTag(t, baseToRemove);
          return t;
        })(),
        enabled: true, collapsed: false,
      })),
    })));

    const blockName    = blocks.find(b => b.id === blockId)?.[lang === 'ja' ? 'name' : 'nameEn'] ?? blockId;
    const labelPreview = tagArray[0] ?? '';
    const msg = targetId === 'heterochromia'
      ? (lang === 'ja' ? `🎨 ${blockName}に「オッドアイ」を追加` : `🎨 heterochromia added to ${blockName}`)
      : (lang === 'ja'
        ? `🎨 ${blockName}に「${labelPreview}」${tagArray.length > 1 ? `他${tagArray.length - 1}件` : ''}を追加`
        : `🎨 "${labelPreview}"${tagArray.length > 1 ? ` +${tagArray.length - 1}` : ''} added to ${blockName}`);
    setColorToast({ msg });
    setTimeout(() => setColorToast(null), 3000);
  };

  const applyFeatureTag = (tag, blockId) => {
    const resolvedId = blockId || 'outfit_detail';
    pushHistory(makeHistoryEntry(false));
    setCharacters(prev => prev.map(c => c.id !== activeCharId ? c : {
      ...c,
      blocks: c.blocks.map(b => b.id !== resolvedId ? b : {
        ...b, text: appendTag(b.text, tag, '1.0'), enabled: true, collapsed: false,
      }),
    }));
    const blockName = blocks.find(b => b.id === resolvedId)?.[lang === 'ja' ? 'name' : 'nameEn'] ?? resolvedId;
    const msg = lang === 'ja' ? `🎯 ${blockName}に「${tag}」を追加` : `🎯 "${tag}" added to ${blockName}`;
    setColorToast({ msg });
    setTimeout(() => setColorToast(null), 3000);
  };

  const applyMaterialTag = (tag, blockId) => {
    const resolvedId = blockId || 'outfit';
    pushHistory(makeHistoryEntry(false));
    setCharacters(prev => prev.map(c => c.id !== activeCharId ? c : {
      ...c,
      blocks: c.blocks.map(b => b.id !== resolvedId ? b : {
        ...b, text: appendTag(b.text, tag, '1.0'), enabled: true, collapsed: false,
      }),
    }));
    const blockName = blocks.find(b => b.id === resolvedId)?.[lang === 'ja' ? 'name' : 'nameEn'] ?? resolvedId;
    const msg = lang === 'ja' ? `🧵 ${blockName}に「${tag}」を追加` : `🧵 "${tag}" added to ${blockName}`;
    setColorToast({ msg });
    setTimeout(() => setColorToast(null), 3000);
  };

  const applyCutoutTags = (tags) => {
    const resolvedId = 'outfit_detail';
    const tagArray = Array.isArray(tags) ? tags : [tags];
    if (!tagArray.length) return;
    pushHistory(makeHistoryEntry(false));
    setCharacters(prev => prev.map(c => c.id !== activeCharId ? c : {
      ...c,
      blocks: c.blocks.map(b => b.id !== resolvedId ? b : {
        ...b,
        text: tagArray.reduce((acc, tag) => appendTag(acc, tag, '1.0'), b.text),
        enabled: true, collapsed: false,
      }),
    }));
    const blockName = blocks.find(b => b.id === resolvedId)?.[lang === 'ja' ? 'name' : 'nameEn'] ?? resolvedId;
    const msg = lang === 'ja'
      ? `✂️ ${blockName}に「${tagArray[0]}」${tagArray.length > 1 ? `他${tagArray.length - 1}件` : ''}を追加`
      : `✂️ "${tagArray[0]}"${tagArray.length > 1 ? ` +${tagArray.length - 1}` : ''} added to ${blockName}`;
    setColorToast({ msg });
    setTimeout(() => setColorToast(null), 3000);
  };

  const _pickColorDefault = (allowedTargets, blockText, fallback) => {
    if (!allowedTargets || typeof blockText !== 'string') return fallback;
    const checks = {
      animal_ears:   t => CM_ANIMAL_EAR_TAGS.some(k => hasTag(t, k)),
      horns:         t => CM_HORN_TAGS.some(k => hasTag(t, k)),
      wings:         t => CM_WING_TAGS.some(k => hasTag(t, k)),
      tail_color:    t => CM_TAIL_TAGS.some(k => hasTag(t, k)),
      glasses_frame: t => hasTag(t,'glasses') || hasTag(t,'wearing glasses') || hasTag(t,'goggles'),
      earrings:      t => hasTag(t,'earrings'),
      necklace:      t => hasTag(t,'necklace') || hasTag(t,'pendant') || hasTag(t,'choker'),
    };
    for (const targetId of allowedTargets) {
      if (checks[targetId]?.(blockText)) return targetId;
    }
    return fallback;
  };

  const openColorPicker = (defaultTarget = 'hair', allowedTargets = null, blockText = null) => {
    const resolvedText = blockText ?? Object.fromEntries(blocks.map(b => [b.id, b.text]));
    const smartDefault = _pickColorDefault(allowedTargets, resolvedText, defaultTarget);
    setColorPickerDefaultTarget(smartDefault);
    setColorPickerAllowedTargets(allowedTargets);
    setColorPickerBlockText(resolvedText);
    setColorPickerOpen(true);
  };

  return {
    colorPickerOpen, setColorPickerOpen,
    colorPickerAllowedTargets,
    colorPickerDefaultTarget,
    colorPickerBlockText,
    colorToast, setColorToast,
    applyColorTag, applyFeatureTag, applyMaterialTag, applyCutoutTags, openColorPicker,
  };
}
