import { Download, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatClock } from "@/lib/utils";

type AudioDeckProps = {
  src: string | null;
  fileName: string;
  generating: boolean;
  stale: boolean;
};

export function AudioDeck({ src, fileName, generating, stale }: AudioDeckProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [peaks, setPeaks] = useState<number[]>([]);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setPeaks([]);
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    if (!src) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(src);
        const buf = await res.arrayBuffer();
        const ctx = new AudioContext();
        const audio = await ctx.decodeAudioData(buf.slice(0));
        if (cancelled) {
          void ctx.close();
          return;
        }
        const data = audio.getChannelData(0);
        const bars = 72;
        const block = Math.max(1, Math.floor(data.length / bars));
        const next: number[] = [];
        for (let i = 0; i < bars; i++) {
          let sum = 0;
          const start = i * block;
          for (let j = 0; j < block; j++) sum += Math.abs(data[start + j] ?? 0);
          next.push(sum / block);
        }
        const max = Math.max(...next, 0.0001);
        setPeaks(next.map((v) => v / max));
        void ctx.close();
      } catch {
        // waveform is decorative
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrent(el.currentTime);
    const onMeta = () => setDuration(el.duration || 0);
    const onEnd = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
    };
  }, [src]);

  const progress = duration > 0 ? current / duration : 0;

  const bars = useMemo(() => {
    if (peaks.length) return peaks;
    return Array.from({ length: 48 }, (_, i) => 0.18 + ((i * 17) % 13) / 40);
  }, [peaks]);

  function toggle() {
    const el = audioRef.current;
    if (!el || !src) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play();
      setPlaying(true);
    }
  }

  function seek(ratio: number) {
    const el = audioRef.current;
    if (!el || !duration) return;
    el.currentTime = Math.min(duration, Math.max(0, ratio * duration));
  }

  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <audio ref={audioRef} src={src ?? undefined} preload="metadata" />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
            Mesa de áudio
          </p>
          <p className="mt-1 font-serif text-lg text-fg">
            {generating ? "Gravando a leitura…" : src ? "Pronto para ouvir" : "Aguardando geração"}
          </p>
        </div>
        {stale && src && !generating ? (
          <p className="text-xs text-muted">Texto alterado — gere de novo para atualizar</p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="icon"
            variant={src && !generating ? "default" : "secondary"}
            onClick={toggle}
            disabled={!src || generating}
            aria-label={playing ? "Pausar" : "Reproduzir"}
            className="shrink-0"
          >
            {playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
          </Button>
          <p className="text-xs tabular-nums text-muted sm:hidden">
            {formatClock(current)}
            <span className="text-subtle"> / {formatClock(duration)}</span>
          </p>
          <div className="ml-auto sm:hidden">
            {src ? (
              <a
                href={src}
                download={fileName}
                aria-label="Baixar MP3"
                className={cn(
                  "inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-elevated text-fg shadow-[var(--shadow-border)] transition-[opacity,transform] duration-150 hover:shadow-[var(--shadow-border-hover)] active:scale-[0.98]",
                  generating && "pointer-events-none opacity-40",
                )}
              >
                <Download className="size-4" />
              </a>
            ) : (
              <Button type="button" variant="secondary" size="icon" disabled aria-label="Baixar MP3">
                <Download className="size-4" />
              </Button>
            )}
          </div>
        </div>

        <button
          type="button"
          className="relative flex h-14 w-full min-w-0 items-end gap-px overflow-hidden rounded-md px-0.5 sm:flex-1"
          aria-label="Barra de progresso"
          disabled={!src || generating}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - rect.left) / rect.width);
          }}
        >
          {bars.map((h, i) => {
            const lit = i / bars.length <= progress;
            return (
              <span
                key={i}
                className={cn(
                  "min-w-px flex-1 rounded-full transition-colors duration-150",
                  generating ? "sonora-led bg-muted" : lit ? "bg-fg" : "bg-elevated",
                )}
                style={{ height: `${Math.max(12, h * 100)}%` }}
              />
            );
          })}
        </button>

        <p className="hidden w-20 shrink-0 text-right text-xs tabular-nums text-muted sm:block">
          {formatClock(current)}
          <span className="text-subtle"> / {formatClock(duration)}</span>
        </p>

        <div className="hidden sm:block">
          {src ? (
            <a
              href={src}
              download={fileName}
              aria-label="Baixar MP3"
              className={cn(
                "inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-elevated text-fg shadow-[var(--shadow-border)] transition-[opacity,transform] duration-150 hover:shadow-[var(--shadow-border-hover)] active:scale-[0.98]",
                generating && "pointer-events-none opacity-40",
              )}
            >
              <Download className="size-4" />
            </a>
          ) : (
            <Button type="button" variant="secondary" size="icon" disabled aria-label="Baixar MP3">
              <Download className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
