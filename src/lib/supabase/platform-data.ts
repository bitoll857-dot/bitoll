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
  StructureType,
} from "~/types/service-products";

import { getCachedAuthUser, getSupabaseBrowserClient } from "./client";

type ServiceRow = {
  slug: string;
  title: string;
  short_description: string;
  description: string;
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
  required: boolean;
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

const mapService = (row: ServiceRow): Service => ({
  slug: row.slug,
  title: row.title,
  icon: "",
  shortDescription: row.short_description,
  description: row.description,
  image: serviceImages[row.image_key || row.slug] ?? ServicoTecnologiaInteligenteVisual,
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
  required: row.required,
});

export const loadServicesFromSupabase = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("services")
    .select(
      "slug,title,short_description,description,image_key,features,benefits,audience,technologies,experience",
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
      "id,slug,service_slug,title,short_description,description,discount_label,badge,image,active,start_date,end_date,technologies,features,articles,installation_fee,discount_amount,currency",
    )
    .eq("active", true)
    .order("end_date", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as PromotionRow[]).map(mapPromotion);
};

export const loadServiceProductsFromSupabase = async (
  serviceSlug: string,
  structure: StructureType,
) => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("service_products")
    .select(
      "id,service_slug,structure,name,unit,quantity_label,estimated_quantity,unit_price,brand,model,system,category,description,detail,required",
    )
    .eq("service_slug", serviceSlug)
    .eq("structure", structure)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as ProductRow[]).map(mapProduct);
};

export const loadServiceProductCatalogsFromSupabase = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("service_products")
    .select(
      "id,service_slug,structure,name,unit,quantity_label,estimated_quantity,unit_price,brand,model,system,category,description,detail,required",
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
    .select("id,quote_number,service_slug,status,total,currency,created_at,request_payload")
    .eq("profile_id", String(user.id))
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as QuoteRow[]).map((quote) => {
    const status: ProjectStatus =
      quote.status === "Concluido" ? "Concluido" : "Em avaliacao";
    const createdAt = quote.created_at.slice(0, 10);

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
      progress: status === "Concluido" ? 100 : 35,
      nextStep: "A equipa Bitoll deve validar o pedido e contactar o cliente.",
      technician: "Consultoria tecnica Bitoll",
      estimatedCompletion: createdAt,
      updates: [
        `Total registado: ${asNumber(quote.total).toLocaleString("pt-MZ")} ${quote.currency}`,
        "Pedido guardado no Supabase.",
      ],
    };
  });
};
