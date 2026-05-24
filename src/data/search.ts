import type { SearchResult } from "~/types/search";

export const searchData: SearchResult[] = [
  {
    id: "srv-1",
    type: "service",
    title: "Sistema CCTV",
    description: "Instalação de câmeras de vigilância",
    category: "Segurança",
    status: "Ativo",
  },

  {
    id: "srv-2",
    type: "service",
    title: "Vedação Elétrica",
    description: "Proteção perimetral residencial",
    category: "Segurança",
    status: "Ativo",
  },

  {
    id: "promo-1",
    type: "promotion",
    title: "Promoção CCTV Junho",
    description: "20% desconto em kits CCTV",
    category: "Promoção",
    status: "20% OFF",
  },

  {
    id: "promo-2",
    type: "promotion",
    title: "Motor de Portão Premium",
    description: "Instalação grátis",
    category: "Automação",
    status: "Novo",
  },

  {
    id: "req-1",
    type: "request",
    title: "Instalação CCTV Residencial",
    description: "Cliente anônimo solicitou instalação T3",
    category: "Solicitação",
    status: "Pendente",
  },

  {
    id: "req-2",
    type: "request",
    title: "Vedação para Armazém",
    description: "Projeto solicitado em Beira",
    category: "Solicitação",
    status: "Em análise",
  },

  {
    id: "prd-1",
    type: "product",
    title: "Kit Hikvision 4 Câmeras",
    description: "Kit completo DVR + câmeras",
    category: "CCTV",
    status: "Disponível",
    price: 25000,
  },

  {
    id: "prd-2",
    type: "product",
    title: "Sensor Inteligente Wi-Fi",
    description: "Sensor para automação residencial",
    category: "Smart Home",
    status: "Disponível",
    price: 4500,
  },
];