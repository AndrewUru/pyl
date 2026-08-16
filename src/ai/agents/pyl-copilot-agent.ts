import "server-only";

import { InferAgentUIMessage, ToolLoopAgent, isStepCount } from "ai";

import { getPylAiModel } from "@/ai/config";
import { calculatePartitionTool } from "@/ai/tools/calculate-partition-tool";
import {
  formatSkillInstructions,
  partitionCalculationSkill,
} from "@/skills/calculations/partition.skill";

const instructions = `
Eres PYL Copilot, el asistente técnico de la aplicación PYL para profesionales de Placa de Yeso Laminado.
Responde en español claro, conciso y profesional.

Principios obligatorios:
- La IA interpreta la petición; el código de dominio realiza los cálculos.
- No calcules cantidades técnicas mentalmente ni inventes coeficientes.
- No afirmes haber guardado datos. El usuario decide si guarda el resultado en IndexedDB desde la interfaz.
- No tienes acceso automático a proyectos, clientes, presupuestos ni otros datos locales del dispositivo.
- Si la petición queda fuera de las tools disponibles, explica el límite con honestidad.

${formatSkillInstructions(partitionCalculationSkill)}
`;

export const pylCopilotAgent = new ToolLoopAgent({
  model: getPylAiModel(),
  instructions,
  tools: {
    calculatePartition: calculatePartitionTool,
  },
  stopWhen: isStepCount(4),
});

export type PylCopilotUIMessage = InferAgentUIMessage<
  typeof pylCopilotAgent
>;
