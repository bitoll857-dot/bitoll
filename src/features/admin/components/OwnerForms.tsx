import { component$ } from "@builder.io/qwik";

import type { AdminPanelState } from "../hooks/useAdminPanel";
import { uploadAdminImage } from "../services/admin.service";
import {
  maxImageSizeBytes,
  maxImageSizeMb,
  asNumber,
  quoteTemplateStructures,
  toSlug,
} from "../utils/admin.utils";

type Props = {
  admin: AdminPanelState;
};

const mathOperators = [
  { label: "+", value: "add" },
  { label: "-", value: "subtract" },
  { label: "x", value: "multiply" },
  { label: "/", value: "divide" },
];

const formulaSlots = [0, 1, 2, 3, 4];

const structureChoicesForService = (
  admin: AdminPanelState,
  serviceSlug: string,
) => {
  const options = admin.ownerStructureOptions.value
    .filter((option) => option.service_slug === serviceSlug)
    .map((option) => ({
      label: option.title,
      value: option.structure,
    }));

  return options.length > 0 ? options : quoteTemplateStructures;
};

export const ServiceForm = component$<Props>(({ admin }) => {
  return (
    <form preventdefault:submit class="space-y-3">
      {admin.editingServiceId.value && (
        <p class="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100">
          A editar servico existente
        </p>
      )}

      <input
        value={admin.serviceDraft.title}
        placeholder="Nome do servico"
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onInput$={(event) => {
          const target = event.target as HTMLInputElement;
          admin.serviceDraft.title = target.value;
          admin.serviceDraft.slug = toSlug(target.value);
        }}
      />

      <input
        value={admin.serviceDraft.slug}
        placeholder="slug-do-servico"
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onInput$={(event) => {
          admin.serviceDraft.slug = (event.target as HTMLInputElement).value;
        }}
      />

      <textarea
        value={admin.serviceDraft.shortDescription}
        placeholder="Descricao curta"
        class="min-h-24 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-white outline-none"
        onInput$={(event) => {
          admin.serviceDraft.shortDescription = (
            event.target as HTMLTextAreaElement
          ).value;
        }}
      />

      <input
        accept="image/*"
        type="file"
        class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-950"
        onChange$={async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];

          if (!file) {
            return;
          }

          if (file.size > maxImageSizeBytes) {
            admin.serviceDraft.imageName = "";
            admin.serviceDraft.imagePreviewUrl = "";
            admin.serviceDraft.imageUrl = "";

            admin.showToast$(
              "Imagem muito pesada",
              `Escolha uma imagem com no maximo ${maxImageSizeMb}MB.`,
            );

            return;
          }

          admin.serviceDraft.imageName = file.name;
          admin.serviceDraft.imagePreviewUrl = URL.createObjectURL(file);
          admin.serviceDraft.imageUrl = "";

          admin.showToast$(
            "Imagem selecionada",
            `A carregar ${file.name} para o Supabase Storage.`,
          );

          const upload = await uploadAdminImage(file, "services");

          admin.serviceDraft.imageUrl = upload.url;

          admin.showToast$(
            upload.url ? "Imagem carregada" : "Imagem nao carregada",
            upload.url
              ? "A imagem do servico foi carregada."
              : upload.error || "Verifique o bucket bitoll-images no Supabase.",
          );
        }}
      />

      {(admin.serviceDraft.imagePreviewUrl || admin.serviceDraft.imageUrl) && (
        <div class="rounded-xl border border-slate-800 bg-slate-950 p-2">
          <img
            src={
              admin.serviceDraft.imagePreviewUrl ||
              admin.serviceDraft.imageUrl
            }
            alt="Pre-visualizacao do servico"
            class="h-28 w-full rounded-lg object-cover"
          />

          <p class="mt-2 break-words text-xs text-slate-400">
            {admin.serviceDraft.imageName || "Imagem carregada"}
            {admin.serviceDraft.imageUrl
              ? " / pronta para publicar"
              : " / a carregar"}
          </p>
        </div>
      )}

      <label class="flex items-center gap-2 text-sm text-slate-300">
        <input
          checked={admin.serviceDraft.active}
          type="checkbox"
          onChange$={(event) => {
            admin.serviceDraft.active = (
              event.target as HTMLInputElement
            ).checked;
          }}
        />
        Publico
      </label>

      <button
        type="submit"
        class="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
        onClick$={admin.saveService$}
      >
        {admin.editingServiceId.value ? "Atualizar servico" : "Guardar servico"}
      </button>

      {admin.editingServiceId.value && (
        <button
          type="button"
          class="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
          onClick$={admin.resetServiceDraft$}
        >
          Cancelar edicao
        </button>
      )}
    </form>
  );
});

export const StructureOptionForm = component$<Props>(({ admin }) => {
  return (
    <form preventdefault:submit class="space-y-3">
      {admin.editingStructureOptionId.value && (
        <p class="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100">
          A editar opcao de estrutura
        </p>
      )}

      <select
        value={admin.structureOptionDraft.serviceSlug}
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onChange$={(event) => {
          admin.structureOptionDraft.serviceSlug = (
            event.target as HTMLSelectElement
          ).value;
        }}
      >
        <option value="">Escolha o servico</option>

        {admin.ownerServices.value.map((service) => (
          <option key={service.slug} value={service.slug}>
            {service.title}
          </option>
        ))}
      </select>

      <input
        value={admin.structureOptionDraft.title}
        placeholder="Titulo que o cliente vai ver"
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onInput$={(event) => {
          admin.structureOptionDraft.title = (
            event.target as HTMLInputElement
          ).value;
        }}
      />

      <input
        value={admin.structureOptionDraft.structure}
        placeholder="codigo-da-estrutura"
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onInput$={(event) => {
          admin.structureOptionDraft.structure = (
            event.target as HTMLInputElement
          ).value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "-");
        }}
      />

      <textarea
        value={admin.structureOptionDraft.description}
        placeholder="Descricao desta opcao"
        class="min-h-24 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-white outline-none"
        onInput$={(event) => {
          admin.structureOptionDraft.description = (
            event.target as HTMLTextAreaElement
          ).value;
        }}
      />

      <input
        accept="image/*"
        type="file"
        class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-950"
        onChange$={async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];

          if (!file) {
            return;
          }

          if (file.size > maxImageSizeBytes) {
            admin.structureOptionDraft.imageName = "";
            admin.structureOptionDraft.imagePreviewUrl = "";
            admin.structureOptionDraft.imageUrl = "";

            admin.showToast$(
              "Imagem muito pesada",
              `Escolha uma imagem com no maximo ${maxImageSizeMb}MB.`,
            );

            return;
          }

          admin.structureOptionDraft.imageName = file.name;
          admin.structureOptionDraft.imagePreviewUrl = URL.createObjectURL(file);
          admin.structureOptionDraft.imageUrl = "";

          admin.showToast$(
            "Imagem selecionada",
            `A carregar ${file.name} para o Supabase Storage.`,
          );

          const upload = await uploadAdminImage(file, "structures");

          admin.structureOptionDraft.imageUrl = upload.url;

          admin.showToast$(
            upload.url ? "Imagem carregada" : "Imagem nao carregada",
            upload.url
              ? "A imagem da estrutura foi carregada."
              : upload.error || "Verifique o bucket bitoll-images no Supabase.",
          );
        }}
      />

      {(admin.structureOptionDraft.imagePreviewUrl ||
        admin.structureOptionDraft.imageUrl) && (
        <div class="rounded-xl border border-slate-800 bg-slate-950 p-2">
          <img
            src={
              admin.structureOptionDraft.imagePreviewUrl ||
              admin.structureOptionDraft.imageUrl
            }
            alt="Pre-visualizacao da estrutura"
            class="h-28 w-full rounded-lg object-cover"
          />
        </div>
      )}

      <label class="block">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Ordem
        </span>
        <input
          value={admin.structureOptionDraft.sortOrder}
          type="number"
          class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
          onInput$={(event) => {
            admin.structureOptionDraft.sortOrder = Number(
              (event.target as HTMLInputElement).value || 0,
            );
          }}
        />
      </label>

      <label class="flex items-center gap-2 text-sm text-slate-300">
        <input
          checked={admin.structureOptionDraft.active}
          type="checkbox"
          onChange$={(event) => {
            admin.structureOptionDraft.active = (
              event.target as HTMLInputElement
            ).checked;
          }}
        />
        Publico
      </label>

      <button
        type="submit"
        class="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
        onClick$={admin.saveStructureOption$}
      >
        {admin.editingStructureOptionId.value
          ? "Atualizar estrutura"
          : "Guardar estrutura"}
      </button>

      {admin.editingStructureOptionId.value && (
        <button
          type="button"
          class="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
          onClick$={admin.resetStructureOptionDraft$}
        >
          Cancelar edicao
        </button>
      )}
    </form>
  );
});

export const ProductForm = component$<Props>(({ admin }) => {
  const structureChoices = structureChoicesForService(
    admin,
    admin.productDraft.serviceSlug,
  );

  return (
    <form preventdefault:submit class="space-y-3">
      {admin.editingProductId.value && (
        <p class="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100">
          A editar artigo existente
        </p>
      )}

      <select
        value={admin.productDraft.serviceSlug}
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onChange$={(event) => {
          admin.productDraft.serviceSlug = (
            event.target as HTMLSelectElement
          ).value;
          admin.productDraft.structure =
            structureChoicesForService(
              admin,
              admin.productDraft.serviceSlug,
            )[0]?.value ?? "basica";
        }}
      >
        <option value="">Escolha o servico</option>

        {admin.ownerServices.value.map((service) => (
          <option key={service.slug} value={service.slug}>
            {service.title}
          </option>
        ))}
      </select>

      <input
        value={admin.productDraft.name}
        placeholder="Nome do artigo"
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onInput$={(event) => {
          admin.productDraft.name = (event.target as HTMLInputElement).value;
        }}
      />

      <label class="block">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Preco unitario
        </span>

        <input
          value={admin.productDraft.unitPrice}
          type="number"
          placeholder="0 MZN"
          class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
          onInput$={(event) => {
            admin.productDraft.unitPrice = Number(
              (event.target as HTMLInputElement).value || 0,
            );
          }}
        />
      </label>

      <input
        value={admin.productDraft.brand}
        placeholder="Marca"
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onInput$={(event) => {
          admin.productDraft.brand = (event.target as HTMLInputElement).value;
        }}
      />

      <select
        value={admin.productDraft.structure}
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onChange$={(event) => {
          admin.productDraft.structure = (
            event.target as HTMLSelectElement
          ).value;
        }}
      >
        {structureChoices.map((structure) => (
          <option key={structure.value} value={structure.value}>
            {structure.label}
          </option>
        ))}
      </select>

      <input
        accept="image/*"
        type="file"
        class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-950"
        onChange$={async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];

          if (!file) {
            return;
          }

          if (file.size > maxImageSizeBytes) {
            admin.productDraft.imageName = "";
            admin.productDraft.imagePreviewUrl = "";
            admin.productDraft.imageUrl = "";

            admin.showToast$(
              "Imagem muito pesada",
              `Escolha uma imagem com no maximo ${maxImageSizeMb}MB.`,
            );

            return;
          }

          admin.productDraft.imageName = file.name;
          admin.productDraft.imagePreviewUrl = URL.createObjectURL(file);
          admin.productDraft.imageUrl = "";

          admin.showToast$(
            "Imagem selecionada",
            `A carregar ${file.name} para o Supabase Storage.`,
          );

          const upload = await uploadAdminImage(file, "articles");

          admin.productDraft.imageUrl = upload.url;

          admin.showToast$(
            upload.url ? "Imagem carregada" : "Imagem nao carregada",
            upload.url
              ? "A imagem do artigo foi carregada."
              : upload.error || "Verifique o bucket bitoll-images no Supabase.",
          );
        }}
      />

      {(admin.productDraft.imagePreviewUrl || admin.productDraft.imageUrl) && (
        <div class="rounded-xl border border-slate-800 bg-slate-950 p-2">
          <img
            src={
              admin.productDraft.imagePreviewUrl ||
              admin.productDraft.imageUrl
            }
            alt="Pre-visualizacao do artigo"
            class="h-28 w-full rounded-lg object-cover"
          />

          <p class="mt-2 break-words text-xs text-slate-400">
            {admin.productDraft.imageName || "Imagem carregada"}
            {admin.productDraft.imageUrl
              ? " / pronta para publicar"
              : " / a carregar"}
          </p>
        </div>
      )}

      <label class="flex items-center gap-2 text-sm text-slate-300">
        <input
          checked={admin.productDraft.active}
          type="checkbox"
          onChange$={(event) => {
            admin.productDraft.active = (
              event.target as HTMLInputElement
            ).checked;
          }}
        />
        Publico
      </label>

      <button
        type="submit"
        class="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
        onClick$={admin.saveProduct$}
      >
        {admin.editingProductId.value ? "Atualizar artigo" : "Guardar artigo"}
      </button>

      {admin.editingProductId.value && (
        <button
          type="button"
          class="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
          onClick$={admin.resetProductDraft$}
        >
          Cancelar edicao
        </button>
      )}
    </form>
  );
});

export const TemplateForm = component$<Props>(({ admin }) => {
  const independentServiceSlug = "servico-independente";
  const structureChoices = structureChoicesForService(
    admin,
    admin.templateDraft.serviceSlug,
  );
  const serviceProducts = admin.ownerProducts.value.filter(
    (product) =>
      product.service_slug === admin.templateDraft.serviceSlug ||
      product.service_slug === independentServiceSlug,
  );
  const selectedProducts = serviceProducts.filter((product) =>
    admin.templateDraft.selectedProductIds.includes(product.id),
  );

  return (
    <form preventdefault:submit class="space-y-3">
      {admin.editingTemplateId.value && (
        <p class="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100">
          A editar cotacao padrao existente
        </p>
      )}

      <label class="block">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Titulo da cotacao padrao
        </span>
        <input
          value={admin.templateDraft.title}
          placeholder="Ex: Cotacao padrao CCTV"
          class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
          onInput$={(event) => {
            admin.templateDraft.title = (event.target as HTMLInputElement).value;
          }}
        />
      </label>

      <label class="block">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Servico
        </span>
        <select
          value={admin.templateDraft.serviceSlug}
          class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
          onChange$={(event) => {
            admin.templateDraft.serviceSlug = (event.target as HTMLSelectElement).value;
            admin.templateDraft.structure =
              structureChoicesForService(
                admin,
                admin.templateDraft.serviceSlug,
              )[0]?.value ?? "basica";
            admin.templateDraft.selectedProductIds = [];
            admin.templateDraft.editableProductIds = [];
            admin.templateDraft.laborProductId = "";
          }}
        >
          <option value="">Escolha o servico</option>
          {admin.ownerServices.value.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.title}
            </option>
          ))}
        </select>
      </label>

      <label class="block">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Estrutura
        </span>
        <select
          value={admin.templateDraft.structure}
          class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
          onChange$={(event) => {
            admin.templateDraft.structure = (event.target as HTMLSelectElement).value;
          }}
        >
          {structureChoices.map((structure) => (
            <option key={structure.value} value={structure.value}>
              {structure.label}
            </option>
          ))}
        </select>
      </label>

      <div class="rounded-xl border border-slate-800 bg-slate-950 p-3">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Artigos desta cotacao
        </p>
        <p class="mt-2 text-xs leading-5 text-slate-500">
          Os artigos vem do servico escolhido e do servico independente. Marque
          quais entram nesta cotacao e quais podem ter quantidade editada pelo
          cliente. A quantidade sera sempre numero inteiro.
        </p>

        <div class="mt-4 space-y-3">
          {serviceProducts.map((product) => {
            const selected = admin.templateDraft.selectedProductIds.includes(product.id);
            const editable = admin.templateDraft.editableProductIds.includes(product.id);
            const isIndependent = product.service_slug === independentServiceSlug;

            return (
              <div
                key={product.id}
                class="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <span class="min-w-0">
                    <span class="block font-bold text-white">{product.name}</span>
                    <span class="mt-1 block text-xs text-slate-500">
                      {isIndependent ? "Servico independente" : "Servico escolhido"} / {product.brand || "Sem marca"} / {asNumber(product.unit_price).toLocaleString("pt-MZ")} MZN
                    </span>
                  </span>

                  <div class="grid gap-2 text-xs font-bold text-slate-300 sm:grid-cols-2">
                    <label class="flex items-center gap-2">
                      <input
                        checked={selected}
                        type="checkbox"
                        onChange$={(event) => {
                          const checked = (event.target as HTMLInputElement).checked;

                          if (checked) {
                            admin.templateDraft.selectedProductIds = Array.from(
                              new Set([...admin.templateDraft.selectedProductIds, product.id]),
                            );
                            admin.templateDraft.productDefaultQuantities = {
                              ...admin.templateDraft.productDefaultQuantities,
                              [product.id]:
                                admin.templateDraft.productDefaultQuantities[product.id] || 1,
                            };
                          } else {
                            admin.templateDraft.selectedProductIds = admin.templateDraft.selectedProductIds.filter((id) => id !== product.id);
                            admin.templateDraft.editableProductIds = admin.templateDraft.editableProductIds.filter((id) => id !== product.id);

                            if (admin.templateDraft.laborProductId === product.id) {
                              admin.templateDraft.laborProductId = "";
                            }

                            const quantities = {
                              ...admin.templateDraft.productDefaultQuantities,
                            };
                            delete quantities[product.id];
                            admin.templateDraft.productDefaultQuantities = quantities;
                          }
                        }}
                      />
                      Entra na cotacao
                    </label>

                    <label class="flex items-center gap-2">
                      <input
                        checked={editable}
                        type="checkbox"
                        onChange$={(event) => {
                          const checked = (event.target as HTMLInputElement).checked;

                          if (checked) {
                            admin.templateDraft.selectedProductIds = Array.from(
                              new Set([...admin.templateDraft.selectedProductIds, product.id]),
                            );
                            admin.templateDraft.productDefaultQuantities = {
                              ...admin.templateDraft.productDefaultQuantities,
                              [product.id]:
                                admin.templateDraft.productDefaultQuantities[product.id] || 1,
                            };
                            admin.templateDraft.editableProductIds = Array.from(
                              new Set([...admin.templateDraft.editableProductIds, product.id]),
                            );
                          } else {
                            admin.templateDraft.editableProductIds = admin.templateDraft.editableProductIds.filter((id) => id !== product.id);
                          }
                        }}
                      />
                      Cliente edita qtd
                    </label>
                  </div>
                </div>
                {selected && (
                  <div class="mt-3 space-y-3">
                    <label class="block">
                      <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Quantidade padrao
                      </span>
                      <input
                        min={1}
                        step={1}
                        type="number"
                        value={admin.templateDraft.productDefaultQuantities[product.id] || 1}
                        class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
                        onInput$={(event) => {
                          admin.templateDraft.productDefaultQuantities = {
                            ...admin.templateDraft.productDefaultQuantities,
                            [product.id]: Math.max(
                              1,
                              Math.floor(Number((event.target as HTMLInputElement).value || 1)),
                            ),
                          };
                        }}
                      />
                    </label>

                    {editable && (
                      <div class="rounded-xl border border-slate-800 bg-slate-950 p-3">
                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Artigos afetados por esta quantidade
                        </p>
                        <div class="mt-3 space-y-3">
                          {selectedProducts
                            .filter((target) => target.id !== product.id)
                            .map((target) => {
                              const rule =
                                admin.templateDraft.productRules[product.id]?.[target.id];

                              return (
                                <div key={target.id} class="rounded-lg border border-slate-800 p-3">
                                  <label class="flex items-center gap-2 text-xs font-bold text-slate-300">
                                    <input
                                      checked={Boolean(rule)}
                                      type="checkbox"
                                      onChange$={(event) => {
                                        const checked = (event.target as HTMLInputElement).checked;
                                        const sourceRules = {
                                          ...(admin.templateDraft.productRules[product.id] ?? {}),
                                        };

                                        if (checked) {
                                          sourceRules[target.id] = rule ?? {
                                            formulaSteps: [
                                              {
                                                operator: "multiply",
                                                value: 1,
                                              },
                                            ],
                                            minQuantity: 1,
                                            rounding: "ceil",
                                          };
                                        } else {
                                          delete sourceRules[target.id];
                                        }

                                        admin.templateDraft.productRules = {
                                          ...admin.templateDraft.productRules,
                                          [product.id]: sourceRules,
                                        };
                                      }}
                                    />
                                    {target.name}
                                  </label>

                                  {rule && (
                                    <div class="mt-3 space-y-3">
                                      <div class="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
                                        Valor base: quantidade de {product.name}
                                      </div>

                                      {formulaSlots.map((slot) => {
                                        const step = rule.formulaSteps[slot] ?? {
                                          operator: "multiply",
                                          value: slot === 0 ? 1 : 0,
                                        };

                                        return (
                                          <div key={slot} class="grid gap-2 sm:grid-cols-[80px_1fr]">
                                            <select
                                              value={step.operator}
                                              class="h-10 rounded-lg border border-slate-800 bg-slate-900 px-2 text-xs text-white outline-none"
                                              onChange$={(event) => {
                                                const nextSteps = [...rule.formulaSteps];
                                                nextSteps[slot] = {
                                                  ...step,
                                                  operator: (event.target as HTMLSelectElement).value as typeof step.operator,
                                                };

                                                admin.templateDraft.productRules = {
                                                  ...admin.templateDraft.productRules,
                                                  [product.id]: {
                                                    ...admin.templateDraft.productRules[product.id],
                                                    [target.id]: {
                                                      ...rule,
                                                      formulaSteps: nextSteps,
                                                    },
                                                  },
                                                };
                                              }}
                                            >
                                              {mathOperators.map((operator) => (
                                                <option key={operator.value} value={operator.value}>
                                                  {operator.label}
                                                </option>
                                              ))}
                                            </select>

                                            <input
                                              step={0.1}
                                              type="number"
                                              value={step.value}
                                              placeholder={`Valor ${slot + 1}`}
                                              class="h-10 rounded-lg border border-slate-800 bg-slate-900 px-2 text-xs text-white outline-none"
                                              onInput$={(event) => {
                                                const nextSteps = [...rule.formulaSteps];
                                                nextSteps[slot] = {
                                                  ...step,
                                                  value: Number((event.target as HTMLInputElement).value || 0),
                                                };

                                                admin.templateDraft.productRules = {
                                                  ...admin.templateDraft.productRules,
                                                  [product.id]: {
                                                    ...admin.templateDraft.productRules[product.id],
                                                    [target.id]: {
                                                      ...rule,
                                                      formulaSteps: nextSteps,
                                                    },
                                                  },
                                                };
                                              }}
                                            />
                                          </div>
                                        );
                                      })}

                                      <div class="grid gap-2 sm:grid-cols-2">
                                        <input
                                          min={0}
                                          step={1}
                                          type="number"
                                          value={rule.minQuantity}
                                          placeholder="Quantidade minima"
                                          class="h-10 rounded-lg border border-slate-800 bg-slate-900 px-2 text-xs text-white outline-none"
                                          onInput$={(event) => {
                                            admin.templateDraft.productRules = {
                                              ...admin.templateDraft.productRules,
                                              [product.id]: {
                                                ...admin.templateDraft.productRules[product.id],
                                                [target.id]: {
                                                  ...rule,
                                                  minQuantity: Math.max(0, Math.floor(Number((event.target as HTMLInputElement).value || 0))),
                                                },
                                              },
                                            };
                                          }}
                                        />

                                        <select
                                          value={rule.rounding}
                                          class="h-10 rounded-lg border border-slate-800 bg-slate-900 px-2 text-xs text-white outline-none"
                                          onChange$={(event) => {
                                            admin.templateDraft.productRules = {
                                              ...admin.templateDraft.productRules,
                                              [product.id]: {
                                                ...admin.templateDraft.productRules[product.id],
                                                [target.id]: {
                                                  ...rule,
                                                  rounding: (event.target as HTMLSelectElement).value as typeof rule.rounding,
                                                },
                                              },
                                            };
                                          }}
                                        >
                                          <option value="ceil">Arredondar para cima</option>
                                          <option value="round">Arredondar normal</option>
                                          <option value="floor">Arredondar para baixo</option>
                                        </select>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {serviceProducts.length === 0 && (
            <p class="text-xs text-slate-500">
              Crie artigos para este servico ou para o servico independente antes de montar a cotacao padrao.
            </p>
          )}
        </div>
      </div>

      <div class="rounded-xl border border-slate-800 bg-slate-950 p-3">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Mao de obra desta cotacao
        </p>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Mao de obra
            </span>
            <input
              value={admin.templateDraft.laborUnitPrice}
              type="number"
              placeholder="0 MZN"
              class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none"
              onInput$={(event) => {
                admin.templateDraft.laborUnitPrice = Number((event.target as HTMLInputElement).value || 0);
              }}
            />
          </label>

          <label class="block">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Artigo
            </span>
            <select
              value={admin.templateDraft.laborProductId}
              class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none"
              onChange$={(event) => {
                admin.templateDraft.laborProductId = (event.target as HTMLSelectElement).value;
              }}
            >
              <option value="">Escolha um artigo da cotacao</option>
              {selectedProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <textarea
        value={admin.templateDraft.notes}
        placeholder="Notas internas"
        class="min-h-20 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-white outline-none"
        onInput$={(event) => {
          admin.templateDraft.notes = (event.target as HTMLTextAreaElement).value;
        }}
      />

      <label class="flex items-center gap-2 text-sm text-slate-300">
        <input
          checked={admin.templateDraft.active}
          type="checkbox"
          onChange$={(event) => {
            admin.templateDraft.active = (event.target as HTMLInputElement).checked;
          }}
        />
        Publico
      </label>

      <button
        type="submit"
        class="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
        onClick$={admin.saveTemplate$}
      >
        {admin.editingTemplateId.value
          ? "Atualizar cotacao padrao"
          : "Guardar cotacao padrao"}
      </button>

      {admin.editingTemplateId.value && (
        <button
          type="button"
          class="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
          onClick$={admin.resetTemplateDraft$}
        >
          Cancelar edicao
        </button>
      )}
    </form>
  );
});
export const PromotionForm = component$<Props>(({ admin }) => {
  return (
    <form preventdefault:submit class="space-y-3">
      {admin.editingPromotionId.value && (
        <p class="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100">
          A editar promocao existente
        </p>
      )}

      <input
        value={admin.promotionDraft.title}
        placeholder="Titulo da promocao"
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onInput$={(event) => {
          const target = event.target as HTMLInputElement;
          admin.promotionDraft.title = target.value;
          admin.promotionDraft.slug = toSlug(target.value);
        }}
      />

      <input
        value={admin.promotionDraft.slug}
        placeholder="slug-da-promocao"
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onInput$={(event) => {
          admin.promotionDraft.slug = (
            event.target as HTMLInputElement
          ).value;
        }}
      />

      <input
        value={admin.promotionDraft.discountLabel}
        placeholder="Ex: 20% OFF"
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onInput$={(event) => {
          admin.promotionDraft.discountLabel = (
            event.target as HTMLInputElement
          ).value;
        }}
      />

      <select
        value={admin.promotionDraft.serviceSlug}
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onChange$={(event) => {
          admin.promotionDraft.serviceSlug = (
            event.target as HTMLSelectElement
          ).value;
          admin.promotionDraft.quoteTemplateId = "";
        }}
      >
        <option value="">Promocao geral</option>

        {admin.ownerServices.value.map((service) => (
          <option key={service.slug} value={service.slug}>
            {service.title}
          </option>
        ))}
      </select>

      <select
        value={admin.promotionDraft.quoteTemplateId}
        class="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onChange$={(event) => {
          admin.promotionDraft.quoteTemplateId = (
            event.target as HTMLSelectElement
          ).value;
        }}
      >
        <option value="">Escolher cotacao padrao</option>

        {admin.ownerTemplates.value
          .filter(
            (template) =>
              template.service_slug === admin.promotionDraft.serviceSlug,
          )
          .map((template) => (
            <option key={template.id} value={template.id}>
              {template.title}
            </option>
          ))}
      </select>

      <label class="block">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Data final
        </span>

        <input
          value={admin.promotionDraft.endDate}
          type="date"
          class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
          onInput$={(event) => {
            admin.promotionDraft.endDate = (
              event.target as HTMLInputElement
            ).value;
          }}
        />
      </label>

      <input
        accept="image/*"
        type="file"
        class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-950"
        onChange$={async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];

          if (!file) {
            return;
          }

          if (file.size > maxImageSizeBytes) {
            admin.promotionDraft.imageName = "";
            admin.promotionDraft.imagePreviewUrl = "";
            admin.promotionDraft.imageUrl = "";

            admin.showToast$(
              "Imagem muito pesada",
              `Escolha uma imagem com no maximo ${maxImageSizeMb}MB.`,
            );

            return;
          }

          admin.promotionDraft.imageName = file.name;
          admin.promotionDraft.imagePreviewUrl = URL.createObjectURL(file);
          admin.promotionDraft.imageUrl = "";

          admin.showToast$(
            "Imagem selecionada",
            `A carregar ${file.name} para o Supabase Storage.`,
          );

          const upload = await uploadAdminImage(file, "promotions");

          admin.promotionDraft.imageUrl = upload.url;

          admin.showToast$(
            upload.url ? "Imagem carregada" : "Imagem nao carregada",
            upload.url
              ? "A imagem da promocao foi carregada."
              : upload.error || "Verifique o bucket bitoll-images no Supabase.",
          );
        }}
      />

      {(admin.promotionDraft.imagePreviewUrl ||
        admin.promotionDraft.imageUrl) && (
        <div class="rounded-xl border border-slate-800 bg-slate-950 p-2">
          <img
            src={
              admin.promotionDraft.imagePreviewUrl ||
              admin.promotionDraft.imageUrl
            }
            alt="Pre-visualizacao da promocao"
            class="h-28 w-full rounded-lg object-cover"
          />

          <p class="mt-2 break-words text-xs text-slate-400">
            {admin.promotionDraft.imageName || "Imagem carregada"}
            {admin.promotionDraft.imageUrl
              ? " / pronta para publicar"
              : " / a carregar"}
          </p>
        </div>
      )}

      <label class="flex items-center gap-2 text-sm text-slate-300">
        <input
          checked={admin.promotionDraft.active}
          type="checkbox"
          onChange$={(event) => {
            admin.promotionDraft.active = (
              event.target as HTMLInputElement
            ).checked;
          }}
        />
        Publico
      </label>

      <button
        type="submit"
        class="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
        onClick$={admin.savePromotion$}
      >
        {admin.editingPromotionId.value
          ? "Atualizar promocao"
          : "Guardar promocao"}
      </button>

      {admin.editingPromotionId.value && (
        <button
          type="button"
          class="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
          onClick$={admin.resetPromotionDraft$}
        >
          Cancelar edicao
        </button>
      )}
    </form>
  );
});
