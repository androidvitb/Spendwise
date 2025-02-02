import { auth } from './firebase.js';

export const checkAuth = (redirectIfUnauthenticated = true) => {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        resolve(user);
      } else {
        if (redirectIfUnauthenticated) {
          window.location.href = '/src/auth/login.html';
        }
        resolve(null);
      }
    });
  });
};