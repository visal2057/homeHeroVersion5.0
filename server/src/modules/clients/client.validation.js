import { z } from 'zod';

const sriLankanPhonePattern = /^(?:\+94|0)[0-9]{9}$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const updateClientProfileSchema = z.object({
  fullName: z.string().min(2).max(150),
  phone: z.string().regex(sriLankanPhonePattern, 'Enter a valid Sri Lankan phone number'),
});

export const updateClientLocationSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  addressText: z.string().min(3).max(255),
});

export const changeClientPasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().regex(passwordPattern, 'Password must be at least 8 characters and include a letter and a number'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });
