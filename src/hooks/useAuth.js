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

// Mobile browsers (Android + iOS Chrome/Firefox) block signInWithPopup reliably
const isMobileDevice = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = still loading

  useEffect(() => {
    let unsub = () => {};

    (async () => {
      // On Android, signInWithRedirect causes a full page reload.
      // We must await getRedirectResult BEFORE registering onAuthStateChanged,
      // otherwise the listener fires with null (no user yet) and may never
      // fire again after the redirect credential is applied.
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
    if (isMobileDevice()) {
      // Mobile: use redirect to avoid popup blocker / WebView restrictions on iOS & Android
      await signInWithRedirect(fbAuth, provider);
    } else {
      // Desktop: popup is smoother UX
      await signInWithPopup(fbAuth, provider);
    }
  };

  const signOut = async () => {
    await fbSignOut(fbAuth);
  };

  return { user, signInWithGoogle, signOut, loading: user === undefined };
}
