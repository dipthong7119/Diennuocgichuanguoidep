/**
 * api.js — Module gọi API (fetch wrapper)
 * Quản lý base URL và token xác thực
 */

const API = {
    BASE: '',  // same origin
    token: localStorage.getItem('token') || '',

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    },

    clearToken() {
        this.token = '';
        localStorage.removeItem('token');
    },

    headers() {
        const h = { 'Content-Type': 'application/json' };
        if (this.token) h['Authorization'] = `Bearer ${this.token}`;
        return h;
    },

    async request(method, path, body = null) {
        const opts = { method, headers: this.headers() };
        if (body && method !== 'GET') opts.body = JSON.stringify(body);

        try {
            const res = await fetch(`${this.BASE}${path}`, opts);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || data.message || `HTTP ${res.status}`);
            }
            return data;
        } catch (err) {
            throw err;
        }
    },

    get(path) { return this.request('GET', path); },
    post(path, body) { return this.request('POST', path, body); },
    put(path, body) { return this.request('PUT', path, body); },
    patch(path, body) { return this.request('PATCH', path, body); },
    delete(path) { return this.request('DELETE', path); },
};
