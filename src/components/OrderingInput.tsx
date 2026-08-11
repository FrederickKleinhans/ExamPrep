import { useState } from 'react';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { OrderItem } from '../types';

interface Props {
  orderItems: OrderItem[];
  currentOrder: string[]; // array of item IDs in user's current order
  showResult: boolean;
  onReorder: (newOrder: string[]) => void;
  disabled?: boolean;
}

export function OrderingInput({ orderItems, currentOrder, showResult, onReorder, disabled }: Props) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Get items in current order
  const orderedItems = currentOrder.map(
    (id) => orderItems.find((item) => item.id === id)!
  ).filter(Boolean);

  const correctOrder = [...orderItems]
    .sort((a, b) => a.correctPosition - b.correctPosition)
    .map((item) => item.id);

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    if (disabled) return;
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
    onReorder(newOrder);
  };

  const reorderTo = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    if (toIndex < 0 || toIndex >= currentOrder.length || toIndex === fromIndex) return;

    const newOrder = [...currentOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    onReorder(newOrder);
  };

  const handleDragStart = (index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === index) return;

    reorderTo(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handlePointerDown = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setDraggedIndex(index);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || draggedIndex === null) return;
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const itemEl = target?.closest('[data-order-index]') as HTMLElement | null;
    if (!itemEl) return;

    const hoverIndex = Number(itemEl.dataset.orderIndex);
    if (!Number.isNaN(hoverIndex) && hoverIndex !== draggedIndex) {
      reorderTo(draggedIndex, hoverIndex);
      setDraggedIndex(hoverIndex);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || draggedIndex === null) {
      setDraggedIndex(null);
      return;
    }
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const itemEl = target?.closest('[data-order-index]') as HTMLElement | null;
    if (itemEl) {
      const dropIndex = Number(itemEl.dataset.orderIndex);
      if (!Number.isNaN(dropIndex)) {
        reorderTo(draggedIndex, dropIndex);
      }
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-secondary)] italic mb-3">
        Arrange the items in the correct order. Use the arrows or drag to reorder.
      </p>

      <div className="space-y-1.5" role="list" aria-label="Reorderable list">
        {orderedItems.map((item, index) => {
          const isCorrectPosition = showResult && currentOrder[index] === correctOrder[index];
          const isWrongPosition = showResult && currentOrder[index] !== correctOrder[index];

          let borderClass = 'border-[var(--border)]';
          let bgClass = 'bg-[var(--bg-secondary)]';

          if (showResult) {
            if (isCorrectPosition) {
              borderClass = 'border-[var(--success)]/50';
              bgClass = 'bg-[var(--success)]/5';
            } else if (isWrongPosition) {
              borderClass = 'border-[var(--error)]/50';
              bgClass = 'bg-[var(--error)]/5';
            }
          }

          return (
            <div
              key={item.id}
              data-order-index={index}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onPointerDown={(e) => handlePointerDown(index, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              role="listitem"
              aria-label={`Step ${index + 1}: ${item.text}`}
              style={{ touchAction: disabled ? undefined : 'none' }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all
                ${borderClass} ${bgClass}
                ${!disabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
            >
              {/* Grip handle */}
              <GripVertical
                className={`w-4 h-4 shrink-0 ${disabled ? 'text-[var(--border)]' : 'text-[var(--text-secondary)]'}`}
                aria-hidden="true"
              />

              {/* Position number */}
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${showResult
                  ? isCorrectPosition
                    ? 'bg-[var(--success)]/20 text-[var(--success)]'
                    : 'bg-[var(--error)]/20 text-[var(--error)]'
                  : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                }`}>
                {index + 1}
              </span>

              {/* Item text */}
              <span className="text-base text-[var(--text-primary)] flex-1">{item.text}</span>

              {/* Show correct position when wrong */}
              {showResult && isWrongPosition && (
                <span className="text-xs text-[var(--success)] shrink-0">
                  Should be #{item.correctPosition}
                </span>
              )}

              {/* Arrow buttons (mobile-friendly fallback) */}
              {!disabled && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    aria-label={`Move ${item.text} up`}
                    className="p-1 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-20 disabled:cursor-not-allowed
                      min-w-[28px] min-h-[22px] flex items-center justify-center"
                  >
                    <ArrowUp className="w-3 h-3 text-[var(--text-secondary)]" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === orderedItems.length - 1}
                    aria-label={`Move ${item.text} down`}
                    className="p-1 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-20 disabled:cursor-not-allowed
                      min-w-[28px] min-h-[22px] flex items-center justify-center"
                  >
                    <ArrowDown className="w-3 h-3 text-[var(--text-secondary)]" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show correct order when results are displayed */}
      {showResult && JSON.stringify(currentOrder) !== JSON.stringify(correctOrder) && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--success)]/5 border border-[var(--success)]/20">
          <p className="text-xs font-medium text-[var(--success)] mb-2">Correct order:</p>
          <ol className="space-y-1">
            {correctOrder.map((id, i) => {
              const item = orderItems.find((oi) => oi.id === id)!;
              return (
                <li key={id} className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--success)]">{i + 1}.</span>
                  {item.text}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
