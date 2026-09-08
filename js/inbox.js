/**
 * Inbox page renderer
 */

const InboxPage = {
    emails: [],
    currentFilter: 'all',
    currentSort: 'date',

    render() {
        const html = `
            ${AppNav.render('inbox')}
            <div class="app-layout">
                <div class="app-content page-enter">
                    <div class="dashboard-greeting">
                        <h1>📬 Inbox</h1>
                        <p>Your emails, organized by AI</p>
                    </div>
                    ${Auth.isDemo ? '<div class="demo-banner"><span class="demo-icon">🧪</span> Viewing demo inbox data.</div>' : ''}
                    <div id="inbox-content">
                        <div class="text-center text-muted mt-8">Loading emails...</div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this.loadEmails(), 50);
        return html;
    },

    async loadEmails() {
        try {
            let data;
            if (Auth.isAuthenticated && !Auth.isDemo && Auth.user?.google_id) {
                try {
                    data = await API.getUserEmails(Auth.user.google_id);
                } catch (e) {
                    console.warn("Falling back to demo emails:", e);
                    data = await API.getDemoEmails();
                }
            } else {
                data = await API.getDemoEmails();
            }

            this.emails = data.emails;
            const container = document.getElementById('inbox-content');
            if (container) {
                container.innerHTML = this._renderInbox();
                this._attachListeners();
            }
        } catch (error) {
            console.error('Failed to load emails:', error);
        }
    },

    _renderInbox() {
        const filtered = this._getFilteredEmails();
        const sorted = this._getSortedEmails(filtered);

        return `
            <div class="inbox-page">
                <div class="inbox-toolbar">
                    <div class="filter-tabs">
                        ${this._renderFilterTab('all', 'All')}
                        ${this._renderFilterTab('important', 'Important')}
                        ${this._renderFilterTab('action_required', 'Action Required')}
                        ${this._renderFilterTab('promotions', 'Promotions')}
                        ${this._renderFilterTab('newsletters', 'Newsletters')}
                        ${this._renderFilterTab('transactions', 'Transactions')}
                    </div>
                    <div class="inbox-sort">
                        <label>Sort by:</label>
                        <select id="inbox-sort-select" onchange="InboxPage.changeSort(this.value)">
                            <option value="date" ${this.currentSort === 'date' ? 'selected' : ''}>Date</option>
                            <option value="priority" ${this.currentSort === 'priority' ? 'selected' : ''}>Priority</option>
                            <option value="category" ${this.currentSort === 'category' ? 'selected' : ''}>Category</option>
                        </select>
                    </div>
                </div>
                <div id="email-list">
                    ${sorted.length > 0 
                        ? sorted.map(email => this._renderEmailItem(email)).join('')
                        : '<div class="empty-state"><div class="empty-icon">📭</div><h3>No emails found</h3><p>Try a different filter.</p></div>'
                    }
                </div>
            </div>
        `;
    },

    _renderFilterTab(value, label) {
        const active = this.currentFilter === value ? 'active' : '';
        return `<button class="filter-tab ${active}" onclick="InboxPage.changeFilter('${value}')">${label}</button>`;
    },

    _renderEmailItem(email) {
        const analysis = email.analysis || {};
        const priorityClass = (analysis.priority || 'none').toLowerCase();
        const isUnread = !email.is_read ? 'email-unread' : '';
        const date = email.received_at ? new Date(email.received_at).toLocaleDateString('en-IN', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '';

        const gmailId = email.thread_id || email.gmail_message_id;
        const isRealGmail = gmailId && !String(gmailId).startsWith('demo_');
        const gmailUrl = isRealGmail
            ? `https://mail.google.com/mail/u/0/#all/${encodeURIComponent(gmailId)}`
            : 'https://mail.google.com/mail/u/0/#inbox';

        return `
            <div class="email-item ${isUnread}" onclick="Router.navigate('/email/${email.id}')">
                <div class="email-priority">
                    <div class="priority-dot ${priorityClass}"></div>
                </div>
                <div class="email-content">
                    <div class="email-sender">${this._escapeHtml(email.sender)}</div>
                    <div class="email-subject">${this._escapeHtml(email.subject)}</div>
                    <div class="email-meta">
                        <span class="badge badge-${priorityClass}">${analysis.priority || 'NONE'}</span>
                        <span class="badge badge-category">${analysis.category || 'Other'}</span>
                    </div>
                </div>
                <div class="email-date" style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                    <span>${date}</span>
                    <button class="btn btn-secondary btn-sm" 
                            style="font-size:0.75rem; padding: 2px 8px; border-radius: 4px;" 
                            onclick="event.stopPropagation(); window.open('${gmailUrl}', '_blank')" 
                            title="Open directly in Gmail">
                        ✉️ Gmail ↗
                    </button>
                </div>
            </div>
        `;
    },

    _getFilteredEmails() {
        if (this.currentFilter === 'all') return [...this.emails];
        
        return this.emails.filter(email => {
            const a = email.analysis || {};
            switch (this.currentFilter) {
                case 'important':
                    return a.priority === 'HIGH' || a.priority === 'MEDIUM';
                case 'action_required':
                    return a.action_required;
                case 'promotions':
                    return a.category === 'Promotion';
                case 'newsletters':
                    return a.category === 'Newsletter';
                case 'transactions':
                    return a.category === 'Transaction';
                default:
                    return true;
            }
        });
    },

    _getSortedEmails(emails) {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, NONE: 3 };
        
        return emails.sort((a, b) => {
            switch (this.currentSort) {
                case 'priority':
                    return (priorityOrder[a.analysis?.priority] || 3) - (priorityOrder[b.analysis?.priority] || 3);
                case 'category':
                    return (a.analysis?.category || '').localeCompare(b.analysis?.category || '');
                case 'date':
                default:
                    return new Date(b.received_at || 0) - new Date(a.received_at || 0);
            }
        });
    },

    changeFilter(filter) {
        this.currentFilter = filter;
        const container = document.getElementById('inbox-content');
        if (container) {
            container.innerHTML = this._renderInbox();
            this._attachListeners();
        }
    },

    changeSort(sort) {
        this.currentSort = sort;
        const list = document.getElementById('email-list');
        if (list) {
            const filtered = this._getFilteredEmails();
            const sorted = this._getSortedEmails(filtered);
            list.innerHTML = sorted.length > 0
                ? sorted.map(email => this._renderEmailItem(email)).join('')
                : '<div class="empty-state"><div class="empty-icon">📭</div><h3>No emails found</h3></div>';
        }
    },

    _attachListeners() {
        // Additional event listeners if needed
    },

    _escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
