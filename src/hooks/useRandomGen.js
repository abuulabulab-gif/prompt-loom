import { useState } from "react";
import {
  appendTag, hasTag, removeTag, splitTags, bareTag,
  OPTIONAL_CAT_NAMES, RARE_OPT_CAT_NAMES, BLOCK_RANDOM_RULES, SPECIES_PARTS_MAP, RANDOM_EXCLUDE_TAGS,
  TIER3_TAGS, TIER2_BLOCK_IDS, RANDOM_EXCLUSION_RULES, RANDOM_COMBO_RULES,
  CHARDESIGN_MODE_CONFIG, ILLUST_MODE_CONFIG, WEAPON_TAGS, WEAPON_PICK_PROB, HAND_POSE_TAGS, KEMONOMIMI_PAIRS,
} from "../data/constants.js";

const RARE_OPT_CAT_PROB = 0.10; // rare optional cats: 10% vs standard 40%
import { CONFLICT_MAP } from "../data/conflicts.js";
import { COLOR_PALETTE, SHADES, COLOR_TARGETS, buildColorTag, buildColorName, HUE_GROUPS,
  CM_PRIMARY_OUTFIT_TAGS, CM_COMPLETE_OUTFITS,
  CM_OUTFIT_TOPS, CM_OUTFIT_BOTTOMS, CM_OUTFIT_OUTER, CM_OUTFIT_FOOTWEAR, CM_OUTFIT_LEGWEAR,
} from "../data/colors.js";
import { applyMaterialMakerLayer } from "../data/materials.js";

// ── 種族パーツ系統管理 ───────────────────────────────────────────────────
// 動物耳+尻尾のペア定義（両方が同系統であるべき）
const ANIMAL_EAR_TAIL_PAIRS = [
  { ears: 'cat ears',      tail: 'cat tail'      },
  { ears: 'fox ears',      tail: 'fox tail'      },
  { ears: 'wolf ears',     tail: 'wolf tail'     },
  { ears: 'dog ears',      tail: 'dog tail'      },
  { ears: 'bunny ears',    tail: 'bunny tail'    },
  { ears: 'tiger ears',    tail: 'tiger tail'    },
  { ears: 'squirrel ears', tail: 'squirrel tail' },
  { ears: 'mouse ears',    tail: 'mouse tail'    },
  { ears: 'sheep ears',    tail: 'sheep horns'   },
  { ears: 'deer ears',     tail: 'deer antlers'  },
  { ears: 'goat ears',     tail: 'goat horns'    },
  { ears: 'horse ears',    tail: 'horse tail'    },
  { ears: 'cow ears',      tail: 'cow tail'      },
];
const ALL_ANIMAL_EAR_TAGS  = new Set(ANIMAL_EAR_TAIL_PAIRS.map(p => p.ears).concat(['animal ears']));
const ALL_ANIMAL_TAIL_TAGS = new Set(ANIMAL_EAR_TAIL_PAIRS.map(p => p.tail).concat(['fluffy tail', 'multiple tails']));
// 非獣系種族: 通常は動物耳・動物尻尾を付与しない
const NON_ANIMAL_SPECIES_TAGS = new Set([
  'elf','dark elf','angel','demon','vampire','witch','fairy',
  'ghost','slime girl','mermaid','lamia','dragon girl','oni','doll','android',
  'human','harpy','succubus','goblin girl','monster girl',
]);
// ハイブリッド確率（モード別）— この確率で例外的に動物パーツを許可
const HYBRID_CHANCE_CHARDESIGN = 0.05; // 5%
const HYBRID_CHANCE_ILLUST     = 0.08; // 8%

// アンドロイド・ドールが主役の場合に通常は抑制する有機系ファンタジーパーツ
const NON_BIOLOGICAL_SPECIES = new Set(['android', 'doll']);
const ANDROID_ORGANIC_PARTS  = new Set(['oni horns', 'small horns', 'deer antlers', 'paw pads', 'scale skin']);

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

const COLOR_CAT_IDS = new Set(['face_haircolor', 'face_eyecolor']);
const COLOR_CAT_TARGET = { face_haircolor: 'hair', face_eyecolor: 'eyes' };

// ── フェーズ4: 多様性クールダウン ────────────────────────────────────
// 直近の生成で使ったタグを記憶し、しばらく出にくくする
const COOLDOWN_CAT_IDS = new Set([
  'attr_species', 'face_haircolor', 'face_hairstyle', 'face_eyecolor',
  'body_shape', 'body_structure', 'body_bust', 'outfit_formal', 'outfit_uniform', 'outfit_ethnic', 'outfit_cosplay', 'outfit_swim', 'outfit_lingerie',
  'comp_distance', 'comp_angle', 'face_expression',
  'bg_simple', 'bg_outdoor', 'bg_indoor',
]);
const COOLDOWN_KEY  = 'loom_random_cooldown_v1';
const COOLDOWN_SIZE = 5; // 直近5回分を記憶
// 使ってからの回数ごとの重み (0=直前, 1=1回前, 2=2回前, 3=3回前)
const COOLDOWN_DECAY = [0.15, 0.45, 0.70, 0.85];

function loadCooldown() {
  try { return JSON.parse(localStorage.getItem(COOLDOWN_KEY) || '[]'); }
  catch { return []; }
}
function saveCooldown(hist) {
  localStorage.setItem(COOLDOWN_KEY, JSON.stringify(hist.slice(-COOLDOWN_SIZE)));
}
function cdWeight(key, catId, hist) {
  if (!key || !COOLDOWN_CAT_IDS.has(catId) || !hist.length) return 1.0;
  const k = key.toLowerCase();
  for (let i = hist.length - 1; i >= 0; i--) {
    if (hist[i]?.[catId] === k) return COOLDOWN_DECAY[hist.length - 1 - i] ?? 1.0;
  }
  return 1.0;
}
// 重みつきランダムでインデックスを返す
function wIdx(weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  if (!total) return Math.floor(Math.random() * weights.length);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; }
  return weights.length - 1;
}

function pickWeightedShade() {
  const r = Math.random();
  if (r < 0.65) return SHADES.find(s => s.id === 'normal');
  if (r < 0.85) return SHADES.find(s => s.id === 'light');
  return SHADES.find(s => s.id === 'dark');
}

function pickHeterochromiaPair() {
  const groupIdx1 = Math.floor(Math.random() * HUE_GROUPS.length);
  let groupIdx2;
  do { groupIdx2 = Math.floor(Math.random() * HUE_GROUPS.length); } while (groupIdx2 === groupIdx1);
  const colorEn1 = HUE_GROUPS[groupIdx1][Math.floor(Math.random() * HUE_GROUPS[groupIdx1].length)];
  const colorEn2 = HUE_GROUPS[groupIdx2][Math.floor(Math.random() * HUE_GROUPS[groupIdx2].length)];
  const shade1 = pickWeightedShade();
  const shade2 = pickWeightedShade();
  const name1  = buildColorName(shade1.en, colorEn1);
  const name2  = buildColorName(shade2.en, colorEn2);
  const col1Ja = COLOR_PALETTE.find(c => c.en === colorEn1)?.ja ?? colorEn1;
  const col2Ja = COLOR_PALETTE.find(c => c.en === colorEn2)?.ja ?? colorEn2;
  const ja1 = shade1.id !== 'normal' ? `${shade1.ja}${col1Ja}` : col1Ja;
  const ja2 = shade2.id !== 'normal' ? `${shade2.ja}${col2Ja}` : col2Ja;
  return { en: `${name1} and ${name2} eyes`, extraEn: 'heterochromia', ja: `${ja1}と${ja2}オッドアイ` };
}

function picksToText(picks, strength) {
  let text = '';
  for (const t of picks) {
    text = appendTag(text, t.en, strength);
    if (Array.isArray(t.extraEn)) {
      for (const e of t.extraEn) text = appendTag(text, e, strength);
    } else if (t.extraEn) {
      text = appendTag(text, t.extraEn, strength);
    }
  }
  return text;
}

// ── 髪色表現タイプ ─────────────────────────────────────────────────────────
// [単色, グラデ, ツートン, スプリット, 部分カラー, 前髪カラー]
const HAIR_EXPR_WEIGHTS = {
  chardesign: [55, 10,  8,  7, 13,  7],
  illust:     [40, 15, 12, 10, 13, 10],
};
const HAIR_EXPR_TYPES    = ['solid','gradient','twotone','split','partial','bangs'];
const HAIR_PARTIAL_TGTS  = ['inner hair', 'hair tips', 'sidelocks', 'streak in bangs'];
const HAIR_BANGS_TGTS    = ['bangs', 'forelock'];

function pickContrastingColor(baseColorEn) {
  const baseIdx = HUE_GROUPS.findIndex(g => g.includes(baseColorEn));
  let idx; let t = 0;
  do { idx = Math.floor(Math.random() * HUE_GROUPS.length); } while (idx === baseIdx && ++t < 10);
  const g = HUE_GROUPS[idx];
  return g[Math.floor(Math.random() * g.length)];
}

function pickSimilarColor(baseColorEn) {
  const baseIdx = HUE_GROUPS.findIndex(g => g.includes(baseColorEn));
  if (baseIdx === -1) return pickContrastingColor(baseColorEn);
  let idx = baseIdx;
  if (Math.random() < 0.35) {
    const adj = [(baseIdx - 1 + HUE_GROUPS.length) % HUE_GROUPS.length, (baseIdx + 1) % HUE_GROUPS.length];
    idx = adj[Math.floor(Math.random() * adj.length)];
  }
  const g = HUE_GROUPS[idx];
  const cands = idx === baseIdx ? g.filter(c => c !== baseColorEn) : g;
  return (cands.length ? cands : g)[Math.floor(Math.random() * (cands.length || g.length))];
}

function pickHairColorExpression(hist, mode) {
  const baseWeights = COLOR_PALETTE.map(c => cdWeight(c.en, 'face_haircolor', hist));
  const baseColor   = COLOR_PALETTE[wIdx(baseWeights)];
  const baseShade   = pickWeightedShade();
  const baseEn      = buildColorName(baseShade.en, baseColor.en) + ' hair';
  const baseJa      = baseShade.id !== 'normal' ? `${baseShade.ja}${baseColor.ja}` : baseColor.ja;
  const base        = { en: baseEn, _tk: baseColor.en, _ci: 'face_haircolor' };

  const exprW  = HAIR_EXPR_WEIGHTS[mode] ?? HAIR_EXPR_WEIGHTS.illust;
  const expr   = HAIR_EXPR_TYPES[wIdx(exprW)];
  if (expr === 'solid') return { ...base, ja: `${baseJa}髪` };

  const needsContrast = expr === 'twotone' || expr === 'split';
  const c2En    = needsContrast ? pickContrastingColor(baseColor.en) : pickSimilarColor(baseColor.en);
  const shade2  = pickWeightedShade();
  const tag2En  = buildColorName(shade2.en, c2En) + ' hair';
  const c2Obj   = COLOR_PALETTE.find(c => c.en === c2En) || { ja: c2En };
  const c2Ja    = shade2.id !== 'normal' ? `${shade2.ja}${c2Obj.ja}` : c2Obj.ja;
  if (expr === 'gradient') return { ...base, extraEn: ['gradient hair', tag2En],     ja: `${baseJa}→${c2Ja}グラデ` };
  if (expr === 'twotone')  return { ...base, extraEn: ['two-tone hair', tag2En],     ja: `${baseJa}×${c2Ja}ツートン` };
  if (expr === 'split')    return { ...base, extraEn: ['split-color hair', tag2En],  ja: `${baseJa}×${c2Ja}スプリット` };

  // 部分カラー
  const accentColorEn = pickContrastingColor(baseColor.en);
  const accentShade   = pickWeightedShade();
  const accentObj     = COLOR_PALETTE.find(c => c.en === accentColorEn) || { ja: accentColorEn };
  const accentJa      = accentShade.id !== 'normal' ? `${accentShade.ja}${accentObj.ja}` : accentObj.ja;
  if (expr === 'partial') {
    const targetEn  = HAIR_PARTIAL_TGTS[Math.floor(Math.random() * HAIR_PARTIAL_TGTS.length)];
    const accentTag = buildColorTag(accentShade.en, accentColorEn, targetEn);
    const targetJa  = COLOR_TARGETS.find(t => t.en === targetEn)?.ja ?? targetEn;
    return { ...base, extraEn: [accentTag], ja: `${baseJa}×${accentJa}${targetJa}` };
  }
  // 前髪カラー
  const bangTgt   = HAIR_BANGS_TGTS[Math.floor(Math.random() * HAIR_BANGS_TGTS.length)];
  const useGrad   = Math.random() < 0.30;
  const accentTag = buildColorTag(accentShade.en, accentColorEn, bangTgt);
  const targetJa  = COLOR_TARGETS.find(t => t.en === bangTgt)?.ja ?? bangTgt;
  const extras    = useGrad ? [`gradient ${bangTgt}`, accentTag] : [accentTag];
  return { ...base, extraEn: extras, ja: `${baseJa}×${accentJa}${targetJa}カラー` };
}

function pickColorCatTag(catId, hist = [], mode = 'illust') {
  if (catId === 'face_haircolor') return pickHairColorExpression(hist, mode);
  if (catId === 'face_eyecolor' && Math.random() < 0.10) return pickHeterochromiaPair();
  const targetId  = COLOR_CAT_TARGET[catId];
  const targetObj = COLOR_TARGETS.find(t => t.id === targetId);
  const weights   = COLOR_PALETTE.map(c => cdWeight(c.en, catId, hist));
  const color     = COLOR_PALETTE[wIdx(weights)];
  const shade     = pickWeightedShade();
  const en        = buildColorTag(shade.en, color.en, targetObj.en);
  const ja        = shade.id !== 'normal'
    ? `${shade.ja}${color.ja}${targetObj.ja}`
    : `${color.ja}${targetObj.ja}`;
  return { en, ja, _tk: color.en, _ci: catId };
}

function applyExclusionRules(pickedEnTag, excludedTags) {
  const excl = RANDOM_EXCLUSION_RULES.get(pickedEnTag.toLowerCase());
  if (excl) excl.forEach(e => excludedTags.add(e.toLowerCase()));
}

function pickBlockTags(block, globalExcluded, hist = [], mode = 'illust') {
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

    // Weighted gender pick — solo is force-added as post-step in generateRandomChar
    if (cat.id === 'attr_gender') {
      const r = Math.random();
      const genderEn = r < 0.70 ? '1girl' : r < 0.90 ? '1boy' : r < 0.98 ? 'femboy' : 'androgynous';
      const pick = cat.t.find(t => t.en === genderEn);
      if (pick && !globalExcluded.has(pick.en.toLowerCase())) {
        picks.push(pick);
        for (const ct of (CONFLICT_MAP.get(pick.en.toLowerCase()) || [])) globalExcluded.add(ct);
        applyExclusionRules(pick.en, globalExcluded);
      }
      (rules.skipIfPicked?.[cat.n] || []).forEach(n => skippedCats.add(n));
      return;
    }

    if (COLOR_CAT_IDS.has(cat.id)) {
      const pick = pickColorCatTag(cat.id, hist, mode);
      if (!globalExcluded.has(pick.en.toLowerCase())) {
        picks.push(pick);
        for (const ct of (CONFLICT_MAP.get(pick.en.toLowerCase()) || [])) globalExcluded.add(ct);
        applyExclusionRules(pick.en, globalExcluded);
        (rules.skipIfPicked?.[cat.n] || []).forEach(n => skippedCats.add(n));
      }
      return;
    }

    const validT = cat.t.filter(t => {
      const en = t.en.toLowerCase();
      return !RANDOM_EXCLUDE_TAGS.has(t.en)
        && !t.excludeFromRandom
        && !TIER3_TAGS.has(en)
        && !globalExcluded.has(en);
    });
    if (validT.length === 0) return;
    const normalT = validT.filter(t => !t.rareInRandom);
    const rareT   = validT.filter(t =>  t.rareInRandom);
    let pick;
    if (COOLDOWN_CAT_IDS.has(cat.id)) {
      // クールダウン重みつきランダム（直近と同じタグが出にくい）
      const allT = [...normalT, ...rareT];
      const ws   = allT.map(t => (t.rareInRandom ? 0.20 : 1.0) * cdWeight(t.en, cat.id, hist));
      pick = allT[wIdx(ws)];
    } else if (normalT.length === 0) {
      pick = rareT[Math.floor(Math.random() * rareT.length)];
    } else if (rareT.length > 0 && Math.random() < 0.20) {
      pick = rareT[Math.floor(Math.random() * rareT.length)];
    } else {
      pick = normalT[Math.floor(Math.random() * normalT.length)];
    }
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
    const prob = RARE_OPT_CAT_NAMES.has(cat.n) ? RARE_OPT_CAT_PROB : 0.4;
    if (!skippedCats.has(cat.n) && Math.random() < prob) doPick(cat);
  }
  return picks;
}

function pickBlockTagsBoosted(block, globalExcluded, boostTags, hist = [], mode = 'illust') {
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
    // Weighted gender pick — solo is force-added as post-step in generateRandomChar
    if (cat.id === 'attr_gender') {
      const r = Math.random();
      const genderEn = r < 0.70 ? '1girl' : r < 0.90 ? '1boy' : r < 0.98 ? 'femboy' : 'androgynous';
      const pick = cat.t.find(t => t.en === genderEn);
      if (pick && !globalExcluded.has(pick.en.toLowerCase())) {
        picks.push(pick);
        for (const ct of (CONFLICT_MAP.get(pick.en.toLowerCase()) || [])) globalExcluded.add(ct);
        applyExclusionRules(pick.en, globalExcluded);
      }
      (rules.skipIfPicked?.[cat.n] || []).forEach(n => skippedCats.add(n));
      return;
    }
    if (COLOR_CAT_IDS.has(cat.id)) {
      const pick = pickColorCatTag(cat.id, hist, mode);
      if (!globalExcluded.has(pick.en.toLowerCase())) {
        picks.push(pick);
        for (const ct of (CONFLICT_MAP.get(pick.en.toLowerCase()) || [])) globalExcluded.add(ct);
        applyExclusionRules(pick.en, globalExcluded);
        (rules.skipIfPicked?.[cat.n] || []).forEach(n => skippedCats.add(n));
      }
      return;
    }
    const validT = cat.t.filter(t => {
      const en = t.en.toLowerCase();
      return !RANDOM_EXCLUDE_TAGS.has(t.en)
        && !t.excludeFromRandom
        && !TIER3_TAGS.has(en)
        && !globalExcluded.has(en);
    });
    if (validT.length === 0) return;
    // Boost: prefer boost tags 70% of the time if any are available
    const boostedT = validT.filter(t => boostTags.has(t.en.toLowerCase()));
    const normalT  = validT.filter(t => !t.rareInRandom);
    const rareT    = validT.filter(t =>  t.rareInRandom);
    let pick;
    if (boostedT.length > 0 && Math.random() < 0.70) {
      // ブーストタグでもクールダウンを適用
      const bws = boostedT.map(t => cdWeight(t.en, cat.id, hist));
      pick = boostedT[wIdx(bws)];
    } else if (COOLDOWN_CAT_IDS.has(cat.id)) {
      const allT = [...normalT, ...rareT];
      const ws   = allT.map(t => (t.rareInRandom ? 0.20 : 1.0) * cdWeight(t.en, cat.id, hist));
      pick = allT[wIdx(ws)];
    } else if (normalT.length === 0) {
      pick = rareT[Math.floor(Math.random() * rareT.length)];
    } else if (rareT.length > 0 && Math.random() < 0.20) {
      pick = rareT[Math.floor(Math.random() * rareT.length)];
    } else {
      pick = normalT[Math.floor(Math.random() * normalT.length)];
    }
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
    const prob = RARE_OPT_CAT_NAMES.has(cat.n) ? RARE_OPT_CAT_PROB : 0.4;
    if (!skippedCats.has(cat.n) && Math.random() < prob) doPick(cat);
  }
  return picks;
}

function applyIllustSoftPenalties(blockMap) {
  const allTags = new Set();
  for (const [, b] of blockMap) {
    if (!b.text) continue;
    for (const seg of splitTags(b.text)) allTags.add(bareTag(seg).toLowerCase());
  }

  // extreme/face close-up時: 体型・胸・全身ポーズ・遠景背景をSoft Penalty（70%確率で除去）
  const hasStrongCloseUp = allTags.has('extreme close-up') || allTags.has('face close-up');
  if (hasStrongCloseUp) {
    for (const [id, b] of blockMap) {
      if (!b.text || b.locked) continue;
      const segs = splitTags(b.text);
      const filtered = segs.filter(seg =>
        !ILLUST_MODE_CONFIG.closeupSoftPenaltyTags.has(bareTag(seg).toLowerCase()) || Math.random() > 0.70
      );
      if (filtered.length !== segs.length)
        blockMap.set(id, { ...b, text: filtered.join(', ') });
    }
  }

  // 色気アクセント max 1 — 複数拾われた場合はランダムで1つだけ残す
  const sexyPicked = [];
  for (const [id, b] of blockMap) {
    if (!b.text || b.locked) continue;
    for (const seg of splitTags(b.text)) {
      const tag = bareTag(seg).toLowerCase();
      if (ILLUST_MODE_CONFIG.subtleSexyTags.has(tag)) sexyPicked.push({ id, tag: bareTag(seg) });
    }
  }
  if (sexyPicked.length > 1) {
    const keepIdx = Math.floor(Math.random() * sexyPicked.length);
    for (let i = 0; i < sexyPicked.length; i++) {
      if (i === keepIdx) continue;
      const { id, tag } = sexyPicked[i];
      const b = blockMap.get(id);
      if (b && !b.locked) blockMap.set(id, { ...b, text: removeTag(b.text, tag) });
    }
  }

  // 顔隠しタグ × 顔見せタグのペア: 70%確率で隠しタグを除去
  for (const [hidingTag, showingTag] of ILLUST_MODE_CONFIG.faceHidePenaltyPairs) {
    if (allTags.has(hidingTag) && allTags.has(showingTag) && Math.random() < 0.70) {
      for (const [id, b] of blockMap) {
        if (!b.text || b.locked) continue;
        if (hasTag(b.text, hidingTag)) {
          blockMap.set(id, { ...b, text: removeTag(b.text, hidingTag) });
          break;
        }
      }
    }
  }
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
    if (rule.prob !== undefined && Math.random() > rule.prob) continue;
    if (!hasTag(target.text, rule.tag)) {
      target.text = appendTag(target.text, rule.tag, target.strength);
    }
    // Sweep exclusions across ALL blocks (previously only removed from target block)
    const exclusions = RANDOM_EXCLUSION_RULES.get(rule.tag.toLowerCase());
    if (exclusions) {
      for (const [, b] of blockMap) {
        if (b.locked) continue;
        for (const excTag of exclusions) {
          if (hasTag(b.text, excTag)) b.text = removeTag(b.text, excTag);
        }
      }
    }
    // CONFLICT_MAP cross-block cleanup（固定ブロックは対象外）
    for (const ct of (CONFLICT_MAP.get(rule.tag.toLowerCase()) || [])) {
      for (const [bId, b] of blockMap) {
        if (b.locked) continue;
        if (fixedBlockIds?.has(bId)) continue;
        if (hasTag(b.text, ct)) b.text = removeTag(b.text, ct);
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
      continue; // 人間は純粋な人間 — ケモ耳・幻想パーツは付与しない
    }
    if (en === 'kemonomimi girl') {
      const pair = KEMONOMIMI_PAIRS[Math.floor(Math.random() * KEMONOMIMI_PAIRS.length)];
      for (const partEn of pair) { if (!hasTag(text, partEn)) text = appendTag(text, partEn, block.strength); }
      continue;
    }
    if (en === 'monster girl') {
      // 幻想パーツプールからランダムに1〜2カテゴリ選ぶ
      const pools = [
        ['small horns','demon horns','oni horns','dragon horns','deer antlers'],
        ['demon tail','dragon tail'],
        ['demon wings','feathered wings','fairy wings','mechanical wings'],
        ['scale skin','third eye','paw pads','pointy ears','elf ears'],
      ];
      const numParts = Math.random() < 0.45 ? 2 : 1;
      const shuffled = pools.slice().sort(() => Math.random() - 0.5);
      for (let i = 0; i < numParts; i++) {
        const pool = shuffled[i];
        const part = pool[Math.floor(Math.random() * pool.length)];
        if (!hasTag(text, part)) text = appendTag(text, part, block.strength);
      }
      continue;
    }
    for (const partEn of (SPECIES_PARTS_MAP[pick.en] || [])) {
      if (!hasTag(text, partEn)) text = appendTag(text, partEn, block.strength);
    }
  }
  return text;
}

// ── 種族パーツ系統クリーンアップ ─────────────────────────────────────────
// buildSpeciesText 後に呼び出し、動物耳/尻尾の混線を解消する。
// - 非獣系種族（vampire, elf等）: hybridChance 未満の場合のみ動物パーツを残す
// - 獣系（kemonomimi等）: 複数系統が混在していれば1系統に統一
function cleanupAnimalParts(text, picks, speciesCat, strength, hybridChance) {
  const pickedSpecies = picks
    .filter(p => speciesCat?.t.some(st => st.en === p.en))
    .map(p => p.en.toLowerCase());
  const isNonAnimal = pickedSpecies.some(s => NON_ANIMAL_SPECIES_TAGS.has(s));
  const foundPairs  = ANIMAL_EAR_TAIL_PAIRS.filter(p => hasTag(text, p.ears) || hasTag(text, p.tail));

  if (isNonAnimal) {
    if (foundPairs.length > 0) {
      if (Math.random() >= hybridChance) {
        for (const tag of [...ALL_ANIMAL_EAR_TAGS, ...ALL_ANIMAL_TAIL_TAGS]) {
          if (hasTag(text, tag)) text = removeTag(text, tag);
        }
      } else if (foundPairs.length > 1) {
        // ハイブリッド当選: 1系統だけ残す
        const keepIdx = Math.floor(Math.random() * foundPairs.length);
        foundPairs.forEach((p, i) => {
          if (i === keepIdx) return;
          if (hasTag(text, p.ears)) text = removeTag(text, p.ears);
          if (hasTag(text, p.tail)) text = removeTag(text, p.tail);
        });
      }
    }
    // アンドロイド・ドール: 有機系ファンタジーパーツを hybrid chance でのみ許可
    if (pickedSpecies.some(s => NON_BIOLOGICAL_SPECIES.has(s))) {
      for (const part of ANDROID_ORGANIC_PARTS) {
        if (hasTag(text, part) && Math.random() >= hybridChance) text = removeTag(text, part);
      }
    }
    return text;
  }

  // 獣系（kemonomimi / catgirl / human 10% 等）: 1系統に統一
  if (foundPairs.length <= 1) return text;
  const completePairs = foundPairs.filter(p => hasTag(text, p.ears) && hasTag(text, p.tail));
  const keepPair = completePairs.length > 0
    ? completePairs[Math.floor(Math.random() * completePairs.length)]
    : foundPairs[Math.floor(Math.random() * foundPairs.length)];

  // 他系統を除去してから、片方だけ残っているなら補完する
  ANIMAL_EAR_TAIL_PAIRS.forEach(p => {
    if (p === keepPair) return;
    if (hasTag(text, p.ears)) text = removeTag(text, p.ears);
    if (hasTag(text, p.tail)) text = removeTag(text, p.tail);
  });
  if (!hasTag(text, keepPair.ears)) text = appendTag(text, keepPair.ears, strength);
  if (!hasTag(text, keepPair.tail)) text = appendTag(text, keepPair.tail, strength);

  // アンドロイド・ドール: 有機系ファンタジーパーツを hybrid chance でのみ許可
  if (pickedSpecies.some(s => NON_BIOLOGICAL_SPECIES.has(s))) {
    for (const part of ANDROID_ORGANIC_PARTS) {
      if (hasTag(text, part) && Math.random() >= hybridChance) text = removeTag(text, part);
    }
  }

  return text;
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
  // 装飾アクセは衣装ディテール（feature）ブロックに移動したため、そちらも間引く
  const detailB = blockMap.get('feature');
  if (detailB?.text && !detailB.locked) {
    let ftext = detailB.text;
    for (const tag of OUTFIT_ACCENT_TAGS) { if (hasTag(ftext, tag) && Math.random() < 0.60) ftext = removeTag(ftext, tag); }
    if (ftext !== detailB.text) blockMap.set('feature', { ...detailB, text: ftext });
  }
}

// ── カラーメーカー自動付与レイヤー ─────────────────────────────────────────
// 衣装・キャラパーツが存在するとき条件付きで色タグを付与する
// 衣装着色は動的検出：実際の衣装タグをそのまま色ターゲットにする
// （CM_PRIMARY_OUTFIT_TAGS等はcolors.jsからimport済み）

// メイクアップ（フェイスブロック対象）
const CM_MAKEUP_SLOTS = [
  ['eyeshadow', new Set(['eyeshadow','makeup']), 0.60],
  ['lipstick',  new Set(['lipstick', 'makeup']), 0.50],
];
// ribbon/lace/trim/embroidery は衣装ディテール（feature）ブロックに移動済みのため別スロットで管理
const CM_DETAIL_SLOTS = [
  ['ribbon',     new Set(['ribbons','bows','frills']), 0.65, true],
  ['trim',       new Set(['lace trim']),               0.65, true],
  ['embroidery', new Set(['embroidery']),              0.65, true],
  ['lace',       new Set(['lace']),                    0.55, true],
];
const CM_TAIL_TRIGGERS = new Set(['cat tail','fox tail','wolf tail','fluffy tail','bunny tail','dog tail','horse tail','cow tail','demon tail','dragon tail','multiple tails']);

export function applyColorMakerLayer(blockMap, mode) {
  const overallProb = mode === 'chardesign' ? 0.70 : 0.55;
  if (Math.random() > overallProb) return;

  const outfitBlock  = blockMap.get('outfit');
  const attrBlock    = blockMap.get('attribute');
  const detailBlock  = blockMap.get('feature'); // 衣装ディテールブロック（旧 feature）

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
  const MAX_TAGS = 5;

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
    if (dtext !== (detailBlock.text || '')) blockMap.set('feature', { ...detailBlock, text: dtext });
  }

  if (added < MAX_TAGS && attrBlock && !attrBlock.locked) {
    const t = attrBlock.text || '';
    if ([...CM_TAIL_TRIGGERS].some(k => hasTag(t, k)) && Math.random() < 0.55) {
      const tag = makeTag(true, 'tail');
      if (!hasTag(t, tag)) { blockMap.set('attribute', { ...attrBlock, text: appendTag(t, tag, attrBlock.strength) }); added++; }
    }
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

// ── ボディフォーカス自動付与レイヤー ─────────────────────────────────────
// OPTIONAL_CAT_NAMESから除外したbody_focusを衣装・髪型条件つきで後処理付与する。
// chardesign: skipBodyCatsで既にスキップ済みのため低確率のみ。
// illust: 20%確率で候補プール（SFW寄り＋ソシャゲ系低確率）から1つ選出。
const BF_SKIRT_TAGS  = new Set(['skirt','pleated skirt','mini skirt','micro skirt','slit skirt','flared skirt','pencil skirt']);
const BF_LEGWEAR_TAGS = new Set(['thighhighs','knee-high socks','over-knee socks','fishnet tights']);
const BF_OFFSHOULDER = new Set(['off shoulder','sleeveless','dress','sundress','evening gown','bikini','swimsuit','one-piece swimsuit','micro bikini','lingerie','camisole','halter top','tube top']);
const BF_UPDO_HAIR   = new Set(['short hair','bob cut','pixie cut','very short hair','ponytail','high ponytail','low ponytail','side ponytail','hair updo','half updo','hair bun','double bun']);
// ソシャゲ系ボディフォーカス — 衣装との組み合わせ文脈で重み上昇
const BF_CLEAVAGE_TRIGGERS = new Set([
  'bikini','micro bikini','bikini armor','lingerie','bra','babydoll','bunny suit',
  'reverse bunny suit','corset','virgin killer sweater','naked hoodie','monokini','string bikini',
]);
const BF_MIDRIFF_TRIGGERS = new Set([
  'bikini','micro bikini','crop top','tank top','tube top','halter top',
  'sports bra','camisole','naked hoodie','string bikini','monokini',
]);
const BF_THIGH_TRIGGERS = new Set([
  'micro bikini','string bikini','monokini','bikini','mini skirt','micro skirt','sarashi',
]);

function applyBodyFocusLayer(blockMap, mode) {
  const bodyBlock = blockMap.get('body');
  if (!bodyBlock || bodyBlock.locked) return;
  const bodyFocusCat = bodyBlock.cats?.find(c => c.n === 'ボディフォーカス');
  if (!bodyFocusCat) return;

  // 既にbody_focusタグが入っていたらスキップ
  const currentBodyText = bodyBlock.text || '';
  const alreadyHasFocus = bodyFocusCat.t.some(t => hasTag(currentBodyText, t.en));
  if (alreadyHasFocus) return;

  const prob = mode === 'chardesign' ? 0.07 : 0.20;
  if (Math.random() > prob) return;

  const outfitText = blockMap.get('outfit')?.text || '';
  const faceText   = blockMap.get('face')?.text || '';

  const hasSkirt           = [...BF_SKIRT_TAGS].some(t => hasTag(outfitText, t));
  const hasLegwear         = [...BF_LEGWEAR_TAGS].some(t => hasTag(outfitText, t));
  const hasOffShoulder     = [...BF_OFFSHOULDER].some(t => hasTag(outfitText, t));
  const hasUpdoHair        = [...BF_UPDO_HAIR].some(t => hasTag(faceText, t));
  const hasCleavageTrigger = [...BF_CLEAVAGE_TRIGGERS].some(t => hasTag(outfitText, t));
  const hasMidriffTrigger  = [...BF_MIDRIFF_TRIGGERS].some(t => hasTag(outfitText, t));
  const hasThighTrigger    = [...BF_THIGH_TRIGGERS].some(t => hasTag(outfitText, t));

  const candidates = [
    { en: 'bare shoulders', w: hasOffShoulder ? 55 : 35 },
    { en: 'nape',           w: hasUpdoHair    ? 55 : 35 },
    { en: 'zettai ryouiki', w: (hasSkirt && hasLegwear) ? 20 : 2 },
    { en: 'abs',            w: 10 },
    // ソシャゲ系ボディフォーカス — 低確率、衣装トリガーで重み上昇
    { en: 'cleavage',    w: hasCleavageTrigger ? 14 : 4 },
    { en: 'sideboob',    w: hasCleavageTrigger ? 6  : 2 },
    { en: 'midriff',     w: hasMidriffTrigger  ? 14 : 4 },
    { en: 'bare thighs', w: hasThighTrigger    ? 14 : 4 },
    { en: 'underboob',   w: hasCleavageTrigger ? 4  : 1 },
    // 細部から移動 — 露出文脈と紐づいた自然なセット
    { en: 'navel',       w: hasMidriffTrigger  ? 10 : 3 },
    { en: 'collarbone',  w: hasOffShoulder     ? 10 : 3 },
  ];

  const total = candidates.reduce((s, c) => s + c.w, 0);
  let r = Math.random() * total;
  let chosen = candidates[candidates.length - 1];
  for (const c of candidates) { r -= c.w; if (r <= 0) { chosen = c; break; } }

  if (!hasTag(currentBodyText, chosen.en)) {
    blockMap.set('body', { ...bodyBlock, text: appendTag(currentBodyText, chosen.en, bodyBlock.strength) });
  }
}

// ── 雰囲気タグ自動付与レイヤー ────────────────────────────────────────────
// chardesign: 5% / illust: 55% の確率で背景ブロックに雰囲気タグを1つ付与。
// シンプル背景が選ばれている場合はスキップ。
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

    const hist = loadCooldown(); // 直近の生成履歴を読み込み

    setCharacters(prev => prev.map(c => {
      if (c.id !== activeCharId) return c;

      const globalExcluded = new Set();
      // Illust mode: pre-exclude design/reference/simple-background tags
      if (mode === 'illust') {
        ILLUST_MODE_CONFIG.excludedTags.forEach(t => globalExcluded.add(t.toLowerCase()));
      }
      const blockMap = new Map();

      const newBlocks = c.blocks.map(block => {
        if (block.locked) {
          blockMap.set(block.id, { ...block });
          return block;
        }
        if (block.id === 'negative') {
          const negText   = block.text || '';
          const negBlock  = hasTag(negText, 'nsfw')
            ? { ...block }
            : { ...block, text: appendTag(negText, 'nsfw', block.strength) };
          blockMap.set(block.id, negBlock);
          return negBlock;
        }

        if (TIER2_BLOCK_IDS.has(block.id)) {
          // chardesign: always clear; illust: 20% skip → 80% inclusion
          const skipChance = mode === 'chardesign' ? 1.0 : 0.20;
          if (Math.random() < skipChance) {
            const cleared = { ...block, text: '', enabled: true, collapsed: false, lastRandomPicks: [] };
            blockMap.set(block.id, cleared);
            return cleared;
          }
        }

        let newBlock;

        // Quality: chardesign uses illustration-spec fixed tags; illust uses standard quality
        if (block.id === 'quality') {
          const base = mode === 'chardesign'
            ? CHARDESIGN_MODE_CONFIG.qualityText
            : 'masterpiece, best quality, ultra-detailed, highres, absurdres';
          const qText = appendTag(base, 'SFW', block.strength);
          newBlock = { ...block, text: qText, enabled: true, collapsed: false, lastRandomPicks: [] };
        } else if (mode === 'chardesign') {
          const cfg = CHARDESIGN_MODE_CONFIG;

          // Fixed blocks — direct assignment, random pick is NEVER executed for these
          const chardesignFixedText = {
            artstyle:    cfg.artstyleText,
            background:  cfg.backgroundText,
            composition: cfg.compositionText,
          };
          if (chardesignFixedText[block.id] !== undefined) {
            newBlock = { ...block, text: chardesignFixedText[block.id], enabled: true, collapsed: false, lastRandomPicks: [] };
          } else if (block.id === 'face') {
            const filteredBlock = {
              ...block,
              cats: block.cats
                .filter(c => !cfg.skipFaceCats.has(c.n))
                .map(c =>
                  c.n === '表情'
                    ? { ...c, t: c.t.filter(t => cfg.allowedExpressions.has(t.en)) }
                    : c.n === '目つき・形' || c.n === '髪飾り・毛流れ'
                    ? { ...c, t: c.t.filter(t => !cfg.skipFaceTags.has(t.en)) }
                    : c.n === 'メイク・顔演出'
                    ? { ...c, t: c.t.filter(t => cfg.faceMakeupPhysical.has(t.en)) }
                    : c
                ),
            };
            const picks = pickBlockTags(filteredBlock, globalExcluded, hist, 'chardesign');
            newBlock = { ...block, text: picksToText(picks, block.strength), enabled: true, collapsed: false, lastRandomPicks: picks };
          } else if (block.id === 'body') {
            const filteredBlock = { ...block, cats: block.cats.filter(c => !cfg.skipBodyCats.has(c.n)) };
            const picks = pickBlockTags(filteredBlock, globalExcluded, hist, 'chardesign');
            newBlock = { ...block, text: picksToText(picks, block.strength), enabled: true, collapsed: false, lastRandomPicks: picks };
          } else if (block.id === 'feature') {
            const filteredBlock = { ...block, cats: block.cats.filter(c => !cfg.skipFeatureCats.has(c.n)) };
            const picks = pickBlockTags(filteredBlock, globalExcluded, hist, 'chardesign');
            newBlock = { ...block, text: picksToText(picks, block.strength), enabled: true, collapsed: false, lastRandomPicks: picks };
          } else {
            const CHARDESIGN_SKIP_IDS = new Set(['effect', 'lighting', 'scene', 'mood']);
            if (CHARDESIGN_SKIP_IDS.has(block.id)) {
              newBlock = { ...block, text: '', enabled: true, collapsed: false, lastRandomPicks: [] };
            } else {
              const picks = pickBlockTags(block, globalExcluded, hist, 'chardesign');
              let text = picksToText(picks, block.strength);
              if (block.id === 'attribute') {
                const speciesCat = block.cats.find(cat => cat.n === '種族');
                const textBefore = text;
                text = buildSpeciesText(picks, block, speciesCat, text);
                text = cleanupAnimalParts(text, picks, speciesCat, block.strength, HYBRID_CHANCE_CHARDESIGN);
                if (!hasTag(text, 'solo')) text = appendTag(text, 'solo', block.strength);
                const added = splitTags(text).map(bareTag).filter(en => en && !hasTag(textBefore, en) && !picks.some(p => p.en.toLowerCase() === en.toLowerCase()));
                const allPicks = added.length ? [...picks, ...added.map(en => ({ en, ja: en }))] : picks;
                newBlock = { ...block, text, enabled: true, collapsed: false, lastRandomPicks: allPicks };
              } else {
                newBlock = { ...block, text, enabled: true, collapsed: false, lastRandomPicks: picks };
              }
            }
          }
        } else {
          // Illust mode: boost dramatic tags for composition/lighting/effect
          let picks;
          if (mode === 'illust') {
            if (block.id === 'composition') {
              picks = pickBlockTagsBoosted(block, globalExcluded, ILLUST_MODE_CONFIG.boostCompositionTags, hist, mode);
            } else if (block.id === 'lighting') {
              picks = pickBlockTagsBoosted(block, globalExcluded, ILLUST_MODE_CONFIG.boostLightingTags, hist, mode);
            } else if (block.id === 'effect') {
              picks = pickBlockTagsBoosted(block, globalExcluded, ILLUST_MODE_CONFIG.boostEffectTags, hist, mode);
            } else {
              picks = pickBlockTags(block, globalExcluded, hist, mode);
            }
          } else {
            picks = pickBlockTags(block, globalExcluded, hist, mode);
          }
          let text = picksToText(picks, block.strength);
          if (block.id === 'attribute') {
            const speciesCat = block.cats.find(cat => cat.n === '種族');
            const textBefore = text;
            text = buildSpeciesText(picks, block, speciesCat, text);
            text = cleanupAnimalParts(text, picks, speciesCat, block.strength, HYBRID_CHANCE_ILLUST);
            if (!hasTag(text, 'solo')) text = appendTag(text, 'solo', block.strength);
            const added = splitTags(text).map(bareTag).filter(en => en && !hasTag(textBefore, en) && !picks.some(p => p.en.toLowerCase() === en.toLowerCase()));
            picks = added.length ? [...picks, ...added.map(en => ({ en, ja: en }))] : picks;
          }
          // メイク補助表現（illust モード: 基本表情 → 物理演出の自動ペア付与）
          if (mode === 'illust' && block.id === 'face') {
            if (hasTag(text, 'crying') && Math.random() < 0.80)
              text = appendTag(text, 'tear', block.strength);
            else if ((hasTag(text, 'sad') || hasTag(text, 'wistful')) && Math.random() < 0.45)
              text = appendTag(text, 'teardrop', block.strength);
            // sweating はボディブロックへ → RANDOM_COMBO_RULES で付与
            if (hasTag(text, 'angry') && Math.random() < 0.30)
              text = appendTag(text, 'steam', block.strength);
            if (hasTag(text, 'blushing') && !hasTag(text, 'heavy blush') && Math.random() < 0.35)
              text = appendTag(text, 'heavy blush', block.strength);
          }
          newBlock = { ...block, text, enabled: true, collapsed: false, lastRandomPicks: picks };
        }

        blockMap.set(block.id, newBlock);
        return newBlock;
      });

      // ゴブリン娘 → 擬似ゴブリン置換（human + green skin + pointy ears）
      {
        const attrB = blockMap.get('attribute');
        const bodyB = blockMap.get('body');
        if (attrB && !attrB.locked && bodyB && !bodyB.locked && hasTag(attrB.text || '', 'goblin girl')) {
          const attrText = appendTag(removeTag(attrB.text, 'goblin girl'), 'pointy ears', attrB.strength);
          blockMap.set('attribute', { ...attrB, text: attrText });
          if (!hasTag(bodyB.text || '', 'green skin')) {
            blockMap.set('body', { ...bodyB, text: appendTag(bodyB.text || '', 'green skin', bodyB.strength) });
          }
        }
      }

      // スライム娘 → translucent skin + green or blue（50/50）+ liquid body 確定
      {
        const attrB = blockMap.get('attribute');
        const bodyB = blockMap.get('body');
        if (attrB && !attrB.locked && bodyB && !bodyB.locked && hasTag(attrB.text || '', 'slime girl')) {
          const normalSkins = ['fair skin','pale skin','tan skin','dark skin','olive skin','red skin','grey skin','porcelain skin'];
          let bodyText = bodyB.text || '';
          for (const s of normalSkins) bodyText = removeTag(bodyText, s);
          if (!hasTag(bodyText, 'translucent skin')) bodyText = appendTag(bodyText, 'translucent skin', bodyB.strength);
          if (!hasTag(bodyText, 'green skin') && !hasTag(bodyText, 'blue skin'))
            bodyText = appendTag(bodyText, Math.random() < 0.50 ? 'green skin' : 'blue skin', bodyB.strength);
          if (!hasTag(bodyText, 'liquid body')) bodyText = appendTag(bodyText, 'liquid body', bodyB.strength);
          blockMap.set('body', { ...bodyB, text: bodyText });
        }
      }

      applyComboRules(blockMap, mode === 'chardesign' ? CHARDESIGN_MODE_CONFIG.fixedBlocks : null);

      // 最終クリーンアップ: 全ブロックまたがりの矛盾を除去
      // 例: back view（構図）→ smile（顔）を消す、mermaid tail（キャラ）→ boots（衣装）を消す
      // キャラ特化モードの固定ブロックは書き換え禁止
      const fixedIds = mode === 'chardesign' ? CHARDESIGN_MODE_CONFIG.fixedBlocks : null;
      for (const [, src] of blockMap) {
        if (!src.text) continue;
        for (const seg of splitTags(src.text)) {
          const tag  = bareTag(seg).toLowerCase();
          const excls = RANDOM_EXCLUSION_RULES.get(tag);
          if (!excls) continue;
          for (const [tgtId, tgt] of blockMap) {
            if (tgt.locked) continue;
            if (fixedIds?.has(tgtId)) continue;
            for (const excTag of excls) {
              if (hasTag(tgt.text, excTag)) tgt.text = removeTag(tgt.text, excTag);
            }
          }
        }
      }

      // 衣装スタック Soft Penalty: 強いジャンル衣装 + スタイル/装飾の重ねすぎを間引く
      applyOutfitStackPenalty(blockMap);
      // カラーメーカー・マテリアルメーカー・特徴メーカーの条件付き自動付与レイヤー
      applyColorMakerLayer(blockMap, mode);
      applyMaterialMakerLayer(blockMap, mode);
      applyBodyFocusLayer(blockMap, mode);
      applyFeatureMakerLayer(blockMap);
      applyAtmosphereLayer(blockMap, mode);

      // Simple background → suppress lighting and effect (environmental FX clash with plain BG)
      if (mode !== 'chardesign') {
        const bgBlock = blockMap.get('background');
        if (bgBlock) {
          const SIMPLE_BG_TAGS = ['white background', 'simple background', 'gradient background', 'bokeh background', 'abstract background'];
          const hasSimpleBg = SIMPLE_BG_TAGS.some(t => hasTag(bgBlock.text || '', t));
          if (hasSimpleBg) {
            for (const id of ['effect', 'lighting']) {
              const tb = blockMap.get(id);
              if (tb && !tb.locked) blockMap.set(id, { ...tb, text: '', lastRandomPicks: [] });
            }
          }
        }
      }

      // Illust mode: close-up Soft Penalty + 顔隠しペナルティ
      if (mode === 'illust') applyIllustSoftPenalties(blockMap);

      // 生成履歴を保存（シンプル背景クリア後に実行 → 実際の最終状態を記録）
      const histEntry = {};
      for (const [, b] of blockMap) {
        if (!b.cats || !b.text) continue;
        for (const cat of b.cats) {
          if (!COOLDOWN_CAT_IDS.has(cat.id)) continue;
          if (COLOR_CAT_IDS.has(cat.id)) {
            const cp = (b.lastRandomPicks || []).find(p => p._ci === cat.id);
            if (cp?._tk) histEntry[cat.id] = cp._tk.toLowerCase();
          } else {
            for (const t of cat.t) {
              if (hasTag(b.text, t.en)) { histEntry[cat.id] = t.en.toLowerCase(); break; }
            }
          }
        }
      }
      saveCooldown([...hist, histEntry]);

      return {
        ...c,
        blocks: newBlocks.map(b => blockMap.has(b.id) ? blockMap.get(b.id) : b),
        lastModified: Date.now(), // Pull競合対策: ランダム生成結果を必ずローカル優先に
      };
    }));
  };

  return { randomMode, setRandomMode, generateRandomChar };
}
