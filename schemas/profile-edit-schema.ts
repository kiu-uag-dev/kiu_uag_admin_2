import { VALIDATION_MESSAGES } from '@/config/messages';
import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(3, { message: VALIDATION_MESSAGES.required }),
  lastName: z.string().min(3, { message: VALIDATION_MESSAGES.required }),
  phone: z.string().min(9, { message: VALIDATION_MESSAGES.required }),
  email: z.string().email({ message: VALIDATION_MESSAGES.invalidEmail }),
  //picture: z.string().optional(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
