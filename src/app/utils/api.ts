const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = {
    async request(endpoint: string, method = 'GET', body: any = null) {
        const token = localStorage.getItem('token');
        const headers: any = {
            'Content-Type': 'application/json',
            ...(token && { 'x-auth-token': token }),
        };

        const config: any = {
            method,
            headers,
            ...(body && { body: JSON.stringify(body) }),
        };

        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || 'Something went wrong');
        }

        return data;
    },

    auth: {
        login: (credentials: any) => api.request('/auth/login', 'POST', credentials),
        register: (userData: any) => api.request('/auth/register', 'POST', userData),
        getPublicStats: () => api.request('/auth/stats'),
    },

    farmer: {
        getStats: () => api.request('/farmer/stats'),

        // Crops
        getCrops: () => api.request('/farmer/crops'),
        addCrop: (data: any) => api.request('/farmer/crops', 'POST', data),
        updateCrop: (id: string, data: any) => api.request(`/farmer/crops/${id}`, 'PUT', data),
        deleteCrop: (id: string) => api.request(`/farmer/crops/${id}`, 'DELETE'),

        // Sales
        getSales: () => api.request('/farmer/sales'),
        addSale: (data: any) => api.request('/farmer/sales', 'POST', data),
        updateSale: (id: string, data: any) => api.request(`/farmer/sales/${id}`, 'PUT', data),
        deleteSale: (id: string) => api.request(`/farmer/sales/${id}`, 'DELETE'),

        // Lands
        getLands: () => api.request('/farmer/lands'),
        addLand: (data: any) => api.request('/farmer/lands', 'POST', data),
        updateLand: (id: string, data: any) => api.request(`/farmer/lands/${id}`, 'PUT', data),
        deleteLand: (id: string) => api.request(`/farmer/lands/${id}`, 'DELETE'),

        // Equipment
        getEquipment: () => api.request('/farmer/equipment'),
        addEquipment: (data: any) => api.request('/farmer/equipment', 'POST', data),
        updateEquipment: (id: string, data: any) => api.request(`/farmer/equipment/${id}`, 'PUT', data),
        deleteEquipment: (id: string) => api.request(`/farmer/equipment/${id}`, 'DELETE'),

        // Livestock
        getLivestock: () => api.request('/farmer/livestock'),
        addLivestock: (data: any) => api.request('/farmer/livestock', 'POST', data),
        updateLivestock: (id: string, data: any) => api.request(`/farmer/livestock/${id}`, 'PUT', data),
        deleteLivestock: (id: string) => api.request(`/farmer/livestock/${id}`, 'DELETE'),

        // Workers
        getWorkers: () => api.request('/farmer/workers'),
        addWorker: (data: any) => api.request('/farmer/workers', 'POST', data),
        updateWorker: (id: string, data: any) => api.request(`/farmer/workers/${id}`, 'PUT', data),
        deleteWorker: (id: string) => api.request(`/farmer/workers/${id}`, 'DELETE'),
    },

    admin: {
        getFarmers: () => api.request('/admin/farmers'),
        updateStatus: (id: string, status: string) => api.request(`/admin/farmers/${id}/status`, 'PUT', { status }),
        updateFarmer: (id: string, data: any) => api.request(`/admin/farmers/${id}`, 'PUT', data),
        getStats: () => api.request('/admin/stats'),
        getFullData: () => api.request('/admin/full-data'),
        getMonthlyGrowth: () => api.request('/admin/monthly-growth'),
        getTopFarmers: () => api.request('/admin/top-farmers'),
        deleteFarmer: (id: string) => api.request(`/admin/farmers/${id}`, 'DELETE'),
    }
};

export default api;
