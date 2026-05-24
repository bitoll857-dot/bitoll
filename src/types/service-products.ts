export type StructureType = "basica" | "media" | "alta";

export interface StructureOption {
  label: string;
  value: StructureType;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

export interface ServiceProduct {
  id: string;
  name: string;
  quantity: string;
  category: string;
  description: string;
  detail: string;
  required: boolean;
}

export type ServiceProductsByStructure = Record<StructureType, ServiceProduct[]>;

export interface ServiceProductCatalog {
  serviceSlug: string;
  productsByStructure: ServiceProductsByStructure;
}
