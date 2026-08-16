import {
  OPENING_TYPES,
  calculatePartition,
  validatePartitionInput,
  type OpeningType,
  type PartitionCalculationInput,
  type PartitionCalculationResult,
  type PartitionOpening,
} from "@/domain/calculations";
import { PROJECT_STATUSES, type ProjectStatus } from "@/domain/projects";
import type { JsonObject, JsonValue } from "@/types/json";
import type {
  Budget,
  Calculation,
  Client,
  Project,
  Settings,
} from "@/types/entities";

import {
  PYL_BACKUP_APP,
  PYL_BACKUP_VERSION,
  createBackupSummary,
  type BackupValidationResult,
  type PylBackupData,
  type PylBackupDocument,
} from "./backup-types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const FORBIDDEN_JSON_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const MAX_JSON_DEPTH = 50;
const MAX_JSON_NODES = 250_000;
const MAX_VALIDATION_ERRORS = 50;

type UnknownRecord = Record<string, unknown>;

type JsonSanitizationResult =
  | { success: true; value: JsonValue }
  | { success: false };

interface JsonSanitizationState {
  nodes: number;
}

function addError(errors: string[], message: string): void {
  if (errors.length < MAX_VALIDATION_ERRORS) {
    errors.push(message);
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const canonicalValue = value.includes(".")
    ? value
    : value.replace("Z", ".000Z");
  return date.toISOString() === canonicalValue;
}

function readString(
  record: UnknownRecord,
  key: string,
  path: string,
  errors: string[],
  requireContent = false,
): string | undefined {
  const value = record[key];
  if (typeof value !== "string" || (requireContent && !value.trim())) {
    addError(errors, `${path}.${key} debe ser una cadena${requireContent ? " no vacía" : ""}.`);
    return undefined;
  }
  return value;
}

function readOptionalString(
  record: UnknownRecord,
  key: string,
  path: string,
  errors: string[],
): string | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    addError(errors, `${path}.${key} debe ser una cadena cuando está presente.`);
    return undefined;
  }
  return value;
}

function readNumber(
  record: UnknownRecord,
  key: string,
  path: string,
  errors: string[],
  options: { integer?: boolean; nonNegative?: boolean } = {},
): number | undefined {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    addError(errors, `${path}.${key} debe ser un número finito.`);
    return undefined;
  }
  if (options.integer && !Number.isInteger(value)) {
    addError(errors, `${path}.${key} debe ser un número entero.`);
    return undefined;
  }
  if (options.nonNegative && value < 0) {
    addError(errors, `${path}.${key} no puede ser negativo.`);
    return undefined;
  }
  return value;
}

function readIsoDate(
  record: UnknownRecord,
  key: string,
  path: string,
  errors: string[],
): string | undefined {
  const value = readString(record, key, path, errors, true);
  if (value && !isIsoDate(value)) {
    addError(errors, `${path}.${key} debe ser una fecha ISO válida en UTC.`);
    return undefined;
  }
  return value;
}

function isProjectStatus(value: string): value is ProjectStatus {
  return PROJECT_STATUSES.some((status) => status === value);
}

function sanitizeJsonValue(
  value: unknown,
  path: string,
  depth: number,
  state: JsonSanitizationState,
  errors: string[],
): JsonSanitizationResult {
  state.nodes += 1;
  if (state.nodes > MAX_JSON_NODES) {
    addError(errors, `${path} supera el límite de complejidad permitido.`);
    return { success: false };
  }
  if (depth > MAX_JSON_DEPTH) {
    addError(errors, `${path} supera la profundidad máxima permitida.`);
    return { success: false };
  }
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return { success: true, value };
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      addError(errors, `${path} contiene un número no válido.`);
      return { success: false };
    }
    return { success: true, value };
  }
  if (Array.isArray(value)) {
    const sanitized: JsonValue[] = [];
    for (let index = 0; index < value.length; index += 1) {
      const item = sanitizeJsonValue(
        value[index],
        `${path}[${index}]`,
        depth + 1,
        state,
        errors,
      );
      if (!item.success) return item;
      sanitized.push(item.value);
    }
    return { success: true, value: sanitized };
  }
  if (isRecord(value)) {
    const sanitized: JsonObject = {};
    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_JSON_KEYS.has(key)) {
        addError(errors, `${path} contiene una clave no permitida.`);
        return { success: false };
      }
      const item = sanitizeJsonValue(
        child,
        `${path}.${key}`,
        depth + 1,
        state,
        errors,
      );
      if (!item.success) return item;
      sanitized[key] = item.value;
    }
    return { success: true, value: sanitized };
  }

  addError(errors, `${path} contiene un valor que no es JSON válido.`);
  return { success: false };
}

function sanitizeJsonObject(
  value: unknown,
  path: string,
  errors: string[],
): JsonObject | undefined {
  if (!isRecord(value)) {
    addError(errors, `${path} debe ser un objeto JSON.`);
    return undefined;
  }
  const result = sanitizeJsonValue(value, path, 0, { nodes: 0 }, errors);
  return result.success && isRecord(result.value)
    ? (result.value as JsonObject)
    : undefined;
}

function parseProject(
  value: unknown,
  index: number,
  errors: string[],
): Project | null {
  const path = `data.projects[${index}]`;
  if (!isRecord(value)) {
    addError(errors, `${path} debe ser un objeto.`);
    return null;
  }
  const before = errors.length;
  const id = readString(value, "id", path, errors, true);
  const name = readString(value, "name", path, errors, true);
  const description = readOptionalString(value, "description", path, errors);
  const clientId = readOptionalString(value, "clientId", path, errors);
  const statusValue = readString(value, "status", path, errors, true);
  const createdAt = readIsoDate(value, "createdAt", path, errors);
  const updatedAt = readIsoDate(value, "updatedAt", path, errors);
  if (statusValue && !isProjectStatus(statusValue)) {
    addError(errors, `${path}.status no es un estado de proyecto válido.`);
  }
  if (errors.length !== before || !id || !name || !statusValue || !createdAt || !updatedAt) {
    return null;
  }
  return {
    id,
    name,
    status: statusValue as ProjectStatus,
    createdAt,
    updatedAt,
    ...(description !== undefined ? { description } : {}),
    ...(clientId !== undefined ? { clientId } : {}),
  };
}

function parseClient(
  value: unknown,
  index: number,
  errors: string[],
): Client | null {
  const path = `data.clients[${index}]`;
  if (!isRecord(value)) {
    addError(errors, `${path} debe ser un objeto.`);
    return null;
  }
  const before = errors.length;
  const id = readString(value, "id", path, errors, true);
  const name = readString(value, "name", path, errors, true);
  const company = readOptionalString(value, "company", path, errors);
  const phone = readOptionalString(value, "phone", path, errors);
  const email = readOptionalString(value, "email", path, errors);
  const notes = readOptionalString(value, "notes", path, errors);
  const createdAt = readIsoDate(value, "createdAt", path, errors);
  const updatedAt = readIsoDate(value, "updatedAt", path, errors);
  if (errors.length !== before || !id || !name || !createdAt || !updatedAt) return null;
  return {
    id,
    name,
    createdAt,
    updatedAt,
    ...(company !== undefined ? { company } : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(notes !== undefined ? { notes } : {}),
  };
}

function parseBudgetItem(
  value: unknown,
  budgetIndex: number,
  itemIndex: number,
  errors: string[],
): Budget["items"][number] | null {
  const path = `data.budgets[${budgetIndex}].items[${itemIndex}]`;
  if (!isRecord(value)) {
    addError(errors, `${path} debe ser un objeto.`);
    return null;
  }
  const before = errors.length;
  const id = readString(value, "id", path, errors, true);
  const description = readString(value, "description", path, errors);
  const quantity = readNumber(value, "quantity", path, errors, { nonNegative: true });
  const unit = readString(value, "unit", path, errors, true);
  const unitPrice = readNumber(value, "unitPrice", path, errors, {
    integer: true,
    nonNegative: true,
  });
  const total = readNumber(value, "total", path, errors, {
    integer: true,
    nonNegative: true,
  });
  const materialId = readOptionalString(value, "materialId", path, errors);
  if (
    errors.length !== before ||
    !id ||
    description === undefined ||
    quantity === undefined ||
    !unit ||
    unitPrice === undefined ||
    total === undefined
  ) return null;
  return {
    id,
    description,
    quantity,
    unit,
    unitPrice,
    total,
    ...(materialId !== undefined ? { materialId } : {}),
  };
}

function parseBudget(
  value: unknown,
  index: number,
  errors: string[],
): Budget | null {
  const path = `data.budgets[${index}]`;
  if (!isRecord(value)) {
    addError(errors, `${path} debe ser un objeto.`);
    return null;
  }
  const before = errors.length;
  const id = readString(value, "id", path, errors, true);
  const projectId = readOptionalString(value, "projectId", path, errors);
  const clientId = readOptionalString(value, "clientId", path, errors);
  const name = readString(value, "name", path, errors, true);
  const rawItems = value.items;
  if (!Array.isArray(rawItems)) addError(errors, `${path}.items debe ser un array.`);
  const items = Array.isArray(rawItems)
    ? rawItems.map((item, itemIndex) => parseBudgetItem(item, index, itemIndex, errors))
    : [];
  const subtotal = readNumber(value, "subtotal", path, errors, { integer: true, nonNegative: true });
  const margin = readNumber(value, "margin", path, errors, { integer: true, nonNegative: true });
  const tax = readNumber(value, "tax", path, errors, { integer: true, nonNegative: true });
  const total = readNumber(value, "total", path, errors, { integer: true, nonNegative: true });
  const createdAt = readIsoDate(value, "createdAt", path, errors);
  const updatedAt = readIsoDate(value, "updatedAt", path, errors);
  if (
    errors.length !== before || !id || !name || items.some((item) => item === null) ||
    subtotal === undefined || margin === undefined || tax === undefined || total === undefined ||
    !createdAt || !updatedAt
  ) return null;
  return {
    id,
    name,
    items: items.filter((item): item is Budget["items"][number] => item !== null),
    subtotal,
    margin,
    tax,
    total,
    createdAt,
    updatedAt,
    ...(projectId !== undefined ? { projectId } : {}),
    ...(clientId !== undefined ? { clientId } : {}),
  };
}

function isOpeningType(value: string): value is OpeningType {
  return OPENING_TYPES.some((type) => type === value);
}

function parsePartitionOpening(
  value: unknown,
  index: number,
  path: string,
  errors: string[],
): PartitionOpening | null {
  const openingPath = `${path}.openings[${index}]`;
  if (!isRecord(value)) {
    addError(errors, `${openingPath} debe ser un objeto.`);
    return null;
  }
  const before = errors.length;
  const type = readString(value, "type", openingPath, errors, true);
  const width = readNumber(value, "width", openingPath, errors);
  const height = readNumber(value, "height", openingPath, errors);
  const quantity = readNumber(value, "quantity", openingPath, errors);
  if (type && !isOpeningType(type)) {
    addError(errors, `${openingPath}.type no es un tipo de hueco válido.`);
  }
  if (
    errors.length !== before || !type || !isOpeningType(type) ||
    width === undefined || height === undefined || quantity === undefined
  ) return null;
  return { type, width, height, quantity };
}

function parsePartitionInput(
  value: unknown,
  path: string,
  errors: string[],
): PartitionCalculationInput | null {
  if (!isRecord(value)) {
    addError(errors, `${path} debe ser un objeto de cálculo de tabique.`);
    return null;
  }
  const before = errors.length;
  const length = readNumber(value, "length", path, errors);
  const height = readNumber(value, "height", path, errors);
  const boardsPerFace = readNumber(value, "boardsPerFace", path, errors);
  const boardWidth = readNumber(value, "boardWidth", path, errors);
  const boardHeight = readNumber(value, "boardHeight", path, errors);
  const studSpacing = readNumber(value, "studSpacing", path, errors);
  const wastePercentage = readNumber(value, "wastePercentage", path, errors);
  const hasInsulation = value.hasInsulation;
  if (typeof hasInsulation !== "boolean") {
    addError(errors, `${path}.hasInsulation debe ser un booleano.`);
  }
  if (!Array.isArray(value.openings)) {
    addError(errors, `${path}.openings debe ser un array.`);
  }
  const openings = Array.isArray(value.openings)
    ? value.openings.map((opening, index) =>
        parsePartitionOpening(opening, index, path, errors),
      )
    : [];
  if (
    errors.length !== before || length === undefined || height === undefined ||
    boardsPerFace === undefined || boardWidth === undefined || boardHeight === undefined ||
    studSpacing === undefined || wastePercentage === undefined ||
    typeof hasInsulation !== "boolean" || openings.some((opening) => opening === null)
  ) return null;
  const input: PartitionCalculationInput = {
    length,
    height,
    boardsPerFace,
    boardWidth,
    boardHeight,
    studSpacing,
    wastePercentage,
    hasInsulation,
    openings: openings.filter((opening): opening is PartitionOpening => opening !== null),
  };
  const validationIssues = validatePartitionInput(input);
  validationIssues.forEach((issue) =>
    addError(errors, `${path}.${issue.path}: ${issue.message}`),
  );
  return validationIssues.length ? null : input;
}

function validatePartitionResult(
  value: unknown,
  expected: PartitionCalculationResult,
  path: string,
  errors: string[],
): boolean {
  if (!isRecord(value)) {
    addError(errors, `${path} debe ser un resultado de tabique.`);
    return false;
  }
  const keys: Array<keyof PartitionCalculationResult> = [
    "grossArea",
    "openingsArea",
    "netArea",
    "boardAreaBeforeWaste",
    "totalBoardArea",
    "boardCount",
    "trackLength",
    "studCount",
    "insulationArea",
    "wastePercentage",
  ];
  let isValid = true;
  keys.forEach((key) => {
    const received = value[key];
    if (typeof received !== "number" || !Number.isFinite(received)) {
      addError(errors, `${path}.${key} debe ser un número finito.`);
      isValid = false;
    } else if (Math.abs(received - expected[key]) > 1e-9) {
      addError(errors, `${path}.${key} no coincide con los datos de entrada.`);
      isValid = false;
    }
  });
  return isValid;
}

function parseCalculation(
  value: unknown,
  index: number,
  errors: string[],
): Calculation | null {
  const path = `data.calculations[${index}]`;
  if (!isRecord(value)) {
    addError(errors, `${path} debe ser un objeto.`);
    return null;
  }
  const before = errors.length;
  const id = readString(value, "id", path, errors, true);
  const projectId = readOptionalString(value, "projectId", path, errors);
  const type = readString(value, "type", path, errors, true);
  const sanitizedInput = sanitizeJsonObject(value.input, `${path}.input`, errors);
  const sanitizedResult = sanitizeJsonObject(value.result, `${path}.result`, errors);
  const createdAt = readIsoDate(value, "createdAt", path, errors);
  if (
    errors.length !== before || !id || !type || !sanitizedInput ||
    !sanitizedResult || !createdAt
  ) return null;

  let input: Calculation["input"] = sanitizedInput;
  let result: Calculation["result"] = sanitizedResult;
  if (type === "partition") {
    const partitionInput = parsePartitionInput(sanitizedInput, `${path}.input`, errors);
    if (!partitionInput) return null;
    const calculatedResult = calculatePartition(partitionInput);
    if (!validatePartitionResult(sanitizedResult, calculatedResult, `${path}.result`, errors)) {
      return null;
    }
    input = partitionInput;
    result = calculatedResult;
  }

  return {
    id,
    type,
    input,
    result,
    createdAt,
    ...(projectId !== undefined ? { projectId } : {}),
  };
}

function parseSettings(
  value: unknown,
  index: number,
  errors: string[],
): Settings | null {
  const path = `data.settings[${index}]`;
  if (!isRecord(value)) {
    addError(errors, `${path} debe ser un objeto.`);
    return null;
  }
  const before = errors.length;
  const id = readString(value, "id", path, errors, true);
  const companyName = readString(value, "companyName", path, errors);
  const defaultWastePercentage = readNumber(value, "defaultWastePercentage", path, errors, { nonNegative: true });
  const defaultMargin = readNumber(value, "defaultMargin", path, errors, { nonNegative: true });
  const taxRate = readNumber(value, "taxRate", path, errors, { nonNegative: true });
  for (const [key, number] of [
    ["defaultWastePercentage", defaultWastePercentage],
    ["defaultMargin", defaultMargin],
    ["taxRate", taxRate],
  ] as const) {
    if (number !== undefined && number > 100) {
      addError(errors, `${path}.${key} no puede superar el 100 %.`);
    }
  }
  if (
    errors.length !== before || !id || companyName === undefined ||
    defaultWastePercentage === undefined || defaultMargin === undefined || taxRate === undefined
  ) return null;
  return { id, companyName, defaultWastePercentage, defaultMargin, taxRate };
}

function parseCollection<T>(
  value: unknown,
  path: string,
  errors: string[],
  parser: (item: unknown, index: number, errors: string[]) => T | null,
): T[] {
  if (!Array.isArray(value)) {
    addError(errors, `${path} debe ser un array.`);
    return [];
  }
  return value
    .map((item, index) => parser(item, index, errors))
    .filter((item): item is T => item !== null);
}

function validateUniqueIds<T extends { id: string }>(
  collection: T[],
  path: string,
  errors: string[],
): void {
  const ids = new Set<string>();
  collection.forEach((item, index) => {
    if (ids.has(item.id)) {
      addError(errors, `${path}[${index}].id está duplicado en la copia.`);
    }
    ids.add(item.id);
  });
}

export function validateBackupDocument(value: unknown): BackupValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { success: false, errors: ["El archivo debe contener un objeto JSON."] };
  }
  if (value.version !== PYL_BACKUP_VERSION) {
    addError(errors, `La versión del backup no es compatible. Se esperaba la versión ${PYL_BACKUP_VERSION}.`);
  }
  if (value.app !== PYL_BACKUP_APP) {
    addError(errors, `El archivo no es una copia de seguridad de ${PYL_BACKUP_APP}.`);
  }
  if (typeof value.exportedAt !== "string" || !isIsoDate(value.exportedAt)) {
    addError(errors, "exportedAt debe ser una fecha ISO válida en UTC.");
  }
  if (!isRecord(value.data)) {
    addError(errors, "data debe ser un objeto con las colecciones locales.");
    return { success: false, errors };
  }

  const data: PylBackupData = {
    projects: parseCollection(value.data.projects, "data.projects", errors, parseProject),
    clients: parseCollection(value.data.clients, "data.clients", errors, parseClient),
    budgets: parseCollection(value.data.budgets, "data.budgets", errors, parseBudget),
    calculations: parseCollection(value.data.calculations, "data.calculations", errors, parseCalculation),
    settings: parseCollection(value.data.settings, "data.settings", errors, parseSettings),
  };

  validateUniqueIds(data.projects, "data.projects", errors);
  validateUniqueIds(data.clients, "data.clients", errors);
  validateUniqueIds(data.budgets, "data.budgets", errors);
  validateUniqueIds(data.calculations, "data.calculations", errors);
  validateUniqueIds(data.settings, "data.settings", errors);

  if (errors.length) return { success: false, errors };
  const backup: PylBackupDocument = {
    version: PYL_BACKUP_VERSION,
    app: PYL_BACKUP_APP,
    exportedAt: value.exportedAt as string,
    data,
  };
  return { success: true, backup, summary: createBackupSummary(data) };
}

export function parseBackupJson(json: string): BackupValidationResult {
  try {
    return validateBackupDocument(JSON.parse(json) as unknown);
  } catch {
    return { success: false, errors: ["El archivo no contiene JSON válido."] };
  }
}
