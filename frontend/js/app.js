/**
 * AI Email Action Manager — Main Application
 * Registers all routes and renders the landing page
 */

// ─── App Navigation Component ─────────────────

const AppNav = {
    render(activePage = '') {
        return `
            <nav class="app-nav">
                <div class="nav-inner">
                    <a href="/dashboard" class="nav-brand">
                        <div class="brand-icon">✉</div>
                        <span>AI Email Manager</span>
                    </a>
                    <button class="nav-toggle" onclick="AppNav.toggleMobile()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 12h18M3 6h18M3 18h18"/>
                        </svg>
                    </button>
                    <div class="nav-links" id="nav-links">
                        <a href="/dashboard" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a>
                        <a href="/inbox" class="nav-link ${activePage === 'inbox' ? 'active' : ''}">Inbox</a>
                        <a href="/actions" class="nav-link ${activePage === 'actions' ? 'active' : ''}">Actions</a>
                        <a href="/settings" class="nav-link ${activePage === 'settings' ? 'active' : ''}">Settings</a>
                    </div>
                    <div class="nav-right">
                        <div class="nav-user" style="cursor: pointer;" title="Sign out" onclick="if(confirm('Do you want to log out?')) Auth.logout()">
                            ${Auth.user?.picture ? `<img src="${Auth.user.picture}" class="nav-avatar" style="object-fit:cover;border-radius:50%;width:32px;height:32px;" alt="" />` : `<div class="nav-avatar">${Auth.getInitials()}</div>`}
                            <span class="text-sm">${Auth.user?.name || ''}</span>
                            <span class="text-xs text-muted" style="margin-left: 4px; font-size: 0.75rem;">(Logout)</span>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    },

    toggleMobile() {
        const links = document.getElementById('nav-links');
        if (links) links.classList.toggle('open');
    }
};


// ─── Landing Page ─────────────────────────────

function renderLandingPage() {
    return `
        <!-- Landing Navigation -->
        <nav class="landing-nav" id="landing-nav">
            <div class="nav-inner">
                <a href="/" class="nav-brand">
                    <div class="brand-icon">✉</div>
                    <span>AI Email Manager</span>
                </a>
                <div class="landing-nav-links">
                    <a href="#how-it-works">How It Works</a>
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#privacy">Privacy</a>
                </div>
                <div class="landing-nav-cta">
                    <button class="btn btn-ghost btn-sm" onclick="Demo.start()">Try Demo</button>
                    <button class="btn btn-primary btn-sm" onclick="Auth.connectGmail()">Connect Gmail</button>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero page-enter">
            <div class="container">
                <div class="hero-badge">✨ AI-Powered Email Intelligence</div>
                <h1>
                    Don't manage your inbox.<br>
                    Manage <span class="gradient-text">what needs to be done.</span>
                </h1>
                <p class="hero-subtitle">
                    AI turns your email overload into a clear, prioritized list of actions. 
                    Know exactly what needs your attention — every single day.
                </p>
                <div class="hero-buttons">
                    <button class="btn btn-primary btn-lg" onclick="Auth.connectGmail()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        Connect Gmail
                    </button>
                    <button class="btn btn-secondary btn-lg" onclick="Demo.start()">
                        🧪 Try Demo
                    </button>
                </div>
                <div class="hero-trust">
                    <span>🔒 Secure OAuth</span>
                    <span>🚫 No passwords stored</span>
                    <span>🗑️ Delete anytime</span>
                </div>
            </div>
        </section>

        <!-- Problem Section -->
        <section class="landing-section" id="problem">
            <div class="container">
                <div class="text-center">
                    <span class="section-label">The Problem</span>
                    <h2 class="section-title">Your inbox is overwhelming</h2>
                    <p class="section-subtitle">
                        Important emails get buried under promotions, newsletters, and notifications. 
                        You spend more time searching than doing.
                    </p>
                </div>
                <div class="problem-grid">
                    <div class="card problem-card">
                        <div class="problem-icon">📨</div>
                        <h3>Email Overload</h3>
                        <p>Dozens of emails daily — client deadlines mixed with promotional offers and social notifications.</p>
                    </div>
                    <div class="card problem-card">
                        <div class="problem-icon">⏰</div>
                        <h3>Missed Deadlines</h3>
                        <p>Important action items buried in your inbox lead to missed deadlines and forgotten tasks.</p>
                    </div>
                    <div class="card problem-card">
                        <div class="problem-icon">😵</div>
                        <h3>Decision Fatigue</h3>
                        <p>Reading every email to figure out what matters wastes time and mental energy.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- How It Works -->
        <section class="landing-section" id="how-it-works">
            <div class="container">
                <div class="text-center">
                    <span class="section-label">How It Works</span>
                    <h2 class="section-title">From chaos to clarity in 4 steps</h2>
                    <p class="section-subtitle">Connect your Gmail, and AI does the rest.</p>
                </div>
                <div class="steps-grid">
                    <div class="step-card">
                        <div class="step-number">1</div>
                        <h3>Connect Gmail</h3>
                        <p>Sign in with Google and connect your Gmail account securely via OAuth.</p>
                        <span class="step-arrow">→</span>
                    </div>
                    <div class="step-card">
                        <div class="step-number">2</div>
                        <h3>AI Reads Emails</h3>
                        <p>AI analyzes your recent emails to understand context, urgency, and intent.</p>
                        <span class="step-arrow">→</span>
                    </div>
                    <div class="step-card">
                        <div class="step-number">3</div>
                        <h3>Classifies & Prioritizes</h3>
                        <p>Each email gets a category, priority level, and extracted action items.</p>
                        <span class="step-arrow">→</span>
                    </div>
                    <div class="step-card">
                        <div class="step-number">4</div>
                        <h3>Your Action List</h3>
                        <p>See a clean, prioritized list of exactly what needs your attention today.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Chaos to Clarity Example -->
        <section class="chaos-section" id="example">
            <div class="container">
                <div class="text-center">
                    <span class="section-label">The Transformation</span>
                    <h2 class="section-title">From chaos to clarity</h2>
                    <p class="section-subtitle">See how AI transforms a messy inbox into actionable insights.</p>
                </div>
                <div class="chaos-grid">
                    <div class="chaos-before">
                        <div class="chaos-header">❌ Before AI — 92 unread emails</div>
                        <ul class="chaos-list">
                            <li>⚪ Amazon — Your order has shipped</li>
                            <li>⚪ Flipkart — Big Billion Days Sale!</li>
                            <li>⚪ ICICI Bank — Bill payment due</li>
                            <li>⚪ LinkedIn — 5 new notifications</li>
                            <li>⚪ Client — Project deadline revised</li>
                            <li>⚪ Newsletter — Weekly tech roundup</li>
                            <li>⚪ Paytm — Cashback offer for you</li>
                            <li>⚪ Zomato — Your food is on the way</li>
                            <li>⚪ GitHub — PR needs review</li>
                            <li>⚪ Spotify — Discover Weekly ready</li>
                            <li style="color:var(--text-muted);">... and 82 more</li>
                        </ul>
                    </div>
                    <div class="chaos-arrow">
                        <span class="arrow-text">AI</span>
                        <span class="arrow-icon">→</span>
                    </div>
                    <div class="chaos-after">
                        <div class="chaos-header">✅ After AI — 3 actions needed</div>
                        <ul class="chaos-list">
                            <li>🔴 <strong>Client deadline</strong> — Confirm by today</li>
                            <li>🟠 <strong>Bill payment</strong> — ₹2,340 due tomorrow</li>
                            <li>🟠 <strong>PR review</strong> — Blocking release</li>
                        </ul>
                        <div style="padding: var(--space-3) var(--space-5); border-top: 1px solid var(--border-light); font-size: var(--font-xs); color: var(--text-muted);">
                            Also: 2 promotions, 1 newsletter, 2 transactions, 2 social — all auto-categorized
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features -->
        <section class="landing-section" id="features">
            <div class="container">
                <div class="text-center">
                    <span class="section-label">Key Features</span>
                    <h2 class="section-title">Everything you need, nothing you don't</h2>
                    <p class="section-subtitle">Built for productivity, designed for clarity.</p>
                </div>
                <div class="features-grid">
                    <div class="card feature-card">
                        <div class="feature-icon">🤖</div>
                        <h3>AI Classification</h3>
                        <p>Emails are automatically categorized into 10 types — work, personal, transactions, promotions, and more.</p>
                    </div>
                    <div class="card feature-card">
                        <div class="feature-icon">🎯</div>
                        <h3>Smart Prioritization</h3>
                        <p>AI assigns HIGH, MEDIUM, or LOW priority based on content, sender, and urgency signals.</p>
                    </div>
                    <div class="card feature-card">
                        <div class="feature-icon">📋</div>
                        <h3>Action Extraction</h3>
                        <p>Extracts specific action items and deadlines from emails — "Reply to client by Friday."</p>
                    </div>
                    <div class="card feature-card">
                        <div class="feature-icon">📅</div>
                        <h3>Deadline Detection</h3>
                        <p>Finds dates and deadlines in your emails and organizes actions chronologically.</p>
                    </div>
                    <div class="card feature-card">
                        <div class="feature-icon">👤</div>
                        <h3>Personalization</h3>
                        <p>Tell us if you're a student, freelancer, or professional — AI adjusts priorities accordingly.</p>
                    </div>
                    <div class="card feature-card">
                        <div class="feature-icon">🔒</div>
                        <h3>Privacy First</h3>
                        <p>OAuth-only access, no passwords stored, delete your data anytime. Your inbox stays yours.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Privacy -->
        <section class="landing-section" id="privacy">
            <div class="container">
                <div class="text-center">
                    <span class="section-label">Privacy & Trust</span>
                    <h2 class="section-title">Your email is private. We take that seriously.</h2>
                    <p class="section-subtitle">Here's how we handle your data.</p>
                </div>
                <div class="privacy-grid">
                    <div class="card privacy-item">
                        <div class="privacy-icon">🔐</div>
                        <div>
                            <h4>Google OAuth Only</h4>
                            <p>We use Google's official OAuth 2.0. We never see or store your Gmail password.</p>
                        </div>
                    </div>
                    <div class="card privacy-item">
                        <div class="privacy-icon">📧</div>
                        <div>
                            <h4>Minimal Access</h4>
                            <p>We request only the minimum Gmail permissions needed to read recent emails.</p>
                        </div>
                    </div>
                    <div class="card privacy-item">
                        <div class="privacy-icon">🔌</div>
                        <div>
                            <h4>Disconnect Anytime</h4>
                            <p>Remove Gmail access with one click. We stop accessing your emails immediately.</p>
                        </div>
                    </div>
                    <div class="card privacy-item">
                        <div class="privacy-icon">🗑️</div>
                        <div>
                            <h4>Delete Your Data</h4>
                            <p>Permanently delete all stored email data and analysis with a single action.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Pricing -->
        <section class="landing-section" id="pricing">
            <div class="container">
                <div class="text-center">
                    <span class="section-label">Pricing</span>
                    <h2 class="section-title">Simple, transparent pricing</h2>
                    <p class="section-subtitle">Start for free. Upgrade when you need more.</p>
                </div>
                <div class="pricing-grid">
                    <div class="pricing-card">
                        <div class="plan-name">Free</div>
                        <div class="plan-price">₹0 <span>/month</span></div>
                        <div class="plan-desc">Perfect for getting started</div>
                        <ul class="plan-features">
                            <li>100 emails/month</li>
                            <li>AI classification</li>
                            <li>Action extraction</li>
                            <li>Basic dashboard</li>
                        </ul>
                        <button class="btn btn-secondary" style="width:100%" onclick="Demo.start()">Get Started</button>
                    </div>
                    <div class="pricing-card featured">
                        <div class="plan-name">Starter</div>
                        <div class="plan-price">₹199 <span>/month</span></div>
                        <div class="plan-desc">For daily email users</div>
                        <ul class="plan-features">
                            <li>2,000 emails/month</li>
                            <li>Priority support</li>
                            <li>Advanced analytics</li>
                            <li>Custom categories</li>
                        </ul>
                        <button class="btn btn-primary" style="width:100%" onclick="Demo.start()">Start Trial</button>
                    </div>
                    <div class="pricing-card">
                        <div class="plan-name">Pro</div>
                        <div class="plan-price">₹499 <span>/month</span></div>
                        <div class="plan-desc">For power users</div>
                        <ul class="plan-features">
                            <li>10,000 emails/month</li>
                            <li>Team features</li>
                            <li>API access</li>
                            <li>Custom AI rules</li>
                        </ul>
                        <button class="btn btn-secondary" style="width:100%" onclick="Demo.start()">Contact Us</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section">
            <div class="container">
                <h2>Ready to reclaim your inbox?</h2>
                <p>Stop scrolling through emails. Start doing what matters.</p>
                <div class="cta-buttons">
                    <button class="btn btn-white btn-lg" onclick="Demo.start()">
                        🧪 Try Demo — No Sign Up
                    </button>
                    <button class="btn btn-outline-white btn-lg" onclick="Auth.connectGmail()">
                        Connect Gmail
                    </button>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="landing-footer">
            <div class="container">
                <p>© 2026 AI Email Action Manager. Built with ❤️ for productivity.</p>
                <p class="mt-2">
                    <a href="#privacy">Privacy Policy</a> · 
                    <a href="#pricing">Pricing</a> · 
                    <a href="mailto:support@example.com">Contact</a>
                </p>
            </div>
        </footer>
    `;
}


// ─── Email Detail Page ────────────────────────

function renderEmailDetailPage(params) {
    const emailId = params[0];
    
    const html = `
        ${AppNav.render('')}
        <div class="app-layout">
            <div class="app-content page-enter">
                <div class="email-detail" id="email-detail-content">
                    <div class="text-center text-muted mt-8">Loading email...</div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => loadEmailDetail(emailId), 50);
    return html;
}

async function loadEmailDetail(emailId) {
    try {
        let email;
        if (Auth.isAuthenticated && !Auth.isDemo && Auth.user?.google_id) {
            try {
                email = await API.getUserEmailDetail(emailId, Auth.user.google_id);
            } catch (e) {
                console.warn("Falling back to demo email detail:", e);
                email = await API.getDemoEmailDetail(emailId);
            }
        } else {
            email = await API.getDemoEmailDetail(emailId);
        }

        const container = document.getElementById('email-detail-content');
        if (!container) return;

        const analysis = email.analysis || {};
        const priorityClass = (analysis.priority || 'none').toLowerCase();
        const date = email.received_at ? new Date(email.received_at).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }) : '';

        const gmailId = email.thread_id || email.gmail_message_id;
        const isRealGmail = gmailId && !String(gmailId).startsWith('demo_');
        const gmailUrl = isRealGmail
            ? `https://mail.google.com/mail/u/0/#all/${encodeURIComponent(gmailId)}`
            : 'https://mail.google.com/mail/u/0/#inbox';

        container.innerHTML = `
            <div class="email-detail-header">
                <button class="back-btn" onclick="history.back()">← Back</button>
            </div>

            <div class="email-detail-card">
                <div class="email-detail-top">
                    <h2>${escapeHtml(email.subject)}</h2>
                    <div class="email-detail-meta">
                        <div class="meta-item">
                            <strong>From:</strong> ${escapeHtml(email.sender)} &lt;${escapeHtml(email.sender_email)}&gt;
                        </div>
                        <div class="meta-item">
                            <strong>Date:</strong> ${date}
                        </div>
                    </div>
                </div>

                ${email.body ? `
                    <div class="email-body-preview" style="background: var(--bg-surface, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem; font-size: 0.92rem; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-height: 300px; overflow-y: auto; color: var(--text-primary, #334155);">
                        ${escapeHtml(email.body)}
                    </div>
                ` : ''}

                <div class="email-ai-section">
                    <div class="ai-badge">🤖 AI Analysis</div>
                    
                    <div class="ai-field">
                        <div class="field-label">Summary</div>
                        <div class="field-value">${escapeHtml(analysis.summary || 'No summary available.')}</div>
                    </div>

                    <div class="ai-field">
                        <div class="field-label">Category</div>
                        <div class="field-value">
                            <span class="badge badge-category">${analysis.category || 'Other'}</span>
                        </div>
                    </div>

                    <div class="ai-field">
                        <div class="field-label">Priority</div>
                        <div class="field-value">
                            <span class="badge badge-${priorityClass}">${analysis.priority || 'NONE'}</span>
                        </div>
                    </div>

                    ${analysis.action_required ? `
                        <div class="ai-field">
                            <div class="field-label">Required Action</div>
                            <div class="field-value" style="font-weight:600; color: var(--navy-800);">
                                ${escapeHtml(analysis.action)}
                            </div>
                        </div>
                    ` : ''}

                    ${analysis.deadline ? `
                        <div class="ai-field">
                            <div class="field-label">Deadline</div>
                            <div class="field-value">${analysis.deadline}</div>
                        </div>
                    ` : ''}

                    <div class="ai-field">
                        <div class="field-label">Why AI thinks this matters</div>
                        <div class="field-value" style="font-style: italic; color: var(--text-secondary);">
                            ${escapeHtml(analysis.reason || 'Categorized based on email signals.')}
                        </div>
                    </div>
                </div>

                <div class="email-detail-actions">
                    <button class="btn btn-primary btn-sm" onclick="window.open('${gmailUrl}', '_blank')" style="display:inline-flex; align-items:center; gap:6px;">
                        <span>✉️</span> Open in Gmail ↗
                    </button>
                    ${analysis.action_required ? `
                        <button class="btn btn-success btn-sm" onclick="Toast.success('Marked as done!')">
                            ✓ Mark Done
                        </button>
                    ` : ''}
                    <button class="btn btn-ghost btn-sm" onclick="history.back()">
                        ← Go Back
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        const container = document.getElementById('email-detail-content');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Email not found</h3>
                    <p>We couldn't load this email. It may have been deleted.</p>
                    <button class="btn btn-primary mt-4" onclick="Router.navigate('/inbox')">Back to Inbox</button>
                </div>
            `;
        }
    }
}


// ─── Utility ──────────────────────────────────

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}


// ─── Route Registration ───────────────────────

Router.register('/', renderLandingPage);
Router.register('/dashboard', () => DashboardPage.render());
Router.register('/inbox', () => InboxPage.render());
Router.register('/actions', () => ActionsPage.render());
Router.register('/settings', () => SettingsPage.render());
Router.register('/email/:id', renderEmailDetailPage);


// ─── Initialize App ───────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.remove(), 500);
    }

    // Initialize toast system
    Toast.init();

    // Start the router
    Router.init();

    // Landing page scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('landing-nav');
        if (nav) {
            nav.classList.toggle('scrolled', window.scrollY > 20);
        }
    });
});
