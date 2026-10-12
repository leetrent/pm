import { describe, it, expect } from 'vitest';
import {
  createInitialBoard,
  renameColumn,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
} from '../kanban';

describe('Kanban state operations', () => {
  it('creates initial board with 5 columns and dummy cards', () => {
    const board = createInitialBoard();
    expect(board.columns).toHaveLength(5);
    expect(board.columns.map((c) => c.title)).toEqual([
      'Backlog',
      'To Do',
      'In Progress',
      'Review',
      'Done',
    ]);
    const totalCards = board.columns.reduce(
      (acc, col) => acc + col.cards.length,
      0
    );
    expect(totalCards).toBe(9);
  });

  describe('renameColumn', () => {
    it('renames an existing column with valid trimmed text', () => {
      const board = createInitialBoard();
      const updated = renameColumn(board, 'col-backlog', ' Ideas & Icebox ');
      const col = updated.columns.find((c) => c.id === 'col-backlog');
      expect(col?.title).toBe('Ideas & Icebox');
    });

    it('ignores empty or whitespace-only new titles', () => {
      const board = createInitialBoard();
      const unchanged1 = renameColumn(board, 'col-backlog', '');
      expect(unchanged1.columns[0].title).toBe('Backlog');

      const unchanged2 = renameColumn(board, 'col-backlog', '   ');
      expect(unchanged2.columns[0].title).toBe('Backlog');
    });
  });

  describe('addCard', () => {
    it('adds a new card to the target column with trimmed values', () => {
      const board = createInitialBoard();
      const updated = addCard(
        board,
        'col-todo',
        ' New Feature ',
        ' Detailed description '
      );
      const todoCol = updated.columns.find((c) => c.id === 'col-todo');
      expect(todoCol?.cards).toHaveLength(3);
      const newCard = todoCol?.cards[2];
      expect(newCard?.title).toBe('New Feature');
      expect(newCard?.details).toBe('Detailed description');
      expect(newCard?.id).toMatch(/^card-/);
    });

    it('does not add card if title is empty or only whitespace', () => {
      const board = createInitialBoard();
      const updated = addCard(board, 'col-todo', '   ', 'Details');
      const todoCol = updated.columns.find((c) => c.id === 'col-todo');
      expect(todoCol?.cards).toHaveLength(2);
    });
  });

  describe('updateCard', () => {
    it('updates title and details of an existing card', () => {
      const board = createInitialBoard();
      const updated = updateCard(
        board,
        'card-1',
        'Updated Title',
        'Updated Details'
      );
      const card = updated.columns[0].cards.find((c) => c.id === 'card-1');
      expect(card?.title).toBe('Updated Title');
      expect(card?.details).toBe('Updated Details');
    });

    it('ignores update if title is empty', () => {
      const board = createInitialBoard();
      const updated = updateCard(board, 'card-1', '   ', 'New details');
      const card = updated.columns[0].cards.find((c) => c.id === 'card-1');
      expect(card?.title).toBe('Research API caching strategies');
    });
  });

  describe('deleteCard', () => {
    it('removes card from its column', () => {
      const board = createInitialBoard();
      const updated = deleteCard(board, 'card-1');
      const col = updated.columns.find((c) => c.id === 'col-backlog');
      expect(col?.cards).toHaveLength(1);
      expect(col?.cards.find((c) => c.id === 'card-1')).toBeUndefined();
    });

    it('returns unchanged columns if card id does not exist', () => {
      const board = createInitialBoard();
      const updated = deleteCard(board, 'non-existent-id');
      const totalCards = updated.columns.reduce(
        (acc, col) => acc + col.cards.length,
        0
      );
      expect(totalCards).toBe(9);
    });
  });

  describe('moveCard', () => {
    it('reorders cards within the same column', () => {
      const board = createInitialBoard();
      const updated = moveCard(board, 'col-backlog', 0, 'col-backlog', 1);
      const col = updated.columns.find((c) => c.id === 'col-backlog')!;
      expect(col.cards[0].id).toBe('card-2');
      expect(col.cards[1].id).toBe('card-1');
    });

    it('moves a card from one column to another', () => {
      const board = createInitialBoard();
      const updated = moveCard(board, 'col-backlog', 0, 'col-done', 0);
      const sourceCol = updated.columns.find((c) => c.id === 'col-backlog')!;
      const targetCol = updated.columns.find((c) => c.id === 'col-done')!;

      expect(sourceCol.cards).toHaveLength(1);
      expect(sourceCol.cards[0].id).toBe('card-2');

      expect(targetCol.cards).toHaveLength(3);
      expect(targetCol.cards[0].id).toBe('card-1');
    });

    it('safely handles out of bounds or invalid column ids', () => {
      const board = createInitialBoard();
      const invalidCol = moveCard(board, 'invalid-col', 0, 'col-done', 0);
      expect(invalidCol).toEqual(board);

      const invalidIndex = moveCard(board, 'col-backlog', 99, 'col-done', 0);
      expect(invalidIndex).toEqual(board);
    });
  });
});
