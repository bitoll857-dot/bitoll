import ServicoVedacaoEletricaImagem from "~/components/imagens/ServicoVedacaoEletrica";
import ServicoCCTVImagem from "~/components/imagens/ServicoCCTV";
import ServicoMotorDePortaoImagem from "~/components/imagens/ServicoMotorDePortao";
import ServicoTecnologiaInteligenteImagem from "~/components/imagens/ServicoTecnologiaInteligente";

export const services = [
  {
    /* IDENTIFICATION */
    slug: "vedacao-eletrica",

    /* CONTENT */
    title: "Vedação Elétrica",

    icon: "",

    shortDescription:
      "Proteção perimetral moderna e inteligente.",

    description:
      "Soluções profissionais de vedação elétrica desenvolvidas para residências, empresas e ambientes industriais, oferecendo segurança avançada, monitoramento eficiente e proteção contínua.",

    image: ServicoVedacaoEletricaImagem,

    /* FEATURES */
    features: [
      "Proteção perimetral inteligente",
      "Instalação profissional",
      "Monitoramento contínuo",
      "Equipamentos modernos",
      "Alta durabilidade",
    ],

    /* BENEFITS */
    benefits: [
      "Maior segurança",
      "Proteção 24 horas",
      "Resposta rápida",
      "Controle eficiente",
    ],

    /* UX CONTENT */
    experience:
      "Projetado para oferecer segurança moderna e confiança em ambientes residenciais e empresariais.",

    audience: [
      "Residências",
      "Empresas",
      "Indústrias",
      "Condomínios",
    ],

    technologies: [
      "Sensores inteligentes",
      "Central eletrónica",
      "Monitoramento remoto",
    ],
  },

  {
    slug: "cctv-monitoramento",

    title: "CCTV & Monitoramento",

    icon: "",

    shortDescription:
      "Monitoramento inteligente com câmeras modernas.",

    description:
      "Sistemas modernos de vigilância eletrónica com monitoramento remoto, gravação inteligente e câmeras de alta definição para proteção eficiente.",

    image: ServicoCCTVImagem,

    features: [
      "Câmeras HD",
      "Monitoramento remoto",
      "Gravação inteligente",
      "Visão noturna",
      "Acesso online",
    ],

    benefits: [
      "Maior controlo",
      "Monitoramento em tempo real",
      "Proteção contínua",
      "Redução de riscos",
    ],

    experience:
      "Experiência moderna em vigilância e controlo de ambientes com tecnologia inteligente.",

    audience: [
      "Residências",
      "Empresas",
      "Lojas",
      "Escritórios",
    ],

    technologies: [
      "Câmeras IP",
      "DVR/NVR",
      "Cloud monitoring",
    ],
  },

  {
    slug: "motores-de-portoes",

    title: "Motores de Portões",

    icon: "",

    shortDescription:
      "Automação eficiente para portões modernos.",

    description:
      "Soluções modernas de automação para portões residenciais e industriais, oferecendo conforto, segurança e controlo inteligente.",

    image: ServicoMotorDePortaoImagem,

    features: [
      "Automação residencial",
      "Motores modernos",
      "Controlo remoto",
      "Instalação profissional",
      "Alta performance",
    ],

    benefits: [
      "Maior comodidade",
      "Segurança automatizada",
      "Controle remoto",
      "Eficiência operacional",
    ],

    experience:
      "Tecnologia moderna voltada para conforto, segurança e automação inteligente.",

    audience: [
      "Residências",
      "Empresas",
      "Condomínios",
      "Armazéns",
    ],

    technologies: [
      "Motores automáticos",
      "Controlo remoto",
      "Sensores inteligentes",
    ],
  },

  {
    slug: "tecnologia-inteligente",

    title: "Tecnologia Inteligente",

    icon: "",

    shortDescription:
      "Automação e infraestrutura tecnológica moderna.",

    description:
      "Soluções modernas em automação, controlo de acesso e infraestrutura tecnológica desenvolvidas para ambientes inteligentes e conectados.",

    image: ServicoTecnologiaInteligenteImagem,

    features: [
      "Automação inteligente",
      "Infraestrutura moderna",
      "Integração tecnológica",
      "Controlo de acesso",
      "Sistemas conectados",
    ],

    benefits: [
      "Maior eficiência",
      "Ambientes inteligentes",
      "Gestão moderna",
      "Tecnologia integrada",
    ],

    experience:
      "Infraestrutura tecnológica moderna para ambientes conectados e inteligentes.",

    audience: [
      "Empresas",
      "Indústrias",
      "Escritórios",
      "Projetos tecnológicos",
    ],

    technologies: [
      "IoT",
      "Automação",
      "Sistemas inteligentes",
    ],
  },
];