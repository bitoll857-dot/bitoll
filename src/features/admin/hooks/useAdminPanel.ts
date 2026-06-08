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
  statusToDatabase,
  toSlug,
} from "../utils/admin.utils";

import type {
  AdminCustomer,
  AdminCustomQuote,
  AdminMetric,
  AdminOperatorUser,
  AdminProduct,
  AdminPromotion,
  AdminQuoteTemplate,
  AdminService,
  AdminStructureOption,
  AdminTemplateField,
  AdminTemplateItem,
  AdminTemplateRule,
  CustomQuoteDraftItem,
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

type AdminConfirmAction = "toggle" | "delete" | "";

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
  const ownerCustomers = useSignal<AdminCustomer[]>([]);
  const ownerCustomQuotes = useSignal<AdminCustomQuote[]>([]);
  const ownerOperators = useSignal<AdminOperatorUser[]>([]);

  const ownerTab = useSignal<OwnerTab>("services");
  const ownerSearch = useSignal("");
  const showOwnerForm = useSignal(false);

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
  const quoteProcedureOpen = useSignal(false);
  const quoteProcedureQuoteId = useSignal("");
  const quoteProcedureOperatorId = useSignal("");
  const quoteProcedureStepIndex = useSignal(0);

  const feedback = useSignal("");

  const toastOpen = useSignal(false);
  const toastTitle = useSignal("");
  const toastMessage = useSignal("");

  const detailsOpen = useSignal(false);
  const detailsTitle = useSignal("");
  const detailsMessage = useSignal("");
  const detailsImageUrl = useSignal("");

  const confirmOpen = useSignal(false);
  const confirmTitle = useSignal("");
  const confirmMessage = useSignal("");
  const confirmLabel = useSignal("");
  const confirmTone = useSignal<"danger" | "default">("default");
  const confirmAction = useStore({
    active: false,
    id: "",
    table: "" as AdminContentTable | "",
    type: "" as AdminConfirmAction,
  });

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
    stepsText: "",
    structure: "basica",
    structureCostPercentage: 0,
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
    structureCostPercentage: 0,
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

  const customQuoteProductPickerOpen = useSignal(false);
  const customQuoteProductSearch = useSignal("");
  const customQuoteFormOpen = useSignal(false);
  const customQuoteLastCreatedId = useSignal("");
  const customQuoteTableOpen = useSignal(false);
  const customQuoteDraft = useStore({
    contacto: "",
    currency: "MZN",
    customerMode: "registered" as "registered" | "temporary",
    customerName: "",
    items: [] as CustomQuoteDraftItem[],
    morada: "",
    notes: "",
    nuit: "",
    profileId: "",
    serviceSlug: "",
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
    detailsImageUrl.value = "";
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

  const showDetails$ = $((title: string, message: string, imageUrl = "") => {
    detailsTitle.value = title;
    detailsMessage.value = message;
    detailsImageUrl.value = imageUrl;
    detailsOpen.value = true;
  });

  const closeConfirm$ = $(() => {
    confirmOpen.value = false;
    confirmTitle.value = "";
    confirmMessage.value = "";
    confirmLabel.value = "";
    confirmTone.value = "default";
    confirmAction.active = false;
    confirmAction.id = "";
    confirmAction.table = "";
    confirmAction.type = "";
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
    structureOptionDraft.stepsText = "";
    structureOptionDraft.structure = "basica";
    structureOptionDraft.structureCostPercentage = 0;
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
    templateDraft.structureCostPercentage = 0;
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
        progress: Math.min(100, Math.max(0, asNumber(quote.progress ?? 0))),
        status: databaseToStatus(quote.status),
        technician: quote.technician || "",
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
    ownerCustomers.value = content.customers;
    ownerCustomQuotes.value = content.customQuotes;
    ownerOperators.value = content.operators;

    if (!productDraft.serviceSlug && content.services[0]) {
      productDraft.serviceSlug = content.services[0].slug;
    }

    const productStructures = content.structureOptions.filter(
      (option) => option.service_slug === productDraft.serviceSlug,
    );

    if (
      productDraft.serviceSlug &&
      !productStructures.some(
        (option) => option.structure === productDraft.structure,
      )
    ) {
      productDraft.structure = productStructures[0]?.structure ?? "";
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

    if (
      !supabase ||
      !productDraft.serviceSlug ||
      !productDraft.structure ||
      !productDraft.name
    ) {
      feedback.value =
        "Escolha o servico, a estrutura cadastrada e informe o nome do artigo.";
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
      steps: structureOptionDraft.stepsText
        .split("\n")
        .map((step) => step.trim())
        .filter(Boolean),
      structure: structureOptionDraft.structure,
      structure_cost_percentage: Math.max(
        0,
        asNumber(structureOptionDraft.structureCostPercentage),
      ),
      title: structureOptionDraft.title,
      updated_at: new Date().toISOString(),
    };

    const existingStructure = ownerStructureOptions.value.find(
      (option) =>
        option.service_slug === structureOptionDraft.serviceSlug &&
        option.structure === structureOptionDraft.structure,
    );

    if (existingStructure && !editingStructureOptionId.value) {
      editingStructureOptionId.value = existingStructure.id;
      structureOptionDraft.active = existingStructure.active;
      structureOptionDraft.description = existingStructure.description;
      structureOptionDraft.imageName = "";
      structureOptionDraft.imagePreviewUrl = "";
      structureOptionDraft.imageUrl = existingStructure.image_url;
      structureOptionDraft.sortOrder = asNumber(existingStructure.sort_order || 10);
      structureOptionDraft.stepsText = existingStructure.steps.join("\n");
      structureOptionDraft.structureCostPercentage = asNumber(
        existingStructure.structure_cost_percentage,
      );
      structureOptionDraft.title = existingStructure.title;
      feedback.value =
        "Esta estrutura ja existe para este servico. Atualize a estrutura existente em vez de criar outra.";
      showToast$("Estrutura ja cadastrada", feedback.value);
      return;
    }

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

    const fields: {
      field_key: string;
      input_type: string;
      label: string;
      required: boolean;
      sort_order: number;
    }[] = [];

    const templatePayload = {
      active: templateDraft.active,
      currency: templateDraft.currency,
      labor_product_id: templateDraft.laborProductId,
      labor_quantity_field_key: "",
      labor_unit_price: templateDraft.laborUnitPrice,
      notes: templateDraft.notes,
      service_slug: templateDraft.serviceSlug,
      structure: templateDraft.structure,
      structure_cost_percentage: Math.max(
        0,
        asNumber(templateDraft.structureCostPercentage),
      ),
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
            client_quantity_editable: false,
            default_quantity: Math.max(
              1,
              Math.floor(templateDraft.productDefaultQuantities[product.id] || 1),
            ),
            name: product.name,
            product_id: product.id,
            quantity_field_key: "",
            sort_order: index + 1,
            template_id: templateId,
            unit: "Un",
            unit_price: product.unit_price,
          })),
        )
      : { error: null };

    const ruleRows: {
      divisor: number;
      formula_steps: {
        operator: "add" | "subtract" | "multiply" | "divide";
        value: number;
      }[];
      min_quantity: number;
      multiplier: number;
      rounding: "ceil" | "floor" | "round";
      source_product_id: string;
      target_product_id: string;
      template_id: string;
    }[] = [];

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

  const resetCustomQuoteDraft$ = $(() => {
    customQuoteDraft.contacto = "";
    customQuoteDraft.currency = "MZN";
    customQuoteDraft.customerMode = "registered";
    customQuoteDraft.customerName = "";
    customQuoteDraft.items = [];
    customQuoteDraft.morada = "";
    customQuoteDraft.notes = "";
    customQuoteDraft.nuit = "";
    customQuoteDraft.profileId = "";
    customQuoteDraft.serviceSlug = "";
    customQuoteProductPickerOpen.value = false;
    customQuoteProductSearch.value = "";
  });

  const selectCustomQuoteCustomer$ = $((profileId: string) => {
    customQuoteDraft.profileId = profileId;

    const customer = ownerCustomers.value.find((item) => item.id === profileId);

    if (!customer) {
      customQuoteDraft.customerName = "";
      customQuoteDraft.contacto = "";
      customQuoteDraft.morada = "";
      return;
    }

    customQuoteDraft.customerName = customer.full_name ?? "";
    customQuoteDraft.contacto = customer.phone || customer.email || "";
    customQuoteDraft.morada = customer.city ?? "";
  });

  const addCustomQuoteProduct$ = $((productId: string) => {
    const product = ownerProducts.value.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    const existing = customQuoteDraft.items.find(
      (item) => item.id === product.id,
    );

    if (existing) {
      existing.quantity = Math.max(1, asNumber(existing.quantity) + 1);
      return;
    }

    customQuoteDraft.items = [
      ...customQuoteDraft.items,
      {
        category: product.category || "Produto",
        id: product.id,
        imageUrl: product.image_url,
        name: product.name,
        quantity: 1,
        serviceSlug: product.service_slug,
        structure: product.structure,
        unit: product.unit || "Un",
        unitPrice: asNumber(product.unit_price),
      },
    ];
  });

  const updateCustomQuoteItemQuantity$ = $(
    (productId: string, quantity: number) => {
      customQuoteDraft.items = customQuoteDraft.items.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, asNumber(quantity) || 1) }
          : item,
      );
    },
  );

  const removeCustomQuoteItem$ = $((productId: string) => {
    customQuoteDraft.items = customQuoteDraft.items.filter(
      (item) => item.id !== productId,
    );
  });

  const saveCustomQuote$ = $(async () => {
    const supabase = getSupabaseBrowserClient();
    const customerName = customQuoteDraft.customerName.trim();
    const contacto = customQuoteDraft.contacto.trim();
    const items = customQuoteDraft.items.filter((item) => item.quantity > 0);

    if (!supabase) {
      showToast$(
        "Base de dados indisponivel",
        "Nao foi possivel abrir a ligacao com a base de dados.",
      );
      return;
    }

    if (!customerName || !contacto) {
      showToast$(
        "Cliente incompleto",
        "Informe o cliente e pelo menos um contacto para esta cotacao.",
      );
      return;
    }

    if (items.length === 0) {
      showToast$(
        "Artigos em falta",
        "Escolha pelo menos um artigo cadastrado para montar a cotacao.",
      );
      return;
    }

    const subtotal = items.reduce(
      (sum, item) => sum + asNumber(item.unitPrice) * asNumber(item.quantity),
      0,
    );
    const quoteNumber = `BTL-PER-${Date.now()}`;
    const customerType =
      customQuoteDraft.customerMode === "registered"
        ? "Cliente cadastrado"
        : "Cliente temporario";

    const quoteResult = await supabase
      .from("custom_quotes")
      .insert({
        created_by: authUser.value?.id ? String(authUser.value.id) : null,
        currency: "MZN",
        customer_address: customQuoteDraft.morada.trim(),
        customer_contact: contacto,
        customer_name: customerName,
        customer_nuit: customQuoteDraft.nuit.trim(),
        customer_type: customerType,
        notes: customQuoteDraft.notes.trim(),
        profile_id:
          customQuoteDraft.customerMode === "registered" &&
          customQuoteDraft.profileId
            ? customQuoteDraft.profileId
            : null,
        quote_number: quoteNumber,
        selected_items: items,
        service_slug: customQuoteDraft.serviceSlug || items[0]?.serviceSlug || null,
        status: "enviado",
        subtotal,
        total: subtotal,
      })
      .select("id")
      .single();

    if (quoteResult.error || !quoteResult.data) {
      showToast$(
        "Cotacao nao guardada",
        "Nao foi possivel criar a cotacao personalizada agora.",
      );
      return;
    }

    const quoteId = quoteResult.data.id as string;
    const itemsResult = await supabase.from("custom_quote_items").insert(
      items.map((item) => ({
        category: item.category || "Produto",
        custom_quote_id: quoteId,
        image_url: item.imageUrl,
        name: item.name,
        product_id: item.id,
        quantity: item.quantity,
        service_slug: item.serviceSlug,
        structure: item.structure,
        total: asNumber(item.unitPrice) * asNumber(item.quantity),
        unit: item.unit || "Un",
        unit_price: item.unitPrice,
      })),
    );

    if (itemsResult.error) {
      showToast$(
        "Cotacao parcial",
        "A cotacao foi criada, mas os artigos nao foram guardados corretamente.",
      );
      return;
    }

    showToast$(
      "Cotacao personalizada criada",
      `${quoteNumber} de ${customerName} foi guardada com ${items.length} artigo(s).`,
    );
    customQuoteLastCreatedId.value = quoteId;
    await resetCustomQuoteDraft$();
    customQuoteFormOpen.value = false;
    customQuoteTableOpen.value = true;
    await refreshOwnerContent$();
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

    if (!supabase) {
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

  const requestToggleContent$ = $(
    (table: AdminContentTable, id: string, active: boolean, label: string) => {
      confirmTitle.value = active ? "Ativar item" : "Desativar item";
      confirmMessage.value = active
        ? `Deseja ativar "${label}" para ficar disponivel no sistema?`
        : `Deseja desativar "${label}" e ocultar do publico?`;
      confirmLabel.value = active ? "Ativar" : "Desativar";
      confirmTone.value = active ? "default" : "danger";
      confirmAction.active = active;
      confirmAction.id = id;
      confirmAction.table = table;
      confirmAction.type = "toggle";
      confirmOpen.value = true;
    },
  );

  const requestDeleteContent$ = $(
    (table: AdminContentTable, id: string, label: string) => {
      confirmTitle.value = "Eliminar item";
      confirmMessage.value = `Deseja eliminar "${label}" definitivamente? Esta acao nao pode ser desfeita.`;
      confirmLabel.value = "Eliminar";
      confirmTone.value = "danger";
      confirmAction.active = false;
      confirmAction.id = id;
      confirmAction.table = table;
      confirmAction.type = "delete";
      confirmOpen.value = true;
    },
  );

  const confirmPendingAction$ = $(async () => {
    if (!confirmAction.table || !confirmAction.id) {
      await closeConfirm$();
      return;
    }

    const table = confirmAction.table;
    const id = confirmAction.id;
    const active = confirmAction.active;
    const type = confirmAction.type;

    await closeConfirm$();

    if (type === "toggle") {
      await toggleContent$(table, id, active);
      return;
    }

    if (type === "delete") {
      await deleteContent$(table, id);
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
    structureOptionDraft.stepsText = option.steps.join("\n");
    structureOptionDraft.structure = option.structure;
    structureOptionDraft.structureCostPercentage = asNumber(
      option.structure_cost_percentage,
    );
    structureOptionDraft.title = option.title;

    showToast$("Estrutura em edicao", option.title);
  });

  const editTemplate$ = $((template: AdminQuoteTemplate) => {
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
    templateDraft.structureCostPercentage = asNumber(
      template.structure_cost_percentage,
    );
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

  const openQuoteProcedure$ = $((quoteId: string) => {
    const quote = operatorQuotes.value.find((item) => item.id === quoteId);
    const draft = drafts[quoteId];

    quoteProcedureQuoteId.value = quoteId;
    quoteProcedureOperatorId.value = quote?.technician_id ?? "";
    quoteProcedureStepIndex.value = 0;

    if (draft) {
      draft.status = "Em avaliacao";
      draft.progress = Math.max(5, draft.progress || 0);
    }

    quoteProcedureOpen.value = true;
  });

  const closeQuoteProcedure$ = $(() => {
    quoteProcedureOpen.value = false;
    quoteProcedureQuoteId.value = "";
    quoteProcedureOperatorId.value = "";
    quoteProcedureStepIndex.value = 0;
  });

  const saveQuoteProcedure$ = $(async () => {
    const supabase = getSupabaseBrowserClient();
    const quote = operatorQuotes.value.find(
      (item) => item.id === quoteProcedureQuoteId.value,
    );
    const draft = quote ? drafts[quote.id] : null;
    const operator = ownerOperators.value.find(
      (item) => item.id === quoteProcedureOperatorId.value,
    );

    if (!supabase || !quote || !draft || !operator) {
      showToast$(
        "Procedimento incompleto",
        "Escolha uma solicitacao e um tecnico operador para proceder.",
      );
      return;
    }

    const structureKey =
      typeof quote.request_payload?.structureType === "string"
        ? quote.request_payload.structureType
        : "";
    const structure = ownerStructureOptions.value.find(
      (option) =>
        option.service_slug === quote.service_slug &&
        option.structure === structureKey,
    );
    const steps = structure?.steps ?? [];
    const selectedStep =
      steps[quoteProcedureStepIndex.value] ??
      (draft.nextStep || "Estudar a area e validar os dados do servico.");
    const operatorName =
      operator.full_name || operator.email || operator.phone || "Operador Bitoll";

    const { error } = await supabase
      .from("quotes")
      .update({
        next_step: selectedStep,
        progress: Math.max(5, draft.progress || 0),
        status: statusToDatabase("Em avaliacao"),
        technician: operatorName,
        technician_id: operator.id,
        updated_at: new Date().toISOString(),
        updates: [
          `Solicitacao recebida e atribuida ao operador ${operatorName}.`,
          `Passo atual: ${selectedStep}`,
        ],
      })
      .eq("id", quote.id);

    if (!error) {
      await refreshOperatorQuotes$();
      closeQuoteProcedure$();
    }

    showToast$(
      error ? "Erro ao proceder" : "Solicitacao procedida",
      error
        ? "Nao foi possivel guardar o tecnico operador agora."
        : `A solicitacao foi atribuida a ${operatorName}.`,
    );
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
    ownerCustomers,
    ownerCustomQuotes,
    ownerOperators,

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
    quoteProcedureOpen,
    quoteProcedureQuoteId,
    quoteProcedureOperatorId,
    quoteProcedureStepIndex,

    feedback,

    toastOpen,
    toastTitle,
    toastMessage,
    showToast$,
    closeToast$,

    detailsOpen,
    detailsImageUrl,
    detailsTitle,
    detailsMessage,
    showDetails$,
    closeDetails$,

    confirmOpen,
    confirmTitle,
    confirmMessage,
    confirmLabel,
    confirmTone,
    closeConfirm$,
    confirmPendingAction$,

    drafts,

    serviceDraft,
    structureOptionDraft,
    productDraft,
    templateDraft,
    promotionDraft,
    customQuoteDraft,
    customQuoteProductPickerOpen,
    customQuoteProductSearch,
    customQuoteFormOpen,
    customQuoteLastCreatedId,
    customQuoteTableOpen,

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
    saveCustomQuote$,
    saveQuoteProgress$,
    openQuoteProcedure$,
    closeQuoteProcedure$,
    saveQuoteProcedure$,

    toggleContent$,
    deleteContent$,
    requestToggleContent$,
    requestDeleteContent$,

    editService$,
    editStructureOption$,
    editProduct$,
    editTemplate$,
    editPromotion$,

    resetCustomQuoteDraft$,
    selectCustomQuoteCustomer$,
    addCustomQuoteProduct$,
    updateCustomQuoteItemQuantity$,
    removeCustomQuoteItem$,
  };
};

export type AdminPanelState = ReturnType<typeof useAdminPanel>;
