const KEY_STORAGE = "sonora:elevenlabs:key";
const KROK_VOICE_STORAGE = "sonora:krok:voice-id";

export const MISSING_KEY_MESSAGE = "Configure sua chave em Configurações";

export function loadElevenLabsKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return (localStorage.getItem(KEY_STORAGE) ?? "").trim();
  } catch {
    return "";
  }
}

export function saveElevenLabsKey(key: string) {
  const value = key.trim();
  try {
    if (!value) localStorage.removeItem(KEY_STORAGE);
    else localStorage.setItem(KEY_STORAGE, value);
  } catch {
    // private mode / quota
  }
}

export function clearElevenLabsKey() {
  try {
    localStorage.removeItem(KEY_STORAGE);
  } catch {
    // ignore
  }
}

export function loadKrokVoiceId(): string {
  if (typeof window === "undefined") return "";
  try {
    return (localStorage.getItem(KROK_VOICE_STORAGE) ?? "").trim();
  } catch {
    return "";
  }
}

export function saveKrokVoiceId(id: string) {
  const value = id.trim();
  try {
    if (!value) localStorage.removeItem(KROK_VOICE_STORAGE);
    else localStorage.setItem(KROK_VOICE_STORAGE, value);
  } catch {
    // ignore
  }
}

export function maskKey(key: string) {
  const trimmed = key.trim();
  if (trimmed.length <= 8) return trimmed ? "••••" : "";
  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`;
}

/** Premade ElevenLabs IDs used as the catalog fallback. */
export const ELEVENLABS_VOICE_IDS: Record<string, string> = {
  krok: "nPczCjzI2devNBz1zQrb", // Brian — deep, clear narrator (Krok)
  orion: "JBFqnCBsd6RMkjVDRZzb",
  altair: "XB0fDUnXU5powFXDhCwa",
  zagan: "pNInz6obpgDQGcFmaJgB",
  perseus: "onwK4e9ZLuTAKqWW03F9",
  lux: "pFZP5JQG7iQjIQuC4Bku",
  lumen: "EXAVITQu4vr4xnSDxMaL",
  ara: "Xb7hH8MSUJpSbSDYk0k2",
  eve: "cgSgspJ2msm6clMCkdW9",
  rigel: "iP95p4xoKVk53GoZ742B",
  ursa: "FGY2WhTYpPnrIDTdsKH5",
  naksh: "SAz9YHcvj6GT2YYXdXww",
  atlas: "TX3LPaxmHKxFdv7VOQHJ",
  celeste: "9BWtsMINqrJLrRacOk9x",
  helios: "IKne3meq5aSn9XLyUdCD",
  iris: "EXAVITQu4vr4xnSDxMaL",
  zenith: "CwhRBWXzGAHq8TQ4Fs17",
  kepler: "SOYHLrjzK2X1ezoPC6cr",
  castor: "N2lVS1w4EtoT3dr4eOWO",
  sirius: "IKne3meq5aSn9XLyUdCD",
  helix: "pNInz6obpgDQGcFmaJgB",
  leo: "onwK4e9ZLuTAKqWW03F9",
  rex: "JBFqnCBsd6RMkjVDRZzb",
  sal: "bIHbv24MWmeRgasZH58o",
  carina: "pFZP5JQG7iQjIQuC4Bku",
  luna: "Xb7hH8MSUJpSbSDYk0k2",
  liora: "9BWtsMINqrJLrRacOk9x",
  aurora: "XB0fDUnXU5powFXDhCwa",
  cosmo: "iP95p4xoKVk53GoZ742B",
};

/** xAI voice used when the server has XAI_API_KEY and no ElevenLabs key. */
export const XAI_VOICE_IDS: Record<string, string> = {
  krok: "leo",
};

export function resolveElevenLabsVoiceId(sonoraId: string, krokOverride?: string) {
  if (sonoraId === "krok") {
    const override = (krokOverride ?? "").trim();
    if (override) return override;
  }
  return ELEVENLABS_VOICE_IDS[sonoraId] ?? ELEVENLABS_VOICE_IDS.krok;
}

export function resolveXaiVoiceId(sonoraId: string) {
  return XAI_VOICE_IDS[sonoraId] ?? sonoraId;
}

export function toElevenLabsLanguage(language: string): string | undefined {
  if (language === "auto") return undefined;
  if (language.startsWith("pt")) return "pt";
  if (language.startsWith("es")) return "es";
  if (language === "en" || language.startsWith("en")) return "en";
  if (language === "fr") return "fr";
  if (language === "it") return "it";
  if (language === "de") return "de";
  if (language === "ja") return "ja";
  return undefined;
}

export const KROK_TEST_TEXT =
  "Olá, eu sou o Krok. Esta é uma leitura de teste em português do Brasil. A voz está clara, natural e pronta para narrar o seu texto.";
