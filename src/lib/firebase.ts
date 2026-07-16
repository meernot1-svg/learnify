import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, memoryLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// EXPLICITLY use memoryLocalCache and forced long-polling to prevent persistent hangs in the preview environment
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Prevent multiple concurrent popups
let isSigningIn = false;

export const signInWithGoogle = async () => {
  if (isSigningIn) {
    console.warn("Sign-in already in progress...");
    return;
  }
  
  isSigningIn = true;
  try {
    // Attempt popup first
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      console.warn('Popup blocked, falling back to redirect...');
      // Direct redirect is often a safe fallback in iframes
      return await signInWithRedirect(auth, googleProvider);
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.log('Popup request cancelled');
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.log('User closed popup');
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Check for redirect results on load
getRedirectResult(auth).catch(err => {
  if (err.code !== 'auth/no-current-user') {
    console.error('Redirect sign-in error:', err);
  }
});

async function testConnection(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      // Try to reach the server to verify connectivity
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Firebase connection successful");
      return;
    } catch (error: any) {
      const isOffline = error.message?.includes('the client is offline') || 
                        error.code === 'unavailable' || 
                        error.message?.includes('deadline-exceeded');
                        
      if (isOffline && i < retries - 1) {
        console.warn(`Connection attempt ${i + 1} failed, retrying in ${2000 * (i + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      
      if (isOffline) {
        console.warn("Firestore remains in offline mode. This may be due to network restrictions in the preview environment.");
      } else {
        console.error("Firebase test connection failed:", error);
      }
      break;
    }
  }
}

// Initial connection check
setTimeout(() => testConnection(), 1500);
