import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { fstore } from '../firebase';

const MAX_CLOUD_VERSIONS   = 10;
const MAX_CLOUD_PROMPT_LOG = 30;

// Firestore は undefined を invalid-argument として弾く。
// JSON.parse(JSON.stringify()) で undefined キーを除去し、安全なオブジェクトに変換する。
const sanitize = (obj) => JSON.parse(JSON.stringify(obj));

// Strip heavy per-block fields from version snapshots before cloud push.
// `cats` is always rebuilt from BLOCKS_DEF via mergeCharacterBlocks on restore.
// `lastRandomPicks` is ephemeral UI state, not needed in cloud storage.
const slimVersionBlock = (b) => {
  const { cats: _cats, lastRandomPicks: _lrp, ...rest } = b;
  return rest;
};

const toCloudChars = (chars) =>
  chars.map(c => {
    const { _thumbs, versions, promptLog, ...rest } = c;
    const slimVersions = (versions || []).slice(-MAX_CLOUD_VERSIONS).map(ver => ({
      ...ver,
      blocks: (ver.blocks || []).map(slimVersionBlock),
    }));
    const slimPromptLog = (promptLog || []).slice(-MAX_CLOUD_PROMPT_LOG).map(entry => ({
      ...entry,
      blocks: entry.blocks ? entry.blocks.map(slimVersionBlock) : null,
    }));
    return { ...rest, versions: slimVersions, promptLog: slimPromptLog };
  });

export async function pushToCloud(uid, characters, orderUpdatedAt, settings, settingsUpdatedAt, deletedChars) {
  try {
    const ref = doc(fstore, 'users', uid, 'data', 'state');
    // sanitize で undefined を除去してから送信（invalid-argument 防止）
    const clean = sanitize({
      characters:       toCloudChars(characters),
      characterOrder:   characters.map(c => c.id),
      orderUpdatedAt:   orderUpdatedAt ?? Date.now(),
      settings:         settings ?? null,
      settingsUpdatedAt: settingsUpdatedAt ?? 0,
      deletedChars:     deletedChars ?? {},
    });
    // Warn before Firestore's 1 MiB document limit
    const sizeBytes = new Blob([JSON.stringify(clean)]).size;
    if (sizeBytes > 900_000) {
      console.warn('pushToCloud: payload too large', sizeBytes);
      return { ok: false, tooBig: true };
    }
    await setDoc(ref, { ...clean, updatedAt: serverTimestamp() });
    return { ok: true };
  } catch (e) {
    console.error('pushToCloud failed', e?.code ?? e?.name, e);
    return { ok: false, code: e?.code ?? e?.name ?? 'unknown' };
  }
}

export async function pullFromCloud(uid) {
  try {
    const ref = doc(fstore, 'users', uid, 'data', 'state');
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      characters: data.characters ?? [],
      characterOrder: data.characterOrder ?? null,
      orderUpdatedAt: data.orderUpdatedAt ?? 0,
      settings: data.settings ?? null,
      settingsUpdatedAt: data.settingsUpdatedAt ?? 0,
      deletedChars: data.deletedChars ?? {},
    };
  } catch (e) {
    console.error('pullFromCloud failed', e?.code ?? e?.name, e);
    return null;
  }
}

export async function deleteFromCloud(uid) {
  try {
    const ref = doc(fstore, 'users', uid, 'data', 'state');
    await deleteDoc(ref);
    return { ok: true };
  } catch (e) {
    console.error('deleteFromCloud failed', e?.code ?? e?.name, e);
    return { ok: false };
  }
}

// ── 墓標（削除の記録）──────────────────────────────────────────
// {charId: 削除時刻ms}。無いと「こちらで消したキャラを、まだ持っている端末やクラウドが
// 復活させる」（2026-08-06全体見直しで発見＝mergeが問答無用で再追加していた）。
// 勝敗＝墓標の時刻 >= キャラのlastModified なら削除が勝つ。
// 削除より後に編集された（lastModifiedが新しい）キャラは生き残る＝編集の意思を尊重。
const TOMB_MAX = 50;

export function mergeTombs(localTombs, remoteTombs) {
  const out = { ...(localTombs || {}) };
  for (const [id, ts] of Object.entries(remoteTombs || {})) {
    if (!out[id] || ts > out[id]) out[id] = ts;
  }
  // 上限＝古い順に落とす（墓標は再追加防止の一時情報。無限に持たない）
  const entries = Object.entries(out).sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(entries.slice(0, TOMB_MAX));
}

const isDead = (c, tombs) => {
  const ts = tombs?.[c.id];
  return ts !== undefined && ts >= (c.lastModified ?? 0);
};

// Merge local + remote character arrays.
// Per-character: newer lastModified wins.
// Order: whichever side has the larger orderUpdatedAt wins.
// tombs: mergeTombs済みの墓標。該当キャラは両側から除く。
export function mergeCharacters(local, remote, remoteOrder, localOrderAt, remoteOrderAt, tombs) {
  const bury = (arr) => (arr || []).filter(c => !isDead(c, tombs));
  local = bury(local);
  remote = bury(remote);
  if (!remote || remote.length === 0) return local;
  if (!local || local.length === 0) return remote;

  const map = new Map();
  for (const c of local) map.set(c.id, c);
  for (const rc of remote) {
    const lc = map.get(rc.id);
    if (!lc) {
      map.set(rc.id, rc);
    } else {
      if ((rc.lastModified ?? 0) > (lc.lastModified ?? 0)) map.set(rc.id, rc);
    }
  }

  const useRemoteOrder = remoteOrder && (remoteOrderAt ?? 0) > (localOrderAt ?? 0);

  if (useRemoteOrder) {
    const remoteSet = new Set(remoteOrder);
    const extraIds = [...map.keys()].filter(id => !remoteSet.has(id));
    const orderedIds = [...remoteOrder.filter(id => map.has(id)), ...extraIds];
    return orderedIds.map(id => map.get(id));
  } else {
    const localIds = new Set(local.map(c => c.id));
    const cloudOnly = [...map.values()].filter(c => !localIds.has(c.id));
    return [...local.map(c => map.get(c.id)), ...cloudOnly];
  }
}
