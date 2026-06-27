import { z } from 'zod';

const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;
const sriLankanPhonePattern = /^(?:\+94|0)[0-9]{9}$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const clientRegistrationSchema = z
  .object({
    username: z.string().regex(usernamePattern, 'Username must be 3-30 characters using letters, numbers or underscore'),
    fullName: z.string().min(2).max(150),
    email: z.string().email(),
    phone: z.string().regex(sriLankanPhonePattern, 'Enter a valid Sri Lankan phone number'),
    password: z.string().regex(passwordPattern, 'Password must be at least 8 characters and include a letter and a number'),
    confirmPassword: z.string(),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    addressText: z.string().min(3).max(255),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().regex(passwordPattern, 'Password must be at least 8 characters and include a letter and a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
