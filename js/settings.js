/**
 * Settings page renderer
 */

const SettingsPage = {
    render() {
        return `
            ${AppNav.render('settings')}
            <div class="app-layout">
                <div class="app-content page-enter">
                    <div class="dashboard-greeting">
                        <h1>⚙️ Settings</h1>
                        <p>Manage your account and preferences</p>
                    </div>

                    <div class="settings-page">
                        <!-- Account Section -->
                        <div class="settings-section">
                            <h3>Account</h3>
                            <div class="settings-row">
                                <span class="setting-label">Google Account</span>
                                <span class="setting-value">${Auth.user?.email || 'Not connected'}</span>
                            </div>
                            <div class="settings-row">
                                <span class="setting-label">Name</span>
                                <span class="setting-value">${Auth.user?.name || '—'}</span>
                            </div>
                            <div class="settings-row">
                                <span class="setting-label">Gmail Connection</span>
                                ${Auth.isDemo 
                                    ? '<span class="badge badge-category">Demo Mode</span>'
                                    : Auth.user?.gmail_connected
                                        ? '<button class="btn btn-sm btn-danger" onclick="SettingsPage.handleDisconnect()">Disconnect Gmail</button>'
                                        : '<button class="btn btn-sm btn-primary" onclick="Auth.connectGmail()">Connect Gmail</button>'
                                }
                            </div>
                        </div>

                        <!-- Profile Type -->
                        <div class="settings-section">
                            <h3>Personalization</h3>
                            <div class="settings-row">
                                <span class="setting-label">Profile Type</span>
                                <select id="profile-type-select" onchange="SettingsPage.updateProfileType(this.value)">
                                    <option value="general">General</option>
                                    <option value="professional">Professional</option>
                                    <option value="student">Student</option>
                                    <option value="freelancer">Freelancer</option>
                                    <option value="business_owner">Business Owner</option>
                                </select>
                            </div>
                            <p class="text-sm text-muted mt-2">
                                Your profile type helps AI prioritize emails relevant to you. 
                                For example, students see higher priority for assignment deadlines.
                            </p>
                        </div>

                        <!-- AI Preferences -->
                        <div class="settings-section">
                            <h3>AI Preferences</h3>
                            <div class="settings-row">
                                <span class="setting-label">Emails to analyze</span>
                                <select>
                                    <option value="20">20 emails</option>
                                    <option value="30" selected>30 emails</option>
                                    <option value="50">50 emails</option>
                                </select>
                            </div>
                        </div>

                        <!-- Privacy & Data -->
                        <div class="settings-section">
                            <h3>Privacy & Data</h3>
                            <div class="settings-row">
                                <div>
                                    <span class="setting-label">Email Data</span>
                                    <p class="text-xs text-muted mt-1">
                                        We only store email metadata and AI analysis results.
                                        Full email content is not permanently stored.
                                    </p>
                                </div>
                            </div>
                            <div class="settings-row">
                                <div>
                                    <span class="setting-label">OAuth Connection</span>
                                    <p class="text-xs text-muted mt-1">
                                        Gmail is connected through Google OAuth 2.0. 
                                        We never see or store your Gmail password.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Danger Zone -->
                        <div class="settings-section danger-zone">
                            <h3>⚠️ Danger Zone</h3>
                            <div class="settings-row">
                                <div>
                                    <span class="setting-label">Delete My Data</span>
                                    <p class="text-xs text-muted mt-1">
                                        Permanently delete all stored email data and analysis results.
                                        This action cannot be undone.
                                    </p>
                                </div>
                                <button class="btn btn-sm btn-danger" onclick="SettingsPage.deleteData()">
                                    Delete All Data
                                </button>
                            </div>
                            <div class="settings-row">
                                <div>
                                    <span class="setting-label">Log Out</span>
                                    <p class="text-xs text-muted mt-1">
                                        Sign out and return to the landing page.
                                    </p>
                                </div>
                                <button class="btn btn-sm btn-secondary" onclick="Auth.logout()">
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    updateProfileType(value) {
        Toast.success(`Profile updated to: ${value.replace('_', ' ')}`);
    },

    async handleDisconnect() {
        if (!confirm('Are you sure you want to disconnect your Gmail account?')) return;
        try {
            if (Auth.user && Auth.user.google_id) {
                await API.disconnectGmail(Auth.user.google_id);
            }
            if (Auth.user) Auth.user.gmail_connected = false;
            Toast.success('Gmail disconnected.');
            Router.render();
        } catch (e) {
            Toast.error('Failed to disconnect Gmail.');
        }
    },

    deleteData() {
        if (confirm('Are you sure you want to delete all your stored data? This cannot be undone.')) {
            Toast.success('All data has been deleted.');
        }
    }
};
