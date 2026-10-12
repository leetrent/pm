'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Column, Card } from '@/types/kanban';
import { KanbanCard, DragPayload } from './KanbanCard';
import { Plus, Edit2 } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  activeDrag: DragPayload | null;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onOpenAddCard: (columnId: string, columnTitle: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onDragStartCard: (
    e: React.DragEvent,
    card: Card,
    columnId: string,
    index: number
  ) => void;
  onDragEndCard: () => void;
  onDropOnCard: (
    sourceColId: string,
    sourceIndex: number,
    targetColId: string,
    targetIndex: number
  ) => void;
  onDropOnColumn: (
    sourceColId: string,
    sourceIndex: number,
    targetColId: string
  ) => void;
}

export function KanbanColumn({
  column,
  activeDrag,
  onRenameColumn,
  onOpenAddCard,
  onEditCard,
  onDeleteCard,
  onDragStartCard,
  onDragEndCard,
  onDropOnCard,
  onDropOnColumn,
}: KanbanColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);
  const [isDragOverCol, setIsDragOverCol] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleDraft(column.title);
  }, [column.title]);

  useEffect(() => {
    if (isEditingTitle) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== column.title) {
      onRenameColumn(column.id, trimmed);
    } else {
      setTitleDraft(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleDraft(column.title);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelTitle();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    setIsDragOverCol(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragOverCol(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCol(false);

    let payload: DragPayload | null = activeDrag;
    if (!payload && e.dataTransfer) {
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) payload = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    if (payload && typeof payload.sourceIndex === 'number' && payload.sourceColId) {
      onDropOnColumn(payload.sourceColId, payload.sourceIndex, column.id);
    }
  };

  return (
    <section
      className={`kanban-column ${isDragOverCol ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`column-${column.id}`}
      aria-label={`${column.title} column`}
    >
      <div className="column-header-accent" />
      <header className="column-header">
        {isEditingTitle ? (
          <div className="rename-input-wrap">
            <input
              ref={renameInputRef}
              type="text"
              className="rename-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              data-testid={`rename-input-${column.id}`}
            />
            <button
              type="button"
              className="rename-save-btn"
              onClick={handleSaveTitle}
              data-testid={`rename-save-${column.id}`}
            >
              Save
            </button>
            <button
              type="button"
              className="rename-cancel-btn"
              onClick={handleCancelTitle}
              data-testid={`rename-cancel-${column.id}`}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <div className="column-title-wrap">
              <h2
                className="column-title"
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename column"
                data-testid={`column-title-${column.id}`}
              >
                {column.title}
              </h2>
              <span
                className="column-count-badge"
                data-testid={`column-count-${column.id}`}
              >
                {column.cards.length}
              </span>
            </div>
            <div className="column-header-actions">
              <button
                type="button"
                className="icon-btn rename-btn"
                onClick={() => setIsEditingTitle(true)}
                aria-label={`Rename ${column.title}`}
                data-testid={`rename-column-${column.id}`}
              >
                <Edit2 size={14} />
              </button>
            </div>
          </>
        )}
      </header>

      <div className="card-list" data-testid={`card-list-${column.id}`}>
        {column.cards.length === 0 ? (
          <div className="empty-placeholder">No cards in this column</div>
        ) : (
          column.cards.map((card, index) => (
            <KanbanCard
              key={card.id}
              card={card}
              columnId={column.id}
              index={index}
              activeDrag={activeDrag}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onDragStartCard={onDragStartCard}
              onDragEndCard={onDragEndCard}
              onDropOnCard={onDropOnCard}
            />
          ))
        )}
      </div>

      <footer className="column-footer">
        <button
          type="button"
          className="add-card-btn"
          onClick={() => onOpenAddCard(column.id, column.title)}
          data-testid={`add-card-${column.id}`}
        >
          <Plus size={16} />
          <span>Add Card</span>
        </button>
      </footer>
    </section>
  );
}
