/**
 * Actions page renderer
 */

const ActionsPage = {
    completedActions: new Set(),

    render() {
        const html = `
            ${AppNav.render('actions')}
            <div class="app-layout">
                <div class="app-content page-enter">
                    <div class="dashboard-greeting">
                        <h1>✅ Actions</h1>
                        <p>Your prioritized to-do list from email</p>
                    </div>
                    ${Auth.isDemo ? '<div class="demo-banner"><span class="demo-icon">🧪</span> Viewing demo actions.</div>' : ''}
                    <div id="actions-content" class="actions-page">
                        <div class="text-center text-muted mt-8">Loading actions...</div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadActions(), 50);
        return html;
    },

    async loadActions() {
        try {
            let data;
            if (Auth.isAuthenticated && !Auth.isDemo && Auth.user?.google_id) {
                try {
                    data = await API.getUserActions(Auth.user.google_id);
                } catch (e) {
                    console.warn("Falling back to demo actions:", e);
                    data = await API.getDemoActions();
                }
            } else {
                data = await API.getDemoActions();
            }

            const container = document.getElementById('actions-content');
            if (container) {
                container.innerHTML = this._renderSections(data.sections);
            }
        } catch (error) {
            console.error('Failed to load actions:', error);
        }
    },

    _renderSections(sections) {
        const sectionOrder = [
            { key: 'overdue', label: 'Overdue', icon: '🔴', cssClass: 'overdue' },
            { key: 'today', label: 'Today', icon: '📌', cssClass: 'today' },
            { key: 'tomorrow', label: 'Tomorrow', icon: '📅', cssClass: 'tomorrow' },
            { key: 'this_week', label: 'This Week', icon: '📆', cssClass: 'this-week' },
            { key: 'no_deadline', label: 'No Deadline', icon: '📋', cssClass: '' }
        ];

        let html = '';
        let hasActions = false;

        for (const section of sectionOrder) {
            const actions = sections[section.key] || [];
            if (actions.length > 0) {
                hasActions = true;
                html += this._renderSection(section, actions);
            }
        }

        // Completed section
        if (this.completedActions.size > 0) {
            html += `
                <div class="action-section">
                    <div class="action-section-header">
                        <span class="section-icon">✅</span>
                        <h3>Completed (${this.completedActions.size})</h3>
                    </div>
                    <p class="text-sm text-muted">Actions you've completed this session.</p>
                </div>
            `;
        }

        if (!hasActions && this.completedActions.size === 0) {
            html = `
                <div class="empty-state">
                    <div class="empty-icon">🎉</div>
                    <h3>No pending actions</h3>
                    <p>All caught up! No emails require your action right now.</p>
                </div>
            `;
        }

        return html;
    },

    _renderSection(section, actions) {
        const pendingActions = actions.filter(a => !this.completedActions.has(a.id));
        if (pendingActions.length === 0) return '';

        return `
            <div class="action-section">
                <div class="action-section-header ${section.cssClass}">
                    <span class="section-icon">${section.icon}</span>
                    <h3>${section.label}</h3>
                    <span class="section-count" style="margin-left:auto; background:var(--gray-100); padding:2px 10px; border-radius:99px; font-size:0.75rem; color:var(--text-muted);">${pendingActions.length}</span>
                </div>
                ${pendingActions.map(action => this._renderActionItem(action)).join('')}
            </div>
        `;
    },

    _renderActionItem(action) {
        const priorityClass = (action.priority || 'none').toLowerCase();
        const isCompleted = this.completedActions.has(action.id);

        const gmailId = action.thread_id || action.gmail_message_id;
        const isRealGmail = gmailId && !String(gmailId).startsWith('demo_');
        const gmailUrl = isRealGmail
            ? `https://mail.google.com/mail/u/0/#all/${encodeURIComponent(gmailId)}`
            : 'https://mail.google.com/mail/u/0/#inbox';

        return `
            <div class="action-card ${isCompleted ? 'completed' : ''}" data-action-id="${action.id}">
                <div class="action-priority">
                    <div class="priority-dot ${priorityClass}"></div>
                </div>
                <div class="action-body">
                    <div class="action-sender">${this._escapeHtml(action.sender)}</div>
                    <div class="action-subject">${this._escapeHtml(action.subject)}</div>
                    <div class="action-text">${this._escapeHtml(action.action_text)}</div>
                    <div class="action-meta">
                        ${action.deadline 
                            ? `<span class="action-deadline">📅 ${action.deadline}</span>` 
                            : '<span class="action-deadline">No deadline</span>'}
                        <span class="badge badge-${priorityClass}">${action.priority}</span>
                        <span class="badge badge-category">${action.category || ''}</span>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="Router.navigate('/email/${action.email_id}')">
                        View
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="window.open('${gmailUrl}', '_blank')" title="Open directly in Gmail" style="display:inline-flex; align-items:center; gap:4px;">
                        <span>✉️</span> Open in Gmail ↗
                    </button>
                    <button class="btn btn-sm btn-success" onclick="ActionsPage.markComplete(${action.id})">
                        ✓ Complete
                    </button>
                </div>
            </div>
        `;
    },

    markComplete(actionId) {
        this.completedActions.add(actionId);
        const card = document.querySelector(`[data-action-id="${actionId}"]`);
        if (card) {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateX(20px)';
            setTimeout(() => {
                card.remove();
                Toast.success('Action completed! 🎉');
            }, 300);
        }
    },

    _escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
