import { z } from 'zod';

/**
 * Khớp BE `AuthResponse` (camelCase). Nới vừa đủ để khớp Jackson (Instant string/number/object),
 * email/username edge cases, và refreshToken rỗng/null.
 */
export const AuthResponseSchema = z
  .object({
    userId: z.union([z.string().uuid(), z.string().min(1)]),
    username: z.string().min(1),
    email: z.string().min(1),
    token: z.string().min(10),
    role: z.string().min(1),
    emailVerified: z.coerce.boolean(),
    message: z.union([z.string(), z.null()]).optional(),
    refreshToken: z.preprocess(
      (v) => (v === '' ? null : v),
      z.union([z.string().min(8), z.null()]).optional(),
    ),
    refreshTokenExpiry: z
      .union([
        z.string(),
        z.number(),
        z.object({ epochSecond: z.number(), nano: z.number().optional() }),
        z.null(),
      ])
      .optional(),
  })
  .passthrough();

/**
 * @param {unknown} data
 * @param {string} context
 * @returns {import('zod').infer<typeof AuthResponseSchema>}
 */
export const parseAuthResponse = (data, context = 'auth') => {
  const r = AuthResponseSchema.safeParse(data);
  if (!r.success) {
    const msg = r.error.flatten();
    console.error(`[EduCycle] API schema mismatch (${context}):`, msg);
    throw new Error(`Phản hồi ${context} không khớp định dạng API`);
  }
  return r.data;
};
