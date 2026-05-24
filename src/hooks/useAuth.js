import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut } from 'firebase/auth';
import { fbAuth } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = still loading

  useEffect(() => {
    const unsub = onAuthStateChanged(fbAuth, u => setUser(u ?? null));
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(fbAuth, provider);
  };

  const signOut = async () => {
    await fbSignOut(fbAuth);
  };

  return { user, signInWithGoogle, signOut, loading: user === undefined };
}
