/** Stable across repo renames (`ap-european-history-active-recall`); changing this resets saved SRS progress. */
const DB_NAME = "history-active-recall-db";
const STORE = "srs";

function openDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("indexedDB unavailable"));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get("all");
    req.onsuccess = () => resolve(req.result || {});
    req.onerror = () => reject(req.error);
  });
}

async function idbSetAll(data) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(data, "all");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const FALLBACK_KEY = "history-active-recall-srs";

export async function loadSrsState() {
  try {
    return await idbGetAll();
  } catch {
    return JSON.parse(localStorage.getItem(FALLBACK_KEY) || "{}");
  }
}

export async function saveSrsState(state) {
  try {
    await idbSetAll(state);
  } catch {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(state));
  }
}

export function applySm2(existing, quality) {
  const q = quality === 1 ? 2 : quality === 2 ? 3 : 5;
  const prev = existing || { repetitions: 0, interval: 0, ef: 2.5 };
  let { repetitions, interval, ef } = prev;
  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else if (repetitions === 0) {
    repetitions = 1;
    interval = 1;
  } else if (repetitions === 1) {
    repetitions = 2;
    interval = 6;
  } else {
    repetitions += 1;
    interval = Math.round(interval * ef);
  }
  ef = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + interval);
  return {
    repetitions,
    interval,
    ef: Number(ef.toFixed(2)),
    nextDue: nextDue.toISOString().slice(0, 10),
    lastReviewed: new Date().toISOString(),
    logs: [...(prev.logs || []), { ts: Date.now(), quality }],
  };
}
