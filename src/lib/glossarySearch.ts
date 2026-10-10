import type { CivilGlossaryTerm } from "../../data/civilGlossary";

export function normalizeGlossarySearch(value: string): string {
  // NFKD normally merges ϕ into φ; keep the soil symbol distinct.
  return [...value].map(character => character === "ϕ" ? character : character.normalize("NFKD")).join("").toLowerCase()
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/[′’‘`]/g, "'")
    .replace(/[\s_]+/g, " ").trim();
}

export function matchesGlossarySearch(term: CivilGlossaryTerm, query: string): boolean {
  const normalized = normalizeGlossarySearch(query);
  if (!normalized) return true;
  return [term.term, term.symbol, term.reading, ...(term.aliases ?? []),
    term.academicDefinition, term.conceptualExplanation]
    .some(value => value !== undefined && normalizeGlossarySearch(value).includes(normalized));
}
