import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  
} from './firebase.js';



// Function to display error messages
const displayError = (message) => {
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
    setTimeout(() => errorElement.classList.add("hidden"), 5000);
  }
};

const handleAuthForm = async (isLoginForm) => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    return console.error("Missing email or password.");
  }

  try {
    let userCredential;
    if (isLoginForm) {
      console.log("Attempting login...");
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } else {
      console.log("Attempting signup...");
      const confirmPassword = document.getElementById('confirm_password')?.value;
      if (password !== confirmPassword) {
        return displayError('Passwords do not match');
      }
      if (password.length < 6) {
        return displayError('Password must be at least 6 characters');
      }
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    }

    console.log("Authentication successful:", userCredential.user);
    
    // Ensure user is authenticated before redirecting
    if (userCredential.user) {
      window.location.href = "/dashboard.html";  // Update the correct path
    }
  } catch (error) {
    console.error("Signup/Login Error:", error.code, error.message);
    displayError(error.message);
  }
};


// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Email/Password Login
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const googleLogin = document.getElementById('googleLogin');
  const googleSignup = document.getElementById('googleSignup');

  if (loginForm) {
    console.log("Login form detected and event listener added.");
      loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          console.log("Login button clicked."); // Debugging log
          handleAuthForm(true);
      });
  } else {
    console.error("Login form not found.");
  }

  if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
          e.preventDefault();
          handleAuthForm(false);
      });
  }

  // Google Sign-In
  // Google Sign-In (Works for both login and signup)
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Login Successful:", result.user);
      // await signInWithPopup(auth, googleProvider);
      if (result.user) {
        window.location.href = "/dashboard.html";  // Update path if needed
      }
      // redirectToDashboard();
    } catch (error) {
      console.error("Google Login Error:", error.code, error.message);
      displayError(error.message);
    }
  };
  if (googleLogin) googleLogin.addEventListener('click', handleGoogleSignIn);
  if (googleSignup) googleSignup.addEventListener('click', handleGoogleSignIn);
});
