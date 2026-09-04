import { createFileRoute } from "@tanstack/react-router";

type VoicesBody = {
  apiKey?: unknown;
};

function jsonError(message: string, status: number) {
  return Response.json({ ok: false as const, error: message }, { status });
}

export type RemoteVoice = {
  id: string;
  name: string;
  category: string;
};

export const Route = createFileRoute("/api/voices")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: VoicesBody;
        try {
          payload = (await request.json()) as VoicesBody;
        } catch {
          return jsonError("Pedido inválido.", 400);
        }

        const apiKey = typeof payload.apiKey === "string" ? payload.apiKey.trim() : "";
        if (!apiKey) {
          return jsonError("Configure sua chave em Configurações", 400);
        }

        try {
          const upstream = await fetch("https://api.elevenlabs.io/v1/voices", {
            headers: {
              "xi-api-key": apiKey,
              Accept: "application/json",
            },
          });

          if (upstream.status === 401 || upstream.status === 403) {
            return jsonError("Chave da ElevenLabs inválida. Confira em Configurações.", 401);
          }
          if (!upstream.ok) {
            return jsonError("Não foi possível listar as vozes da ElevenLabs.", 502);
          }

          const body = (await upstream.json()) as {
            voices?: { voice_id?: string; name?: string; category?: string }[];
          };
          const voices: RemoteVoice[] = (body.voices ?? [])
            .filter((v) => typeof v.voice_id === "string" && typeof v.name === "string")
            .map((v) => ({
              id: v.voice_id as string,
              name: v.name as string,
              category: v.category ?? "premade",
            }));

          const krok = voices.find((v) => /krok|grok/i.test(v.name));

          return Response.json({
            ok: true as const,
            voices,
            krokVoiceId: krok?.id ?? null,
            krokName: krok?.name ?? null,
          });
        } catch {
          return jsonError("Não foi possível conectar à ElevenLabs.", 502);
        }
      },
    },
  },
});
