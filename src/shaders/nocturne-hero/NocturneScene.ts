export const NOCTURNE_VARIANTS = ["midnight", "solar", "aurora", "eclipse"] as const;
export type NocturneVariant = (typeof NOCTURNE_VARIANTS)[number];
export const NOCTURNE_TITLES: Record<NocturneVariant, string> = {
  midnight: "Nocturne — Midnight",
  solar: "Nocturne — Solar",
  aurora: "Nocturne — Aurora",
  eclipse: "Nocturne — Eclipse"
};
export function buildNocturneDocument(variant: NocturneVariant): string {
  return "";
}
