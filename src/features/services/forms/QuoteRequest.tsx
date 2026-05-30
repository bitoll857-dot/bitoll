import { $, component$, useSignal } from "@builder.io/qwik";

import SelectField from "../fields/Select";
import Button from "../button/Button";
import ActionToast from "~/components/ui/toast";
import {
  getCachedAuthUser,
  getSupabaseBrowserClient,
} from "~/lib/supabase/client";
import type { ServiceProduct } from "~/types/service-products";

type QuoteRequestFormProps = {
  initialData: {
    service?: string;
    serviceTitle?: string;
    originLabel?: string;
    source?: string;
    structureType?: string;
    products?: ServiceProduct[];
    discountAmount?: number;
    currency?: string;
  };
};

type QuoteArticle = ServiceProduct & {
  clientQuantityEditable?: boolean;
  locked?: boolean;
};

const serviceOptions = [
  { label: "CCTV e monitoramento", value: "cctv" },
  { label: "CCTV e monitoramento", value: "cctv-monitoramento" },
  { label: "Vedacao eletrica", value: "vedacao-eletrica" },
  { label: "Motor de portao", value: "motor-portao" },
  { label: "Motores de portoes", value: "motores-de-portoes" },
  { label: "Tecnologia inteligente", value: "tecnologia-inteligente" },
  { label: "Outro servico", value: "outro" },
];

const customerTypeOptions = [
  { label: "Particular", value: "particular" },
  { label: "Empresa", value: "empresa" },
  { label: "Condominio", value: "condominio" },
  { label: "Industria", value: "industria" },
];

const contactOptions = [
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Chamada telefonica", value: "telefone" },
  { label: "Email", value: "email" },
];

const fenceLineOptions = [
  { label: "6 linhas", value: "6" },
  { label: "8 linhas", value: "8" },
];

const entranceOptions = [
  { label: "Porta", value: "porta" },
  { label: "Portao", value: "portao" },
  { label: "Porta e portao", value: "porta-portao" },
];

const doorTypeOptions = [
  { label: "Deslizante", value: "deslizante" },
  { label: "Batente", value: "batente" },
];

const gateTypeOptions = [
  { label: "Deslizante", value: "deslizante" },
  { label: "Batente", value: "batente" },
  { label: "Articulado", value: "articulado" },
  { label: "Basculante", value: "basculante" },
];

const establishmentOptions = [
  { label: "Casa", value: "casa" },
  { label: "Empresa", value: "empresa" },
  { label: "Loja", value: "loja" },
  { label: "Escritorio", value: "escritorio" },
  { label: "Condominio", value: "condominio" },
];

const cctvFixationOptions = [
  { label: "Casa", value: "casa" },
  { label: "Muro", value: "muro" },
  { label: "Casa e muro", value: "casa-muro" },
];

const smartProjectTypeOptions = [
  { label: "Automacao residencial", value: "automacao-residencial" },
  { label: "Controlo de acesso", value: "controlo-acesso" },
  { label: "Rede e conectividade", value: "rede-conectividade" },
  { label: "Sensores e monitoramento", value: "sensores-monitoramento" },
  { label: "Projeto integrado", value: "integrado" },
];

const IVA_RATE = 0.12;

const formatMoney = (value: number, currency = "MZN") =>
  `${value.toLocaleString("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;

const formatDisplayDate = (date: Date) =>
  date.toLocaleDateString("pt-MZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

type ProformaPdfRow = {
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
};

type ProformaPdfData = {
  number: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  rows: ProformaPdfRow[];
  subtotal: string;
  iva: string;
  discount: string;
  total: string;
};

const pdfText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const truncatePdfText = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;

const drawPdfText = (x: number, y: number, size: number, text: string) =>
  `BT /F1 ${size} Tf ${x} ${y} Td (${pdfText(text)}) Tj ET`;

const createProformaPdfBlob = (data: ProformaPdfData) => {
  const rowsPerPage = 24;
  const pages = Math.max(1, Math.ceil(data.rows.length / rowsPerPage));
  const objects: string[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");

  const pageObjectIds = Array.from({ length: pages }, (_, index) => 4 + index * 2);
  objects.push(
    `<< /Type /Pages /Kids [${pageObjectIds
      .map((id) => `${id} 0 R`)
      .join(" ")}] /Count ${pages} >>`,
  );
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  for (let page = 0; page < pages; page += 1) {
    const pageObjectId = 4 + page * 2;
    const contentObjectId = pageObjectId + 1;
    const pageRows = data.rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    const commands: string[] = [
      "0.8 w",
      "40 785 515 0 l S",
      drawPdfText(40, 805, 18, "Factura Pro-forma"),
      drawPdfText(40, 782, 11, `No ${data.number}`),
      drawPdfText(40, 760, 9, "Cidade de Tete | Cidade de Chimoio"),
      drawPdfText(40, 746, 9, "E-mail: bitoll857@gmail.com | Cell: 86 613 6316 | NUIT: 151102115"),
      drawPdfText(360, 805, 9, "Facturacao a:"),
      drawPdfText(360, 790, 9, data.customerName),
      drawPdfText(360, 776, 9, `Morada: ${data.customerAddress}`),
      drawPdfText(360, 762, 9, `Cell: ${data.customerPhone}`),
      drawPdfText(360, 748, 9, `Emissao: ${data.issueDate}`),
      drawPdfText(360, 734, 9, `Vencimento: ${data.dueDate}`),
      "40 710 515 0 l S",
      drawPdfText(40, 694, 9, "Descricao"),
      drawPdfText(352, 694, 9, "Qtd."),
      drawPdfText(415, 694, 9, "Preco Uni."),
      drawPdfText(505, 694, 9, "Total"),
      "40 684 515 0 l S",
    ];

    pageRows.forEach((row, index) => {
      const y = 664 - index * 22;
      commands.push(
        drawPdfText(40, y, 8, truncatePdfText(row.description, 58)),
        drawPdfText(360, y, 8, row.quantity),
        drawPdfText(415, y, 8, row.unitPrice),
        drawPdfText(505, y, 8, row.total),
      );
    });

    if (page === pages - 1) {
      commands.push(
        "360 110 195 0 l S",
        drawPdfText(365, 92, 9, "Subtotal"),
        drawPdfText(480, 92, 9, data.subtotal),
        drawPdfText(365, 76, 9, "IVA 12%"),
        drawPdfText(480, 76, 9, data.iva),
        drawPdfText(365, 60, 9, "Desconto"),
        drawPdfText(480, 60, 9, `-${data.discount}`),
        "360 48 195 0 l S",
        drawPdfText(365, 30, 11, "Total"),
        drawPdfText(470, 30, 11, data.total),
      );
    } else {
      commands.push(drawPdfText(470, 30, 8, `Pagina ${page + 1}/${pages}`));
    }

    const stream = commands.join("\n");
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
  }

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

const getArticleTotal = (article: QuoteArticle) =>
  (article.estimatedQuantity ?? 0) * (article.unitPrice ?? 0);

const getLaborArticle = (service?: string): QuoteArticle => {
  const normalizedService = service ?? "outro";
  const isCctv =
    normalizedService === "cctv" || normalizedService === "cctv-monitoramento";
  const isGateMotor =
    normalizedService === "motor-portao" ||
    normalizedService === "motores-de-portoes";
  const isSmartTech = normalizedService === "tecnologia-inteligente";

  return {
    id: "labor-installation",
    name: isCctv
      ? "Instalacao, configuracao e teste"
      : isGateMotor
        ? "Mao de obra - instalacao do motor"
        : isSmartTech
          ? "Mao de obra - configuracao e testes"
          : "Mao de obra - instalacao, configuracao e testes",
    quantity: isCctv ? "Conforme cameras" : "1 servico",
    estimatedQuantity: 1,
    unitPrice: isCctv ? 1000 : isSmartTech ? 300 : isGateMotor ? 3500 : 12000,
    brand: "Bitoll",
    model: "Servico tecnico",
    system: "Servico",
    category: "Mao de obra",
    description: "Execucao tecnica, configuracao, testes e entrega operacional.",
    detail:
      "Valor base ajustavel conforme dimensao, complexidade, deslocacao e validacao final da obra.",
    required: true,
    locked: true,
  };
};

const extraArticleCatalog: QuoteArticle[] = [
  {
    id: "extra-rj45",
    name: "Conector Ethernet RJ45",
    quantity: "10 unidades",
    estimatedQuantity: 10,
    unitPrice: 50,
    brand: "Genérico",
    model: "RJ45 Cat6",
    system: "Rede",
    category: "Conectividade",
    description: "Conectores para terminação de cabos de rede.",
    detail: "Usado em ligações de cameras IP, NVR, roteadores e switches.",
    required: false,
  },
  {
    id: "extra-calha",
    name: "Calha plastica 25x16mm",
    quantity: "10 unidades",
    estimatedQuantity: 10,
    unitPrice: 190,
    brand: "Bitoll",
    model: "25x16mm",
    system: "Infraestrutura",
    category: "Acabamento",
    description: "Protege e organiza cabos aparentes.",
    detail: "Recomendado quando a obra precisa de melhor acabamento visual.",
    required: false,
  },
  {
    id: "extra-cabo-utp",
    name: "Cabo UTP Cat6",
    quantity: "100 metros",
    estimatedQuantity: 100,
    unitPrice: 30,
    brand: "Linkbasic",
    model: "Cat6 U/UTP",
    system: "Rede",
    category: "Cabo",
    description: "Cabo de rede para cameras, internet e automacao.",
    detail: "A quantidade final depende da medição real da obra.",
    required: false,
  },
  {
    id: "extra-bateria",
    name: "Bateria 12V 7Ah",
    quantity: "1 unidade",
    estimatedQuantity: 1,
    unitPrice: 4200,
    brand: "Moura",
    model: "12V 7Ah",
    system: "Energia",
    category: "Backup",
    description: "Backup de energia para centrais e pequenos sistemas.",
    detail: "Ajuda a manter o sistema ativo em falha eletrica.",
    required: false,
  },
];

export default component$<QuoteRequestFormProps>(
  ({ initialData }) => {
    const currentUser = getCachedAuthUser();
    const toastOpen = useSignal(false);
    const toastTitle = useSignal("");
    const toastMessage = useSignal("");
    const articleSearchModal = useSignal(false);
    const articleSearch = useSignal("");
    const hasWorkImages = useSignal(false);
    const proformaPreview = useSignal(false);
    const selectedService = useSignal(initialData.service ?? "outro");
    const defaultPerimeter =
      initialData.structureType === "alta"
        ? 200
        : initialData.structureType === "media"
          ? 120
          : 80;
    const wallWidthMeters = useSignal(Math.round(defaultPerimeter / 4));
    const wallLengthMeters = useSignal(Math.round(defaultPerimeter / 4));
    const wallHeightMeters = useSignal(2);
    const fenceLines = useSignal(6);
    const cornerCount = useSignal(4);
    const levelChangeCount = useSignal(0);
    const entranceCount = useSignal(1);
    const entranceType = useSignal("portao");
    const doorType = useSignal("batente");
    const gateType = useSignal("deslizante");
    const establishmentType = useSignal("casa");
    const cctvFixation = useSignal("casa");
    const houseWidthMeters = useSignal(12);
    const houseLengthMeters = useSignal(15);
    const houseCornerCount = useSignal(4);
    const cctvWallLengthMeters = useSignal(40);
    const houseWallDistanceMeters = useSignal(8);
    const gateLengthMeters = useSignal(4);
    const gateHeightMeters = useSignal(2);
    const dailyOpenings = useSignal(20);
    const smartProjectType = useSignal("integrado");
    const smartEnvironmentCount = useSignal(4);
    const smartEntryCount = useSignal(2);
    const smartDeviceCount = useSignal(8);
    const smartCoverageMeters = useSignal(120);
    const smartNeedsBackup = useSignal(true);
    const initialArticles = (initialData.products ?? []).map((product) => ({
      ...product,
      locked: true,
    }));
    const hasLaborArticle = initialArticles.some((article) => {
      const text = `${article.name} ${article.category}`.toLowerCase();

      return (
        text.includes("mao de obra") ||
        text.includes("mão de obra") ||
        text.includes("instalacao") ||
        text.includes("instalação")
      );
    });
    const articles = useSignal<QuoteArticle[]>([
      ...initialArticles,
      ...(hasLaborArticle ? [] : [getLaborArticle(initialData.service)]),
    ]);

    const addArticle = $((article: QuoteArticle) => {
      articles.value = [
        ...articles.value,
        {
          ...article,
          id: `${article.id}-${Date.now()}`,
          locked: false,
        },
      ];

      articleSearchModal.value = false;
      articleSearch.value = "";
      toastTitle.value = "Artigo adicionado";
      toastMessage.value = `${article.name} foi adicionado a cotacao.`;
      toastOpen.value = true;
    });

    const updateArticleQuantity = $((articleId: string, quantity: number) => {
      const safeQuantity = Math.max(1, Math.floor(quantity || 1));

      const sourceArticle = articles.value.find((article) => article.id === articleId);
      const rules = sourceArticle?.dependencyRules ?? [];

      articles.value = articles.value.map((article) => {
        if (article.id === articleId) {
          return {
            ...article,
            estimatedQuantity: safeQuantity,
            quantity: `${safeQuantity} unidade(s)`,
          };
        }

        const rule = rules.find((item) => item.targetProductId === article.id);

        if (!rule) {
          return article;
        }

        const rawQuantity = (rule.formulaSteps ?? []).reduce(
          (current, step) => {
            const value = Number(step.value || 0);

            if (step.operator === "add") {
              return current + value;
            }

            if (step.operator === "subtract") {
              return current - value;
            }

            if (step.operator === "divide") {
              return value === 0 ? current : current / value;
            }

            return current * value;
          },
          safeQuantity,
        );
        const rounded =
          rule.rounding === "floor"
            ? Math.floor(rawQuantity)
            : rule.rounding === "round"
              ? Math.round(rawQuantity)
              : Math.ceil(rawQuantity);
        const nextQuantity = Math.max(rule.minQuantity, rounded);

        return {
          ...article,
          estimatedQuantity: nextQuantity,
          quantity: `${nextQuantity} unidade(s)`,
        };
      });
    });

    const showToast = $((title: string, message: string) => {
      toastTitle.value = title;
      toastMessage.value = message;
      toastOpen.value = true;
    });

    const saveQuoteToSupabase = $(async () => {
      const supabase = getSupabaseBrowserClient();
      const authUser = getCachedAuthUser();

      if (!supabase || !authUser) {
        return false;
      }

      const quoteNumber = `BTL-${proformaNumber}-${Date.now()}`;
      const laborTotal = articles.value
        .filter((article) => article.id.includes("labor"))
        .reduce((sum, article) => sum + getArticleTotal(article), 0);
      const { data, error } = await supabase
        .from("quotes")
        .insert({
          profile_id: String(authUser.id),
          quote_number: quoteNumber,
          service_slug: selectedService.value,
          customer_snapshot: {
            name: authUser.name,
            email: authUser.email,
            phone: authUser.phone,
            city: authUser.city,
            customerType: authUser.customerType,
          },
          request_payload: {
            source: initialData.source,
            originLabel: initialData.originLabel,
            structureType: initialData.structureType,
            selectedService: selectedService.value,
          },
          subtotal,
          discount,
          tax: iva,
          labor_total: laborTotal,
          total,
          currency,
          status: "enviado",
        })
        .select("id")
        .single();

      if (error || !data) {
        return false;
      }

      const { error: itemsError } = await supabase.from("quote_items").insert(
        articles.value.map((article) => ({
          quote_id: data.id,
          name: article.name,
          unit: article.quantity,
          quantity: article.estimatedQuantity ?? 1,
          unit_price: article.unitPrice ?? 0,
          locked: article.locked ?? false,
        })),
      );

      if (itemsError) {
        return false;
      }

      return true;
    });

    const downloadProformaPdf = $(() => {
      const pdfCurrency = initialData.currency ?? "MZN";
      const pdfSubtotal = articles.value.reduce(
        (sum, article) => sum + getArticleTotal(article),
        0,
      );
      const pdfDiscount = initialData.discountAmount ?? 0;
      const pdfTaxable = Math.max(pdfSubtotal - pdfDiscount, 0);
      const pdfIva = pdfTaxable * IVA_RATE;
      const pdfTotal = pdfTaxable + pdfIva;
      const pdfToday = new Date();
      const pdfDueDate = new Date(pdfToday);
      pdfDueDate.setDate(pdfToday.getDate() + 30);
      const pdfProformaNumber = `${String(pdfToday.getMonth() + 1).padStart(
        2,
        "0",
      )}${String(pdfToday.getDate()).padStart(2, "0")}/${pdfToday.getFullYear()}`;

      const pdfBlob = createProformaPdfBlob({
        number: pdfProformaNumber,
        issueDate: formatDisplayDate(pdfToday),
        dueDate: formatDisplayDate(pdfDueDate),
        customerName: currentUser?.name ?? "Cliente generico",
        customerAddress: currentUser?.city ?? "A confirmar",
        customerPhone: currentUser?.phone ?? "A confirmar",
        rows: articles.value.map((article) => ({
          description: `${article.name} - ${article.brand ?? "Bitoll"} / ${
            article.model ?? "Padrao"
          }`,
          quantity: String(article.estimatedQuantity ?? 0),
          unitPrice: article.unitPrice
            ? formatMoney(article.unitPrice, pdfCurrency)
            : "A avaliar",
          total: article.unitPrice
            ? formatMoney(getArticleTotal(article), pdfCurrency)
            : "A avaliar",
        })),
        subtotal: formatMoney(pdfSubtotal, pdfCurrency),
        iva: formatMoney(pdfIva, pdfCurrency),
        discount: formatMoney(pdfDiscount, pdfCurrency),
        total: formatMoney(pdfTotal, pdfCurrency),
      });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bitoll-proforma-${pdfProformaNumber.replace("/", "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      showToast(
        "PDF criado",
        "A factura pro-forma foi criada em PDF real, sem captura de imagem.",
      );
    });

    const applyFenceEstimate = $(() => {
      const width = Math.max(0, wallWidthMeters.value);
      const length = Math.max(0, wallLengthMeters.value);
      const height = Math.max(0, wallHeightMeters.value);
      const perimeter = Math.ceil((width + length) * 2);
      const lines = Math.max(1, fenceLines.value);
      const entranceMultiplier =
        entranceType.value === "porta-portao"
          ? 3
          : entranceType.value === "porta"
            ? 1
            : gateType.value === "basculante" || gateType.value === "articulado"
              ? 3
              : 2;
      const postSpacing = height >= 2.5 ? 2 : 2.5;
      const posts =
        Math.ceil(perimeter / postSpacing) +
        cornerCount.value +
        levelChangeCount.value * 2 +
        entranceCount.value * entranceMultiplier;
      const wireMeters = Math.ceil(
        (perimeter + levelChangeCount.value * 2) * lines * 1.1,
      );
      const isolators = posts * lines;
      const htCableMeters = Math.ceil(
        perimeter * 0.18 +
          entranceCount.value *
            (entranceType.value === "porta-portao" ? 16 : 8) +
          levelChangeCount.value * 4,
      );
      const warningPlates = Math.max(1, Math.ceil(perimeter / 10));

      articles.value = articles.value.map((article) => {
        const text = `${article.name} ${article.category} ${article.model ?? ""}`.toLowerCase();

        if (text.includes("haste") || text.includes("poste")) {
          return {
            ...article,
            quantity: `${posts} unidades`,
            estimatedQuantity: posts,
          };
        }

        if (text.includes("isolador")) {
          return {
            ...article,
            quantity: `${isolators} unidades`,
            estimatedQuantity: isolators,
          };
        }

        if (text.includes("fio") || text.includes("arame")) {
          return {
            ...article,
            quantity: `${wireMeters} metros`,
            estimatedQuantity: Math.max(1, Math.ceil(wireMeters / 680)),
          };
        }

        if (text.includes("cabo ht")) {
          return {
            ...article,
            quantity: `${htCableMeters} metros`,
            estimatedQuantity: Math.max(1, Math.ceil(htCableMeters / 50)),
          };
        }

        if (text.includes("placa")) {
          return {
            ...article,
            quantity: `${warningPlates} unidades`,
            estimatedQuantity: warningPlates,
          };
        }

        if (text.includes("mao de obra") || text.includes("instalacao")) {
          const laborValue =
            perimeter >= 180 ? 18000 : perimeter >= 100 ? 12000 : 8000;

          return {
            ...article,
            quantity: "1 servico",
            estimatedQuantity: 1,
            unitPrice: laborValue,
          };
        }

        return article;
      });

      showToast(
        "Estimativa actualizada",
        `Perimetro calculado: ${perimeter}m com ${lines} linhas. Foram estimados ${posts} postes, ${isolators} isoladores, ${wireMeters}m de arame, ${htCableMeters}m de cabo HT e ${warningPlates} placas.`,
      );
    });

    const applyCctvEstimate = $(() => {
      const housePerimeter = Math.ceil(
        (Math.max(0, houseWidthMeters.value) +
          Math.max(0, houseLengthMeters.value)) *
          2,
      );
      const useHouse =
        establishmentType.value !== "casa" ||
        cctvFixation.value === "casa" ||
        cctvFixation.value === "casa-muro";
      const useWall =
        establishmentType.value !== "casa" ||
        cctvFixation.value === "muro" ||
        cctvFixation.value === "casa-muro";
      const houseCameras = useHouse
        ? Math.max(2, Math.ceil(Math.max(1, houseCornerCount.value) * 0.75))
        : 0;
      const wallCameras = useWall
        ? Math.max(1, Math.ceil(Math.max(0, cctvWallLengthMeters.value) / 18))
        : 0;
      const cameraCount =
        establishmentType.value === "casa"
          ? houseCameras + wallCameras
          : Math.max(4, Math.ceil(smartCoverageMeters.value / 35));
      const cableMeters = Math.ceil(
        (useHouse ? housePerimeter : 0) +
          (useWall ? cctvWallLengthMeters.value : 0) +
          Math.max(0, houseWallDistanceMeters.value) * Math.max(1, wallCameras) +
          cameraCount * 8,
      );
      const recorderChannels = cameraCount <= 4 ? 4 : cameraCount <= 8 ? 8 : 16;
      const storageTb = cameraCount <= 4 ? 1 : cameraCount <= 8 ? 2 : 4;

      articles.value = articles.value.map((article) => {
        const text = `${article.name} ${article.category} ${article.model ?? ""}`.toLowerCase();

        if (text.includes("camera") || text.includes("cameras")) {
          return {
            ...article,
            quantity: `${cameraCount} unidades`,
            estimatedQuantity: cameraCount,
          };
        }

        if (text.includes("dvr") || text.includes("nvr")) {
          return {
            ...article,
            quantity: `1 unidade ${recorderChannels} canais`,
            estimatedQuantity: 1,
          };
        }

        if (text.includes("disco") || text.includes("storage")) {
          return {
            ...article,
            quantity: `${storageTb}TB recomendados`,
            estimatedQuantity: Math.max(1, Math.ceil(storageTb / 2)),
          };
        }

        if (text.includes("switch")) {
          return {
            ...article,
            quantity: cameraCount > 4 ? "1 unidade PoE" : "Opcional",
            estimatedQuantity: cameraCount > 4 ? 1 : 0,
          };
        }

        if (text.includes("cabo")) {
          return {
            ...article,
            quantity: `${cableMeters} metros`,
            estimatedQuantity: cableMeters,
          };
        }

        if (text.includes("mao de obra") || text.includes("instalacao")) {
          return {
            ...article,
            quantity: `${cameraCount} ponto(s)`,
            estimatedQuantity: cameraCount,
            unitPrice: 1000,
          };
        }

        return article;
      });

      showToast(
        "Estimativa CCTV actualizada",
        `Foram sugeridas ${cameraCount} cameras, gravador de ${recorderChannels} canais, ${storageTb}TB de armazenamento e cerca de ${cableMeters}m de cabo.`,
      );
    });

    const applyGateMotorEstimate = $(() => {
      const length = Math.max(0, gateLengthMeters.value);
      const height = Math.max(0, gateHeightMeters.value);
      const openings = Math.max(0, dailyOpenings.value);
      const area = length * height;
      const motorProfile =
        area >= 12 || openings >= 80
          ? "industrial"
          : area >= 7 || openings >= 40
            ? "alto ciclo"
            : "residencial";
      const rackMeters = Math.max(1, Math.ceil(length + 1));
      const remoteCount = openings >= 40 ? 4 : 2;

      articles.value = articles.value.map((article) => {
        const text = `${article.name} ${article.category} ${article.model ?? ""}`.toLowerCase();

        if (text.includes("motor")) {
          return {
            ...article,
            quantity: `1 unidade ${motorProfile}`,
            estimatedQuantity: 1,
          };
        }

        if (text.includes("controlo") || text.includes("controle")) {
          return {
            ...article,
            quantity: `${remoteCount} unidades`,
            estimatedQuantity: remoteCount,
          };
        }

        if (
          text.includes("cremalheira") ||
          text.includes("braco") ||
          text.includes("braço")
        ) {
          return {
            ...article,
            quantity: `${rackMeters} metros ou kit equivalente`,
            estimatedQuantity: rackMeters,
          };
        }

        if (text.includes("fotocelula") || text.includes("barreira")) {
          return {
            ...article,
            quantity: area >= 7 ? "1 par" : "Opcional",
            estimatedQuantity: area >= 7 ? 1 : 0,
          };
        }

        if (text.includes("mao de obra") || text.includes("instalacao")) {
          const laborValue =
            motorProfile === "industrial"
              ? 8500
              : motorProfile === "alto ciclo"
                ? 6000
                : 3500;

          return {
            ...article,
            quantity: "1 servico",
            estimatedQuantity: 1,
            unitPrice: laborValue,
          };
        }

        return article;
      });

      showToast(
        "Estimativa do motor actualizada",
        `Portao com ${area.toFixed(1)}m2 e ${openings} aberturas/dia: perfil ${motorProfile}, ${rackMeters}m de cremalheira/braco e ${remoteCount} controles.`,
      );
    });

    const applySmartTechEstimate = $(() => {
      const environments = Math.max(1, smartEnvironmentCount.value);
      const entries = Math.max(0, smartEntryCount.value);
      const devices = Math.max(1, smartDeviceCount.value);
      const coverage = Math.max(0, smartCoverageMeters.value);
      const sensors =
        smartProjectType.value === "controlo-acesso"
          ? entries
          : Math.max(environments, Math.ceil(devices * 0.6));
      const networkPoints = Math.max(1, Math.ceil(coverage / 90));
      const configHours = Math.max(3, Math.ceil(devices * 0.5 + environments));

      articles.value = articles.value.map((article) => {
        const text = `${article.name} ${article.category} ${article.model ?? ""}`.toLowerCase();

        if (
          text.includes("roteador") ||
          text.includes("access point") ||
          text.includes("wi-fi") ||
          text.includes("wifi")
        ) {
          return {
            ...article,
            quantity: `${networkPoints} ponto(s) de cobertura`,
            estimatedQuantity: networkPoints,
          };
        }

        if (text.includes("hub")) {
          return {
            ...article,
            quantity: devices > 12 ? "2 unidades" : "1 unidade",
            estimatedQuantity: devices > 12 ? 2 : 1,
          };
        }

        if (text.includes("sensor")) {
          return {
            ...article,
            quantity: `${sensors} unidades`,
            estimatedQuantity: sensors,
          };
        }

        if (text.includes("acesso")) {
          return {
            ...article,
            quantity: `${Math.max(1, entries)} ponto(s) de entrada`,
            estimatedQuantity: Math.max(1, entries),
          };
        }

        if (text.includes("configuracao") || text.includes("configuração")) {
          return {
            ...article,
            quantity: `${configHours} horas tecnicas`,
            estimatedQuantity: configHours,
          };
        }

        if (text.includes("ups") || text.includes("nobreak")) {
          return {
            ...article,
            quantity: smartNeedsBackup.value ? "1 unidade" : "Opcional",
            estimatedQuantity: smartNeedsBackup.value ? 1 : 0,
          };
        }

        return article;
      });

      showToast(
        "Estimativa inteligente actualizada",
        `Foram considerados ${environments} ambientes, ${entries} entradas, ${devices} dispositivos, ${networkPoints} ponto(s) de rede e ${sensors} sensores/acessos.`,
      );
    });

    const articleCatalog = [
      ...(initialData.products ?? []),
      ...extraArticleCatalog,
    ];
    const filteredArticles = articleCatalog.filter((article) => {
      const term = articleSearch.value.trim().toLowerCase();

      if (!term) {
        return true;
      }

      return [
        article.name,
        article.brand,
        article.model,
        article.system,
        article.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });

    const subtotal = articles.value.reduce(
      (total, article) => total + getArticleTotal(article),
      0,
    );
    const discount = initialData.discountAmount ?? 0;
    const taxable = Math.max(subtotal - discount, 0);
    const iva = taxable * IVA_RATE;
    const total = taxable + iva;
    const currency = initialData.currency ?? "MZN";
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 30);
    const proformaNumber = `${String(today.getMonth() + 1).padStart(2, "0")}${String(
      today.getDate(),
    ).padStart(2, "0")}/${today.getFullYear()}`;
    const isFenceService = selectedService.value === "vedacao-eletrica";
    const isCctvService =
      selectedService.value === "cctv" ||
      selectedService.value === "cctv-monitoramento";
    const isGateMotorService =
      selectedService.value === "motor-portao" ||
      selectedService.value === "motores-de-portoes";
    const isSmartTechService =
      selectedService.value === "tecnologia-inteligente";
    const estimatedPerimeter = Math.ceil(
      (Math.max(0, wallWidthMeters.value) + Math.max(0, wallLengthMeters.value)) *
        2,
    );
    const showCctvHouseFields =
      establishmentType.value === "casa" &&
      (cctvFixation.value === "casa" || cctvFixation.value === "casa-muro");
    const showCctvWallFields =
      establishmentType.value === "casa" &&
      (cctvFixation.value === "muro" || cctvFixation.value === "casa-muro");

    return (
      <form
        preventdefault:submit
        class="mt-7 space-y-5"
        onSubmit$={async () => {
          proformaPreview.value = true;
          const saved = await saveQuoteToSupabase();

          showToast(
            saved ? "Pedido enviado" : "Proforma preparada",
            saved
              ? "A cotacao foi guardada no Supabase e ficou ligada a sua conta."
              : "A factura pro-forma foi gerada localmente. Nao foi possivel guardar no Supabase agora.",
          );
        }}
      >
        <div class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          Necessidades vindas de:{" "}
          <span class="font-bold">
            {initialData.originLabel ??
              (initialData.source === "promotion"
                ? "promocao do servico"
                : "servico selecionado")}
          </span>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <label for="quote-name" class="block">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Nome
            </span>
            <input
              id="quote-name"
              name="name"
              value={currentUser?.name ?? ""}
              readOnly={!!currentUser}
              required
              class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 read-only:text-slate-300 focus:border-cyan-400/50 focus:bg-slate-900"
            />
          </label>

          <label for="quote-phone" class="block">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Telefone / WhatsApp
            </span>
            <input
              id="quote-phone"
              name="phone"
              type="tel"
              value={currentUser?.phone ?? ""}
              readOnly={!!currentUser}
              required
              class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 read-only:text-slate-300 focus:border-cyan-400/50 focus:bg-slate-900"
            />
          </label>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <label for="quote-email" class="block">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Email Google
            </span>
            <input
              id="quote-email"
              name="email"
              type="email"
              value={currentUser?.email ?? ""}
              readOnly={!!currentUser}
              class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 read-only:text-slate-300 focus:border-cyan-400/50 focus:bg-slate-900"
            />
          </label>

          <label for="quote-location" class="block">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Localizacao
            </span>
            <input
              id="quote-location"
              name="location"
              value={currentUser?.city ?? ""}
              readOnly={!!currentUser}
              required
              class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 read-only:text-slate-300 focus:border-cyan-400/50 focus:bg-slate-900"
            />
          </label>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <label for="quote-service" class="block">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Servico
            </span>
            <select
              id="quote-service"
              name="service"
              value={selectedService.value}
              required
              class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 focus:border-cyan-400/50 focus:bg-slate-900"
              onChange$={(event) => {
                selectedService.value = (event.target as HTMLSelectElement).value;
              }}
            >
              {serviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <SelectField
            id="quote-customer-type"
            label="Tipo de cliente"
            name="customerType"
            value={currentUser?.customerType.toLowerCase() ?? undefined}
            options={customerTypeOptions}
            required
          />
        </div>

        <SelectField
          id="quote-contact-method"
          label="Contacto preferido"
          name="contactMethod"
          value={currentUser?.preferredContactMethod.toLowerCase() ?? undefined}
          options={contactOptions}
          required
        />

        {initialData.structureType && (
          <div class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
            Estrutura selecionada:{" "}
            <span class="font-bold capitalize">{initialData.structureType}</span>
          </div>
        )}

        <div class="rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Imagens da obra
          </p>
          <p class="mt-1 text-sm leading-6 text-slate-400">
            Envie fotos do muro, portao, entradas, sala tecnica ou local onde o
            servico sera prestado. A simulacao ajuda a estimar materiais.
          </p>

          <input
            type="file"
            name="workImages"
            accept="image/*"
            multiple
            class="mt-4 w-full rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-4 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-950"
            onChange$={() => {
              hasWorkImages.value = true;
            }}
          />

          {hasWorkImages.value && (
            <div class="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm leading-6 text-cyan-100">
              Match visual simulado activo.{" "}
              {isFenceService
                ? `Para cerca electrica, o sistema estima cerca de ${estimatedPerimeter}m de perimetro, ${Math.ceil(
                    estimatedPerimeter / 2.5,
                  )} postes, ${estimatedPerimeter * 6}m de arame e ${Math.ceil(
                    estimatedPerimeter / 20,
                  )} pontos de cabo/ligacao.`
                : isCctvService
                  ? "Para CCTV, as imagens ajudam a confirmar angulos, zonas cegas, altura de fixacao e passagem de cabos."
                  : isGateMotorService
                    ? "Para motor de portao, as imagens ajudam a validar o tipo de folha, trilho, peso estimado e pontos de seguranca."
                    : isSmartTechService
                      ? "Para tecnologias inteligentes, as imagens ajudam a identificar ambientes, entradas, pontos de rede e energia."
                : "A equipa pode usar as imagens para ajustar quantidades, pontos de instalacao e materiais extras."}
            </div>
          )}

          {isFenceService && (
            <div class="mt-5 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Medidas para calculo semi-automatico
              </p>
              <div class="mt-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                Perimetro calculado:{" "}
                <span class="font-bold">{estimatedPerimeter}m</span>
              </div>

              <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Largura do muro (m)
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={wallWidthMeters.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      wallWidthMeters.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Comprimento do muro (m)
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={wallLengthMeters.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      wallLengthMeters.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Altura do muro (m)
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={wallHeightMeters.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      wallHeightMeters.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Desniveis
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={levelChangeCount.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      levelChangeCount.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Cantos
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={cornerCount.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      cornerCount.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Linhas da cerca
                  </span>
                  <select
                    value={String(fenceLines.value)}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onChange$={(event) => {
                      fenceLines.value = Number(
                        (event.target as HTMLSelectElement).value,
                      );
                    }}
                  >
                    {fenceLineOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Tipo de entrada
                  </span>
                  <select
                    value={entranceType.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onChange$={(event) => {
                      entranceType.value = (event.target as HTMLSelectElement).value;
                    }}
                  >
                    {entranceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Entradas
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={entranceCount.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      entranceCount.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                {(entranceType.value === "porta" ||
                  entranceType.value === "porta-portao") && (
                  <label class="block">
                    <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Porta
                    </span>
                    <select
                      value={doorType.value}
                      class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                      onChange$={(event) => {
                        doorType.value = (event.target as HTMLSelectElement).value;
                      }}
                    >
                      {doorTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {(entranceType.value === "portao" ||
                  entranceType.value === "porta-portao") && (
                  <label class="block">
                    <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Portao
                    </span>
                    <select
                      value={gateType.value}
                      class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                      onChange$={(event) => {
                        gateType.value = (event.target as HTMLSelectElement).value;
                      }}
                    >
                      {gateTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <Button
                spacing="none"
                buttonClass="mt-4 rounded-2xl px-4 py-3 text-sm font-bold"
                onClick$={applyFenceEstimate}
              >
                Aplicar estimativa
              </Button>
            </div>
          )}

          {isCctvService && (
            <div class="mt-5 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Parametros dinamicos para CCTV
              </p>

              <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Estabelecimento
                  </span>
                  <select
                    value={establishmentType.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onChange$={(event) => {
                      establishmentType.value = (event.target as HTMLSelectElement).value;
                    }}
                  >
                    {establishmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                {establishmentType.value === "casa" && (
                  <label class="block">
                    <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Fixacao das cameras
                    </span>
                    <select
                      value={cctvFixation.value}
                      class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                      onChange$={(event) => {
                        cctvFixation.value = (event.target as HTMLSelectElement).value;
                      }}
                    >
                      {cctvFixationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {showCctvHouseFields && (
                  <>
                    <label class="block">
                      <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Largura da casa (m)
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={houseWidthMeters.value}
                        class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                        onInput$={(event) => {
                          houseWidthMeters.value = Number(
                            (event.target as HTMLInputElement).value,
                          );
                        }}
                      />
                    </label>

                    <label class="block">
                      <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Comprimento da casa (m)
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={houseLengthMeters.value}
                        class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                        onInput$={(event) => {
                          houseLengthMeters.value = Number(
                            (event.target as HTMLInputElement).value,
                          );
                        }}
                      />
                    </label>

                    <label class="block">
                      <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Cantos da casa
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={houseCornerCount.value}
                        class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                        onInput$={(event) => {
                          houseCornerCount.value = Number(
                            (event.target as HTMLInputElement).value,
                          );
                        }}
                      />
                    </label>
                  </>
                )}

                {showCctvWallFields && (
                  <>
                    <label class="block">
                      <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Comprimento do muro (m)
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={cctvWallLengthMeters.value}
                        class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                        onInput$={(event) => {
                          cctvWallLengthMeters.value = Number(
                            (event.target as HTMLInputElement).value,
                          );
                        }}
                      />
                    </label>

                    <label class="block">
                      <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Distancia casa-muro (m)
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={houseWallDistanceMeters.value}
                        class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                        onInput$={(event) => {
                          houseWallDistanceMeters.value = Number(
                            (event.target as HTMLInputElement).value,
                          );
                        }}
                      />
                    </label>
                  </>
                )}
              </div>

              <Button
                spacing="none"
                buttonClass="mt-4 rounded-2xl px-4 py-3 text-sm font-bold"
                onClick$={applyCctvEstimate}
              >
                Aplicar estimativa
              </Button>
            </div>
          )}

          {isGateMotorService && (
            <div class="mt-5 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Parametros para motor de portao
              </p>

              <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Comprimento do portao (m)
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={gateLengthMeters.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      gateLengthMeters.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Altura do portao (m)
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={gateHeightMeters.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      gateHeightMeters.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Aberturas por dia
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={dailyOpenings.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      dailyOpenings.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>
              </div>

              <Button
                spacing="none"
                buttonClass="mt-4 rounded-2xl px-4 py-3 text-sm font-bold"
                onClick$={applyGateMotorEstimate}
              >
                Aplicar estimativa
              </Button>
            </div>
          )}

          {isSmartTechService && (
            <div class="mt-5 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Parametros para tecnologias inteligentes
              </p>

              <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Tipo de projeto
                  </span>
                  <select
                    value={smartProjectType.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onChange$={(event) => {
                      smartProjectType.value = (event.target as HTMLSelectElement).value;
                    }}
                  >
                    {smartProjectTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Ambientes
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={smartEnvironmentCount.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      smartEnvironmentCount.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Entradas controladas
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={smartEntryCount.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      smartEntryCount.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Dispositivos previstos
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={smartDeviceCount.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      smartDeviceCount.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Area de cobertura (m2)
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={smartCoverageMeters.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      smartCoverageMeters.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="flex min-h-12 items-center gap-3 pt-6 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={smartNeedsBackup.value}
                    class="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400"
                    onChange$={(event) => {
                      smartNeedsBackup.value = (
                        event.target as HTMLInputElement
                      ).checked;
                    }}
                  />
                  Precisa de backup de energia
                </label>
              </div>

              <Button
                spacing="none"
                buttonClass="mt-4 rounded-2xl px-4 py-3 text-sm font-bold"
                onClick$={applySmartTechEstimate}
              >
                Aplicar estimativa
              </Button>
            </div>
          )}
        </div>

        <div class="rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Artigos da cotacao
              </p>
              <p class="mt-1 text-sm text-slate-400">
                Os artigos definidos pela Bitoll nao podem ser removidos. Podes
                acrescentar artigos extras.
              </p>
            </div>
          </div>

          <div class="mt-4 overflow-x-auto">
            <table class="w-full min-w-[860px] text-left">
              <thead class="border-b border-slate-800 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th class="py-3 pr-4">Artigo</th>
                  <th class="py-3 pr-4">Marca / Modelo</th>
                  <th class="py-3 pr-4">Sistema</th>
                  <th class="py-3 pr-4">Quantidade</th>
                  <th class="py-3 pr-4">Unitario</th>
                  <th class="py-3 pr-4">Subtotal</th>
                  <th class="py-3 pr-4">Origem</th>
                  <th class="py-3">Acao</th>
                </tr>
              </thead>
              <tbody>
                {articles.value.map((article) => (
                  <tr key={article.id} class="border-b border-slate-800 last:border-b-0">
                    <td class="py-3 pr-4">
                      <p class="text-sm font-semibold text-white">
                        {article.name}
                      </p>
                      <p class="mt-1 text-xs text-slate-500">
                        {article.category}
                      </p>
                    </td>
                    <td class="py-3 pr-4 text-sm text-slate-300">
                      {article.brand ?? "Bitoll"} / {article.model ?? "Padrao"}
                    </td>
                    <td class="py-3 pr-4 text-sm text-slate-300">
                      {article.system ?? article.category}
                    </td>
                    <td class="py-3 pr-4 text-sm text-cyan-200">
                      {article.clientQuantityEditable ? (
                        <input
                          min={1}
                          step={1}
                          type="number"
                          value={article.estimatedQuantity ?? 1}
                          class="h-10 w-24 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none"
                          onInput$={(event) => {
                            updateArticleQuantity(
                              article.id,
                              Number((event.target as HTMLInputElement).value || 1),
                            );
                          }}
                        />
                      ) : (
                        article.quantity
                      )}
                    </td>
                    <td class="py-3 pr-4 text-sm text-slate-300">
                      {article.unitPrice
                        ? formatMoney(article.unitPrice, currency)
                        : "A avaliar"}
                    </td>
                    <td class="py-3 pr-4 text-sm font-semibold text-white">
                      {article.unitPrice
                        ? formatMoney(getArticleTotal(article), currency)
                        : "A avaliar"}
                    </td>
                    <td class="py-3 pr-4">
                      <span class="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                        {article.locked ? "Recomendado" : "Cliente"}
                      </span>
                    </td>
                    <td class="py-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        spacing="none"
                        buttonClass="rounded-xl px-3 py-2 text-xs"
                        onClick$={() => {
                          if (article.locked) {
                            showToast(
                              "Artigo bloqueado",
                              "Este artigo faz parte da solucao recomendada e nao pode ser removido nesta cotacao.",
                            );
                            return;
                          }

                          articles.value = articles.value.filter(
                            (item) => item.id !== article.id,
                          );
                          showToast(
                            "Artigo removido",
                            `${article.name} foi eliminado da cotacao.`,
                          );
                        }}
                      >
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div class="mt-5">
            <Button
              variant="secondary"
              spacing="none"
              buttonClass="h-12 rounded-2xl px-4 text-sm font-semibold"
              onClick$={() => {
                articleSearchModal.value = true;
              }}
            >
              Adicionar outro artigo
            </Button>
          </div>
        </div>

        {articleSearchModal.value && (
          <div class="fixed inset-0 z-[520] flex min-h-dvh items-center justify-center p-4">
            <button
              type="button"
              aria-label="Fechar pesquisa de artigo"
              class="absolute inset-0 h-full w-full bg-slate-950/75 backdrop-blur-xl"
              onClick$={() => {
                articleSearchModal.value = false;
              }}
            />

            <div class="relative z-10 max-h-[88dvh] w-full max-w-[920px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)]">
              <button
                type="button"
                aria-label="Fechar"
                class="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900/95 text-lg text-slate-300 shadow-xl transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
                onClick$={() => {
                  articleSearchModal.value = false;
                }}
              >
                x
              </button>

              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Artigos
              </p>
              <h3 class="mt-2 text-2xl font-bold text-white">
                Pesquisar artigo extra
              </h3>

              <input
                value={articleSearch.value}
                placeholder="Pesquisar por camera, cabo, bateria, calha..."
                class="mt-5 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                onInput$={(event) => {
                  articleSearch.value = (event.target as HTMLInputElement).value;
                }}
              />

              <div class="mt-5 overflow-x-auto">
                <table class="w-full min-w-[760px] text-left">
                  <thead class="border-b border-slate-800 text-xs uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th class="py-3 pr-4">Artigo</th>
                      <th class="py-3 pr-4">Marca / Modelo</th>
                      <th class="py-3 pr-4">Sistema</th>
                      <th class="py-3 pr-4">Valor</th>
                      <th class="py-3">Acao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map((article) => (
                      <tr
                        key={article.id}
                        class="border-b border-slate-800 last:border-b-0"
                      >
                        <td class="py-3 pr-4">
                          <p class="text-sm font-semibold text-white">
                            {article.name}
                          </p>
                          <p class="mt-1 text-xs text-slate-500">
                            {article.description}
                          </p>
                        </td>
                        <td class="py-3 pr-4 text-sm text-slate-300">
                          {article.brand ?? "Bitoll"} / {article.model ?? "Padrao"}
                        </td>
                        <td class="py-3 pr-4 text-sm text-cyan-200">
                          {article.system ?? article.category}
                        </td>
                        <td class="py-3 pr-4 text-sm font-semibold text-white">
                          {article.unitPrice
                            ? formatMoney(article.unitPrice, currency)
                            : "A avaliar"}
                        </td>
                        <td class="py-3">
                          <Button
                            spacing="none"
                            buttonClass="rounded-xl px-3 py-2 text-xs"
                            onClick$={() => addArticle(article)}
                          >
                            Adicionar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div class="rounded-3xl border border-slate-800 bg-slate-900/50 p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Resumo fiscal da cotacao
          </p>
          <div class="mt-4 space-y-3 text-sm">
            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-400">Subtotal</span>
              <span class="font-semibold text-slate-100">
                {formatMoney(subtotal, currency)}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-400">Desconto</span>
              <span class="font-semibold text-emerald-300">
                -{formatMoney(discount, currency)}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-400">IVA obrigatorio 12%</span>
              <span class="font-semibold text-amber-200">
                {formatMoney(iva, currency)}
              </span>
            </div>
            <div class="border-t border-slate-800 pt-3">
              <div class="flex items-center justify-between gap-4">
                <span class="font-bold text-white">Total com IVA</span>
                <span class="text-lg font-bold text-cyan-200">
                  {formatMoney(total, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {proformaPreview.value && (
          <div class="rounded-3xl border border-slate-800 bg-white p-5 text-slate-950 shadow-2xl print:rounded-none print:border-0 print:shadow-none">
            <div class="flex flex-wrap items-start justify-between gap-6 border-b border-slate-300 pb-5">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Factura Pro-forma
                </p>
                <h3 class="mt-1 text-2xl font-black text-slate-950">
                  No {proformaNumber}
                </h3>
                <p class="mt-3 text-sm leading-6 text-slate-600">
                  Cidade de Tete
                  <br />
                  Cidade de Chimoio
                  <br />
                  E-mail: bitoll857@gmail.com
                  <br />
                  Cell: 86 613 6316
                  <br />
                  NUIT: 151102115
                </p>
              </div>

              <div class="min-w-[240px] rounded-xl border border-slate-300 p-4 text-sm leading-6">
                <p class="font-bold text-slate-950">Facturacao a:</p>
                <p>{currentUser?.name ?? "Cliente generico"}</p>
                <p>Morada: {currentUser?.city ?? "A confirmar"}</p>
                <p>Cell: {currentUser?.phone ?? "A confirmar"}</p>
                <p>Emissao: {formatDisplayDate(today)}</p>
                <p>Vencimento: {formatDisplayDate(dueDate)}</p>
              </div>
            </div>

            <div class="mt-5 overflow-x-auto">
              <table class="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr class="border-b-2 border-slate-900">
                    <th class="py-3 pr-4">Descricao</th>
                    <th class="py-3 pr-4 text-right">Qtd.</th>
                    <th class="py-3 pr-4 text-right">Preco Uni.</th>
                    <th class="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.value.map((article) => (
                    <tr key={`proforma-${article.id}`} class="border-b border-slate-200">
                      <td class="py-3 pr-4">
                        <p class="font-semibold text-slate-950">{article.name}</p>
                        <p class="text-xs text-slate-500">
                          {article.brand ?? "Bitoll"} / {article.model ?? "Padrao"}
                        </p>
                      </td>
                      <td class="py-3 pr-4 text-right">
                        {article.estimatedQuantity ?? 0}
                      </td>
                      <td class="py-3 pr-4 text-right">
                        {article.unitPrice
                          ? formatMoney(article.unitPrice, currency)
                          : "A avaliar"}
                      </td>
                      <td class="py-3 text-right font-semibold">
                        {article.unitPrice
                          ? formatMoney(getArticleTotal(article), currency)
                          : "A avaliar"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div class="ml-auto mt-5 w-full max-w-sm space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span class="font-semibold">{formatMoney(subtotal, currency)}</span>
              </div>
              <div class="flex justify-between">
                <span>IVA 12%</span>
                <span class="font-semibold">{formatMoney(iva, currency)}</span>
              </div>
              <div class="flex justify-between">
                <span>Desconto</span>
                <span class="font-semibold">-{formatMoney(discount, currency)}</span>
              </div>
              <div class="flex justify-between border-t border-slate-300 pt-3 text-lg font-black">
                <span>Total</span>
                <span>{formatMoney(total, currency)}</span>
              </div>
            </div>

            <div class="mt-5 flex flex-wrap gap-3 print:hidden">
              <Button
                type="button"
                spacing="none"
                buttonClass="rounded-2xl px-4 py-3 text-sm font-bold"
                onClick$={downloadProformaPdf}
              >
                Baixar PDF
              </Button>

              <Button
                type="button"
                variant="secondary"
                spacing="none"
                buttonClass="rounded-2xl px-4 py-3 text-sm font-bold"
                onClick$={() => {
                  proformaPreview.value = false;
                }}
              >
                Ocultar proforma
              </Button>
            </div>
          </div>
        )}

        <label for="quote-message" class="block">
          <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Detalhes do pedido
          </span>

          <textarea
            id="quote-message"
            name="message"
            placeholder="Descreva o local, quantidade de equipamentos, urgencia ou qualquer detalhe importante."
            rows={4}
            class="mt-2 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-slate-900"
          />
        </label>

        <label class="flex items-start gap-3 text-sm leading-6 text-slate-400">
          <input
            type="checkbox"
            name="allowContact"
            required
            class="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400"
          />

          Autorizo a Bitoll a entrar em contacto para responder a este
          pedido de orcamento.
        </label>

        <Button
          type="button"
          variant="secondary"
          fullWidth
          spacing="none"
          buttonClass="flex h-12 items-center justify-center rounded-2xl text-sm font-bold"
          onClick$={() => {
            proformaPreview.value = true;
            showToast(
              "Proforma preparada",
              "A factura pro-forma foi gerada para revisao antes do envio.",
            );
          }}
        >
          Ver proforma antes de enviar
        </Button>

        <Button
          type="submit"
          fullWidth
          spacing="none"
          buttonClass="flex h-12 items-center justify-center rounded-2xl text-sm font-bold"
        >
          Enviar pedido
        </Button>

        <ActionToast
          isOpen={toastOpen.value}
          title={toastTitle.value}
          message={toastMessage.value}
          onClose$={() => {
            toastOpen.value = false;
          }}
        />
      </form>
    );
  },
);
