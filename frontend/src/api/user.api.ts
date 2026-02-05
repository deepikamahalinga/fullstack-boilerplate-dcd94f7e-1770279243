// user.api.ts

import axios, { AxiosError, AxiosInstance } from 'axios';

// Types
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  field: keyof User;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  role?: UserRole;
  email?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client
class UserApiClient {
  private client: AxiosInstance;
  private readonly maxRetries = 3;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL;
    
    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any request headers here
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          // Handle unauthorized access
          // You might want to redirect to login or refresh token
        }

        throw new ApiError(status || 500, message);
      }
    );
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error; // Don't retry client errors
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw lastError;
  }

  async getAllUsers(
    filters?: FilterParams,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PaginatedResponse<User>> {
    return this.withRetry(async () => {
      const { data } = await this.client.get('/users', {
        params: {
          ...filters,
          ...pagination,
          ...sort,
        },
      });
      return data;
    });
  }

  async getUserById(id: string): Promise<User> {
    return this.withRetry(async () => {
      const { data } = await this.client.get(`/users/${id}`);
      return data;
    });
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    return this.withRetry(async () => {
      const { data } = await this.client.post('/users', userData);
      return data;
    });
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    return this.withRetry(async () => {
      const { data } = await this.client.put(`/users/${id}`, userData);
      return data;
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.withRetry(async () => {
      await this.client.delete(`/users/${id}`);
    });
  }
}

// Export singleton instance
export const userApi = new UserApiClient();

// Export hook for handling loading states (if using React)
export const useApiCall = <T, A extends any[]>(
  apiFunction: (...args: A) => Promise<T>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async (...args: A) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, 'Unknown error');
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, data };
};