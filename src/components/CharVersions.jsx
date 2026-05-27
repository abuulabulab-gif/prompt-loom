import { useState } from "react";

export default function CharVersions({ activeChar, lang, onSave, onRestore, onDelete, color }) {
  const [vName, setVName] = useState('');
  const [open, setOpen] = useState(false);
  const versions = activeChar.versions || [];
  const fmtTs = ts => { const d = new Date(ts); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
  return (
    <div className="mb-[0.5625rem]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-muted text-[0.625rem] font-mono">🕐 {lang === 'ja' ? 'バージョン管理' : 'Versions'}</span>
        <span className="text-muted text-[0.625rem] font-mono">{versions.length}/10</span>
        <button onClick={() => setOpen(o => !o)} className="text-muted text-[0.625rem] cursor-pointer border border-dim rounded px-[0.3125rem] py-[0.0625rem]">{open ? '▲' : '▼'}</button>
      </div>
      {open && (
        <>
          <div className="flex gap-[0.3125rem] mb-[0.3125rem]">
            <input value={vName} onChange={e => setVName(e.target.value)} placeholder={lang === 'ja' ? 'バージョン名...' : 'Version name...'}
              onKeyDown={e => { if (e.key === 'Enter' && vName.trim()) { onSave(vName); setVName(''); } }}
              style={{ border: `1px solid ${color}40` }}
              className="flex-1 bg-bg rounded-[0.3125rem] text-[0.6875rem] px-[0.4375rem] py-[0.1875rem] outline-none font-mono text-fg" />
            <button onClick={() => { if (vName.trim()) { onSave(vName); setVName(''); } }}
              style={{ background: color, color: '#000' }} className="rounded-[0.3125rem] px-[0.5625rem] py-[0.1875rem] text-[0.6875rem] cursor-pointer font-bold border-none">
              {lang === 'ja' ? '保存' : 'Save'}
            </button>
          </div>
          {versions.length === 0
            ? <span className="text-muted text-[0.6875rem] font-mono">{lang === 'ja' ? '（まだバージョンがありません）' : '(no versions saved)'}</span>
            : versions.map(v => (
              <div key={v.id} className="flex items-center gap-[0.3125rem] mb-[0.1875rem]">
                <span className="text-muted text-[0.625rem] font-mono flex-shrink-0">{fmtTs(v.ts)}</span>
                <span className="text-fg text-[0.6875rem] flex-1 truncate">{v.name}</span>
                <button onClick={() => onRestore(v)} style={{ color, borderColor: color + '60' }} className="border rounded px-1.5 py-[0.0625rem] text-[0.625rem] cursor-pointer bg-transparent font-mono">{lang === 'ja' ? '復元' : 'Restore'}</button>
                <button onClick={() => onDelete(v.id)} className="text-muted text-[0.625rem] cursor-pointer px-1">✕</button>
              </div>
            ))
          }
        </>
      )}
    </div>
  );
}
