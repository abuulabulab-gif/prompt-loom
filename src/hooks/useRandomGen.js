import { useState } from "react";
import {
  appendTag, hasTag, removeTag, splitTags, bareTag,
  OPTIONAL_CAT_NAMES, BLOCK_RANDOM_RULES, SPECIES_PARTS_MAP, RANDOM_EXCLUDE_TAGS,
  TIER3_TAGS, TIER2_BLOCK_IDS, TIER2_BLOCK_PROB, RANDOM_EXCLUSION_RULES, RANDOM_COMBO_RULES,
  CHARDESIGN_MODE_CONFIG, WEAPON_TAGS, WEAPON_PICK_PROB, HAND_POSE_TAGS, KEMONOMIMI_PAIRS,
} from "../data/constants.js";
import { CONFLICT_MAP } from "../data/conflicts.js";

function applyExclusionRules(pickedEnTag, excludedTags) {
  const excl = RANDOM_EXCLUSION_RULES.get(pickedEnTag.toLowerCase());
  if (excl) excl.forEach(e => excludedTags.add(e.toLowerCase()));
}

function pickBlockTags(block, globalExcluded) {
  const rules = BLOCK_RANDOM_RULES[block.id] || {};
  const disabledCats = new Set();

  for (const group of (rules.exclusiveGroups || [])) {
    const present = group.filter(n => block.cats.some(c => c.n === n));
    if (present.length < 2) continue;
    const winner = present[Math.floor(Math.random() * present.length)];
    present.forEach(n => { if (n !== winner) disabledCats.add(n); });
  }

  const coreCats = block.cats.filter(cat => !OPTIONAL_CAT_NAMES.has(cat.n) && !disabledCats.has(cat.n));
  const optCats  = block.cats.filter(cat =>  OPTIONAL_CAT_NAMES.has(cat.n) && !disabledCats.has(cat.n));
  const maxPicks = Math.min(2 + Math.floor(block.cats.length / 3), 6);
  const picks = [];
  const skippedCats = new Set(disabledCats);

  const doPick = (cat) => {
    if (picks.length >= maxPicks || skippedCats.has(cat.n)) return;
    const validT = cat.t.filter(t => {
      const en = t.en.toLowerCase();
      return !RANDOM_EXCLUDE_TAGS.has(t.en)
        && !TIER3_TAGS.has(en)
        && !globalExcluded.has(en);
    });
    if (validT.length === 0) return;
    const pick = validT[Math.floor(Math.random() * validT.length)];
    if (WEAPON_TAGS.has(pick.en.toLowerCase()) && Math.random() > WEAPON_PICK_PROB) return;
    picks.push(pick);
    for (const ct of (CONFLICT_MAP.get(pick.en.toLowerCase()) || [])) globalExcluded.add(ct);
    applyExclusionRules(pick.en, globalExcluded);
    if (WEAPON_TAGS.has(pick.en.toLowerCase())) {
      HAND_POSE_TAGS.forEach(t => globalExcluded.add(t.toLowerCase()));
    }
    (rules.skipIfPicked?.[cat.n] || []).forEach(n => skippedCats.add(n));
  };

  for (const cat of coreCats) doPick(cat);
  const shuffledOpt = [...optCats].sort(() => Math.random() - 0.5);
  for (const cat of shuffledOpt) {
    if (picks.length >= maxPicks) break;
    if (!skippedCats.has(cat.n) && Math.random() < 0.4) doPick(cat);
  }
  return picks;
}

function applyComboRules(blockMap, fixedBlockIds = null) {
  const allPicked = [];
  for (const [, block] of blockMap) {
    splitTags(block.text || '').forEach(seg => allPicked.push(bareTag(seg).toLowerCase()));
  }
  for (const rule of RANDOM_COMBO_RULES) {
    if (!allPicked.includes(rule.trigger.toLowerCase())) continue;
    const target = blockMap.get(rule.blockId);
    if (!target || target.locked) continue;
    if (fixedBlockIds?.has(rule.blockId)) continue;
    if (!hasTag(target.text, rule.tag)) {
      target.text = appendTag(target.text, rule.tag, target.strength);
    }
    const conflicts = RANDOM_EXCLUSION_RULES.get(rule.tag.toLowerCase());
    if (conflicts) {
      for (const conflictTag of conflicts) {
        if (hasTag(target.text, conflictTag)) target.text = removeTag(target.text, conflictTag);
      }
    }
    if (WEAPON_TAGS.has(rule.trigger.toLowerCase())) {
      const triggerBlock = blockMap.get(rule.blockId);
      if (triggerBlock) {
        for (const handTag of HAND_POSE_TAGS) {
          if (hasTag(triggerBlock.text, handTag)) triggerBlock.text = removeTag(triggerBlock.text, handTag);
        }
      }
    }
  }
}

function buildSpeciesText(picks, block, speciesCat, text) {
  for (const pick of picks) {
    if (!speciesCat?.t.some(st => st.en === pick.en)) continue;
    const en = pick.en.toLowerCase();
    if (en === 'kemonomimi') {
      const pair = KEMONOMIMI_PAIRS[Math.floor(Math.random() * KEMONOMIMI_PAIRS.length)];
      for (const partEn of pair) { if (!hasTag(text, partEn)) text = appendTag(text, partEn, block.strength); }
      continue;
    }
    if (en === 'human') {
      if (Math.random() < 0.1) {
        const pair = KEMONOMIMI_PAIRS[Math.floor(Math.random() * KEMONOMIMI_PAIRS.length)];
        for (const partEn of pair) { if (!hasTag(text, partEn)) text = appendTag(text, partEn, block.strength); }
      }
      continue;
    }
    for (const partEn of (SPECIES_PARTS_MAP[pick.en] || [])) {
      if (!hasTag(text, partEn)) text = appendTag(text, partEn, block.strength);
    }
  }
  return text;
}

export function useRandomGen({ blocks, lang, activeCharId, setCharacters }) {
  const [randomMode, setRandomMode] = useState(() => localStorage.getItem('loom_randomMode') || 'illust');

  const posText = blocks
    .filter(b => b.enabled !== false && b.id !== 'negative' && b.text?.trim())
    .map(b => b.text.trim())
    .join(', ');

  const generateRandomChar = (mode = randomMode) => {
    if (posText && !window.confirm(
      lang === 'ja'
        ? '現在のプロンプトをリセットしてランダム生成しますか？'
        : 'Reset current prompt and generate a random character?'
    )) return;

    setCharacters(prev => prev.map(c => {
      if (c.id !== activeCharId) return c;

      const globalExcluded = new Set();
      const blockMap = new Map();

      const newBlocks = c.blocks.map(block => {
        if (block.locked || block.id === 'negative') {
          blockMap.set(block.id, { ...block });
          return block;
        }

        if (TIER2_BLOCK_IDS.has(block.id)) {
          if (mode === 'chardesign' || Math.random() > TIER2_BLOCK_PROB) {
            const cleared = { ...block, text: '', enabled: true, collapsed: false, lastRandomPicks: [] };
            blockMap.set(block.id, cleared);
            return cleared;
          }
        }

        let newBlock;

        // Quality is always fixed regardless of mode
        if (block.id === 'quality') {
          newBlock = { ...block, text: 'masterpiece, best quality, ultra-detailed, highres, absurdres, official art', enabled: true, collapsed: false, lastRandomPicks: [] };
        } else if (mode === 'chardesign') {
          const cfg = CHARDESIGN_MODE_CONFIG;

          if (block.id === 'artstyle') {
            newBlock = { ...block, text: cfg.artstyleText, enabled: true, collapsed: false, lastRandomPicks: [] };
          } else if (block.id === 'background') {
            newBlock = { ...block, text: cfg.backgroundText, enabled: true, collapsed: false, lastRandomPicks: [] };
          } else if (block.id === 'composition') {
            newBlock = { ...block, text: cfg.compositionText, enabled: true, collapsed: false, lastRandomPicks: [] };
          } else if (block.id === 'face') {
            const filteredBlock = {
              ...block,
              cats: block.cats
                .filter(c => !cfg.skipFaceCats.has(c.n))
                .map(c =>
                  c.n === '表情'
                    ? { ...c, t: c.t.filter(t => t.en === cfg.forcedExpression) }
                    : c.n === '髪飾り・毛流れ'
                    ? { ...c, t: c.t.filter(t => !cfg.skipFaceTags.has(t.en)) }
                    : c.n === 'メイク・顔演出'
                    ? { ...c, t: c.t.filter(t => cfg.faceMakeupPhysical.has(t.en)) }
                    : c
                ),
            };
            const picks = pickBlockTags(filteredBlock, globalExcluded);
            let text = '';
            for (const t of picks) text = appendTag(text, t.en, block.strength);
            newBlock = { ...block, text, enabled: true, collapsed: false, lastRandomPicks: picks };
          } else if (block.id === 'body') {
            const filteredBlock = { ...block, cats: block.cats.filter(c => !cfg.skipBodyCats.has(c.n)) };
            const picks = pickBlockTags(filteredBlock, globalExcluded);
            let text = '';
            for (const t of picks) text = appendTag(text, t.en, block.strength);
            newBlock = { ...block, text, enabled: true, collapsed: false, lastRandomPicks: picks };
          } else if (block.id === 'feature') {
            const filteredBlock = { ...block, cats: block.cats.filter(c => !cfg.skipFeatureCats.has(c.n)) };
            const picks = pickBlockTags(filteredBlock, globalExcluded);
            let text = '';
            for (const t of picks) text = appendTag(text, t.en, block.strength);
            newBlock = { ...block, text, enabled: true, collapsed: false, lastRandomPicks: picks };
          } else {
            const CHARDESIGN_SKIP_IDS = new Set(['effect', 'lighting', 'scene', 'mood']);
            if (CHARDESIGN_SKIP_IDS.has(block.id)) {
              newBlock = { ...block, text: '', enabled: true, collapsed: false, lastRandomPicks: [] };
            } else {
              const picks = pickBlockTags(block, globalExcluded);
              let text = '';
              for (const t of picks) text = appendTag(text, t.en, block.strength);
              if (block.id === 'attribute') {
                const speciesCat = block.cats.find(cat => cat.n === '種族');
                text = buildSpeciesText(picks, block, speciesCat, text);
              }
              newBlock = { ...block, text, enabled: true, collapsed: false, lastRandomPicks: picks };
            }
          }
        } else {
          const picks = pickBlockTags(block, globalExcluded);
          let text = '';
          for (const t of picks) text = appendTag(text, t.en, block.strength);
          if (block.id === 'attribute') {
            const speciesCat = block.cats.find(cat => cat.n === '種族');
            text = buildSpeciesText(picks, block, speciesCat, text);
          }
          newBlock = { ...block, text, enabled: true, collapsed: false, lastRandomPicks: picks };
        }

        blockMap.set(block.id, newBlock);
        return newBlock;
      });

      applyComboRules(blockMap, mode === 'chardesign' ? CHARDESIGN_MODE_CONFIG.fixedBlocks : null);

      return {
        ...c,
        blocks: newBlocks.map(b => blockMap.has(b.id) ? blockMap.get(b.id) : b),
      };
    }));
  };

  return { randomMode, setRandomMode, generateRandomChar };
}
