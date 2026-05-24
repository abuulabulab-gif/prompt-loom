export default function WelcomeHint({ lang, onDismiss }) {
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
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => e.target === e.currentTarget && onDismiss()}
    >
      <div className="bg-surface border border-linebright rounded-[14px] shadow-2xl w-full max-w-[400px] p-6">
        <div className="text-center mb-5">
          <div className="text-[24px] mb-[6px]">🧵</div>
          <div className="text-[16px] font-bold text-fg">
            {lang === 'ja' ? 'LOOMへようこそ！' : 'Welcome to LOOM!'}
          </div>
          <div className="text-[11px] text-muted font-mono mt-1">
            {lang === 'ja' ? '基本の使い方は3ステップだけです' : 'Get started in just 3 steps'}
          </div>
        </div>

        <div className="flex flex-col gap-[8px] mb-5">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3 bg-surfalt rounded-[9px] px-4 py-3">
              <span className="text-[18px] flex-shrink-0 mt-[1px]">{s.icon}</span>
              <div>
                <div className="text-[12px] font-bold text-fg flex items-center gap-2">
                  <span className="text-[9px] font-mono text-muted tracking-widest">STEP {i + 1}</span>
                  {lang === 'ja' ? s.ja : s.en}
                </div>
                <div className="text-[11px] text-muted font-mono mt-[3px] leading-[1.5]">
                  {lang === 'ja' ? s.subJa : s.subEn}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onDismiss}
          className="w-full rounded-[9px] py-[10px] text-[13px] font-bold cursor-pointer border-none text-black"
          style={{ background: 'rgb(var(--c-blue))' }}
        >
          {lang === 'ja' ? 'わかった！始める →' : "Got it, let's go →"}
        </button>

        <div className="text-center mt-[8px]">
          <span className="text-[10px] text-dim font-mono">
            {lang === 'ja' ? '次回からは表示されません' : "Won't show again"}
          </span>
        </div>
      </div>
    </div>
  );
}
