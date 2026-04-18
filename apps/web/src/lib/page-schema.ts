import { z } from 'zod';

export const buildPageSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z
    .object({
      content: z.array(itemSchema),
      page: z.number(),
      size: z.number(),
      totalElements: z.number(),
      totalPages: z.number(),
      first: z.boolean(),
      last: z.boolean(),
    })
    .passthrough();

export const normalizePagePayload = <T>(raw: unknown): {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
} => {
  if (Array.isArray(raw)) {
    return {
      content: raw as T[],
      page: 0,
      size: raw.length,
      totalElements: raw.length,
      totalPages: 1,
      first: true,
      last: true,
    };
  }

  if (!raw || typeof raw !== 'object') {
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

  const payload = raw as Record<string, unknown>;
  const content = Array.isArray(payload.content) ? (payload.content as T[]) : [];
  return {
    content,
    page: Number(payload.page ?? 0),
    size: Number(payload.size ?? content.length),
    totalElements: Number(payload.totalElements ?? content.length),
    totalPages: Number(payload.totalPages ?? (content.length > 0 ? 1 : 0)),
    first: Boolean(payload.first ?? true),
    last: Boolean(payload.last ?? true),
  };
};
