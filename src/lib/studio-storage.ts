import { DEFAULT_LANGUAGE, DEFAULT_TEXT, DEFAULT_VOICE_ID, type LanguageId } from "./voices";

const PREFS_KEY = "sonora:prefs:v1";
const DB_NAME = "sonora";
const STORE = "clips";
const MAX_CLIPS = 12;

export type StudioPrefs = {
  text: string;
  voiceId: string;
  language: LanguageId;
  speed: number;
};

export type ClipRecord = {
  id: string;
  text: string;
  voiceId: string;
  language: string;
  speed: number;
  createdAt: number;
  blob: Blob;
};

export function loadPrefs(): StudioPrefs {
  if (typeof window === "undefined") {
    return {
      text: DEFAULT_TEXT,
      voiceId: DEFAULT_VOICE_ID,
      language: DEFAULT_LANGUAGE,
      speed: 1,
    };
  }
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return {
        text: DEFAULT_TEXT,
        voiceId: DEFAULT_VOICE_ID,
        language: DEFAULT_LANGUAGE,
        speed: 1,
      };
    }
    const parsed = JSON.parse(raw) as Partial<StudioPrefs>;
    return {
      text: typeof parsed.text === "string" && parsed.text.length > 0 ? parsed.text : DEFAULT_TEXT,
      voiceId: typeof parsed.voiceId === "string" ? parsed.voiceId : DEFAULT_VOICE_ID,
      language: (parsed.language as LanguageId) || DEFAULT_LANGUAGE,
      speed: typeof parsed.speed === "number" ? parsed.speed : 1,
    };
  } catch {
    return {
      text: DEFAULT_TEXT,
      voiceId: DEFAULT_VOICE_ID,
      language: DEFAULT_LANGUAGE,
      speed: 1,
    };
  }
}

export function savePrefs(prefs: StudioPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // quota / private mode
  }
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveClip(clip: ClipRecord) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(clip);
  });
  const all = await listClips();
  if (all.length > MAX_CLIPS) {
    const extra = all.slice(MAX_CLIPS);
    const db2 = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db2.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      for (const item of extra) tx.objectStore(STORE).delete(item.id);
    });
  }
}

export async function listClips(): Promise<ClipRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as ClipRecord[]) ?? [];
      rows.sort((a, b) => b.createdAt - a.createdAt);
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteClip(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).delete(id);
  });
}
