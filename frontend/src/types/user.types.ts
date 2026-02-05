// user.types.ts

import { z } from 'zod';

/**
 * Available user roles for authorization
 * @enum {string}
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

/**
 * Base user interface containing all entity fields
 * @interface User
 */
export interface User {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** User's email address */
  email: string;
  
  /** Hashed password */
  password: string;
  
  /** User's role for authorization */
  role: UserRole;
  
  /** Timestamp of user creation */
  createdAt: Date;
  
  /** Timestamp of last update */
  updatedAt: Date;
  
  /** Whether email is verified */
  isEmailVerified: boolean;
  
  /** Current session token if any */
  activeSessionToken?: string;
}

/**
 * Data transfer object for creating new users
 * @interface CreateUserDto
 */
export type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isEmailVerified' | 'activeSessionToken'>;

/**
 * Data transfer object for updating existing users
 * @interface UpdateUserDto
 */
export type UpdateUserDto = Partial<CreateUserDto>;

/**
 * Filter parameters for user queries
 * @interface UserFilterParams
 */
export interface UserFilterParams {
  email?: string;
  role?: UserRole;
  isEmailVerified?: boolean;
}

/**
 * Pagination parameters for list queries
 * @interface PaginationParams
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Available sort fields for user queries
 * @enum {string}
 */
export enum UserSortField {
  EMAIL = 'email',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

/**
 * Sort parameters for user queries
 * @interface UserSortParams
 */
export interface UserSortParams {
  field: UserSortField;
  direction: 'asc' | 'desc';
}

/**
 * Metadata for paginated responses
 * @interface ResponseMetadata
 */
export interface ResponseMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * API response wrapper with pagination metadata
 * @interface PaginatedResponse
 */
export interface PaginatedResponse<T> {
  data: T[];
  metadata: ResponseMetadata;
}

/**
 * Zod schema for validating user creation
 */
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[0-9])/),
  role: z.nativeEnum(UserRole)
});

/**
 * Zod schema for validating user updates
 */
export const updateUserSchema = createUserSchema.partial();

/**
 * Zod schema for validating filter parameters
 */
export const filterParamsSchema = z.object({
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isEmailVerified: z.boolean().optional()
});

/**
 * Zod schema for validating pagination parameters
 */
export const paginationParamsSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100)
});

/**
 * Zod schema for validating sort parameters
 */
export const sortParamsSchema = z.object({
  field: z.nativeEnum(UserSortField),
  direction: z.enum(['asc', 'desc'])
});