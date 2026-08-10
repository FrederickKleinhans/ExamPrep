import { useState } from 'react';
import { DragCategory, DragItem } from '../types';

interface Props {
  categories: DragCategory[];
  items: DragItem[];
  assignments: Record<string, string>; // itemId -> categoryId
  showResult: boolean;
  onAssign: (itemId: string, categoryId: string) => void;
  disabled?: boolean;
}

export function MatchingInput({ categories, items, assignments, showResult, onAssign, disabled }: Props) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Build correct mapping: itemId -> categoryId
  const correctMapping: Record<string, string> = {};
  for (const cat of categories) {
    for (const itemId of cat.acceptsItemIds) {
      correctMapping[itemId] = cat.id;
    }
  }

  // Items not yet assigned
  const unassignedItems = items.filter((item) => !assignments[item.id]);

  // Items assigned to each category
  const getCategoryItems = (categoryId: string) =>
    items.filter((item) => assignments[item.id] === categoryId);

  const handleDragStart = (itemId: string) => {
    if (disabled) return;
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (categoryId: string) => {
    if (disabled || !draggedItem) return;
    onAssign(draggedItem, categoryId);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Pointer-based touch support for mobile/tablets
  const handlePointerDown = (e: React.PointerEvent, itemId: string) => {
    if (disabled) return;
    e.preventDefault();
    setDraggedItem(itemId);

    const onPointerMove = (_pe: PointerEvent) => {
      // could add visual follow logic here in future
    };

    const onPointerUp = (pe: PointerEvent) => {
      try {
        const el = document.elementFromPoint(pe.clientX, pe.clientY);
        if (el) {
          const dropEl = (el as HTMLElement).closest('[data-category-id]') as HTMLElement | null;
          if (dropEl) {
            const catId = dropEl.getAttribute('data-category-id');
            if (catId) onAssign(itemId, catId);
          }
        }
      } catch (err) {
        // ignore
      }
      setDraggedItem(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Fallback: select-based assignment for mobile
  const handleSelectAssign = (itemId: string, categoryId: string) => {
    if (disabled) return;
    onAssign(itemId, categoryId);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)] italic">
        Drag each item to the correct category, or use the dropdown to assign.
      </p>

      {/* Unassigned items pool */}
      {unassignedItems.length > 0 && (
        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium mb-2">
            Items to assign
          </p>
          <div className="flex flex-wrap gap-2">
            {unassignedItems.map((item) => (
              <div
                key={item.id}
                draggable={!disabled}
                onDragStart={() => handleDragStart(item.id)}
                onDragEnd={handleDragEnd}
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                className={`px-3 py-2 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5
                  text-sm text-[var(--text-primary)] cursor-grab active:cursor-grabbing
                  hover:border-[var(--warning)] transition-colors
                  ${draggedItem === item.id ? 'opacity-50 scale-95' : ''}`}
              >
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories (drop zones) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categories.map((category) => {
          const catItems = getCategoryItems(category.id);
          const isOver = draggedItem !== null;

          return (
            <div
              key={category.id}
              data-category-id={category.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(category.id)}
              className={`p-3 rounded-xl border-2 border-dashed transition-colors min-h-[80px]
                ${isOver && !disabled ? 'border-[var(--warning)]/50 bg-[var(--warning)]/5' : 'border-[var(--border)] bg-[var(--bg-secondary)]'}`}
            >
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{category.name}</p>
              <div className="space-y-1.5">
                {catItems.map((item) => {
                  const isCorrect = correctMapping[item.id] === category.id;
                  let itemClass = 'border-[var(--warning)]/30 bg-[var(--warning)]/10';
                  if (showResult) {
                    itemClass = isCorrect
                      ? 'border-[var(--success)]/50 bg-[var(--success)]/10'
                      : 'border-[var(--error)]/50 bg-[var(--error)]/10';
                  }

                  return (
                    <div
                      key={item.id}
                      draggable={!disabled}
                      onDragStart={() => handleDragStart(item.id)}
                      onDragEnd={handleDragEnd}
                      onPointerDown={(e) => handlePointerDown(e, item.id)}
                      className={`px-3 py-1.5 rounded-lg border text-sm text-[var(--text-primary)] flex items-center justify-between
                        ${disabled ? 'cursor-default' : 'cursor-grab'} ${itemClass}`}
                    >
                      <span>{item.text}</span>
                      {showResult && !isCorrect && (
                        <span className="text-xs text-[var(--error)]">✗</span>
                      )}
                      {showResult && isCorrect && (
                        <span className="text-xs text-[var(--success)]">✓</span>
                      )}
                    </div>
                  );
                })}
                {catItems.length === 0 && (
                  <p className="text-xs text-[var(--text-secondary)] italic">Drop items here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile fallback: dropdown assignment for unassigned items */}
      {!disabled && unassignedItems.length > 0 && (
        <div className="md:hidden space-y-2 pt-2 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-secondary)]">Or assign using dropdowns:</p>
          {unassignedItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-primary)] flex-1">{item.text}</span>
              <select
                onChange={(e) => e.target.value && handleSelectAssign(item.id, e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] min-h-[36px]"
                defaultValue=""
              >
                <option value="">Select...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Show correct answers when wrong */}
      {showResult && (
        <div className="p-3 rounded-xl bg-[var(--success)]/5 border border-[var(--success)]/20">
          <p className="text-xs font-medium text-[var(--success)] mb-2">Correct assignments:</p>
          <div className="space-y-1">
            {categories.map((cat) => (
              <div key={cat.id}>
                <span className="text-xs font-medium text-[var(--text-primary)]">{cat.name}: </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {cat.acceptsItemIds.map((id) => items.find((i) => i.id === id)?.text).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
