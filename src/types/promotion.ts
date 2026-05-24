export interface Promotion {
  id: number;
  slug: string;
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
}