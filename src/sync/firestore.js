import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { fstore } from '../firebase';

const toCloudChars = (chars) =>
  chars.map(c => {
    const { _thumbs, ...rest } = c;
    return rest;
  });

export async function pushToCloud(uid, characters, orderUpdatedAt) {
  try {
    const ref = doc(fstore, 'users', uid, 'data', 'state');
    await setDoc(ref, {
      characters: toCloudChars(characters),
      characterOrder: characters.map(c => c.id),
      orderUpdatedAt: orderUpdatedAt ?? Date.now(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.error('pushToCloud failed', e);
    return false;
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

  // Merge individual character data by lastModified
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
    // Apply remote order, then append IDs not covered by remote order
    const remoteSet = new Set(remoteOrder);
    const extraIds = [...map.keys()].filter(id => !remoteSet.has(id));
    const orderedIds = [...remoteOrder.filter(id => map.has(id)), ...extraIds];
    return orderedIds.map(id => map.get(id));
  } else {
    // Preserve local order, append cloud-only chars
    const localIds = new Set(local.map(c => c.id));
    const cloudOnly = [...map.values()].filter(c => !localIds.has(c.id));
    return [...local.map(c => map.get(c.id)), ...cloudOnly];
  }
}
