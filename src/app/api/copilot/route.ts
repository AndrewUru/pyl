import { createAgentUIStreamResponse } from "ai";

import { pylCopilotAgent } from "@/ai/agents/pyl-copilot-agent";
import { isPylCopilotConfigured } from "@/ai/config";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_MESSAGES = 40;
const MAX_REQUEST_BYTES = 100_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request): Promise<Response> {
  if (!isPylCopilotConfigured()) {
    return Response.json(
      {
        error:
          "PYL Copilot no está configurado. Añade AI_GATEWAY_API_KEY al entorno del servidor.",
      },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return Response.json({ error: "La conversación es demasiado grande." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "El cuerpo de la petición no es JSON válido." }, { status: 400 });
  }

  if (!isRecord(payload) || !Array.isArray(payload.messages)) {
    return Response.json({ error: "La conversación no tiene una estructura válida." }, { status: 400 });
  }

  if (payload.messages.length === 0 || payload.messages.length > MAX_MESSAGES) {
    return Response.json(
      { error: `La conversación debe contener entre 1 y ${MAX_MESSAGES} mensajes.` },
      { status: 400 },
    );
  }

  return createAgentUIStreamResponse({
    agent: pylCopilotAgent,
    uiMessages: payload.messages,
    abortSignal: request.signal,
  });
}
