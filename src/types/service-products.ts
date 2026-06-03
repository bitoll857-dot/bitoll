export type StructureType = string;

export interface StructureOption {
  label: string;
  value: StructureType;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

export interface ServiceStructureOption extends StructureOption {
  id: string;
  serviceSlug: string;
  sortOrder: number;
  structureCostPercentage: number;
}

export interface ServiceProduct {
  clientQuantityEditable?: boolean;
  defaultQuantity?: number;
  dependencyRules?: {
    formulaSteps?: {
      operator: "add" | "subtract" | "multiply" | "divide";
      value: number;
    }[];
    minQuantity: number;
    rounding: "ceil" | "floor" | "round";
    targetProductId: string;
  }[];
  id: string;
  laborSourceProductId?: string;
  name: string;
  quantity: string;
  estimatedQuantity?: number;
  unitPrice?: number;
  brand?: string;
  model?: string;
  system?: string;
  category: string;
  description: string;
  detail: string;
  imageUrl?: string;
  required: boolean;
}

export interface ServiceQuoteTemplateOption {
  currency: string;
  id: string;
  products: ServiceProduct[];
  serviceSlug: string;
  structure: StructureType;
  structureCostPercentage: number;
  subtotal: number;
  title: string;
}

export type ServiceProductsByStructure = Record<string, ServiceProduct[]>;

export interface ServiceProductCatalog {
  serviceSlug: string;
  productsByStructure: ServiceProductsByStructure;
}
