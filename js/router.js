/**
 * Simple SPA Router for AI Email Action Manager
 * Handles client-side routing without page reloads
 */

const Router = {
    routes: {},
    currentRoute: null,
    
    /**
     * Register a route with a render function
     */
    register(path, renderFn) {
        this.routes[path] = renderFn;
    },

    /**
     * Navigate to a route
     */
    getBasePath() {
        const path = window.location.pathname;
        const match = path.match(/^\/([^\/]+)/);
        if (match && window.location.hostname.includes('github.io')) {
            return `/${match[1]}`;
        }
        return '';
    },

    normalizePath(fullPath) {
        const base = this.getBasePath();
        if (base && fullPath.startsWith(base)) {
            fullPath = fullPath.substring(base.length);
        }
        if (!fullPath || fullPath === '') return '/';
        if (fullPath.length > 1 && fullPath.endsWith('/')) {
            fullPath = fullPath.slice(0, -1);
        }
        return fullPath;
    },

    /**
     * Navigate to a route
     */
    navigate(path, force = false) {
        const normalized = this.normalizePath(path);
        if (this.currentRoute === normalized && !force) return;
        const base = this.getBasePath();
        history.pushState(null, '', base + normalized);
        this.render(normalized);
    },

    /**
     * Render the current route
     */
    async render(path) {
        path = this.normalizePath(path);
        this.currentRoute = path;
        const app = document.getElementById('app');

        // Find matching route
        let renderFn = this.routes[path];
        
        // Check for parameterized routes (e.g., /email/:id)
        if (!renderFn) {
            for (const [routePath, fn] of Object.entries(this.routes)) {
                if (routePath.includes(':')) {
                    const regex = new RegExp('^' + routePath.replace(/:(\w+)/g, '([^/]+)') + '$');
                    const match = path.match(regex);
                    if (match) {
                        renderFn = () => fn(match.slice(1));
                        break;
                    }
                }
            }
        }

        // 404 fallback
        if (!renderFn) {
            renderFn = this.routes['/'] || (() => '<h1>Page not found</h1>');
        }

        // Render with page transition (handle both sync strings and Promises)
        let content = renderFn();
        if (content instanceof Promise) {
            content = await content;
        }

        if (typeof content === 'string') {
            app.innerHTML = content;
            // Trigger page enter animation
            const page = app.querySelector('.page-enter');
            if (page) {
                page.style.animation = 'none';
                page.offsetHeight; // Force reflow
                page.style.animation = '';
            }
        }

        // Update nav active states
        this._updateNavActive(path);

        // Scroll to top
        window.scrollTo(0, 0);
    },

    /**
     * Initialize the router
     */
    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.render(window.location.pathname);
        });

        // Intercept link clicks for SPA navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link) {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                    e.preventDefault();
                    this.navigate(href);
                }
            }
        });

        // Handle hash links for landing page sections
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Render initial route
        this.render(window.location.pathname);
    },

    /**
     * Update active nav link
     */
    _updateNavActive(path) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
};
