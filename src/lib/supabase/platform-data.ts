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
  ServiceStructureOption,
  StructureType,
} from "~/types/service-products";

import { getCachedAuthUser, getSupabaseBrowserClient } from "./client";

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
  title: string;
};

type QuoteTemplateRow = {
  currency: string;
  id: string;
  labor_product_id: string | null;
  labor_unit_price: number | string;
  service_slug: string;
  structure: StructureType;
  title: string;
};

type QuoteTemplateItemRow = {
  client_quantity_editable: boolean;
  default_quantity: number | string;
  id: string;
  name: string;
  product_id: string | null;
  quantity_field_key: string;
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
  total: number | string;
  currency: string;
  created_at: string;
  request_payload: Record<string, unknown> | null;
  progress: number | string | null;
  next_step: string | null;
  technician: string | null;
  estimated_completion: string | null;
  updates: unknown;
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
});

const mapTemplateItem = (
  row: QuoteTemplateItemRow,
  template: QuoteTemplateRow,
  rules: QuoteTemplateRuleRow[] = [],
): ServiceProduct => ({
  id: row.product_id ?? row.id,
  name: row.name,
  quantity: `${Math.max(1, Math.floor(asNumber(row.default_quantity) || 1))} ${row.unit}`,
  estimatedQuantity: Math.max(1, Math.floor(asNumber(row.default_quantity) || 1)),
  defaultQuantity: Math.max(1, Math.floor(asNumber(row.default_quantity) || 1)),
  unitPrice: asNumber(row.unit_price),
  brand: "Bitoll",
  model: template.structure,
  system: template.title,
  category: "Produto",
  description: template.title,
  detail: row.client_quantity_editable
    ? "Quantidade editavel pelo cliente."
    : "Quantidade definida pela Bitoll.",
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
  required: true,
});

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
    .select("id,service_slug,structure,title,description,image_url,sort_order,active")
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
    .select("id,service_slug,title,structure,currency,labor_unit_price,labor_product_id")
    .eq("service_slug", serviceSlug)
    .eq("structure", structure)
    .eq("active", true)
    .limit(1);

  const template = (templates?.[0] ?? null) as QuoteTemplateRow | null;

  if (template) {
    const { data: items, error: itemsError } = await supabase
      .from("service_quote_template_items")
      .select("id,template_id,product_id,name,unit,unit_price,quantity_field_key,client_quantity_editable,default_quantity")
      .eq("template_id", template.id)
      .order("sort_order", { ascending: true });

    if (!itemsError && items) {
      const { data: rules } = await supabase
        .from("service_quote_template_item_rules")
        .select("source_product_id,target_product_id,multiplier,divisor,formula_steps,min_quantity,rounding")
        .eq("template_id", template.id);
      const products = (items as QuoteTemplateItemRow[]).map((item) =>
        mapTemplateItem(item, template, (rules ?? []) as QuoteTemplateRuleRow[]),
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
          brand: "Bitoll",
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

  const { data, error } = await supabase
    .from("service_products")
    .select(
      "id,service_slug,structure,name,unit,quantity_label,estimated_quantity,unit_price,brand,model,system,category,description,detail,image_url,required",
    )
    .eq("service_slug", serviceSlug)
    .eq("structure", structure)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as ProductRow[]).map(mapProduct);
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
    .select("id,service_slug,title,structure,currency,labor_unit_price,labor_product_id")
    .eq("id", templateId)
    .eq("active", true)
    .single();

  if (templateError || !templateData) {
    return [];
  }

  const template = templateData as QuoteTemplateRow;
  const { data: items, error: itemsError } = await supabase
    .from("service_quote_template_items")
    .select("id,template_id,product_id,name,unit,unit_price,quantity_field_key,client_quantity_editable,default_quantity")
    .eq("template_id", template.id)
    .order("sort_order", { ascending: true });

  if (itemsError || !items) {
    return [];
  }

  const { data: rules } = await supabase
    .from("service_quote_template_item_rules")
    .select("source_product_id,target_product_id,multiplier,divisor,formula_steps,min_quantity,rounding")
    .eq("template_id", template.id);

  const products = (items as QuoteTemplateItemRow[]).map((item) =>
    mapTemplateItem(item, template, (rules ?? []) as QuoteTemplateRuleRow[]),
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
      brand: "Bitoll",
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

export const loadServiceProductCatalogsFromSupabase = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("service_products")
    .select(
      "id,service_slug,structure,name,unit,quantity_label,estimated_quantity,unit_price,brand,model,system,category,description,detail,image_url,required",
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
      "id,quote_number,service_slug,status,total,currency,created_at,request_payload,progress,next_step,technician,estimated_completion,updates",
    )
    .eq("profile_id", String(user.id))
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as QuoteRow[]).map((quote) => {
    const statusMap: Record<string, ProjectStatus> = {
      aprovado: "Em instalacao",
      concluido: "Concluido",
      em_avaliacao: "Em avaliacao",
      em_instalacao: "Em instalacao",
      em_testes: "Em testes",
      enviado: "Em avaliacao",
    };
    const status =
      statusMap[quote.status.toLowerCase()] ??
      (quote.status === "Concluido" ? "Concluido" : "Em avaliacao");
    const createdAt = quote.created_at.slice(0, 10);
    const progress = Math.min(100, Math.max(0, asNumber(quote.progress ?? 35)));
    const updates = asStringArray(quote.updates);

    return {
      id: quote.id,
      title: `Cotacao ${quote.quote_number}`,
      service:
        typeof quote.request_payload?.selectedService === "string"
          ? quote.request_payload.selectedService
          : quote.service_slug || "Servico Bitoll",
      location: user.city || "A confirmar",
      requestedAt: createdAt,
      status,
      progress: status === "Concluido" ? 100 : progress,
      nextStep:
        quote.next_step ||
        "A equipa Bitoll deve validar o pedido e contactar o cliente.",
      technician: quote.technician || "Consultoria tecnica Bitoll",
      estimatedCompletion: quote.estimated_completion ?? createdAt,
      updates:
        updates.length > 0
          ? updates
          : [
              `Total registado: ${asNumber(quote.total).toLocaleString("pt-MZ")} ${quote.currency}`,
              "Pedido guardado no Supabase.",
            ],
    };
  });
};
