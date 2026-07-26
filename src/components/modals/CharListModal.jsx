import { useState, useEffect } from "react";
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function CharRow({ c, isActive, isDraggable, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        borderLeft: `3px solid ${isActive ? c.color : 'transparent'}`,
      }}
      onClick={onSelect}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-[0.4375rem] cursor-pointer mb-[0.1875rem] transition-colors duration-100 ${isActive ? 'bg-surface-alt' : 'hover:bg-surface-alt/50'}`}
    >
      <span
        {...(isDraggable ? { ...attributes, ...listeners } : {})}
        onClick={isDraggable ? e => e.stopPropagation() : undefined}
        className={`text-sm leading-none select-none flex-shrink-0 ${isDraggable ? 'text-dim cursor-grab active:cursor-grabbing' : 'opacity-20 cursor-default'}`}
        style={{ color: isDraggable ? undefined : 'rgb(var(--muted))' }}
      >⠿</span>
      <span style={{ background: c.color }} className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
      <span className="text-sm leading-none pointer-events-none">{c.emoji}</span>
      <span
        className="text-xs font-medium truncate flex-1 pointer-events-none"
        style={{ color: isActive ? c.color : 'rgb(var(--text))' }}
      >{c.name}</span>
      {isActive && <span className="text-[0.7rem] flex-shrink-0" style={{ color: 'rgb(var(--muted))' }}>▶</span>}
    </div>
  );
}

export default function CharListModal({ open, onClose, characters, activeCharId, lang, onSelect, onReorder }) {
  if (!open) return null;
  return <CharListModalInner onClose={onClose} characters={characters} activeCharId={activeCharId} lang={lang} onSelect={onSelect} onReorder={onReorder} />;
}

function CharListModalInner({ onClose, characters, activeCharId, lang, onSelect, onReorder }) {
  const [query, setQuery] = useState('');
  const isFiltering = query.trim().length > 0;

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const visible = characters.filter(c => !c.archived);
  const filtered = isFiltering
    ? visible.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.emoji.includes(query))
    : visible;

  const handleDragEnd = ({ active, over }) => {
    if (isFiltering || !over || active.id === over.id) return;
    const oldIdx = visible.findIndex(c => c.id === active.id);
    const newIdx = visible.findIndex(c => c.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onReorder(arrayMove(visible, oldIdx, newIdx));
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-line rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] w-full max-w-xs flex flex-col max-h-[75vh]">

        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-line flex-shrink-0">
          <span className="text-sm font-bold" style={{ color: 'rgb(var(--fg))' }}>
            {lang === 'ja' ? 'キャラ一覧' : 'Characters'}
          </span>
          <span className="text-xs font-mono" style={{ color: 'rgb(var(--muted))' }}>
            {visible.length} / 30
          </span>
        </div>

        {/* search (shown when 5+ chars) */}
        {visible.length >= 5 && (
          <div className="px-3 py-2 border-b border-line flex-shrink-0">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={lang === 'ja' ? '名前で絞り込み…' : 'Filter by name…'}
              className="w-full bg-transparent border border-dim rounded-md px-2.5 py-1.5 text-xs placeholder:text-dim outline-none"
              style={{ color: 'rgb(var(--fg))' }}
            />
          </div>
        )}

        {/* list */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visible.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="overflow-y-auto flex-1 p-2">
              {filtered.length === 0 ? (
                <div className="text-center text-xs py-6 font-mono" style={{ color: 'rgb(var(--muted))' }}>
                  {lang === 'ja' ? '見つかりません' : 'No results'}
                </div>
              ) : filtered.map(c => (
                <CharRow
                  key={c.id}
                  c={c}
                  isActive={c.id === activeCharId}
                  isDraggable={!isFiltering}
                  onSelect={() => { onSelect(c.id); onClose(); }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* footer hint */}
        {!isFiltering && visible.length > 1 && (
          <div className="flex-shrink-0 px-4 py-2 border-t border-line text-[0.625rem] font-mono" style={{ color: 'rgb(var(--muted))' }}>
            {lang === 'ja' ? '⠿ ドラッグで並べ替え・クリックで切替' : '⠿ drag to reorder · click to switch'}
          </div>
        )}
      </div>
    </div>
  );
}
