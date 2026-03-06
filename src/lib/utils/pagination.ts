/**
 * Parse pagination params from URL search params.
 * Returns { page, limit, from, to } for Supabase .range() usage.
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { page?: number; limit?: number } = {}
) {
  const page = Math.max(1, parseInt(searchParams.get("page") || String(defaults.page ?? 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(defaults.limit ?? 20), 10)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}

/** Build a paginated JSON response. */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}
