import { useState } from "react";
import { splitTags, bareTag, stripWeights, OPTIONAL_CAT_NAMES } from "../data/constants.js";

// Blocks where ALL tags are kept unchanged (character identity)
const STABLE_BLOCKS = new Set(['quality', 'attribute', 'body']);

// Hair-related categories within the face block — these get varied
const FACE_HAIR_CATS = new Set(['髪色', 'インナーカラー', '髪型', '前髪', '髪飾り・毛流れ']);

export function useVariations(blocks, tool) {
  const [variations, setVariations] = useState([]);
  const [variationsOpen, setVariationsOpen] = useState(false);
  const [varCopied, setVarCopied] = useState(null);

  const generateVariations = () => {
    const variants = [];

    for (let v = 0; v < 3; v++) {
      const parts = [];
      const varBlocks = [];

      for (const block of blocks.filter(b => b.enabled !== false && b.id !== 'negative' && b.text?.trim())) {
        const tags = splitTags(block.text);
        let blockParts;

        if (STABLE_BLOCKS.has(block.id)) {
          // Keep every tag — identity blocks never change
          blockParts = [...tags];

        } else if (block.id === 'face') {
          // Build tag→category map
          const tagToCat = {};
          for (const cat of block.cats) {
            for (const t of cat.t) tagToCat[t.en.toLowerCase()] = cat.n;
          }

          // Identity tags: keep everything that is NOT a hair category
          blockParts = tags.filter(tag => {
            const catName = tagToCat[bareTag(tag).toLowerCase()];
            return !catName || !FACE_HAIR_CATS.has(catName);
          });

          // Vary hair: pick fresh tags from key hair categories
          for (const catName of ['髪色', '髪型', '前髪']) {
            const cat = block.cats.find(c => c.n === catName);
            if (!cat || cat.t.length === 0) continue;
            if (catName === '前髪' && Math.random() < 0.4) continue;
            blockParts.push(cat.t[Math.floor(Math.random() * cat.t.length)].en);
          }

        } else {
          // Non-stable blocks: keep core tags, optionally substitute/add one
          const tagToCat = {};
          for (const cat of block.cats) {
            for (const t of cat.t) tagToCat[t.en.toLowerCase()] = cat.n;
          }

          const kept = tags.filter(tag => {
            const catName = tagToCat[bareTag(tag).toLowerCase()];
            if (!catName) return Math.random() < 0.75;
            return OPTIONAL_CAT_NAMES.has(catName) ? Math.random() < 0.65 : true;
          });

          const keptBare = new Set(kept.map(t => bareTag(t).toLowerCase()));
          const corePool = block.cats
            .filter(c => !OPTIONAL_CAT_NAMES.has(c.n))
            .flatMap(c => c.t)
            .filter(t => !keptBare.has(t.en.toLowerCase()));

          blockParts = [...kept];
          if (corePool.length > 0 && Math.random() < 0.5) {
            blockParts.push(corePool[Math.floor(Math.random() * corePool.length)].en);
          }
        }

        parts.push(...blockParts);
        varBlocks.push({ ...block, text: blockParts.join(', ') });
      }

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
