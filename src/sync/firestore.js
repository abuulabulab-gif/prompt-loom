import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { fstore } from '../firebase';

// Strip any blob/local-only fields before writing to Firestore
const toCloudChars = (chars) =>
  chars.map(c => {
    const { _thumbs, ...rest } = c;
    return rest;
  });

export async function pushToCloud(uid, characters) {
  try {
    const ref = doc(fstore, 'users', uid, 'data', 'state');
    await setDoc(ref, {
      characters: toCloudChars(characters),
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
    return snap.data().characters ?? null;
  } catch (e) {
    console.error('pullFromCloud failed', e);
    return null;
  }
}

// Merge local + remote character arrays. Per-character, newer lastModified wins.
// Characters missing from the other side are kept (never deleted by sync).
export function mergeCharacters(local, remote) {
  if (!remote || remote.length === 0) return local;
  if (!local || local.length === 0) return remote;

  const map = new Map();
  for (const c of local)  map.set(c.id, c);
  for (const rc of remote) {
    const lc = map.get(rc.id);
    if (!lc) {
      map.set(rc.id, rc);
    } else {
      if ((rc.lastModified ?? 0) > (lc.lastModified ?? 0)) map.set(rc.id, rc);
    }
  }

  // Preserve local order, append any new chars from cloud
  const localIds = new Set(local.map(c => c.id));
  const cloudOnly = [...map.values()].filter(c => !localIds.has(c.id));
  return [...local.map(c => map.get(c.id)), ...cloudOnly];
}
