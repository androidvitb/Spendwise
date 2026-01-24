import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  updateProfile
} from "./firebase.js";

/* =======================
   Error Handling
======================= */
const errorBox = document.getElementById("errorMessage");

const showError = (message) => {
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  setTimeout(() => errorBox.classList.add("hidden"), 4000);
};

/* =======================
   Redirect
======================= */
const redirectDashboard = () => {
  window.location.href = "/dashboard";
};

/* =======================
   Login / Signup Handler
======================= */
const handleAuth = async (isLogin) => {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) {
    showError("Email and password are required");
    return;
  }

  try {
    if (isLogin) {
      /* ---------- LOGIN ---------- */
      await signInWithEmailAndPassword(auth, email, password);
      redirectDashboard();

    } else {
      /* ---------- SIGNUP ---------- */
      const name = document.getElementById("name")?.value.trim();
      const confirmPassword =
        document.getElementById("confirm_password")?.value.trim();

      if (!name) {
        showError("Full name is required");
        return;
      }

      if (password !== confirmPassword) {
        showError("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        showError("Password must be at least 6 characters");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save user's name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      redirectDashboard();
    }
  } catch (error) {
    showError(formatFirebaseError(error.code));
  }
};

/* =======================
   Google Auth
======================= */
const handleGoogleAuth = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    redirectDashboard();
  } catch (error) {
    showError(formatFirebaseError(error.code));
  }
};

/* =======================
   Firebase Error Mapper
======================= */
const formatFirebaseError = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "Email is already registered";
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/popup-closed-by-user":
      return "Google sign-in cancelled";
    default:
      return "Something went wrong. Please try again.";
  }
};

/* =======================
   Event Listeners
======================= */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleAuth(true);
  });

  document.getElementById("signupForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleAuth(false);
  });

  document
    .getElementById("googleLogin")
    ?.addEventListener("click", handleGoogleAuth);

  document
    .getElementById("googleSignup")
    ?.addEventListener("click", handleGoogleAuth);
});
