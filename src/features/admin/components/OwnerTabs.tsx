import { component$, useSignal } from "@builder.io/qwik";

import type { AdminPanelState } from "../hooks/useAdminPanel";
import type { OwnerTab } from "../types/admin.types";
import { asNumber } from "../utils/admin.utils";
import { formatMoney } from "~/lib/formatters/money";

import {
  ProductForm,
  PromotionForm,
  ServiceForm,
  StructureOptionForm,
  TemplateForm,
} from "./OwnerForms";

type Props = {
  admin: AdminPanelState;
};

type OwnerViewMode = "table" | "cards" | "list";

const tabs: { value: OwnerTab; label: string }[] = [
  { value: "services", label: "Servicos" },
  { value: "structures", label: "Estruturas" },
  { value: "products", label: "Artigos" },
  { value: "templates", label: "Cotacoes padrao" },
  { value: "customQuotes", label: "Cotacao personalizada" },
  { value: "promotions", label: "Promocoes" },
  { value: "quotes", label: "Solicitacoes" },
];

const viewModes: { value: OwnerViewMode; label: string }[] = [
  { value: "table", label: "Tabela" },
  { value: "cards", label: "Cartao" },
  { value: "list", label: "Lista" },
];

const tableClass = "w-full text-left text-sm max-md:block";
const tableHeadClass =
  "text-xs uppercase tracking-[0.14em] text-slate-500 max-md:hidden";
const tableBodyClass =
  "divide-y divide-slate-800 max-md:grid max-md:gap-3 max-md:divide-y-0";
const tableRowClass =
  "max-md:block max-md:rounded-xl max-md:border max-md:border-slate-800 max-md:bg-slate-950 max-md:p-4";
const tableCellClass =
  "py-3 max-md:flex max-md:items-start max-md:justify-between max-md:gap-4 max-md:border-b max-md:border-slate-800 max-md:py-3 max-md:text-right max-md:last:border-b-0 max-md:before:shrink-0 max-md:before:content-[attr(data-label)] max-md:before:text-left max-md:before:text-xs max-md:before:font-bold max-md:before:uppercase max-md:before:tracking-[0.12em] max-md:before:text-slate-500";
const tableActionCellClass = `${tableCellClass} text-right`;

export const OwnerTabs = component$<Props>(({ admin }) => {
  const ownerViewMode = useSignal<OwnerViewMode>("table");
  const areaSelectOpen = useSignal(false);
  const viewSelectOpen = useSignal(false);
  const searchTerm = admin.ownerSearch.value.trim().toLowerCase();
  const procedureQuote = admin.operatorQuotes.value.find(
    (quote) => quote.id === admin.quoteProcedureQuoteId.value,
  );
  const procedureStructureKey =
    typeof procedureQuote?.request_payload?.structureType === "string"
      ? procedureQuote.request_payload.structureType
      : "";
  const procedureStructure = admin.ownerStructureOptions.value.find(
    (option) =>
      option.service_slug === procedureQuote?.service_slug &&
      option.structure === procedureStructureKey,
  );
  const procedureSteps =
    procedureStructure?.steps.length
      ? procedureStructure.steps
      : ["Estudar a area e validar os dados do servico."];

  const filteredServices = searchTerm
    ? admin.ownerServices.value.filter((service) =>
        `${service.title} ${service.slug} ${service.short_description}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerServices.value;

  const filteredProducts = searchTerm
    ? admin.ownerProducts.value.filter((product) =>
        `${product.name} ${product.service_slug} ${product.brand}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerProducts.value;

  const filteredStructures = searchTerm
    ? admin.ownerStructureOptions.value.filter((option) =>
        `${option.title} ${option.service_slug} ${option.structure}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerStructureOptions.value;

  const filteredTemplates = searchTerm
    ? admin.ownerTemplates.value.filter((template) =>
        `${template.title} ${template.service_slug} ${template.structure}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerTemplates.value;

  const filteredPromotions = searchTerm
    ? admin.ownerPromotions.value.filter((promotion) =>
        `${promotion.title} ${promotion.slug ?? ""} ${promotion.discount_label}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerPromotions.value;

  const filteredQuotes = searchTerm
    ? admin.operatorQuotes.value.filter((quote) =>
        `${quote.quote_number} ${quote.service_slug ?? ""} ${
          quote.profiles?.full_name ?? ""
        } ${quote.profiles?.email ?? ""} ${quote.profiles?.phone ?? ""}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.operatorQuotes.value;

  const filteredCustomQuotes = searchTerm
    ? admin.ownerCustomQuotes.value.filter((quote) =>
        `${quote.quote_number} ${quote.customer_name} ${quote.customer_contact} ${quote.service_slug ?? ""} ${quote.status}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerCustomQuotes.value;
  const lastCreatedCustomQuote = admin.ownerCustomQuotes.value.find(
    (quote) => quote.id === admin.customQuoteLastCreatedId.value,
  );

  const customQuoteProductSearch =
    admin.customQuoteProductSearch.value.trim().toLowerCase();
  const customQuoteProducts = admin.ownerProducts.value.filter((product) => {
    const matchesService =
      !admin.customQuoteDraft.serviceSlug ||
      product.service_slug === admin.customQuoteDraft.serviceSlug;
    const matchesSearch =
      !customQuoteProductSearch ||
      `${product.name} ${product.service_slug} ${product.structure} ${product.category} ${product.brand}`
        .toLowerCase()
        .includes(customQuoteProductSearch);

    return product.active && matchesService && matchesSearch;
  });
  const customQuoteSubtotal = admin.customQuoteDraft.items.reduce(
    (sum, item) => sum + asNumber(item.unitPrice) * asNumber(item.quantity),
    0,
  );
  const supportsOwnerForm =
    admin.ownerTab.value !== "quotes" &&
    admin.ownerTab.value !== "customQuotes";

  const getTabCount = (tab: OwnerTab) => {
    if (tab === "services") {
      return admin.ownerServices.value.length;
    }

    if (tab === "structures") {
      return admin.ownerStructureOptions.value.length;
    }

    if (tab === "products") {
      return admin.ownerProducts.value.length;
    }

    if (tab === "templates") {
      return admin.ownerTemplates.value.length;
    }

    if (tab === "promotions") {
      return admin.ownerPromotions.value.length;
    }

    if (tab === "customQuotes") {
      return admin.ownerCustomQuotes.value.length;
    }

    return admin.operatorQuotes.value.length;
  };

  const modeTableClass =
    ownerViewMode.value === "cards"
      ? "block min-w-0 [&_thead]:hidden [&_tbody]:grid [&_tbody]:gap-4 [&_tbody]:divide-y-0 md:[&_tbody]:grid-cols-2 xl:[&_tbody]:grid-cols-3 [&_tr]:block [&_tr]:rounded-xl [&_tr]:border [&_tr]:border-slate-800 [&_tr]:bg-slate-950 [&_tr]:p-4 [&_td]:block [&_td]:border-b [&_td]:border-slate-800 [&_td]:py-3 [&_td]:text-left [&_td]:before:hidden [&_td:last-child]:border-b-0 [&_td:last-child]:text-right"
      : ownerViewMode.value === "list"
        ? "block min-w-0 [&_thead]:hidden [&_tbody]:grid [&_tbody]:gap-2 [&_tbody]:divide-y-0 [&_tr]:grid [&_tr]:gap-2 [&_tr]:rounded-xl [&_tr]:border [&_tr]:border-slate-800 [&_tr]:bg-slate-950/80 [&_tr]:px-4 [&_tr]:py-3 md:[&_tr]:grid-cols-[1.4fr_1fr_auto_auto] [&_td]:block [&_td]:py-1 [&_td]:text-left [&_td]:before:hidden [&_td:last-child]:text-right"
        : "";

  const widthClass = (value: string) =>
    ownerViewMode.value === "table" ? value : "min-w-0";

  const selectedTab =
    tabs.find((tab) => tab.value === admin.ownerTab.value) ?? tabs[0];
  const selectedViewMode =
    viewModes.find((mode) => mode.value === ownerViewMode.value) ??
    viewModes[0];

  return (
    <>
      <div class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
        <p class="text-sm font-semibold text-cyan-100">Sessao admin ativa</p>

        <p class="mt-1 break-words text-sm text-cyan-100/70">
          {admin.authUser.value?.name} / {admin.authUser.value?.email} / papel{" "}
          {admin.adminAccess.value.role}
        </p>
      </div>

      <section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div class="relative max-w-sm">
          <button
            type="button"
            class={[
              "flex h-12 w-full items-center justify-between gap-4 rounded-xl border bg-slate-950 px-4 text-left text-sm transition",
              areaSelectOpen.value
                ? "border-cyan-400/60"
                : "border-slate-800 hover:border-cyan-400/40",
            ]}
            aria-haspopup="listbox"
            aria-expanded={areaSelectOpen.value}
            onClick$={() => {
              areaSelectOpen.value = !areaSelectOpen.value;
            }}
          >
            <span class="min-w-0">
              <span class="block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Area
              </span>
              <span class="block truncate font-black text-slate-100">
                {selectedTab.label}
              </span>
            </span>

            <span class="flex shrink-0 items-center gap-3">
              <span class="rounded-full bg-cyan-300 px-2.5 py-1 text-xs font-black text-slate-950">
                {getTabCount(selectedTab.value)}
              </span>
              <span class="text-slate-400">{areaSelectOpen.value ? "-" : "+"}</span>
            </span>
          </button>

          {areaSelectOpen.value && (
            <div
              role="listbox"
              class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-2xl shadow-slate-950/60"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="option"
                  aria-selected={admin.ownerTab.value === tab.value}
                  class={[
                    "flex w-full items-center justify-between gap-4 rounded-lg px-3 py-3 text-left text-sm transition",
                    admin.ownerTab.value === tab.value
                      ? "bg-cyan-400 text-slate-950"
                      : "text-slate-200 hover:bg-slate-900",
                  ]}
                  onClick$={() => {
                    admin.ownerTab.value = tab.value;
                    admin.showOwnerForm.value = false;
                    areaSelectOpen.value = false;
                  }}
                >
                  <span class="font-black">{tab.label}</span>
                  <span
                    class={[
                      "rounded-full px-2 py-0.5 text-xs font-black",
                      admin.ownerTab.value === tab.value
                        ? "bg-slate-950 text-cyan-200"
                        : "bg-slate-800 text-slate-300",
                    ]}
                  >
                    {getTabCount(tab.value)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div class="mt-4 flex flex-nowrap items-center gap-2">
          <input
            value={admin.ownerSearch.value}
            placeholder="Pesquisar nesta area"
            class="h-11 min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
            onInput$={(event) => {
              admin.ownerSearch.value = (
                event.target as HTMLInputElement
              ).value;
            }}
          />

          {supportsOwnerForm && (
            <button
              type="button"
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 px-0 text-sm font-bold text-slate-200 transition hover:border-cyan-400/40 sm:w-auto sm:px-4"
              aria-label={
                admin.showOwnerForm.value
                  ? "Ocultar formulario"
                  : "Mostrar formulario"
              }
              title={
                admin.showOwnerForm.value
                  ? "Ocultar formulario"
                  : "Mostrar formulario"
              }
              onClick$={() => {
                admin.showOwnerForm.value = !admin.showOwnerForm.value;
              }}
            >
              <span class="text-lg leading-none">
                {admin.showOwnerForm.value ? "-" : "+"}
              </span>
              <span class="hidden sm:inline">
                {admin.showOwnerForm.value
                  ? "Ocultar formulario"
                  : "Mostrar formulario"}
              </span>
            </button>
          )}

          <div class="relative w-[132px] shrink-0 sm:w-40">
            <button
              type="button"
              class={[
                "flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-slate-950 px-3 text-left text-sm transition",
                viewSelectOpen.value
                  ? "border-cyan-400/60"
                  : "border-slate-800 hover:border-cyan-400/40",
              ]}
              aria-haspopup="listbox"
              aria-expanded={viewSelectOpen.value}
              onClick$={() => {
                viewSelectOpen.value = !viewSelectOpen.value;
              }}
            >
              <span class="min-w-0">
                <span class="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Exibir
                </span>
                <span class="block truncate font-black text-slate-100">
                  {selectedViewMode.label}
                </span>
              </span>

              <span class="shrink-0 text-slate-400">
                {viewSelectOpen.value ? "-" : "+"}
              </span>
            </button>

            {viewSelectOpen.value && (
              <div
                role="listbox"
                class="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-44 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-2xl shadow-slate-950/60"
              >
                {viewModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    role="option"
                    aria-selected={ownerViewMode.value === mode.value}
                    class={[
                      "flex w-full items-center justify-between gap-4 rounded-lg px-3 py-3 text-left text-sm transition",
                      ownerViewMode.value === mode.value
                        ? "bg-cyan-400 text-slate-950"
                        : "text-slate-200 hover:bg-slate-900",
                    ]}
                    onClick$={() => {
                      ownerViewMode.value = mode.value;
                      viewSelectOpen.value = false;
                    }}
                  >
                    <span class="font-black">{mode.label}</span>
                    <span
                      class={[
                        "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em]",
                        ownerViewMode.value === mode.value
                          ? "bg-slate-950 text-cyan-200"
                          : "bg-slate-800 text-slate-300",
                      ]}
                    >
                      Vista
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {admin.ownerTab.value === "services" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
            {admin.showOwnerForm.value && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <ServiceForm admin={admin} />
              </div>
            )}

            <div
              class={[
                "md:overflow-x-auto",
                !admin.showOwnerForm.value ? "lg:col-span-2" : "",
              ]}
            >
              <table
                class={[
                  tableClass,
                  modeTableClass,
                  widthClass("md:min-w-[520px]"),
                ]}
              >
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Item</th>
                    <th class="pb-3">Resumo</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredServices.map((service) => (
                      <tr key={service.id} class={tableRowClass}>
                        <td data-label="Item" class={tableCellClass}>
                          <div class="flex items-center gap-3 text-left">
                            {service.image_url ? (
                              <img
                                src={service.image_url}
                                alt={service.title}
                                width={56}
                                height={40}
                                class="h-10 w-14 rounded-lg object-cover"
                              />
                            ) : (
                              <div class="h-10 w-14 rounded-lg border border-slate-800 bg-slate-900" />
                            )}

                            <div>
                              <div class="font-semibold text-white">
                                {service.title}
                              </div>

                              <div class="mt-1 text-xs text-slate-500">
                                {service.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                          {service.short_description || "Sem descricao curta"}
                        </td>

                        <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                          {service.active ? "Publico" : "Oculto"}
                        </td>

                        <td data-label="Acoes" class={tableActionCellClass}>
                          <div class="flex flex-col items-end max-md:items-end">
                            <button
                              type="button"
                              class="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"
                              onClick$={() => {
                                admin.openServiceActionsId.value =
                                  admin.openServiceActionsId.value ===
                                  service.id
                                    ? ""
                                    : service.id;
                              }}
                            >
                              Acoes
                            </button>

                            {admin.openServiceActionsId.value ===
                              service.id && (
                              <div class="mt-2 grid min-w-36 gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl">
                                <button
                                  type="button"
                                  class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                  onClick$={() =>
                                    admin.showDetails$(
                                      "Detalhes do servico",
                                      [
                                        `Servico: ${service.title}`,
                                        `Slug: ${service.slug}`,
                                        `Estado: ${service.active ? "Publico" : "Oculto"}`,
                                        `Descricao: ${
                                          service.short_description ||
                                          "Sem descricao"
                                        }`,
                                      ].join("\n"),
                                      service.image_url,
                                    )
                                  }
                                >
                                  Detalhes
                                </button>

                                <button
                                  type="button"
                                  class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                  onClick$={() => admin.editService$(service)}
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                  onClick$={() =>
                                    admin.requestToggleContent$(
                                      "services",
                                      service.id,
                                      !service.active,
                                      service.title,
                                    )
                                  }
                                >
                                  {service.active ? "Desativar" : "Ativar"}
                                </button>

                                <button
                                  type="button"
                                  class="rounded-lg px-3 py-2 text-left text-xs font-bold text-red-200 hover:bg-red-400/10"
                                  onClick$={() =>
                                    admin.requestDeleteContent$(
                                      "services",
                                      service.id,
                                      service.title,
                                    )
                                  }
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {filteredServices.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhum servico encontrado.
                </div>
              )}
            </div>
          </div>
        )}

        {admin.ownerTab.value === "structures" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
            {admin.showOwnerForm.value && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <StructureOptionForm admin={admin} />
              </div>
            )}

            <div
              class={[
                "md:overflow-x-auto",
                !admin.showOwnerForm.value ? "lg:col-span-2" : "",
              ]}
            >
              <table
                class={[
                  tableClass,
                  modeTableClass,
                  widthClass("md:min-w-[560px]"),
                ]}
              >
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Item</th>
                    <th class="pb-3">Resumo</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredStructures.map((option) => (
                    <tr key={option.id} class={tableRowClass}>
                      <td data-label="Item" class={tableCellClass}>
                        <div class="flex items-center gap-3 text-left">
                          {option.image_url ? (
                            <img
                              src={option.image_url}
                              alt={option.title}
                              width={56}
                              height={40}
                              class="h-10 w-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div class="h-10 w-14 rounded-lg border border-slate-800 bg-slate-900" />
                          )}

                          <div>
                            <div class="font-semibold text-white">
                              {option.title}
                            </div>

                            <div class="mt-1 text-xs text-slate-500">
                              {option.structure}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                        <span>
                          {option.service_slug} /{" "}
                          {asNumber(
                            option.structure_cost_percentage,
                          ).toLocaleString("pt-MZ")}
                          %
                        </span>
                      </td>

                      <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                        {option.active ? "Publico" : "Oculto"}
                      </td>

                      <td data-label="Acoes" class={tableActionCellClass}>
                        <div class="flex flex-col items-end">
                          <button
                            type="button"
                            class="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"
                            onClick$={() => {
                              admin.openStructureActionsId.value =
                                admin.openStructureActionsId.value === option.id
                                  ? ""
                                  : option.id;
                            }}
                          >
                            Acoes
                          </button>

                          {admin.openStructureActionsId.value === option.id && (
                            <div class="mt-2 grid min-w-36 gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl">
                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                onClick$={() =>
                                  admin.showDetails$(
                                    "Detalhes da estrutura",
                                    [
                                      `Estrutura: ${option.title}`,
                                      `Codigo: ${option.structure}`,
                                      `Servico: ${option.service_slug}`,
                                      `Custo da estrutura: ${asNumber(
                                        option.structure_cost_percentage,
                                      ).toLocaleString("pt-MZ")}%`,
                                      `Descricao: ${
                                        option.description || "Sem descricao"
                                      }`,
                                    ].join("\n"),
                                    option.image_url,
                                  )
                                }
                              >
                                Detalhes
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                onClick$={() =>
                                  admin.editStructureOption$(option)
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                onClick$={() =>
                                  admin.requestToggleContent$(
                                    "service_structure_options",
                                    option.id,
                                    !option.active,
                                    option.title,
                                  )
                                }
                              >
                                {option.active ? "Desativar" : "Ativar"}
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-red-200 hover:bg-red-400/10"
                                onClick$={() =>
                                  admin.requestDeleteContent$(
                                    "service_structure_options",
                                    option.id,
                                    option.title,
                                  )
                                }
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStructures.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhuma estrutura encontrada.
                </div>
              )}
            </div>
          </div>
        )}

        {admin.ownerTab.value === "products" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
            {admin.showOwnerForm.value && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <ProductForm admin={admin} />
              </div>
            )}

            <div
              class={[
                "md:overflow-x-auto",
                !admin.showOwnerForm.value ? "lg:col-span-2" : "",
              ]}
            >
              <table
                class={[
                  tableClass,
                  modeTableClass,
                  widthClass("md:min-w-[560px]"),
                ]}
              >
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Item</th>
                    <th class="pb-3">Resumo</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} class={tableRowClass}>
                      <td data-label="Item" class={tableCellClass}>
                        <div class="flex items-center gap-3 text-left">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              width={56}
                              height={40}
                              class="h-10 w-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div class="h-10 w-14 rounded-lg border border-slate-800 bg-slate-900" />
                          )}

                          <div>
                            <div class="font-semibold text-white">
                              {product.name}
                            </div>

                            <div class="mt-1 text-xs text-slate-500">
                              {product.brand || "Sem marca"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                        <span>
                          {product.service_slug} /{" "}
                          {formatMoney(asNumber(product.unit_price))}
                        </span>
                      </td>

                      <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                        {product.active ? "Publico" : "Oculto"}
                      </td>

                      <td data-label="Acoes" class={tableActionCellClass}>
                        <div class="flex flex-col items-end">
                          <button
                            type="button"
                            class="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"
                            onClick$={() => {
                              admin.openProductActionsId.value =
                                admin.openProductActionsId.value === product.id
                                  ? ""
                                  : product.id;
                            }}
                          >
                            Acoes
                          </button>

                          {admin.openProductActionsId.value === product.id && (
                            <div class="mt-2 grid min-w-36 gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl">
                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                onClick$={() =>
                                  admin.showDetails$(
                                    "Detalhes do artigo",
                                    [
                                      `Artigo: ${product.name}`,
                                      `Servico: ${product.service_slug}`,
                                      `Marca: ${product.brand || "Sem marca"}`,
                                      `Estrutura: ${product.structure}`,
                                      `Preco unitario: ${formatMoney(
                                        asNumber(product.unit_price),
                                      )}`,
                                      `Estado: ${product.active ? "Publico" : "Oculto"}`,
                                    ].join("\n"),
                                    product.image_url,
                                  )
                                }
                              >
                                Detalhes
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                onClick$={() => admin.editProduct$(product)}
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                onClick$={() =>
                                  admin.requestToggleContent$(
                                    "service_products",
                                    product.id,
                                    !product.active,
                                    product.name,
                                  )
                                }
                              >
                                {product.active ? "Desativar" : "Ativar"}
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-red-200 hover:bg-red-400/10"
                                onClick$={() =>
                                  admin.requestDeleteContent$(
                                    "service_products",
                                    product.id,
                                    product.name,
                                  )
                                }
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhum artigo encontrado.
                </div>
              )}
            </div>
          </div>
        )}

        {admin.ownerTab.value === "templates" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
            {admin.showOwnerForm.value && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <TemplateForm admin={admin} />
              </div>
            )}

            <div
              class={[
                "md:overflow-x-auto",
                !admin.showOwnerForm.value ? "lg:col-span-2" : "",
              ]}
            >
              <table
                class={[
                  tableClass,
                  modeTableClass,
                  widthClass("md:min-w-[560px]"),
                ]}
              >
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Item</th>
                    <th class="pb-3">Resumo</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredTemplates.map((template) => {
                    const fields = admin.ownerTemplateFields.value.filter(
                      (field) => field.template_id === template.id,
                    );

                    const items = admin.ownerTemplateItems.value.filter(
                      (item) => item.template_id === template.id,
                    );
                    const laborProduct = template.labor_product_id
                      ? admin.ownerProducts.value.find(
                          (product) =>
                            product.id === template.labor_product_id,
                        )
                      : null;
                    const matchingStructure =
                      admin.ownerStructureOptions.value.find(
                        (option) =>
                          option.service_slug === template.service_slug &&
                          option.structure === template.structure,
                      );
                    const structurePercentage =
                      asNumber(template.structure_cost_percentage) ||
                      asNumber(
                        matchingStructure?.structure_cost_percentage ?? 0,
                      );
                    const firstProductImage =
                      items
                        .map((item) =>
                          admin.ownerProducts.value.find(
                            (product) => product.id === item.product_id,
                          ),
                        )
                        .find((product) => product?.image_url)?.image_url ?? "";
                    const normalItems = items.filter(
                      (item) => item.product_id !== template.labor_product_id,
                    );
                    const laborItems = items.filter(
                      (item) => item.product_id === template.labor_product_id,
                    );
                    const orderedItems = [...normalItems, ...laborItems];
                    const itemsSubtotal = orderedItems.reduce(
                      (total, item) =>
                        total +
                        asNumber(item.default_quantity) *
                          asNumber(item.unit_price),
                      0,
                    );
                    const fallbackLaborTotal =
                      laborItems.length > 0
                        ? 0
                        : asNumber(template.labor_unit_price);
                    const laborTotal =
                      laborItems.reduce(
                        (total, item) =>
                          total +
                          asNumber(item.default_quantity) *
                            asNumber(item.unit_price),
                        0,
                      ) + fallbackLaborTotal;
                    const priceWithoutPercentage =
                      itemsSubtotal + fallbackLaborTotal;
                    const priceWithoutLabor = Math.max(
                      0,
                      priceWithoutPercentage - laborTotal,
                    );
                    const quotePrice =
                      priceWithoutPercentage *
                      (1 + structurePercentage / 100);
                    const itemLines =
                      orderedItems
                        .map((item, index) => {
                          const quantity = asNumber(item.default_quantity);
                          const unitPrice = asNumber(item.unit_price);
                          const total = quantity * unitPrice;
                          const isLabor =
                            item.product_id === template.labor_product_id;

                          return `${index + 1}. ${isLabor ? "Mao de obra - " : ""}${item.name} | Qtd: ${quantity.toLocaleString("pt-MZ")} ${item.unit || "un"} | Total: ${formatMoney(total, template.currency)}`;
                        })
                        .join("\n") || "Sem artigos preparados";

                    return (
                      <tr key={template.id} class={tableRowClass}>
                        <td data-label="Item" class={tableCellClass}>
                          <div class="font-semibold text-white">
                            {template.title}
                          </div>

                          <div class="mt-1 text-xs text-slate-500">
                            Campos: {fields.length} / Artigos: {items.length}
                          </div>
                        </td>

                        <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                          <span>
                            {template.service_slug} / {template.structure} /{" "}
                            {formatMoney(
                              asNumber(template.labor_unit_price),
                              template.currency,
                            )}
                          </span>
                        </td>

                        <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                          {template.active ? "Publico" : "Oculto"}
                        </td>

                        <td data-label="Acoes" class={tableActionCellClass}>
                          <div class="flex flex-col items-end">
                            <button
                              type="button"
                              class="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"
                              onClick$={() => {
                                admin.openTemplateActionsId.value =
                                  admin.openTemplateActionsId.value ===
                                  template.id
                                    ? ""
                                    : template.id;
                              }}
                            >
                              Acoes
                            </button>

                            {admin.openTemplateActionsId.value ===
                              template.id && (
                              <div class="mt-2 grid min-w-36 gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl">
                                <button
                                  type="button"
                                  class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                  onClick$={() =>
                                    admin.showDetails$(
                                      "Detalhes da cotacao padrao",
                                      [
                                        `Cotacao padrao: ${template.title}`,
                                        `Servico: ${template.service_slug}`,
                                        `Estrutura: ${template.structure}`,
                                        `Estado: ${template.active ? "Publico" : "Oculto"}`,
                                        `Percentagem da estrutura: ${structurePercentage.toLocaleString("pt-MZ")}%`,
                                        `Preco da cotacao: ${formatMoney(quotePrice, template.currency)}`,
                                        `Mao de obra: ${
                                          laborProduct?.name ||
                                          laborItems[0]?.name ||
                                          "Nao definida"
                                        } - ${formatMoney(asNumber(
                                          template.labor_unit_price,
                                        ), template.currency)}`,
                                        `Artigos da cotacao:\n${itemLines}`,
                                        `Notas: ${
                                          template.notes || "Sem notas"
                                        }`,
                                        `Valor sem percentagem: ${formatMoney(priceWithoutPercentage, template.currency)}`,
                                        `Valor sem mao de obra: ${formatMoney(priceWithoutLabor, template.currency)}`,
                                      ].join("\n"),
                                      firstProductImage,
                                    )
                                  }
                                >
                                  Detalhes
                                </button>

                                <button
                                  type="button"
                                  class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                  onClick$={() =>
                                    admin.editTemplate$(template)
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                  onClick$={() =>
                                    admin.requestToggleContent$(
                                      "service_quote_templates",
                                      template.id,
                                      !template.active,
                                      template.title,
                                    )
                                  }
                                >
                                  {template.active ? "Desativar" : "Ativar"}
                                </button>

                                <button
                                  type="button"
                                  class="rounded-lg px-3 py-2 text-left text-xs font-bold text-red-200 hover:bg-red-400/10"
                                  onClick$={() =>
                                    admin.requestDeleteContent$(
                                      "service_quote_templates",
                                      template.id,
                                      template.title,
                                    )
                                  }
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredTemplates.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhuma cotacao padrao encontrada.
                </div>
              )}
            </div>
          </div>
        )}

        {admin.ownerTab.value === "promotions" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
            {admin.showOwnerForm.value && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <PromotionForm admin={admin} />
              </div>
            )}

            <div
              class={[
                "md:overflow-x-auto",
                !admin.showOwnerForm.value ? "lg:col-span-2" : "",
              ]}
            >
              <table
                class={[
                  tableClass,
                  modeTableClass,
                  widthClass("md:min-w-[560px]"),
                ]}
              >
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Item</th>
                    <th class="pb-3">Resumo</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredPromotions.map((promotion) => (
                    <tr key={promotion.id} class={tableRowClass}>
                      <td data-label="Item" class={tableCellClass}>
                        <div class="flex items-center gap-3 text-left">
                          {promotion.image ? (
                            <img
                              src={promotion.image}
                              alt={promotion.title}
                              width={56}
                              height={40}
                              class="h-10 w-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div class="h-10 w-14 rounded-lg border border-slate-800 bg-slate-900" />
                          )}

                          <div>
                            <div class="font-semibold text-white">
                              {promotion.title}
                            </div>

                            <div class="mt-1 text-xs text-slate-500">
                              {promotion.slug ?? "Sem slug"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                        <span>
                          {promotion.discount_label || "Sem desconto"} /{" "}
                          {promotion.service_slug ?? "Geral"}
                        </span>
                      </td>

                      <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                        {promotion.active ? "Publico" : "Oculto"}
                      </td>

                      <td data-label="Acoes" class={tableActionCellClass}>
                        <div class="flex flex-col items-end">
                          <button
                            type="button"
                            class="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"
                            onClick$={() => {
                              admin.openPromotionActionsId.value =
                                admin.openPromotionActionsId.value ===
                                promotion.id
                                  ? ""
                                  : promotion.id;
                            }}
                          >
                            Acoes
                          </button>

                          {admin.openPromotionActionsId.value ===
                            promotion.id && (
                            <div class="mt-2 grid min-w-36 gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl">
                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                onClick$={() =>
                                  admin.showDetails$(
                                    "Detalhes da promocao",
                                    [
                                      `Promocao: ${promotion.title}`,
                                      `Slug: ${promotion.slug ?? "Sem slug"}`,
                                      `Servico: ${
                                        promotion.service_slug ?? "Geral"
                                      }`,
                                      `Desconto: ${
                                        promotion.discount_label ||
                                        "Sem desconto"
                                      }`,
                                      `Fim: ${
                                        promotion.end_date ??
                                        "Sem data definida"
                                      }`,
                                      `Cotacao padrao: ${
                                        promotion.quote_template_id ??
                                        "Nao ligada"
                                      }`,
                                    ].join("\n"),
                                    promotion.image,
                                  )
                                }
                              >
                                Detalhes
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                onClick$={() =>
                                  admin.editPromotion$(promotion)
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-800"
                                onClick$={() =>
                                  admin.requestToggleContent$(
                                    "promotions",
                                    promotion.id,
                                    !promotion.active,
                                    promotion.title,
                                  )
                                }
                              >
                                {promotion.active ? "Desativar" : "Ativar"}
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-red-200 hover:bg-red-400/10"
                                onClick$={() =>
                                  admin.requestDeleteContent$(
                                    "promotions",
                                    promotion.id,
                                    promotion.title,
                                  )
                                }
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPromotions.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhuma promocao encontrada.
                </div>
              )}
            </div>
          </div>
        )}

        {admin.ownerTab.value === "customQuotes" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 class="text-lg font-black text-white">
                    Cotacao personalizada
                  </h2>
                  <p class="mt-1 text-sm text-slate-400">
                    Monte a cotacao com cliente e artigos ja cadastrados.
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class={[
                      "rounded-xl border px-4 py-2 text-xs font-black transition",
                      admin.customQuoteTableOpen.value
                        ? "border-cyan-400/40 bg-cyan-400 text-slate-950"
                        : "border-slate-700 text-slate-200 hover:border-cyan-400/50",
                    ]}
                    onClick$={() => {
                      admin.customQuoteTableOpen.value =
                        !admin.customQuoteTableOpen.value;
                    }}
                  >
                    {admin.customQuoteTableOpen.value
                      ? "Ocultar tabela"
                      : "Ver tabela"}
                  </button>

                  <button
                    type="button"
                    class={[
                      "rounded-xl border px-4 py-2 text-xs font-black transition",
                      admin.customQuoteFormOpen.value
                        ? "border-slate-700 text-slate-200 hover:border-cyan-400/50"
                        : "border-cyan-400/40 bg-cyan-400 text-slate-950",
                    ]}
                    onClick$={() => {
                      admin.customQuoteFormOpen.value =
                        !admin.customQuoteFormOpen.value;
                    }}
                  >
                    {admin.customQuoteFormOpen.value
                      ? "Ocultar formulario"
                      : "Nova cotacao"}
                  </button>

                  {admin.customQuoteFormOpen.value && (
                  <div class="flex rounded-xl border border-slate-800 bg-slate-900 p-1">
                    {(["registered", "temporary"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      class={[
                        "rounded-lg px-3 py-2 text-xs font-black transition",
                        admin.customQuoteDraft.customerMode === mode
                          ? "bg-cyan-400 text-slate-950"
                          : "text-slate-300 hover:bg-slate-800",
                      ]}
                      onClick$={() => {
                        admin.customQuoteDraft.customerMode = mode;
                        admin.customQuoteDraft.profileId = "";
                        if (mode === "temporary") {
                          admin.customQuoteDraft.customerName = "";
                          admin.customQuoteDraft.contacto = "";
                          admin.customQuoteDraft.morada = "";
                        }
                      }}
                    >
                      {mode === "registered" ? "Cadastrado" : "Temporario"}
                    </button>
                    ))}
                  </div>
                  )}
                </div>
              </div>

              {admin.customQuoteFormOpen.value && (
                <>
              <div class="mt-5 grid gap-4 md:grid-cols-2">
                {admin.customQuoteDraft.customerMode === "registered" && (
                  <label class="md:col-span-2">
                    <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Cliente cadastrado
                    </span>
                    <select
                      value={admin.customQuoteDraft.profileId}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      onChange$={(event) =>
                        admin.selectCustomQuoteCustomer$(
                          (event.target as HTMLSelectElement).value,
                        )
                      }
                    >
                      <option value="">Selecionar cliente</option>
                      {admin.ownerCustomers.value.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.full_name ||
                            customer.email ||
                            customer.phone ||
                            "Cliente sem nome"}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label>
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Nome do cliente
                  </span>
                  <input
                    value={admin.customQuoteDraft.customerName}
                    class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onInput$={(event) => {
                      admin.customQuoteDraft.customerName = (
                        event.target as HTMLInputElement
                      ).value;
                    }}
                  />
                </label>

                <label>
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Contacto
                  </span>
                  <input
                    value={admin.customQuoteDraft.contacto}
                    class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onInput$={(event) => {
                      admin.customQuoteDraft.contacto = (
                        event.target as HTMLInputElement
                      ).value;
                    }}
                  />
                </label>

                <label>
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Morada
                  </span>
                  <input
                    value={admin.customQuoteDraft.morada}
                    class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onInput$={(event) => {
                      admin.customQuoteDraft.morada = (
                        event.target as HTMLInputElement
                      ).value;
                    }}
                  />
                </label>

                <label>
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    NUIT
                  </span>
                  <input
                    value={admin.customQuoteDraft.nuit}
                    class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onInput$={(event) => {
                      admin.customQuoteDraft.nuit = (
                        event.target as HTMLInputElement
                      ).value;
                    }}
                  />
                </label>

                <label>
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Servico
                  </span>
                  <select
                    value={admin.customQuoteDraft.serviceSlug}
                    class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onChange$={(event) => {
                      admin.customQuoteDraft.serviceSlug = (
                        event.target as HTMLSelectElement
                      ).value;
                    }}
                  >
                    <option value="">Todos os servicos</option>
                    {admin.ownerServices.value.map((service) => (
                      <option key={service.id} value={service.slug}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label class="md:col-span-2">
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Notas
                  </span>
                  <textarea
                    value={admin.customQuoteDraft.notes}
                    rows={3}
                    class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onInput$={(event) => {
                      admin.customQuoteDraft.notes = (
                        event.target as HTMLTextAreaElement
                      ).value;
                    }}
                  />
                </label>
              </div>
                </>
              )}
            </div>

            {admin.customQuoteFormOpen.value && (
            <aside class="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                Resumo
              </p>
              <div class="mt-4 space-y-3 text-sm">
                <div class="flex items-center justify-between gap-3 text-slate-300">
                  <span>Artigos</span>
                  <strong class="text-white">
                    {admin.customQuoteDraft.items.length}
                  </strong>
                </div>
                <div class="flex items-center justify-between gap-3 text-slate-300">
                  <span>Subtotal</span>
                  <strong class="text-white">
                    {formatMoney(customQuoteSubtotal)}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                class="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-cyan-400 px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
                onClick$={() => {
                  admin.customQuoteProductPickerOpen.value = true;
                }}
              >
                Selecionar artigos
              </button>

              <button
                type="button"
                class="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-700 px-4 text-sm font-bold text-slate-200 transition hover:border-cyan-400/50"
                onClick$={() => admin.saveCustomQuote$()}
              >
                Guardar cotacao
              </button>
            </aside>
            )}

            {admin.customQuoteFormOpen.value && (
            <div class="lg:col-span-2">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 class="text-sm font-black uppercase tracking-[0.12em] text-slate-300">
                  Artigos da cotacao
                </h3>
                <button
                  type="button"
                  class="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-400/50"
                  onClick$={() => {
                    admin.customQuoteProductPickerOpen.value = true;
                  }}
                >
                  Adicionar
                </button>
              </div>

              <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {admin.customQuoteDraft.items.map((item) => (
                  <article
                    key={item.id}
                    class="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        width={360}
                        height={190}
                        class="h-36 w-full object-cover"
                      />
                    ) : (
                      <div class="h-36 w-full bg-slate-900" />
                    )}

                    <div class="p-4">
                      <h4 class="font-black text-white">{item.name}</h4>
                      <p class="mt-1 text-xs text-slate-500">
                        {item.category || "Produto"} / {item.structure}
                      </p>

                      <div class="mt-4 grid grid-cols-[1fr_auto] items-end gap-3">
                        <label>
                          <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            Quantidade
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            class="mt-2 h-10 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                            onInput$={(event) =>
                              admin.updateCustomQuoteItemQuantity$(
                                item.id,
                                Number((event.target as HTMLInputElement).value),
                              )
                            }
                          />
                        </label>

                        <button
                          type="button"
                          class="h-10 rounded-xl border border-red-400/30 px-3 text-xs font-bold text-red-200 transition hover:bg-red-400/10"
                          onClick$={() =>
                            admin.removeCustomQuoteItem$(item.id)
                          }
                        >
                          Remover
                        </button>
                      </div>

                      <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-800 pt-3 text-sm">
                        <span class="text-slate-400">
                          {formatMoney(asNumber(item.unitPrice))} /{" "}
                          {item.unit}
                        </span>
                        <strong class="text-white">
                          {formatMoney(
                            asNumber(item.unitPrice) * asNumber(item.quantity),
                          )}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {admin.customQuoteDraft.items.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhum artigo selecionado para esta cotacao.
                </div>
              )}
            </div>
            )}

            {admin.customQuoteTableOpen.value && (
              <div class="lg:col-span-2">
                <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h3 class="text-sm font-black uppercase tracking-[0.12em] text-slate-300">
                    Tabela de cotacoes personalizadas
                  </h3>
                  <span class="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-black text-slate-300">
                    {filteredCustomQuotes.length} registo(s)
                  </span>
                </div>

                {admin.customQuoteLastCreatedId.value && (
                  <div class="mb-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-100">
                    {lastCreatedCustomQuote
                      ? `${lastCreatedCustomQuote.quote_number} de ${lastCreatedCustomQuote.customer_name} foi inserida na tabela e destacada abaixo.`
                      : "Cotacao inserida na tabela e destacada abaixo."}
                  </div>
                )}

                <div class="md:overflow-x-auto">
                  <table
                    class={[
                      tableClass,
                      modeTableClass,
                      widthClass("md:min-w-[680px]"),
                    ]}
                  >
                    <thead class={tableHeadClass}>
                      <tr>
                        <th class="pb-3">Item</th>
                        <th class="pb-3">Cliente</th>
                        <th class="pb-3">Resumo</th>
                        <th class="pb-3">Estado</th>
                        <th class="pb-3 text-right">Acoes</th>
                      </tr>
                    </thead>

                    <tbody class={tableBodyClass}>
                      {filteredCustomQuotes.map((quote) => {
                        const items = Array.isArray(quote.selected_items)
                          ? quote.selected_items
                          : [];
                        const itemLines =
                          items
                            .map((item, index) => {
                              const row = item as {
                                name?: string;
                                quantity?: number;
                                unit?: string;
                                unitPrice?: number;
                              };
                              const quantity = asNumber(row.quantity || 1);
                              const unitPrice = asNumber(row.unitPrice || 0);

                              return `${index + 1}. ${row.name || "Artigo"} | Qtd: ${quantity.toLocaleString("pt-MZ")} ${row.unit || "Un"} | Total: ${formatMoney(quantity * unitPrice, quote.currency)}`;
                            })
                            .join("\n") || "Sem artigos guardados";

                        return (
                          <tr
                            key={quote.id}
                            class={[
                              tableRowClass,
                              quote.id === admin.customQuoteLastCreatedId.value
                                ? "bg-emerald-400/10 ring-1 ring-emerald-300/40"
                                : "",
                            ]}
                          >
                            <td data-label="Item" class={tableCellClass}>
                              <div class="font-semibold text-white">
                                {quote.quote_number}
                              </div>
                              <div class="mt-1 text-xs text-slate-500">
                                {new Date(quote.created_at).toLocaleDateString(
                                  "pt-MZ",
                                )}
                              </div>
                            </td>

                            <td data-label="Cliente" class={tableCellClass}>
                              <div class="font-semibold text-white">
                                {quote.customer_name || "Cliente"}
                              </div>
                              <div class="mt-1 text-xs text-slate-500">
                                {quote.customer_contact || "Sem contacto"}
                              </div>
                            </td>

                            <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                              {quote.service_slug ?? "Todos os servicos"} /{" "}
                              {formatMoney(asNumber(quote.total), quote.currency)} /{" "}
                              {items.length} artigo(s)
                            </td>

                            <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                              {quote.status}
                            </td>

                            <td data-label="Acoes" class={tableActionCellClass}>
                              <button
                                type="button"
                                class="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"
                                onClick$={() =>
                                  admin.showDetails$(
                                    "Detalhes da cotacao personalizada",
                                    [
                                      `Cotacao: ${quote.quote_number}`,
                                      `Cliente: ${quote.customer_name || "Cliente"}`,
                                      `Tipo: ${quote.customer_type}`,
                                      `Contacto: ${quote.customer_contact || "Sem contacto"}`,
                                      `Morada: ${quote.customer_address || "Sem morada"}`,
                                      `NUIT: ${quote.customer_nuit || "Sem NUIT"}`,
                                      `Servico: ${quote.service_slug ?? "Todos os servicos"}`,
                                      `Estado: ${quote.status}`,
                                      `Total: ${formatMoney(asNumber(quote.total), quote.currency)}`,
                                      `Artigos da cotacao:\n${itemLines}`,
                                      `Notas: ${quote.notes || "Sem notas"}`,
                                    ].join("\n"),
                                  )
                                }
                              >
                                Detalhes
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredCustomQuotes.length === 0 && (
                  <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                    Nenhuma cotacao personalizada guardada.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {admin.customQuoteProductPickerOpen.value && (
          <div class="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <div class="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
                <div>
                  <h3 class="text-lg font-black text-white">
                    Selecionar artigos
                  </h3>
                  <p class="mt-1 text-sm text-slate-400">
                    Escolha artigos cadastrados e ajuste a quantidade.
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Fechar"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-200 transition hover:border-cyan-400/50"
                  onClick$={() => {
                    admin.customQuoteProductPickerOpen.value = false;
                  }}
                >
                  x
                </button>
              </div>

              <div class="border-b border-slate-800 p-5">
                <input
                  value={admin.customQuoteProductSearch.value}
                  placeholder="Pesquisar artigo"
                  class="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                  onInput$={(event) => {
                    admin.customQuoteProductSearch.value = (
                      event.target as HTMLInputElement
                    ).value;
                  }}
                />
              </div>

              <div class="max-h-[58vh] overflow-y-auto p-5">
                <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {customQuoteProducts.map((product) => {
                    const selectedItem = admin.customQuoteDraft.items.find(
                      (item) => item.id === product.id,
                    );

                    return (
                      <article
                        key={product.id}
                        class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70"
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            width={360}
                            height={170}
                            class="h-32 w-full object-cover"
                          />
                        ) : (
                          <div class="h-32 w-full bg-slate-800" />
                        )}

                        <div class="p-4">
                          <h4 class="font-black text-white">{product.name}</h4>
                          <p class="mt-1 text-xs text-slate-500">
                            {product.category || "Produto"} /{" "}
                            {product.service_slug}
                          </p>

                          <div class="mt-3 flex items-center justify-between gap-3 text-sm">
                            <span class="text-slate-400">
                              {formatMoney(asNumber(product.unit_price))} /{" "}
                              {product.unit || "Un"}
                            </span>
                            {!selectedItem && (
                              <button
                                type="button"
                                class="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-300"
                                onClick$={() =>
                                  admin.addCustomQuoteProduct$(product.id)
                                }
                              >
                                Adicionar
                              </button>
                            )}
                          </div>

                          {selectedItem && (
                            <div class="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
                              <label>
                                <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                  Qtd
                                </span>
                                <input
                                  type="number"
                                  min={1}
                                  value={selectedItem.quantity}
                                  class="mt-2 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                                  onInput$={(event) =>
                                    admin.updateCustomQuoteItemQuantity$(
                                      product.id,
                                      Number(
                                        (event.target as HTMLInputElement).value,
                                      ),
                                    )
                                  }
                                />
                              </label>

                              <button
                                type="button"
                                class="h-10 rounded-xl border border-red-400/30 px-3 text-xs font-bold text-red-200 transition hover:bg-red-400/10"
                                onClick$={() =>
                                  admin.removeCustomQuoteItem$(product.id)
                                }
                              >
                                Tirar
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {customQuoteProducts.length === 0 && (
                  <div class="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
                    Nenhum artigo cadastrado encontrado para este filtro.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {admin.ownerTab.value === "quotes" && (
          <div class="mt-5 md:overflow-x-auto">
            <table
              class={[
                tableClass,
                modeTableClass,
                widthClass("md:min-w-[560px]"),
              ]}
            >
              <thead class={tableHeadClass}>
                <tr>
                  <th class="pb-3">Item</th>
                  <th class="pb-3">Resumo</th>
                  <th class="pb-3">Estado</th>
                  <th class="pb-3 text-right">Acoes</th>
                </tr>
              </thead>

              <tbody class={tableBodyClass}>
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} class={tableRowClass}>
                    <td data-label="Item" class={tableCellClass}>
                      <div class="font-semibold text-white">
                        {quote.quote_number}
                      </div>

                      <div class="mt-1 text-xs text-slate-500">
                        {new Date(quote.created_at).toLocaleDateString("pt-MZ")}
                      </div>
                    </td>

                    <td data-label="Resumo" class={tableCellClass}>
                      <div class="font-semibold text-white">
                        {quote.profiles?.full_name ?? "Cliente"}
                      </div>

                      <div class="mt-1 text-xs text-slate-500">
                        {quote.profiles?.phone ??
                          quote.profiles?.email ??
                          "Sem contacto"}
                      </div>
                      <div class="mt-1 text-xs text-slate-500">
                        {quote.service_slug ?? "Nao definido"} /{" "}
                        {formatMoney(asNumber(quote.total), quote.currency)}
                      </div>
                    </td>

                    <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                      {admin.drafts[quote.id]?.status ?? quote.status}
                    </td>

                    <td data-label="Acoes" class={tableActionCellClass}>
                      <div class="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          class="rounded-lg border border-cyan-400/40 px-3 py-2 text-xs font-bold text-cyan-100"
                          onClick$={() => admin.openQuoteProcedure$(quote.id)}
                        >
                          Proceder
                        </button>

                        <button
                          type="button"
                          class="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"
                          onClick$={() =>
                            admin.showDetails$(
                              "Detalhes da solicitacao",
                              [
                                `Cotacao: ${quote.quote_number}`,
                                `Cliente: ${
                                  quote.profiles?.full_name ?? "Cliente"
                                }`,
                                `Email: ${quote.profiles?.email ?? "Sem email"}`,
                                `Telefone: ${
                                  quote.profiles?.phone ?? "Sem telefone"
                                }`,
                                `Cidade: ${quote.profiles?.city ?? "Sem cidade"}`,
                                `Servico: ${
                                  quote.service_slug ?? "Nao definido"
                                }`,
                                `Estado: ${admin.drafts[quote.id]?.status ?? quote.status}`,
                                `Total: ${formatMoney(
                                  asNumber(quote.total),
                                  quote.currency,
                                )}`,
                                `Tecnico: ${
                                  quote.technician || "Ainda nao atribuido"
                                }`,
                                `Proximo passo: ${
                                  quote.next_step || "Sem proximo passo"
                                }`,
                                `Previsao: ${
                                  quote.estimated_completion ??
                                  "Sem previsao definida"
                                }`,
                              ].join("\n"),
                            )
                          }
                        >
                          Detalhes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredQuotes.length === 0 && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                Nenhuma solicitacao encontrada.
              </div>
            )}
          </div>
        )}
      </section>

      {admin.quoteProcedureOpen.value && (
        <div class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Fechar"
            class="absolute inset-0"
            onClick$={admin.closeQuoteProcedure$}
          />

          <section class="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
                  Proceder solicitacao
                </p>
                <h3 class="mt-2 text-xl font-black text-white">
                  {procedureQuote?.quote_number ?? "Cotacao"}
                </h3>
                <p class="mt-1 text-sm text-slate-400">
                  {procedureQuote?.profiles?.full_name ?? "Cliente"} /{" "}
                  {procedureQuote?.service_slug ?? "Servico"}
                </p>
              </div>

              <button
                type="button"
                class="rounded-full border border-slate-700 px-3 py-2 text-sm font-bold text-slate-300"
                onClick$={admin.closeQuoteProcedure$}
              >
                X
              </button>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <label class="block">
                <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Tecnico operador
                </span>
                <select
                  value={admin.quoteProcedureOperatorId.value}
                  class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none"
                  onChange$={(event) => {
                    admin.quoteProcedureOperatorId.value = (
                      event.target as HTMLSelectElement
                    ).value;
                  }}
                >
                  <option value="">Escolha o operador</option>
                  {admin.ownerOperators.value.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.full_name ||
                        operator.email ||
                        operator.phone ||
                        "Operador Bitoll"}
                    </option>
                  ))}
                </select>
              </label>

              <label class="block">
                <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Primeiro passo
                </span>
                <select
                  value={admin.quoteProcedureStepIndex.value}
                  class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none"
                  onChange$={(event) => {
                    admin.quoteProcedureStepIndex.value = Number(
                      (event.target as HTMLSelectElement).value,
                    );
                  }}
                >
                  {procedureSteps.map((step, index) => (
                    <option key={`${index}-${step}`} value={index}>
                      {step}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div class="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Passos desta estrutura
              </p>
              <ol class="mt-3 space-y-2 text-sm text-slate-300">
                {procedureSteps.map((step, index) => (
                  <li key={`step-${index}-${step}`}>
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>
            </div>

            <div class="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                class="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
                onClick$={admin.closeQuoteProcedure$}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
                onClick$={admin.saveQuoteProcedure$}
              >
                Guardar procedimento
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
});
