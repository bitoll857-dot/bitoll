import type { ProjectStatus } from "~/types/customer-project";

export type AdminMetric = {
  label: string;
  value: string;
};

export type OperatorQuote = {
  id: string;
  customer_snapshot: Record<string, unknown> | null;
  profile_id: string | null;
  quote_number: string;
  service_slug: string | null;
  status: string;
  total: number | string;
  labor_total?: number | string;
  currency: string;
  created_at: string;
  progress: number | string;
  request_payload: Record<string, unknown> | null;
  next_step: string;
  technician: string;
  technician_id?: string | null;
  estimated_completion: string | null;
  updates: string[];
  profiles: {
    city: string | null;
    email: string | null;
    full_name: string | null;
    phone: string | null;
  } | null;
};

export type OperatorQuoteResponse = Omit<OperatorQuote, "profiles"> & {
  profiles: OperatorQuote["profiles"];
  updates: unknown;
};

export type OperatorDraft = {
  estimatedCompletion: string;
  nextStep: string;
  progress: number;
  status: ProjectStatus;
  technician: string;
  updatesText: string;
};

export type AdminProcedureStep = {
  checked: boolean;
  day: number;
  label: string;
};

export type AdminService = {
  active: boolean;
  id: string;
  image_url: string;
  short_description: string;
  slug: string;
  sort_order: number | string;
  title: string;
};

export type AdminSearchEntry = {
  active: boolean;
  category: string;
  description: string;
  id: string;
  price: number | string | null;
  related_service: string;
  sort_order: number | string;
  status: string;
  title: string;
  type: "service" | "promotion" | "request" | "product";
};

export type AdminSearchSource = {
  active: boolean;
  description: string;
  id: string;
  label: string;
  source_key: "services" | "products" | "promotions" | "requests";
  sort_order: number | string;
};

export type AdminProduct = {
  active: boolean;
  brand: string;
  category: string;
  id: string;
  image_url: string;
  name: string;
  short_name?: string;
  service_slug: string;
  structure: string;
  unit: string;
  unit_price: number | string;
};

export type AdminCustomer = {
  city: string | null;
  email: string | null;
  full_name: string | null;
  id: string;
  phone: string | null;
  status?: string | null;
};

export type AdminOperatorUser = {
  email: string | null;
  full_name: string | null;
  id: string;
  phone: string | null;
  role: "owner" | "admin" | "operador";
};

export type AdminUserProfile = {
  adminActive: boolean;
  adminRole: "owner" | "admin" | "operador" | "";
  city: string | null;
  email: string | null;
  full_name: string | null;
  id: string;
  phone: string | null;
  status: string | null;
};

export type CustomQuoteDraftItem = {
  category: string;
  id: string;
  imageUrl: string;
  linkedBaseItemId?: string;
  name: string;
  productId: string | null;
  quantity: number;
  shortName?: string;
  serviceSlug: string;
  structure: string;
  unit: string;
  unitPrice: number;
};

export type AdminCustomQuote = {
  created_at: string;
  currency: string;
  customer_address: string;
  customer_contact: string;
  customer_name: string;
  customer_nuit: string;
  customer_type: string;
  id: string;
  commitment_terms: string;
  notes: string;
  profile_id: string | null;
  quote_number: string;
  selected_items: CustomQuoteDraftItem[];
  service_slug: string | null;
  source_quote_template_id: string | null;
  status: string;
  structure: string | null;
  subtotal: number | string;
  total: number | string;
};

export type AdminPromotion = {
  active: boolean;
  discount_label: string;
  end_date: string | null;
  id: string;
  image: string;
  quote_template_id: string | null;
  service_slug: string | null;
  slug: string | null;
  title: string;
};

export type AdminQuoteTemplate = {
  active: boolean;
  currency: string;
  id: string;
  labor_quantity_field_key: string;
  labor_product_id: string | null;
  labor_unit_price: number | string;
  notes: string;
  service_slug: string;
  structure: string;
  structure_cost_percentage: number | string;
  title: string;
};

export type AdminTemplateField = {
  field_key: string;
  id: string;
  input_type: "number" | "select" | "text";
  label: string;
  required: boolean;
  sort_order: number | string;
  template_id: string;
};

export type AdminTemplateItem = {
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

export type AdminStructureStep = {
  day: number;
  label: string;
};

export type AdminStructureOption = {
  active: boolean;
  description: string;
  id: string;
  image_url: string;
  service_slug: string;
  sort_order: number | string;
  steps: AdminStructureStep[];
  structure: string;
  structure_cost_percentage: number | string;
  title: string;
};

export type AdminTemplateRule = {
  divisor: number | string;
  formula_steps: {
    operator: "add" | "subtract" | "multiply" | "divide";
    value: number;
  }[];
  id: string;
  min_quantity: number | string;
  multiplier: number | string;
  rounding: "ceil" | "floor" | "round";
  source_product_id: string | null;
  target_product_id: string | null;
  template_id: string;
};

export type OwnerTab =
  | "users"
  | "revenues"
  | "operations"
  | "search"
  | "services"
  | "structures"
  | "products"
  | "templates"
  | "customQuotes"
  | "promotions"
  | "quotes";
