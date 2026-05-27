const DONATE_URL = 'https://buymeacoffee.com/prompt_loom';
const X_URL = 'https://x.com/prompt_loom';

export default function WelcomeHint({ lang, theme, onSetLang, onSetTheme, onDismiss, onOpenGuide, onOpenSettings }) {
  const L = lang;
  const T = theme;

  const steps = [
    {
      icon: '🏷',
      ja: 'タグをクリック',
      en: 'Click a tag',
      subJa: 'ブロック内のタグを押すと選択されてプロンプトに追加されます',
      subEn: 'Press any tag inside a block to add it to your prompt',
    },
    {
      icon: '📝',
      ja: '出力エリアで確認',
      en: 'Check the output',
      subJa: '画面下部（またはサイドバー）にプロンプトがリアルタイムで生成されます',
      subEn: 'The generated prompt appears in the output bar at the bottom in real time',
    },
    {
      icon: '📋',
      ja: 'コピーして使う',
      en: 'Copy & paste',
      subJa: 'コピーボタンを押してお好みのAIツールに貼り付けるだけ',
      subEn: 'Hit Copy and paste into MJ, NAI, SD, or any AI tool you use',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      onClick={e => e.target === e.currentTarget && onDismiss()}
    >
      <div className="bg-surface border border-linebright rounded-[0.875rem] shadow-2xl w-full max-w-[26.25rem] overflow-y-auto max-h-[90vh]">
        <div className="p-6">

          {/* ── Header: title + lang/theme toggles ── */}
          <div className="flex items-start gap-3 mb-5">
            <div className="flex-1 min-w-0">
              <div className="text-[1.375rem] mb-[0.3125rem]">🧵</div>
              <div className="text-[0.9375rem] font-bold text-fg">
                {L === 'ja' ? 'LOOMへようこそ！' : 'Welcome to LOOM!'}
              </div>
              <div className="text-[0.6875rem] text-muted font-mono mt-1">
                {L === 'ja' ? '基本の使い方は3ステップだけです' : 'Get started in just 3 steps'}
              </div>
            </div>

            {/* Lang + Theme toggles */}
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <div className="flex rounded-md border border-line text-[0.625rem] font-mono overflow-hidden">
                {[{ v: 'ja', label: '日本語' }, { v: 'en', label: 'English' }].map(({ v, label }, i) => (
                  <button
                    key={v}
                    onClick={() => onSetLang(v)}
                    className={`flex-1 px-2.5 py-[0.3125rem] cursor-pointer transition-colors duration-100 ${L === v ? 'text-white font-bold' : 'bg-surfalt text-muted'} ${i === 0 ? '' : 'border-l border-line'}`}
                    style={L === v ? { background: 'rgb(var(--c-blue))' } : undefined}
                  >{label}</button>
                ))}
              </div>
              <div className="flex rounded-md border border-line text-[0.625rem] font-mono overflow-hidden">
                {[{ v: 'light', icon: '☀️', ja: 'ライト', en: 'Light' }, { v: 'dark', icon: '🌙', ja: 'ダーク', en: 'Dark' }].map(({ v, icon, ja, en }, i) => (
                  <button
                    key={v}
                    onClick={() => onSetTheme(v)}
                    className={`flex-1 px-[0.5625rem] py-[0.3125rem] cursor-pointer transition-colors duration-100 ${T === v ? 'text-white font-bold' : 'bg-surfalt text-muted'} ${i === 0 ? '' : 'border-l border-line'}`}
                    style={T === v ? { background: 'rgb(var(--c-blue))' } : undefined}
                  >{icon} {L === 'ja' ? ja : en}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── 3 Steps ── */}
          <div className="flex flex-col gap-[0.4375rem] mb-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3 bg-surfalt rounded-[0.5625rem] px-4 py-2.5">
                <span className="text-base flex-shrink-0 mt-[0.0625rem]">{s.icon}</span>
                <div>
                  <div className="text-xs font-bold text-fg flex items-center gap-1.5">
                    <span className="text-[0.5625rem] font-mono text-dim tracking-widest">STEP {i + 1}</span>
                    {L === 'ja' ? s.ja : s.en}
                  </div>
                  <div className="text-[0.6875rem] text-muted font-mono mt-0.5 leading-[1.5]">
                    {L === 'ja' ? s.subJa : s.subEn}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Info chips: local / cloud / AI ── */}
          <div className="grid grid-cols-3 gap-[0.3125rem] mb-4">
            {/* Local save */}
            <div className="flex flex-col items-center gap-[0.1875rem] bg-surfalt rounded-lg px-2 py-[0.5625rem] text-center">
              <span className="text-sm">🔒</span>
              <span className="text-[0.625rem] font-bold text-fg leading-tight">
                {L === 'ja' ? 'ローカル保存' : 'Local-first'}
              </span>
              <span className="text-[0.5625rem] text-muted font-mono leading-tight">
                {L === 'ja' ? 'ブラウザに自動保存。外部送信なし' : 'Auto-saved in browser. Nothing sent externally'}
              </span>
            </div>

            {/* Cloud sync */}
            <div className="flex flex-col items-center gap-[0.1875rem] bg-surfalt rounded-lg px-2 py-[0.5625rem] text-center">
              <span className="text-sm">☁️</span>
              <span className="text-[0.625rem] font-bold text-fg leading-tight">
                {L === 'ja' ? 'クラウド同期' : 'Cloud sync'}
              </span>
              <span className="text-[0.5625rem] text-muted font-mono leading-tight">
                {L === 'ja' ? 'Googleログインで\nPC↔スマホ共有' : 'Sign in to sync\nacross devices'}
              </span>
            </div>

            {/* AI features — clickable, opens Settings → API tab */}
            <button
              onClick={onOpenSettings}
              className="flex flex-col items-center gap-[0.1875rem] rounded-lg px-2 py-[0.5625rem] text-center cursor-pointer transition-all duration-150 border"
              style={{ background: 'rgb(var(--c-blue) / 0.06)', borderColor: 'rgb(var(--c-blue) / 0.28)' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgb(var(--c-blue) / 0.13)'; e.currentTarget.style.borderColor = 'rgb(var(--c-blue) / 0.55)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgb(var(--c-blue) / 0.06)'; e.currentTarget.style.borderColor = 'rgb(var(--c-blue) / 0.28)'; }}
            >
              <span className="text-sm">🤖</span>
              <span className="text-[0.625rem] font-bold leading-tight" style={{ color: 'rgb(var(--c-blue))' }}>
                {L === 'ja' ? 'AI機能' : 'AI features'}
              </span>
              <span className="text-[0.5625rem] font-mono leading-tight" style={{ color: 'rgb(var(--c-blue) / 0.7)' }}>
                {L === 'ja' ? '⚙️設定でAPIキーを登録→解放' : 'Add API key in\n⚙️ Settings to unlock'}
              </span>
            </button>
          </div>

          {/* ── In-app browser warning ── */}
          <div
            className="flex items-start gap-2 rounded-lg px-2.5 py-2 mb-4 text-[0.625rem] font-mono leading-[1.6]"
            style={{ background: 'rgb(var(--c-warn) / 0.06)', border: '1px solid rgb(var(--c-warn) / 0.25)' }}
          >
            <span className="flex-shrink-0 mt-[0.0625rem]">⚠️</span>
            <span className="text-muted">
              {L === 'ja'
                ? '※LINEやX（Twitter）などのアプリ内ブラウザからアクセスした場合、Googleのセキュリティ制限（エラー 403: disallowed_useragent）によりログイン・同期ができないことがあります。その場合は、右上のメニュー等から「Safari」や「Google Chrome」などの標準ブラウザに切り替えて（開き直して）ご利用ください。'
                : '※If you access via in-app browsers such as LINE or X (Twitter), login/sync may fail due to Google\'s security restrictions (Error 403: disallowed_useragent). In that case, please open the link in a standard browser like Safari or Google Chrome.'}
            </span>
          </div>

          {/* ── API key note ── */}
          <div
            className="flex items-start gap-2 rounded-lg px-2.5 py-2 mb-4 text-[0.625rem] font-mono leading-[1.6]"
            style={{ background: 'rgb(var(--c-blue) / 0.06)', border: '1px solid rgb(var(--c-blue) / 0.18)' }}
          >
            <span className="flex-shrink-0 mt-[0.0625rem]">💡</span>
            <span className="text-muted">
              {L === 'ja'
                ? <>Claude / OpenAI の APIキーを<button onClick={onOpenSettings} className="underline cursor-pointer font-bold" style={{ color: 'rgb(var(--c-blue))' }}>⚙️ 設定 → 🤖 API</button>から登録すると、自然文の整形・タグ提案・画像解析などのAI機能が使えるようになります。</>
                : <>Register your Claude / OpenAI API key in <button onClick={onOpenSettings} className="underline cursor-pointer font-bold" style={{ color: 'rgb(var(--c-blue))' }}>⚙️ Settings → 🤖 API</button> to unlock AI polish, tag suggestions, and image-to-tags.</>
              }
            </span>
          </div>

          {/* ── Guide link ── */}
          <button
            onClick={onOpenGuide}
            className="w-full text-[0.6875rem] font-mono cursor-pointer rounded-lg py-[0.4375rem] mb-3 bg-transparent transition-colors duration-100"
            style={{ border: '1px solid rgb(var(--c-blue) / 0.35)', color: 'rgb(var(--c-blue))' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgb(var(--c-blue) / 0.08)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            📖 {L === 'ja' ? '詳しくはガイドを見る →' : 'See the full feature guide →'}
          </button>

          {/* ── Main CTA ── */}
          <button
            onClick={onDismiss}
            className="w-full rounded-[0.5625rem] py-2.5 text-[0.8125rem] font-bold cursor-pointer border-none text-white"
            style={{ background: 'rgb(var(--c-blue))' }}
          >
            {L === 'ja' ? 'わかった！始める →' : "Got it, let's go →"}
          </button>

          {/* ── Footer: support + feedback + settings reminder ── */}
          <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid rgb(var(--border) / 0.4)' }}>
            {/* Support */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.5625rem] text-dim font-mono leading-tight">
                {L === 'ja' ? '☕ 気に入っていただけたら、開発を応援いただけると励みになります！' : '☕ Enjoying LOOM? Supporting keeps development going!'}
              </span>
              <a
                href={DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.5625rem] font-mono font-bold flex-shrink-0 rounded px-[0.4375rem] py-[0.1875rem] no-underline whitespace-nowrap transition-colors"
                style={{ color: 'rgb(var(--c-warn))', background: 'rgb(var(--c-warn) / 0.1)', border: '1px solid rgb(var(--c-warn) / 0.3)' }}
              >
                Buy Me a Coffee ☕
              </a>
            </div>

            {/* Feedback */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.5625rem] text-dim font-mono leading-tight">
                {L === 'ja' ? '💬 不具合のご報告・機能のご要望は随時受付中です' : '💬 Bug reports & feature requests are always welcome'}
              </span>
              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.5625rem] font-mono font-bold flex-shrink-0 rounded px-[0.4375rem] py-[0.1875rem] no-underline whitespace-nowrap transition-colors"
                style={{ color: 'rgb(var(--c-blue))', background: 'rgb(var(--c-blue) / 0.08)', border: '1px solid rgb(var(--c-blue) / 0.3)' }}
              >
                @prompt_loom
              </a>
            </div>

            {/* Settings reminder */}
            <div className="text-center text-[0.5625rem] text-dim font-mono pt-0.5">
              {L === 'ja'
                ? '⚙️ 設定からいつでも言語・テーマ・APIキーの変更や、このヒントの再表示ができます'
                : '⚙️ Language, theme, API key & this hint can be changed anytime in Settings'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
