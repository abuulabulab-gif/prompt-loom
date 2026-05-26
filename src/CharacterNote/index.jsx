import { useState } from "react";
import ProfileSheet from "./ProfileSheet.jsx";
import PromptLog from "./PromptLog.jsx";
import TagMap from "./TagMap.jsx";

const TABS = [
  { id: 'profile', icon: '📋', ja: '設定シート',    en: 'Profile' },
  { id: 'log',     icon: '🗂', ja: 'プロンプトログ', en: 'Prompt Log' },
  { id: 'tagmap',  icon: '🔗', ja: 'タグ対応表',    en: 'Tag Map' },
];

export default function CharacterNote({ char, lang, activeTool, posText, negText, onUpdateChar, onRestoreBlocks }) {
  const [tab, setTab] = useState('profile');

  return (
    <div className="max-w-[760px] mx-auto px-[14px] py-[13px]">
      {/* Sub-tab bar */}
      <div className="flex gap-[4px] mb-[16px] flex-wrap">
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            style={tab === t.id ? { background: char.color + '22', borderColor: char.color, color: char.color } : undefined}
            className={`rounded-[7px] px-[13px] py-[5px] text-[11px] font-mono cursor-pointer transition-all duration-[120ms] ${tab === t.id ? 'font-bold border' : 'border border-dim text-muted'}`}
          >
            {t.icon} {lang === 'ja' ? t.ja : t.en}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <ProfileSheet char={char} lang={lang} onUpdate={onUpdateChar} />
      )}
      {tab === 'log' && (
        <PromptLog
          char={char} lang={lang} activeTool={activeTool}
          posText={posText} negText={negText}
          onUpdate={onUpdateChar}
          onRestoreBlocks={onRestoreBlocks}
        />
      )}
      {tab === 'tagmap' && (
        <TagMap char={char} lang={lang} onUpdate={onUpdateChar} blocks={char.blocks || []} />
      )}
    </div>
  );
}
