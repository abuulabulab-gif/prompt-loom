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
  const [dataSizeToast, setDataSizeToast] = useState(false);
  const cloudPushTimer = useRef(null);
  const isSyncingFromCloud = useRef(false);
  const lastCloudPullAt = useRef(0);
  const isApplyingRemoteSettings = useRef(false);

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

  // Pull on login
  useEffect(() => {
    if (!user || !loaded) return;
    (async () => {
      isSyncingFromCloud.current = true;
      setSyncStatus('syncing');
      try {
        const remote = await pullFromCloud(user.uid);
        if (remote) {
          setCharacters(prev => mergeCharacters(prev, remote.characters, remote.characterOrder, orderUpdatedAt, remote.orderUpdatedAt));
          if ((remote.orderUpdatedAt ?? 0) > orderUpdatedAt) setOrderUpdatedAt(remote.orderUpdatedAt);
          if (remote.settings && (remote.settingsUpdatedAt ?? 0) > settingsUpdatedAt) {
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
        lastCloudPullAt.current = Date.now();
      }
    })();
  }, [user?.uid, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pull on tab/PWA foreground (Page Visibility API), throttled to 30s
  useEffect(() => {
    if (!user || !loaded) return;
    const handleVisibility = async () => {
      if (document.visibilityState !== 'visible') return;
      if (isSyncingFromCloud.current) return;
      if (Date.now() - lastCloudPullAt.current < 30_000) return;
      isSyncingFromCloud.current = true;
      lastCloudPullAt.current = Date.now();
      setSyncStatus('syncing');
      try {
        const remote = await pullFromCloud(user.uid);
        if (remote) {
          setCharacters(prev => mergeCharacters(prev, remote.characters, remote.characterOrder, orderUpdatedAt, remote.orderUpdatedAt));
          if ((remote.orderUpdatedAt ?? 0) > orderUpdatedAt) setOrderUpdatedAt(remote.orderUpdatedAt);
          if (remote.settings && (remote.settingsUpdatedAt ?? 0) > settingsUpdatedAt) {
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
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user?.uid, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced push on data change (3 s delay)
  useEffect(() => {
    if (!user || !loaded || isSyncingFromCloud.current) return;
    if (cloudPushTimer.current) clearTimeout(cloudPushTimer.current);
    cloudPushTimer.current = setTimeout(async () => {
      if (!user) return;
      setSyncStatus('syncing');
      const result = await pushToCloud(
        user.uid, characters, orderUpdatedAt,
        { theme, lang, viewMode, activeTool, toolSuffixes, history },
        settingsUpdatedAt,
      );
      setSyncStatus(result.ok ? 'synced' : 'error');
      if (!result.ok && result.tooBig) { setDataSizeToast(true); setTimeout(() => setDataSizeToast(false), 6000); }
    }, 3000);
  }, [characters, orderUpdatedAt, settingsUpdatedAt, user, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignIn = async () => {
    try { await signInWithGoogle(); }
    catch (e) { if (e.code !== 'auth/popup-closed-by-user') console.error(e); }
  };

  const markRemoteApply = () => { isApplyingRemoteSettings.current = true; };

  return { syncStatus, syncErrToast, setSyncErrToast, dataSizeToast, handleSignIn, markRemoteApply };
}
