import { splitTags, bareTag } from "../../data/constants.js";

function TagDiff({ textA, textB, colorA, colorB }) {
  if (!textA && !textB) return <span className="text-dim text-[0.625rem] font-mono italic">empty / empty</span>;

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
    <div className="flex flex-wrap gap-[0.1875rem]">
      {allSegments.map((seg, i) => {
        const onlyA = seg.inA && !seg.inB;
        const onlyB = !seg.inA && seg.inB;
        return (
          <span key={i}
            style={onlyA ? { background: colorA + '28', border: `1px solid ${colorA}60`, color: colorA }
                 : onlyB ? { background: colorB + '28', border: `1px solid ${colorB}60`, color: colorB }
                 : undefined}
            className={`text-[0.625rem] font-mono px-[0.3125rem] py-[0.0625rem] rounded ${!onlyA && !onlyB ? 'text-muted border border-transparent' : 'font-semibold'}`}
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
    <div className="bg-panel border-b-2 border-linebright px-4 py-2.5">
      <div className="max-w-[47.5rem] mx-auto">
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <span className="text-fg text-xs font-bold">🆚 {lang === 'ja' ? '差分プレビュー' : 'Diff Preview'}</span>
          <span style={{ color: charA.color }} className="text-[0.6875rem] font-semibold">{charA.emoji} {charA.name}</span>
          <span className="text-dim text-[0.625rem] font-mono">vs</span>
          <span style={{ color: charB.color }} className="text-[0.6875rem] font-semibold">{charB.emoji} {charB.name}</span>
          {diffCount > 0 && (
            <span className="text-warn text-[0.5625rem] font-mono px-1.5 py-[0.0625rem] bg-warn/10 border border-warn/30 rounded">
              {diffCount}{lang === 'ja' ? ' ブロック相違' : ' blocks differ'}
            </span>
          )}
          <button onClick={onClose}
            className="ml-auto bg-transparent border border-dim rounded-[0.3125rem] px-2 py-[0.1875rem] text-muted cursor-pointer text-[0.6875rem]">
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-2.5 mb-2 text-[0.625rem] font-mono flex-wrap">
          <span style={{ color: charA.color }} className="flex items-center gap-1">
            <span style={{ background: charA.color + '28', border: `1px solid ${charA.color}60` }} className="inline-block w-2.5 h-2.5 rounded-sm" />
            {charA.name} {lang === 'ja' ? 'のみ' : 'only'}
          </span>
          <span style={{ color: charB.color }} className="flex items-center gap-1">
            <span style={{ background: charB.color + '28', border: `1px solid ${charB.color}60` }} className="inline-block w-2.5 h-2.5 rounded-sm" />
            {charB.name} {lang === 'ja' ? 'のみ' : 'only'}
          </span>
          <span className="text-muted">{lang === 'ja' ? '無色 = 共通' : 'no color = shared'}</span>
        </div>

        <div className="max-h-[13.75rem] overflow-y-auto space-y-1">
          {blocksA.map(bA => {
            const bB = charB.blocks.find(b => b.id === bA.id);
            const diff = bA.text.trim() !== (bB?.text || '').trim();
            return (
              <div key={bA.id}
                style={diff ? { background: '#fbbf2406', borderColor: '#fbbf2440' } : undefined}
                className={`px-2 py-1.5 rounded-md border ${diff ? 'border-warn/20' : 'border-transparent'}`}
              >
                <div className="flex items-center gap-[0.3125rem] mb-1">
                  <span className="text-xs">{bA.icon}</span>
                  <span className={`text-[0.625rem] font-mono font-semibold ${diff ? 'text-warn' : 'text-dim'}`}>
                    {lang === 'ja' ? bA.name : bA.nameEn}
                  </span>
                  {diff && <span className="text-warn text-[0.5625rem] font-mono ml-auto">≠ diff</span>}
                </div>
                {diff
                  ? <TagDiff textA={bA.text} textB={bB?.text || ''} colorA={charA.color} colorB={charB.color} />
                  : <span className="text-[0.625rem] font-mono text-dim italic">{lang === 'ja' ? '（同一）' : '(identical)'}</span>
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
