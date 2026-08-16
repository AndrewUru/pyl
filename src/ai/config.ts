import "server-only";

export const DEFAULT_PYL_AI_MODEL = "openai/gpt-5.4-mini";

export function getPylAiModel(): string {
  return process.env.PYL_AI_MODEL?.trim() || DEFAULT_PYL_AI_MODEL;
}

export function isPylCopilotConfigured(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim(),
  );
}
