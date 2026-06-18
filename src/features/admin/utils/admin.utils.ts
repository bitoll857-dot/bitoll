import type { ProjectStatus } from "~/types/customer-project";

export const maxImageSizeMb = 0.3;
export const maxImageSizeBytes = maxImageSizeMb * 1024 * 1024;

export const operatorStatuses: ProjectStatus[] = [
  "Em processamento",
  "Em actividade",
  "Reclamacao",
  "Finalizado",
];

export const quoteTemplateStructures = [
  { label: "Basica", value: "basica" },
  { label: "Media", value: "media" },
  { label: "Alta", value: "alta" },
];

export const statusToDatabase = (status: ProjectStatus) =>
  ({
    "Em actividade": "em_atividade",
    "Em processamento": "em_processamento",
    Finalizado: "finalizado",
    Reclamacao: "reclamacao",
    Recusado: "recusado",
  })[status];

export const databaseToStatus = (status: string): ProjectStatus => {
  const statusMap: Record<string, ProjectStatus> = {
    aprovado: "Em actividade",
    concluido: "Finalizado",
    em_atividade: "Em actividade",
    em_avaliacao: "Em processamento",
    em_instalacao: "Em actividade",
    em_processamento: "Em processamento",
    em_testes: "Em actividade",
    enviado: "Em processamento",
    finalizado: "Finalizado",
    reclamacao: "Reclamacao",
    recusado: "Recusado",
  };

  return statusMap[status.toLowerCase()] ?? "Em processamento";
};

export const asNumber = (value: number | string | null | undefined) =>
  Number(value ?? 0);

export const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

export const normalizeStructureSteps = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => {
          if (typeof item === "string") {
            return {
              day: 1,
              label: item.trim(),
            };
          }

          if (!item || typeof item !== "object") {
            return null;
          }

          const record = item as Record<string, unknown>;
          const label =
            typeof record.label === "string"
              ? record.label
              : typeof record.text === "string"
                ? record.text
                : typeof record.description === "string"
                  ? record.description
                  : "";

          return {
            day: Math.max(
              1,
              Math.ceil(
                typeof record.day === "number" || typeof record.day === "string"
                  ? asNumber(record.day)
                  : typeof record.days === "number" || typeof record.days === "string"
                    ? asNumber(record.days)
                    : 1,
              ),
            ),
            label: label.trim(),
          };
        })
        .filter(
          (step): step is { day: number; label: string } => Boolean(step?.label),
        )
    : [];

export const getStructureEstimatedDays = (
  steps: { day: number; label: string }[],
) =>
  steps.reduce(
    (total, step) =>
      Math.max(
        total,
        Math.max(
          1,
          Math.ceil(
            typeof step.day === "number" || typeof step.day === "string"
              ? asNumber(step.day)
              : 1,
          ),
        ),
      ),
    0,
  );

export const legacyStructureStepDays = (value: unknown) =>
  Math.max(
    1,
    Math.ceil(
      typeof value === "number" || typeof value === "string"
        ? asNumber(value)
        : 1,
    ),
  );

export const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const parseTemplateFields = (value: string) =>
  value
    .split("\n")
    .map((line, index) => {
      const [label = "", key = "", type = "number", required = "sim"] = line
        .split("|")
        .map((part) => part.trim());

      return {
        field_key: key || toSlug(label).replace(/-/g, "_"),
        input_type: type === "text" || type === "select" ? type : "number",
        label,
        required: required.toLowerCase() !== "nao",
        sort_order: index + 1,
      };
    })
    .filter((field) => field.label && field.field_key);

export const productQuantityFieldKey = (productId: string) =>
  `q_${productId.replace(/[^a-zA-Z0-9]+/g, "_")}`;
