import { AudioLines, Clock3, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioDeck } from "@/components/audio-deck";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { VoiceRail } from "@/components/voice-rail";
import {
  deleteClip,
  listClips,
  loadPrefs,
  saveClip,
  savePrefs,
  type ClipRecord,
} from "@/lib/studio-storage";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_TEXT,
  DEFAULT_VOICE_ID,
  getVoice,
  LANGUAGES,
  MAX_CHARS,
  SAMPLE_SCRIPTS,
  SPEECH_TAGS,
  type LanguageId,
  type SpeechTag,
  type Voice,
  type VoiceGroup,
} from "@/lib/voices";

type GenerateError = { error?: string };

export function StudioApp() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [language, setLanguage] = useState<LanguageId>(DEFAULT_LANGUAGE);
  const [speed, setSpeed] = useState(1);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<VoiceGroup | "todas">("todas");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [committedText, setCommittedText] = useState<string | null>(null);
  const [history, setHistory] = useState<ClipRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioUrlRef = useRef<string | null>(null);

  const voice = getVoice(voiceId);
  const stale = Boolean(audioUrl && committedText !== null && committedText !== text);

  useEffect(() => {
    const prefs = loadPrefs();
    setText(prefs.text);
    setVoiceId(prefs.voiceId);
    setLanguage(prefs.language);
    setSpeed(prefs.speed);
    setHydrated(true);
    void listClips()
      .then(setHistory)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePrefs({ text, voiceId, language, speed });
  }, [hydrated, text, voiceId, language, speed]);

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const setObjectUrl = useCallback((url: string | null) => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = url;
    setAudioUrl(url);
  }, []);

  const chars = text.length;
  const overLimit = chars > MAX_CHARS;

  const fileName = useMemo(() => {
    const day = new Date().toISOString().slice(0, 10);
    return `sonora-${voice.id}-${day}.mp3`;
  }, [voice.id]);

  function insertTag(tag: SpeechTag) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const selected = text.slice(start, end);
    let next: string;
    let caret: number;
    if (tag.kind === "wrap" && tag.open && tag.close) {
      const inner = selected || "texto";
      next = text.slice(0, start) + tag.open + inner + tag.close + text.slice(end);
      caret = start + tag.open.length + inner.length + tag.close.length;
    } else {
      next = text.slice(0, start) + tag.insert + text.slice(end);
      caret = start + tag.insert.length;
    }
    setText(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  }

  async function generate() {
    if (generating || overLimit || !text.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voiceId,
          language,
          speed,
        }),
      });
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        let message = "Não foi possível gerar a voz.";
        if (type.includes("application/json")) {
          const body = (await res.json()) as GenerateError;
          if (body.error) message = body.error;
        }
        throw new Error(message);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setObjectUrl(url);
      setCommittedText(text);
      const clip: ClipRecord = {
        id: crypto.randomUUID(),
        text,
        voiceId,
        language,
        speed,
        createdAt: Date.now(),
        blob,
      };
      await saveClip(clip);
      setHistory((prev) => [clip, ...prev].slice(0, 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha inesperada ao gerar a voz.");
    } finally {
      setGenerating(false);
    }
  }

  function loadClip(clip: ClipRecord) {
    setText(clip.text);
    setVoiceId(clip.voiceId);
    setLanguage((clip.language as LanguageId) || DEFAULT_LANGUAGE);
    setSpeed(clip.speed);
    setCommittedText(clip.text);
    const url = URL.createObjectURL(clip.blob);
    setObjectUrl(url);
    setError(null);
  }

  async function removeClip(id: string) {
    await deleteClip(id);
    setHistory((prev) => prev.filter((c) => c.id !== id));
  }

  function onSelectVoice(next: Voice) {
    setVoiceId(next.id);
  }

  return (
    <div className="min-h-svh overflow-x-hidden bg-bg text-fg">
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-md bg-elevated shadow-[var(--shadow-border)]">
            <AudioLines className="size-4 text-accent" />
          </span>
          <div>
            <p className="font-serif text-xl leading-none italic text-fg">Sonora</p>
            <p className="mt-1 text-xs text-muted">Estúdio de vozes realistas</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted sm:flex">
          <span
            className={cn(
              "size-1.5 rounded-full",
              generating ? "sonora-led bg-live" : "bg-muted",
            )}
          />
          {generating ? "Gravando" : "Pronto"}
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100svh-65px)] max-w-7xl lg:h-[calc(100svh-65px)] lg:grid-cols-[20rem_minmax(0,1fr)] lg:overflow-hidden">
        <div className="min-w-0 border-b border-border lg:h-full lg:overflow-hidden lg:border-b-0 lg:border-r">
          <VoiceRail
            voiceId={voiceId}
            query={query}
            group={group}
            onQuery={setQuery}
            onGroup={setGroup}
            onSelect={onSelectVoice}
          />
        </div>

        <main className="flex min-w-0 flex-col gap-5 overflow-x-hidden p-4 sm:p-6 lg:overflow-y-auto lg:p-8">
          <div className="sonora-enter">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              {voice.use}
            </p>
            <h1 className="mt-1 font-serif text-4xl italic leading-tight tracking-tight text-fg sm:text-5xl">
              {voice.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted">{voice.tone}</p>
          </div>

          <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              {SAMPLE_SCRIPTS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => setText(sample.text)}
                  className="h-8 rounded-full bg-elevated px-3 text-xs font-medium text-muted transition-colors duration-150 hover:text-fg"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  void generate();
                }
              }}
              maxLength={MAX_CHARS + 200}
              spellCheck
              className="mt-4 min-h-44 text-[1.05rem] leading-[1.65] sm:min-h-56"
              placeholder="Cole ou escreva o texto que a voz deve ler…"
              aria-label="Texto para leitura"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className={cn("text-xs tabular-nums", overLimit ? "text-danger" : "text-subtle")}>
                {chars.toLocaleString("pt-BR")} / {MAX_CHARS.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-subtle">Ctrl ou ⌘ + Enter para gerar</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {SPEECH_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => insertTag(tag)}
                  className="h-8 rounded-md bg-elevated px-2.5 text-xs text-muted transition-colors duration-150 hover:text-fg"
                >
                  {tag.label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-subtle">
                    Idioma
                  </span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as LanguageId)}
                    className="mt-2 h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.12em] text-subtle">
                    Velocidade
                    <span className="tabular-nums text-muted">{speed.toFixed(2)}×</span>
                  </span>
                  <div className="mt-4 px-1">
                    <Slider
                      min={0.7}
                      max={1.5}
                      step={0.05}
                      value={[speed]}
                      onValueChange={(v) => setSpeed(v[0] ?? 1)}
                      aria-label="Velocidade da fala"
                    />
                  </div>
                </label>
              </div>

              <Button
                type="button"
                size="lg"
                onClick={() => void generate()}
                disabled={generating || overLimit || !text.trim()}
                className="w-full sm:w-auto sm:min-w-44"
              >
                {generating ? "Gravando…" : "Gerar voz"}
              </Button>
            </div>

            {error ? (
              <p className="mt-4 text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}
          </section>

          <AudioDeck
            src={audioUrl}
            fileName={fileName}
            generating={generating}
            stale={stale}
          />

          {history.length > 0 ? (
            <section>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                Recentes
              </p>
              <ul className="mt-3 grid gap-2">
                {history.map((clip) => {
                  const v = getVoice(clip.voiceId);
                  return (
                    <li
                      key={clip.id}
                      className="flex items-center gap-3 rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
                    >
                      <button
                        type="button"
                        onClick={() => loadClip(clip)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm text-fg">{clip.text}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                          <span>{v.name}</span>
                          <span className="text-subtle">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="size-3" />
                            {new Date(clip.createdAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                      </button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Apagar da história"
                        onClick={() => void removeClip(clip.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
