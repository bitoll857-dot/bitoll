export interface PromotionArticle {
  id: string;
  name: string;
  brand: string;
  model: string;
  system: string;
  quantity: number;
  unitPrice: number;
  description: string;
}

export interface Promotion {
  id: number;
  slug: string;
  serviceSlug: string;
  quoteTemplateId?: string;
  title: string;
  shortDescription: string;
  description: string;
  discount?: string;
  badge?: string;
  image: string;
  active: boolean;
  startDate: string;
  endDate: string;
  technologies?: string[];
  features?: string[];
  articles: PromotionArticle[];
  installationFee: number;
  discountAmount: number;
  currency: string;
}
