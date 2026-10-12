import { BoardState, Card, Column } from '@/types/kanban';

export const INITIAL_COLUMNS: Column[] = [
  {
    id: 'col-backlog',
    title: 'Backlog',
    cards: [
      {
        id: 'card-1',
        title: 'Research API caching strategies',
        details: 'Evaluate Redis vs HTTP cache headers for latency reduction on analytics queries.',
      },
      {
        id: 'card-2',
        title: 'Define service level objectives',
        details: 'Draft initial availability and latency targets for core user-facing endpoints.',
      },
    ],
  },
  {
    id: 'col-todo',
    title: 'To Do',
    cards: [
      {
        id: 'card-3',
        title: 'Audit third-party dependencies',
        details: 'Run dependency vulnerability scan and upgrade outdated production packages.',
      },
      {
        id: 'card-4',
        title: 'Design database indexing plan',
        details: 'Analyze slow query execution plans and add composite indexes on high-traffic tables.',
      },
    ],
  },
  {
    id: 'col-inprogress',
    title: 'In Progress',
    cards: [
      {
        id: 'card-5',
        title: 'Implement JWT token rotation',
        details: 'Introduce refresh token rotation mechanism with strict expiration timeouts.',
      },
      {
        id: 'card-6',
        title: 'Build automated test pipeline',
        details: 'Configure continuous integration jobs to run Vitest and Playwright suites on pull requests.',
      },
    ],
  },
  {
    id: 'col-review',
    title: 'Review',
    cards: [
      {
        id: 'card-7',
        title: 'Refactor notification dispatcher',
        details: 'Decouple email and webhook notification delivery into background worker queues.',
      },
    ],
  },
  {
    id: 'col-done',
    title: 'Done',
    cards: [
      {
        id: 'card-8',
        title: 'Initialize repository scaffolding',
        details: 'Set up Next.js project structure, configuration files, and standard coding rules.',
      },
      {
        id: 'card-9',
        title: 'Setup baseline design tokens',
        details: 'Establish brand color palette, font styles, and responsive CSS variables.',
      },
    ],
  },
];

export function createInitialBoard(): BoardState {
  return {
    columns: JSON.parse(JSON.stringify(INITIAL_COLUMNS)),
  };
}

export function renameColumn(
  state: BoardState,
  columnId: string,
  newTitle: string
): BoardState {
  const trimmed = newTitle.trim();
  if (!trimmed) {
    return state;
  }
  return {
    ...state,
    columns: state.columns.map((col) =>
      col.id === columnId ? { ...col, title: trimmed } : col
    ),
  };
}

export function addCard(
  state: BoardState,
  columnId: string,
  title: string,
  details: string
): BoardState {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return state;
  }

  const newCard: Card = {
    id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: trimmedTitle,
    details: details.trim(),
  };

  return {
    ...state,
    columns: state.columns.map((col) =>
      col.id === columnId
        ? { ...col, cards: [...col.cards, newCard] }
        : col
    ),
  };
}

export function updateCard(
  state: BoardState,
  cardId: string,
  title: string,
  details: string
): BoardState {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return state;
  }

  return {
    ...state,
    columns: state.columns.map((col) => ({
      ...col,
      cards: col.cards.map((card) =>
        card.id === cardId
          ? { ...card, title: trimmedTitle, details: details.trim() }
          : card
      ),
    })),
  };
}

export function deleteCard(state: BoardState, cardId: string): BoardState {
  return {
    ...state,
    columns: state.columns.map((col) => ({
      ...col,
      cards: col.cards.filter((card) => card.id !== cardId),
    })),
  };
}

export function moveCard(
  state: BoardState,
  sourceColId: string,
  sourceIndex: number,
  targetColId: string,
  targetIndex: number
): BoardState {
  const sourceCol = state.columns.find((c) => c.id === sourceColId);
  const targetCol = state.columns.find((c) => c.id === targetColId);

  if (!sourceCol || !targetCol) {
    return state;
  }

  if (
    sourceIndex < 0 ||
    sourceIndex >= sourceCol.cards.length
  ) {
    return state;
  }

  const cardToMove = sourceCol.cards[sourceIndex];
  if (!cardToMove) {
    return state;
  }

  if (sourceColId === targetColId) {
    const updatedCards = [...sourceCol.cards];
    updatedCards.splice(sourceIndex, 1);
    const clampedTargetIndex = Math.max(0, Math.min(targetIndex, updatedCards.length));
    updatedCards.splice(clampedTargetIndex, 0, cardToMove);

    return {
      ...state,
      columns: state.columns.map((col) =>
        col.id === sourceColId ? { ...col, cards: updatedCards } : col
      ),
    };
  }

  const newSourceCards = [...sourceCol.cards];
  newSourceCards.splice(sourceIndex, 1);

  const newTargetCards = [...targetCol.cards];
  const clampedTargetIndex = Math.max(0, Math.min(targetIndex, newTargetCards.length));
  newTargetCards.splice(clampedTargetIndex, 0, cardToMove);

  return {
    ...state,
    columns: state.columns.map((col) => {
      if (col.id === sourceColId) {
        return { ...col, cards: newSourceCards };
      }
      if (col.id === targetColId) {
        return { ...col, cards: newTargetCards };
      }
      return col;
    }),
  };
}
