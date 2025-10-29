import API_CONFIG from './config';
import axios from 'axios';

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
    '/auth/login',           // 1.1. Đăng nhập
    '/auth/register',        // 1.2. Đăng ký
    // '/auth/logout',       // 1.3. Đăng xuất - YÊU CẦU token (Authorization header)
    // Note: Các endpoint sau có thể không có trong API docs nhưng giữ lại để tương thích
    '/auth/forgot-password', 
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/refresh'
];

// Helper function to check if endpoint is public
const isPublicEndpoint = (url) => {
    return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests (except public endpoints)
apiClient.interceptors.request.use(
    (config) => {
        // Only add token if endpoint is not public
        if (!isPublicEndpoint(config.url)) {
            let token = localStorage.getItem('token'); // or sessionStorage
            if(token === null){
                token = "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjpbIlVTRVIiXSwicGVybWlzc2lvbnMiOltdLCJzdWIiOiJwaGFtdHUxQGdtYWlsLmNvbSIsImlhdCI6MTc2MTcwMDYwNywiZXhwIjoxNzYxNzg3MDA3fQ.9vnJDPjnfd-So3t39WAr8aJm3SPwdyZyrK7sN5LIwDohrAnmQ_aHw71z1sIZelfx0rRPSIuNXCQut1_q6lyn4w"
            }
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Unauthorized - redirect to login (only if not a public endpoint)
                    if (!isPublicEndpoint(error.config.url)) {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    // Forbidden
                    console.error('Access denied');
                    break;
                case 404:
                    // Not found
                    console.error('Resource not found');
                    break;
                case 500:
                    // Internal server error
                    console.error('Server error');
                    break;
                default:
                    console.error('An error occurred:', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

