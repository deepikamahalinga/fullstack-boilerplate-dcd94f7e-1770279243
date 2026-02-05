/**
 * Enum representing possible user roles
 * @enum {string}
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

/**
 * Interface representing a User entity
 * @interface User
 */
export interface User {
  /**
   * Unique identifier for the user
   * @format uuid
   */
  id: string;

  /**
   * User's email address
   * @format email 
   */
  email: string;

  /**
   * Hashed password
   * @minLength 8
   * @pattern ^(?=.*[A-Z])(?=.*\d).+$
   */
  password: string;

  /**
   * User's authorization role
   */
  role: UserRole;
}

/**
 * Type for creating a new user
 * Omits auto-generated id field
 */
export type CreateUserDto = Omit<User, 'id'>;

/**
 * Type for updating an existing user
 * Makes all fields optional except id
 */
export type UpdateUserDto = Partial<Omit<User, 'id'>> & {
  id: string;
};

/**
 * Type for user authentication credentials
 */
export type UserCredentialsDto = Pick<User, 'email' | 'password'>;

/**
 * Type for public user profile
 * Omits sensitive information
 */
export type UserProfileDto = Omit<User, 'password'>;