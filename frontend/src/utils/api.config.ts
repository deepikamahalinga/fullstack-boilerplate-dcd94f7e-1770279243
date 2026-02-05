import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types
interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

interface RequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: RequestConfig): RequestConfig => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as RequestConfig;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token logic here
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/refresh', { refreshToken });
        
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
          
          // Retry original request with new token
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${response.data.accessToken}`,
          };
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Handle refresh token failure
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      message: error.response?.data?.message || 'An error occurred',
      code: error.response?.data?.code,
      status: error.response?.status
    };

    return Promise.reject(apiError);
  }
);

export default api;
export type { ApiError };