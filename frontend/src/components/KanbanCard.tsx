'use client';

import React, { useState } from 'react';
import { Card } from '@/types/kanban';
import { Edit2, Trash2 } from 'lucide-react';

export interface DragPayload {
  cardId: string;
  sourceColId: string;
  sourceIndex: number;
}

interface KanbanCardProps {
  card: Card;
  columnId: string;
  index: number;
  activeDrag: DragPayload | null;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
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
}

export function KanbanCard({
  card,
  columnId,
  index,
  activeDrag,
  onEdit,
  onDelete,
  onDragStartCard,
  onDragEndCard,
  onDropOnCard,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStartCard(e, card, columnId, index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEndCard();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

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
      onDropOnCard(payload.sourceColId, payload.sourceIndex, columnId, index);
    }
  };

  return (
    <article
      className={`kanban-card ${isDragging ? 'is-dragging' : ''} ${
        isDragOver ? 'drag-over' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`card-${card.id}`}
    >
      <div className="card-top">
        <h3 className="card-title" data-testid={`card-title-${card.id}`}>
          {card.title}
        </h3>
        <div className="card-actions">
          <button
            type="button"
            className="card-action-btn edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            aria-label={`Edit ${card.title}`}
            data-testid={`edit-card-${card.id}`}
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            className="card-action-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            aria-label={`Delete ${card.title}`}
            data-testid={`delete-card-${card.id}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {card.details && (
        <p className="card-details" data-testid={`card-details-${card.id}`}>
          {card.details}
        </p>
      )}
    </article>
  );
}
