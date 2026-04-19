import { z } from 'zod';

export const AuthResponseSchema = z
  .object({
    userId: z.union([z.string().uuid(), z.string().min(1)]),
    username: z.string().min(1),
    email: z.string().min(1),
    token: z.string().min(10),
    role: z.string().min(1),
    emailVerified: z.coerce.boolean(),
    phoneVerified: z.coerce.boolean().optional(),
    tradingAllowed: z.boolean().optional(),
    message: z.union([z.string(), z.null()]).optional(),
    refreshToken: z.preprocess(
      (value) => (value === '' ? null : value),
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

export type AuthResponseDTO = z.infer<typeof AuthResponseSchema>;

export const parseAuthResponse = (data: unknown, context = 'auth'): AuthResponseDTO => {
  const result = AuthResponseSchema.safeParse(data);
  if (!result.success) {
    const message = result.error.flatten();
    console.error(`[EduCycle] API schema mismatch (${context}):`, message);
    throw new Error(`Phản hồi ${context} không khớp định dạng API`);
  }
  return result.data;
};
