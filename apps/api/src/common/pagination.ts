export type PaginationQuery = {
  page?: number;
  pageSize?: number;
};

export function parsePaginationQuery(input: PaginationQuery) {
  const page = Math.max(Number(input.page ?? 1) || 1, 1);
  const pageSize = Math.max(Number(input.pageSize ?? 20) || 20, 1);

  return { page, pageSize };
}
