export type SearchResultType =
  | "service"
  | "promotion"
  | "request"
  | "product";

export type SearchResult = {
  id: string;
  type: SearchResultType;

  title: string;
  description: string;

  category?: string;
  imageUrl?: string;
  status?: string;
  price?: number;

  relatedService?: string;
};
