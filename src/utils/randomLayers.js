import { appendTag, hasTag, removeTag } from '../data/constants.js';
import { COLOR_PALETTE, SHADES, HUE_GROUPS, buildColorTag,
  CM_PRIMARY_OUTFIT_TAGS, CM_COMPLETE_OUTFITS,
  CM_OUTFIT_TOPS, CM_OUTFIT_BOTTOMS, CM_OUTFIT_OUTER, CM_OUTFIT_FOOTWEAR,
  CM_OUTFIT_LEGWEAR, CM_ANIMAL_EAR_TAGS, CM_HORN_TAGS, CM_WING_TAGS,
} from '../data/colors.js';

// 衣装スタック: 主張の強い衣装ジャンル（完成系アウトフィット）
const COMPLETE_OUTFIT_GENRES = new Set([
  'school swimsuit','swimsuit','one-piece swimsuit','bikini','micro bikini',
  'bunny suit','leotard','bodysuit','lingerie',
  'school uniform','sailor uniform','blazer uniform',
  'maid outfit','witch outfit','magical girl','gothic lolita',
  'idol costume','cheerleader','race queen',
  'military uniform','police uniform','nurse','nun',
  'fantasy armor','bikini armor','sci-fi armor',
  'wedding dress','evening gown',
  'kimono','furisode','yukata','cheongsam','hanfu','shrine maiden',
]);
const OUTFIT_STYLE_TAGS  = new Set(['casual','sporty','elegant','punk','preppy','gothic','streetwear','high fashion']);
const OUTFIT_ACCENT_TAGS = new Set(['veil','crown','tiara','scarf','necktie','bowtie','headphones','over-ear headphones']);

export function pickWeightedShade() {
  const r = Math.random();
  if (r < 0.65) return SHADES.find(s => s.id === 'normal');
  if (r < 0.85) return SHADES.find(s => s.id === 'light');
  return SHADES.find(s => s.id === 'dark');
}

export function pickContrastingColor(baseColorEn) {
  const baseIdx = HUE_GROUPS.findIndex(g => g.includes(baseColorEn));
  let idx; let t = 0;
  do { idx = Math.floor(Math.random() * HUE_GROUPS.length); } while (idx === baseIdx && ++t < 10);
  const g = HUE_GROUPS[idx];
  return g[Math.floor(Math.random() * g.length)];
}

// 衣装スタックSoft Penalty: 主張の強いジャンルがある場合にスタイル・装飾アクセを間引く
export function applyOutfitStackPenalty(blockMap) {
  const ob = blockMap.get('outfit');
  if (!ob?.text || ob.locked) return;
  const hasCompleteGenre = [...COMPLETE_OUTFIT_GENRES].some(t => hasTag(ob.text, t));
  if (!hasCompleteGenre) return;
  let text = ob.text;
  for (const tag of OUTFIT_STYLE_TAGS) { if (hasTag(text, tag) && Math.random() < 0.70) text = removeTag(text, tag); }
  if (text !== ob.text) blockMap.set('outfit', { ...ob, text });
  // 装飾アクセは衣装ディテールブロックに移動したため、そちらも間引く
  const detailB = blockMap.get('outfit_detail');
  if (detailB?.text && !detailB.locked) {
    let ftext = detailB.text;
    for (const tag of OUTFIT_ACCENT_TAGS) { if (hasTag(ftext, tag) && Math.random() < 0.60) ftext = removeTag(ftext, tag); }
    if (ftext !== detailB.text) blockMap.set('outfit_detail', { ...detailB, text: ftext });
  }
}

// ── カラーメーカー自動付与レイヤー ─────────────────────────────────────────
// 衣装・キャラパーツが存在するとき条件付きで色タグを付与する

// メイクアップ（フェイスブロック対象）
const CM_MAKEUP_SLOTS = [
  ['eyeshadow', new Set(['eyeshadow','makeup']), 0.60],
  ['lipstick',  new Set(['lipstick', 'makeup']), 0.50],
];
// ribbon/lace/trim/embroidery は衣装ディテール(outfit_detail)ブロックに移動済みのため別スロットで管理
const CM_DETAIL_SLOTS = [
  ['ribbon',     new Set(['ribbons','bows','frills']), 0.65, true],
  ['trim',       new Set(['lace trim']),               0.65, true],
  ['embroidery', new Set(['embroidery']),              0.65, true],
  ['lace',       new Set(['lace']),                    0.55, true],
];
const CM_KEMONO_TAILS  = new Set(['cat tail','fox tail','wolf tail','fluffy tail','bunny tail','dog tail','tiger tail','squirrel tail','mouse tail','horse tail','cow tail','multiple tails']);
const CM_FANTASY_TAILS = new Set(['demon tail','dragon tail']);

// アクセント色で着色するアトリビュートターゲット（テーブルドリブン）
// mode: 'find' = Set内で最初にマッチしたタグ1つ / 'key' = 固定タグ / 'each' = Set内の全マッチに個別ロール
const ATTR_ACCENT_RULES = [
  { key: 'mermaid tail',    prob: 0.65, mode: 'key'  },
  { key: 'fin ears',        prob: 0.70, mode: 'key'  },
  { tags: CM_HORN_TAGS,     prob: 0.55, mode: 'find' },
  { tags: CM_WING_TAGS,     prob: 0.50, mode: 'find' },
  { tags: CM_FANTASY_TAILS, prob: 0.55, mode: 'each' },
];

export function applyColorMakerLayer(blockMap, mode, hairCtx = null) {
  const overallProb = mode === 'chardesign' ? 0.70 : 0.55;
  if (Math.random() > overallProb) return;

  const outfitBlock  = blockMap.get('outfit');
  const attrBlock    = blockMap.get('attribute');
  const detailBlock  = blockMap.get('outfit_detail');

  const mainColorObj  = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  const mainShade     = pickWeightedShade();
  const useAccent     = Math.random() < 0.40;
  const accentColorEn = useAccent ? pickContrastingColor(mainColorObj.en) : null;
  const accentShade   = useAccent ? pickWeightedShade() : mainShade;
  const accentColorObj = accentColorEn ? (COLOR_PALETTE.find(c => c.en === accentColorEn) ?? { en: accentColorEn }) : mainColorObj;

  const makeTag = (isDetail, targetEn) => {
    const shade = (isDetail && useAccent) ? accentShade : mainShade;
    const cObj  = (isDetail && useAccent) ? accentColorObj : mainColorObj;
    return buildColorTag(shade.en, cObj.en, targetEn);
  };

  let added = 0;
  const MAX_TAGS = 7;

  if (outfitBlock && !outfitBlock.locked) {
    let text = outfitBlock.text || '';
    const str = outfitBlock.strength;

    // [1] メイン衣装：実際の衣装タグに直接色を付ける
    const primaryTag = CM_PRIMARY_OUTFIT_TAGS.find(t => hasTag(text, t));
    if (primaryTag && added < MAX_TAGS && Math.random() < 0.55) {
      const tag = makeTag(false, primaryTag);
      if (!hasTag(text, tag)) { text = appendTag(text, tag, str); added++; }
    }
    const isComplete = primaryTag && CM_COMPLETE_OUTFITS.has(primaryTag);

    // [2] トップス（完成系衣装がない場合のみ）
    if (!isComplete && added < MAX_TAGS && Math.random() < 0.40) {
      const t = CM_OUTFIT_TOPS.find(k => hasTag(text, k));
      if (t) { const tag = makeTag(false, t); if (!hasTag(text, tag)) { text = appendTag(text, tag, str); added++; } }
    }

    // [3] ボトムス（完成系衣装がない場合のみ）
    if (!isComplete && added < MAX_TAGS && Math.random() < 0.50) {
      const t = CM_OUTFIT_BOTTOMS.find(k => hasTag(text, k));
      if (t) { const tag = makeTag(false, t); if (!hasTag(text, tag)) { text = appendTag(text, tag, str); added++; } }
    }

    // [4] アウター（常に試みる）
    if (added < MAX_TAGS && Math.random() < 0.40) {
      const t = CM_OUTFIT_OUTER.find(k => hasTag(text, k));
      if (t) { const tag = makeTag(false, t); if (!hasTag(text, tag)) { text = appendTag(text, tag, str); added++; } }
    }

    // [5] フットウェア（常に試みる）
    if (added < MAX_TAGS && Math.random() < 0.30) {
      const t = CM_OUTFIT_FOOTWEAR.find(k => hasTag(text, k));
      if (t) { const tag = makeTag(false, t); if (!hasTag(text, tag)) { text = appendTag(text, tag, str); added++; } }
    }

    // [6] レッグウェア（常に試みる）
    if (added < MAX_TAGS && Math.random() < 0.45) {
      const t = CM_OUTFIT_LEGWEAR.find(k => hasTag(text, k));
      if (t) { const tag = makeTag(false, t); if (!hasTag(text, tag)) { text = appendTag(text, tag, str); added++; } }
    }

    if (text !== (outfitBlock.text || '')) blockMap.set('outfit', { ...outfitBlock, text });
  }

  // 衣装ディテールブロック: ribbon/lace/trim/embroidery の色付与
  if (added < MAX_TAGS && detailBlock && !detailBlock.locked) {
    let dtext = detailBlock.text || '';
    for (const [targetEn, keys, prob, isDetail] of CM_DETAIL_SLOTS) {
      if (added >= MAX_TAGS) break;
      if (![...keys].some(k => hasTag(dtext, k))) continue;
      if (Math.random() > prob) continue;
      const tag = makeTag(isDetail, targetEn);
      if (!hasTag(dtext, tag)) { dtext = appendTag(dtext, tag, detailBlock.strength); added++; }
    }
    if (dtext !== (detailBlock.text || '')) blockMap.set('outfit_detail', { ...detailBlock, text: dtext });
  }

  if (attrBlock && !attrBlock.locked) {
    let t = attrBlock.text || '';
    const str = attrBlock.strength;

    // 髪色ベース（ケモ耳・ケモしっぽで共有）
    const hairColorEn = hairCtx?.baseColor ?? mainColorObj.en;
    const hairShade   = SHADES.find(s => s.id === (hairCtx?.baseShadeId ?? 'normal')) ?? SHADES[1];

    // ── ケモ耳: 髪色に合わせる ──
    const earTag = CM_ANIMAL_EAR_TAGS.find(k => hasTag(t, k));
    if (earTag && added < MAX_TAGS && Math.random() < 0.65) {
      const tag = buildColorTag(hairShade.en, hairColorEn, earTag);
      if (!hasTag(t, tag)) { t = appendTag(t, tag, str); added++; }
    }

    // ── ケモしっぽ: 髪色基準、2色髪＋ケモ耳ならグラデ ──
    const kemonoTail = [...CM_KEMONO_TAILS].find(k => hasTag(t, k));
    if (kemonoTail && added < MAX_TAGS && Math.random() < 0.60) {
      if (hairCtx?.isDual && hairCtx.color2 && earTag && Math.random() < 0.70) {
        const s2 = SHADES.find(s => s.id === (hairCtx.color2ShadeId ?? 'normal')) ?? SHADES[1];
        const gradTag = `gradient ${kemonoTail}`;
        const t1 = buildColorTag(hairShade.en, hairCtx.baseColor, kemonoTail);
        const t2 = buildColorTag(s2.en, hairCtx.color2, kemonoTail);
        if (!hasTag(t, gradTag) && added < MAX_TAGS) { t = appendTag(t, gradTag, str); added++; }
        if (!hasTag(t, t1) && added < MAX_TAGS) { t = appendTag(t, t1, str); added++; }
        if (!hasTag(t, t2) && added < MAX_TAGS) { t = appendTag(t, t2, str); added++; }
      } else {
        const tag = buildColorTag(hairShade.en, hairColorEn, kemonoTail);
        if (!hasTag(t, tag)) { t = appendTag(t, tag, str); added++; }
      }
    }

    // ── アクセント色ターゲット（テーブルドリブン）──
    for (const rule of ATTR_ACCENT_RULES) {
      if (added >= MAX_TAGS) break;
      const hits = rule.mode === 'find' ? [rule.tags.find(k => hasTag(t, k))].filter(Boolean)
                 : rule.mode === 'key'  ? (hasTag(t, rule.key) ? [rule.key] : [])
                 : /* each */             [...rule.tags].filter(k => hasTag(t, k));
      for (const hit of hits) {
        if (added >= MAX_TAGS) break;
        if (Math.random() >= rule.prob) continue;
        const tag = makeTag(true, hit);
        if (!hasTag(t, tag)) { t = appendTag(t, tag, str); added++; }
      }
    }

    if (t !== (attrBlock.text || '')) blockMap.set('attribute', { ...attrBlock, text: t });
  }

  const bodyBlock2 = blockMap.get('body');
  if (added < MAX_TAGS && bodyBlock2 && !bodyBlock2.locked && Math.random() < 0.15) {
    const t = bodyBlock2.text || '';
    const tag = makeTag(true, 'nails');
    if (!hasTag(t, tag)) blockMap.set('body', { ...bodyBlock2, text: appendTag(t, tag, bodyBlock2.strength) });
  }

  // フェイスブロック: メイクアップの色付与
  const faceBlock = blockMap.get('face');
  if (added < MAX_TAGS && faceBlock && !faceBlock.locked) {
    let ftext = faceBlock.text || '';
    for (const [targetEn, keys, prob] of CM_MAKEUP_SLOTS) {
      if (added >= MAX_TAGS) break;
      if (![...keys].some(k => hasTag(ftext, k))) continue;
      if (Math.random() > prob) continue;
      const tag = makeTag(true, targetEn);
      if (!hasTag(ftext, tag)) { ftext = appendTag(ftext, tag, faceBlock.strength); added++; }
    }
    if (ftext !== (faceBlock.text || '')) blockMap.set('face', { ...faceBlock, text: ftext });
  }
}

// ── 特徴メーカー自動配置レイヤー ─────────────────────────────────────────
// 位置が曖昧な特徴タグに位置情報を付与する
const FM_POSITIONS = new Map([
  ['mole',      { pos: ['mole under left eye','mole under right eye','mole near mouth','mole on cheek','mole on neck','mole on collarbone'], face: true  }],
  ['scar',      { pos: ['facial scar','scar above eyebrow','scar on cheek','scar on neck'],                                                  face: true  }],
  ['birthmark', { pos: ['birthmark on cheek','birthmark on neck','birthmark on shoulder'],                                                   face: false }],
  ['tattoo',    { pos: ['tattoo on shoulder','tattoo on upper arm','tattoo on back','tattoo on thigh'],                                      face: false }],
  ['bandaid',   { pos: ['bandaid on cheek','bandaid on forehead','bandaid on nose'],                                                         face: true  }],
  ['eyepatch',  { pos: ['eyepatch over left eye','eyepatch over right eye'],                                                                 face: true  }],
]);
const FM_FACE_NEUTRAL = new Set(['neck','collarbone','shoulder','back','thigh','arm']);

export function applyFeatureMakerLayer(blockMap) {
  const allText = [...blockMap.values()].map(b => b.text || '').join(', ');
  let faceUsed = hasTag(allText, 'mole under eye') ? 1 : 0;

  for (const [blockId, block] of blockMap) {
    if (!block.text || block.locked) continue;
    let text = block.text;
    let changed = false;

    for (const [baseTag, { pos, face }] of FM_POSITIONS) {
      if (!hasTag(text, baseTag)) continue;

      let available = pos;
      if (face && faceUsed >= 2) {
        // 顔に特徴が集中している場合は首・肩等の非顔位置のみ許可
        available = pos.filter(p => [...FM_FACE_NEUTRAL].some(n => p.includes(n)));
        if (available.length === 0) continue;
      }

      const chosen = available[Math.floor(Math.random() * available.length)];
      text = removeTag(text, baseTag);
      text = appendTag(text, chosen, block.strength);
      changed = true;
      if (face && [...FM_FACE_NEUTRAL].every(n => !chosen.includes(n))) faceUsed++;
    }

    if (changed) blockMap.set(blockId, { ...block, text });
  }
}

// ── 雰囲気タグ自動付与レイヤー ────────────────────────────────────────────
// chardesign: 5% / illust: 55% の確率で背景ブロックに雰囲気タグを1つ付与。
const ATMOSPHERE_TAGS = [
  'calm atmosphere', 'ethereal atmosphere', 'moody atmosphere', 'shadowy atmosphere',
  'candlelit atmosphere', 'rainy atmosphere', 'cinematic atmosphere', 'pastel atmosphere',
  'misty atmosphere', 'sunset atmosphere',
];
const SIMPLE_BG_SET = new Set(['white background', 'simple background', 'gradient background', 'bokeh background', 'abstract background']);

export function applyAtmosphereLayer(blockMap, mode) {
  const prob = mode === 'chardesign' ? 0.05 : 0.55;
  if (Math.random() > prob) return;
  const bgBlock = blockMap.get('background');
  if (!bgBlock || bgBlock.locked) return;
  const text = bgBlock.text || '';
  if ([...SIMPLE_BG_SET].some(t => hasTag(text, t))) return;
  const pick = ATMOSPHERE_TAGS[Math.floor(Math.random() * ATMOSPHERE_TAGS.length)];
  if (hasTag(text, pick)) return;
  blockMap.set('background', { ...bgBlock, text: appendTag(text, pick, bgBlock.strength) });
}
