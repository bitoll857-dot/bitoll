import { getSupabaseBrowserClient } from "~/lib/supabase/client";

import type {
  AdminProduct,
  AdminPromotion,
  AdminQuoteTemplate,
  AdminService,
  AdminStructureOption,
  AdminTemplateField,
  AdminTemplateItem,
  AdminTemplateRule,
  OperatorQuoteResponse,
} from "../types/admin.types";

const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

export const uploadAdminImage = async (file: File, folder: string) => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      error: "A base de dados da Bitoll nao esta configurada no browser.",
      url: "",
    };
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("bitoll-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    return {
      error: error.message,
      url: "",
    };
  }

  return {
    error: "",
    url: supabase.storage.from("bitoll-images").getPublicUrl(path).data
      .publicUrl,
  };
};

export const countTable = async (table: string) => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return 0;
  }

  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  return count ?? 0;
};

export const loadOperatorQuotes = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id,quote_number,service_slug,status,total,currency,created_at,progress,next_step,technician,estimated_completion,updates,profiles(full_name,email,phone,city)",
    )
    .in("status", [
      "aprovado",
      "em_avaliacao",
      "em_instalacao",
      "em_testes",
      "concluido",
      "enviado",
    ])
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    return [];
  }

  return (data as unknown as OperatorQuoteResponse[]).map((quote) => ({
    ...quote,
    profiles: Array.isArray(quote.profiles)
      ? quote.profiles[0] ?? null
      : quote.profiles,
    updates: asStringArray(quote.updates),
  }));
};

export const loadOwnerContent = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      products: [],
      promotions: [],
      services: [],
      structureOptions: [],
      templateFields: [],
      templateItems: [],
      templateRules: [],
      templates: [],
    };
  }

  const [
    services,
    products,
    structureOptions,
    templates,
    templateFields,
    templateItems,
    templateRules,
    promotions,
  ] = await Promise.all([
    supabase
      .from("services")
      .select(
        "id,slug,title,short_description,image_url,active,sort_order",
      )
      .order("sort_order", { ascending: true }),

    supabase
      .from("service_products")
      .select("id,service_slug,structure,name,unit_price,brand,image_url,active")
      .order("created_at", { ascending: false })
      .limit(30),

    supabase
      .from("service_structure_options")
      .select("id,service_slug,structure,title,description,image_url,sort_order,active")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),

    supabase
      .from("service_quote_templates")
      .select("id,service_slug,title,structure,currency,labor_unit_price,labor_quantity_field_key,labor_product_id,notes,active")
      .order("created_at", { ascending: false })
      .limit(30),

    supabase
      .from("service_quote_template_fields")
      .select("id,template_id,field_key,label,input_type,required,sort_order")
      .order("sort_order", { ascending: true }),

    supabase
      .from("service_quote_template_items")
      .select("id,template_id,product_id,name,unit,unit_price,quantity_field_key,client_quantity_editable,default_quantity")
      .order("sort_order", { ascending: true }),

    supabase
      .from("service_quote_template_item_rules")
      .select("id,template_id,source_product_id,target_product_id,multiplier,divisor,formula_steps,min_quantity,rounding"),

    supabase
      .from("promotions")
      .select(
        "id,slug,service_slug,quote_template_id,title,discount_label,end_date,image,active",
      )
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return {
    products: (products.data ?? []) as AdminProduct[],
    promotions: (promotions.data ?? []) as AdminPromotion[],
    services: (services.data ?? []) as AdminService[],
    structureOptions: (structureOptions.data ?? []) as AdminStructureOption[],
    templateFields: (templateFields.data ?? []) as AdminTemplateField[],
    templateItems: (templateItems.data ?? []) as AdminTemplateItem[],
    templateRules: (templateRules.data ?? []) as AdminTemplateRule[],
    templates: (templates.data ?? []) as AdminQuoteTemplate[],
  };
};
