export function createId(): string {
  if (typeof globalThis.crypto?.randomUUID !== "function") {
    throw new Error("crypto.randomUUID() is not available in this browser.");
  }

  return globalThis.crypto.randomUUID();
}
