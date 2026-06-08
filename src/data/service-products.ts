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

const product = (
  name: string,
  quantity: number,
  unitPrice: number,
  category: string,
  options: Partial<ServiceProduct> = {},
): Omit<ServiceProduct, "id"> => ({
  name,
  quantity: `${quantity} ${quantity === 1 ? "unidade" : "unidades"}`,
  estimatedQuantity: quantity,
  unitPrice,
  brand: options.brand,
  model: options.model ?? "Padrao",
  system: options.system ?? category,
  category,
  description: options.description ?? name,
  detail:
    options.detail ??
    "Artigo importado dos moldes reais de cotacao da Bitoll em public/proformas/moldes.",
  required: options.required ?? true,
});

const createProducts = (
  prefix: string,
  baseProducts: Omit<ServiceProduct, "id">[],
): ServiceProduct[] =>
  baseProducts.map((item, index) => ({
    ...item,
    id: `${prefix}-${index + 1}`,
  }));

const analogCctvProducts = createProducts("cctv-analog", [
  product("Camera Hikvision DS-2CE1AD0T-IRPF 2MP Turbo HD", 4, 1000, "Captacao", {
    brand: "Hikvision",
    model: "DS-2CE1AD0T-IRPF 2MP 2.8mm",
    system: "Analogico Turbo HD",
  }),
  product("DVR Hikvision AcuSense 8 canais IDS-7204HQHI-M1/XT", 1, 4500, "Gravacao", {
    brand: "Hikvision",
    model: "IDS-7204HQHI-M1/XT",
    system: "Analogico Turbo HD",
  }),
  product("Hikvision DS-1H18S/E(C) Video transceiver Balun", 4, 260, "Conectividade", {
    brand: "Hikvision",
    model: "DS-1H18S/E(C)",
    system: "Video balun",
  }),
  product("PSU Power Jack para CCTV", 4, 40, "Energia"),
  product("Fonte de alimentacao 12V 5A", 1, 1300, "Energia"),
  product("Pacote de buchas 6x40mm", 2, 100, "Fixacao"),
  product("Cintas 5x300mm 100pcs", 1, 100, "Fixacao"),
  product("Disco rigido Seagate SkyHawk 1TB", 1, 4000, "Armazenamento", {
    brand: "Seagate",
    model: "SkyHawk 1TB",
    system: "Armazenamento CCTV",
  }),
  product("RJ45 Cat6 U/UTP patch cord - 1m", 100, 30, "Cabo", {
    model: "Cat6 U/UTP",
    system: "Rede",
  }),
  product("Calha plastica 25x16mm", 15, 190, "Acabamento"),
  product("Caixa de derivacao 85x85x50mm plastica", 4, 150, "Infraestrutura"),
  product("Instalacao, configuracao e teste", 4, 1000, "Mao de obra", {
    system: "Servico tecnico",
    model: "Instalacao CCTV",
  }),
]);

const ipCctvProducts = createProducts("cctv-ip", [
  product("Camera Tiandy TC-C321N 1CNB-28 5MP", 6, 2300, "Captacao", {
    brand: "Tiandy",
    model: "TC-C321N 1CNB-28 5MP",
    system: "IP",
  }),
  product("NVR Tiandy 8 canais TC-R3108 AK Series", 1, 6000, "Gravacao", {
    brand: "Tiandy",
    model: "TC-R3108 AK Series",
    system: "IP",
  }),
  product("Conector Ethernet RJ45", 20, 50, "Conectividade"),
  product("Protetor Ethernet RJ45", 12, 30, "Conectividade"),
  product("Pacote de buchas 6x40mm", 2, 100, "Fixacao"),
  product("Cintas 5x300mm 100pcs", 1, 100, "Fixacao"),
  product("Disco rigido Seagate SkyHawk 2TB", 1, 6500, "Armazenamento", {
    brand: "Seagate",
    model: "SkyHawk 2TB",
    system: "Armazenamento CCTV",
  }),
  product("RJ45 Cat6 U/UTP patch cord - 1m", 200, 30, "Cabo", {
    model: "Cat6 U/UTP",
    system: "Rede",
  }),
  product("Calha plastica 25x16mm", 15, 190, "Acabamento"),
  product("Caixa de derivacao 85x85x50mm plastica", 6, 150, "Infraestrutura"),
  product("Tubo anelado 16mm", 30, 65, "Infraestrutura"),
  product("Custo adicional", 1, 500, "Servico"),
  product("Instalacao, configuracao e teste", 6, 1000, "Mao de obra", {
    system: "Servico tecnico",
    model: "Instalacao CCTV IP",
  }),
]);

const wifiCctvProducts = createProducts("cctv-wifi", [
  product("Camera domestica inteligente EZVIZ H6c Pro 2K", 4, 3600, "Captacao", {
    brand: "EZVIZ",
    model: "H6c Pro 2K",
    system: "Wi-Fi",
  }),
  product("Cartao de memoria SanDisk Ultra 64GB uSD", 4, 1200, "Armazenamento", {
    brand: "SanDisk",
    model: "Ultra 64GB",
  }),
  product("Router LB-Link 4G com cartao SIM", 1, 3600, "Rede", {
    brand: "LB-Link",
    model: "Router 4G",
    system: "Internet",
  }),
  product("Pacote de buchas 8x40mm", 1, 200, "Fixacao"),
  product("Cintas 5x300mm 100pcs", 1, 100, "Fixacao"),
  product("Calha plastica 25x16mm", 4, 190, "Acabamento"),
  product("Mao de obra", 4, 1000, "Mao de obra", {
    system: "Servico tecnico",
    model: "Instalacao CCTV Wi-Fi",
  }),
]);

const electricFenceProducts = createProducts("ved-real", [
  product("Nemtek Wizord 2 Energizador", 1, 12000, "Central", {
    brand: "Nemtek",
    model: "Wizord 2",
    system: "Cerca eletrica",
  }),
  product("Nemtek Poste galvanizado de 6 linhas", 52, 350, "Estrutura", {
    brand: "Nemtek",
    model: "Poste galvanizado 6 linhas",
    system: "Cerca eletrica",
  }),
  product("Nemtek Arame de aco 680 metros", 2, 2200, "Condutor", {
    brand: "Nemtek",
    model: "Arame de aco 680m",
    system: "Cerca eletrica",
  }),
  product("Nemtek Electro terra 1 metro", 4, 300, "Aterramento", {
    brand: "Nemtek",
    system: "Cerca eletrica",
  }),
  product("Nemtek Caixa de molas 50pcs", 2, 1300, "Tensionamento", {
    brand: "Nemtek",
    system: "Cerca eletrica",
  }),
  product("Nemtek Pacote de ferrules 100pcs", 2, 600, "Conectividade", {
    brand: "Nemtek",
    system: "Cerca eletrica",
  }),
  product("Nemtek Sirene de buzina 12V", 1, 400, "Alarme", {
    brand: "Nemtek",
    system: "Alarme",
  }),
  product("Nemtek Luz estroboscopica 12V", 1, 800, "Alarme", {
    brand: "Nemtek",
    system: "Alarme",
  }),
  product("Nemtek Pacote de ganchos 100pcs", 1, 600, "Fixacao", {
    brand: "Nemtek",
  }),
  product("Pacote de buchas 8x80mm 50pcs", 3, 400, "Fixacao"),
  product("Nemtek Placa de aviso", 16, 80, "Sinalizacao", {
    brand: "Nemtek",
    model: "Placa de aviso",
  }),
  product("Nemtek Cabo HT aco 50 metros", 2, 1400, "Cabo", {
    brand: "Nemtek",
    model: "Cabo HT 50m",
    system: "Cerca eletrica",
  }),
  product("ZKTeco Cabo UTP CAT6 1 metro", 6, 30, "Cabo", {
    brand: "ZKTeco",
    model: "CAT6",
    system: "Rede",
  }),
  product("Calha plastica 25x16mm 2 metros", 2, 190, "Acabamento"),
  product("Tubo anelado 16mm", 10, 50, "Infraestrutura"),
  product("Instalacao, configuracao e testes", 1, 12000, "Mao de obra", {
    system: "Servico tecnico",
    model: "Instalacao cerca eletrica",
  }),
]);

const internetKitProducts = createProducts("internet-kit", [
  product("Starlink Mini Kit Portatil Ultra-Compacto", 1, 18000, "Internet", {
    brand: "Starlink",
    model: "Mini",
    system: "Internet satelital",
  }),
  product("RJ45 Cat6 U/UTP cabo de manobra - 1 metro", 5, 30, "Cabo", {
    model: "Cat6 U/UTP",
    system: "Rede",
  }),
  product("Conector RJ45", 1, 25, "Conectividade"),
  product("Bota para conector RJ45", 10, 25, "Conectividade"),
  product("Calha plastica 25x16mm 2 metros", 10, 190, "Acabamento"),
  product("Pacote de buchas 8x40mm 50pcs", 1, 200, "Fixacao"),
  product("Pacote de cintas 5x300mm 100pcs", 1, 100, "Fixacao"),
  product("Mao de obra - instalacao, configuracao e testes", 5, 300, "Mao de obra", {
    system: "Servico tecnico",
    model: "Instalacao kit internet",
  }),
]);

export const serviceProductCatalogs: ServiceProductCatalog[] = [
  {
    serviceSlug: "vedacao-eletrica",
    productsByStructure: {
      basica: electricFenceProducts,
      media: electricFenceProducts,
      alta: electricFenceProducts,
    },
  },
  {
    serviceSlug: "cctv-monitoramento",
    productsByStructure: {
      basica: analogCctvProducts,
      media: ipCctvProducts,
      alta: wifiCctvProducts,
    },
  },
  {
    serviceSlug: "motores-de-portoes",
    productsByStructure: {
      basica: createProducts("motor-basica", [
        product("Motor de portao residencial", 1, 0, "Automacao", {
          model: "A definir por peso e dimensao",
          required: true,
        }),
        product("Controles remotos", 2, 0, "Acesso"),
        product("Cremalheira ou braco", 1, 0, "Mecanica"),
        product("Mao de obra - instalacao do motor", 1, 3500, "Mao de obra", {
          system: "Servico tecnico",
        }),
      ]),
      media: createProducts("motor-media", [
        product("Motor de alto ciclo", 1, 0, "Automacao", {
          model: "A definir por peso e frequencia de uso",
        }),
        product("Fotocelula", 1, 0, "Seguranca"),
        product("Sinalizador luminoso", 1, 0, "Sinalizacao", { required: false }),
        product("Mao de obra - instalacao do motor", 1, 6000, "Mao de obra", {
          system: "Servico tecnico",
        }),
      ]),
      alta: createProducts("motor-alta", [
        product("Motor industrial", 1, 0, "Automacao", {
          model: "A definir por peso, dimensao e trafego",
        }),
        product("Painel de comando", 1, 0, "Controle"),
        product("Barreiras de seguranca", 1, 0, "Seguranca"),
        product("Mao de obra - instalacao do motor", 1, 8500, "Mao de obra", {
          system: "Servico tecnico",
        }),
      ]),
    },
  },
  {
    serviceSlug: "tecnologia-inteligente",
    productsByStructure: {
      basica: internetKitProducts,
      media: internetKitProducts,
      alta: internetKitProducts,
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
