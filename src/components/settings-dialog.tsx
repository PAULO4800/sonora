import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  clearElevenLabsKey,
  KROK_TEST_TEXT,
  loadElevenLabsKey,
  loadKrokVoiceId,
  maskKey,
  saveElevenLabsKey,
  saveKrokVoiceId,
} from "@/lib/elevenlabs";
import { cn } from "@/lib/utils";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyChange: (hasKey: boolean) => void;
  onTestKrok: (apiKey: string, krokVoiceId: string) => Promise<boolean>;
  testing: boolean;
};

export function SettingsDialog({
  open,
  onOpenChange,
  onKeyChange,
  onTestKrok,
  testing,
}: SettingsDialogProps) {
  const titleId = useId();
  const [draft, setDraft] = useState("");
  const [krokId, setKrokId] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const stored = loadElevenLabsKey();

  useEffect(() => {
    if (!open) return;
    setDraft(loadElevenLabsKey());
    setKrokId(loadKrokVoiceId());
    setShowKey(false);
    setStatus(null);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  async function persist(nextKey: string, nextKrok: string) {
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      if (!nextKey) {
        clearElevenLabsKey();
        saveKrokVoiceId(nextKrok);
        onKeyChange(false);
        setStatus("Chave removida neste navegador.");
        return;
      }

      const res = await fetch("/api/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: nextKey }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        error?: string;
        krokVoiceId?: string | null;
        krokName?: string | null;
      };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || "Não foi possível validar a chave.");
      }

      saveElevenLabsKey(nextKey);
      const resolvedKrok = nextKrok || body.krokVoiceId || "";
      saveKrokVoiceId(resolvedKrok);
      if (!nextKrok && body.krokVoiceId) setKrokId(body.krokVoiceId);
      onKeyChange(true);
      if (body.krokName) {
        setStatus(`Chave salva. Voz "${body.krokName}" encontrada na sua conta.`);
      } else {
        setStatus("Chave salva neste navegador.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar a chave.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fechar configurações"
        className="absolute inset-0 bg-bg/70"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg rounded-t-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:rounded-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              Conta
            </p>
            <h2 id={titleId} className="mt-1 font-serif text-2xl italic text-fg">
              Configurações
            </h2>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Fechar"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <p className="mt-3 text-sm text-muted">
          Cole a chave da ElevenLabs para gerar vozes neste aparelho. Ela fica só no
          seu navegador, neste computador.
        </p>

        <label className="mt-5 block">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-subtle">
            Chave da ElevenLabs
          </span>
          <div className="mt-2 flex h-11 items-center rounded-md bg-elevated shadow-[var(--shadow-border)] focus-within:ring-2 focus-within:ring-accent/50">
            <input
              type={showKey ? "text" : "password"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="sk_…"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-fg placeholder:text-subtle focus-visible:outline-none"
              aria-label="Chave da ElevenLabs"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="grid size-11 place-items-center text-muted hover:text-fg"
              aria-label={showKey ? "Ocultar chave" : "Mostrar chave"}
            >
              {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </label>
        {stored ? (
          <p className="mt-2 text-xs text-subtle">Salva: {maskKey(stored)}</p>
        ) : (
          <p className="mt-2 text-xs text-subtle">
            Crie a chave em elevenlabs.io → Profile → API keys.
          </p>
        )}

        <label className="mt-4 block">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-subtle">
            ID da voz do Krok (opcional)
          </span>
          <input
            type="text"
            value={krokId}
            onChange={(e) => setKrokId(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="Deixe vazio para usar a voz padrão"
            className="mt-2 h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            aria-label="ID da voz do Krok na ElevenLabs"
          />
        </label>

        {error ? (
          <p className="mt-4 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {status ? <p className="mt-4 text-sm text-muted">{status}</p> : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            onClick={() => void persist(draft.trim(), krokId.trim())}
            disabled={saving}
            className="sm:min-w-36"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Salvando…" : "Salvar chave"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={testing || saving || !draft.trim()}
            onClick={() => void onTestKrok(draft.trim(), krokId.trim())}
            className="sm:min-w-40"
          >
            {testing ? <Loader2 className="size-4 animate-spin" /> : null}
            {testing ? "Testando…" : "Testar voz do Krok"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={saving || (!stored && !draft)}
            onClick={() => {
              setDraft("");
              void persist("", krokId.trim());
            }}
          >
            Remover
          </Button>
        </div>

        <p className={cn("mt-4 text-xs text-subtle")}>
          Teste em PT-BR: “{KROK_TEST_TEXT.slice(0, 42)}…”
        </p>
      </div>
    </div>
  );
}
