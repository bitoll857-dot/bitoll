import { $, component$, useSignal } from "@builder.io/qwik";

import SelectField from "../fields/Select";
import Button from "../button/Button";
import ActionToast from "~/components/ui/toast";
import { currentUser } from "~/data/user";
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

const IVA_RATE = 0.12;

const formatMoney = (value: number, currency = "MZN") =>
  `${value.toLocaleString("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;

const getArticleTotal = (article: QuoteArticle) =>
  (article.estimatedQuantity ?? 0) * (article.unitPrice ?? 0);

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
    const toastOpen = useSignal(false);
    const toastTitle = useSignal("");
    const toastMessage = useSignal("");
    const articleSearchModal = useSignal(false);
    const articleSearch = useSignal("");
    const hasWorkImages = useSignal(false);
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
    const gateCount = useSignal(1);
    const gateType = useSignal("deslizante");
    const articles = useSignal<QuoteArticle[]>(
      (initialData.products ?? []).map((product) => ({
        ...product,
        locked: true,
      })),
    );

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

    const showToast = $((title: string, message: string) => {
      toastTitle.value = title;
      toastMessage.value = message;
      toastOpen.value = true;
    });

    const applyFenceEstimate = $(() => {
      const width = Math.max(0, wallWidthMeters.value);
      const length = Math.max(0, wallLengthMeters.value);
      const height = Math.max(0, wallHeightMeters.value);
      const perimeter = Math.ceil((width + length) * 2);
      const lines = Math.max(1, fenceLines.value);
      const gateMultiplier =
        gateType.value === "duplo"
          ? 3
          : gateType.value === "basculante"
            ? 2
            : 2;
      const postSpacing = height >= 2.5 ? 2 : 2.5;
      const posts =
        Math.ceil(perimeter / postSpacing) +
        cornerCount.value +
        gateCount.value * gateMultiplier;
      const wireMeters = Math.ceil(perimeter * lines * 1.1);
      const isolators = posts * lines;
      const htCableMeters = Math.ceil(
        perimeter * 0.18 + gateCount.value * (gateType.value === "duplo" ? 14 : 8),
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

        return article;
      });

      showToast(
        "Estimativa actualizada",
        `Perimetro calculado: ${perimeter}m. Foram estimados ${posts} postes, ${isolators} isoladores, ${wireMeters}m de arame, ${htCableMeters}m de cabo HT e ${warningPlates} placas.`,
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
    const isFenceService = initialData.service === "vedacao-eletrica";
    const estimatedPerimeter = Math.ceil(
      (Math.max(0, wallWidthMeters.value) + Math.max(0, wallLengthMeters.value)) *
        2,
    );

    return (
      <form preventdefault:submit class="mt-7 space-y-5">
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
          <SelectField
            id="quote-service"
            label="Servico"
            name="service"
            value={initialData.service}
            options={serviceOptions}
            required
          />

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
                    Comprimento (m)
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
                    Linhas da cerca
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={fenceLines.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      fenceLines.value = Number(
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
                    Entradas/portoes
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={gateCount.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onInput$={(event) => {
                      gateCount.value = Number(
                        (event.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Tipo de portao
                  </span>
                  <select
                    value={gateType.value}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    onChange$={(event) => {
                      gateType.value = (event.target as HTMLSelectElement).value;
                    }}
                  >
                    <option value="deslizante">Deslizante</option>
                    <option value="basculante">Basculante</option>
                    <option value="duplo">Portao duplo</option>
                    <option value="pedonal">Pedonal</option>
                  </select>
                </label>
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
                      {article.quantity}
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
