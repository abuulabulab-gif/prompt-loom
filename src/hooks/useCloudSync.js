import { useState, useEffect, useRef } from "react";
import { pushToCloud, pullFromCloud, mergeCharacters } from "../sync/firestore.js";

export function useCloudSync({
  user, signInWithGoogle, loaded,
  characters, orderUpdatedAt, settingsUpdatedAt,
  setCharacters, setOrderUpdatedAt, setSettingsUpdatedAt,
  theme, lang, viewMode, activeTool, toolSuffixes, history,
  setTheme, setLang, setViewMode, setActiveTool, setToolSuffixes, setHistory,
}) {
  const [syncStatus, setSyncStatus] = useState('');
  const [syncErrToast, setSyncErrToast] = useState(false);
  const [syncErrCode, setSyncErrCode] = useState('');
  const [dataSizeToast, setDataSizeToast] = useState(false);
  const cloudPushTimer = useRef(null);
  const isSyncingFromCloud = useRef(false);
  const lastCloudPullAt = useRef(0);
  const isApplyingRemoteSettings = useRef(false);
  const hasPendingPush = useRef(false);

  // Always-current snapshot of state — updated every render so async handlers
  // and event listeners always see the latest values without stale closures.
  const liveRef = useRef(null);
  liveRef.current = { // eslint-disable-line react-hooks/refs
    user, orderUpdatedAt, settingsUpdatedAt,
    characters, theme, lang, viewMode, activeTool, toolSuffixes, history,
  };

  useEffect(() => {
    if (syncStatus !== 'error') return;
    setSyncErrToast(true);
    const t = setTimeout(() => setSyncErrToast(false), 7000);
    return () => clearTimeout(t);
  }, [syncStatus]);

  // Bump settingsUpdatedAt on user-driven setting changes (skip when applying remote)
  useEffect(() => {
    if (!loaded) return;
    if (isApplyingRemoteSettings.current) { isApplyingRemoteSettings.current = false; return; }
    setSettingsUpdatedAt(Date.now());
  }, [theme, lang, viewMode, activeTool, toolSuffixes, history, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pull logic ──────────────────────────────────────────────────────────────
  // force=true bypasses the 30s throttle (for the manual "sync now" button).
  const execPull = async (force = false) => {
    const { user: u, orderUpdatedAt: oAt, settingsUpdatedAt: sAt } = liveRef.current;
    if (!u || isSyncingFromCloud.current) return;
    if (!force && Date.now() - lastCloudPullAt.current < 30_000) return;
    isSyncingFromCloud.current = true;
    setSyncStatus('syncing');
    try {
      const remote = await pullFromCloud(u.uid);
      lastCloudPullAt.current = Date.now();
      if (remote) {
        setCharacters(prev => mergeCharacters(prev, remote.characters, remote.characterOrder, oAt, remote.orderUpdatedAt));
        if ((remote.orderUpdatedAt ?? 0) > oAt) setOrderUpdatedAt(remote.orderUpdatedAt);
        if (remote.settings && (remote.settingsUpdatedAt ?? 0) > sAt) {
          isApplyingRemoteSettings.current = true;
          const s = remote.settings;
          if (s.theme) setTheme(s.theme);
          if (s.lang) setLang(s.lang);
          if (s.viewMode) setViewMode(s.viewMode);
          if (s.activeTool) setActiveTool(s.activeTool);
          if (s.toolSuffixes) setToolSuffixes(s.toolSuffixes);
          if (s.history) setHistory(s.history);
          setSettingsUpdatedAt(remote.settingsUpdatedAt);
        }
      }
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    } finally {
      isSyncingFromCloud.current = false;
    }
  };

  // Pull on login
  useEffect(() => {
    if (!user || !loaded) return;
    execPull();
  }, [user?.uid, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pull on tab/PWA foreground (Page Visibility API), throttled to 30s
  useEffect(() => {
    if (!user || !loaded) return;
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      execPull(); // throttle checked inside execPull
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user?.uid, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Push logic ──────────────────────────────────────────────────────────────
  const execPush = async () => {
    const { user: u, characters: chars, orderUpdatedAt: oAt, settingsUpdatedAt: sAt,
            theme: t, lang: l, viewMode: vm, activeTool: at, toolSuffixes: ts, history: h } = liveRef.current;
    if (!u) return;
    setSyncStatus('syncing');
    const result = await pushToCloud(u.uid, chars, oAt, { theme: t, lang: l, viewMode: vm, activeTool: at, toolSuffixes: ts, history: h }, sAt);
    setSyncStatus(result.ok ? 'synced' : 'error');
    hasPendingPush.current = !result.ok;
    if (!result.ok) setSyncErrCode(result.code ?? '');
    if (!result.ok && result.tooBig) { setDataSizeToast(true); setTimeout(() => setDataSizeToast(false), 6000); }
  };

  // Debounced push on data change (3 s delay)
  useEffect(() => {
    if (!user || !loaded || isSyncingFromCloud.current) return;
    if (cloudPushTimer.current) clearTimeout(cloudPushTimer.current);
    cloudPushTimer.current = setTimeout(async () => {
      if (isSyncingFromCloud.current) return;
      await execPush();
    }, 3000);
  }, [characters, orderUpdatedAt, settingsUpdatedAt, user, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Online recovery: retry failed push when connection is restored
  useEffect(() => {
    if (!user || !loaded) return;
    const handleOnline = () => {
      if (!hasPendingPush.current) return;
      execPush();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user?.uid, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignIn = async () => {
    try { await signInWithGoogle(); }
    catch (e) { if (e.code !== 'auth/popup-closed-by-user') console.error(e); }
  };

  // Exposed for the "sync now" button — bypasses the 30s throttle
  const handleForcePull = () => execPull(true);

  const markRemoteApply = () => { isApplyingRemoteSettings.current = true; };

  return { syncStatus, syncErrToast, setSyncErrToast, syncErrCode, dataSizeToast, handleSignIn, handleForcePull, markRemoteApply };
}
