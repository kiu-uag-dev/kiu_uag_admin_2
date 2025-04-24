import { VALIDATION_MESSAGES } from '@/config/messages';
import { z } from 'zod';

// form zod validation schema
export const loginSchema = z.object({
  email: z.string().email({ message: VALIDATION_MESSAGES.invalidEmail }),
  password: z
    .string()
    .min(6, { message: VALIDATION_MESSAGES.invalidPasswordLength }),
});

// generate form types from zod validation schema
export type LoginSchema = z.infer<typeof loginSchema>;
