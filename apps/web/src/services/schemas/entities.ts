import { z } from 'zod';

const idSchema = z.union([z.string(), z.number()]).transform((value) => String(value));
const isoDateSchema = z.string().min(1);

export const userSchema = z
  .object({
    id: idSchema,
    username: z.string().min(1),
    email: z.string().email().or(z.string().min(1)),
    role: z.string().optional(),
    emailVerified: z.boolean().optional(),
    transactionRulesAccepted: z.boolean().optional(),
  })
  .passthrough();

export const productSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    description: z.string().optional().default(''),
    price: z.number().or(z.string().transform((value) => Number(value))).default(0),
    priceType: z.string().optional().default('fixed'),
    category: z.string().optional(),
    categoryName: z.string().optional(),
    imageUrl: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
    averageRating: z.number().optional(),
    sellerName: z.string().optional(),
    createdAt: isoDateSchema.optional(),
    status: z.string().optional(),
  })
  .passthrough();

export const transactionParticipantSchema = z
  .object({
    id: idSchema,
    username: z.string().optional(),
  })
  .passthrough();

export const transactionSchema = z
  .object({
    id: idSchema,
    status: z.string().min(1),
    createdAt: isoDateSchema.optional(),
    updatedAt: isoDateSchema.optional(),
    cancelledAt: isoDateSchema.optional(),
    disputedAt: isoDateSchema.optional(),
    cancelReason: z.string().optional().nullable(),
    disputeReason: z.string().optional().nullable(),
    buyerConfirmed: z.boolean().optional().default(false),
    sellerConfirmed: z.boolean().optional().default(false),
    buyer: transactionParticipantSchema.optional(),
    seller: transactionParticipantSchema.optional(),
    product: productSchema.optional(),
  })
  .passthrough();

export const messageSchema = z
  .object({
    id: idSchema,
    transactionId: idSchema.optional(),
    senderId: idSchema.optional(),
    senderName: z.string().optional(),
    content: z.string().min(1),
    createdAt: isoDateSchema,
  })
  .passthrough();

export const unsplashImageSchema = z
  .object({
    id: z.string().min(1),
    alt: z.string().optional().default(''),
    color: z.string().optional().default(''),
    urls: z
      .object({
        thumb: z.string().optional(),
        small: z.string().optional(),
        regular: z.string().optional(),
      })
      .passthrough(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    author: z
      .object({
        name: z.string().optional(),
        profileUrl: z.string().optional(),
      })
      .passthrough()
      .optional(),
    links: z
      .object({
        html: z.string().optional(),
        downloadLocation: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const unsplashCuratedSchema = z
  .object({
    items: z.array(unsplashImageSchema).default([]),
    fetchedAt: isoDateSchema,
    cacheTtlSeconds: z.number(),
  })
  .passthrough();

export const publicHealthSchema = z
  .object({
    status: z.string().min(1),
    service: z.string().min(1),
    timestamp: isoDateSchema,
  })
  .passthrough();

export type UserDTO = z.infer<typeof userSchema>;
export type ProductDTO = z.infer<typeof productSchema>;
export type TransactionDTO = z.infer<typeof transactionSchema>;
export type MessageDTO = z.infer<typeof messageSchema>;
export type UnsplashImage = z.infer<typeof unsplashImageSchema>;
export type UnsplashCuratedResponse = z.infer<typeof unsplashCuratedSchema>;
export type PublicHealthDTO = z.infer<typeof publicHealthSchema>;
