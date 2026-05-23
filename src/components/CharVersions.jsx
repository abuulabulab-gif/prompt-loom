import { useState } from "react";

export default function CharVersions({ activeChar, lang, onSave, onRestore, onDelete, color }) {
  const [vName, setVName] = useState('');
  const [open, setOpen] = useState(false);
  const versions = activeChar.versions || [];
  const fmtTs = ts => { const d = new Date(ts); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
  return (
    <div className="mb-[9px]">
      <div className="flex items-center gap-2 mb-[4px]">
        <span className="text-muted text-[10px] font-mono">🕐 {lang === 'ja' ? 'バージョン管理' : 'Versions'}</span>
        <span className="text-muted text-[10px] font-mono">{versions.length}/10</span>
        <button onClick={() => setOpen(o => !o)} className="text-dim text-[10px] cursor-pointer border border-dim rounded-[4px] px-[5px] py-[1px]">{open ? '▲' : '▼'}</button>
      </div>
      {open && (
        <>
          <div className="flex gap-[5px] mb-[5px]">
            <input value={vName} onChange={e => setVName(e.target.value)} placeholder={lang === 'ja' ? 'バージョン名...' : 'Version name...'}
              onKeyDown={e => { if (e.key === 'Enter' && vName.trim()) { onSave(vName); setVName(''); } }}
              style={{ border: `1px solid ${color}40` }}
              className="flex-1 bg-bg rounded-[5px] text-[11px] px-[7px] py-[3px] outline-none font-mono text-fg" />
            <button onClick={() => { if (vName.trim()) { onSave(vName); setVName(''); } }}
              style={{ background: color, color: '#000' }} className="rounded-[5px] px-[9px] py-[3px] text-[11px] cursor-pointer font-bold border-none">
              {lang === 'ja' ? '保存' : 'Save'}
            </button>
          </div>
          {versions.length === 0
            ? <span className="text-dim text-[11px] font-mono">{lang === 'ja' ? '（まだバージョンがありません）' : '(no versions saved)'}</span>
            : versions.map(v => (
              <div key={v.id} className="flex items-center gap-[5px] mb-[3px]">
                <span className="text-muted text-[10px] font-mono flex-shrink-0">{fmtTs(v.ts)}</span>
                <span className="text-fg text-[11px] flex-1 truncate">{v.name}</span>
                <button onClick={() => onRestore(v)} style={{ color, borderColor: color + '60' }} className="border rounded-[4px] px-[6px] py-[1px] text-[10px] cursor-pointer bg-transparent font-mono">{lang === 'ja' ? '復元' : 'Restore'}</button>
                <button onClick={() => onDelete(v.id)} className="text-dim text-[10px] cursor-pointer px-1">✕</button>
              </div>
            ))
          }
        </>
      )}
    </div>
  );
}
