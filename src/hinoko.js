/* HINOKO（ローカルのAI制作工房）との連携。
 *
 * ★方針（RIN-OS DESIGN §3t・ABUU裁定 2026-07-20）：
 *   LOOMを**コピーして改造しない**。コードは1つのまま、
 *   「HINOKOに繋がる時だけ連携機能が現れる」形にする。
 *
 *   理由：HINOKO専用に分岐したLOOMを別に持つと、必ず本家と食い違う
 *   （2026-07-15にkeibaで同じ事故＝同じ物が2回実装され、
 *    古い方が参照され続けた）。分岐はビルドや設定で持たず、**実行時に見る**。
 *
 * ★これにより prompt-loom.com（公開版）は無傷：
 *   HINOKOは各自のPCの中にしか居ないので、公開版では下の確認が必ず失敗し、
 *   連携ボタンは**そもそも出ない**。他人が壊れたボタンを踏むことがない。
 *
 * 役割分担（ABUUの線引き）：
 *   プロンプトを作る＝LOOM ／ 絵を生成する＝HINOKO
 *   だからここは「作ったものを渡す」だけ。生成の設定には立ち入らない。
 */

const HUB = 'http://127.0.0.1:7800';
const TIMEOUT = 1200;

/** HINOKOが今このPCで動いているか。動いていなければ null。 */
export async function findHinoko() {
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), TIMEOUT);
    const r = await fetch(`${HUB}/api/status`, { signal: ac.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    const s = await r.json();
    return { url: HUB, alive: !!s.alive, engine: s.engine || '' };
  } catch {
    return null;   // 公開版はいつもここに来る＝連携機能は現れない
  }
}

/** 作ったプロンプトをHINOKOの作業台に置く。
 *  ★描き始めない。**置くだけ**。
 *    何をどう描くか（大きさ・枚数・仕上げ）はHINOKO側で人が決めるものなので、
 *    こちらが勝手に走らせない。渡したあとの主導権は向こうに返す。 */
export async function sendToHinoko(prompt, negative) {
  const r = await fetch(`${HUB}/api/handoff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ want: prompt || '', avoid: negative || '', from: 'LOOM' }),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.error || 'HINOKOに渡せませんでした');
  }
  return r.json();
}

/** HINOKOの画面を開く（渡したあと、人がそちらへ移れるように）。 */
export function openHinoko() {
  window.open(HUB, 'hinoko');
}
