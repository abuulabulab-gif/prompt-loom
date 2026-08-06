// ROADMAP.md へ changelog.js の新しい版を転記する（npm run roadmap）
// 一次ソース＝src/data/changelog.js（2026-08-06 一元化）。
// 先頭（最新）から見て、既にROADMAPに居る版に当たったら止まる＝
// 手書き時代の古い項（詳しい書式）はそのまま・積むのは本当に新しい版だけ。
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { CHANGELOG } = await import('file://' + join(root, 'src/data/changelog.js').replace(/\\/g, '/'));

const roadmapPath = join(root, 'ROADMAP.md');
const raw = readFileSync(roadmapPath, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let md = raw.replace(/\r\n/g, '\n');   // 中はLFで扱い、書く時に戻す

const has = v => new RegExp(`^## ${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( |—|$)`, 'm').test(md);

// 先頭から「まだ載っていない版」を集める（載っている版に当たったら打ち止め）
const fresh = [];
for (const e of CHANGELOG) {
  if (has(e.v)) break;
  fresh.push(e);
}

const today = new Date().toISOString().slice(0, 10);
if (fresh.length) {
  // ヘッダブロック（最初の "---" 行）の直後に、新しい順のまま挿入
  const cut = md.indexOf('\n---\n');
  if (cut < 0) { console.error('NG: ROADMAP.md に区切り(---)が見つからない'); process.exit(1); }
  const insertAt = cut + '\n---\n'.length;
  const body = fresh.map(e => `\n## ${e.v} — ${today}\n\n${e.ja}\n\n---\n`).join('');
  md = md.slice(0, insertAt) + body + md.slice(insertAt);
}

// 最終更新日
md = md.replace(/> 最終更新: [\d-]+/, `> 最終更新: ${today}`);

writeFileSync(roadmapPath, md.replace(/\n/g, eol));
console.log(fresh.length ? `OK ${fresh.map(e => e.v).join(', ')} を転記した` : 'OK 転記する新しい版はない');
