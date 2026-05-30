import type { ProjectStatus } from "~/types/customer-project";

export type AdminMetric = {
  label: string;
  value: string;
};

export type OperatorQuote = {
  id: string;
  quote_number: string;
  service_slug: string | null;
  status: string;
  total: number | string;
  currency: string;
  created_at: string;
  progress: number | string;
  next_step: string;
  technician: string;
  estimated_completion: string | null;
  updates: unknown;
  profiles: {
    city: string | null;
    email: string | null;
    full_name: string | null;
    phone: string | null;
  } | null;
};

export type OperatorQuoteResponse = Omit<OperatorQuote, "profiles"> & {
  profiles:
    | OperatorQuote["profiles"]
    | NonNullable<OperatorQuote["profiles"]>[]
    | null;
};

export type OperatorDraft = {
  estimatedCompletion: string;
  nextStep: string;
  progress: number;
  status: ProjectStatus;
  technician: string;
  updatesText: string;
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

export type AdminProduct = {
  active: boolean;
  brand: string;
  id: string;
  image_url: string;
  name: string;
  service_slug: string;
  structure: string;
  unit_price: number | string;
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

export type AdminStructureOption = {
  active: boolean;
  description: string;
  id: string;
  image_url: string;
  service_slug: string;
  sort_order: number | string;
  structure: string;
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
  | "services"
  | "structures"
  | "products"
  | "templates"
  | "promotions"
  | "quotes";
