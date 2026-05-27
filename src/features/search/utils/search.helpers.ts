import { searchData } from "~/data/search";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function searchEverything(query: string) {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = normalizeText(query);

  return searchData.filter((item) => {
    return (
      normalizeText(item.title).includes(normalizedQuery) ||
      normalizeText(item.description).includes(normalizedQuery) ||
      normalizeText(item.category || "").includes(normalizedQuery)
    );
  });
}