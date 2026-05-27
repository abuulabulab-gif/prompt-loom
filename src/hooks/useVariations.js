import { useState } from "react";
import { splitTags, bareTag, appendTag, removeTag, hasTag, stripWeights, OPTIONAL_CAT_NAMES, BLOCK_RANDOM_RULES, TIER3_TAGS, RANDOM_EXCLUSION_RULES, WEAPON_TAGS, WEAPON_PICK_PROB, HAND_POSE_TAGS } from "../data/constants.js";
import { CONFLICT_MAP } from "../data/conflicts.js";

// Blocks whose content is fixed across all variations (character identity)
const VAR_FIXED_BLOCKS = new Set(['quality', 'artstyle', 'attribute', 'face', 'body', 'negative']);

// Reroll blocks in sequential exclusion order (outfit picks constrain feature, etc.)
const VAR_REROLL_ORDER = ['outfit', 'feature', 'effect', 'composition', 'background', 'lighting'];

// Pick tags for one reroll block.
// sharedExcluded is pre-populated with fixed-block exclusions and previous reroll picks;
// newly picked tags mutate it in place so later blocks see the accumulated exclusions.
function pickForBlock(block, sharedExcluded) {
  const pickedTags = [];
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
  const skippedCats = new Set(disabledCats);

  const tryPick = (cat) => {
    if (pickedTags.length >= maxPicks || skippedCats.has(cat.n)) return;
    const available = cat.t.filter(t => {
      const en = t.en.toLowerCase();
      return !t.excludeFromRandom && !TIER3_TAGS.has(en) && !sharedExcluded.has(en);
    });
    if (available.length === 0) return;
    const chosen = available[Math.floor(Math.random() * available.length)];
    if (WEAPON_TAGS.has(chosen.en.toLowerCase()) && Math.random() > WEAPON_PICK_PROB) return;
    pickedTags.push(chosen.en);
    if (WEAPON_TAGS.has(chosen.en.toLowerCase())) {
      HAND_POSE_TAGS.forEach(t => sharedExcluded.add(t.toLowerCase()));
    }
    const newExcl = RANDOM_EXCLUSION_RULES.get(chosen.en.toLowerCase());
    if (newExcl) newExcl.forEach(e => sharedExcluded.add(e.toLowerCase()));
    const cfMap = CONFLICT_MAP.get(chosen.en.toLowerCase());
    if (cfMap) cfMap.forEach(e => sharedExcluded.add(e));
    (rules.skipIfPicked?.[cat.n] || []).forEach(n => skippedCats.add(n));
  };

  for (const cat of coreCats) tryPick(cat);
  const shuffledOpt = [...optCats].sort(() => Math.random() - 0.5);
  for (const cat of shuffledOpt) {
    if (pickedTags.length >= maxPicks || skippedCats.has(cat.n)) break;
    if (Math.random() < 0.4) tryPick(cat);
  }

  return pickedTags.join(', ');
}

// Apply cross-block combo rules to rerolled blocks.
// fixedTags = bareTag list from fixed blocks (attribute/face/body) so species like mermaid/slime/doll trigger combos.
function applyVariationCombos(rerolledMap, fixedTags = []) {
  const allTags = [...fixedTags];
  for (const text of Object.values(rerolledMap)) {
    splitTags(text).forEach(seg => allTags.push(bareTag(seg).toLowerCase()));
  }

  const addCombo = (blockId, tag) => {
    if (rerolledMap[blockId] === undefined) return;
    if (!hasTag(rerolledMap[blockId], tag)) {
      rerolledMap[blockId] = appendTag(rerolledMap[blockId], tag, '1.0');
    }
    const excl = RANDOM_EXCLUSION_RULES.get(tag.toLowerCase());
    if (excl) {
      for (const ct of excl) {
        if (hasTag(rerolledMap[blockId], ct)) rerolledMap[blockId] = removeTag(rerolledMap[blockId], ct);
      }
    }
    const cfMap = CONFLICT_MAP.get(tag.toLowerCase());
    if (cfMap) {
      for (const ct of cfMap) {
        if (hasTag(rerolledMap[blockId], ct)) rerolledMap[blockId] = removeTag(rerolledMap[blockId], ct);
      }
    }
  };

  if (allTags.includes('mermaid') || allTags.includes('mermaid tail')) addCombo('background', 'underwater');
  if (allTags.includes('rainy'))     addCombo('effect', 'rain');
  if (allTags.includes('snowy'))     addCombo('effect', 'snowfall');
  if (allTags.includes('night') || allTags.includes('starry sky')) addCombo('lighting', 'moonlight');

  // Weapon → fighting stance + remove hand poses
  for (const tag of allTags) {
    if (WEAPON_TAGS.has(tag)) {
      addCombo('composition', 'fighting stance');
      for (const blockId of Object.keys(rerolledMap)) {
        for (const handTag of HAND_POSE_TAGS) {
          if (hasTag(rerolledMap[blockId], handTag)) {
            rerolledMap[blockId] = removeTag(rerolledMap[blockId], handTag);
          }
        }
      }
      break;
    }
  }
}

export function useVariations(blocks, tool) {
  const [variations, setVariations] = useState([]);
  const [variationsOpen, setVariationsOpen] = useState(false);
  const [varCopied, setVarCopied] = useState(null);

  const generateVariations = () => {
    const variants = [];

    // Collect all fixed-block tags once (shared across all 3 variations)
    const fixedTags = [];
    for (const block of blocks.filter(b => b.enabled !== false && VAR_FIXED_BLOCKS.has(b.id))) {
      splitTags(block.text || '').forEach(seg => fixedTags.push(bareTag(seg).toLowerCase()));
    }

    for (let v = 0; v < 3; v++) {
      // Initialize sequential excluded from all fixed-block tags
      const sequentialExcluded = new Set();
      for (const tag of fixedTags) {
        const excl = RANDOM_EXCLUSION_RULES.get(tag);
        if (excl) excl.forEach(e => sequentialExcluded.add(e.toLowerCase()));
        const cfMap = CONFLICT_MAP.get(tag);
        if (cfMap) cfMap.forEach(e => sequentialExcluded.add(e));
      }

      const rerolledMap = {};
      const blockById = new Map(
        blocks.filter(b => b.enabled !== false && b.id !== 'negative').map(b => [b.id, b])
      );

      // Process reroll blocks in sequential order so each block's exclusions carry forward
      for (const rerollId of VAR_REROLL_ORDER) {
        const block = blockById.get(rerollId);
        if (!block || !block.cats?.length) continue;
        rerolledMap[rerollId] = pickForBlock(block, sequentialExcluded);
      }

      // Build varBlocks preserving original block order
      const varBlocks = [];
      for (const block of blocks.filter(b => b.enabled !== false && b.id !== 'negative')) {
        if (VAR_FIXED_BLOCKS.has(block.id)) {
          varBlocks.push({ ...block });
        } else if (rerolledMap[block.id] !== undefined) {
          varBlocks.push({ ...block, text: rerolledMap[block.id] });
        } else {
          // Custom blocks: keep as-is
          varBlocks.push({ ...block });
        }
      }

      // Apply cross-block combo rules (fixedTags lets species from attribute trigger combos)
      applyVariationCombos(rerolledMap, fixedTags);

      // Simple background → suppress lighting and effect (environmental FX clash with plain BG)
      const SIMPLE_BG_TAGS = ['white background', 'simple background', 'gradient background', 'bokeh background', 'abstract background'];
      if (SIMPLE_BG_TAGS.some(t => hasTag(rerolledMap['background'] || '', t))) {
        if (rerolledMap['effect']   !== undefined) rerolledMap['effect']   = '';
        if (rerolledMap['lighting'] !== undefined) rerolledMap['lighting'] = '';
      }

      for (const b of varBlocks) {
        if (rerolledMap[b.id] !== undefined) b.text = rerolledMap[b.id];
      }

      const parts = varBlocks
        .filter(b => b.text?.trim())
        .map(b => b.text.trim());
      const prompt = tool.stripWeights ? stripWeights(parts.join(', ')) : parts.join(', ');
      variants.push({ prompt, blocks: varBlocks });
    }

    setVariations(variants);
    setVariationsOpen(true);
  };

  const copyVariation = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setVarCopied(idx); setTimeout(() => setVarCopied(null), 1800);
    });
  };

  return { variations, variationsOpen, setVariationsOpen, varCopied, generateVariations, copyVariation };
}
