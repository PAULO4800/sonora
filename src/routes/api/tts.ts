import { createFileRoute } from "@tanstack/react-router";
import { LANGUAGE_IDS, MAX_CHARS, VOICE_IDS } from "@/lib/voices";

type TtsBody = {
  text?: unknown;
  voiceId?: unknown;
  language?: unknown;
  speed?: unknown;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function readApiKey(): Promise<string | undefined> {
  const fromEnv = process.env["XAI_API_KEY"]?.trim();
  if (fromEnv) return fromEnv;
  try {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const text = readFileSync(join(process.cwd(), ".env"), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^XAI_API_KEY\s*=\s*(.*)$/);
      if (!match) continue;
      let value = match[1]?.trim() ?? "";
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value.trim() || undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = await readApiKey();
        if (!apiKey) {
          return jsonError("A geração de voz não está disponível neste momento.", 503);
        }

        let payload: TtsBody;
        try {
          payload = (await request.json()) as TtsBody;
        } catch {
          return jsonError("Pedido inválido.", 400);
        }

        const text = typeof payload.text === "string" ? payload.text.trim() : "";
        if (!text) return jsonError("Escreva um texto para ler.", 400);
        if (text.length > MAX_CHARS) {
          return jsonError(`O texto pode ter no máximo ${MAX_CHARS.toLocaleString("pt-BR")} caracteres.`, 400);
        }

        const voiceId =
          typeof payload.voiceId === "string" ? payload.voiceId.trim().toLowerCase() : "";
        if (!VOICE_IDS.has(voiceId)) {
          return jsonError("Voz não reconhecida.", 400);
        }

        const language =
          typeof payload.language === "string" ? payload.language : "pt-BR";
        if (!LANGUAGE_IDS.has(language)) {
          return jsonError("Idioma não suportado.", 400);
        }

        let speed = 1;
        if (typeof payload.speed === "number" && Number.isFinite(payload.speed)) {
          speed = Math.min(1.5, Math.max(0.7, payload.speed));
        }

        const upstream = await fetch("https://api.x.ai/v1/tts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            voice_id: voiceId,
            language,
            speed,
            text_normalization: true,
            output_format: {
              codec: "mp3",
              sample_rate: 24000,
              bit_rate: 128000,
            },
          }),
        });

        const contentType = upstream.headers.get("content-type") ?? "";

        if (!upstream.ok) {
          let message = "Não foi possível gerar a voz agora. Tente de novo em instantes.";
          try {
            if (contentType.includes("application/json")) {
              const body = (await upstream.json()) as { error?: unknown; message?: unknown };
              const raw =
                (typeof body.error === "string" && body.error) ||
                (typeof body.message === "string" && body.message) ||
                "";
              if (raw) message = raw;
            }
          } catch {
            // keep default
          }
          const status =
            upstream.status === 401 || upstream.status === 403 ? 503 : upstream.status;
          return jsonError(message, status);
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": contentType.includes("audio") ? contentType : "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
