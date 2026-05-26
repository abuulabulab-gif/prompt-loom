import { useState } from "react";
import { splitTags, bareTag, appendTag, removeTag, hasTag, stripWeights, OPTIONAL_CAT_NAMES, BLOCK_RANDOM_RULES, TIER3_TAGS, RANDOM_EXCLUSION_RULES, WEAPON_TAGS, WEAPON_PICK_PROB, HAND_POSE_TAGS } from "../data/constants.js";
import { CONFLICT_MAP } from "../data/conflicts.js";

// Blocks whose content is fixed across all variations (character identity)
const VAR_FIXED_BLOCKS = new Set(['quality', 'artstyle', 'attribute', 'face', 'body', 'negative']);

// Blocks that get fully re-rolled each variation
const VAR_REROLL_BLOCKS = new Set(['outfit', 'composition', 'background', 'effect', 'lighting']);

// Build a random text for a reroll block.
// allPickedTags = fixed-block tags (mermaid等の種族含む) — 事前に排他ルールを適用
function pickForBlock(block, allPickedTags) {
  const pickedTags = [];
  const excluded = new Set();
  const rules = BLOCK_RANDOM_RULES[block.id] || {};

  // 固定ブロックのタグから排他ルールを先に全部収集（種族 → 衣装制約 + 競合マップ）
  for (const tag of allPickedTags) {
    const excl = RANDOM_EXCLUSION_RULES.get(tag.toLowerCase());
    if (excl) excl.forEach(e => excluded.add(e.toLowerCase()));
    const cfMap = CONFLICT_MAP.get(tag.toLowerCase());
    if (cfMap) cfMap.forEach(e => excluded.add(e));
  }

  // exclusiveGroups（背景の屋外/屋内/シンプル排他 等）
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
      return !TIER3_TAGS.has(en) && !excluded.has(en);
    });
    if (available.length === 0) return;
    const chosen = available[Math.floor(Math.random() * available.length)];
    if (WEAPON_TAGS.has(chosen.en.toLowerCase()) && Math.random() > WEAPON_PICK_PROB) return;
    pickedTags.push(chosen.en);
    if (WEAPON_TAGS.has(chosen.en.toLowerCase())) {
      HAND_POSE_TAGS.forEach(t => excluded.add(t.toLowerCase()));
    }
    const newExcl = RANDOM_EXCLUSION_RULES.get(chosen.en.toLowerCase());
    if (newExcl) newExcl.forEach(e => excluded.add(e.toLowerCase()));
    (rules.skipIfPicked?.[cat.n] || []).forEach(n => skippedCats.add(n));
  };

  // コアカテゴリは必ずピック、オプションカテゴリは40%確率
  for (const cat of coreCats) tryPick(cat);
  const shuffledOpt = [...optCats].sort(() => Math.random() - 0.5);
  for (const cat of shuffledOpt) {
    if (pickedTags.length >= maxPicks || skippedCats.has(cat.n)) break;
    if (Math.random() < 0.4) tryPick(cat);
  }

  return pickedTags.join(', ');
}

// Apply cross-block combo rules to rerolled blocks
function applyVariationCombos(rerolledMap) {
  const allTags = [];
  for (const text of Object.values(rerolledMap)) {
    splitTags(text).forEach(seg => allTags.push(bareTag(seg).toLowerCase()));
  }

  const addCombo = (blockId, tag) => {
    if (rerolledMap[blockId] === undefined) return;
    if (!hasTag(rerolledMap[blockId], tag)) {
      rerolledMap[blockId] = appendTag(rerolledMap[blockId], tag, '1.0');
    }
    // コンボタグと競合する既存タグを除去（RANDOM_EXCLUSION_RULES + CONFLICT_MAP）
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

  // 武器保持→hand poseを除去
  for (const tag of allTags) {
    if (WEAPON_TAGS.has(tag)) {
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
      const varBlocks = [];
      const rerolledMap = {};

      for (const block of blocks.filter(b => b.enabled !== false && b.id !== 'negative')) {
        if (VAR_FIXED_BLOCKS.has(block.id)) {
          // Keep as-is
          varBlocks.push({ ...block });
        } else if (VAR_REROLL_BLOCKS.has(block.id) && block.cats?.length > 0) {
          // Full re-roll using block's cat definitions
          const newText = pickForBlock(block, fixedTags);
          rerolledMap[block.id] = newText;
          varBlocks.push({ ...block, text: newText });
        } else {
          // Custom blocks or unknown: keep as-is
          varBlocks.push({ ...block });
        }
      }

      // Apply combo rules to rerolled text map, then write back
      applyVariationCombos(rerolledMap);
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
