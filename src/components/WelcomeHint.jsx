export default function WelcomeHint({ lang, theme, onSetLang, onSetTheme, onDismiss, onOpenGuide }) {
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
      <div className="bg-surface border border-linebright rounded-[14px] shadow-2xl w-full max-w-[420px] p-6">

        {/* ── Header: title + lang/theme toggles ── */}
        <div className="flex items-start gap-3 mb-5">
          <div className="flex-1 min-w-0">
            <div className="text-[22px] mb-[5px]">🧵</div>
            <div className="text-[15px] font-bold text-fg">
              {L === 'ja' ? 'LOOMへようこそ！' : 'Welcome to LOOM!'}
            </div>
            <div className="text-[11px] text-muted font-mono mt-1">
              {L === 'ja' ? '基本の使い方は3ステップだけです' : 'Get started in just 3 steps'}
            </div>
          </div>

          {/* Lang + Theme toggles */}
          <div className="flex flex-col gap-[6px] flex-shrink-0">
            <div className="flex rounded-[6px] overflow-hidden border border-line text-[10px] font-mono">
              {['ja', 'en'].map(l => (
                <button
                  key={l}
                  onClick={() => onSetLang(l)}
                  className={`px-[10px] py-[5px] cursor-pointer border-none transition-colors duration-100 ${L === l ? 'text-black font-bold' : 'bg-surfalt text-muted'}`}
                  style={L === l ? { background: 'rgb(var(--c-blue))' } : undefined}
                >
                  {l === 'ja' ? '日本語' : 'EN'}
                </button>
              ))}
            </div>
            <div className="flex rounded-[6px] overflow-hidden border border-line text-[10px] font-mono">
              {[{ v: 'dark', icon: '🌙', ja: 'ダーク', en: 'Dark' }, { v: 'light', icon: '☀️', ja: 'ライト', en: 'Light' }].map(({ v, icon, ja, en }) => (
                <button
                  key={v}
                  onClick={() => onSetTheme(v)}
                  className={`px-[9px] py-[5px] cursor-pointer border-none transition-colors duration-100 ${T === v ? 'text-black font-bold' : 'bg-surfalt text-muted'}`}
                  style={T === v ? { background: 'rgb(var(--c-blue))' } : undefined}
                >
                  {icon} {L === 'ja' ? ja : en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3 Steps ── */}
        <div className="flex flex-col gap-[7px] mb-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3 bg-surfalt rounded-[9px] px-4 py-[10px]">
              <span className="text-[16px] flex-shrink-0 mt-[1px]">{s.icon}</span>
              <div>
                <div className="text-[12px] font-bold text-fg flex items-center gap-[6px]">
                  <span className="text-[9px] font-mono text-dim tracking-widest">STEP {i + 1}</span>
                  {L === 'ja' ? s.ja : s.en}
                </div>
                <div className="text-[11px] text-muted font-mono mt-[2px] leading-[1.5]">
                  {L === 'ja' ? s.subJa : s.subEn}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Guide link ── */}
        <button
          onClick={onOpenGuide}
          className="w-full text-[11px] font-mono cursor-pointer rounded-[8px] py-[7px] mb-4 bg-transparent transition-colors duration-100"
          style={{ border: '1px solid rgb(var(--c-blue) / 0.35)', color: 'rgb(var(--c-blue))' }}
          onMouseOver={e => e.currentTarget.style.background = 'rgb(var(--c-blue) / 0.08)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          📖 {L === 'ja' ? '詳しくはガイドを見る →' : 'See the full feature guide →'}
        </button>

        {/* ── Main CTA ── */}
        <button
          onClick={onDismiss}
          className="w-full rounded-[9px] py-[10px] text-[13px] font-bold cursor-pointer border-none text-black"
          style={{ background: 'rgb(var(--c-blue))' }}
        >
          {L === 'ja' ? 'わかった！始める →' : "Got it, let's go →"}
        </button>

        {/* ── Footer ── */}
        <div className="mt-3 text-center text-[10px] text-dim font-mono leading-[1.7]">
          {L === 'ja'
            ? <>⚙️ 設定からいつでも見直せます<br />言語・テーマの変更、このヒントの再表示も設定内で可能</>
            : <>⚙️ All settings available anytime via ⚙️ Settings<br />Language, theme, and this hint can be changed there</>
          }
        </div>
      </div>
    </div>
  );
}
