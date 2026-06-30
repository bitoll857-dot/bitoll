import { searchData } from "~/data/search";
import type { SearchResult } from "~/types/search";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function searchEverything(query: string, data: SearchResult[] = searchData) {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = normalizeText(query);

  return data.filter((item) => {
    return (
      normalizeText(item.title).includes(normalizedQuery) ||
      normalizeText(item.description).includes(normalizedQuery) ||
      normalizeText(item.category || "").includes(normalizedQuery) ||
      normalizeText(item.relatedService || "").includes(normalizedQuery)
    );
  });
}
