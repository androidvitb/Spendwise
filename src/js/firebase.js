import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_-m5pf_FRV2XvGx51JTOgZmQy1LTNQLE",
  authDomain: "spendwise-a3dd4.firebaseapp.com",
  projectId: "spendwise-a3dd4",
  storageBucket: "spendwise-a3dd4.firebasestorage.app",
  messagingSenderId: "585575423826",
  appId: "1:585575423826:web:a5059af514d81a6032648b",
  measurementId: "G-WH2SQGNM1W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  googleProvider 
};