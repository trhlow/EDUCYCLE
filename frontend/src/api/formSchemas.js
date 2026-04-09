import { z } from 'zod';

/** @param {string} email */
export const isStudentEmail = (email) =>
  typeof email === 'string' && email.toLowerCase().trim().endsWith('.edu.vn');

/** @param {string} email */
export const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const t = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
};

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email không hợp lệ')
    .refine((v) => isValidEmail(v), { message: 'Email không hợp lệ' }),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export const registerFormSchema = z
  .object({
    username: z.string().trim().min(3, 'Tên phải có ít nhất 3 ký tự'),
    email: z
      .string()
      .trim()
      .min(1, 'Email không hợp lệ')
      .refine((v) => isValidEmail(v), { message: 'Email không hợp lệ' })
      .refine((v) => isStudentEmail(v), { message: 'Chỉ chấp nhận email .edu.vn' }),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((v) => v === true, { message: 'Bạn phải đồng ý với điều khoản' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp',
  });

export const forgotEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email không hợp lệ')
    .refine((v) => isValidEmail(v), { message: 'Email không hợp lệ' }),
});

export const resetPasswordFormSchema = z
  .object({
    token: z.string().trim().min(1, 'Vui lòng nhập token từ email'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự (theo server)'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp',
  });

export const otpFormSchema = z.object({
  otp: z.preprocess(
    (v) => String(v ?? '').replace(/\D/g, ''),
    z.string().min(4, 'Vui lòng nhập mã OTP hợp lệ').max(12, 'Mã OTP không hợp lệ'),
  ),
});

/** Profile fields sent to PATCH /users/me (email read-only on form) */
export const profileFormSchema = z.object({
  username: z.string().trim().min(1, 'Tên người dùng không được để trống'),
  bio: z.string().optional(),
  avatar: z
    .string()
    .optional()
    .refine((v) => !v || v.trim() === '' || /^https?:\/\/.+/i.test(v.trim()), {
      message: 'URL ảnh đại diện không hợp lệ',
    }),
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp',
  });

export const verifyPhoneSchema = z.object({
  phone: z.preprocess(
    (v) => String(v ?? '').replace(/\D/g, ''),
    z.string().regex(/^(0[3-9])[0-9]{8}$/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
  ),
});

const postProductFields = z.object({
  name: z
    .string()
    .trim()
    .min(5, 'Tên phải có ít nhất 5 ký tự')
    .max(150, 'Tên quá dài'),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  categoryId: z.string().optional(),
  condition: z.string().min(1, 'Vui lòng chọn tình trạng'),
  price: z.string().optional(),
  description: z
    .string()
    .trim()
    .min(20, 'Mô tả phải có ít nhất 20 ký tự')
    .max(2000, 'Mô tả quá dài'),
  contactNote: z.string().max(200).optional(),
  imageUrl: z.string().optional(),
});

/**
 * Resolver ổn định cho RHF: đọc `fixed` | `contact` tại lúc validate (qua getter).
 * @param {() => 'fixed' | 'contact'} getPriceType
 */
export const createPostProductFormSchema = (getPriceType) =>
  postProductFields.superRefine((data, ctx) => {
    if (getPriceType() !== 'fixed') return;
    const raw = (data.price ?? '').trim();
    const n = Number(raw);
    if (!raw || Number.isNaN(n) || n <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Giá phải lớn hơn 0', path: ['price'] });
    } else if (n > 10000000) {
      ctx.addIssue({ code: 'custom', message: 'Giá không vượt quá 10.000.000đ', path: ['price'] });
    }
  });
