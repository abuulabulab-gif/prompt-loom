import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function CharTab({ c, isActive, isMobile, lang, canDelete, charColor, onSelect, onDuplicate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 999 : undefined,
    position: 'relative',
  };

  if (isMobile) {
    return (
      <div
        ref={setNodeRef}
        style={{ ...dragStyle, background: c.color, outline: isActive ? '2px solid white' : '2px solid transparent', outlineOffset: '2px' }}
        className="w-[1.375rem] h-[1.375rem] rounded-full cursor-grab active:cursor-grabbing transition-opacity duration-150 flex-shrink-0"
        title={c.name}
        onClick={onSelect}
        {...attributes}
        {...listeners}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...dragStyle,
        background: isActive ? c.color + '22' : 'rgb(var(--surface-alt))',
        border: `1px solid ${isActive ? c.color + '70' : 'rgb(var(--border))'}`,
      }}
      className="flex items-center gap-1 rounded-[1.25rem] px-[0.5625rem] py-1 cursor-grab active:cursor-grabbing transition-all duration-150 select-none flex-shrink-0"
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <span style={{ background: c.color }} className="w-[0.4375rem] h-[0.4375rem] rounded-full flex-shrink-0 pointer-events-none" />
      <span className="text-xs pointer-events-none">{c.emoji}</span>
      <span style={{ color: isActive ? charColor(c.color) : 'rgb(var(--text))' }} className="text-xs font-semibold whitespace-nowrap pointer-events-none">{c.name}</span>
      <span
        onClick={e => { e.stopPropagation(); onDuplicate(); }}
        title={lang === 'ja' ? '複製' : 'Dup'}
        className="text-dim text-[0.625rem] cursor-pointer px-px leading-none"
        onMouseOver={e => e.currentTarget.style.color = charColor(c.color)}
        onMouseOut={e => e.currentTarget.style.color = 'rgb(var(--dim))'}
      >⊕</span>
      {canDelete && (
        <span
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="text-dim text-[0.625rem] cursor-pointer px-px leading-none"
          onMouseOver={e => e.currentTarget.style.color = '#f87171'}
          onMouseOut={e => e.currentTarget.style.color = 'rgb(var(--dim))'}
        >✕</span>
      )}
    </div>
  );
}
