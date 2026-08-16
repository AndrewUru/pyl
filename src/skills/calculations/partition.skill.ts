export interface PylAgentSkill {
  id: string;
  name: string;
  description: string;
  instructions: readonly string[];
}

export const partitionCalculationSkill = {
  id: "pyl-partition-calculation",
  name: "Cálculo de tabiques PYL",
  description:
    "Interpreta una petición de tabique y la convierte en datos para la herramienta determinista calculatePartition.",
  instructions: [
    "Recopila longitud, altura, huecos, placas por cara, dimensiones de placa, separación entre montantes, merma y aislamiento.",
    "No supongas medidas, separaciones, porcentajes ni reglas técnicas que el usuario no haya indicado.",
    "Si falta un dato obligatorio, pregunta por él de forma breve antes de usar la herramienta.",
    "Para obtener cantidades utiliza siempre calculatePartition; nunca hagas las operaciones matemáticas en el modelo.",
    "No estimes tornillos, pasta, cinta, refuerzos ni otros consumibles sin una regla de dominio validada.",
    "Presenta placas y montantes como cantidades aproximadas y conserva las unidades del resultado.",
  ],
} as const satisfies PylAgentSkill;

export function formatSkillInstructions(skill: PylAgentSkill): string {
  return [
    `Skill activa: ${skill.name}.`,
    skill.description,
    ...skill.instructions.map((instruction) => `- ${instruction}`),
  ].join("\n");
}
