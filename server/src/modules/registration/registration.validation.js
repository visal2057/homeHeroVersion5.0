import { z } from 'zod';

const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;
const sriLankanPhonePattern = /^(?:\+94|0)[0-9]{9}$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const providerRegistrationSchema = z
  .object({
    username: z.string().regex(usernamePattern, 'Username must be 3-30 characters using letters, numbers or underscore'),
    fullName: z.string().min(2).max(150),
    email: z.string().email(),
    phone: z.string().regex(sriLankanPhonePattern, 'Enter a valid Sri Lankan phone number'),
    password: z.string().regex(passwordPattern, 'Password must be at least 8 characters and include a letter and a number'),
    confirmPassword: z.string(),
    homeDistrictId: z.coerce.number().int().positive(),
    serviceDistrictId: z.coerce.number().int().positive(),
    bio: z.string().min(10).max(1000),
    workHoursDetails: z.string().min(3).max(500),
    hourlyChargeEstimate: z.coerce.number().min(0),
    serviceCategoryIds: z
      .string()
      .transform((value) => value.split(',').map((id) => Number(id.trim())).filter(Boolean))
      .pipe(z.array(z.number().int().positive()).min(1).max(2)),
    policeStationName: z.string().min(2).max(180),
    policeReportDate: z.coerce.date(),
    termsAccepted: z
      .string()
      .transform((value) => value === 'true' || value === '1')
      .pipe(z.literal(true)),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
