// auth.js
// 1) Replace with your Firebase Web App config (Firebase Console → Project settings → Web app)
const firebaseConfig = {
  apiKey:      "YOUR_API_KEY",
  authDomain:  "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:   "YOUR_PROJECT_ID",
  appId:       "YOUR_APP_ID"
};

// 2) Set your owner email (used to mark the session as superadmin)
const OWNER_EMAIL = "phoneemail07@gmail.com";

// --- do not edit below ---
if (!window.firebase) throw new Error("Firebase SDK not loaded (check script tags in access.html)");

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

/**
 * Sign in via Firebase and write the same session shape your app expects:
 * localStorage key: "fte-session" → { email, role, exp }
 */
async function signInAndSetSession(email, password) {
  const cred = await auth.signInWithEmailAndPassword(email.trim(), password);
  const user = cred.user;
  const role = (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase() ? "superadmin" : "user";
  const exp  = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
  localStorage.setItem("fte-session", JSON.stringify({ email: user.email, role, exp }));
  location.href = "index.html";
}

/** Optional helper to sign out and clear the session */
function signOutAndClear() {
  try { localStorage.removeItem("fte-session"); } catch {}
  auth.signOut().finally(() => location.href = "access.html");
}

// Expose for access.html
window.__AUTH__ = { signInAndSetSession, signOutAndClear, auth };

/** If already logged in (Firebase), do nothing here.
 *  access.html calls signInAndSetSession() on button click.
 */
auth.onAuthStateChanged(() => {});
