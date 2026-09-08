/**
 * Demo mode handler
 */

const Demo = {
    /**
     * Enter demo mode and navigate to dashboard
     */
    start() {
        Auth.enterDemo();
        
        // Show brief analysis animation
        const app = document.getElementById('app');
        app.innerHTML = this._analysisScreen();
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress > 100) progress = 100;
            
            const bar = document.getElementById('analysis-progress-bar');
            const text = document.getElementById('analysis-progress-text');
            if (bar) bar.style.width = `${progress}%`;
            if (text) text.textContent = `Analyzing ${Math.min(Math.round(progress / 100 * 15), 15)} / 15 emails`;
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    Router.navigate('/dashboard', true);
                }, 400);
            }
        }, 150);
    },

    _analysisScreen() {
        return `
            <div class="analysis-screen">
                <div class="analysis-content">
                    <div style="font-size: 3rem; margin-bottom: 1.5rem;">🤖</div>
                    <h2>Analyzing your inbox...</h2>
                    <p>AI is reading and classifying your emails</p>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" id="analysis-progress-bar" style="width: 0%"></div>
                    </div>
                    <div class="progress-text" id="analysis-progress-text">Analyzing 0 / 15 emails</div>
                </div>
            </div>
        `;
    }
};
