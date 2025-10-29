// API Configuration
const API_CONFIG = {
    // Base URL - Change this to your actual API endpoint
    // In development, use relative path (proxy will forward to backend)
    // In production, use full URL
    BASE_URL: process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? 'http://localhost:8080/api' : '/api'),
    
    // API Version (no version for this API)
    VERSION: '',
    
    // Timeout for API requests (in milliseconds)
    TIMEOUT: 10000,
    
    // Retry configuration
    RETRY: {
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000
    }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
    const baseUrl = API_CONFIG.BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
};

export default API_CONFIG;

