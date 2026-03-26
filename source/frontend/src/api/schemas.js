import { z } from 'zod';

const uuidString = z.string().uuid();

/** Khớp BE `AuthResponse` (JSON field names camelCase). */
export const AuthResponseSchema = z.object({
  userId: uuidString,
  username: z.string().min(1),
  email: z.string().email(),
  token: z.string().min(20),
  role: z.string().min(1),
  emailVerified: z.boolean(),
  message: z.string().nullable().optional(),
  refreshToken: z.string().min(10).nullable().optional(),
  refreshTokenExpiry: z.string().nullable().optional(),
});

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
