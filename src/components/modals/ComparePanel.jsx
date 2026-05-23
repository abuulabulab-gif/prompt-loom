import { splitTags, bareTag } from "../../data/constants.js";

function TagDiff({ textA, textB, colorA, colorB }) {
  if (!textA && !textB) return <span className="text-dim text-[10px] font-mono italic">empty / empty</span>;

  const tagsA = splitTags(textA || '');
  const tagsB = splitTags(textB || '');
  const bareSetA = new Set(tagsA.map(t => bareTag(t).toLowerCase()));
  const bareSetB = new Set(tagsB.map(t => bareTag(t).toLowerCase()));

  // Merge into ordered list: A's tags first, then B-only tags
  const onlyBTags = tagsB.filter(t => !bareSetA.has(bareTag(t).toLowerCase()));
  const allSegments = [
    ...tagsA.map(t => ({ tag: t, inA: true, inB: bareSetB.has(bareTag(t).toLowerCase()) })),
    ...onlyBTags.map(t => ({ tag: t, inA: false, inB: true })),
  ];

  return (
    <div className="flex flex-wrap gap-[3px]">
      {allSegments.map((seg, i) => {
        const onlyA = seg.inA && !seg.inB;
        const onlyB = !seg.inA && seg.inB;
        return (
          <span key={i}
            style={onlyA ? { background: colorA + '28', border: `1px solid ${colorA}60`, color: colorA }
                 : onlyB ? { background: colorB + '28', border: `1px solid ${colorB}60`, color: colorB }
                 : undefined}
            className={`text-[10px] font-mono px-[5px] py-[1px] rounded-[4px] ${!onlyA && !onlyB ? 'text-muted border border-transparent' : 'font-semibold'}`}
          >
            {seg.tag}
          </span>
        );
      })}
    </div>
  );
}

export default function ComparePanel({ charA, charB, lang, onClose }) {
  const blocksA = charA.blocks.filter(b => b.id !== 'negative');
  const diffCount = blocksA.filter(bA => {
    const bB = charB.blocks.find(b => b.id === bA.id);
    return bA.text.trim() !== (bB?.text || '').trim();
  }).length;

  return (
    <div className="bg-panel border-b-2 border-linebright px-4 py-[10px]">
      <div className="max-w-[760px] mx-auto">
        <div className="flex items-center gap-[10px] mb-[8px] flex-wrap">
          <span className="text-fg text-[12px] font-bold">🆚 {lang === 'ja' ? '差分プレビュー' : 'Diff Preview'}</span>
          <span style={{ color: charA.color }} className="text-[11px] font-semibold">{charA.emoji} {charA.name}</span>
          <span className="text-dim text-[10px] font-mono">vs</span>
          <span style={{ color: charB.color }} className="text-[11px] font-semibold">{charB.emoji} {charB.name}</span>
          {diffCount > 0 && (
            <span className="text-warn text-[9px] font-mono px-[6px] py-[1px] bg-warn/10 border border-warn/30 rounded-[4px]">
              {diffCount}{lang === 'ja' ? ' ブロック相違' : ' blocks differ'}
            </span>
          )}
          <button onClick={onClose}
            className="ml-auto bg-transparent border border-dim rounded-[5px] px-2 py-[3px] text-muted cursor-pointer text-[11px]">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-[10px] mb-[8px] text-[10px] font-mono flex-wrap">
          <span style={{ color: charA.color }} className="flex items-center gap-[4px]">
            <span style={{ background: charA.color + '28', border: `1px solid ${charA.color}60` }} className="inline-block w-[10px] h-[10px] rounded-[2px]" />
            {charA.name} {lang === 'ja' ? 'のみ' : 'only'}
          </span>
          <span style={{ color: charB.color }} className="flex items-center gap-[4px]">
            <span style={{ background: charB.color + '28', border: `1px solid ${charB.color}60` }} className="inline-block w-[10px] h-[10px] rounded-[2px]" />
            {charB.name} {lang === 'ja' ? 'のみ' : 'only'}
          </span>
          <span className="text-muted">{lang === 'ja' ? '無色 = 共通' : 'no color = shared'}</span>
        </div>

        <div className="max-h-[220px] overflow-y-auto space-y-[4px]">
          {blocksA.map(bA => {
            const bB = charB.blocks.find(b => b.id === bA.id);
            const diff = bA.text.trim() !== (bB?.text || '').trim();
            return (
              <div key={bA.id}
                style={diff ? { background: '#fbbf2406', borderColor: '#fbbf2440' } : undefined}
                className={`px-[8px] py-[6px] rounded-[6px] border ${diff ? 'border-warn/20' : 'border-transparent'}`}
              >
                <div className="flex items-center gap-[5px] mb-[4px]">
                  <span className="text-[12px]">{bA.icon}</span>
                  <span className={`text-[10px] font-mono font-semibold ${diff ? 'text-warn' : 'text-dim'}`}>
                    {lang === 'ja' ? bA.name : bA.nameEn}
                  </span>
                  {diff && <span className="text-warn text-[9px] font-mono ml-auto">≠ diff</span>}
                </div>
                {diff
                  ? <TagDiff textA={bA.text} textB={bB?.text || ''} colorA={charA.color} colorB={charB.color} />
                  : <span className="text-[10px] font-mono text-dim italic">{lang === 'ja' ? '（同一）' : '(identical)'}</span>
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
