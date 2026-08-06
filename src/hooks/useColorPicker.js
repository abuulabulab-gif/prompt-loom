import { useState } from "react";
import { removeTag, hasTag } from "../data/constants.js";
import { TARGET_TO_BLOCK, COLOR_BASE_REMOVE,
  CM_ANIMAL_EAR_TAGS, CM_HORN_TAGS, CM_WING_TAGS, CM_TAIL_TAGS,
} from "../data/colors.js";
import { applyMakerTags } from "../data/makerCover.js";
import { getFeatureReplaces } from "../data/features.js";

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
        // 置き換え式：同ベースの旧タグ（素タグ・旧カラー）を除去してから追記
        text: applyMakerTags(b.text, tagArray, baseToRemove ? [baseToRemove] : []),
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
    const removals = getFeatureReplaces(tag); // 素タグとの2重防止（クロスブロック対応）
    pushHistory(makeHistoryEntry(false));
    setCharacters(prev => prev.map(c => c.id !== activeCharId ? c : {
      ...c,
      blocks: c.blocks.map(b => {
        let text = b.text;
        for (const r of removals) if (r.block === b.id && hasTag(text, r.tag)) text = removeTag(text, r.tag);
        if (b.id === resolvedId) {
          return { ...b, text: applyMakerTags(text, tag), enabled: true, collapsed: false };
        }
        return text === b.text ? b : { ...b, text };
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
        ...b, text: applyMakerTags(b.text, tag), enabled: true, collapsed: false,
      }),
    }));
    const blockName = blocks.find(b => b.id === resolvedId)?.[lang === 'ja' ? 'name' : 'nameEn'] ?? resolvedId;
    const msg = lang === 'ja' ? `🧵 ${blockName}に「${tag}」を追加` : `🧵 "${tag}" added to ${blockName}`;
    setColorToast({ msg });
    setTimeout(() => setColorToast(null), 3000);
  };

  // グループメーカー共通：入れ先ブロックごとの [{blockId, tags}] を1回のhistoryで適用
  // （カット・左右の適用を1本化＝旧applyCutoutTagsを吸収 2026-08-06）
  const applyMakerTagPairs = (pairs, icon = '✨') => {
    const list = (pairs || []).filter(p => p?.tags?.length);
    if (!list.length) return;
    pushHistory(makeHistoryEntry(false));
    const byId = new Map(list.map(p => [p.blockId, p.tags]));
    setCharacters(prev => prev.map(c => c.id !== activeCharId ? c : {
      ...c,
      blocks: c.blocks.map(b => byId.has(b.id) ? {
        ...b, text: applyMakerTags(b.text, byId.get(b.id)), enabled: true, collapsed: false,
      } : b),
    }));
    const total = list.reduce((n, p) => n + p.tags.length, 0);
    const names = list.map(p => blocks.find(b => b.id === p.blockId)?.[lang === 'ja' ? 'name' : 'nameEn'] ?? p.blockId);
    const msg = lang === 'ja'
      ? `${icon} ${names.join('・')}に${total}件追加`
      : `${icon} ${total} tag${total > 1 ? 's' : ''} added to ${names.join(', ')}`;
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
    applyColorTag, applyFeatureTag, applyMaterialTag, applyMakerTagPairs, openColorPicker,
  };
}
