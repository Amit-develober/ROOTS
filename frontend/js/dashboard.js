/**
 * Dashboard page renderer
 */

const DashboardPage = {
    data: null,

    render() {
        // Show loading state first
        const html = this._layout(this._loadingContent());
        
        // Fetch data async and re-render
        setTimeout(() => this.loadData(), 50);
        
        return html;
    },

    async loadData() {
        try {
            let data;
            if (Auth.isAuthenticated && !Auth.isDemo && Auth.user?.google_id) {
                try {
                    data = await API.getUserDashboard(Auth.user.google_id);
                } catch (e) {
                    console.warn("Falling back to demo dashboard:", e);
                    data = await API.getDemoDashboard();
                }
            } else {
                data = await API.getDemoDashboard();
            }

            this.data = data;
            const content = document.getElementById('dashboard-content');
            if (content) {
                content.innerHTML = this._dashboardContent(data);
                this._attachEventListeners();
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            const content = document.getElementById('dashboard-content');
            if (content) {
                content.innerHTML = this._errorContent();
            }
        }
    },

    async triggerSync() {
        if (!Auth.accessToken) {
            Toast.error("No Gmail session found. Please reconnect Gmail.");
            return;
        }
        Toast.show("Syncing with Gmail...", "default", 3000);
        try {
            const res = await API.syncGmailEmails({
                google_id: Auth.user?.google_id,
                access_token: Auth.accessToken,
                max_results: 20
            });
            Toast.success(res.message || "Inbox synchronized!");
            this.loadData();
        } catch (e) {
            Toast.error(e.message || "Sync failed");
        }
    },

    _layout(content) {
        return `
            ${AppNav.render('dashboard')}
            <div class="app-layout">
                <div class="app-content page-enter">
                    <div id="dashboard-content">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    },

    _loadingContent() {
        return `
            <div class="dashboard-greeting">
                <h1>Loading...</h1>
                <p>Fetching your email insights</p>
            </div>
            <div class="stats-grid">
                ${Array(5).fill('<div class="stat-card"><div class="stat-value">—</div><div class="stat-label">Loading</div></div>').join('')}
            </div>
        `;
    },

    _errorContent() {
        return `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Something went wrong</h3>
                <p>We couldn't load your dashboard. Please try again.</p>
                <button class="btn btn-primary mt-4" onclick="DashboardPage.loadData()">Retry</button>
            </div>
        `;
    },

    _dashboardContent(data) {
        const { greeting, message, actions_by_priority, stats, is_demo } = data;
        
        return `
            ${is_demo ? '<div class="demo-banner"><span class="demo-icon">🧪</span> You\'re viewing demo data. Connect your Gmail for real insights.</div>' : ''}
            
            <div class="dashboard-greeting" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h1>${greeting} 👋</h1>
                    <p>${message}</p>
                </div>
                ${!is_demo ? `
                    <button class="btn btn-secondary btn-sm" onclick="DashboardPage.triggerSync()" style="display: flex; align-items: center; gap: 6px;">
                        <span>🔄</span> Sync Gmail
                    </button>
                ` : `
                    <button class="btn btn-primary btn-sm" onclick="Auth.connectGmail()" style="display: flex; align-items: center; gap: 6px;">
                        <span>✉</span> Connect Real Gmail
                    </button>
                `}
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card stat-important">
                    <div class="stat-value">${stats.important_emails}</div>
                    <div class="stat-label">Important</div>
                </div>
                <div class="stat-card stat-actions">
                    <div class="stat-value">${stats.action_required}</div>
                    <div class="stat-label">Actions</div>
                </div>
                <div class="stat-card stat-promo">
                    <div class="stat-value">${stats.promotional}</div>
                    <div class="stat-label">Promotional</div>
                </div>
                <div class="stat-card stat-newsletter">
                    <div class="stat-value">${stats.newsletters}</div>
                    <div class="stat-label">Newsletters</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.total_emails}</div>
                    <div class="stat-label">Analyzed</div>
                </div>
            </div>

            <!-- Today's Actions -->
            <div class="todays-actions">
                <h2>📋 Today's Actions</h2>
                
                ${this._renderPrioritySection('HIGH', '🔴', actions_by_priority.HIGH)}
                ${this._renderPrioritySection('MEDIUM', '🟠', actions_by_priority.MEDIUM)}
                ${this._renderPrioritySection('LOW', '🟢', actions_by_priority.LOW)}
                
                ${(!actions_by_priority.HIGH?.length && !actions_by_priority.MEDIUM?.length && !actions_by_priority.LOW?.length)
                    ? '<div class="empty-state"><div class="empty-icon">🎉</div><h3>All clear!</h3><p>No pending actions. Enjoy your day.</p></div>'
                    : ''}
            </div>
        `;
    },

    _renderPrioritySection(level, icon, actions) {
        if (!actions || actions.length === 0) return '';
        
        const levelClass = level.toLowerCase();
        return `
            <div class="priority-section">
                <div class="priority-header ${levelClass}">
                    <span class="priority-icon">${icon}</span>
                    <h3>${level} Priority</h3>
                </div>
                ${actions.map(action => this._renderActionCard(action, levelClass)).join('')}
            </div>
        `;
    },

    _renderActionCard(action, levelClass) {
        const gmailId = action.thread_id || action.gmail_message_id;
        const isRealGmail = gmailId && !String(gmailId).startsWith('demo_');
        const gmailUrl = isRealGmail
            ? `https://mail.google.com/mail/u/0/#all/${encodeURIComponent(gmailId)}`
            : 'https://mail.google.com/mail/u/0/#inbox';

        return `
            <div class="action-card" data-action-id="${action.id}">
                <div class="action-priority">
                    <div class="priority-dot ${levelClass}"></div>
                </div>
                <div class="action-body">
                    <div class="action-sender">${this._escapeHtml(action.sender)}</div>
                    <div class="action-subject">${this._escapeHtml(action.subject)}</div>
                    <div class="action-text">${this._escapeHtml(action.summary)}</div>
                    <div class="action-meta">
                        <span class="action-deadline ${action.deadline_relative?.includes('Overdue') ? 'overdue' : ''}">
                            📅 ${action.deadline_relative || 'No deadline'}
                        </span>
                        <span class="badge badge-${levelClass}">${action.priority}</span>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="Router.navigate('/email/${action.email_id}')">
                        View Email
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="window.open('${gmailUrl}', '_blank')" title="Open directly in Gmail" style="display:inline-flex; align-items:center; gap:4px;">
                        <span>✉️</span> Open in Gmail ↗
                    </button>
                    <button class="btn btn-sm btn-success" onclick="DashboardPage.markDone(${action.id})">
                        ✓ Done
                    </button>
                </div>
            </div>
        `;
    },

    markDone(actionId) {
        const card = document.querySelector(`[data-action-id="${actionId}"]`);
        if (card) {
            card.classList.add('completed');
            Toast.success('Action marked as completed!');
        }
    },

    _attachEventListeners() {
        // Any additional event listeners
    },

    _escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
