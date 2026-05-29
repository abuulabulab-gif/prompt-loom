import { useState, useRef, useEffect } from 'react';

export default function AuthButton({ user, loading, onSignIn, onSignOut, syncStatus, lang, onForcePull }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 8, width: 220 });
  const ref = useRef(null);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const w = Math.min(220, window.innerWidth - 16);
      // ボタンの右端に合わせて右寄せ、画面外にはみ出す場合は押し戻す
      const left = Math.max(8, Math.min(rect.right - w, window.innerWidth - w - 8));
      setDropPos({ top: rect.bottom + 4, left, width: w });
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (loading) return null;

  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className="rounded-md px-[0.5625rem] py-1 cursor-pointer text-[0.625rem] font-mono whitespace-nowrap flex items-center gap-[0.3125rem] border transition-all duration-150"
        style={{ borderColor: 'rgb(var(--c-blue) / 0.45)', color: 'rgb(var(--c-blue))', background: 'rgb(var(--c-blue) / 0.08)' }}
        title={lang === 'ja' ? 'Googleでログイン — デバイス間でデータを自動同期' : 'Sign in with Google — auto-sync data across devices'}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        ☁ {lang === 'ja' ? '同期ログイン' : 'Sync login'}
      </button>
    );
  }

  const initial = user.displayName?.[0]?.toUpperCase() ?? '?';
  const syncLabel =
    syncStatus === 'syncing' ? (lang === 'ja' ? '同期中…' : 'Syncing…') :
    syncStatus === 'synced'  ? (lang === 'ja' ? '同期済み ✓' : 'Synced ✓') :
    syncStatus === 'error'   ? (lang === 'ja' ? '同期エラー' : 'Sync error') :
    (lang === 'ja' ? 'クラウド同期 ON' : 'Cloud sync ON');

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        style={{ borderColor: open ? 'rgb(var(--c-blue) / 0.5)' : '' }}
        className="bg-transparent border border-dim rounded-md px-[0.4375rem] py-1 cursor-pointer text-[0.625rem] font-mono whitespace-nowrap flex items-center gap-[0.3125rem] text-muted"
        title={user.displayName ?? user.email}
      >
        {user.photoURL ? (
          <img src={user.photoURL} className="w-3.5 h-3.5 rounded-full" alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="w-3.5 h-3.5 rounded-full bg-accent text-white flex items-center justify-center text-[0.5rem] font-bold">{initial}</span>
        )}
        <span style={{ color: syncStatus === 'error' ? 'rgb(var(--c-red))' : syncStatus === 'synced' ? 'rgb(var(--c-teal))' : '' }}>
          {syncLabel}
        </span>
      </button>

      {open && (
        <div className="fixed bg-surface border border-line rounded-lg shadow-lg z-[400] overflow-hidden" style={dropPos}>
          <div className="px-3 py-2.5 border-b border-line">
            {user.photoURL && (
              <img src={user.photoURL} className="w-7 h-7 rounded-full mb-1.5" alt="" referrerPolicy="no-referrer" />
            )}
            <div className="text-[0.6875rem] font-semibold text-fg leading-tight">{user.displayName}</div>
            <div className="text-[0.625rem] text-muted mt-0.5">{user.email}</div>
          </div>
          <div className="px-3 py-2 border-b border-line">
            <div className="text-[0.625rem] text-muted font-mono">
              {syncStatus === 'syncing' && <span className="text-accent">↻ {lang === 'ja' ? '同期中…' : 'Syncing…'}</span>}
              {syncStatus === 'synced'  && <span className="text-teal">✓ {lang === 'ja' ? 'クラウドに保存済み' : 'Saved to cloud'}</span>}
              {syncStatus === 'error'   && <span className="text-red">✗ {lang === 'ja' ? '同期に失敗しました' : 'Sync failed'}</span>}
              {!syncStatus              && <span>{lang === 'ja' ? 'クラウド同期 有効' : 'Cloud sync enabled'}</span>}
            </div>
          </div>
          <div className="px-3 py-2 border-b border-line">
            <button
              disabled={syncStatus === 'syncing'}
              onClick={() => { setOpen(false); onForcePull?.(); }}
              className="w-full text-left text-[0.6875rem] font-mono cursor-pointer py-0.5 transition-colors disabled:opacity-40"
              style={{ color: 'rgb(var(--c-blue))' }}
            >
              ↓ {lang === 'ja' ? '今すぐ同期' : 'Sync now'}
            </button>
          </div>
          <div className="px-3 py-2">
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              className="w-full text-left text-[0.6875rem] font-mono text-muted cursor-pointer py-0.5 hover:text-fg transition-colors"
            >
              {lang === 'ja' ? 'ログアウト' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
