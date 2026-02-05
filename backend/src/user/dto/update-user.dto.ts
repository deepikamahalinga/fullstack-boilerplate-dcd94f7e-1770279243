import { z } from 'zod';

export const UpdateUserDto = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .optional(),
    
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[A-Z])(?=.*[0-9])/,
      'Password must contain at least 1 uppercase letter and 1 number'
    )
    .optional(),
    
  role: z
    .enum(['admin', 'user'])
    .optional(),
}).strict();

export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;