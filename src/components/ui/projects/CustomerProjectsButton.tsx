import {
  $,
  component$,
  useOnWindow,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";

import Button from "../button/Button";
import { getCachedAuthUser } from "~/lib/supabase/client";
import {
  loadCustomerProjectsFromSupabase,
  loadPromotionsFromSupabase,
  loadServiceProductCatalogsFromSupabase,
  loadServicesFromSupabase,
} from "~/lib/supabase/platform-data";
import { formatMoney } from "~/lib/formatters/money";
import type { CustomerProject } from "~/types/customer-project";
import type { Promotion } from "~/types/promotion";
import type { ServiceProductCatalog } from "~/types/service-products";
import type { User } from "~/types/user";

type PanelMode = "active" | "completed" | "chat";
type ChatService = {
  description: string;
  features?: string[];
  shortDescription?: string;
  slug?: string;
  title: string;
};
type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
};

const chatSuggestions = [
  "Quais artigos entram no CCTV?",
  "Estado dos meus projetos",
  "Promocoes de vedacao",
  "Como gerar uma proforma?",
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const pdfText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const drawPdfText = (
  x: number,
  y: number,
  size: number,
  text: string,
  font = "F1",
) => `BT /${font} ${size} Tf ${x} ${y} Td (${pdfText(text)}) Tj ET`;

const drawPdfLine = (x1: number, y1: number, x2: number, y2: number) =>
  `${x1} ${y1} m ${x2} ${y2} l S`;

const createQuotePdfBlob = (project: CustomerProject) => {
  const rowsPerPage = 14;
  const rows = project.items.length > 0
    ? project.items
    : [
        {
          name: project.service,
          quantity: 1,
          unit: "Servico",
          unitPrice: project.total,
        },
      ];
  const pages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const objects: string[] = [];
  const pageIds = Array.from({ length: pages }, (_, index) => 5 + index * 2);

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages} >>`,
  );
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  for (let page = 0; page < pages; page += 1) {
    const pageRows = rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    const pageObjectId = 5 + page * 2;
    const contentObjectId = pageObjectId + 1;
    const commands = [
      "0.8 w",
      "0.02 0.18 0.36 RG",
      "0.02 0.18 0.36 rg",
      drawPdfText(82, 785, 30, "Bitoll", "F2"),
      "0.07 0.45 0.82 RG",
      drawPdfLine(40, 782, 62, 782),
      drawPdfLine(40, 770, 72, 770),
      drawPdfLine(40, 758, 58, 758),
      "0 0 0 RG",
      "0 0 0 rg",
      drawPdfText(360, 786, 22, "Factura Pro-forma", "F2"),
      drawPdfText(398, 762, 11, `No ${project.quoteNumber}`, "F2"),
      drawPdfLine(40, 736, 555, 736),
      drawPdfText(40, 714, 10, "Bitoll - seguranca e tecnologia", "F2"),
      drawPdfText(40, 700, 10, "Cidade de Tete / Cidade de Chimoio"),
      drawPdfText(40, 686, 10, "Cell: +258 84 000 0000"),
      drawPdfText(340, 714, 10, "Facturacao a", "F2"),
      drawPdfText(340, 700, 10, project.title),
      drawPdfText(340, 686, 10, project.location),
      drawPdfText(40, 646, 10, `Emissao: ${formatDate(project.requestedAt)}`),
      drawPdfText(340, 646, 10, `Servico: ${project.service}`),
      drawPdfLine(40, 620, 555, 620),
      drawPdfText(48, 604, 10, "Descricao", "F2"),
      drawPdfText(358, 604, 10, "Qtd.", "F2"),
      drawPdfText(416, 604, 10, "Preco Uni.", "F2"),
      drawPdfText(512, 604, 10, "Total", "F2"),
      drawPdfLine(40, 596, 555, 596),
    ];
    let y = 574;

    pageRows.forEach((item) => {
      const quantity = Math.max(1, item.quantity);
      const total = quantity * item.unitPrice;
      const description =
        item.name.length > 52 ? `${item.name.slice(0, 49)}...` : item.name;

      commands.push(
        drawPdfText(48, y, 9, description),
        drawPdfText(362, y, 9, String(quantity)),
        drawPdfText(410, y, 9, formatMoney(item.unitPrice, project.currency)),
        drawPdfText(500, y, 9, formatMoney(total, project.currency)),
      );
      y -= 28;
    });

    if (page === pages - 1) {
      const baseWithoutStructure = Math.max(0, project.subtotal - project.structureCost);
      commands.push(
        drawPdfLine(388, 238, 555, 238),
        drawPdfText(396, 222, 10, "Artigos/base estrutura", "F2"),
        drawPdfText(480, 222, 10, formatMoney(baseWithoutStructure, project.currency)),
        drawPdfText(396, 202, 10, `Estrutura (${project.structureCostPercentage}%)`, "F2"),
        drawPdfText(480, 202, 10, formatMoney(project.structureCost, project.currency)),
        drawPdfText(396, 182, 10, "IVA", "F2"),
        drawPdfText(480, 182, 10, formatMoney(project.tax, project.currency)),
        drawPdfText(396, 162, 10, "Desconto", "F2"),
        drawPdfText(480, 162, 10, `-${formatMoney(project.discount, project.currency)}`),
        drawPdfLine(388, 156, 555, 156),
        drawPdfText(396, 142, 12, "Total", "F2"),
        drawPdfText(480, 142, 12, formatMoney(project.total, project.currency), "F2"),
      );
    }

    commands.push(drawPdfText(470, 30, 8, `Pagina ${page + 1}/${pages}`));

    const stream = commands.join("\n");
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
  }

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

const getPromotionTotal = (promotion: Promotion) => {
  const subtotal =
    promotion.articles.reduce(
      (sum, article) => sum + article.quantity * article.unitPrice,
      0,
    ) + promotion.installationFee;
  const taxable = Math.max(subtotal - promotion.discountAmount, 0);

  return taxable + taxable * 0.12;
};

const serviceKeywords: Record<string, string[]> = {
  "vedacao-eletrica": ["vedacao", "cerca", "perimetro", "muro"],
  "cctv-monitoramento": ["cctv", "camera", "cameras", "monitoramento"],
  "motores-de-portoes": ["motor", "portao", "portoes", "automacao"],
  "tecnologia-inteligente": [
    "tecnologia",
    "internet",
    "starlink",
    "rede",
    "automacao",
    "inteligente",
  ],
};

const getRequestedServiceSlug = (message: string) => {
  const normalized = normalizeText(message);

  return (
    Object.entries(serviceKeywords).find(([, keywords]) =>
      keywords.some((keyword) => normalized.includes(keyword)),
    )?.[0] ?? null
  );
};

const getServiceProductsSummary = (
  serviceSlug: string,
  catalogs: ServiceProductCatalog[],
) => {
  const catalog = catalogs.find(
    (item) => item.serviceSlug === serviceSlug,
  );

  if (!catalog) {
    return "Ainda nao encontrei uma lista de artigos preparada para esse servico.";
  }

  const preferredProducts =
    catalog.productsByStructure.media.length > 0
      ? catalog.productsByStructure.media
      : catalog.productsByStructure.basica;
  const subtotal = preferredProducts.reduce(
    (sum, product) =>
      sum + (product.estimatedQuantity ?? 0) * (product.unitPrice ?? 0),
    0,
  );
  const productList = preferredProducts
    .slice(0, 6)
    .map((product) => `- ${product.name}: ${product.quantity}`)
    .join("\n");

  return `${productList}\nSubtotal estimado dos artigos listados: ${formatMoney(
    subtotal,
  )}.`;
};

const getGbsReply = (
  message: string,
  userName: string,
  context: {
    catalogs: ServiceProductCatalog[];
    projects: CustomerProject[];
    promotions: Promotion[];
    services: ChatService[];
  },
) => {
  const normalized = normalizeText(message);
  const serviceSlug = getRequestedServiceSlug(message);

  if (
    normalized.includes("estado") ||
    normalized.includes("andamento") ||
    normalized.includes("projecto") ||
    normalized.includes("projeto") ||
    normalized.includes("pedido") ||
    normalized.includes("terminado") ||
    normalized.includes("concluido")
  ) {
    const serviceSearchTerms = serviceSlug ? serviceKeywords[serviceSlug] : [];
    const selectedProjects = serviceSlug
      ? context.projects.filter((project) => {
          const projectContext = normalizeText(
            `${project.service} ${project.title}`,
          );

          return serviceSearchTerms.some((keyword) =>
            projectContext.includes(keyword),
          );
        })
      : context.projects;
    const projectList = selectedProjects
      .slice(0, 3)
      .map(
        (project) =>
          project.progressEnabled
            ? `- ${project.title}: ${project.status}, ${project.progress}% concluido. Proximo passo: ${project.nextStep}`
            : `- ${project.title}: cotacao ainda em processo de validacao pela equipa Bitoll.`,
      )
      .join("\n");

    return projectList
      ? `Encontrei estes dados ligados a conta de ${userName}:\n${projectList}`
      : "Nao encontrei um projeto desse tipo nesta conta simulada. Posso orientar uma nova cotacao ou mostrar os servicos disponiveis.";
  }

  if (
    normalized.includes("promocao") ||
    normalized.includes("promocoes") ||
    normalized.includes("desconto") ||
    normalized.includes("oferta")
  ) {
    const matchedPromotions = context.promotions.filter((promotion) =>
      serviceSlug ? promotion.serviceSlug === serviceSlug : promotion.active,
    );
    const promotionList = matchedPromotions
      .slice(0, 3)
      .map(
        (promotion) =>
          `- ${promotion.title}: ${promotion.discount}, valido ate ${formatDate(
            promotion.endDate,
          )}. Total estimado com IVA: ${formatMoney(
            getPromotionTotal(promotion),
            promotion.currency,
          )}.`,
      )
      .join("\n");

    return promotionList
      ? `Estas promocoes estao nos dados da plataforma:\n${promotionList}`
      : "Nao encontrei promocao ativa para esse servico nos dados atuais.";
  }

  if (
    normalized.includes("artigo") ||
    normalized.includes("produto") ||
    normalized.includes("material") ||
    normalized.includes("preco") ||
    normalized.includes("valor") ||
    normalized.includes("cotacao") ||
    normalized.includes("orcamento") ||
    normalized.includes("proforma")
  ) {
    if (serviceSlug) {
      return `Para essa cotacao, encontrei uma base de artigos reais nos moldes da Bitoll:\n${getServiceProductsSummary(
        serviceSlug,
        context.catalogs,
      )}\nPara fechar valores, use o formulario de cotacao e aplique a estimativa do servico.`;
    }

    return "Posso consultar artigos e preparar orientacao para CCTV, vedacao eletrica, motor de portao ou tecnologia inteligente. Diz-me qual servico queres cotar.";
  }

  if (serviceSlug) {
    const service = context.services.find((item) => item.slug === serviceSlug);

    if (service) {
      return `${service.title}: ${service.shortDescription}\n${service.description}\nPrincipais pontos: ${(service.features ?? [])
        .slice(0, 4)
        .join(", ")}.`;
    }
  }

  if (
    normalized.includes("ola") ||
    normalized.includes("oi") ||
    normalized.includes("ajuda") ||
    normalized.includes("gbs")
  ) {
    return `Ola, ${userName}. Sou o assistente GBS em modo local. Posso pesquisar nos dados da plataforma sobre servicos, promocoes, artigos de cotacao e projetos simulados da sua conta.`;
  }

  return "Procurei nos dados locais, mas ainda nao identifiquei exatamente o que precisa. Experimente perguntar por exemplo: \"quais artigos entram no CCTV?\", \"estado do meu projeto\" ou \"promocoes de vedacao\".";
};

const ActionIcon = component$<{ mode: PanelMode }>(({ mode }) => {
  if (mode === "completed") {
    return (
      <svg
        aria-hidden="true"
        class="h-5 w-5 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path d="M9 12l2 2 4-4" />
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    );
  }

  if (mode === "active") {
    return (
      <svg
        aria-hidden="true"
        class="h-5 w-5 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 8v4l3 3" />
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      class="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
});

const ProjectCard = component$<{ project: CustomerProject }>(({ project }) => {
  const progressEnabled = project.progressEnabled ?? true;
  const downloadQuotePdf = $(() => {
    const pdfBlob = createQuotePdfBlob(project);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bitoll-cotacao-${project.quoteNumber.replace(/[^\w-]+/g, "-")}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  return (
    <article class="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {project.service}
          </p>
          <h3 class="mt-2 text-xl font-bold text-white">
            {project.title}
          </h3>
          <p class="mt-2 text-sm text-slate-400">
            {project.location} · solicitado em {formatDate(project.requestedAt)}
          </p>
        </div>

        <span class="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
          {project.status}
        </span>
      </div>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Valor da cotacao
          </p>
          <p class="mt-1 text-lg font-black text-white">
            {formatMoney(project.total, project.currency)}
          </p>
        </div>

        <Button
          type="button"
          spacing="none"
          buttonClass="rounded-xl px-4 py-3 text-sm font-bold"
          onClick$={downloadQuotePdf}
        >
          Baixar PDF
        </Button>
      </div>

      {!progressEnabled ? (
        <div class="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          A cotacao ainda esta em processo de validacao pela equipa Bitoll. Os
          paineis de andamento serao ligados quando o admin preencher o estado,
          responsavel, previsao e proximos passos.
        </div>
      ) : (
        <>
          <div class="mt-5">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Progresso</span>
              <span>{project.progress}%</span>
            </div>
            <div class="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                class="h-full rounded-full bg-cyan-400"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div class="mt-5 grid gap-4 md:grid-cols-3">
            <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
                Proximo passo
              </p>
              <p class="mt-2 text-sm leading-6 text-slate-300">
                {project.nextStep}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
                Responsavel
              </p>
              <p class="mt-2 text-sm leading-6 text-slate-300">
                {project.technician}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
                Previsao
              </p>
              <p class="mt-2 text-sm leading-6 text-slate-300">
                {formatDate(project.estimatedCompletion)}
              </p>
            </div>
          </div>

          {project.updates.length > 0 && (
            <div class="mt-5 flex flex-wrap gap-2">
              {project.updates.map((update) => (
                <span
                  key={update}
                  class="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300"
                >
                  {update}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </article>
  );
});

export default component$(() => {
  const panelMode = useSignal<PanelMode | null>(null);
  const authReady = useSignal(false);
  const isAuthenticated = useSignal(false);
  const authUser = useSignal<User | null>(null);
  const projects = useSignal<CustomerProject[]>([]);
  const promotions = useSignal<Promotion[]>([]);
  const services = useSignal<ChatService[]>([]);
  const catalogs = useSignal<ServiceProductCatalog[]>([]);
  const chatInput = useSignal("");
  const chatMessages = useSignal<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Ola. Sou o assistente GBS em modo local. Posso consultar servicos, promocoes, artigos de cotacao e projetos simulados da plataforma.",
    },
  ]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    authUser.value = getCachedAuthUser();
    isAuthenticated.value =
      !!authUser.value && localStorage.getItem("bitoll-auth-state") !== "guest";
    authReady.value = true;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => panelMode.value);
    track(() => isAuthenticated.value);
    track(() => authUser.value?.id);

    if (!panelMode.value || !isAuthenticated.value || !authUser.value) {
      return;
    }

    const [dbProjects, dbPromotions, dbServices, dbCatalogs] =
      await Promise.all([
        loadCustomerProjectsFromSupabase(),
        loadPromotionsFromSupabase(),
        loadServicesFromSupabase(),
        loadServiceProductCatalogsFromSupabase(),
      ]);

    projects.value = dbProjects;
    promotions.value = dbPromotions;
    services.value = dbServices.map((service) => ({
      description: service.description,
      features: service.features,
      shortDescription: service.shortDescription,
      slug: service.slug,
      title: service.title,
    }));
    catalogs.value = dbCatalogs;
  });

  useOnWindow(
    "bitoll-auth-change",
    $((event) => {
      isAuthenticated.value =
        !!(event as CustomEvent<{ isAuthenticated: boolean }>).detail
          ?.isAuthenticated;
      authUser.value =
        (event as CustomEvent<{ user?: User | null }>).detail?.user ??
        getCachedAuthUser();
      authReady.value = true;
    }),
  );

  if (!authReady.value || !authUser.value || !isAuthenticated.value) {
    return null;
  }

  const user = authUser.value;
  const isOpen = !!panelMode.value;
  const visibleProjects =
    panelMode.value === "completed"
      ? projects.value.filter((project) => project.status === "Concluido")
      : projects.value.filter((project) => project.status !== "Concluido");
  const completedProjectsCount = projects.value.filter(
    (project) => project.status === "Concluido",
  ).length;
  const activeProjectsCount = projects.value.filter(
    (project) => project.status !== "Concluido",
  ).length;
  const chatContext = {
    catalogs: catalogs.value,
    projects: projects.value,
    promotions: promotions.value,
    services: services.value,
  };
  const title =
    panelMode.value === "completed"
      ? "Servicos terminados"
      : panelMode.value === "chat"
        ? "Chat GBS"
        : "Servicos em andamento";

  return (
    <>
      <div class="fixed inset-x-0 top-20 z-[45] border-b border-slate-800 bg-slate-950/95 px-3 py-2 backdrop-blur-xl md:inset-x-auto md:bottom-auto md:left-5 md:top-1/2 md:-translate-y-1/2 md:border-b-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-0">
        <div class="mx-auto grid w-full max-w-[460px] grid-cols-3 gap-2 md:mx-0 md:w-[74px] md:max-w-none md:grid-cols-1 md:gap-3 md:rounded-[28px] md:border md:border-slate-800 md:bg-slate-950/88 md:p-3 md:shadow-[0_22px_80px_rgba(2,6,23,0.40)] md:backdrop-blur-xl">
          {[
            {
              count: completedProjectsCount,
              mode: "completed" as const,
              label: "Abrir servicos terminados",
              text: "Terminados",
              tone:
                "border-emerald-400/30 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400 hover:text-slate-950",
            },
            {
              count: activeProjectsCount,
              mode: "active" as const,
              label: "Abrir servicos em andamento",
              text: "Em andamento",
              tone:
                "border-cyan-400/30 bg-cyan-400/15 text-cyan-200 hover:bg-cyan-400 hover:text-slate-950",
            },
            {
              count: 0,
              mode: "chat" as const,
              label: "Abrir chat GBS",
              text: "Chat GBS",
              tone:
                "border-violet-400/30 bg-violet-400/15 text-violet-200 hover:bg-violet-400 hover:text-slate-950",
            },
          ].map((action) => (
            <button
              key={action.mode}
              type="button"
              aria-label={action.label}
              title={action.label}
              data-guide={action.mode === "active" ? "projects" : undefined}
              class={[
                "relative flex h-12 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 text-[11px] font-bold leading-tight transition duration-300 hover:-translate-y-0.5 md:h-14 md:w-14 md:rounded-2xl md:px-0 md:[&>span]:sr-only",
                action.tone,
              ]}
              onClick$={() => {
                panelMode.value = action.mode;
              }}
            >
              <ActionIcon mode={action.mode} />
              <span class="min-w-0 truncate">{action.text}</span>
              {action.mode !== "chat" && (
                <span
                  aria-label={`${action.count} servicos`}
                  class="absolute -right-1.5 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-slate-950 bg-red-500 px-1.5 text-[11px] font-black leading-none text-white shadow-lg shadow-red-950/30 md:-right-2 md:-top-2"
                >
                  {action.count > 99 ? "99+" : action.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <div class="fixed inset-0 z-[360] flex min-h-dvh items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar painel do cliente"
            class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
            onClick$={() => {
              panelMode.value = null;
            }}
          />

          <div class="relative z-10 mx-auto max-h-[92dvh] w-full max-w-[980px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)] sm:p-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Area do cliente
                </p>
                <h2 class="mt-2 text-3xl font-bold text-white">
                  {title}
                </h2>
                <p class="mt-2 max-w-[620px] text-sm leading-6 text-slate-400">
                  Simulacao ligada a conta de {user.name}.
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar"
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
                onClick$={() => {
                  panelMode.value = null;
                }}
              >
                x
              </button>
            </div>

            {panelMode.value === "chat" ? (
              <div class="mt-7 rounded-3xl border border-violet-400/20 bg-violet-400/10 p-5">
                <div class="flex items-center gap-4">
                  <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-400/20 text-violet-100">
                    <ActionIcon mode="chat" />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white">
                      Assistente GBS
                    </h3>
                    <p class="mt-1 text-sm leading-6 text-slate-300">
                      Ola, {user.name}. Estou em modo local, usando
                      apenas os dados da plataforma para responder.
                    </p>
                  </div>
                </div>

                <div class="mt-5 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  {chatMessages.value.map((message) => (
                    <div
                      key={message.id}
                      class={[
                        "max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6",
                        message.role === "user"
                          ? "ml-auto bg-cyan-400 text-slate-950"
                          : "bg-slate-900 text-slate-200",
                      ]}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                  {chatSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      class="rounded-full border border-violet-400/20 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-violet-100 transition duration-300 hover:border-violet-300/50 hover:bg-violet-400/10"
                      onClick$={() => {
                        const reply = getGbsReply(
                          suggestion,
                          user.name,
                          chatContext,
                        );

                        chatMessages.value = [
                          ...chatMessages.value,
                          {
                            id: Date.now(),
                            role: "user",
                            text: suggestion,
                          },
                          {
                            id: Date.now() + 1,
                            role: "assistant",
                            text: reply,
                          },
                        ];
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <form
                  preventdefault:submit
                  class="mt-4 flex flex-col gap-3 sm:flex-row"
                  onSubmit$={() => {
                    const question = chatInput.value.trim();

                    if (!question) {
                      return;
                    }

                    const reply = getGbsReply(question, user.name, chatContext);

                    chatMessages.value = [
                      ...chatMessages.value,
                      {
                        id: Date.now(),
                        role: "user",
                        text: question,
                      },
                      {
                        id: Date.now() + 1,
                        role: "assistant",
                        text: reply,
                      },
                    ];
                    chatInput.value = "";
                  }}
                >
                  <input
                    value={chatInput.value}
                    placeholder="Pergunte sobre servicos, promocoes, artigos ou projetos..."
                    class="h-12 flex-1 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 text-sm text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-violet-300/50"
                    onInput$={(event) => {
                      chatInput.value = (event.target as HTMLInputElement).value;
                    }}
                  />
                  <Button
                    type="submit"
                    spacing="none"
                    buttonClass="h-12 rounded-2xl px-5 text-sm font-bold"
                  >
                    Enviar
                  </Button>
                </form>
              </div>
            ) : (
              <div class="mt-7 grid gap-5">
                {visibleProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}

                {visibleProjects.length === 0 && (
                  <div class="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
                    Ainda nao existem pedidos desta categoria na base de dados da Bitoll.
                  </div>
                )}
              </div>
            )}

            <div class="mt-7 border-t border-slate-800 pt-6">
              <Button
                spacing="none"
                buttonClass="rounded-2xl px-5 py-3 text-sm font-bold"
                onClick$={() => {
                  panelMode.value = null;
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
