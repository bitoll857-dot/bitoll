import type { ProjectStatus } from "~/types/customer-project";

export const maxImageSizeMb = 0.3;
export const maxImageSizeBytes = maxImageSizeMb * 1024 * 1024;

export const operatorStatuses: ProjectStatus[] = [
  "Em avaliacao",
  "Em instalacao",
  "Em testes",
  "Concluido",
];

export const quoteTemplateStructures = [
  { label: "Basica", value: "basica" },
  { label: "Media", value: "media" },
  { label: "Alta", value: "alta" },
];

export const statusToDatabase = (status: ProjectStatus) =>
  ({
    Concluido: "concluido",
    "Em avaliacao": "em_avaliacao",
    "Em instalacao": "em_instalacao",
    "Em testes": "em_testes",
    Solicitado: "enviado",
  })[status];

export const databaseToStatus = (status: string): ProjectStatus => {
  const statusMap: Record<string, ProjectStatus> = {
    aprovado: "Em instalacao",
    concluido: "Concluido",
    em_avaliacao: "Em avaliacao",
    em_instalacao: "Em instalacao",
    em_testes: "Em testes",
    enviado: "Em avaliacao",
  };

  return statusMap[status.toLowerCase()] ?? "Em avaliacao";
};

export const asNumber = (value: number | string | null | undefined) =>
  Number(value ?? 0);

export const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

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
