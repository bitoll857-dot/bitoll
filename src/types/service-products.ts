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

export type ServiceProductsByStructure = Record<string, ServiceProduct[]>;

export interface ServiceProductCatalog {
  serviceSlug: string;
  productsByStructure: ServiceProductsByStructure;
}
