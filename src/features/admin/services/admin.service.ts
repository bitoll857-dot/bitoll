import { getSupabaseBrowserClient } from "~/lib/supabase/client";

import type {
  AdminCustomQuote,
  AdminOperatorUser,
  AdminProduct,
  AdminPromotion,
  AdminQuoteTemplate,
  AdminService,
  AdminStructureOption,
  AdminTemplateField,
  AdminTemplateItem,
  AdminTemplateRule,
  AdminUserProfile,
  OperatorQuoteResponse,
} from "../types/admin.types";
import { normalizeStructureSteps } from "../utils/admin.utils";

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
      "id,profile_id,quote_number,service_slug,status,total,labor_total,currency,created_at,request_payload,customer_snapshot,progress,next_step,technician,technician_id,estimated_completion,updates",
    )
    .in("status", [
      "aprovado",
      "em_atividade",
      "em_avaliacao",
      "em_instalacao",
      "em_processamento",
      "em_testes",
      "concluido",
      "enviado",
      "finalizado",
      "reclamacao",
    ])
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  const quotes = data as unknown as OperatorQuoteResponse[];
  const profileIds = [
    ...new Set(
      quotes
        .map((quote) => quote.profile_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const profilesById = new Map<
    string,
    NonNullable<OperatorQuoteResponse["profiles"]>
  >();

  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,full_name,email,phone,city")
      .in("id", profileIds);

    (profiles ?? []).forEach((profile) => {
      profilesById.set(profile.id, profile);
    });
  }

  return quotes.map((quote) => {
    const snapshot =
      quote.customer_snapshot && typeof quote.customer_snapshot === "object"
        ? (quote.customer_snapshot as Record<string, unknown>)
        : {};
    const isCustomQuote = quote.request_payload?.source === "custom_quote";
    const profile = quote.profile_id ? profilesById.get(quote.profile_id) : null;
    const snapshotProfile = {
      city:
        typeof snapshot.city === "string"
          ? snapshot.city
          : typeof snapshot.address === "string"
            ? snapshot.address
            : null,
      email: typeof snapshot.email === "string" ? snapshot.email : null,
      full_name: typeof snapshot.name === "string" ? snapshot.name : null,
      phone:
        typeof snapshot.contacto === "string"
          ? snapshot.contacto
          : typeof snapshot.contact === "string"
            ? snapshot.contact
            : typeof snapshot.phone === "string"
              ? snapshot.phone
              : null,
    };

    return {
      ...quote,
      profiles: isCustomQuote
        ? snapshotProfile
        : quote.profile_id
          ? profile ?? snapshotProfile
          : snapshotProfile,
      updates: asStringArray(quote.updates),
    };
  });
};

export const loadOwnerContent = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      customers: [],
      customQuotes: [],
      adminUsers: [],
      operators: [],
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
    customers,
    customQuotes,
    adminUsers,
    operators,
  ] = await Promise.all([
    supabase
      .from("services")
      .select(
        "id,slug,title,short_description,image_url,active,sort_order",
      )
      .order("sort_order", { ascending: true }),

    supabase
      .from("service_products")
      .select("id,service_slug,structure,name,short_name,unit,unit_price,brand,category,image_url,active")
      .order("created_at", { ascending: false })
      .limit(120),

    supabase
      .from("service_structure_options")
      .select("id,service_slug,structure,title,description,image_url,steps,sort_order,structure_cost_percentage,active")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),

    supabase
      .from("service_quote_templates")
      .select("id,service_slug,title,structure,currency,labor_unit_price,labor_quantity_field_key,labor_product_id,structure_cost_percentage,notes,active")
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

    supabase
      .from("profiles")
      .select("id,full_name,email,phone,city,status")
      .order("created_at", { ascending: false })
      .limit(80),

    supabase
      .from("custom_quotes")
      .select(
        "id,profile_id,quote_number,customer_name,customer_contact,customer_address,customer_nuit,customer_type,service_slug,structure,source_quote_template_id,subtotal,total,currency,status,notes,commitment_terms,selected_items,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(80),

    supabase
      .from("admin_users")
      .select("role,active,profiles(id,full_name,email,phone,city,status)"),

    supabase
      .from("admin_users")
      .select("role,active,profiles(id,full_name,email,phone)")
      .eq("role", "operador"),
  ]);

  return {
    adminUsers: ((adminUsers.data ?? []) as {
      active: boolean;
      profiles:
        | {
            city: string | null;
            email: string | null;
            full_name: string | null;
            id: string;
            phone: string | null;
            status: string | null;
          }
        | {
            city: string | null;
            email: string | null;
            full_name: string | null;
            id: string;
            phone: string | null;
            status: string | null;
          }[]
        | null;
      role: "owner" | "admin" | "operador";
    }[])
      .map((adminUser) => {
        const profile = Array.isArray(adminUser.profiles)
          ? adminUser.profiles[0] ?? null
          : adminUser.profiles;

        return profile
          ? {
              adminActive: adminUser.active,
              adminRole: adminUser.role,
              city: profile.city,
              email: profile.email,
              full_name: profile.full_name,
              id: profile.id,
              phone: profile.phone,
              status: profile.status,
            }
          : null;
      })
      .filter(Boolean) as AdminUserProfile[],
    customers: customers.data ?? [],
    customQuotes: (customQuotes.data ?? []) as AdminCustomQuote[],
    operators: ((operators.data ?? []) as {
      active: boolean;
      profiles:
        | {
            email: string | null;
            full_name: string | null;
            id: string;
            phone: string | null;
          }
        | {
            email: string | null;
            full_name: string | null;
            id: string;
            phone: string | null;
          }[]
        | null;
      role: "owner" | "admin" | "operador";
    }[])
      .map((operator) => {
        const profile = Array.isArray(operator.profiles)
          ? operator.profiles[0] ?? null
          : operator.profiles;

        return profile && operator.active && operator.role === "operador"
          ? {
              email: profile.email,
              full_name: profile.full_name,
              id: profile.id,
              phone: profile.phone,
              role: operator.role,
            }
          : null;
      })
      .filter(Boolean) as AdminOperatorUser[],
    products: (products.data ?? []) as AdminProduct[],
    promotions: (promotions.data ?? []) as AdminPromotion[],
    services: (services.data ?? []) as AdminService[],
    structureOptions: ((structureOptions.data ?? []) as AdminStructureOption[]).map(
      (option) => ({
        ...option,
        steps: normalizeStructureSteps(option.steps),
      }),
    ),
    templateFields: (templateFields.data ?? []) as AdminTemplateField[],
    templateItems: (templateItems.data ?? []) as AdminTemplateItem[],
    templateRules: (templateRules.data ?? []) as AdminTemplateRule[],
    templates: (templates.data ?? []) as AdminQuoteTemplate[],
  };
};
