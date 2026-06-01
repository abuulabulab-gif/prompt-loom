export default function SupportModal({ lang, isMobile, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-5"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-linebright rounded-[0.875rem] w-full max-w-[24rem] flex flex-col overflow-hidden">
        {/* header */}
        <div className="px-[1.125rem] py-3.5 border-b border-line flex items-center justify-between">
          <span className="text-fg text-sm font-bold">
            ☕ {lang === 'ja' ? '開発を支援する' : 'Support Development'}
          </span>
          <button
            onClick={onClose}
            className="bg-transparent border border-dim rounded-md px-2.5 py-1 text-muted cursor-pointer text-xs"
          >
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        {/* body */}
        <div className="p-[1.125rem] flex flex-col gap-4">
          {/* thank-you message */}
          <p className="text-fg text-[0.8125rem] leading-relaxed">
            {lang === 'ja'
              ? 'LOOMを使ってくれてありがとうございます！プロンプト制作の時間が少しでも楽しくなっていたら嬉しいです。開発・サーバー維持の支援をいただけると、次のアップデートへの大きな励みになります ☕'
              : 'Thank you for using LOOM! If it\'s been making your prompt-crafting sessions even a little more fun, your support means the world and helps keep the studio running ☕'}
          </p>

          {/* QR code — PC only */}
          {!isMobile && (
            <div className="flex flex-col items-center gap-2 rounded-[0.625rem] p-4 border border-line" style={{ background: 'rgb(var(--surface-alt))' }}>
              <img
                src="/qr-code.png"
                alt="Buy Me a Coffee QR code"
                className="w-32 h-32 rounded-[0.375rem]"
              />
              <p className="text-muted text-[0.6875rem] text-center">
                {lang === 'ja'
                  ? 'スマホのカメラでスキャンして支援できます'
                  : 'Scan with your phone camera to support'}
              </p>
            </div>
          )}

          {/* Buy Me a Coffee button */}
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-muted text-[0.6875rem] text-center">
              {lang === 'ja'
                ? 'ブラウザからそのままご支援いただけます。キャラクター一人分の愛情をコーヒーに込めて ☕'
                : 'Or support directly from your browser — one coffee per character created ☕'}
            </p>
            <a
              href="https://www.buymeacoffee.com/prompt_loom"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=prompt_loom&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff"
                alt={lang === 'ja' ? '気に入ったらコーヒーを一杯どうぞ' : 'Buy me a coffee'}
                style={{ height: '2.5rem', borderRadius: '0.375rem' }}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
