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
  markLocalAuthSession,
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
  getStructureEstimatedDays,
  normalizeStructureSteps,
  statusToDatabase,
  toSlug,
} from "../utils/admin.utils";

import type {
  AdminCustomer,
  AdminCustomQuote,
  AdminMetric,
  AdminOperatorUser,
  AdminProcedureStep,
  AdminProduct,
  AdminPromotion,
  AdminQuoteTemplate,
  AdminSearchEntry,
  AdminSearchSource,
  AdminService,
  AdminStructureStep,
  AdminStructureOption,
  AdminTemplateField,
  AdminTemplateItem,
  AdminTemplateRule,
  AdminUserProfile,
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
  | "search_entries"
  | "search_sources"
  | "service_products"
  | "service_structure_options"
  | "service_quote_templates"
  | "services";

type AdminConfirmAction = "toggle" | "delete" | "";

const normalizeProcedureSteps = (value: unknown): AdminProcedureStep[] =>
  Array.isArray(value)
    ? value
        .map((item) => {
          if (typeof item === "string") {
            return { checked: false, day: 1, label: item.trim() };
          }

          if (!item || typeof item !== "object") {
            return null;
          }

          const record = item as Record<string, unknown>;
          const label =
            typeof record.label === "string"
              ? record.label
              : typeof record.text === "string"
                ? record.text
                : "";

          return {
            checked: Boolean(record.checked),
            day: Math.max(
              1,
              Math.ceil(
                typeof record.day === "number" || typeof record.day === "string"
                  ? asNumber(record.day)
                  : 1,
              ),
            ),
            label: label.trim(),
          };
        })
        .filter((step): step is AdminProcedureStep => Boolean(step?.label))
    : [];

const getDateAfterDays = (startDate: string, days: number) => {
  const date = startDate ? new Date(`${startDate}T00:00:00`) : new Date();

  date.setDate(date.getDate() + Math.max(1, Math.ceil(days)));

  return date.toISOString().slice(0, 10);
};

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
  const ownerSearchEntries = useSignal<AdminSearchEntry[]>([]);
  const ownerSearchSources = useSignal<AdminSearchSource[]>([]);
  const ownerCustomers = useSignal<AdminCustomer[]>([]);
  const ownerCustomQuotes = useSignal<AdminCustomQuote[]>([]);
  const ownerAdminUsers = useSignal<AdminUserProfile[]>([]);
  const ownerOperators = useSignal<AdminOperatorUser[]>([]);

  const ownerTab = useSignal<OwnerTab>("services");
  const ownerSearch = useSignal("");
  const showOwnerForm = useSignal(false);

  const editingServiceId = useSignal("");
  const editingStructureOptionId = useSignal("");
  const editingProductId = useSignal("");
  const editingTemplateId = useSignal("");
  const editingPromotionId = useSignal("");
  const editingSearchEntryId = useSignal("");

  const openServiceActionsId = useSignal("");
  const openStructureActionsId = useSignal("");
  const openProductActionsId = useSignal("");
  const openTemplateActionsId = useSignal("");
  const openPromotionActionsId = useSignal("");
  const quoteProcedureOpen = useSignal(false);
  const quoteProcedureQuoteId = useSignal("");
  const quoteProcedureOperatorId = useSignal("");
  const quoteProcedureStartDate = useSignal("");
  const quoteProcedurePaymentType = useSignal<"" | "proforma" | "labor">("");
  const quoteProcedurePaymentAmount = useSignal(0);
  const quoteProcedurePaymentMethod = useSignal<"" | "cash" | "account">("");
  const quoteProcedurePaymentOriginType = useSignal<
    "" | "BIM" | "BCI" | "E-Mola" | "M-Pesa"
  >("");
  const quoteProcedurePaymentOriginNumber = useSignal("");
  const quoteProcedurePaymentDestinationType = useSignal<
    "" | "BIM" | "BCI" | "E-Mola" | "M-Pesa"
  >("");
  const quoteProcedurePaymentDestinationNumber = useSignal("");
  const quoteProcedureReceiptNumber = useSignal("");
  const quoteProcedureReceiptUrl = useSignal("");
  const quoteProcedureSteps = useStore({
    items: [] as AdminProcedureStep[],
  });

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

  const searchEntryDraft = useStore({
    active: true,
    category: "",
    description: "",
    price: 0,
    relatedService: "",
    sortOrder: 10,
    status: "Ativo",
    title: "",
    type: "service" as AdminSearchEntry["type"],
  });

  const productDraft = useStore({
    active: true,
    brand: "",
    imageName: "",
    imagePreviewUrl: "",
    imageUrl: "",
    name: "",
    shortName: "",
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
    steps: [] as AdminStructureStep[],
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
  const editingCustomQuoteId = useSignal("");
  const customQuoteFormOpen = useSignal(false);
  const customQuoteLastCreatedId = useSignal("");
  const customQuoteTableOpen = useSignal(false);
  const customQuoteDraft = useStore({
    commitmentTerms: "",
    contacto: "",
    currency: "MZN",
    customerMode: "registered" as "registered" | "temporary",
    customerName: "",
    executionBaseItemId: "",
    executionDescription: "Instalacao, configuracao e testes",
    executionUnitPrice: 0,
    items: [] as CustomQuoteDraftItem[],
    morada: "",
    notes: "",
    nuit: "",
    profileId: "",
    serviceSlug: "",
    sourceTemplateId: "",
    structure: "",
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
    productDraft.shortName = "";
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
    structureOptionDraft.steps = [];
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

  const resetSearchEntryDraft$ = $(() => {
    editingSearchEntryId.value = "";

    searchEntryDraft.active = true;
    searchEntryDraft.category = "";
    searchEntryDraft.description = "";
    searchEntryDraft.price = 0;
    searchEntryDraft.relatedService = "";
    searchEntryDraft.sortOrder = 10;
    searchEntryDraft.status = "Ativo";
    searchEntryDraft.title = "";
    searchEntryDraft.type = "service";
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
    ownerSearchEntries.value = content.searchEntries;
    ownerSearchSources.value = content.searchSources.length
      ? content.searchSources
      : [
          {
            active: true,
            description: "Permite pesquisar nos servicos publicados.",
            id: "services",
            label: "Servicos",
            sort_order: 10,
            source_key: "services",
          },
          {
            active: true,
            description: "Permite pesquisar nos artigos publicados.",
            id: "products",
            label: "Artigos",
            sort_order: 20,
            source_key: "products",
          },
          {
            active: true,
            description: "Permite pesquisar nas promocoes publicadas.",
            id: "promotions",
            label: "Promocoes",
            sort_order: 30,
            source_key: "promotions",
          },
          {
            active: false,
            description: "Permite ao cliente pesquisar as suas solicitacoes.",
            id: "requests",
            label: "Solicitacoes",
            sort_order: 40,
            source_key: "requests",
          },
        ];
    ownerCustomers.value = content.customers;
    ownerCustomQuotes.value = content.customQuotes;
    ownerAdminUsers.value = content.adminUsers;
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

  const saveSearchEntry$ = $(async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !searchEntryDraft.title.trim()) {
      feedback.value = "Informe pelo menos o titulo que deve aparecer na pesquisa.";
      showToast$("Pesquisa incompleta", feedback.value);
      return;
    }

    const searchPayload = {
      active: searchEntryDraft.active,
      category: searchEntryDraft.category.trim(),
      description: searchEntryDraft.description.trim(),
      price: searchEntryDraft.price ? asNumber(searchEntryDraft.price) : null,
      related_service: searchEntryDraft.relatedService.trim(),
      sort_order: Math.max(0, Math.floor(asNumber(searchEntryDraft.sortOrder))),
      status: searchEntryDraft.status.trim(),
      title: searchEntryDraft.title.trim(),
      type: searchEntryDraft.type,
      updated_at: new Date().toISOString(),
    };

    const { error } = editingSearchEntryId.value
      ? await supabase
          .from("search_entries")
          .update(searchPayload)
          .eq("id", editingSearchEntryId.value)
      : await supabase.from("search_entries").insert(searchPayload);

    feedback.value = error
      ? "Nao foi possivel guardar o item de pesquisa."
      : "Item de pesquisa guardado.";

    showToast$(
      error ? "Erro na pesquisa" : "Pesquisa atualizada",
      feedback.value,
    );

    if (!error) {
      await resetSearchEntryDraft$();
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
      short_name: productDraft.shortName.trim(),
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
      steps: normalizeStructureSteps(structureOptionDraft.steps),
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
      structureOptionDraft.steps = normalizeStructureSteps(existingStructure.steps);
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
    editingCustomQuoteId.value = "";
    customQuoteDraft.commitmentTerms = "";
    customQuoteDraft.contacto = "";
    customQuoteDraft.currency = "MZN";
    customQuoteDraft.customerMode = "registered";
    customQuoteDraft.customerName = "";
    customQuoteDraft.executionBaseItemId = "";
    customQuoteDraft.executionDescription = "Instalacao, configuracao e testes";
    customQuoteDraft.executionUnitPrice = 0;
    customQuoteDraft.items = [];
    customQuoteDraft.morada = "";
    customQuoteDraft.notes = "";
    customQuoteDraft.nuit = "";
    customQuoteDraft.profileId = "";
    customQuoteDraft.serviceSlug = "";
    customQuoteDraft.sourceTemplateId = "";
    customQuoteDraft.structure = "";
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
        productId: product.id,
        quantity: 1,
        shortName: product.short_name || "",
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

    if (customQuoteDraft.executionBaseItemId === productId) {
      customQuoteDraft.executionBaseItemId = "";
    }
  });

  const applyCustomQuoteTemplate$ = $((templateId: string) => {
    customQuoteDraft.sourceTemplateId = templateId;

    const template = ownerTemplates.value.find((item) => item.id === templateId);

    if (!template) {
      customQuoteDraft.items = [];
      return;
    }

    const templateItems = ownerTemplateItems.value.filter(
      (item) => item.template_id === template.id,
    );
    const items = templateItems.map((templateItem) => {
      const product = templateItem.product_id
        ? ownerProducts.value.find((item) => item.id === templateItem.product_id)
        : null;

      return {
        category: product?.category || "Produto",
        id: product?.id || templateItem.id,
        imageUrl: product?.image_url || "",
        name: product?.name || templateItem.name,
        productId: product?.id ?? null,
        quantity: Math.max(1, asNumber(templateItem.default_quantity) || 1),
        shortName: product?.short_name || "",
        serviceSlug: product?.service_slug || template.service_slug,
        structure: product?.structure || template.structure,
        unit: product?.unit || templateItem.unit || "Un",
        unitPrice: asNumber(product?.unit_price ?? templateItem.unit_price),
      };
    });

    for (const rule of ownerTemplateRules.value.filter(
      (item) => item.template_id === template.id,
    )) {
      if (!rule.source_product_id || !rule.target_product_id) {
        continue;
      }

      const source = items.find((item) => item.productId === rule.source_product_id);
      const targetIndex = items.findIndex(
        (item) => item.productId === rule.target_product_id,
      );

      if (!source || targetIndex < 0) {
        continue;
      }

      const formulaSteps = Array.isArray(rule.formula_steps)
        ? rule.formula_steps
        : [];
      const baseSteps =
        formulaSteps.length > 0
          ? formulaSteps
          : [
              { operator: "multiply", value: asNumber(rule.multiplier) || 1 },
              { operator: "divide", value: Math.max(1, asNumber(rule.divisor) || 1) },
            ];
      const calculated = baseSteps.reduce((total, step) => {
        const value = asNumber(step.value);

        if (step.operator === "add") {
          return total + value;
        }

        if (step.operator === "subtract") {
          return total - value;
        }

        if (step.operator === "divide") {
          return value ? total / value : total;
        }

        return total * value;
      }, asNumber(source.quantity));
      const rounded =
        rule.rounding === "floor"
          ? Math.floor(calculated)
          : rule.rounding === "round"
            ? Math.round(calculated)
            : Math.ceil(calculated);

      items[targetIndex] = {
        ...items[targetIndex],
        quantity: Math.max(asNumber(rule.min_quantity) || 1, rounded),
      };
    }

    customQuoteDraft.serviceSlug = template.service_slug;
    customQuoteDraft.structure = template.structure;
    customQuoteDraft.currency = template.currency || "MZN";
    customQuoteDraft.executionBaseItemId = template.labor_product_id || "";
    customQuoteDraft.executionDescription = "Instalacao, configuracao e testes";
    customQuoteDraft.executionUnitPrice = asNumber(template.labor_unit_price);
    customQuoteDraft.items = items;
    customQuoteDraft.notes = template.notes
      ? `${template.title}\n${template.notes}`.trim()
      : template.title;
  });

  const saveCustomQuote$ = $(async () => {
    const supabase = getSupabaseBrowserClient();
    const customerName = customQuoteDraft.customerName.trim();
    const contacto = customQuoteDraft.contacto.trim();
    const productItems = customQuoteDraft.items.filter(
      (item) => item.quantity > 0,
    );
    const executionBaseItem = productItems.find(
      (item) => item.id === customQuoteDraft.executionBaseItemId,
    );
    const executionUnitPrice = asNumber(customQuoteDraft.executionUnitPrice);
    const executionItem =
      executionBaseItem && executionUnitPrice > 0
        ? {
            category: "Servico",
            id: `execution-${executionBaseItem.id}`,
            imageUrl: "",
            linkedBaseItemId: executionBaseItem.id,
            name:
              customQuoteDraft.executionDescription.trim() ||
              "Instalacao, configuracao e testes",
            productId: null,
            quantity: Math.max(1, asNumber(executionBaseItem.quantity) || 1),
            serviceSlug:
              customQuoteDraft.serviceSlug || executionBaseItem.serviceSlug,
            structure: executionBaseItem.structure,
            unit: executionBaseItem.unit || "Un",
            unitPrice: executionUnitPrice,
          }
        : null;
    const items = executionItem
      ? [...productItems, executionItem]
      : productItems;

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

    if (productItems.length === 0) {
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
    const quotePayload = {
      commitment_terms: customQuoteDraft.commitmentTerms.trim(),
      currency: customQuoteDraft.currency || "MZN",
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
      selected_items: items,
      service_slug: customQuoteDraft.serviceSlug || items[0]?.serviceSlug || null,
      source_quote_template_id: customQuoteDraft.sourceTemplateId || null,
      status: "em_processamento",
      structure:
        customQuoteDraft.structure ||
        items.find((item) => item.structure)?.structure ||
        null,
      subtotal,
      total: subtotal,
      updated_at: new Date().toISOString(),
    };

    const quoteResult = editingCustomQuoteId.value
      ? await supabase
          .from("custom_quotes")
          .update(quotePayload)
          .eq("id", editingCustomQuoteId.value)
          .select("id,quote_number")
          .single()
      : await supabase
          .from("custom_quotes")
          .insert({
            ...quotePayload,
            created_by: authUser.value?.id ? String(authUser.value.id) : null,
            quote_number: quoteNumber,
          })
          .select("id,quote_number")
          .single();

    if (quoteResult.error || !quoteResult.data) {
      const message =
        quoteResult.error?.message ||
        "Nao foi possivel criar a cotacao personalizada agora.";

      console.error("Erro ao criar cotacao personalizada", quoteResult.error);
      showToast$(
        "Cotacao nao guardada",
        message,
      );
      return;
    }

    const quoteId = quoteResult.data.id as string;
    const savedQuoteNumber =
      typeof quoteResult.data.quote_number === "string"
        ? quoteResult.data.quote_number
        : quoteNumber;

    if (editingCustomQuoteId.value) {
      const deleteItemsResult = await supabase
        .from("custom_quote_items")
        .delete()
        .eq("custom_quote_id", quoteId);

      if (deleteItemsResult.error) {
        console.error(
          "Erro ao substituir artigos da cotacao personalizada",
          deleteItemsResult.error,
        );
        showToast$(
          "Cotacao nao atualizada",
          deleteItemsResult.error.message ||
            "Nao foi possivel preparar os artigos para atualizar a cotacao.",
        );
        return;
      }
    }

    const itemsResult = await supabase.from("custom_quote_items").insert(
      items.map((item) => ({
        category: item.category || "Produto",
        custom_quote_id: quoteId,
        image_url: item.imageUrl,
        name: item.name,
        product_id: item.productId,
        quantity: item.quantity,
        service_slug: item.serviceSlug,
        structure: item.structure,
        total: asNumber(item.unitPrice) * asNumber(item.quantity),
        unit: item.unit || "Un",
        unit_price: item.unitPrice,
      })),
    );

    if (itemsResult.error) {
      console.error(
        "Erro ao guardar artigos da cotacao personalizada",
        itemsResult.error,
      );
      showToast$(
        "Cotacao parcial",
        itemsResult.error.message ||
          "A cotacao foi criada, mas os artigos nao foram guardados corretamente.",
      );
      return;
    }

    showToast$(
      editingCustomQuoteId.value
        ? "Cotacao personalizada atualizada"
        : "Cotacao personalizada criada",
      `${savedQuoteNumber} de ${customerName} foi guardada com ${items.length} artigo(s).`,
    );
    customQuoteLastCreatedId.value = quoteId;
    await resetCustomQuoteDraft$();
    customQuoteFormOpen.value = false;
    customQuoteTableOpen.value = true;
    await refreshOwnerContent$();
  });

  const activateCustomQuoteRequest$ = $(async (quote: AdminCustomQuote) => {
    const supabase = getSupabaseBrowserClient();
    const items = Array.isArray(quote.selected_items)
      ? quote.selected_items.filter((item) => item.quantity > 0)
      : [];

    if (!supabase) {
      showToast$(
        "Base de dados indisponivel",
        "Nao foi possivel abrir a ligacao com a base de dados.",
      );
      return;
    }

    if (items.length === 0) {
      showToast$(
        "Cotacao sem artigos",
        "Adicione artigos antes de ativar esta cotacao como solicitacao.",
      );
      return;
    }

    const existingQuote = await supabase
      .from("quotes")
      .select("id,status")
      .eq("quote_number", quote.quote_number)
      .maybeSingle();

    if (existingQuote.error) {
      showToast$(
        "Solicitacao nao verificada",
        existingQuote.error.message ||
          "Nao foi possivel confirmar se esta cotacao ja esta nas solicitacoes.",
      );
      return;
    }

    if (existingQuote.data?.id) {
      const proformaStatus =
        existingQuote.data.status === "finalizado" ||
        existingQuote.data.status === "concluido"
          ? "fatura_proforma_cumprida"
          : existingQuote.data.status === "em_atividade" ||
              existingQuote.data.status === "aprovado" ||
              existingQuote.data.status === "reclamacao"
            ? "recebido"
            : "enviado";

      await supabase
        .from("custom_quotes")
        .update({
          status: proformaStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", quote.id);

      showToast$(
        "Fatura proforma enviada",
        `${quote.quote_number} ja aparece na area de solicitacoes.`,
      );
      await refreshOwnerContent$();
      await refreshOperatorQuotes$();
      return;
    }

    const laborTotal = items
      .filter((item) => item.category.toLowerCase() === "servico")
      .reduce(
        (sum, item) => sum + asNumber(item.unitPrice) * asNumber(item.quantity),
        0,
      );
    const total = asNumber(quote.total);
    const quoteResult = await supabase
      .from("quotes")
      .insert({
        currency: quote.currency || "MZN",
        customer_snapshot: {
          address: quote.customer_address,
          city: quote.customer_address,
          contacto: quote.customer_contact,
          contact: quote.customer_contact,
          customerType: quote.customer_type,
          email: quote.customer_contact.includes("@")
            ? quote.customer_contact
            : "",
          name: quote.customer_name,
          nuit: quote.customer_nuit,
          phone: quote.customer_contact,
          source: "Cotacao personalizada",
        },
        labor_total: laborTotal,
        profile_id: quote.profile_id,
        quote_number: quote.quote_number,
        request_payload: {
          commitmentTerms: quote.commitment_terms,
          contact: quote.customer_contact,
          contacto: quote.customer_contact,
          customerAddress: quote.customer_address,
          customerName: quote.customer_name,
          customerNuit: quote.customer_nuit,
          customerType: quote.customer_type,
          customQuoteId: quote.id,
          customQuoteNumber: quote.quote_number,
          notes: quote.notes,
          selectedItems: items,
          source: "custom_quote",
          structureType: quote.structure,
        },
        service_slug: quote.service_slug,
        status: "em_processamento",
        subtotal: asNumber(quote.subtotal) || total,
        total,
      })
      .select("id")
      .single();

    if (quoteResult.error || !quoteResult.data) {
      showToast$(
        "Solicitacao nao ativada",
        quoteResult.error?.message ||
          "Nao foi possivel colocar esta cotacao nas solicitacoes.",
      );
      return;
    }

    const itemsResult = await supabase.from("quote_items").insert(
      items.map((item) => ({
        locked: true,
        name: item.name,
        quantity: item.quantity,
        quote_id: quoteResult.data.id,
        unit: item.unit || "Un",
        unit_price: item.unitPrice,
      })),
    );

    if (itemsResult.error) {
      showToast$(
        "Solicitacao parcial",
        itemsResult.error.message ||
          "A solicitacao foi criada, mas os artigos nao foram ligados corretamente.",
      );
      return;
    }

    await supabase
      .from("custom_quotes")
      .update({
        status: "enviado",
        updated_at: new Date().toISOString(),
      })
      .eq("id", quote.id);

    showToast$(
      "Fatura proforma enviada",
      `${quote.quote_number} ja esta em solicitacoes, pronta para proceder.`,
    );
    await refreshOwnerContent$();
    await refreshOperatorQuotes$();
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
    productDraft.shortName = product.short_name || "";
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
    structureOptionDraft.steps = normalizeStructureSteps(option.steps);
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

  const editSearchEntry$ = $((entry: AdminSearchEntry) => {
    editingSearchEntryId.value = entry.id;
    showOwnerForm.value = true;

    searchEntryDraft.active = entry.active;
    searchEntryDraft.category = entry.category || "";
    searchEntryDraft.description = entry.description || "";
    searchEntryDraft.price = asNumber(entry.price ?? 0);
    searchEntryDraft.relatedService = entry.related_service || "";
    searchEntryDraft.sortOrder = asNumber(entry.sort_order || 10);
    searchEntryDraft.status = entry.status || "";
    searchEntryDraft.title = entry.title;
    searchEntryDraft.type = entry.type || "service";

    showToast$("Item de pesquisa em edicao", entry.title);
  });

  const editCustomQuote$ = $((quote: AdminCustomQuote) => {
    const selectedItems = Array.isArray(quote.selected_items)
      ? quote.selected_items
      : [];
    const executionItem = selectedItems.find(
      (item) =>
        !item.productId &&
        item.category.toLowerCase() === "servico" &&
        item.name.toLowerCase().includes("instal"),
    );
    const productItems = selectedItems.filter((item) => item !== executionItem);

    editingCustomQuoteId.value = quote.id;
    customQuoteFormOpen.value = true;
    customQuoteTableOpen.value = true;
    customQuoteProductPickerOpen.value = false;
    customQuoteProductSearch.value = "";

    customQuoteDraft.commitmentTerms = quote.commitment_terms || "";
    customQuoteDraft.contacto = quote.customer_contact || "";
    customQuoteDraft.currency = quote.currency || "MZN";
    customQuoteDraft.customerMode = quote.profile_id ? "registered" : "temporary";
    customQuoteDraft.customerName = quote.customer_name || "";
    customQuoteDraft.executionBaseItemId =
      executionItem?.linkedBaseItemId ?? "";
    customQuoteDraft.executionDescription =
      executionItem?.name || "Instalacao, configuracao e testes";
    customQuoteDraft.executionUnitPrice = asNumber(executionItem?.unitPrice);
    customQuoteDraft.items = productItems.map((item) => {
      const productId = item.productId || item.id || null;
      const product = productId
        ? ownerProducts.value.find((productItem) => productItem.id === productId)
        : null;

      return {
        category: item.category || product?.category || "Produto",
        id: item.id || product?.id || crypto.randomUUID(),
        imageUrl: item.imageUrl || product?.image_url || "",
        name: item.name || product?.name || "Artigo",
        productId: product?.id ?? productId,
        quantity: Math.max(1, asNumber(item.quantity) || 1),
        shortName: item.shortName || product?.short_name || "",
        serviceSlug:
          item.serviceSlug || product?.service_slug || quote.service_slug || "",
        structure: item.structure || product?.structure || "",
        unit: item.unit || product?.unit || "Un",
        unitPrice: asNumber(item.unitPrice ?? product?.unit_price),
      };
    });
    customQuoteDraft.morada = quote.customer_address || "";
    customQuoteDraft.notes = quote.notes || "";
    customQuoteDraft.nuit = quote.customer_nuit || "";
    customQuoteDraft.profileId = quote.profile_id ?? "";
    customQuoteDraft.serviceSlug = quote.service_slug ?? "";
    customQuoteDraft.sourceTemplateId = quote.source_quote_template_id ?? "";
    customQuoteDraft.structure =
      quote.structure ?? productItems[0]?.structure ?? "";

    showToast$("Cotacao em edicao", quote.quote_number);
  });

  const saveAdminUserRole$ = $(async (
    userId: string,
    role: "owner" | "admin" | "operador" | "",
  ) => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !userId) {
      return;
    }

    const { error } = role
      ? await supabase.from("admin_users").upsert(
          {
            active: true,
            role,
            updated_at: new Date().toISOString(),
            user_id: userId,
          },
          { onConflict: "user_id" },
        )
      : await supabase
          .from("admin_users")
          .update({
            active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

    showToast$(
      error ? "Erro no usuario" : "Usuario atualizado",
      error
        ? "Nao foi possivel atualizar o papel administrativo."
        : role
          ? "O usuario recebeu o papel administrativo escolhido."
          : "O acesso administrativo deste usuario foi desativado.",
    );

    if (!error) {
      await refreshOwnerContent$();
    }
  });

  const saveQuoteProgress$ = $(async (quoteId: string, complaintText = "") => {
    const supabase = getSupabaseBrowserClient();
    const quote = operatorQuotes.value.find((item) => item.id === quoteId);
    const draft = drafts[quoteId];

    if (!supabase || !quote || !draft) {
      return;
    }

    const requestPayload =
      quote.request_payload && typeof quote.request_payload === "object"
        ? quote.request_payload
        : {};
    const steps = normalizeProcedureSteps(requestPayload.procedureSteps);
    const completedSteps = steps.filter((step) => step.checked).length;
    const hasSteps = steps.length > 0;
    const allStepsCompleted = hasSteps && completedSteps === steps.length;
    const firstOpenStep = steps.find((step) => !step.checked);
    const progress = hasSteps
      ? Math.round((completedSteps / steps.length) * 100)
      : draft.status === "Finalizado"
        ? 100
        : draft.progress;
    const complaint = complaintText.trim();
    const previousComplaints = Array.isArray(requestPayload.complaints)
      ? requestPayload.complaints
      : [];
    const updates = draft.updatesText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const nextUpdates = [
      ...updates,
      ...(hasSteps
        ? [
            `Passos concluidos: ${completedSteps}/${steps.length}.`,
            ...(firstOpenStep
              ? [`Proximo passo: ${firstOpenStep.label}.`]
              : ["Todos os passos foram concluidos."]),
          ]
        : []),
      ...(complaint ? [`Reclamacao do operador: ${complaint}`] : []),
    ];
    const nextStatus = complaint
      ? "Reclamacao"
      : allStepsCompleted
        ? "Finalizado"
        : "Em actividade";

    const { error } = await supabase
      .from("quotes")
      .update({
        estimated_completion: draft.estimatedCompletion || null,
        next_step:
          firstOpenStep?.label ??
          (allStepsCompleted ? "Servico terminado." : draft.nextStep),
        progress,
        request_payload: {
          ...requestPayload,
          complaints: complaint
            ? [
                ...previousComplaints,
                {
                  author: "operador",
                  createdAt: new Date().toISOString(),
                  message: complaint,
                },
              ]
            : previousComplaints,
          procedureSteps: steps,
        },
        status: statusToDatabase(nextStatus as ProjectStatus),
        technician: draft.technician,
        updated_at: new Date().toISOString(),
        updates: nextUpdates,
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
      if (
        allStepsCompleted &&
        quote.request_payload?.source === "custom_quote" &&
        typeof quote.request_payload?.customQuoteId === "string"
      ) {
        await supabase
          .from("custom_quotes")
          .update({
            status: "fatura_proforma_cumprida",
            updated_at: new Date().toISOString(),
          })
          .eq("id", quote.request_payload.customQuoteId);
      }
      await refreshOperatorQuotes$();
      await refreshOwnerContent$();
    }
  });

  const registerQuoteComplaint$ = $(async (quoteId: string, message: string) => {
    const supabase = getSupabaseBrowserClient();
    const quote = operatorQuotes.value.find((item) => item.id === quoteId);
    const complaint = message.trim();

    if (!supabase || !quote || !complaint) {
      showToast$(
        "Reclamacao incompleta",
        "Escreva o motivo da reclamacao antes de guardar.",
      );
      return false;
    }

    const requestPayload =
      quote.request_payload && typeof quote.request_payload === "object"
        ? quote.request_payload
        : {};
    const previousComplaints = Array.isArray(requestPayload.complaints)
      ? requestPayload.complaints
      : [];
    const updates = [
      ...asStringArray(quote.updates),
      `Reclamacao do operador: ${complaint}`,
    ];

    const { error } = await supabase
      .from("quotes")
      .update({
        next_step: "Reclamacao aberta para analise da Bitoll.",
        progress: Math.min(99, Math.max(5, asNumber(quote.progress ?? 0))),
        request_payload: {
          ...requestPayload,
          complaints: [
            ...previousComplaints,
            {
              author: "operador",
              message: complaint,
              createdAt: new Date().toISOString(),
            },
          ],
        },
        status: "reclamacao",
        updated_at: new Date().toISOString(),
        updates,
      })
      .eq("id", quoteId);

    showToast$(
      error ? "Reclamacao nao guardada" : "Reclamacao registada",
      error
        ? error.message || "Nao foi possivel guardar a reclamacao."
        : "A solicitacao foi marcada como reclamacao.",
    );

    if (!error) {
      await refreshOperatorQuotes$();
    }

    return !error;
  });

  const rollbackQuoteRequest$ = $(async (quoteId: string) => {
    const supabase = getSupabaseBrowserClient();
    const quote = operatorQuotes.value.find((item) => item.id === quoteId);
    const requestPayload =
      quote?.request_payload && typeof quote.request_payload === "object"
        ? quote.request_payload
        : {};

    if (!supabase || !quote) {
      return;
    }

    const customQuoteId =
      requestPayload.source === "custom_quote" &&
      typeof requestPayload.customQuoteId === "string"
        ? requestPayload.customQuoteId
        : "";
    const { error } = await supabase
      .from("quotes")
      .update({
        next_step:
          "A solicitacao foi recusada pela Bitoll. Contacte a equipa para esclarecimentos ou nova validacao.",
        progress: 0,
        request_payload: {
          ...requestPayload,
          refusedAt: new Date().toISOString(),
          refusedReason:
            "Solicitacao retirada antes da procedencia administrativa.",
        },
        status: "recusado",
        technician: "",
        technician_id: null,
        updated_at: new Date().toISOString(),
        updates: [
          "Solicitacao recusada antes da procedencia administrativa.",
          "A equipa Bitoll pode ser contactada para nova validacao.",
        ],
      })
      .eq("id", quoteId);

    if (!error && customQuoteId) {
      await supabase
        .from("custom_quotes")
        .update({
          status: "recusado",
          updated_at: new Date().toISOString(),
        })
        .eq("id", customQuoteId);
    }

    showToast$(
      error ? "Solicitacao nao retirada" : "Solicitacao retirada",
      error
        ? error.message || "Nao foi possivel retirar esta solicitacao."
        : customQuoteId
          ? `${quote.quote_number} saiu das solicitacoes, ficou visivel ao cliente como recusada e a fatura proforma foi marcada como recusada.`
          : `${quote.quote_number} saiu das solicitacoes e ficou visivel ao cliente como recusada. A proforma padrao nao foi alterada.`,
    );

    if (!error) {
      await refreshOwnerContent$();
      await refreshOperatorQuotes$();
    }
  });

  const openQuoteProcedure$ = $((quoteId: string) => {
    const quote = operatorQuotes.value.find((item) => item.id === quoteId);
    const draft = drafts[quoteId];
    const structureKey =
      typeof quote?.request_payload?.structureType === "string"
        ? quote.request_payload.structureType
        : "";
    const structure = ownerStructureOptions.value.find(
      (option) =>
        option.service_slug === quote?.service_slug &&
        option.structure === structureKey,
    );
    const savedProcedureSteps = normalizeProcedureSteps(
      quote?.request_payload?.procedureSteps,
    );
    const baseProcedureSteps =
      savedProcedureSteps.length > 0
        ? savedProcedureSteps
        : normalizeStructureSteps(structure?.steps ?? []).map((step) => ({
            checked: false,
            day: step.day,
            label: step.label,
          }));

    quoteProcedureQuoteId.value = quoteId;
    quoteProcedureOperatorId.value = quote?.technician_id ?? "";
    quoteProcedureStartDate.value =
      typeof quote?.request_payload?.serviceStartDate === "string"
        ? quote.request_payload.serviceStartDate
        : new Date().toISOString().slice(0, 10);
    quoteProcedurePaymentType.value =
      quote?.request_payload?.paymentType === "proforma" ||
      quote?.request_payload?.paymentType === "labor"
        ? quote.request_payload.paymentType
        : "";
    quoteProcedurePaymentAmount.value =
      typeof quote?.request_payload?.paymentAmount === "number" ||
      typeof quote?.request_payload?.paymentAmount === "string"
        ? asNumber(quote.request_payload.paymentAmount)
        : asNumber(quote?.total);
    quoteProcedurePaymentMethod.value =
      quote?.request_payload?.paymentMethod === "cash" ||
      quote?.request_payload?.paymentMethod === "account"
        ? quote.request_payload.paymentMethod
        : "";
    quoteProcedurePaymentOriginType.value =
      quote?.request_payload?.paymentOriginType === "BIM" ||
      quote?.request_payload?.paymentOriginType === "BCI" ||
      quote?.request_payload?.paymentOriginType === "E-Mola" ||
      quote?.request_payload?.paymentOriginType === "M-Pesa"
        ? quote.request_payload.paymentOriginType
        : "";
    quoteProcedurePaymentOriginNumber.value =
      typeof quote?.request_payload?.paymentOriginNumber === "string"
        ? quote.request_payload.paymentOriginNumber
        : "";
    quoteProcedurePaymentDestinationType.value =
      quote?.request_payload?.paymentDestinationType === "BIM" ||
      quote?.request_payload?.paymentDestinationType === "BCI" ||
      quote?.request_payload?.paymentDestinationType === "E-Mola" ||
      quote?.request_payload?.paymentDestinationType === "M-Pesa"
        ? quote.request_payload.paymentDestinationType
        : "";
    quoteProcedurePaymentDestinationNumber.value =
      typeof quote?.request_payload?.paymentDestinationNumber === "string"
        ? quote.request_payload.paymentDestinationNumber
        : "";
    quoteProcedureReceiptNumber.value =
      typeof quote?.request_payload?.receiptNumber === "string"
        ? quote.request_payload.receiptNumber
        : "";
    quoteProcedureReceiptUrl.value =
      typeof quote?.request_payload?.receiptUrl === "string"
        ? quote.request_payload.receiptUrl
        : "";
    quoteProcedureSteps.items = baseProcedureSteps;

    if (draft) {
      draft.status =
        quote?.status === "em_atividade" || quote?.status === "aprovado"
          ? "Em actividade"
          : databaseToStatus(quote?.status ?? "em_processamento");
      draft.progress = Math.max(5, draft.progress || 0);
    }

    quoteProcedureOpen.value = true;
  });

  const closeQuoteProcedure$ = $(() => {
    quoteProcedureOpen.value = false;
    quoteProcedureQuoteId.value = "";
    quoteProcedureOperatorId.value = "";
    quoteProcedureStartDate.value = "";
    quoteProcedurePaymentType.value = "";
    quoteProcedurePaymentAmount.value = 0;
    quoteProcedurePaymentMethod.value = "";
    quoteProcedurePaymentOriginType.value = "";
    quoteProcedurePaymentOriginNumber.value = "";
    quoteProcedurePaymentDestinationType.value = "";
    quoteProcedurePaymentDestinationNumber.value = "";
    quoteProcedureReceiptNumber.value = "";
    quoteProcedureReceiptUrl.value = "";
    quoteProcedureSteps.items = [];
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

    const steps = normalizeProcedureSteps(quoteProcedureSteps.items);
    const hasValidPayment =
      Boolean(quoteProcedurePaymentType.value) &&
      quoteProcedurePaymentAmount.value > 0 &&
      Boolean(quoteProcedurePaymentMethod.value) &&
      (quoteProcedurePaymentMethod.value === "cash" ||
        (Boolean(quoteProcedurePaymentOriginType.value) &&
          Boolean(quoteProcedurePaymentOriginNumber.value.trim()) &&
          Boolean(quoteProcedurePaymentDestinationType.value) &&
          Boolean(quoteProcedurePaymentDestinationNumber.value.trim())));
    const hasValidSteps = steps.some((step) => step.label.trim());

    if (!hasValidPayment || !quoteProcedureReceiptNumber.value) {
      showToast$(
        "Pagamento por confirmar",
        "Comprove o pagamento com valor, forma e dados da conta quando aplicavel.",
      );
      return;
    }

    if (!quoteProcedureStartDate.value) {
      showToast$(
        "Data de inicio em falta",
        "Informe a data em que a equipa inicia o servico.",
      );
      return;
    }

    if (!hasValidSteps) {
      showToast$(
        "Passos em falta",
        "Defina pelo menos um passo do servico antes de guardar.",
      );
      return;
    }

    const firstOpenStep = steps.find((step) => !step.checked) ?? steps[0];
    const selectedStep =
      firstOpenStep?.label ??
      (draft.nextStep || "Procedimento por definir.");
    const selectedStepDay = firstOpenStep?.day ?? 1;
    const estimatedDays = getStructureEstimatedDays(steps);
    const forecastMessage =
      estimatedDays > 0
        ? `Previsao do servico: ${estimatedDays} dia${
            estimatedDays === 1 ? "" : "s"
          }.`
        : "Previsao do servico ainda nao definida em dias.";
    const operatorName =
      operator.full_name || operator.email || operator.phone || "Operador Bitoll";
    const requestPayload =
      quote.request_payload && typeof quote.request_payload === "object"
        ? quote.request_payload
        : {};

    const { error } = await supabase
      .from("quotes")
      .update({
        next_step: selectedStep,
        progress: Math.max(5, draft.progress || 0),
        request_payload: {
          ...requestPayload,
          paymentType: quoteProcedurePaymentType.value,
          paymentTypeLabel:
            quoteProcedurePaymentType.value === "proforma"
              ? "Pagou a fatura proforma"
              : "Pagou mao de obra da fatura proforma",
          paymentAmount: quoteProcedurePaymentAmount.value,
          paymentMethod: quoteProcedurePaymentMethod.value,
          paymentMethodLabel:
            quoteProcedurePaymentMethod.value === "cash"
              ? "Dinheiro vivo"
              : "Conta",
          paymentOriginType: quoteProcedurePaymentOriginType.value,
          paymentOriginNumber: quoteProcedurePaymentOriginNumber.value.trim(),
          paymentDestinationType: quoteProcedurePaymentDestinationType.value,
          paymentDestinationNumber:
            quoteProcedurePaymentDestinationNumber.value.trim(),
          receiptNumber: quoteProcedureReceiptNumber.value,
          receiptUrl: quoteProcedureReceiptUrl.value,
          procedureSteps: steps,
          procedureEstimatedDays: estimatedDays,
          serviceStartDate: quoteProcedureStartDate.value,
          serviceEndDate:
            estimatedDays > 0
              ? getDateAfterDays(quoteProcedureStartDate.value, estimatedDays)
              : null,
        },
        status: "em_atividade",
        technician: operatorName,
        technician_id: operator.id,
        estimated_completion:
          estimatedDays > 0
            ? getDateAfterDays(quoteProcedureStartDate.value, estimatedDays)
            : null,
        updated_at: new Date().toISOString(),
        updates: [
          `Solicitacao recebida e atribuida ao operador ${operatorName}.`,
          "Estado: em actividade.",
          `Passo atual: ${selectedStep}`,
          `Dia previsto deste passo: ${selectedStepDay}.`,
          forecastMessage,
          ...steps.map(
            (step, index) =>
              `${step.checked ? "[x]" : "[ ]"} Passo ${index + 1}: ${
                step.label
              } - dia ${step.day}`,
          ),
        ],
      })
      .eq("id", quote.id);

    if (!error) {
      if (
        requestPayload.source === "custom_quote" &&
        typeof requestPayload.customQuoteId === "string"
      ) {
        await supabase
          .from("custom_quotes")
          .update({
            status: "recebido",
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestPayload.customQuoteId);
      }
      await refreshOwnerContent$();
      await refreshOperatorQuotes$();
      closeQuoteProcedure$();
    }

    showToast$(
      error ? "Erro ao proceder" : "Solicitacao procedida",
      error
        ? "Nao foi possivel guardar o tecnico operador agora."
        : `A solicitacao foi aprovada e atribuida a ${operatorName}.`,
    );
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      authUser.value = getCachedAuthUser();
      adminAccess.value = getCachedAdminAccess();

      const supabase = getSupabaseBrowserClient();
      const { data: sessionData } = supabase
        ? await supabase.auth.getSession()
        : { data: { session: null } };
      const sessionUserId = sessionData.session?.user.id;

      if (
        sessionData.session &&
        (!authUser.value || String(authUser.value.id) !== sessionUserId)
      ) {
        markLocalAuthSession(sessionData.session);
        authUser.value = getCachedAuthUser();
      }

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
    } finally {
      isLoading.value = false;
    }
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
    ownerSearchEntries,
    ownerSearchSources,
    ownerCustomers,
    ownerCustomQuotes,
    ownerAdminUsers,
    ownerOperators,

    ownerTab,
    ownerSearch,
    showOwnerForm,

    editingServiceId,
    editingStructureOptionId,
    editingProductId,
    editingTemplateId,
    editingPromotionId,
    editingSearchEntryId,

    openServiceActionsId,
    openStructureActionsId,
    openProductActionsId,
    openTemplateActionsId,
    openPromotionActionsId,
    quoteProcedureOpen,
    quoteProcedureQuoteId,
    quoteProcedureOperatorId,
    quoteProcedureStartDate,
    quoteProcedurePaymentType,
    quoteProcedurePaymentAmount,
    quoteProcedurePaymentMethod,
    quoteProcedurePaymentOriginType,
    quoteProcedurePaymentOriginNumber,
    quoteProcedurePaymentDestinationType,
    quoteProcedurePaymentDestinationNumber,
    quoteProcedureReceiptNumber,
    quoteProcedureReceiptUrl,
    quoteProcedureSteps,

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
    searchEntryDraft,
    customQuoteDraft,
    customQuoteProductPickerOpen,
    customQuoteProductSearch,
    editingCustomQuoteId,
    customQuoteFormOpen,
    customQuoteLastCreatedId,
    customQuoteTableOpen,

    resetServiceDraft$,
    resetStructureOptionDraft$,
    resetProductDraft$,
    resetTemplateDraft$,
    resetPromotionDraft$,
    resetSearchEntryDraft$,

    refreshOperatorQuotes$,
    refreshOwnerContent$,

    saveService$,
    saveStructureOption$,
    saveProduct$,
    saveTemplate$,
    savePromotion$,
    saveSearchEntry$,
    saveAdminUserRole$,
    saveCustomQuote$,
    activateCustomQuoteRequest$,
    saveQuoteProgress$,
    registerQuoteComplaint$,
    rollbackQuoteRequest$,
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
    editSearchEntry$,
    editCustomQuote$,

    resetCustomQuoteDraft$,
    selectCustomQuoteCustomer$,
    addCustomQuoteProduct$,
    applyCustomQuoteTemplate$,
    updateCustomQuoteItemQuantity$,
    removeCustomQuoteItem$,
  };
};

export type AdminPanelState = ReturnType<typeof useAdminPanel>;
