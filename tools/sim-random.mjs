// ランダム生成の分布を測る（2026-07-27・ABUU「確率などは全体的に見直してOK」）。
//
// ★確率の設計は体感で語ると必ず外れる。実際に何千体か織って数える道具。
//   使い方： node tools/sim-random.mjs [体数] [mode]
//     例： node tools/sim-random.mjs 3000 chardesign
//
// 合否ではなく**現状の写像**を出すのが仕事。ただし「起きてはいけない組み合わせ」
// （一線・性別矛盾）だけは NG として数え、1件でもあれば終了コード1を返す。
import { BLOCKS_DEF } from '../src/data/blocks.js';
import { weaveRandomCharacter } from '../src/hooks/useRandomGen.js';
import { FEMALE_ONLY_SPECIES, ILLUST_MODE_CONFIG } from '../src/data/constants.js';

const N = Number(process.argv[2] || 2000);
const MODE = process.argv[3] || 'chardesign';

const freshChar = () => ({
  id: 'sim', name: 'sim',
  blocks: BLOCKS_DEF.map(b => ({
    ...b, text: '', strength: '1.0', enabled: true, collapsed: false,
    favTags: [], customTags: [],
  })),
});

const tagsOf = (ch) => {
  const out = new Map();
  for (const b of ch.blocks) {
    if (!b.text || b.id === 'negative') continue;
    for (const seg of b.text.split(',')) {
      const t = seg.trim().replace(/^\(|:[\d.]+\)$|\)$/g, '').trim().toLowerCase();
      if (t) out.set(t, b.id);
    }
  }
  return out;
};

const count = (m, k) => m.set(k, (m.get(k) || 0) + 1);
const pct = (n) => ((n / N) * 100).toFixed(1) + '%';

const gender = new Map(), species = new Map(), skin = new Map();
const hairExpr = new Map(), age = new Map();
let tagTotal = 0;
const violations = { genderSpecies: 0, childSexual: 0, modeBoost: 0, samples: [] };

const GENDERS = ['1girl', '1boy', 'femboy', 'androgynous', '2girls', '2boys', 'multiple girls', 'multiple boys', '1other', 'tomboy'];
const SKINS = ['fair skin', 'pale skin', 'tan skin', 'dark skin', 'olive skin', 'red skin', 'blue skin', 'grey skin', 'green skin'];
const RARE_SKINS = new Set(['red skin', 'blue skin', 'grey skin', 'green skin']);
const HAIR_MULTI = ['gradient hair', 'two-tone hair', 'split-color hair'];
const SEXUAL = ['succubus', 'lingerie', 'cleavage', 'sideboob', 'underboob', 'bare thighs',
  'zettai ryouiki', 'micro bikini', 'bunny suit', 'sultry look', 'seductive gaze', 'teasing smile'];
const MALE = ['1boy', 'femboy', '2boys', 'multiple boys'];

for (let i = 0; i < N; i++) {
  const ch = weaveRandomCharacter(freshChar(), MODE, []);
  const t = tagsOf(ch);
  tagTotal += t.size;

  for (const g of GENDERS) if (t.has(g)) count(gender, g);
  for (const s of FEMALE_ONLY_SPECIES) if (t.has(s)) count(species, s);
  for (const s of SKINS) if (t.has(s)) count(skin, s);
  for (const a of ['child', 'teenage', 'young adult', 'adult']) if (t.has(a)) count(age, a);
  const multi = HAIR_MULTI.filter(h => t.has(h));
  count(hairExpr, multi.length ? multi[0] : '(単色まわり)');

  // ★起きてはいけない組み合わせ
  const male = MALE.find(g => t.has(g));
  const fem = FEMALE_ONLY_SPECIES.find(s => t.has(s));
  if (male && fem) {
    violations.genderSpecies++;
    if (violations.samples.length < 4) violations.samples.push(`${male} + ${fem}`);
  }
  if (t.has('child')) {
    const sx = SEXUAL.find(s => t.has(s));
    if (sx) {
      violations.childSexual++;
      if (violations.samples.length < 4) violations.samples.push(`child + ${sx}`);
    }
  }
}

const show = (title, m, denom = N) => {
  console.log('\n【' + title + '】');
  [...m.entries()].sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log('  ' + k.padEnd(22) + String(v).padStart(5) +
      '  ' + ((v / denom) * 100).toFixed(1) + '%'));
};

console.log(`=== ${MODE} モードで ${N} 体 ===`);
console.log('1体あたりのタグ数（平均）: ' + (tagTotal / N).toFixed(1));
show('性別', gender);
show('女性込みの種族', species);
show('肌色', skin);
console.log('  → レア肌（赤青灰緑）合計: ' +
  pct([...skin.entries()].filter(([k]) => RARE_SKINS.has(k)).reduce((s, [, v]) => s + v, 0)));
show('髪の色数', hairExpr);
show('年齢感', age);

// ★モードの効き（2026-07-27の統合で一番壊れやすい所）：
//   抽選の芯を1本にしたので、イラストの演出ブーストが死んでいないかを毎回見る。
{
  const boost = ILLUST_MODE_CONFIG.boostCompositionTags;
  let hit = 0;
  const M = Math.min(N, 1000);
  for (let i = 0; i < M; i++) {
    const ch = weaveRandomCharacter(freshChar(), MODE);
    const comp = (ch.blocks.find(b => b.id === 'composition')?.text || '').toLowerCase();
    if ([...boost].some(t => comp.includes(t))) hit++;
  }
  const rate = hit / M;
  console.log('\n【モードの効き】演出構図タグの出現: ' + (rate * 100).toFixed(1) + '%');
  if (MODE === 'illust' && rate < 0.5) {
    console.log('  NG イラストモードなのに演出が乗っていない（ブーストが死んでいる）');
    violations.modeBoost = 1;
  }
  if (MODE === 'chardesign' && rate > 0.05) {
    console.log('  NG キャラ特化なのに演出が混ざっている（固定構図が効いていない）');
    violations.modeBoost = 1;
  }
}

console.log('\n【起きてはいけない組み合わせ】');
console.log('  性別 × 女性込み種族 : ' + violations.genderSpecies);
console.log('  幼い見た目 × 性的強調: ' + violations.childSexual);
if (violations.samples.length) console.log('  例: ' + violations.samples.join(' / '));
const ng = violations.genderSpecies + violations.childSexual + violations.modeBoost;
console.log(ng === 0 ? '\nOK  禁止の組み合わせは出ませんでした' : `\nNG  ${ng} 件`);
process.exit(ng === 0 ? 0 : 1);
