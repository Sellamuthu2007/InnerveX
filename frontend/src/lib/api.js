import { API_URL } from './config';

// API client with automatic token handling
class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    getHeaders(token) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(options.token),
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'Request failed',
                    errors: data.errors || []
                };
            }

            return data;
        } catch (error) {
            if (error.status) {
                throw error;
            }
            throw {
                status: 0,
                message: 'Network error. Please check your connection.',
                errors: []
            };
        }
    }

    // Auth endpoints
    async signup(data) {
        return this.request('/api/v1/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async login(data) {
        return this.request('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getMe(token) {
        return this.request('/api/v1/auth/me', {
            method: 'GET',
            token
        });
    }

    async logout(token) {
        return this.request('/api/v1/auth/logout', {
            method: 'POST',
            token
        });
    }

    // User endpoints
    async verifyUser(name) {
        return this.request('/api/v1/users/verify', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
    }

    // Certificate endpoints
    async createCertificate(data, token) {
        return this.request('/api/v1/certificates', {
            method: 'POST',
            body: JSON.stringify(data),
            token
        });
    }

    async getMyCertificates(token, params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/v1/certificates/my${query ? '?' + query : ''}`, {
            method: 'GET',
            token
        });
    }

    async getIssuedCertificates(token, params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/v1/certificates/issued${query ? '?' + query : ''}`, {
            method: 'GET',
            token
        });
    }

    async getCertificate(id, token) {
        return this.request(`/api/v1/certificates/${id}`, {
            method: 'GET',
            token
        });
    }

    async revokeCertificate(id, reason, token) {
        return this.request(`/api/v1/certificates/${id}/revoke`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
            token
        });
    }

    async verifyCertificate(id) {
        return this.request(`/api/v1/certificates/verify/${id}`, {
            method: 'GET'
        });
    }

    // Request endpoints
    async createRequest(data, token) {
        return this.request('/api/v1/requests', {
            method: 'POST',
            body: JSON.stringify(data),
            token
        });
    }

    async getMyRequests(token, params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/v1/requests/my${query ? '?' + query : ''}`, {
            method: 'GET',
            token
        });
    }

    async getInstitutionRequests(token, params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/v1/requests/institution${query ? '?' + query : ''}`, {
            method: 'GET',
            token
        });
    }

    async updateRequestStatus(id, status, token) {
        return this.request(`/api/v1/requests/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
            token
        });
    }

    // Share endpoints
    async createShare(data, token) {
        return this.request('/api/v1/shares', {
            method: 'POST',
            body: JSON.stringify(data),
            token
        });
    }

    async getMyShares(token, params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/v1/shares/my${query ? '?' + query : ''}`, {
            method: 'GET',
            token
        });
    }

    async getSentShares(token, params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/v1/shares/sent${query ? '?' + query : ''}`, {
            method: 'GET',
            token
        });
    }

    async revokeShare(id, token) {
        return this.request(`/api/v1/shares/${id}`, {
            method: 'DELETE',
            token
        });
    }

    // OTP endpoints
    async sendOTP(email) {
        return this.request('/api/v1/otp/send', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async verifyOTP(email, otp) {
        return this.request('/api/v1/otp/verify', {
            method: 'POST',
            body: JSON.stringify({ email, otp })
        });
    }

    // Notification endpoints
    async getNotifications(token, params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/v1/notifications${query ? '?' + query : ''}`, {
            method: 'GET',
            token
        });
    }

    async markNotificationAsRead(id, token) {
        return this.request(`/api/v1/notifications/${id}/read`, {
            method: 'PUT',
            token
        });
    }

    async markAllNotificationsAsRead(token) {
        return this.request('/api/v1/notifications/read-all', {
            method: 'PUT',
            token
        });
    }
}

export const api = new ApiClient(API_URL);
export default api;
