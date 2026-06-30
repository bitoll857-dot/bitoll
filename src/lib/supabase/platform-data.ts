import type { Component } from "@builder.io/qwik";

import ServicoCCTVVisual from "~/components/visual/ServicoCCTV";
import ServicoMotorDePortaoVisual from "~/components/visual/ServicoMotorDePortao";
import ServicoTecnologiaInteligenteVisual from "~/components/visual/ServicoTecnologiaInteligente";
import ServicoVedacaoEletricaVisual from "~/components/visual/ServicoVedacaoEletrica";
import type { CustomerProject, ProjectStatus } from "~/types/customer-project";
import type {
  Promotion,
  PromotionArticle,
} from "~/features/promotions/types/promotion.types";
import type { Service } from "~/types/services";
import type {
  ServiceProduct,
  ServiceProductCatalog,
  ServiceQuoteTemplateOption,
  ServiceStructureOption,
  StructureType,
} from "~/types/service-products";
import { searchData } from "~/data/search";
import type { SearchResult, SearchResultType } from "~/types/search";

import { getCachedAuthUser, getSupabaseBrowserClient } from "./client";
import { formatMoney } from "~/lib/formatters/money";

type ServiceRow = {
  slug: string;
  title: string;
  short_description: string;
  description: string;
  image_url: string;
  image_key: string;
  features: unknown;
  benefits: unknown;
  audience: unknown;
  technologies: unknown;
  experience: string;
};

type PromotionRow = {
  id: string;
  slug: string | null;
  service_slug: string | null;
  quote_template_id: string | null;
  title: string;
  short_description: string;
  description: string;
  discount_label: string;
  badge: string;
  image: string;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  technologies: unknown;
  features: unknown;
  articles: unknown;
  installation_fee: number | string;
  discount_amount: number | string;
  currency: string;
};

type ProductRow = {
  id: string;
  service_slug: string;
  structure: StructureType;
  name: string;
  short_name: string;
  unit: string;
  quantity_label: string;
  estimated_quantity: number | string;
  unit_price: number | string;
  brand: string;
  model: string;
  system: string;
  category: string;
  description: string;
  detail: string;
  image_url: string;
  required: boolean;
};

type StructureOptionRow = {
  active: boolean;
  description: string;
  id: string;
  image_url: string;
  service_slug: string;
  sort_order: number | string;
  structure: StructureType;
  structure_cost_percentage: number | string;
  title: string;
};

type QuoteTemplateRow = {
  currency: string;
  id: string;
  labor_product_id: string | null;
  labor_unit_price: number | string;
  service_slug: string;
  structure: StructureType;
  structure_cost_percentage: number | string;
  title: string;
};

type QuoteTemplateItemRow = {
  client_quantity_editable: boolean;
  default_quantity: number | string;
  id: string;
  name: string;
  product_id: string | null;
  quantity_field_key: string;
  required: boolean;
  template_id: string;
  unit: string;
  unit_price: number | string;
};

type QuoteTemplateRuleRow = {
  divisor: number | string;
  formula_steps:
    | {
        operator: "add" | "subtract" | "multiply" | "divide";
        value: number;
      }[]
    | null;
  min_quantity: number | string;
  multiplier: number | string;
  rounding: "ceil" | "floor" | "round";
  source_product_id: string | null;
  target_product_id: string | null;
};

type QuoteRow = {
  id: string;
  quote_number: string;
  service_slug: string | null;
  status: string;
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  total: number | string;
  currency: string;
  created_at: string;
  request_payload: Record<string, unknown> | null;
  progress: number | string | null;
  next_step: string | null;
  technician: string | null;
  estimated_completion: string | null;
  updates: unknown;
  quote_items?: {
    name: string;
    quantity: number | string;
    unit: string;
    unit_price: number | string;
  }[];
};

const serviceImages: Record<string, Component> = {
  "cctv-monitoramento": ServicoCCTVVisual,
  "motores-de-portoes": ServicoMotorDePortaoVisual,
  "tecnologia-inteligente": ServicoTecnologiaInteligenteVisual,
  "vedacao-eletrica": ServicoVedacaoEletricaVisual,
};

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const asNumber = (value: number | string | null | undefined) => Number(value ?? 0);

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asProcedureSteps = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const record = item as Record<string, unknown>;
          const label = asString(record.label).trim();
          const day = Math.max(
            1,
            Math.ceil(
              asNumber(record.day as number | string | null | undefined) || 1,
            ),
          );

          return label ? { checked: Boolean(record.checked), day, label } : null;
        })
        .filter(
          (step): step is { checked: boolean; day: number; label: string } =>
            Boolean(step),
        )
    : [];

const LEGACY_DEFAULT_PROGRESS = 35;
const LEGACY_DEFAULT_NEXT_STEP =
  "A equipa Bitoll deve validar o pedido e contactar o cliente.";
const LEGACY_DEFAULT_TECHNICIAN = "Consultoria tecnica Bitoll";

const isFormulaOperator = (
  value: string,
): value is "add" | "subtract" | "multiply" | "divide" =>
  ["add", "subtract", "multiply", "divide"].includes(value);

const mapService = (row: ServiceRow): Service => ({
  slug: row.slug,
  title: row.title,
  icon: "",
  shortDescription: row.short_description,
  description: row.description,
  image: serviceImages[row.image_key || row.slug] ?? ServicoTecnologiaInteligenteVisual,
  imageUrl: row.image_url,
  features: asStringArray(row.features),
  benefits: asStringArray(row.benefits),
  audience: asStringArray(row.audience),
  technologies: asStringArray(row.technologies),
  experience: row.experience,
});

const mapPromotion = (row: PromotionRow, index: number): Promotion => ({
  id: index + 1,
  slug: row.slug || row.id,
  serviceSlug: row.service_slug ?? "",
  quoteTemplateId: row.quote_template_id ?? "",
  title: row.title,
  shortDescription: row.short_description,
  description: row.description,
  discount: row.discount_label,
  badge: row.badge,
  image: row.image,
  active: row.active,
  startDate: row.start_date ?? "",
  endDate: row.end_date ?? "",
  technologies: asStringArray(row.technologies),
  features: asStringArray(row.features),
  articles: Array.isArray(row.articles)
    ? (row.articles as PromotionArticle[])
    : [],
  installationFee: asNumber(row.installation_fee),
  discountAmount: asNumber(row.discount_amount),
  currency: row.currency,
});

const mapProduct = (row: ProductRow): ServiceProduct => ({
  id: row.id,
  name: row.name,
  shortName: row.short_name,
  quantity: row.quantity_label || `${asNumber(row.estimated_quantity)} ${row.unit}`,
  estimatedQuantity: asNumber(row.estimated_quantity),
  unitPrice: asNumber(row.unit_price),
  brand: row.brand,
  model: row.model,
  system: row.system,
  category: row.category || row.system || "Produto",
  description: row.description,
  detail: row.detail,
  imageUrl: row.image_url,
  required: row.required,
});

const mapStructureOption = (row: StructureOptionRow): ServiceStructureOption => ({
  id: row.id,
  serviceSlug: row.service_slug,
  label: row.title || row.structure,
  value: row.structure,
  description: row.description,
  imageUrl: row.image_url,
  imageAlt: row.title || row.structure,
  sortOrder: asNumber(row.sort_order),
  structureCostPercentage: asNumber(row.structure_cost_percentage),
});

const mapTemplateItem = (
  row: QuoteTemplateItemRow,
  template: QuoteTemplateRow,
  sourceProduct?: ProductRow,
  rules: QuoteTemplateRuleRow[] = [],
): ServiceProduct => ({
  id: row.product_id ?? row.id,
  name: row.name,
  shortName: sourceProduct?.short_name || undefined,
  quantity: `${Math.max(1, Math.floor(asNumber(row.default_quantity) || 1))} ${row.unit}`,
  estimatedQuantity: Math.max(1, Math.floor(asNumber(row.default_quantity) || 1)),
  defaultQuantity: Math.max(1, Math.floor(asNumber(row.default_quantity) || 1)),
  unitPrice: asNumber(row.unit_price),
  brand: sourceProduct?.brand || undefined,
  model: sourceProduct?.model || undefined,
  system: sourceProduct?.system || undefined,
  category: sourceProduct?.category || sourceProduct?.system || "Produto",
  description: sourceProduct?.description || template.title,
  detail:
    sourceProduct?.detail ||
    (row.client_quantity_editable
      ? "Quantidade editavel pelo cliente."
      : "Quantidade definida pela Bitoll."),
  imageUrl: sourceProduct?.image_url || undefined,
  clientQuantityEditable: row.client_quantity_editable,
  dependencyRules: rules
    .filter((rule) => rule.source_product_id === row.product_id)
    .map((rule) => ({
      formulaSteps: Array.isArray(rule.formula_steps)
        ? rule.formula_steps
            .flatMap((step) =>
              isFormulaOperator(step.operator) &&
              Number.isFinite(Number(step.value))
                ? [
                    {
                      operator: step.operator,
                      value: Number(step.value),
                    },
                  ]
                : [],
            )
        : [
            {
              operator: "multiply" as const,
              value: asNumber(rule.multiplier) || 1,
            },
            {
              operator: "divide" as const,
              value: Math.max(1, asNumber(rule.divisor) || 1),
            },
          ],
      minQuantity: Math.max(0, Math.floor(asNumber(rule.min_quantity) || 0)),
      rounding: rule.rounding || "ceil",
      targetProductId: rule.target_product_id ?? "",
    }))
    .filter((rule) => rule.targetProductId),
  required: sourceProduct?.required ?? row.required ?? true,
});

const loadTemplateSourceProductsMap = async (
  productIds: string[],
): Promise<Map<string, ProductRow>> => {
  const supabase = getSupabaseBrowserClient();
  const uniqueProductIds = Array.from(new Set(productIds.filter(Boolean)));

  if (!supabase || uniqueProductIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("service_products")
    .select(
      "id,service_slug,structure,name,short_name,unit,quantity_label,estimated_quantity,unit_price,brand,model,system,category,description,detail,image_url,required",
    )
    .in("id", uniqueProductIds);

  if (error || !data) {
    return new Map();
  }

  return new Map((data as ProductRow[]).map((product) => [product.id, product]));
};

export const loadServicesFromSupabase = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("services")
    .select(
      "slug,title,short_description,description,image_key,image_url,features,benefits,audience,technologies,experience",
    )
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as ServiceRow[]).map(mapService);
};

export const loadSearchEntriesFromSupabase = async (): Promise<SearchResult[]> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return searchData;
  }

  const { data: sources, error: sourcesError } = await supabase
    .from("search_sources")
    .select("source_key,active,sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const enabledSources = sourcesError
    ? ["services", "products", "promotions"]
    : (sources ?? []).map((source) => source.source_key);

  if (enabledSources.length === 0) {
    return [];
  }

  const results: SearchResult[] = [];

  if (enabledSources.includes("services")) {
    const { data } = await supabase
      .from("services")
      .select("slug,title,short_description,description,image_url,active")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    results.push(
      ...((data ?? []).map((service) => ({
        category: "Servico",
        description: service.short_description || service.description || "",
        id: `service-${service.slug}`,
        imageUrl: service.image_url || "",
        relatedService: service.slug,
        status: service.description || service.short_description || "",
        title: service.title,
        type: "service" as SearchResultType,
      }))),
    );
  }

  if (enabledSources.includes("products")) {
    const { data } = await supabase
      .from("service_products")
      .select("id,service_slug,name,short_name,brand,category,description,image_url,unit_price,active")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(160);

    results.push(
      ...((data ?? []).map((product) => ({
        category: product.category || "Artigo",
        description:
          product.description ||
          [product.brand, product.service_slug].filter(Boolean).join(" / "),
        id: `product-${product.id}`,
        imageUrl: product.image_url || "",
        price: product.unit_price ?? undefined,
        relatedService: product.service_slug,
        status: product.brand || product.service_slug || "",
        title: product.short_name || product.name,
        type: "product" as SearchResultType,
      }))),
    );
  }

  if (enabledSources.includes("promotions")) {
    const { data } = await supabase
      .from("promotions")
      .select("id,slug,service_slug,title,short_description,description,discount_label,image,active")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(80);

    results.push(
      ...((data ?? []).map((promotion) => ({
        category: "Promocao",
        description:
          promotion.short_description ||
          promotion.description ||
          promotion.discount_label ||
          "",
        id: `promotion-${promotion.id}`,
        imageUrl: promotion.image || "",
        relatedService: promotion.service_slug ?? promotion.slug ?? "",
        status: promotion.discount_label || "",
        title: promotion.title,
        type: "promotion" as SearchResultType,
      }))),
    );
  }

  if (enabledSources.includes("requests")) {
    const user = getCachedAuthUser();

    if (user) {
      const { data } = await supabase
        .from("quotes")
        .select("id,quote_number,service_slug,status,total,currency,created_at")
        .eq("profile_id", String(user.id))
        .order("created_at", { ascending: false })
        .limit(80);

      results.push(
        ...((data ?? []).map((quote) => ({
          category: "Solicitacao",
          description: `${quote.service_slug || "Servico Bitoll"} / ${formatMoney(asNumber(quote.total), quote.currency)}`,
          id: `request-${quote.id}`,
          relatedService: quote.service_slug ?? "",
          status: quote.status,
          title: quote.quote_number,
          type: "request" as SearchResultType,
        }))),
      );
    }
  }

  return results.length ? results : searchData;
};

export const loadPromotionsFromSupabase = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id,slug,service_slug,quote_template_id,title,short_description,description,discount_label,badge,image,active,start_date,end_date,technologies,features,articles,installation_fee,discount_amount,currency",
    )
    .eq("active", true)
    .order("end_date", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as PromotionRow[]).map(mapPromotion);
};

export const loadServiceStructureOptionsFromSupabase = async (
  serviceSlug: string,
) => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("service_structure_options")
    .select("id,service_slug,structure,title,description,image_url,sort_order,structure_cost_percentage,active")
    .eq("service_slug", serviceSlug)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as StructureOptionRow[]).map(mapStructureOption);
};

export const loadServiceProductsFromSupabase = async (
  serviceSlug: string,
  structure: StructureType,
) => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data: templates } = await supabase
    .from("service_quote_templates")
    .select("id,service_slug,title,structure,currency,labor_unit_price,labor_product_id,structure_cost_percentage")
    .eq("service_slug", serviceSlug)
    .eq("structure", structure)
    .eq("active", true)
    .limit(1);

  const template = (templates?.[0] ?? null) as QuoteTemplateRow | null;

  if (template) {
    const { data: items, error: itemsError } = await supabase
      .from("service_quote_template_items")
      .select("id,template_id,product_id,name,unit,unit_price,quantity_field_key,client_quantity_editable,default_quantity,required")
      .eq("template_id", template.id)
      .order("sort_order", { ascending: true });

    if (!itemsError && items) {
      const { data: rules } = await supabase
        .from("service_quote_template_item_rules")
        .select("source_product_id,target_product_id,multiplier,divisor,formula_steps,min_quantity,rounding")
        .eq("template_id", template.id);
      const templateItems = items as QuoteTemplateItemRow[];
      const sourceProducts = await loadTemplateSourceProductsMap(
        templateItems.flatMap((item) => (item.product_id ? [item.product_id] : [])),
      );
      const products = templateItems.map((item) =>
        mapTemplateItem(
          item,
          template,
          item.product_id ? sourceProducts.get(item.product_id) : undefined,
          (rules ?? []) as QuoteTemplateRuleRow[],
        ),
      );

      if (template.labor_unit_price && template.labor_product_id) {
        const laborProduct = products.find(
          (product) => product.id === template.labor_product_id,
        );
        const laborQuantity = laborProduct?.estimatedQuantity ?? 1;

        products.push({
          id: `labor-${template.id}`,
          laborSourceProductId: template.labor_product_id,
          name: "Mao de obra",
          quantity: `${laborQuantity} servico(s)`,
          estimatedQuantity: laborQuantity,
          unitPrice: asNumber(template.labor_unit_price),
          model: template.structure,
          system: "Instalacao",
          category: "Mao de obra",
          description: `Mao de obra da cotacao ${template.title}`,
          detail: "Calculada a partir do artigo escolhido na cotacao padrao.",
          required: true,
        });
      }

      return products;
    }
  }

  return [];
};

export const loadQuoteTemplateProductsFromSupabase = async (
  templateId: string,
) => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase || !templateId) {
    return [];
  }

  const { data: templateData, error: templateError } = await supabase
    .from("service_quote_templates")
    .select("id,service_slug,title,structure,currency,labor_unit_price,labor_product_id,structure_cost_percentage")
    .eq("id", templateId)
    .eq("active", true)
    .single();

  if (templateError || !templateData) {
    return [];
  }

  const template = templateData as QuoteTemplateRow;
  const { data: items, error: itemsError } = await supabase
    .from("service_quote_template_items")
    .select("id,template_id,product_id,name,unit,unit_price,quantity_field_key,client_quantity_editable,default_quantity,required")
    .eq("template_id", template.id)
    .order("sort_order", { ascending: true });

  if (itemsError || !items) {
    return [];
  }

  const { data: rules } = await supabase
    .from("service_quote_template_item_rules")
    .select("source_product_id,target_product_id,multiplier,divisor,formula_steps,min_quantity,rounding")
    .eq("template_id", template.id);

  const templateItems = items as QuoteTemplateItemRow[];
  const sourceProducts = await loadTemplateSourceProductsMap(
    templateItems.flatMap((item) => (item.product_id ? [item.product_id] : [])),
  );
  const products = templateItems.map((item) =>
    mapTemplateItem(
      item,
      template,
      item.product_id ? sourceProducts.get(item.product_id) : undefined,
      (rules ?? []) as QuoteTemplateRuleRow[],
    ),
  );

  if (template.labor_unit_price && template.labor_product_id) {
    const laborProduct = products.find(
      (product) => product.id === template.labor_product_id,
    );
    const laborQuantity = laborProduct?.estimatedQuantity ?? 1;

    products.push({
      id: `labor-${template.id}`,
      laborSourceProductId: template.labor_product_id,
      name: "Mao de obra",
      quantity: `${laborQuantity} servico(s)`,
      estimatedQuantity: laborQuantity,
      unitPrice: asNumber(template.labor_unit_price),
      model: template.structure,
      system: "Instalacao",
      category: "Mao de obra",
      description: `Mao de obra da cotacao ${template.title}`,
      detail: "Calculada a partir do artigo escolhido na cotacao padrao.",
      required: true,
    });
  }

  return products;
};

export const loadServiceQuoteTemplatesFromSupabase = async (
  serviceSlug: string,
  structure: StructureType,
): Promise<ServiceQuoteTemplateOption[]> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("service_quote_templates")
    .select("id,service_slug,title,structure,currency,labor_unit_price,labor_product_id,structure_cost_percentage")
    .eq("service_slug", serviceSlug)
    .eq("structure", structure)
    .eq("active", true)
    .order("title", { ascending: true });

  if (error || !data) {
    return [];
  }

  const templates = data as QuoteTemplateRow[];
  const templatesWithProducts = await Promise.all(
    templates.map(async (template) => {
      const products = await loadQuoteTemplateProductsFromSupabase(template.id);

      return {
        currency: template.currency,
        id: template.id,
        products,
        serviceSlug: template.service_slug,
        structure: template.structure,
        structureCostPercentage: asNumber(template.structure_cost_percentage),
        subtotal: products.reduce(
          (sum, product) =>
            sum + (product.estimatedQuantity ?? 0) * (product.unitPrice ?? 0),
          0,
        ),
        title: template.title,
      };
    }),
  );

  return templatesWithProducts;
};

export const loadServiceProductCatalogsFromSupabase = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("service_products")
    .select(
      "id,service_slug,structure,name,short_name,unit,quantity_label,estimated_quantity,unit_price,brand,model,system,category,description,detail,image_url,required",
    )
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  const catalogs = new Map<string, ServiceProductCatalog>();

  for (const row of data as ProductRow[]) {
    const catalog =
      catalogs.get(row.service_slug) ??
      ({
        serviceSlug: row.service_slug,
        productsByStructure: { alta: [], basica: [], media: [] },
      } satisfies ServiceProductCatalog);

    catalog.productsByStructure[row.structure]?.push(mapProduct(row));
    catalogs.set(row.service_slug, catalog);
  }

  return Array.from(catalogs.values());
};

export const loadCustomerProjectsFromSupabase = async (): Promise<CustomerProject[]> => {
  const supabase = getSupabaseBrowserClient();
  const user = getCachedAuthUser();

  if (!supabase || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id,quote_number,service_slug,status,subtotal,discount,tax,total,currency,created_at,request_payload,progress,next_step,technician,estimated_completion,updates,quote_items(name,quantity,unit,unit_price)",
    )
    .eq("profile_id", String(user.id))
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as QuoteRow[]).map((quote) => {
    const statusMap: Record<string, ProjectStatus> = {
      aprovado: "Em actividade",
      concluido: "Finalizado",
      em_atividade: "Em actividade",
      em_avaliacao: "Em processamento",
      em_instalacao: "Em actividade",
      em_processamento: "Em processamento",
      em_testes: "Em actividade",
      enviado: "Em processamento",
      finalizado: "Finalizado",
      reclamacao: "Reclamacao",
      recusado: "Recusado",
    };
    const status =
      statusMap[quote.status.toLowerCase()] ??
      (quote.status === "Concluido" || quote.status === "Finalizado"
        ? "Finalizado"
        : "Em processamento");
    const createdAt = quote.created_at.slice(0, 10);
    const updates = asStringArray(quote.updates);
    const nextStep = quote.next_step?.trim() ?? "";
    const technician = quote.technician?.trim() ?? "";
    const hasCustomNextStep =
      Boolean(nextStep) && nextStep !== LEGACY_DEFAULT_NEXT_STEP;
    const hasCustomTechnician =
      Boolean(technician) && technician !== LEGACY_DEFAULT_TECHNICIAN;
    const numericProgress = asNumber(quote.progress);
    const hasCustomProgress =
      quote.progress !== null && numericProgress !== LEGACY_DEFAULT_PROGRESS;
    const progressEnabled = Boolean(
      hasCustomProgress ||
        hasCustomNextStep ||
        hasCustomTechnician ||
        quote.estimated_completion ||
        updates.length > 0,
    );
    const progress = progressEnabled
      ? Math.min(100, Math.max(0, numericProgress))
      : 0;
    const requestPayload = quote.request_payload ?? {};
    const structureCost = asNumber(requestPayload.structureCost as
      | number
      | string
      | null
      | undefined);
    const structureCostPercentage = asNumber(
      requestPayload.structureCostPercentage as number | string | null | undefined,
    );
    const serviceStartDate = asString(requestPayload.serviceStartDate);
    const serviceEndDate = asString(requestPayload.serviceEndDate);
    const receiptNumber = asString(requestPayload.receiptNumber);
    const receiptUrl = asString(requestPayload.receiptUrl);
    const procedureSteps = asProcedureSteps(requestPayload.procedureSteps);

    return {
      id: quote.id,
      quoteNumber: quote.quote_number,
      title: `Cotacao ${quote.quote_number}`,
      service:
        typeof requestPayload.selectedService === "string"
          ? requestPayload.selectedService
          : quote.service_slug || "Servico Bitoll",
      location: user.city || "A confirmar",
      requestedAt: createdAt,
      activityStartAt: serviceStartDate || createdAt,
      activityEndAt: serviceEndDate || quote.estimated_completion || createdAt,
      status,
      currency: quote.currency,
      subtotal: asNumber(quote.subtotal),
      discount: asNumber(quote.discount),
      tax: asNumber(quote.tax),
      total: asNumber(quote.total),
      structureCost,
      structureCostPercentage,
      progressEnabled,
      progress: status === "Finalizado" ? 100 : progress,
      nextStep:
        (hasCustomNextStep ? nextStep : "") ||
        "A cotacao ainda esta em processo de validacao pela equipa Bitoll.",
      technician: (hasCustomTechnician ? technician : "") || "Equipa Bitoll",
      estimatedCompletion: quote.estimated_completion ?? createdAt,
      receiptNumber,
      receiptUrl,
      procedureSteps,
      updates:
        progressEnabled && updates.length > 0
          ? updates
          : progressEnabled
            ? [
                `Total registado: ${formatMoney(asNumber(quote.total), quote.currency)}`,
                "Pedido guardado na base de dados da Bitoll.",
              ]
            : [],
      items: (quote.quote_items ?? []).map((item) => ({
        name: item.name,
        quantity: asNumber(item.quantity),
        unit: item.unit,
        unitPrice: asNumber(item.unit_price),
      })),
    };
  });
};
