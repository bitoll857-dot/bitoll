import { component$ } from "@builder.io/qwik";

import type { AdminPanelState } from "../hooks/useAdminPanel";
import type { OwnerTab } from "../types/admin.types";
import { asNumber } from "../utils/admin.utils";

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

const tabs: { value: OwnerTab; label: string }[] = [
  { value: "services", label: "Servicos" },
  { value: "structures", label: "Estruturas" },
  { value: "products", label: "Artigos" },
  { value: "templates", label: "Cotacoes padrao" },
  { value: "promotions", label: "Promocoes" },
  { value: "quotes", label: "Solicitacoes" },
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
  const searchTerm = admin.ownerSearch.value.trim().toLowerCase();

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

  return (
    <>
      <div class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
        <p class="text-sm font-semibold text-cyan-100">Sessao admin ativa</p>

        <p class="mt-1 break-words text-sm text-cyan-100/70">
          {admin.authUser.value?.name} / {admin.authUser.value?.email} / papel{" "}
          {admin.adminAccess.value.role}
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {admin.metrics.value.map((metric) => (
          <article
            key={metric.label}
            class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {metric.label}
            </p>

            <p class="mt-3 text-3xl font-black text-white">{metric.value}</p>
          </article>
        ))}
      </div>

      <section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div class="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              class={[
                "rounded-xl border px-4 py-2 text-sm font-bold transition",
                admin.ownerTab.value === tab.value
                  ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-100"
                  : "border-slate-800 bg-slate-950 text-slate-300 hover:border-cyan-400/30",
              ]}
              onClick$={() => {
                admin.ownerTab.value = tab.value;
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div class="mt-4 flex flex-wrap gap-3">
          <input
            value={admin.ownerSearch.value}
            placeholder="Pesquisar nesta area"
            class="h-11 min-w-[220px] flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
            onInput$={(event) => {
              admin.ownerSearch.value = (
                event.target as HTMLInputElement
              ).value;
            }}
          />

          {admin.ownerTab.value !== "quotes" && (
            <button
              type="button"
              class="rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200"
              onClick$={() => {
                admin.showOwnerForm.value = !admin.showOwnerForm.value;
              }}
            >
              {admin.showOwnerForm.value
                ? "Ocultar formulario"
                : "Mostrar formulario"}
            </button>
          )}
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
              <table class={[tableClass, "md:min-w-[560px]"]}>
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Servico</th>
                    <th class="pb-3">Imagem</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredServices.map((service) => (
                      <tr key={service.id} class={tableRowClass}>
                        <td data-label="Servico" class={tableCellClass}>
                          <div class="font-semibold text-white">
                            {service.title}
                          </div>

                          <div class="mt-1 text-xs text-slate-500">
                            {service.slug}
                          </div>
                        </td>

                        <td data-label="Imagem" class={[tableCellClass, "text-slate-400"]}>
                          {service.image_url ? (
                            <img
                              src={service.image_url}
                              alt={service.title}
                              width={56}
                              height={40}
                              class="h-10 w-14 rounded-lg object-cover"
                            />
                          ) : (
                            <span class="text-xs text-slate-500">
                              Sem imagem
                            </span>
                          )}
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
                                        `Descricao: ${
                                          service.short_description ||
                                          "Sem descricao"
                                        }`,
                                      ].join("\n"),
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
                                    admin.toggleContent$(
                                      "services",
                                      service.id,
                                      !service.active,
                                    )
                                  }
                                >
                                  {service.active ? "Desativar" : "Ativar"}
                                </button>

                                <button
                                  type="button"
                                  class="rounded-lg px-3 py-2 text-left text-xs font-bold text-red-200 hover:bg-red-400/10"
                                  onClick$={() =>
                                    admin.deleteContent$("services", service.id)
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
              <table class={[tableClass, "md:min-w-[680px]"]}>
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Estrutura</th>
                    <th class="pb-3">Imagem</th>
                    <th class="pb-3">Servico</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredStructures.map((option) => (
                    <tr key={option.id} class={tableRowClass}>
                      <td data-label="Estrutura" class={tableCellClass}>
                        <div class="font-semibold text-white">
                          {option.title}:{" "}
                          {asNumber(
                            option.structure_cost_percentage,
                          ).toLocaleString("pt-MZ")}
                          %
                        </div>

                        <div class="mt-1 text-xs text-slate-500">
                          {option.structure}
                        </div>
                      </td>

                      <td data-label="Imagem" class={[tableCellClass, "text-slate-400"]}>
                        {option.image_url ? (
                          <img
                            src={option.image_url}
                            alt={option.title}
                            width={56}
                            height={40}
                            class="h-10 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <span class="text-xs text-slate-500">
                            Sem imagem
                          </span>
                        )}
                      </td>

                      <td data-label="Servico" class={[tableCellClass, "text-slate-300"]}>
                        {option.service_slug}
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
                                  admin.toggleContent$(
                                    "service_structure_options",
                                    option.id,
                                    !option.active,
                                  )
                                }
                              >
                                {option.active ? "Desativar" : "Ativar"}
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-red-200 hover:bg-red-400/10"
                                onClick$={() =>
                                  admin.deleteContent$(
                                    "service_structure_options",
                                    option.id,
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
              <table class={[tableClass, "md:min-w-[620px]"]}>
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Artigo</th>
                    <th class="pb-3">Imagem</th>
                    <th class="pb-3">Servico</th>
                    <th class="pb-3">Preco</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} class={tableRowClass}>
                      <td data-label="Artigo" class={tableCellClass}>
                        <div class="font-semibold text-white">
                          {product.name}
                        </div>

                        <div class="mt-1 text-xs text-slate-500">
                          {product.brand || "Sem marca"}
                        </div>
                      </td>

                      <td data-label="Imagem" class={[tableCellClass, "text-slate-400"]}>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            width={56}
                            height={40}
                            class="h-10 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <span class="text-xs text-slate-500">
                            Sem imagem
                          </span>
                        )}
                      </td>

                      <td data-label="Servico" class={[tableCellClass, "text-slate-300"]}>
                        {product.service_slug}
                      </td>

                      <td data-label="Preco" class={[tableCellClass, "text-slate-300"]}>
                        {asNumber(product.unit_price).toLocaleString("pt-MZ")}{" "}
                        MZN
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
                                      `Preco unitario: ${asNumber(
                                        product.unit_price,
                                      ).toLocaleString("pt-MZ")} MZN`,
                                    ].join("\n"),
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
                                  admin.toggleContent$(
                                    "service_products",
                                    product.id,
                                    !product.active,
                                  )
                                }
                              >
                                {product.active ? "Desativar" : "Ativar"}
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-red-200 hover:bg-red-400/10"
                                onClick$={() =>
                                  admin.deleteContent$(
                                    "service_products",
                                    product.id,
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
              <table class={[tableClass, "md:min-w-[680px]"]}>
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Cotacao padrao</th>
                    <th class="pb-3">Servico</th>
                    <th class="pb-3">Estrutura</th>
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

                    return (
                      <tr key={template.id} class={tableRowClass}>
                        <td data-label="Cotacao padrao" class={tableCellClass}>
                          <div class="font-semibold text-white">
                            {template.title}
                          </div>

                          <div class="mt-1 text-xs text-slate-500">
                            Campos: {fields.length} / Artigos: {items.length}
                          </div>
                        </td>

                        <td data-label="Servico" class={[tableCellClass, "text-slate-300"]}>
                          {template.service_slug}
                        </td>

                        <td data-label="Estrutura" class={[tableCellClass, "text-slate-300"]}>
                          {template.structure}
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
                                        `Cotacao: ${template.title}`,
                                        `Servico: ${template.service_slug}`,
                                        `Estrutura: ${template.structure}`,
                                        `Moeda: ${template.currency}`,
                                        `Mao de obra: ${asNumber(
                                          template.labor_unit_price,
                                        ).toLocaleString("pt-MZ")} ${template.currency}`,
                                        `Custo da estrutura: ${asNumber(
                                          template.structure_cost_percentage,
                                        ).toLocaleString("pt-MZ")}%`,
                                        `Campo da mao de obra: ${
                                          fields.find(
                                            (field) =>
                                              field.field_key ===
                                              template.labor_quantity_field_key,
                                          )?.label ||
                                          template.labor_quantity_field_key ||
                                          "Nao definido"
                                        }`,
                                        `Campos: ${
                                          fields
                                            .map((field) => field.label)
                                            .join(", ") || "Sem campos"
                                        }`,
                                        `Artigos: ${
                                          items
                                            .map((item) => item.name)
                                            .join(", ") || "Sem artigos"
                                        }`,
                                        `Notas: ${
                                          template.notes || "Sem notas"
                                        }`,
                                      ].join("\n"),
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
                                    admin.toggleContent$(
                                      "service_quote_templates",
                                      template.id,
                                      !template.active,
                                    )
                                  }
                                >
                                  {template.active ? "Desativar" : "Ativar"}
                                </button>

                                <button
                                  type="button"
                                  class="rounded-lg px-3 py-2 text-left text-xs font-bold text-red-200 hover:bg-red-400/10"
                                  onClick$={() =>
                                    admin.deleteContent$(
                                      "service_quote_templates",
                                      template.id,
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
              <table class={[tableClass, "md:min-w-[680px]"]}>
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Promocao</th>
                    <th class="pb-3">Imagem</th>
                    <th class="pb-3">Desconto</th>
                    <th class="pb-3">Servico</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredPromotions.map((promotion) => (
                    <tr key={promotion.id} class={tableRowClass}>
                      <td data-label="Promocao" class={tableCellClass}>
                        <div class="font-semibold text-white">
                          {promotion.title}
                        </div>

                        <div class="mt-1 text-xs text-slate-500">
                          {promotion.slug ?? "Sem slug"}
                        </div>
                      </td>

                      <td data-label="Imagem" class={[tableCellClass, "text-slate-400"]}>
                        {promotion.image ? (
                          <img
                            src={promotion.image}
                            alt={promotion.title}
                            width={56}
                            height={40}
                            class="h-10 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <span class="text-xs text-slate-500">
                            Sem imagem
                          </span>
                        )}
                      </td>

                      <td data-label="Desconto" class={[tableCellClass, "text-slate-300"]}>
                        {promotion.discount_label || "Sem desconto"}
                      </td>

                      <td data-label="Servico" class={[tableCellClass, "text-slate-300"]}>
                        {promotion.service_slug ?? "Geral"}
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
                                  admin.toggleContent$(
                                    "promotions",
                                    promotion.id,
                                    !promotion.active,
                                  )
                                }
                              >
                                {promotion.active ? "Desativar" : "Ativar"}
                              </button>

                              <button
                                type="button"
                                class="rounded-lg px-3 py-2 text-left text-xs font-bold text-red-200 hover:bg-red-400/10"
                                onClick$={() =>
                                  admin.deleteContent$(
                                    "promotions",
                                    promotion.id,
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

        {admin.ownerTab.value === "quotes" && (
          <div class="mt-5 md:overflow-x-auto">
            <table class={[tableClass, "md:min-w-[760px]"]}>
              <thead class={tableHeadClass}>
                <tr>
                  <th class="pb-3">Cotacao</th>
                  <th class="pb-3">Cliente</th>
                  <th class="pb-3">Servico</th>
                  <th class="pb-3">Total</th>
                  <th class="pb-3">Estado</th>
                  <th class="pb-3 text-right">Acoes</th>
                </tr>
              </thead>

              <tbody class={tableBodyClass}>
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} class={tableRowClass}>
                    <td data-label="Cotacao" class={tableCellClass}>
                      <div class="font-semibold text-white">
                        {quote.quote_number}
                      </div>

                      <div class="mt-1 text-xs text-slate-500">
                        {new Date(quote.created_at).toLocaleDateString("pt-MZ")}
                      </div>
                    </td>

                    <td data-label="Cliente" class={tableCellClass}>
                      <div class="font-semibold text-white">
                        {quote.profiles?.full_name ?? "Cliente"}
                      </div>

                      <div class="mt-1 text-xs text-slate-500">
                        {quote.profiles?.phone ??
                          quote.profiles?.email ??
                          "Sem contacto"}
                      </div>
                    </td>

                    <td data-label="Servico" class={[tableCellClass, "text-slate-300"]}>
                      {quote.service_slug ?? "Nao definido"}
                    </td>

                    <td data-label="Total" class={[tableCellClass, "text-slate-300"]}>
                      {asNumber(quote.total).toLocaleString("pt-MZ")}{" "}
                      {quote.currency}
                    </td>

                    <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>{quote.status}</td>

                    <td data-label="Acoes" class={tableActionCellClass}>
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
                              `Estado: ${quote.status}`,
                              `Total: ${asNumber(quote.total).toLocaleString(
                                "pt-MZ",
                              )} ${quote.currency}`,
                              `Tecnico: ${
                                quote.technician || "Equipa Bitoll"
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
    </>
  );
});
