"use client";

import { useState, type FormEvent } from "react";
import { ArrowUp, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CommandInput() {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      value.trim()
        ? "PYL Copilot se conectará a este comando en una próxima fase."
        : "Escribe una consulta para preparar el comando.",
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-2 shadow-panel">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-border bg-background px-3 py-3.5 sm:px-4"
      >
        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
          PYL Copilot · Preparado para conectar
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <label htmlFor="pyl-command" className="sr-only">
            ¿Qué necesitas calcular?
          </label>
          <input
            id="pyl-command"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setMessage("");
            }}
            placeholder="¿Qué necesitas calcular?"
            aria-describedby="pyl-command-help"
            className="min-w-0 flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/75 sm:text-lg"
          />
          <Button
            type="submit"
            size="icon"
            variant="primary"
            aria-label="Preparar consulta"
            className="size-8 rounded-md"
          >
            <ArrowUp aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </form>
      <p
        id="pyl-command-help"
        aria-live="polite"
        className="min-h-7 px-2 pt-2 text-[11px] leading-5 text-muted-foreground"
      >
        {message ||
          "Describe una medición o sistema. No se enviará ningún dato por ahora."}
      </p>
    </div>
  );
}
