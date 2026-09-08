/**
 * Auth state management with Firebase Google Sign-In & Gmail Integration
 */

const Auth = {
    isAuthenticated: false,
    isDemo: false,
    user: null,
    accessToken: null,

    /**
     * Initialize auth state from localStorage
     */
    init() {
        try {
            const savedUser = localStorage.getItem('auth_user');
            const savedToken = localStorage.getItem('gmail_token');
            const wasDemo = localStorage.getItem('is_demo') === 'true';

            if (savedUser) {
                this.user = JSON.parse(savedUser);
                this.accessToken = savedToken;
                this.isAuthenticated = true;
                this.isDemo = wasDemo;
            }
        } catch (e) {
            console.error("[Auth] Failed to restore session:", e);
        }
    },

    /**
     * Enter demo mode
     */
    enterDemo() {
        this.isDemo = true;
        this.isAuthenticated = true;
        this.accessToken = null;
        this.user = {
            id: 0,
            google_id: "demo_user_001",
            name: 'Demo User',
            email: 'demo@example.com',
            picture: null,
            gmail_connected: true
        };
        localStorage.setItem('auth_user', JSON.stringify(this.user));
        localStorage.setItem('is_demo', 'true');
    },

    /**
     * Connect Gmail via Firebase Google Authentication
     */
    async connectGmail() {
        // 1. Check if Firebase credentials have been configured
        if (!FirebaseManager.isConfigured()) {
            this.showSetupModal();
            return;
        }

        // 2. Ensure Firebase auth is initialized
        const auth = FirebaseManager.init();
        if (!auth) {
            Toast.error("Failed to initialize Firebase. Check browser console.");
            return;
        }

        try {
            Toast.show("Opening Google Sign-In...", "default", 2000);

            // 3. Trigger Firebase Google Popup with Gmail scope
            const result = await auth.signInWithPopup(FirebaseManager.provider);
            
            // Extract OAuth credential containing Google Access Token for Gmail API
            const credential = result.credential || (firebase.auth.GoogleAuthProvider ? firebase.auth.GoogleAuthProvider.credentialFromResult(result) : null);
            const token = credential ? credential.accessToken : null;
            const fbUser = result.user;

            this.isAuthenticated = true;
            this.isDemo = false;
            this.accessToken = token;
            this.user = {
                id: null,
                google_id: fbUser.uid,
                name: fbUser.displayName || 'Google User',
                email: fbUser.email,
                picture: fbUser.photoURL,
                gmail_connected: true
            };

            // Save to localStorage
            localStorage.setItem('auth_user', JSON.stringify(this.user));
            localStorage.setItem('is_demo', 'false');
            if (token) {
                localStorage.setItem('gmail_token', token);
            }

            Toast.success(`Welcome, ${this.user.name}!`);

            // 4. Send token to FastAPI backend
            try {
                const apiRes = await API.firebaseLogin({
                    google_id: fbUser.uid,
                    email: fbUser.email,
                    name: this.user.name,
                    picture: fbUser.photoURL,
                    access_token: token
                });
                if (apiRes && apiRes.user) {
                    this.user.id = apiRes.user.id;
                    localStorage.setItem('auth_user', JSON.stringify(this.user));
                }

                // Trigger background inbox sync
                if (token) {
                    Toast.show("Syncing recent emails from Gmail...", "default", 3000);
                    API.syncGmailEmails({
                        google_id: fbUser.uid,
                        access_token: token,
                        max_results: 20
                    }).then(syncRes => {
                        console.log("[Sync] Gmail synced:", syncRes);
                        Toast.success(syncRes.message || "Inbox synchronized!");
                        // Reload dashboard data if user is on dashboard
                        if (Router.currentRoute === '/dashboard' && typeof DashboardPage !== 'undefined') {
                            DashboardPage.load();
                        }
                    }).catch(err => {
                        console.warn("[Sync] Initial sync notice:", err);
                    });
                }
            } catch (backendErr) {
                console.warn("[Auth] Backend login warning (running client-first):", backendErr);
            }

            // 5. Navigate to dashboard
            Router.navigate('/dashboard');

        } catch (error) {
            console.error("[Firebase Auth Error]:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                Toast.show("Sign-in popup was closed.", "default");
            } else if (error.code === 'auth/unauthorized-domain') {
                Toast.error("Domain unauthorized. Add this host in Firebase Console > Authentication > Settings > Authorized domains.");
            } else if (error.code === 'auth/operation-not-allowed') {
                Toast.error("Google Sign-In is not enabled. Please enable it in Firebase Console.");
            } else {
                Toast.error(error.message || "Failed to sign in with Google.");
            }
        }
    },

    /**
     * Exit demo / logout
     */
    async logout() {
        try {
            if (FirebaseManager.auth) {
                await FirebaseManager.auth.signOut();
            }
        } catch (e) {
            console.warn("[Auth] Signout warning:", e);
        }

        this.isDemo = false;
        this.isAuthenticated = false;
        this.user = null;
        this.accessToken = null;
        localStorage.removeItem('auth_user');
        localStorage.removeItem('gmail_token');
        localStorage.removeItem('is_demo');
        Toast.show("You have signed out.", "default");
        Router.navigate('/');
    },

    /**
     * Get user initials for avatar
     */
    getInitials() {
        if (!this.user || !this.user.name) return '?';
        return this.user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    },

    /**
     * Display a friendly setup guidance modal when Firebase keys are not yet configured
     */
    showSetupModal() {
        const existing = document.getElementById('firebase-setup-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'firebase-setup-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width: 560px; text-align: left;">
                <div class="modal-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                        <span>🔥</span> Connect Gmail with Firebase
                    </h3>
                    <button class="modal-close" onclick="document.getElementById('firebase-setup-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color: var(--text-secondary, #555); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">
                        To connect your live Gmail inbox, your Firebase Web App credentials must be pasted into 
                        <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-weight: 600;">js/firebase-config.js</code>.
                    </p>
                    
                    <div style="background: var(--bg-surface, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; font-size: 0.88rem;">
                        <strong style="display: block; margin-bottom: 0.5rem; color: var(--text-primary, #1e293b);">Quick Setup Steps:</strong>
                        <ol style="margin: 0; padding-left: 1.25rem; line-height: 1.7; color: var(--text-secondary, #475569);">
                            <li>Open <a href="https://console.firebase.google.com/" target="_blank" style="color: var(--primary, #3b82f6); text-decoration: underline;">Firebase Console</a> & select your project.</li>
                            <li>In <strong>Authentication > Sign-in method</strong>, enable <strong>Google</strong>.</li>
                            <li>In Google Cloud Console, enable <strong>Gmail API</strong> and add scope <code>https://www.googleapis.com/auth/gmail.readonly</code>.</li>
                            <li>Paste your Firebase Web App credentials into <code>js/firebase-config.js</code>.</li>
                        </ol>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="document.getElementById('firebase-setup-modal').remove(); Demo.start();">
                        🧪 Try Instant Demo
                    </button>
                    <button class="btn btn-primary" onclick="document.getElementById('firebase-setup-modal').remove()">
                        Got It
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
};

// Initialize session immediately
Auth.init();
