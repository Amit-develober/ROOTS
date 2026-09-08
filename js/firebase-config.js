/**
 * Firebase Configuration and Initialization
 * 
 * Instructions:
 * 1. Go to Firebase Console (https://console.firebase.google.com/)
 * 2. Create a project and register a Web App
 * 3. Copy your firebaseConfig and replace the placeholders below
 * 4. Enable Google Authentication in Firebase Console -> Authentication -> Sign-in method
 * 5. In Google Cloud Console for the same project, enable the Gmail API and add:
 *    Scope: https://www.googleapis.com/auth/gmail.readonly
 */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAg61GxOFe5cnOSTXNvnvADW92bWtyybwU",
    authDomain: "aisumemail.firebaseapp.com",
    projectId: "aisumemail",
    storageBucket: "aisumemail.firebasestorage.app",
    messagingSenderId: "624554997497",
    appId: "1:624554997497:web:ccf21b0061eb98ee75d428",
    measurementId: "G-G1CJ2WY035"
};

const FirebaseManager = {
    auth: null,
    provider: null,

    /**
     * Check if user has replaced placeholder credentials
     */
    isConfigured() {
        return FIREBASE_CONFIG.apiKey && 
               FIREBASE_CONFIG.apiKey !== "YOUR_FIREBASE_API_KEY" &&
               !FIREBASE_CONFIG.apiKey.includes("YOUR_");
    },

    /**
     * Initialize Firebase App and Google Auth Provider with Gmail scopes
     */
    init() {
        if (typeof firebase === 'undefined') {
            console.warn("[Firebase] Firebase SDK not loaded.");
            return null;
        }

        if (!this.isConfigured()) {
            console.info("[Firebase] Demo/Unconfigured mode. Replace credentials in js/firebase-config.js to connect live Gmail.");
            return null;
        }

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            this.auth = firebase.auth();

            // Set up Google Auth Provider with Gmail read-only scope
            this.provider = new firebase.auth.GoogleAuthProvider();
            this.provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
            
            // Force account selection/consent prompt so refresh and scopes are confirmed
            this.provider.setCustomParameters({
                prompt: 'select_account'
            });

            console.log("[Firebase] Initialized successfully with Gmail scope.");
            return this.auth;
        } catch (err) {
            console.error("[Firebase] Initialization error:", err);
            return null;
        }
    }
};

// Auto-initialize when script loads if Firebase SDK is ready
if (typeof firebase !== 'undefined') {
    FirebaseManager.init();
}
