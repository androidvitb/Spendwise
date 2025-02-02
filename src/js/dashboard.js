import { auth } from './js/firebase.js';

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = '/auth/login.html';
  }
});
import { checkAuth } from './protectedRoute.js';

checkAuth().then(user => {
  // User is authenticated, initialize dashboard
  console.log('Authenticated user:', user);
  // Your existing dashboard initialization code
});