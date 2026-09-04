import { createFileRoute } from "@tanstack/react-router";
import {
  resolveElevenLabsVoiceId,
  resolveXaiVoiceId,
} from "@/lib/elevenlabs";
import { LANGUAGE_IDS, MAX_CHARS, VOICE_IDS } from "@/lib/voices";

type TtsBody = {
  text?: unknown;
  voiceId?: unknown;
  language?: unknown;
  speed?: unknown;
  apiKey?: unknown;
  krokVoiceId?: unknown;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function xaiKey() {
  return process.env["XAI_API_KEY"]?.trim() || undefined;
}

function readElevenLabsKey(payload: TtsBody) {
  return typeof payload.apiKey === "string" ? payload.apiKey.trim() : "";
}

function parseElevenLabsError(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "";
  const body = raw as { detail?: unknown; message?: unknown; error?: unknown };
  if (typeof body.detail === "string") return body.detail;
  if (body.detail && typeof body.detail === "object") {
    const detail = body.detail as { message?: unknown; status?: unknown };
    if (typeof detail.message === "string") return detail.message;
  }
  if (typeof body.message === "string") return body.message;
  if (typeof body.error === "string") return body.error;
  return "";
}

function elevenLabsUserMessage(status: number, raw: string) {
  if (status === 401 || status === 403) {
    return "Chave da ElevenLabs inválida. Confira em Configurações.";
  }
  if (status === 402 || status === 429) {
    return "Cota da ElevenLabs esgotada. Tente novamente em instantes.";
  }
  if (raw) return raw;
  return "Não foi possível gerar a voz agora. Tente de novo em instantes.";
}

async function elevenLabsTts(opts: {
  apiKey: string;
  text: string;
  voiceId: string;
  language: string;
  speed: number;
  krokVoiceId?: string;
}) {
  const elVoice = resolveElevenLabsVoiceId(opts.voiceId, opts.krokVoiceId);
  const speed = Math.min(1.2, Math.max(0.7, opts.speed));

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(elVoice)}?output_format=mp3_44100_128`;
  const body: Record<string, unknown> = {
    text: opts.text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.45,
      similarity_boost: 0.8,
      style: 0.15,
      use_speaker_boost: true,
      speed,
    },
  };

  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": opts.apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(body),
  });

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok) {
    let raw = "";
    try {
      if (contentType.includes("application/json")) {
        raw = parseElevenLabsError(await upstream.json());
      } else {
        raw = (await upstream.text()).slice(0, 280);
      }
    } catch {
      raw = "";
    }
    return jsonError(elevenLabsUserMessage(upstream.status, raw), upstream.status === 401 || upstream.status === 403 ? 401 : 502);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType.includes("audio") ? contentType : "audio/mpeg",
      "Cache-Control": "no-store",
      "X-Sonora-Provider": "elevenlabs",
    },
  });
}

async function xaiTts(opts: {
  apiKey: string;
  text: string;
  voiceId: string;
  language: string;
  speed: number;
}) {
  const voiceId = resolveXaiVoiceId(opts.voiceId);
  const upstream = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: opts.text,
      voice_id: voiceId,
      language: opts.language,
      speed: opts.speed,
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
    const status = upstream.status === 401 || upstream.status === 403 ? 503 : upstream.status;
    return jsonError(message, status);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType.includes("audio") ? contentType : "audio/mpeg",
      "Cache-Control": "no-store",
      "X-Sonora-Provider": "xai",
    },
  });
}

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          ready: Boolean(xaiKey()),
          provider: xaiKey() ? "xai" : "elevenlabs",
        });
      },
      POST: async ({ request }) => {
        let payload: TtsBody;
        try {
          payload = (await request.json()) as TtsBody;
        } catch {
          return jsonError("Pedido inválido.", 400);
        }

        const text = typeof payload.text === "string" ? payload.text.trim() : "";
        if (!text) return jsonError("Escreva um texto para ler.", 400);
        if (text.length > MAX_CHARS) {
          return jsonError(
            `O texto pode ter no máximo ${MAX_CHARS.toLocaleString("pt-BR")} caracteres.`,
            400,
          );
        }

        const voiceId =
          typeof payload.voiceId === "string" ? payload.voiceId.trim().toLowerCase() : "";
        if (!VOICE_IDS.has(voiceId)) {
          return jsonError("Voz não reconhecida.", 400);
        }

        const language = typeof payload.language === "string" ? payload.language : "pt-BR";
        if (!LANGUAGE_IDS.has(language)) {
          return jsonError("Idioma não suportado.", 400);
        }

        let speed = 1;
        if (typeof payload.speed === "number" && Number.isFinite(payload.speed)) {
          speed = Math.min(1.5, Math.max(0.7, payload.speed));
        }

        const elKey = readElevenLabsKey(payload);
        const krokVoiceId =
          typeof payload.krokVoiceId === "string" ? payload.krokVoiceId.trim() : "";

        try {
          if (elKey) {
            return await elevenLabsTts({
              apiKey: elKey,
              text,
              voiceId,
              language,
              speed,
              krokVoiceId,
            });
          }

          const fallback = xaiKey();
          if (fallback) {
            return await xaiTts({
              apiKey: fallback,
              text,
              voiceId,
              language,
              speed,
            });
          }

          return jsonError("Configure sua chave em Configurações", 503);
        } catch {
          return jsonError(
            "Não foi possível gerar a voz agora. Tente de novo em instantes.",
            502,
          );
        }
      },
    },
  },
});
