import type { Promotion } from "~/types/promotion";

export const promotions: Promotion[] = [
  {
    id: 1,
    slug: "cctv-premium",

    title: "Promoção CCTV Premium",

    shortDescription:
      "Instalação profissional de câmeras de vigilância com desconto especial.",

    description:
      "Sistema moderno de monitoramento com acesso remoto, gravação inteligente e instalação profissional para residências e empresas.",

    discount: "20% OFF",

    badge: "Oferta Limitada",

    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop",

    active: true,

    startDate: "2026-05-20",

    endDate: "2026-06-15",

    technologies: [
      "CCTV",
      "Monitoramento Remoto",
      "Segurança Inteligente",
    ],

    features: [
      "Instalação Profissional",
      "Acesso via Smartphone",
      "Suporte Técnico",
      "Alta Definição",
    ],
  },

  {
    id: 2,
    slug: "vedacao-eletrica",

    title: "Vedação Elétrica Inteligente",

    shortDescription:
      "Proteção moderna para residências e empresas.",

    description:
      "Solução avançada de segurança perimetral com equipamentos modernos e instalação certificada.",

    discount: "15% OFF",

    badge: "Mais Vendido",

    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",

    active: true,

    startDate: "2026-05-22",

    endDate: "2026-06-10",

    technologies: [
      "Vedação Elétrica",
      "Sensores",
      "Proteção Perimetral",
    ],

    features: [
      "Alta Segurança",
      "Instalação Profissional",
      "Baixo Consumo",
      "Monitoramento Inteligente",
    ],
  },
];