import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { fstore } from '../firebase';

// Strip heavy per-block fields from version snapshots before cloud push.
// `cats` is always rebuilt from BLOCKS_DEF via mergeCharacterBlocks on restore.
// `lastRandomPicks` is ephemeral UI state, not needed in cloud storage.
const slimVersionBlock = (b) => {
  const { cats, lastRandomPicks, ...rest } = b;
  return rest;
};

const toCloudChars = (chars) =>
  chars.map(c => {
    const { _thumbs, versions, ...rest } = c;
    const slimVersions = (versions || []).map(ver => ({
      ...ver,
      blocks: (ver.blocks || []).map(slimVersionBlock),
    }));
    return { ...rest, versions: slimVersions };
  });

export async function pushToCloud(uid, characters, orderUpdatedAt, settings, settingsUpdatedAt) {
  try {
    const ref = doc(fstore, 'users', uid, 'data', 'state');
    const payload = {
      characters: toCloudChars(characters),
      characterOrder: characters.map(c => c.id),
      orderUpdatedAt: orderUpdatedAt ?? Date.now(),
      settings: settings ?? null,
      settingsUpdatedAt: settingsUpdatedAt ?? 0,
      updatedAt: serverTimestamp(),
    };
    // Warn before Firestore's 1 MiB document limit
    const sizeBytes = new Blob([JSON.stringify(payload)]).size;
    if (sizeBytes > 900_000) {
      console.warn('pushToCloud: payload too large', sizeBytes);
      return { ok: false, tooBig: true };
    }
    await setDoc(ref, payload);
    return { ok: true };
  } catch (e) {
    console.error('pushToCloud failed', e);
    return { ok: false };
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
    };
  } catch (e) {
    console.error('pullFromCloud failed', e);
    return null;
  }
}

// Merge local + remote character arrays.
// Per-character: newer lastModified wins.
// Order: whichever side has the larger orderUpdatedAt wins.
export function mergeCharacters(local, remote, remoteOrder, localOrderAt, remoteOrderAt) {
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
