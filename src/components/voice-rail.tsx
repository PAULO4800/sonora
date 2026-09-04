import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  VOICE_GROUPS,
  VOICES,
  type Voice,
  type VoiceGroup,
} from "@/lib/voices";

type VoiceRailProps = {
  voiceId: string;
  query: string;
  group: VoiceGroup | "todas";
  onQuery: (value: string) => void;
  onGroup: (value: VoiceGroup | "todas") => void;
  onSelect: (voice: Voice) => void;
};

export function VoiceRail({
  voiceId,
  query,
  group,
  onQuery,
  onGroup,
  onSelect,
}: VoiceRailProps) {
  const filtered = VOICES.filter((v) => {
    const matchesGroup = group === "todas" || v.group === group;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      v.name.toLowerCase().includes(q) ||
      v.tone.toLowerCase().includes(q) ||
      v.use.toLowerCase().includes(q);
    return matchesGroup && matchesQuery;
  });

  return (
    <aside className="flex min-h-0 min-w-0 flex-col lg:h-full">
      <div className="shrink-0 px-4 pt-4 lg:px-5 lg:pt-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          Elenco
        </p>
        <h2 className="mt-1 font-serif text-2xl text-fg">Vozes</h2>

        <label className="mt-4 flex h-11 items-center gap-2 rounded-lg bg-elevated px-3 shadow-[var(--shadow-border)]">
          <Search className="size-4 shrink-0 text-subtle" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar voz"
            className="h-full w-full min-w-0 bg-transparent text-sm text-fg placeholder:text-subtle focus-visible:outline-none"
          />
        </label>

        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {VOICE_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onGroup(g.id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-xs font-medium transition-colors duration-150",
                group === g.id
                  ? "bg-accent text-accent-fg"
                  : "bg-elevated text-muted hover:text-fg",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-3 flex min-w-0 gap-2 overflow-x-auto px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:px-5 lg:pb-6 lg:[scrollbar-width:thin]">
        {filtered.map((voice) => {
          const active = voice.id === voiceId;
          return (
            <li key={voice.id} className="min-w-44 shrink-0 lg:min-w-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(voice)}
                className={cn(
                  "flex w-full flex-col rounded-lg px-3 py-3 text-left transition-[background-color,box-shadow] duration-150",
                  active
                    ? "bg-elevated shadow-[var(--shadow-border-hover)]"
                    : "hover:bg-elevated/60",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full text-xs font-medium",
                      active ? "bg-accent text-accent-fg" : "bg-surface text-muted",
                    )}
                  >
                    {voice.name.slice(0, 1)}
                  </span>
                  <span className="font-medium text-fg">{voice.name}</span>
                  <span className="ml-auto hidden text-xs uppercase tracking-wide text-subtle lg:inline">
                    {voice.use}
                  </span>
                </span>
                <span className="mt-1.5 line-clamp-2 text-xs leading-snug text-muted">
                  {voice.tone}
                </span>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 ? (
          <li className="px-1 py-8 text-sm text-muted">Nenhuma voz encontrada.</li>
        ) : null}
      </ul>
    </aside>
  );
}
