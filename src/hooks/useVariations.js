import { useState } from "react";
import { splitTags, bareTag, stripWeights, OPTIONAL_CAT_NAMES } from "../data/constants.js";

export function useVariations(blocks, tool) {
  const [variations, setVariations] = useState([]);
  const [variationsOpen, setVariationsOpen] = useState(false);
  const [varCopied, setVarCopied] = useState(null);

  const generateVariations = () => {
    const STABLE_BLOCKS = new Set(['quality', 'face', 'attribute', 'body']);
    const variants = [];

    for (let v = 0; v < 3; v++) {
      const parts = [];
      const varBlocks = [];

      for (const block of blocks.filter(b => b.enabled !== false && b.id !== 'negative' && b.text?.trim())) {
        const tags = splitTags(block.text);

        let blockParts;
        if (STABLE_BLOCKS.has(block.id)) {
          blockParts = [...tags];
        } else {
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
            const pick = corePool[Math.floor(Math.random() * corePool.length)];
            blockParts.push(pick.en);
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
