import type { QuickPromptModel } from "./types";

export const photoTypes = [
  "Foto com muitas pessoas",
  "Quadros ou colagens",
  "Foto antiga sem cor",
  "Foto antiga colorida",
  "Foto moderna de rosto",
  "Foto moderna de corpo inteiro",
];

export const objectivesByPhotoType: Record<string, string[]> = {
  "Foto com muitas pessoas": [
    "Destacar pessoa principal",
    "Destacar grupo especifico",
    "Remover pessoas indesejadas",
    "Suavizar fundo e distracoes",
    "Melhorar qualidade geral",
    "Preparar para publicacao",
  ],
  "Quadros ou colagens": [
    "Harmonizar imagens",
    "Destacar imagem principal",
    "Melhorar qualidade geral",
    "Corrigir alinhamento",
    "Remover ou substituir imagem",
    "Preparar para publicacao",
  ],
  "Foto antiga sem cor": [
    "Restaurar foto antiga",
    "Colorir naturalmente",
    "Remover manchas e riscos",
    "Melhorar rosto e detalhes",
    "Criar antes e depois",
  ],
  "Foto antiga colorida": [
    "Restaurar foto antiga",
    "Corrigir cores apagadas",
    "Remover manchas e riscos",
    "Melhorar nitidez e iluminacao",
    "Criar antes e depois",
  ],
  "Foto moderna de rosto": [
    "Melhorar rosto sem alterar identidade",
    "Melhorar pele naturalmente",
    "Organizar cabelo",
    "Melhorar fundo",
    "Criar foto de perfil profissional",
    "Preparar para redes sociais",
  ],
  "Foto moderna de corpo inteiro": [
    "Melhorar qualidade geral",
    "Melhorar roupa",
    "Organizar cabelo",
    "Melhorar calcado",
    "Melhorar fundo",
    "Criar foto profissional de corpo inteiro",
    "Preparar para publicacao",
  ],
};

export const getObjectiveOptions = (photoType: string) =>
  objectivesByPhotoType[photoType] ?? objectivesByPhotoType[photoTypes[0]];

export const keepOptions = [
  "Rosto original",
  "Tracos faciais",
  "Cor natural da pele",
  "Expressao da pessoa",
  "Volume natural do corpo",
  "Roupa original",
  "Cabelo original",
  "Calcado original",
];

export const styleOptions = [
  "Natural",
  "Profissional",
  "Elegante",
  "Cinematografico",
  "Estudio limpo",
  "Para redes sociais",
];

export const aspectRatios = [
  "1:1 - Foto de perfil",
  "4:5 - Instagram",
  "9:16 - Status / Stories",
  "16:9 - Horizontal",
  "A4 - Panfleto ou quadro",
];

export const textOnImageOptions = [
  "Sem texto",
  "Adicionar nome",
  "Adicionar legenda curta",
  "Adicionar frase promocional",
  "Texto com sombra",
];

export const clothingTypeOptions = [
  "Manter roupa original",
  "Melhorar roupa original",
  "Roupa social",
  "Camisa formal",
  "Blazer",
  "Vestido elegante",
  "Roupa casual discreta",
  "Uniforme profissional",
];

export const clothingColorOptions = [
  "Manter cor original",
  "Preto",
  "Branco",
  "Azul escuro",
  "Cinza",
  "Cor harmonizada com a foto",
];

export const clothingStyleOptions = [
  "Manter estilo original",
  "Profissional discreto",
  "Elegante",
  "Natural",
  "Moderno",
  "Classico",
];

export const hairOptions = [
  "Manter cabelo original",
  "Organizar cabelo sem mudar identidade",
  "Remover fios soltos",
  "Melhorar brilho natural",
  "Manter penteado natural",
];

export const hairTypeOptions = [
  "Manter tipo original",
  "Cabelo curto",
  "Cabelo medio",
  "Cabelo longo",
  "Cabelo crespo natural",
  "Cabelo cacheado",
  "Cabelo liso",
  "Cabelo ondulado",
  "Trancas simples",
  "Trancas box braids",
  "Trancas nago",
  "Trancas twist",
  "Dreadlocks",
  "Coque discreto",
  "Rabo de cavalo",
];

export const shoesOptions = [
  "Manter calcado original",
  "Melhorar calcado original",
  "Calcado discreto",
  "Sapato social",
  "Sapato casual limpo",
  "Nao destacar calcado",
];

export const backgroundOptions = [
  "Manter fundo original melhorado",
  "Fundo profissional limpo",
  "Fundo de estudio claro",
  "Fundo neutro",
  "Remover fundo desorganizado",
  "Suavizar fundo e distracoes",
];

export const lightingOptions = [
  "Iluminacao natural suave",
  "Iluminacao de estudio",
  "Iluminacao cinematografica suave",
  "Corrigir foto escura",
  "Realcar rosto com luz suave",
  "Manter luz original melhorada",
];

export const extraDetailOptions = [
  "Sem ajuste extra",
  "Limpeza geral da imagem",
  "Melhorar pele sem exagero",
  "Aumentar nitidez geral",
  "Corrigir cores naturais",
  "Preparar para redes sociais",
  "Preparar para documento profissional",
];

export const groupCompositionOptions = [
  "Manter como esta",
  "Juntar as pessoas numa unica imagem",
  "Juntar as pessoas lado a lado",
  "Juntar as pessoas no mesmo fundo",
  "Criar retrato de grupo natural",
  "Unificar iluminacao e proporcao das pessoas",
];

export const quickModels: QuickPromptModel[] = [
  {
    label: "Foto antiga",
    photoType: "Foto antiga sem cor",
    objective: "Restaurar foto antiga",
    problems: [],
    style: "Natural",
  },
  {
    label: "Retrato profissional",
    photoType: "Foto moderna de rosto",
    objective: "Criar foto de perfil profissional",
    problems: [],
    style: "Profissional",
  },
  {
    label: "Corpo inteiro",
    photoType: "Foto moderna de corpo inteiro",
    objective: "Criar foto profissional de corpo inteiro",
    problems: [],
    style: "Elegante",
  },
];
