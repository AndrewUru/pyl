"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";
import { DefaultChatTransport } from "ai";

import type { PylCopilotUIMessage } from "@/ai/agents/pyl-copilot-agent";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { PartitionToolResult } from "@/features/copilot/components/partition-tool-result";

interface CopilotWorkspaceProps {
  configured: boolean;
  model: string;
}

const transport = new DefaultChatTransport({ api: "/api/copilot" });

const suggestions = [
  "Quiero calcular un tabique PYL",
  "¿Qué datos necesitas para calcular un tabique?",
  "Explica qué resultados puede obtener el motor",
];

export function CopilotWorkspace({
  configured,
  model,
}: CopilotWorkspaceProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, stop, setMessages } =
    useChat<PylCopilotUIMessage>({ transport });
  const isBusy = status === "submitted" || status === "streaming";

  function submitText(text: string) {
    const trimmedText = text.trim();
    if (!configured || !trimmedText || isBusy) return;
    void sendMessage({ text: trimmedText });
    setInput("");
  }

  function handleSubmit(message: PromptInputMessage) {
    submitText(message.text);
  }

  return (
    <section className="grid min-h-[calc(100dvh-12rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-panel lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="flex min-h-[36rem] min-w-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="mx-auto w-full max-w-4xl gap-6 px-4 py-6 sm:px-7 sm:py-8">
              {messages.length === 0 ? (
                <ConversationEmptyState className="min-h-[22rem] px-2">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 shadow-xs">
                    <Sparkles aria-hidden="true" className="size-5" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <h2 className="text-base font-semibold text-foreground">
                      ¿Qué necesitas calcular?
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Describe el tabique en lenguaje natural. Copilot recopilará los datos y ejecutará el mismo motor que la calculadora manual.
                    </p>
                  </div>
                  <div className="mt-3 flex max-w-xl flex-wrap justify-center gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        disabled={!configured}
                        onClick={() => submitText(suggestion)}
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground shadow-xs transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </ConversationEmptyState>
              ) : (
                messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent className="w-full">
                      {message.parts.map((part, index) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <MessageResponse key={`${message.id}-text-${index}`}>
                                {part.text}
                              </MessageResponse>
                            );
                          case "tool-calculatePartition":
                            return (
                              <PartitionToolResult
                                key={part.toolCallId}
                                part={part}
                              />
                            );
                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                  </Message>
                ))
              )}
            </ConversationContent>
            <ConversationScrollButton aria-label="Ir al último mensaje" />
          </Conversation>
        </div>

        <div className="border-t border-border bg-surface px-3 py-3 sm:px-5 sm:py-4">
          {!configured ? (
            <div className="mx-auto mb-3 flex max-w-4xl items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">
              <LockKeyhole aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              Configura AI_GATEWAY_API_KEY en .env.local para activar PYL Copilot. El resto de PYL sigue funcionando sin IA.
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="mx-auto mb-3 max-w-4xl text-xs text-red-700">
              No se ha podido completar la respuesta. Revisa la configuración del proveedor e inténtalo de nuevo.
            </p>
          ) : null}

          <PromptInput
            onSubmit={handleSubmit}
            className="mx-auto max-w-4xl rounded-xl border-border bg-surface shadow-sm"
          >
            <PromptInputBody>
              <PromptInputTextarea
                value={input}
                onChange={(event) => setInput(event.currentTarget.value)}
                placeholder={
                  configured
                    ? "Describe un tabique o pregunta qué datos necesitas…"
                    : "Configura el proveedor para iniciar una conversación"
                }
                disabled={!configured || isBusy}
                aria-label="Mensaje para PYL Copilot"
                className="min-h-20 resize-none"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <span className="truncate px-1 text-[10px] text-muted-foreground">
                IA para interpretar · dominio PYL para calcular
              </span>
              <PromptInputSubmit
                status={status}
                onStop={stop}
                disabled={!configured || (!input.trim() && !isBusy)}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>

      <aside className="hidden border-l border-border bg-surface-muted/45 p-5 lg:block">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Bot aria-hidden="true" className="size-4 text-primary" />
            Sesión
          </div>
          {messages.length ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Nueva conversación"
              title="Nueva conversación"
              onClick={() => setMessages([])}
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
            </Button>
          ) : null}
        </div>

        <dl className="mt-5 space-y-4 text-xs">
          <div>
            <dt className="text-muted-foreground">Modelo</dt>
            <dd className="mt-1 break-all font-mono text-[11px] text-foreground">
              {model}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Skill activa</dt>
            <dd className="mt-1 text-foreground">Tabiques PYL</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tool disponible</dt>
            <dd className="mt-1 font-mono text-[11px] text-foreground">
              calculatePartition
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Persistencia</dt>
            <dd className="mt-1 text-foreground">Manual en IndexedDB</dd>
          </div>
        </dl>

        <div className="mt-6 rounded-lg border border-border bg-surface p-3 text-[11px] leading-5 text-muted-foreground">
          Tus proyectos y clientes no se envían automáticamente. Sólo se remite al proveedor el contenido de esta conversación.
        </div>
      </aside>
    </section>
  );
}
