import type {
  PhotoPromptForm,
  PhotoPromptIdentity,
} from "./types";

export const createDefaultPhotoPromptForm = (): PhotoPromptForm => ({
  addElements: "",
  aspectRatio: "4:5 - Instagram",
  background: "Fundo profissional limpo",
  childSubject: false,
  clothingColor: "Manter cor original",
  clothingStyle: "Manter estilo original",
  clothingType: "Manter roupa original",
  extraDetails: "Sem ajuste extra",
  finalStyle: "Profissional",
  groupComposition: "Manter como esta",
  hair: "Manter cabelo original",
  hairType: "Manter tipo original",
  keepItems: [
    "Rosto original",
    "Tracos faciais",
    "Cor natural da pele",
    "Expressao da pessoa",
  ],
  lighting: "Iluminacao cinematografica suave",
  negativePrompt: true,
  objective: "Criar foto de perfil profissional",
  observations: "",
  photoType: "Foto moderna de rosto",
  preserveBody: true,
  preserveIdentity: true,
  problems: [],
  removeElements: "",
  shoes: "Manter calcado original",
  styleReference: "",
  textOnImageContent: "",
  textOnImage: "Sem texto",
});

export const resetPhotoPromptForm = (form: PhotoPromptForm) => {
  Object.assign(form, createDefaultPhotoPromptForm());
};

export const PHOTO_PROMPT_COIN_VALUE_MZN = 0.1;
export const PHOTO_PROMPT_FIELD_COST = 10;
export const PHOTO_PROMPT_MIN_START_COINS = 100;

export const getPhotoPromptBillableFields = (form: PhotoPromptForm) => {
  const fields = [
    form.photoType ? "Tipo de foto" : "",
    form.objective ? "Objetivo da edicao" : "",
    ...form.keepItems.map((item) => `Manter: ${item}`),
    form.finalStyle ? "Estilo final" : "",
    form.aspectRatio ? "Proporcao final" : "",
    form.textOnImage && form.textOnImage !== "Sem texto" ? "Texto na imagem" : "",
    form.textOnImageContent.trim() ? "Conteudo do texto" : "",
    form.clothingType && form.clothingType !== "Manter roupa original"
      ? "Tipo de roupa"
      : "",
    form.clothingColor && form.clothingColor !== "Manter cor original"
      ? "Cor da roupa"
      : "",
    form.clothingStyle && form.clothingStyle !== "Manter estilo original"
      ? "Estilo da roupa"
      : "",
    form.hair && form.hair !== "Manter cabelo original" ? "Cabelo" : "",
    form.hairType && form.hairType !== "Manter tipo original"
      ? "Tipo de cabelo"
      : "",
    form.shoes && form.shoes !== "Manter calcado original" ? "Calcado" : "",
    form.background ? "Fundo e ambiente" : "",
    form.groupComposition && form.groupComposition !== "Manter como esta"
      ? "Composicao"
      : "",
    form.lighting ? "Iluminacao" : "",
    form.extraDetails && form.extraDetails !== "Sem ajuste extra"
      ? "Detalhe rapido"
      : "",
    form.observations.trim() ? "Observacoes do cliente" : "",
    form.removeElements.trim() ? "Elementos a remover" : "",
    form.addElements.trim() ? "Elementos a adicionar" : "",
    form.styleReference.trim() ? "Referencia de estilo" : "",
    form.preserveIdentity ? "Preservar identidade" : "",
    form.preserveBody ? "Preservar corpo e pose" : "",
    form.childSubject ? "Sujeito crianca" : "",
    form.negativePrompt ? "Prompt negativo" : "",
  ];

  return fields.filter(Boolean);
};

export const calculatePhotoPromptCost = (form: PhotoPromptForm) => {
  const billableFields = getPhotoPromptBillableFields(form);
  const coins = billableFields.length * PHOTO_PROMPT_FIELD_COST;

  return {
    billableFields,
    coins,
    meticais: coins * PHOTO_PROMPT_COIN_VALUE_MZN,
  };
};

export const buildPhotoPrompt = (
  identity: PhotoPromptIdentity,
  form: PhotoPromptForm,
) => {
  const selectedTextOnImage =
    form.textOnImage && form.textOnImage !== "Sem texto" ? form.textOnImage : "";
  const textInstruction =
    selectedTextOnImage && form.textOnImageContent.trim()
      ? `${selectedTextOnImage}: ${form.textOnImageContent.trim()}`
      : selectedTextOnImage;
  const selectedExtraDetails =
    form.extraDetails && form.extraDetails !== "Sem ajuste extra"
      ? form.extraDetails
      : "";
  const selectedClothing = [
    form.clothingType !== "Manter roupa original" ? form.clothingType : "",
    form.clothingColor !== "Manter cor original" ? form.clothingColor : "",
    form.clothingStyle !== "Manter estilo original" ? form.clothingStyle : "",
  ].filter(Boolean);
  const selectedHair = [
    form.hair !== "Manter cabelo original" ? form.hair : "",
    form.hairType !== "Manter tipo original" ? form.hairType : "",
  ].filter(Boolean);

  const parts = [
    `Codigo do cliente: ${identity.code}.`,
    `Tipo de foto: ${form.photoType}.`,
    `Objetivo da edicao: ${form.objective}.`,
    form.keepItems.length
      ? `O que deve ser mantido: ${form.keepItems.join(", ")}.`
      : "",
    selectedClothing.length ? `Roupa: ${selectedClothing.join(", ")}.` : "",
    selectedHair.length ? `Cabelo: ${selectedHair.join(", ")}.` : "",
    form.shoes && form.shoes !== "Manter calcado original"
      ? `Calcado: ${form.shoes}.`
      : "",
    form.preserveIdentity ? "Preservar identidade: sim." : "",
    form.preserveBody ? "Preservar corpo e pose: sim." : "",
    form.background ? `Fundo e ambiente: ${form.background}.` : "",
    form.groupComposition !== "Manter como esta"
      ? `Composicao da imagem: ${form.groupComposition}.`
      : "",
    form.lighting ? `Iluminacao: ${form.lighting}.` : "",
    `Estilo final: ${form.finalStyle}.`,
    `Proporcao final: ${form.aspectRatio}.`,
    textInstruction ? `Texto na imagem: ${textInstruction}.` : "",
    form.childSubject ? "Sujeito crianca: sim." : "",
    selectedExtraDetails ? `Detalhes extras: ${selectedExtraDetails}.` : "",
    form.observations.trim()
      ? `Observacoes do cliente: ${form.observations.trim()}.`
      : "",
    form.removeElements.trim()
      ? `Elementos a remover: ${form.removeElements.trim()}.`
      : "",
    form.addElements.trim()
      ? `Elementos a adicionar: ${form.addElements.trim()}.`
      : "",
    form.styleReference.trim()
      ? `Referencia de estilo: ${form.styleReference.trim()}.`
      : "",
    form.negativePrompt ? "Prompt negativo: ativado." : "",
  ];

  return parts.filter(Boolean).join(" ");
};
