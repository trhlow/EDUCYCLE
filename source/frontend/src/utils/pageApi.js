/**
 * Normalize Spring PageResponse `{ content, page, size, totalElements, totalPages, first, last }`
 * or legacy plain arrays.
 */
export function extractPage(res) {
  const d = res?.data;
  if (Array.isArray(d)) {
    return {
      content: d,
      page: 0,
      size: d.length,
      totalElements: d.length,
      totalPages: 1,
      first: true,
      last: true,
    };
  }
  if (!d || typeof d !== 'object') {
    return {
      content: [],
      page: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
  }
  return {
    content: Array.isArray(d.content) ? d.content : [],
    page: d.page ?? 0,
    size: d.size ?? 0,
    totalElements: d.totalElements ?? 0,
    totalPages: d.totalPages ?? 0,
    first: d.first ?? true,
    last: d.last ?? true,
  };
}
