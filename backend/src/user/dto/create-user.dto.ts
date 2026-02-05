import { z } from 'zod';

/**
 * Data transfer object schema for creating a new user
 */
export const CreateUserDtoSchema = z.object({
  /**
   * User's email address
   */
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email format')
    .min(1, 'Email cannot be empty')
    .max(255, 'Email is too long'),

  /**
   * User's password - must contain minimum 8 characters,
   * at least one uppercase letter and one number
   */
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(
      /^(?=.*[A-Z])(?=.*\d).+$/,
      'Password must contain at least 1 uppercase letter and 1 number'
    ),

  /**
   * User's role for authorization purposes
   */
  role: z.enum(['admin', 'user'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be either "admin" or "user"',
  }),
});

/**
 * Type definition for user creation payload
 */
export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;