import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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