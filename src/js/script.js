import { auth, signOut } from './js/firebase.js';

auth.onAuthStateChanged(user => {
  const authLinks = document.getElementById('authLinks');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (user) {
    authLinks.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    authLinks.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
});

// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = '/src/auth/login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
});