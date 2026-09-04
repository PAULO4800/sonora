export type VoiceGroup =
  | "narracao"
  | "assistente"
  | "comercial"
  | "personagem"
  | "bemestar";

export type Voice = {
  id: string;
  name: string;
  tone: string;
  use: string;
  group: VoiceGroup;
};

export const VOICE_GROUPS: { id: VoiceGroup | "todas"; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "narracao", label: "Narração" },
  { id: "assistente", label: "Assistente" },
  { id: "comercial", label: "Comercial" },
  { id: "personagem", label: "Personagem" },
  { id: "bemestar", label: "Bem-estar" },
];

export const VOICES: Voice[] = [
  {
    id: "orion",
    name: "Orion",
    tone: "Rica, cinematográfica e ressonante",
    use: "Audiolivros",
    group: "narracao",
  },
  {
    id: "altair",
    name: "Altair",
    tone: "Elegante, refinada e premium",
    use: "Narração",
    group: "narracao",
  },
  {
    id: "zagan",
    name: "Zagan",
    tone: "Poderosa, dramática e marcante",
    use: "Personagens",
    group: "narracao",
  },
  {
    id: "perseus",
    name: "Perseus",
    tone: "Forte, confiante e confiável",
    use: "Narração",
    group: "narracao",
  },
  {
    id: "lux",
    name: "Lux",
    tone: "Serena, calma e sábia",
    use: "Narração",
    group: "narracao",
  },
  {
    id: "lumen",
    name: "Lumen",
    tone: "Acolhedora, articulada e envolvente",
    use: "Educação",
    group: "narracao",
  },
  {
    id: "ara",
    name: "Ara",
    tone: "Acolhedora e amigável",
    use: "Conversas",
    group: "assistente",
  },
  {
    id: "eve",
    name: "Eve",
    tone: "Energética e animada",
    use: "Assistente",
    group: "assistente",
  },
  {
    id: "rigel",
    name: "Rigel",
    tone: "Precisa, profissional e segura",
    use: "Suporte",
    group: "assistente",
  },
  {
    id: "ursa",
    name: "Ursa",
    tone: "Amigável, calorosa e constante",
    use: "Podcast",
    group: "assistente",
  },
  {
    id: "naksh",
    name: "Naksh",
    tone: "Calorosa, ponderada e sábia",
    use: "Suporte",
    group: "assistente",
  },
  {
    id: "atlas",
    name: "Atlas",
    tone: "Confiante, firme e tranquilizadora",
    use: "Assistente",
    group: "assistente",
  },
  {
    id: "celeste",
    name: "Celeste",
    tone: "Compassiva, segura e reconfortante",
    use: "Suporte",
    group: "assistente",
  },
  {
    id: "helios",
    name: "Helios",
    tone: "Animada, versátil e energética",
    use: "Assistente",
    group: "assistente",
  },
  {
    id: "iris",
    name: "Iris",
    tone: "Amigável, alegre e encantadora",
    use: "Vendas",
    group: "comercial",
  },
  {
    id: "zenith",
    name: "Zenith",
    tone: "Nítida, focada e determinada",
    use: "Publicidade",
    group: "comercial",
  },
  {
    id: "kepler",
    name: "Kepler",
    tone: "Inventiva, moderna e carismática",
    use: "Podcast",
    group: "comercial",
  },
  {
    id: "castor",
    name: "Castor",
    tone: "Carismática, descontraída e próxima",
    use: "Vendas",
    group: "comercial",
  },
  {
    id: "sirius",
    name: "Sirius",
    tone: "Ágil, esperta e brincalhona",
    use: "Personagens",
    group: "personagem",
  },
  {
    id: "helix",
    name: "Helix",
    tone: "Ousada, dinâmica e cheia de adrenalina",
    use: "Comentário",
    group: "personagem",
  },
  {
    id: "leo",
    name: "Leo",
    tone: "Autoritária e forte",
    use: "Personagens",
    group: "personagem",
  },
  {
    id: "rex",
    name: "Rex",
    tone: "Confiante e clara",
    use: "Personagens",
    group: "personagem",
  },
  {
    id: "sal",
    name: "Sal",
    tone: "Suave e equilibrada",
    use: "Personagens",
    group: "personagem",
  },
  {
    id: "carina",
    name: "Carina",
    tone: "Suave, empática e reconfortante",
    use: "Bem-estar",
    group: "bemestar",
  },
  {
    id: "luna",
    name: "Luna",
    tone: "Gentil, paciente e atenciosa",
    use: "Educação",
    group: "bemestar",
  },
  {
    id: "liora",
    name: "Liora",
    tone: "Calma, estável e luminosa",
    use: "Bem-estar",
    group: "bemestar",
  },
  {
    id: "aurora",
    name: "Aurora",
    tone: "Serena, constante e radiante",
    use: "Suporte",
    group: "bemestar",
  },
  {
    id: "cosmo",
    name: "Cosmo",
    tone: "Clara, curiosa e fácil de seguir",
    use: "Educação",
    group: "bemestar",
  },
];

export const VOICE_IDS = new Set(VOICES.map((v) => v.id));

export const DEFAULT_VOICE_ID = "orion";

export function getVoice(id: string) {
  return VOICES.find((v) => v.id === id) ?? VOICES[0];
}

export const LANGUAGES = [
  { id: "pt-BR", label: "Português (Brasil)" },
  { id: "pt-PT", label: "Português (Portugal)" },
  { id: "auto", label: "Detectar idioma" },
  { id: "en", label: "Inglês" },
  { id: "es-MX", label: "Espanhol (México)" },
  { id: "es-ES", label: "Espanhol (Espanha)" },
  { id: "fr", label: "Francês" },
  { id: "it", label: "Italiano" },
  { id: "de", label: "Alemão" },
  { id: "ja", label: "Japonês" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const LANGUAGE_IDS = new Set<string>(LANGUAGES.map((l) => l.id));

export const DEFAULT_LANGUAGE: LanguageId = "pt-BR";

export const MAX_CHARS = 2500;

export const SAMPLE_SCRIPTS: { id: string; label: string; text: string }[] = [
  {
    id: "intro",
    label: "Apresentação",
    text: "Bom dia. Este é o Sonora, um estúdio de vozes realistas. Cole o seu texto aqui e escolha uma voz para ouvir a leitura com clareza, ritmo e emoção.",
  },
  {
    id: "ad",
    label: "Anúncio",
    text: "Chegou o nhoque artesanal da Cristina. Massa macia, molho caseiro e entrega rápida na região. Peça agora pelo WhatsApp e receba quentinho em casa. O sabor que a família pede toda semana.",
  },
  {
    id: "story",
    label: "História",
    text: "Naquela tarde o vento mudou de direção. Ela parou no meio da rua, respirou fundo e, pela primeira vez em meses, sorriu sem motivo. Às vezes a vida avisa assim: chega, é hora de recomeçar.",
  },
  {
    id: "msg",
    label: "Recado",
    text: "Oi, tudo bem? Passando para lembrar do nosso encontro amanhã às três. Se atrasar, me avisa. Beijo, a gente se fala.",
  },
];

export const DEFAULT_TEXT = SAMPLE_SCRIPTS[0].text;

export type SpeechTag = {
  id: string;
  label: string;
  kind: "inline" | "wrap";
  insert: string;
  open?: string;
  close?: string;
};

export const SPEECH_TAGS: SpeechTag[] = [
  { id: "pause", label: "Pausa", kind: "inline", insert: "[pause] " },
  { id: "long-pause", label: "Pausa longa", kind: "inline", insert: "[long-pause] " },
  { id: "laugh", label: "Risada", kind: "inline", insert: "[laugh] " },
  { id: "sigh", label: "Suspiro", kind: "inline", insert: "[sigh] " },
  { id: "breath", label: "Respiro", kind: "inline", insert: "[breath] " },
  {
    id: "whisper",
    label: "Sussurro",
    kind: "wrap",
    insert: "",
    open: "<whisper>",
    close: "</whisper>",
  },
  {
    id: "emphasis",
    label: "Ênfase",
    kind: "wrap",
    insert: "",
    open: "<emphasis>",
    close: "</emphasis>",
  },
  {
    id: "slow",
    label: "Devagar",
    kind: "wrap",
    insert: "",
    open: "<slow>",
    close: "</slow>",
  },
  {
    id: "fast",
    label: "Rápido",
    kind: "wrap",
    insert: "",
    open: "<fast>",
    close: "</fast>",
  },
  {
    id: "soft",
    label: "Suave",
    kind: "wrap",
    insert: "",
    open: "<soft>",
    close: "</soft>",
  },
];
