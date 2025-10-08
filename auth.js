/* auth.js — Firebase auth glue for Rolling FTE Planner
   Requires:
   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
*/

const firebaseConfig = {
  apiKey: "AIzaSyBG9uJSuftXsRqvIxo2NZPRJmsLGro3vbA",
  authDomain: "fte-planner.firebaseapp.com",
  projectId: "fte-planner",
  storageBucket: "fte-planner.firebasestorage.app",
  messagingSenderId: "410936425819",
  appId: "1:410936425819:web:4332c19848bf6ef64c2e7e",
  measurementId: "G-0BZP3LETBE"
};

// ← set YOUR owner details
const OWNER_EMAIL = "phoneemail07@gmail.com";
const OWNER_ACCESS_CODE = "CHANGE_ME_OWNER_CODE";  // choose any secret string

// Init Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
// Persist sessions locally so page refresh stays signed in
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ---- helpers exposed to pages ----
window.fteAuth = {
  // redirect to access.html if not signed in
  guardOrRedirect() {
    auth.onAuthStateChanged(u => {
      if (!u) location.href = "access.html";
    });
  },

  // if already signed in, go straight to app
  goToAppIfSignedIn() {
    auth.onAuthStateChanged(u => {
      if (u) location.href = "index.html";
    });
  },

  async signIn(email, pass) {
    await auth.signInWithEmailAndPassword(String(email || "").trim(), pass || "");
  },

  async signOut() {
    await auth.signOut();
    location.href = "access.html";
  },

  /**
   * Create account.
   * role: "user" | "superadmin"
   * ownerEmailUI: value shown in the UI (read-only), must equal OWNER_EMAIL when role=superadmin
   * ownerCode: must equal OWNER_ACCESS_CODE when role=superadmin
   */
  async createAccount(email, pass, role, ownerEmailUI, ownerCode) {
    email = String(email || "").trim().toLowerCase();
    role = String(role || "user");

    if (!email) throw new Error("Enter an email.");
    if (!pass || pass.length < 8) throw new Error("Password must be at least 8 characters.");

    if (role === "superadmin") {
      if (!OWNER_EMAIL) throw new Error("Owner not configured.");
      if (String(ownerEmailUI || "").toLowerCase() !== OWNER_EMAIL.toLowerCase())
        throw new Error("Owner email does not match.");
      if (email !== OWNER_EMAIL.toLowerCase())
        throw new Error("Superadmin account must use the owner email.");
      if (ownerCode !== OWNER_ACCESS_CODE)
        throw new Error("Owner access code invalid.");
    }

    // Note: without a backend we can’t set tamper-proof roles.
    // We only gate superadmin creation by email + code.
    await auth.createUserWithEmailAndPassword(email, pass);
  }
};
