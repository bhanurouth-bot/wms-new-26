import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- NEW: REQUEST INTERCEPTOR ---
// Before sending any request, check if we have a token and attach it.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// --- OPTIONAL: RESPONSE INTERCEPTOR ---
// If the backend says "401 Unauthorized" (Token expired), force logout.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.reload(); // Refresh to show Login screen
        }
        return Promise.reject(error);
    }
);

export const masterService = {
    getProducts: () => api.get('/master/products/'),
    getManufacturers: () => api.get('/master/manufacturers/'),
};

export const inventoryService = {
    // THIS WAS MISSING
    getLiveStock: () => api.get('/inventory/stock/live/'),
    
    // THIS WAS MISSING
    receiveStock: (data) => api.post('/inventory/inbound/receive/', data),
};

export const salesService = {
    // Create a new order (Triggers FEFO allocation)
    createOrder: (data) => api.post('/sales/orders/', data),
};

export const complianceService = {
    traceBatch: (batchNumber) => api.get(`/compliance/trace/${batchNumber}`),
};
export const analyticsService = {
    getInsights: () => api.get('/analytics/insights/'),
};

export default api;