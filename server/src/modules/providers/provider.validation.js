import { z } from 'zod';

const sriLankanPhonePattern = /^(?:\+94|0)[0-9]{9}$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;

export const updateProviderProfileSchema = z.object({
  username: z.string().regex(usernamePattern, 'Username must be 3-30 characters using letters, numbers or underscore'),
  fullName: z.string().min(2).max(150),
  phone: z.string().regex(sriLankanPhonePattern, 'Enter a valid Sri Lankan phone number'),
  bio: z.string().min(10).max(1000),
  workHoursDetails: z.string().min(3).max(500),
  hourlyChargeEstimate: z.coerce.number().min(0),
  homeDistrictId: z.coerce.number().int().positive(),
  serviceDistrictId: z.coerce.number().int().positive(),
  serviceCategoryIds: z.array(z.coerce.number().int().positive()).min(1).max(2),
});

export const changeProviderPasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().regex(passwordPattern, 'Password must be at least 8 characters and include a letter and a number'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });
