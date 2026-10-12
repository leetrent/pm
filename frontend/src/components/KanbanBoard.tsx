'use client';

import React, { useState } from 'react';
import {
  createInitialBoard,
  renameColumn,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
} from '@/lib/kanban';
import { BoardState, Card } from '@/types/kanban';
import { Header } from './Header';
import { KanbanColumn } from './KanbanColumn';
import { CardModal } from './CardModal';
import { DragPayload } from './KanbanCard';

interface ModalState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  targetColId?: string;
  targetColTitle?: string;
  card?: Card;
}

export function KanbanBoard() {
  const [board, setBoard] = useState<BoardState>(() => createInitialBoard());
  const [activeDrag, setActiveDrag] = useState<DragPayload | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'add',
  });

  const totalCards = board.columns.reduce(
    (sum, col) => sum + col.cards.length,
    0
  );

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    setBoard((prev) => renameColumn(prev, columnId, newTitle));
  };

  const handleOpenAddCard = (columnId: string, columnTitle: string) => {
    setModalState({
      isOpen: true,
      mode: 'add',
      targetColId: columnId,
      targetColTitle: columnTitle,
    });
  };

  const handleEditCard = (card: Card) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      card,
    });
  };

  const handleDeleteCard = (cardId: string) => {
    setBoard((prev) => deleteCard(prev, cardId));
  };

  const handleSaveModal = (title: string, details: string) => {
    if (modalState.mode === 'add' && modalState.targetColId) {
      setBoard((prev) => addCard(prev, modalState.targetColId!, title, details));
    } else if (modalState.mode === 'edit' && modalState.card) {
      setBoard((prev) => updateCard(prev, modalState.card!.id, title, details));
    }
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: 'add' });
  };

  const handleDragStartCard = (
    e: React.DragEvent,
    card: Card,
    columnId: string,
    index: number
  ) => {
    const payload: DragPayload = {
      cardId: card.id,
      sourceColId: columnId,
      sourceIndex: index,
    };
    setActiveDrag(payload);

    try {
      e.dataTransfer.setData('text/plain', card.id);
      e.dataTransfer.setData('application/json', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'move';
    } catch {
      // ignore
    }
  };

  const handleDragEndCard = () => {
    setActiveDrag(null);
  };

  const handleDropOnCard = (
    sourceColId: string,
    sourceIndex: number,
    targetColId: string,
    targetIndex: number
  ) => {
    setBoard((prev) =>
      moveCard(prev, sourceColId, sourceIndex, targetColId, targetIndex)
    );
    setActiveDrag(null);
  };

  const handleDropOnColumn = (
    sourceColId: string,
    sourceIndex: number,
    targetColId: string
  ) => {
    const targetCol = board.columns.find((c) => c.id === targetColId);
    if (!targetCol) {
      setActiveDrag(null);
      return;
    }

    if (sourceColId === targetColId) {
      setActiveDrag(null);
      return;
    }

    setBoard((prev) =>
      moveCard(prev, sourceColId, sourceIndex, targetColId, targetCol.cards.length)
    );
    setActiveDrag(null);
  };

  return (
    <div className="app-container">
      <Header
        totalColumns={board.columns.length}
        totalCards={totalCards}
      />

      <main className="board-main">
        <div className="board-container" data-testid="board-columns-container">
          {board.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              activeDrag={activeDrag}
              onRenameColumn={handleRenameColumn}
              onOpenAddCard={handleOpenAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onDragStartCard={handleDragStartCard}
              onDragEndCard={handleDragEndCard}
              onDropOnCard={handleDropOnCard}
              onDropOnColumn={handleDropOnColumn}
            />
          ))}
        </div>
      </main>

      <CardModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialTitle={modalState.card?.title || ''}
        initialDetails={modalState.card?.details || ''}
        columnTitle={modalState.targetColTitle}
        onSave={handleSaveModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}
