// LOOM persistence layer — IndexedDB via Dexie
// Single-row "save state" model for the whole app state.
// Thumbnails are in a separate table so large blobs don't bloat the main state row.

import Dexie from 'dexie';

const db = new Dexie('loom');
db.version(1).stores({
  kv: 'key',
  thumbs: 'id',
});

const STATE_KEY = 'state';

export async function loadState() {
  try {
    const row = await db.kv.get(STATE_KEY);
    return row?.value ?? null;
  } catch (e) {
    console.error('loadState failed', e);
    return null;
  }
}

export async function saveState(state) {
  try {
    await db.kv.put({ key: STATE_KEY, value: state });
    return true;
  } catch (e) {
    console.error('saveState failed', e);
    return false;
  }
}

export async function saveCharImages(id, images) {
  try {
    if (!images || images.length === 0) { await db.thumbs.delete(id); }
    else { await db.thumbs.put({ id, images }); }
    return true;
  } catch (e) { console.error('saveCharImages failed', e); return false; }
}
export async function loadCharImages(id) {
  try {
    const r = await db.thumbs.get(id);
    if (!r) return [];
    if (r.images) return r.images;    // new multi-image format
    if (r.dataUrl) return [r.dataUrl]; // backward compat: old single-thumb
    return [];
  } catch { return []; }
}
export async function deleteCharImages(id) {
  try { await db.thumbs.delete(id); } catch {}
}

export default db;
