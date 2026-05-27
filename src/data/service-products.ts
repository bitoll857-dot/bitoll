import type {
  ServiceProduct,
  ServiceProductCatalog,
  StructureOption,
  StructureType,
} from "~/types/service-products";

export const structureOptions: StructureOption[] = [
  {
    label: "Basica",
    value: "basica",
    description: "Solucao essencial para instalacoes simples e custo contido.",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop",
    imageAlt: "Estrutura basica de seguranca",
  },
  {
    label: "Media",
    value: "media",
    description: "Solucao equilibrada com mais cobertura e melhor controlo.",
    imageUrl:
      "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=900&auto=format&fit=crop",
    imageAlt: "Estrutura media de seguranca",
  },
  {
    label: "Alta",
    value: "alta",
    description: "Solucao completa para alto desempenho e maior protecao.",
    imageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=900&auto=format&fit=crop",
    imageAlt: "Estrutura alta de tecnologia e seguranca",
  },
];

const createProducts = (
  prefix: string,
  baseProducts: Omit<ServiceProduct, "id">[],
): ServiceProduct[] =>
  baseProducts.map((product, index) => ({
    ...product,
    id: `${prefix}-${index + 1}`,
  }));

export const serviceProductCatalogs: ServiceProductCatalog[] = [
  {
    serviceSlug: "vedacao-eletrica",
    productsByStructure: {
      basica: createProducts("ved-basica", [
        {
          name: "Energizador de cerca",
          quantity: "1 unidade",
          estimatedQuantity: 1,
          unitPrice: 12000,
          brand: "Nemtek",
          model: "Wizord 2",
          system: "Cerca eletrica",
          category: "Central",
          description: "Controla e alimenta a vedacao eletrica.",
          detail:
            "E o equipamento principal do sistema. Define a potencia, monitora falhas e mantem a cerca eletrificada.",
          required: true,
        },
        {
          name: "Fio de aluminio",
          quantity: "Conforme perimetro",
          estimatedQuantity: 2,
          unitPrice: 2200,
          brand: "Nemtek",
          model: "Arame de aco 680m",
          system: "Condutor",
          category: "Condutor",
          description: "Linha eletrificada instalada no muro.",
          detail:
            "Usado para conduzir o pulso eletrico. A quantidade depende do tamanho do perimetro e numero de linhas.",
          required: true,
        },
        {
          name: "Hastes e isoladores",
          quantity: "Conforme perimetro",
          estimatedQuantity: 35,
          unitPrice: 350,
          brand: "Nemtek",
          model: "Poste galvanizado 6 linhas",
          system: "Estrutura",
          category: "Estrutura",
          description: "Suporte fisico para as linhas da cerca.",
          detail:
            "Mantem os fios afastados da parede e evita fuga de corrente para a estrutura.",
          required: true,
        },
      ]),
      media: createProducts("ved-media", [
        {
          name: "Energizador profissional",
          quantity: "1 unidade",
          estimatedQuantity: 1,
          unitPrice: 12000,
          brand: "Nemtek",
          model: "Wizord 2",
          system: "Cerca eletrica",
          category: "Central",
          description: "Central com melhor capacidade de controlo.",
          detail:
            "Indicado para perimetros maiores, com maior estabilidade e melhor resposta a disparos.",
          required: true,
        },
        {
          name: "Sirene e sinalizador",
          quantity: "1 conjunto",
          estimatedQuantity: 1,
          unitPrice: 1200,
          brand: "Nemtek",
          model: "Sirene 12V + luz estroboscopica",
          system: "Alarme",
          category: "Alerta",
          description: "Emite alerta sonoro e visual em ocorrencias.",
          detail:
            "Ajuda a chamar atencao localmente quando ha corte, curto ou tentativa de intrusao.",
          required: true,
        },
        {
          name: "Bateria de backup",
          quantity: "1 unidade",
          estimatedQuantity: 1,
          unitPrice: 4200,
          brand: "Moura",
          model: "12V 7Ah",
          system: "Energia",
          category: "Energia",
          description: "Mantem a cerca ativa em falha eletrica.",
          detail:
            "Garante continuidade temporaria do sistema quando a energia principal falha.",
          required: false,
        },
        {
          name: "Placas de aviso",
          quantity: "Conforme perimetro",
          estimatedQuantity: 16,
          unitPrice: 80,
          brand: "Nemtek",
          model: "Placa de aviso",
          system: "Sinalizacao",
          category: "Seguranca",
          description: "Sinalizacao visivel da cerca eletrica.",
          detail:
            "Importante para alerta preventivo e organizacao de seguranca do local.",
          required: true,
        },
      ]),
      alta: createProducts("ved-alta", [
        {
          name: "Central por zonas",
          quantity: "Conforme projeto",
          estimatedQuantity: 1,
          unitPrice: 12000,
          brand: "Nemtek",
          model: "Wizord 2",
          system: "Cerca eletrica",
          category: "Central",
          description: "Divide o perimetro por areas monitoradas.",
          detail:
            "Facilita identificar rapidamente onde aconteceu uma falha ou tentativa de intrusao.",
          required: true,
        },
        {
          name: "Protecao contra surtos",
          quantity: "1 conjunto",
          estimatedQuantity: 1,
          unitPrice: 2800,
          brand: "Nemtek",
          model: "Protecao HT",
          system: "Protecao eletrica",
          category: "Protecao",
          description: "Ajuda a proteger contra descargas eletricas.",
          detail:
            "Reduz riscos de dano causado por variacoes eletricas e descargas atmosfericas.",
          required: true,
        },
        {
          name: "Modulo de monitoramento",
          quantity: "1 unidade",
          estimatedQuantity: 1,
          unitPrice: 6000,
          brand: "ZKTeco",
          model: "Modulo remoto",
          system: "Monitoramento",
          category: "Monitoramento",
          description: "Permite acompanhamento remoto do sistema.",
          detail:
            "Pode integrar alertas e estados da cerca a uma central ou equipa de seguranca.",
          required: false,
        },
        {
          name: "Hastes reforcadas",
          quantity: "Conforme perimetro",
          estimatedQuantity: 52,
          unitPrice: 350,
          brand: "Nemtek",
          model: "Poste galvanizado 6 linhas",
          system: "Estrutura",
          category: "Estrutura",
          description: "Estrutura mais resistente para perimetros exigentes.",
          detail:
            "Indicadas para muros longos, zonas expostas e locais com maior risco.",
          required: true,
        },
      ]),
    },
  },
  {
    serviceSlug: "cctv-monitoramento",
    productsByStructure: {
      basica: createProducts("cctv-basica", [
        {
          name: "Cameras HD",
          quantity: "2 a 4 unidades",
          estimatedQuantity: 4,
          unitPrice: 1000,
          brand: "Hikvision",
          model: "DS-2CE1AD0T-IRPF 2MP",
          system: "Analogico Turbo HD",
          category: "Captacao",
          description: "Cameras para pontos principais.",
          detail:
            "Cobrem entradas, corredores e areas essenciais com boa qualidade de imagem.",
          required: true,
        },
        {
          name: "DVR/NVR",
          quantity: "1 unidade",
          estimatedQuantity: 1,
          unitPrice: 4500,
          brand: "Hikvision",
          model: "IDS-7204HQHI-M1/XT",
          system: "Analogico Turbo HD",
          category: "Gravacao",
          description: "Equipamento para gerir e gravar imagens.",
          detail:
            "Centraliza as cameras e permite consulta das gravacoes quando necessario.",
          required: true,
        },
        {
          name: "Disco rigido",
          quantity: "1 unidade",
          estimatedQuantity: 1,
          unitPrice: 4000,
          brand: "Seagate",
          model: "SkyHawk 1TB",
          system: "Armazenamento CCTV",
          category: "Armazenamento",
          description: "Guarda as gravacoes do sistema.",
          detail:
            "A capacidade define por quanto tempo as imagens ficam disponiveis.",
          required: true,
        },
      ]),
      media: createProducts("cctv-media", [
        {
          name: "Cameras IP ou HD",
          quantity: "4 a 8 unidades",
          estimatedQuantity: 6,
          unitPrice: 2300,
          brand: "Tiandy",
          model: "TC-C321N 5MP",
          system: "IP",
          category: "Captacao",
          description: "Cobertura ampliada para areas importantes.",
          detail:
            "Permitem melhor distribuicao de pontos de vigilancia e menor zona cega.",
          required: true,
        },
        {
          name: "Switch PoE",
          quantity: "1 unidade",
          estimatedQuantity: 1,
          unitPrice: 6000,
          brand: "Tiandy",
          model: "NVR TC-R3108 AK",
          system: "IP",
          category: "Rede",
          description: "Liga e alimenta cameras IP.",
          detail:
            "Simplifica a instalacao porque alimenta as cameras pelo mesmo cabo de rede.",
          required: false,
        },
        {
          name: "Rack tecnico",
          quantity: "1 unidade",
          estimatedQuantity: 1,
          unitPrice: 2850,
          brand: "Bitoll",
          model: "Calha e organizacao tecnica",
          system: "Infraestrutura",
          category: "Organizacao",
          description: "Organiza gravador, rede e cabos.",
          detail:
            "Protege equipamentos e facilita manutencao futura do sistema.",
          required: false,
        },
        {
          name: "Acesso remoto",
          quantity: "1 configuracao",
          estimatedQuantity: 1,
          unitPrice: 6000,
          brand: "Bitoll",
          model: "Instalacao, configuracao e teste",
          system: "Software",
          category: "Software",
          description: "Permite acompanhar cameras pelo telefone.",
          detail:
            "Configura acesso seguro para visualizacao externa quando houver internet.",
          required: true,
        },
      ]),
      alta: createProducts("cctv-alta", [
        {
          name: "Cameras profissionais",
          quantity: "8 ou mais",
          estimatedQuantity: 8,
          unitPrice: 3600,
          brand: "EZVIZ",
          model: "H6c Pro 2K",
          system: "Wi-Fi",
          category: "Captacao",
          description: "Cameras robustas para cobertura completa.",
          detail:
            "Indicadas para areas maiores, com maior necessidade de detalhe e confiabilidade.",
          required: true,
        },
        {
          name: "Camera PTZ",
          quantity: "Opcional",
          estimatedQuantity: 1,
          unitPrice: 6500,
          brand: "Tiandy",
          model: "PTZ IP",
          system: "IP",
          category: "Monitoramento ativo",
          description: "Camera movel para vigiar areas amplas.",
          detail:
            "Permite aproximar imagem, girar a lente e acompanhar pontos dinamicos.",
          required: false,
        },
        {
          name: "Storage de gravacao",
          quantity: "Conforme retencao",
          estimatedQuantity: 1,
          unitPrice: 6500,
          brand: "Seagate",
          model: "SkyHawk 2TB",
          system: "Armazenamento CCTV",
          category: "Armazenamento",
          description: "Guarda grande volume de imagens.",
          detail:
            "Usado quando o cliente precisa manter gravacoes por mais tempo.",
          required: true,
        },
        {
          name: "UPS/Nobreak",
          quantity: "1 conjunto",
          estimatedQuantity: 1,
          unitPrice: 9000,
          brand: "Bitoll",
          model: "Backup CCTV",
          system: "Energia",
          category: "Energia",
          description: "Mantem o CCTV ativo em falha eletrica.",
          detail:
            "Evita interrupcao imediata do monitoramento durante quedas de energia.",
          required: true,
        },
      ]),
    },
  },
  {
    serviceSlug: "motores-de-portoes",
    productsByStructure: {
      basica: createProducts("motor-basica", [
        {
          name: "Motor de portao",
          quantity: "1 unidade",
          category: "Automacao",
          description: "Motor adequado ao tipo de portao.",
          detail:
            "O modelo depende do peso, tamanho e frequencia de uso do portao.",
          required: true,
        },
        {
          name: "Controles remotos",
          quantity: "2 unidades",
          category: "Acesso",
          description: "Permitem abrir o portao a distancia.",
          detail:
            "Facilitam o uso diario e reduzem necessidade de abertura manual.",
          required: true,
        },
        {
          name: "Cremalheira ou braco",
          quantity: "Conforme portao",
          category: "Mecanica",
          description: "Transmite movimento do motor ao portao.",
          detail:
            "Elemento mecanico essencial para mover portoes deslizantes ou basculantes.",
          required: true,
        },
      ]),
      media: createProducts("motor-media", [
        {
          name: "Motor de alto ciclo",
          quantity: "1 unidade",
          category: "Automacao",
          description: "Motor para uso mais frequente.",
          detail:
            "Indicado quando o portao abre muitas vezes por dia e precisa de maior resistencia.",
          required: true,
        },
        {
          name: "Fotocelula",
          quantity: "1 par",
          category: "Seguranca",
          description: "Evita fechamento sobre pessoas ou veiculos.",
          detail:
            "Detecta obstaculos no curso do portao e aumenta a seguranca da instalacao.",
          required: true,
        },
        {
          name: "Sinalizador luminoso",
          quantity: "1 unidade",
          category: "Sinalizacao",
          description: "Indica quando o portao esta em movimento.",
          detail:
            "Ajuda pedestres e motoristas a perceberem a operacao do portao.",
          required: false,
        },
        {
          name: "Backup de energia",
          quantity: "Opcional",
          category: "Energia",
          description: "Mantem acesso em falha eletrica.",
          detail:
            "Permite abertura temporaria quando nao ha energia da rede principal.",
          required: false,
        },
      ]),
      alta: createProducts("motor-alta", [
        {
          name: "Motor industrial",
          quantity: "Conforme portao",
          category: "Automacao",
          description: "Motor para portoes pesados ou alto trafego.",
          detail:
            "Projetado para operacao intensa e estruturas maiores.",
          required: true,
        },
        {
          name: "Painel de comando",
          quantity: "1 unidade",
          category: "Controle",
          description: "Controla seguranca, abertura e configuracoes.",
          detail:
            "Permite ajustar comportamento do motor e integrar sensores.",
          required: true,
        },
        {
          name: "Barreiras de seguranca",
          quantity: "1 conjunto",
          category: "Seguranca",
          description: "Protecao adicional para areas com maior fluxo.",
          detail:
            "Reduz risco operacional em entradas movimentadas ou industriais.",
          required: true,
        },
        {
          name: "Controle de acesso integrado",
          quantity: "Conforme usuarios",
          category: "Acesso",
          description: "Integra tags, botoeiras ou sistema remoto.",
          detail:
            "Melhora gestao de quem pode abrir e usar o portao.",
          required: false,
        },
      ]),
    },
  },
  {
    serviceSlug: "tecnologia-inteligente",
    productsByStructure: {
      basica: createProducts("tech-basica", [
        {
          name: "Roteador ou access point",
          quantity: "1 unidade",
          estimatedQuantity: 1,
          unitPrice: 3600,
          brand: "LB-Link",
          model: "Router 4G",
          system: "Internet",
          category: "Rede",
          description: "Base de conectividade para dispositivos.",
          detail:
            "Garante que os equipamentos inteligentes tenham comunicacao estavel.",
          required: true,
        },
        {
          name: "Hub inteligente",
          quantity: "1 unidade",
          estimatedQuantity: 1,
          unitPrice: 18000,
          brand: "Starlink",
          model: "Mini",
          system: "Internet satelital",
          category: "Automacao",
          description: "Centraliza dispositivos inteligentes.",
          detail:
            "Permite controlar sensores, luzes e outros dispositivos conectados.",
          required: true,
        },
        {
          name: "Configuracao em aplicativo",
          quantity: "1 servico",
          estimatedQuantity: 5,
          unitPrice: 300,
          brand: "Bitoll",
          model: "Instalacao, configuracao e testes",
          system: "Servico tecnico",
          category: "Software",
          description: "Deixa o controlo pronto no telemovel.",
          detail:
            "Organiza os dispositivos e permite uso diario sem configuracao manual.",
          required: true,
        },
      ]),
      media: createProducts("tech-media", [
        {
          name: "Switch de rede",
          quantity: "1 unidade",
          estimatedQuantity: 1,
          unitPrice: 6000,
          brand: "TP-Link",
          model: "Switch gigabit",
          system: "Rede",
          category: "Rede",
          description: "Liga varios equipamentos numa estrutura organizada.",
          detail:
            "Ajuda a expandir a rede para cameras, pontos Wi-Fi e automacao.",
          required: true,
        },
        {
          name: "Sensores inteligentes",
          quantity: "Conforme ambientes",
          estimatedQuantity: 4,
          unitPrice: 1200,
          brand: "EZVIZ",
          model: "Sensor inteligente",
          system: "Automacao",
          category: "Automacao",
          description: "Monitoram movimento, abertura ou eventos.",
          detail:
            "Podem acionar alertas, luzes ou automacoes conforme a necessidade.",
          required: true,
        },
        {
          name: "Wi-Fi de cobertura",
          quantity: "Conforme area",
          estimatedQuantity: 1,
          unitPrice: 18000,
          brand: "Starlink",
          model: "Standard V4",
          system: "Internet satelital",
          category: "Rede",
          description: "Melhora sinal em areas maiores.",
          detail:
            "Garante melhor alcance e estabilidade para os sistemas inteligentes.",
          required: true,
        },
        {
          name: "Rack e organizacao",
          quantity: "Opcional",
          estimatedQuantity: 10,
          unitPrice: 190,
          brand: "Bitoll",
          model: "Calha plastica 25x16mm",
          system: "Infraestrutura",
          category: "Organizacao",
          description: "Protege equipamentos e organiza cabos.",
          detail:
            "Facilita manutencao e deixa a instalacao mais profissional.",
          required: false,
        },
      ]),
      alta: createProducts("tech-alta", [
        {
          name: "Controlo de acesso",
          quantity: "Conforme entradas",
          category: "Acesso",
          description: "Gestao de entrada por senha, tag ou biometria.",
          detail:
            "Permite controlar quem entra, quando entra e em que zona pode acessar.",
          required: true,
        },
        {
          name: "Sensores IoT",
          quantity: "Conforme projeto",
          category: "Automacao",
          description: "Monitoramento conectado de eventos e equipamentos.",
          detail:
            "Usado para acompanhar ambientes, equipamentos e processos com dados em tempo real.",
          required: true,
        },
        {
          name: "Painel tecnico",
          quantity: "1 conjunto",
          category: "Infraestrutura",
          description: "Centraliza energia e equipamentos de controlo.",
          detail:
            "Organiza a instalacao e facilita expansao futura.",
          required: true,
        },
        {
          name: "UPS/Nobreak",
          quantity: "1 unidade",
          category: "Energia",
          description: "Mantem sistemas essenciais ativos.",
          detail:
            "Evita paragens imediatas em quedas de energia.",
          required: true,
        },
      ]),
    },
  },
];

export const getServiceProducts = (
  serviceSlug: string,
  structureType: StructureType,
) => {
  const catalog = serviceProductCatalogs.find(
    (item) => item.serviceSlug === serviceSlug,
  );

  return catalog?.productsByStructure[structureType] ?? [];
};
