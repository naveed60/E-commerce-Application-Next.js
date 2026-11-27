export type SearchParams = Record<string, string | string[] | undefined>;
export const CATALOG_PAGE_SIZE = 24;
export const HOME_PRODUCT_LIMIT = 12;

export function catalogParams(params: SearchParams) {
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const rawPage = value("page");
  const page = /^[1-9]\d{0,5}$/.test(rawPage) ? Number(rawPage) : 1;
  const q = value("q").trim().slice(0, 100);
  const requestedSort = value("sort");
  const sort = requestedSort === "low" || requestedSort === "high" ? requestedSort : "latest";
  return { page, q, sort };
}

export function catalogPath(path: string, { page = 1, q = "", sort = "latest" }: { page?: number; q?: string; sort?: string } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (sort !== "latest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  return params.size ? `${path}?${params}` : path;
}
