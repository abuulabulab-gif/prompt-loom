import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from 'firebase/auth';
import { fbAuth } from '../firebase';


export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = still loading

  useEffect(() => {
    let unsub = () => {};

    (async () => {
      // Handle any pending redirect result (e.g. fallback redirect from a popup-blocked browser).
      // Must be awaited before registering onAuthStateChanged so the credential is already applied.
      try {
        await getRedirectResult(fbAuth);
      } catch (e) {
        // Ignore "no pending redirect" — only log unexpected errors
        if (e?.code !== 'auth/no-redirect-for-sign-in') {
          console.warn('[auth] getRedirectResult failed:', e?.code);
        }
      }
      unsub = onAuthStateChanged(fbAuth, u => setUser(u ?? null));
    })();

    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // signInWithPopup works on all platforms including Android Chrome (via Chrome Custom Tab).
      // Unlike signInWithRedirect, CCT-based popup communicates the result via onAuthStateChanged
      // without requiring a page reload, so getRedirectResult is never left unread.
      await signInWithPopup(fbAuth, provider);
    } catch (e) {
      if (e?.code === 'auth/popup-blocked') {
        // Only fall back to redirect when the browser explicitly blocks the popup
        await signInWithRedirect(fbAuth, provider);
      } else if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        throw e;
      }
    }
  };

  const signOut = async () => {
    await fbSignOut(fbAuth);
  };

  return { user, signInWithGoogle, signOut, loading: user === undefined };
}
