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

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = still loading

  useEffect(() => {
    // Handle redirect result on page load (mobile flow)
    getRedirectResult(fbAuth).catch(() => {});

    const unsub = onAuthStateChanged(fbAuth, u => setUser(u ?? null));
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    if (isMobile()) {
      // Mobile: use redirect to avoid Google's WebView popup policy violation
      await signInWithRedirect(fbAuth, provider);
    } else {
      await signInWithPopup(fbAuth, provider);
    }
  };

  const signOut = async () => {
    await fbSignOut(fbAuth);
  };

  return { user, signInWithGoogle, signOut, loading: user === undefined };
}
