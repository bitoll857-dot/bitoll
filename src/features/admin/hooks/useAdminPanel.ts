import {
  $,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

import {
  getCachedAdminAccess,
  loadAdminAccess,
  type AdminAccess,
} from "~/lib/supabase/admin";

import {
  getCachedAuthUser,
  getSupabaseBrowserClient,
} from "~/lib/supabase/client";

import type { ProjectStatus } from "~/types/customer-project";
import type { User } from "~/types/user";

import {
  countTable,
  loadOperatorQuotes,
  loadOwnerContent,
} from "../services/admin.service";

import {
  asNumber,
  asStringArray,
  databaseToStatus,
  productQuantityFieldKey,
  statusToDatabase,
  toSlug,
} from "../utils/admin.utils";

import type {
  AdminMetric,
  AdminProduct,
  AdminPromotion,
  AdminQuoteTemplate,
  AdminService,
  AdminStructureOption,
  AdminTemplateField,
  AdminTemplateItem,
  AdminTemplateRule,
  OperatorDraft,
  OperatorQuote,
  OwnerTab,
} from "../types/admin.types";

const emptyAccess: AdminAccess = {
  isAdmin: false,
  role: null,
};

type AdminContentTable =
  | "promotions"
  | "service_products"
  | "service_structure_options"
  | "service_quote_templates"
  | "services";

export const useAdminPanel = () => {
  const authUser = useSignal<User | null>(null);
  const adminAccess = useSignal<AdminAccess>(emptyAccess);
  const isLoading = useSignal(true);

  const metrics = useSignal<AdminMetric[]>([]);
  const operatorQuotes = useSignal<OperatorQuote[]>([]);

  const ownerServices = useSignal<AdminService[]>([]);
  const ownerStructureOptions = useSignal<AdminStructureOption[]>([]);
  const ownerProducts = useSignal<AdminProduct[]>([]);
  const ownerTemplates = useSignal<AdminQuoteTemplate[]>([]);
  const ownerTemplateFields = useSignal<AdminTemplateField[]>([]);
  const ownerTemplateItems = useSignal<AdminTemplateItem[]>([]);
  const ownerTemplateRules = useSignal<AdminTemplateRule[]>([]);
  const ownerPromotions = useSignal<AdminPromotion[]>([]);

  const ownerTab = useSignal<OwnerTab>("services");
  const ownerSearch = useSignal("");
  const showOwnerForm = useSignal(true);

  const editingServiceId = useSignal("");
  const editingStructureOptionId = useSignal("");
  const editingProductId = useSignal("");
  const editingTemplateId = useSignal("");
  const editingPromotionId = useSignal("");

  const openServiceActionsId = useSignal("");
  const openStructureActionsId = useSignal("");
  const openProductActionsId = useSignal("");
  const openTemplateActionsId = useSignal("");
  const openPromotionActionsId = useSignal("");

  const feedback = useSignal("");

  const toastOpen = useSignal(false);
  const toastTitle = useSignal("");
  const toastMessage = useSignal("");

  const detailsOpen = useSignal(false);
  const detailsTitle = useSignal("");
  const detailsMessage = useSignal("");

  const drafts = useStore<Record<string, OperatorDraft>>({});

  const serviceDraft = useStore({
    active: true,
    imageName: "",
    imagePreviewUrl: "",
    imageUrl: "",
    shortDescription: "",
    slug: "",
    sortOrder: 10,
    title: "",
  });

  const productDraft = useStore({
    active: true,
    brand: "",
    imageName: "",
    imagePreviewUrl: "",
    imageUrl: "",
    name: "",
    serviceSlug: "",
    structure: "basica",
    unitPrice: 0,
  });

  const structureOptionDraft = useStore({
    active: true,
    description: "",
    imageName: "",
    imagePreviewUrl: "",
    imageUrl: "",
    serviceSlug: "",
    sortOrder: 10,
    structure: "basica",
    title: "",
  });

  const templateDraft = useStore({
    active: true,
    currency: "MZN",
    editableProductIds: [] as string[],
    laborProductId: "",
    laborUnitPrice: 0,
    notes: "",
    productDefaultQuantities: {} as Record<string, number>,
    productRules: {} as Record<
      string,
      Record<
        string,
        {
          formulaSteps: {
            operator: "add" | "subtract" | "multiply" | "divide";
            value: number;
          }[];
          minQuantity: number;
          rounding: "ceil" | "floor" | "round";
        }
      >
    >,
    selectedProductIds: [] as string[],
    serviceSlug: "",
    structure: "basica",
    title: "",
  });

  const promotionDraft = useStore({
    active: true,
    discountLabel: "",
    endDate: "",
    imageName: "",
    imagePreviewUrl: "",
    imageUrl: "",
    quoteTemplateId: "",
    serviceSlug: "",
    slug: "",
    title: "",
  });

  const closeToast$ = $(() => {
    toastOpen.value = false;
    toastTitle.value = "";
    toastMessage.value = "";
  });

  const closeDetails$ = $(() => {
    detailsOpen.value = false;
    detailsTitle.value = "";
    detailsMessage.value = "";
  });

  const showToast$ = $((title: string, message: string) => {
    toastTitle.value = title;
    toastMessage.value = message;
    toastOpen.value = true;

    window.setTimeout(() => {
      toastOpen.value = false;
      toastTitle.value = "";
      toastMessage.value = "";
    }, 5000);
  });

  const showDetails$ = $((title: string, message: string) => {
    detailsTitle.value = title;
    detailsMessage.value = message;
    detailsOpen.value = true;
  });

  const resetServiceDraft$ = $(() => {
    editingServiceId.value = "";

    serviceDraft.active = true;
    serviceDraft.imageName = "";
    serviceDraft.imagePreviewUrl = "";
    serviceDraft.imageUrl = "";
    serviceDraft.shortDescription = "";
    serviceDraft.slug = "";
    serviceDraft.sortOrder = 10;
    serviceDraft.title = "";
  });

  const resetProductDraft$ = $(() => {
    editingProductId.value = "";

    productDraft.active = true;
    productDraft.brand = "";
    productDraft.imageName = "";
    productDraft.imagePreviewUrl = "";
    productDraft.imageUrl = "";
    productDraft.name = "";
    productDraft.structure = "basica";
    productDraft.unitPrice = 0;
  });

  const resetStructureOptionDraft$ = $(() => {
    editingStructureOptionId.value = "";

    structureOptionDraft.active = true;
    structureOptionDraft.description = "";
    structureOptionDraft.imageName = "";
    structureOptionDraft.imagePreviewUrl = "";
    structureOptionDraft.imageUrl = "";
    structureOptionDraft.sortOrder = 10;
    structureOptionDraft.structure = "basica";
    structureOptionDraft.title = "";
  });

  const resetTemplateDraft$ = $(() => {
    editingTemplateId.value = "";

    templateDraft.active = true;
    templateDraft.currency = "MZN";
    templateDraft.editableProductIds = [];
    templateDraft.laborProductId = "";
    templateDraft.laborUnitPrice = 0;
    templateDraft.notes = "";
    templateDraft.productDefaultQuantities = {};
    templateDraft.productRules = {};
    templateDraft.selectedProductIds = [];
    templateDraft.structure = "basica";
    templateDraft.title = "";
  });

  const resetPromotionDraft$ = $(() => {
    editingPromotionId.value = "";

    promotionDraft.active = true;
    promotionDraft.discountLabel = "";
    promotionDraft.endDate = "";
    promotionDraft.imageName = "";
    promotionDraft.imagePreviewUrl = "";
    promotionDraft.imageUrl = "";
    promotionDraft.quoteTemplateId = "";
    promotionDraft.slug = "";
    promotionDraft.title = "";
  });

  const refreshOperatorQuotes$ = $(async () => {
    const quotes = await loadOperatorQuotes();
    operatorQuotes.value = quotes;

    for (const quote of quotes) {
      drafts[quote.id] = {
        estimatedCompletion: quote.estimated_completion ?? "",
        nextStep: quote.next_step || "",
        progress: Math.min(100, Math.max(0, asNumber(quote.progress || 35))),
        status: databaseToStatus(quote.status),
        technician: quote.technician || "Equipa Bitoll",
        updatesText: asStringArray(quote.updates).join("\n"),
      };
    }
  });

  const refreshOwnerContent$ = $(async () => {
    const content = await loadOwnerContent();

    ownerServices.value = content.services;
    ownerStructureOptions.value = content.structureOptions;
    ownerProducts.value = content.products;
    ownerTemplates.value = content.templates;
    ownerTemplateFields.value = content.templateFields;
    ownerTemplateItems.value = content.templateItems;
    ownerTemplateRules.value = content.templateRules;
    ownerPromotions.value = content.promotions;

    if (!productDraft.serviceSlug && content.services[0]) {
      productDraft.serviceSlug = content.services[0].slug;
    }

    if (!structureOptionDraft.serviceSlug && content.services[0]) {
      structureOptionDraft.serviceSlug = content.services[0].slug;
    }

    if (!templateDraft.serviceSlug && content.services[0]) {
      templateDraft.serviceSlug = content.services[0].slug;
    }

    if (!promotionDraft.serviceSlug && content.services[0]) {
      promotionDraft.serviceSlug = content.services[0].slug;
    }
  });

  const saveService$ = $(async () => {
    const supabase = getSupabaseBrowserClient();
    const slug = serviceDraft.slug || toSlug(serviceDraft.title);

    if (!supabase || !serviceDraft.title || !slug) {
      feedback.value = "Preencha pelo menos o nome do servico.";
      showToast$("Servico incompleto", feedback.value);
      return;
    }

    if (serviceDraft.imagePreviewUrl && !serviceDraft.imageUrl) {
      feedback.value = "A imagem escolhida ainda nao foi carregada.";
      showToast$("Imagem pendente", feedback.value);
      return;
    }

    const servicePayload = {
      active: serviceDraft.active,
      description: serviceDraft.shortDescription,
      image_key: slug,
      image_url: serviceDraft.imageUrl,
      short_description: serviceDraft.shortDescription,
      slug,
      sort_order: serviceDraft.sortOrder,
      title: serviceDraft.title,
    };

    const { error } = editingServiceId.value
      ? await supabase
          .from("services")
          .update(servicePayload)
          .eq("id", editingServiceId.value)
      : await supabase
          .from("services")
          .upsert(servicePayload, { onConflict: "slug" });

    feedback.value = error
      ? "Nao foi possivel guardar o servico."
      : "Servico guardado.";

    showToast$(
      error ? "Erro no servico" : "Servico guardado",
      feedback.value,
    );

    if (!error) {
      await resetServiceDraft$();
      await refreshOwnerContent$();
    }
  });

  const saveProduct$ = $(async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !productDraft.serviceSlug || !productDraft.name) {
      feedback.value = "Escolha o servico e informe o nome do artigo.";
      showToast$("Artigo incompleto", feedback.value);
      return;
    }

    if (productDraft.imagePreviewUrl && !productDraft.imageUrl) {
      feedback.value = "A imagem escolhida ainda nao foi carregada.";
      showToast$("Imagem pendente", feedback.value);
      return;
    }

    const productPayload = {
      active: productDraft.active,
      brand: productDraft.brand,
      category: "Produto",
      description: productDraft.name,
      detail: productDraft.name,
      estimated_quantity: 0,
      image_url: productDraft.imageUrl,
      name: productDraft.name,
      quantity_label: "",
      service_slug: productDraft.serviceSlug,
      source: "Bitoll admin",
      structure: productDraft.structure,
      unit: "Un",
      unit_price: productDraft.unitPrice,
    };

    const { error } = editingProductId.value
      ? await supabase
          .from("service_products")
          .update(productPayload)
          .eq("id", editingProductId.value)
      : await supabase.from("service_products").insert(productPayload);

    feedback.value = error
      ? "Nao foi possivel guardar o artigo."
      : "Artigo guardado.";

    showToast$(
      error ? "Erro no artigo" : "Artigo guardado",
      feedback.value,
    );

    if (!error) {
      await resetProductDraft$();
      await refreshOwnerContent$();
    }
  });

  const saveStructureOption$ = $(async () => {
    const supabase = getSupabaseBrowserClient();

    if (
      !supabase ||
      !structureOptionDraft.serviceSlug ||
      !structureOptionDraft.structure ||
      !structureOptionDraft.title
    ) {
      feedback.value =
        "Escolha o servico, informe a estrutura e o titulo da opcao.";
      showToast$("Opcao incompleta", feedback.value);
      return;
    }

    if (structureOptionDraft.imagePreviewUrl && !structureOptionDraft.imageUrl) {
      feedback.value = "A imagem escolhida ainda nao foi carregada.";
      showToast$("Imagem pendente", feedback.value);
      return;
    }

    const structurePayload = {
      active: structureOptionDraft.active,
      description: structureOptionDraft.description,
      image_url: structureOptionDraft.imageUrl,
      service_slug: structureOptionDraft.serviceSlug,
      sort_order: structureOptionDraft.sortOrder,
      structure: structureOptionDraft.structure,
      title: structureOptionDraft.title,
      updated_at: new Date().toISOString(),
    };

    const { error } = editingStructureOptionId.value
      ? await supabase
          .from("service_structure_options")
          .update(structurePayload)
          .eq("id", editingStructureOptionId.value)
      : await supabase
          .from("service_structure_options")
          .upsert(structurePayload, { onConflict: "service_slug,structure" });

    feedback.value = error
      ? "Nao foi possivel guardar a opcao de estrutura."
      : "Opcao de estrutura guardada.";

    showToast$(
      error ? "Erro na estrutura" : "Estrutura guardada",
      feedback.value,
    );

    if (!error) {
      await resetStructureOptionDraft$();
      await refreshOwnerContent$();
    }
  });

  const saveTemplate$ = $(async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !templateDraft.serviceSlug || !templateDraft.title) {
      feedback.value =
        "Escolha o servico e informe o titulo da cotacao padrao.";
      showToast$("Cotacao padrao incompleta", feedback.value);
      return;
    }

    if (templateDraft.selectedProductIds.length === 0) {
      feedback.value =
        "Escolha pelo menos um artigo para esta cotacao padrao.";
      showToast$("Artigos em falta", feedback.value);
      return;
    }

    if (
      !templateDraft.laborProductId ||
      !templateDraft.selectedProductIds.includes(templateDraft.laborProductId)
    ) {
      feedback.value =
        "Escolha o artigo que multiplica a mao de obra.";
      showToast$("Artigo da mao de obra em falta", feedback.value);
      return;
    }

    const fields = ownerProducts.value
      .filter((product) => templateDraft.editableProductIds.includes(product.id))
      .map((product, index) => ({
        field_key: productQuantityFieldKey(product.id),
        input_type: "number",
        label: `Quantidade de ${product.name}`,
        required: true,
        sort_order: index + 1,
      }));

    const templatePayload = {
      active: templateDraft.active,
      currency: templateDraft.currency,
      labor_product_id: templateDraft.laborProductId,
      labor_quantity_field_key: templateDraft.editableProductIds.includes(
        templateDraft.laborProductId,
      )
        ? productQuantityFieldKey(templateDraft.laborProductId)
        : "",
      labor_unit_price: templateDraft.laborUnitPrice,
      notes: templateDraft.notes,
      service_slug: templateDraft.serviceSlug,
      structure: templateDraft.structure,
      title: templateDraft.title,
      updated_at: new Date().toISOString(),
    };

    const templateResult = editingTemplateId.value
      ? await supabase
          .from("service_quote_templates")
          .update(templatePayload)
          .eq("id", editingTemplateId.value)
          .select("id")
          .single()
      : await supabase
          .from("service_quote_templates")
          .insert(templatePayload)
          .select("id")
          .single();

    if (templateResult.error || !templateResult.data) {
      feedback.value = "Nao foi possivel guardar a cotacao padrao.";
      showToast$("Erro na cotacao padrao", feedback.value);
      return;
    }

    const templateId = templateResult.data.id as string;

    await supabase
      .from("service_quote_template_fields")
      .delete()
      .eq("template_id", templateId);

    await supabase
      .from("service_quote_template_items")
      .delete()
      .eq("template_id", templateId);
    await supabase
      .from("service_quote_template_item_rules")
      .delete()
      .eq("template_id", templateId);

    const { error: fieldsError } = fields.length
      ? await supabase
          .from("service_quote_template_fields")
          .insert(fields.map((field) => ({ ...field, template_id: templateId })))
      : { error: null };

    const selectedProducts = ownerProducts.value.filter((product) =>
      templateDraft.selectedProductIds.includes(product.id),
    );

    const { error: itemsError } = selectedProducts.length
      ? await supabase.from("service_quote_template_items").insert(
          selectedProducts.map((product, index) => ({
            client_quantity_editable:
              templateDraft.editableProductIds.includes(product.id),
            default_quantity: Math.max(
              1,
              Math.floor(templateDraft.productDefaultQuantities[product.id] || 1),
            ),
            name: product.name,
            product_id: product.id,
            quantity_field_key: templateDraft.editableProductIds.includes(product.id)
              ? productQuantityFieldKey(product.id)
              : "",
            sort_order: index + 1,
            template_id: templateId,
            unit: "Un",
            unit_price: product.unit_price,
          })),
        )
      : { error: null };

    const ruleRows = Object.entries(templateDraft.productRules).flatMap(
      ([sourceProductId, rulesByTarget]) =>
        Object.entries(rulesByTarget)
          .filter(
            ([targetProductId]) =>
              templateDraft.editableProductIds.includes(sourceProductId) &&
              templateDraft.selectedProductIds.includes(sourceProductId) &&
              templateDraft.selectedProductIds.includes(targetProductId),
          )
          .map(([targetProductId, rule]) => ({
            divisor: 1,
            formula_steps: rule.formulaSteps,
            min_quantity: Math.max(0, Math.floor(rule.minQuantity || 0)),
            multiplier: 1,
            rounding: rule.rounding || "ceil",
            source_product_id: sourceProductId,
            target_product_id: targetProductId,
            template_id: templateId,
          })),
    );

    const { error: rulesError } = ruleRows.length
      ? await supabase.from("service_quote_template_item_rules").insert(ruleRows)
      : { error: null };

    const error = fieldsError || itemsError || rulesError;

    feedback.value = error
      ? "A cotacao foi criada, mas alguns detalhes nao foram guardados."
      : "Cotacao padrao guardada.";

    showToast$(
      error ? "Cotacao parcial" : "Cotacao padrao guardada",
      feedback.value,
    );

    if (!error) {
      await resetTemplateDraft$();
      await refreshOwnerContent$();
    }
  });

  const savePromotion$ = $(async () => {
    const supabase = getSupabaseBrowserClient();
    const slug = promotionDraft.slug || toSlug(promotionDraft.title);

    if (!supabase || !promotionDraft.title || !slug) {
      feedback.value = "Preencha pelo menos o titulo da promocao.";
      showToast$("Promocao incompleta", feedback.value);
      return;
    }

    if (promotionDraft.imagePreviewUrl && !promotionDraft.imageUrl) {
      feedback.value = "A imagem escolhida ainda nao foi carregada.";
      showToast$("Imagem pendente", feedback.value);
      return;
    }

    const promotionPayload = {
      active: promotionDraft.active,
      description: promotionDraft.title,
      discount_label: promotionDraft.discountLabel,
      end_date: promotionDraft.endDate || null,
      image: promotionDraft.imageUrl,
      quote_template_id: promotionDraft.quoteTemplateId || null,
      service_slug: promotionDraft.serviceSlug || null,
      short_description: promotionDraft.title,
      slug,
      title: promotionDraft.title,
    };

    const { error } = editingPromotionId.value
      ? await supabase
          .from("promotions")
          .update(promotionPayload)
          .eq("id", editingPromotionId.value)
      : await supabase
          .from("promotions")
          .upsert(promotionPayload, { onConflict: "slug" });

    feedback.value = error
      ? "Nao foi possivel guardar a promocao."
      : "Promocao guardada.";

    showToast$(
      error ? "Erro na promocao" : "Promocao guardada",
      feedback.value,
    );

    if (!error) {
      await resetPromotionDraft$();
      await refreshOwnerContent$();
    }
  });

  const toggleContent$ = $(async (
    table: AdminContentTable,
    id: string,
    active: boolean,
  ) => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const { error } = await supabase.from(table).update({ active }).eq("id", id);

    feedback.value = error
      ? "Nao foi possivel alterar a visibilidade."
      : active
        ? "Item ativado para o publico."
        : "Item desativado do publico.";

    showToast$(
      error ? "Visibilidade nao alterada" : "Visibilidade atualizada",
      feedback.value,
    );

    if (!error) {
      await refreshOwnerContent$();
    }
  });

  const deleteContent$ = $(async (table: AdminContentTable, id: string) => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !window.confirm("Eliminar este item definitivamente?")) {
      return;
    }

    const { error } = await supabase.from(table).delete().eq("id", id);

    feedback.value = error ? "Nao foi possivel eliminar." : "Item eliminado.";

    showToast$(
      error ? "Erro ao eliminar" : "Item eliminado",
      feedback.value,
    );

    if (!error) {
      await refreshOwnerContent$();
    }
  });

  const editService$ = $((service: AdminService) => {
    editingServiceId.value = service.id;
    showOwnerForm.value = true;

    serviceDraft.active = service.active;
    serviceDraft.imageName = "";
    serviceDraft.imagePreviewUrl = "";
    serviceDraft.imageUrl = service.image_url;
    serviceDraft.shortDescription = service.short_description;
    serviceDraft.slug = service.slug;
    serviceDraft.sortOrder = Number(service.sort_order || 10);
    serviceDraft.title = service.title;

    showToast$("Servico em edicao", service.title);
  });

  const editProduct$ = $((product: AdminProduct) => {
    editingProductId.value = product.id;
    showOwnerForm.value = true;

    productDraft.active = product.active;
    productDraft.brand = product.brand;
    productDraft.imageName = "";
    productDraft.imagePreviewUrl = "";
    productDraft.imageUrl = product.image_url;
    productDraft.name = product.name;
    productDraft.serviceSlug = product.service_slug;
    productDraft.structure = product.structure;
    productDraft.unitPrice = asNumber(product.unit_price);

    showToast$("Artigo em edicao", product.name);
  });

  const editStructureOption$ = $((option: AdminStructureOption) => {
    editingStructureOptionId.value = option.id;
    showOwnerForm.value = true;

    structureOptionDraft.active = option.active;
    structureOptionDraft.description = option.description;
    structureOptionDraft.imageName = "";
    structureOptionDraft.imagePreviewUrl = "";
    structureOptionDraft.imageUrl = option.image_url;
    structureOptionDraft.serviceSlug = option.service_slug;
    structureOptionDraft.sortOrder = asNumber(option.sort_order || 10);
    structureOptionDraft.structure = option.structure;
    structureOptionDraft.title = option.title;

    showToast$("Estrutura em edicao", option.title);
  });

  const editTemplate$ = $((template: AdminQuoteTemplate) => {
    const fields = ownerTemplateFields.value.filter(
      (field) => field.template_id === template.id,
    );

    const items = ownerTemplateItems.value.filter(
      (item) => item.template_id === template.id,
    );

    editingTemplateId.value = template.id;
    showOwnerForm.value = true;

    templateDraft.active = template.active;
    templateDraft.currency = template.currency;
    templateDraft.editableProductIds = items
      .filter((item) => item.client_quantity_editable)
      .map((item) => item.product_id)
      .filter((id): id is string => Boolean(id));
    templateDraft.laborProductId = template.labor_product_id ?? "";
    templateDraft.laborUnitPrice = asNumber(template.labor_unit_price);

    templateDraft.notes = template.notes;
    templateDraft.productDefaultQuantities = items.reduce(
      (acc, item) => {
        if (item.product_id) {
          acc[item.product_id] = Math.max(1, Math.floor(asNumber(item.default_quantity) || 1));
        }

        return acc;
      },
      {} as Record<string, number>,
    );
    templateDraft.productRules = ownerTemplateRules.value
      .filter((rule) => rule.template_id === template.id)
      .reduce(
        (acc, rule) => {
          if (rule.source_product_id && rule.target_product_id) {
            acc[rule.source_product_id] = {
              ...(acc[rule.source_product_id] ?? {}),
              [rule.target_product_id]: {
                formulaSteps: Array.isArray(rule.formula_steps)
                  ? rule.formula_steps
                  : [
                      {
                        operator: "multiply",
                        value: asNumber(rule.multiplier) || 1,
                      },
                      {
                        operator: "divide",
                        value: Math.max(1, asNumber(rule.divisor) || 1),
                      },
                    ],
                minQuantity: asNumber(rule.min_quantity),
                rounding: rule.rounding || "ceil",
              },
            };
          }

          return acc;
        },
        {} as Record<
          string,
          Record<
            string,
            {
              formulaSteps: {
                operator: "add" | "subtract" | "multiply" | "divide";
                value: number;
              }[];
              minQuantity: number;
              rounding: "ceil" | "floor" | "round";
            }
          >
        >,
      );

    templateDraft.selectedProductIds = items
      .map((item) => item.product_id)
      .filter((id): id is string => Boolean(id));

    templateDraft.serviceSlug = template.service_slug;
    templateDraft.structure = template.structure;
    templateDraft.title = template.title;

    showToast$("Cotacao padrao em edicao", template.title);
  });

  const editPromotion$ = $((promotion: AdminPromotion) => {
    editingPromotionId.value = promotion.id;
    showOwnerForm.value = true;

    promotionDraft.active = promotion.active;
    promotionDraft.discountLabel = promotion.discount_label;
    promotionDraft.endDate = promotion.end_date ?? "";
    promotionDraft.imageName = "";
    promotionDraft.imagePreviewUrl = "";
    promotionDraft.imageUrl = promotion.image;
    promotionDraft.quoteTemplateId = promotion.quote_template_id ?? "";
    promotionDraft.serviceSlug = promotion.service_slug ?? "";
    promotionDraft.slug = promotion.slug ?? "";
    promotionDraft.title = promotion.title;

    showToast$("Promocao em edicao", promotion.title);
  });

  const saveQuoteProgress$ = $(async (quoteId: string) => {
    const supabase = getSupabaseBrowserClient();
    const draft = drafts[quoteId];

    if (!supabase || !draft) {
      return;
    }

    const updates = draft.updatesText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("quotes")
      .update({
        estimated_completion: draft.estimatedCompletion || null,
        next_step: draft.nextStep,
        progress: draft.status === "Concluido" ? 100 : draft.progress,
        status: statusToDatabase(draft.status as ProjectStatus),
        technician: draft.technician,
        updated_at: new Date().toISOString(),
        updates,
      })
      .eq("id", quoteId);

    feedback.value = error
      ? "Nao foi possivel guardar a progressao agora."
      : "Progressao guardada para o cliente.";

    showToast$(
      error ? "Erro na progressao" : "Progressao guardada",
      feedback.value,
    );

    if (!error) {
      await refreshOperatorQuotes$();
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    authUser.value = getCachedAuthUser();
    adminAccess.value = getCachedAdminAccess();

    const access = await loadAdminAccess();
    adminAccess.value = access;

    if (access.isAdmin) {
      await refreshOperatorQuotes$();
    }

    if (access.isAdmin && access.role !== "operador") {
      await refreshOwnerContent$();

      const [services, products, promotions, quotes] = await Promise.all([
        countTable("services"),
        countTable("service_products"),
        countTable("promotions"),
        countTable("quotes"),
      ]);

      metrics.value = [
        { label: "Servicos", value: String(services) },
        { label: "Produtos", value: String(products) },
        { label: "Cotacoes base", value: String(ownerTemplates.value.length) },
        { label: "Promocoes", value: String(promotions) },
        { label: "Cotacoes", value: String(quotes) },
      ];
    }

    isLoading.value = false;
  });

  return {
    authUser,
    adminAccess,
    isLoading,

    metrics,
    operatorQuotes,

    ownerServices,
    ownerStructureOptions,
    ownerProducts,
    ownerTemplates,
    ownerTemplateFields,
    ownerTemplateItems,
    ownerTemplateRules,
    ownerPromotions,

    ownerTab,
    ownerSearch,
    showOwnerForm,

    editingServiceId,
    editingStructureOptionId,
    editingProductId,
    editingTemplateId,
    editingPromotionId,

    openServiceActionsId,
    openStructureActionsId,
    openProductActionsId,
    openTemplateActionsId,
    openPromotionActionsId,

    feedback,

    toastOpen,
    toastTitle,
    toastMessage,
    showToast$,
    closeToast$,

    detailsOpen,
    detailsTitle,
    detailsMessage,
    showDetails$,
    closeDetails$,

    drafts,

    serviceDraft,
    structureOptionDraft,
    productDraft,
    templateDraft,
    promotionDraft,

    resetServiceDraft$,
    resetStructureOptionDraft$,
    resetProductDraft$,
    resetTemplateDraft$,
    resetPromotionDraft$,

    refreshOperatorQuotes$,
    refreshOwnerContent$,

    saveService$,
    saveStructureOption$,
    saveProduct$,
    saveTemplate$,
    savePromotion$,
    saveQuoteProgress$,

    toggleContent$,
    deleteContent$,

    editService$,
    editStructureOption$,
    editProduct$,
    editTemplate$,
    editPromotion$,
  };
};

export type AdminPanelState = ReturnType<typeof useAdminPanel>;
