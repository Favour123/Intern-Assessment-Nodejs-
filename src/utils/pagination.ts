export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function paginateArray<T>(items: T[], page: number, limit: number): PaginatedResult<T> {
  const safePage = Math.max(1, page || 1);
  const safeLimit = Math.min(100, Math.max(1, limit || 25));
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;
  const data = items.slice(start, end);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  return { data, page: safePage, limit: safeLimit, total, totalPages };
}

