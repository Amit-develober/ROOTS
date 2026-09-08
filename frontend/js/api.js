/**
 * API client for communicating with the FastAPI backend
 */

const API = {
    baseUrl: '',

    /**
     * Make an API request
     */
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Request failed (${response.status})`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error.message);
            throw error;
        }
    },

    // ─── Demo Endpoints ────────────────────────

    isStaticHost() {
        return window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
    },

    async getDemoEmails() {
        if (this.isStaticHost() || typeof ClientDemoData !== 'undefined') {
            try {
                return await this.request('/api/demo/emails');
            } catch (e) {
                return { emails: ClientDemoData.getEmails() };
            }
        }
        return this.request('/api/demo/emails');
    },

    async getDemoEmailDetail(emailId) {
        if (this.isStaticHost() || typeof ClientDemoData !== 'undefined') {
            try {
                return await this.request(`/api/demo/emails/${emailId}`);
            } catch (e) {
                const emails = ClientDemoData.getEmails();
                const found = emails.find(e => e.id === parseInt(emailId));
                if (found) return found;
                throw new Error("Email not found");
            }
        }
        return this.request(`/api/demo/emails/${emailId}`);
    },

    async getDemoDashboard() {
        if (this.isStaticHost() || typeof ClientDemoData !== 'undefined') {
            try {
                return await this.request('/api/demo/dashboard');
            } catch (e) {
                return ClientDemoData.getDashboard();
            }
        }
        return this.request('/api/demo/dashboard');
    },

    async getDemoActions() {
        if (this.isStaticHost() || typeof ClientDemoData !== 'undefined') {
            try {
                return await this.request('/api/demo/actions');
            } catch (e) {
                return ClientDemoData.getActions();
            }
        }
        return this.request('/api/demo/actions');
    },

    async getDemoStats() {
        if (this.isStaticHost() || typeof ClientDemoData !== 'undefined') {
            try {
                return await this.request('/api/demo/stats');
            } catch (e) {
                return ClientDemoData.getStats();
            }
        }
        return this.request('/api/demo/stats');
    },

    // ─── Auth Endpoints ────────────────────────

    async firebaseLogin(payload) {
        return this.request('/api/auth/firebase-login', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async syncGmailEmails(payload) {
        return this.request('/api/emails/sync', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async getUserEmails(googleId) {
        const query = googleId ? `?google_id=${encodeURIComponent(googleId)}` : '';
        return this.request(`/api/emails${query}`);
    },

    async getUserEmailDetail(emailId, googleId) {
        const query = googleId ? `?google_id=${encodeURIComponent(googleId)}` : '';
        return this.request(`/api/emails/${emailId}${query}`);
    },

    async getUserDashboard(googleId) {
        const query = googleId ? `?google_id=${encodeURIComponent(googleId)}` : '';
        return this.request(`/api/dashboard${query}`);
    },

    async getUserActions(googleId) {
        const query = googleId ? `?google_id=${encodeURIComponent(googleId)}` : '';
        return this.request(`/api/actions${query}`);
    },

    async completeAction(actionId, userId) {
        return this.request(`/api/actions/${actionId}/complete?user_id=${userId}`, {
            method: 'POST'
        });
    },

    async disconnectGmail(googleId) {
        return this.request('/api/auth/disconnect', {
            method: 'POST',
            body: JSON.stringify({ google_id: googleId })
        });
    },

    async getCurrentUser(googleId) {
        try {
            const query = googleId ? `?google_id=${encodeURIComponent(googleId)}` : '';
            return await this.request(`/api/me${query}`);
        } catch (e) {
            return {
                is_demo: true,
                user: {
                    name: "Demo User",
                    email: "demo@example.com",
                    picture: null,
                    gmail_connected: true
                }
            };
        }
    },

    // ─── Health ────────────────────────────────

    async healthCheck() {
        return this.request('/api/health');
    }
};


/**
 * Toast notification system
 */
const Toast = {
    container: null,

    init() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },

    show(message, type = 'default', duration = 3000) {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    }
};
