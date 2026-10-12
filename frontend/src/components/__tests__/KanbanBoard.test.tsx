import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KanbanBoard } from '../KanbanBoard';

describe('KanbanBoard UI Component', () => {
  it('renders header, 5 columns, and initial dummy cards', () => {
    render(<KanbanBoard />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Project Management Board/i })
    ).toBeInTheDocument();

    const columnHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(columnHeadings).toHaveLength(5);
    expect(columnHeadings.map((h) => h.textContent)).toEqual([
      'Backlog',
      'To Do',
      'In Progress',
      'Review',
      'Done',
    ]);

    expect(
      screen.getByText('Research API caching strategies')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Define service level objectives')
    ).toBeInTheDocument();
  });

  it('allows renaming a column', async () => {
    render(<KanbanBoard />);
    const user = userEvent.setup();

    const renameBtn = screen.getByTestId('rename-column-col-backlog');
    await user.click(renameBtn);

    const renameInput = screen.getByTestId('rename-input-col-backlog');
    expect(renameInput).toBeInTheDocument();
    await user.clear(renameInput);
    await user.type(renameInput, 'Discovery Stage');

    const saveBtn = screen.getByTestId('rename-save-col-backlog');
    await user.click(saveBtn);

    expect(screen.getByTestId('column-title-col-backlog')).toHaveTextContent(
      'Discovery Stage'
    );
  });

  it('allows adding a new card to a column', async () => {
    render(<KanbanBoard />);
    const user = userEvent.setup();

    const addCardBtn = screen.getByTestId('add-card-col-backlog');
    await user.click(addCardBtn);

    expect(screen.getByTestId('card-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent(
      'Add Card to Backlog'
    );

    const titleInput = screen.getByTestId('modal-title-input');
    const detailsInput = screen.getByTestId('modal-details-input');

    await user.type(titleInput, 'New Feature Architecture');
    await user.type(detailsInput, 'Technical specifications for feature');

    const submitBtn = screen.getByTestId('modal-submit-button');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('card-modal')).not.toBeInTheDocument();
    });

    expect(screen.getByText('New Feature Architecture')).toBeInTheDocument();
    expect(
      screen.getByText('Technical specifications for feature')
    ).toBeInTheDocument();
  });

  it('allows editing an existing card', async () => {
    render(<KanbanBoard />);
    const user = userEvent.setup();

    const editBtn = screen.getByTestId('edit-card-card-1');
    await user.click(editBtn);

    expect(screen.getByTestId('card-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Edit Card');

    const titleInput = screen.getByTestId('modal-title-input') as HTMLInputElement;
    expect(titleInput.value).toBe('Research API caching strategies');

    await user.clear(titleInput);
    await user.type(titleInput, 'Refined API Caching Plan');

    const submitBtn = screen.getByTestId('modal-submit-button');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('card-modal')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Refined API Caching Plan')).toBeInTheDocument();
  });

  it('allows deleting an existing card', async () => {
    render(<KanbanBoard />);
    const user = userEvent.setup();

    expect(screen.getByTestId('card-card-1')).toBeInTheDocument();
    const deleteBtn = screen.getByTestId('delete-card-card-1');
    await user.click(deleteBtn);

    expect(screen.queryByTestId('card-card-1')).not.toBeInTheDocument();
  });

  it('moves a card when dropped onto another column', () => {
    render(<KanbanBoard />);

    const doneCol = screen.getByTestId('column-col-done');
    const dropData = JSON.stringify({
      cardId: 'card-1',
      sourceColId: 'col-backlog',
      sourceIndex: 0,
    });

    fireEvent.drop(doneCol, {
      dataTransfer: {
        getData: (format: string) => (format === 'application/json' ? dropData : ''),
      },
    });

    const backlogList = screen.getByTestId('card-list-col-backlog');
    const doneList = screen.getByTestId('card-list-col-done');

    expect(backlogList).not.toHaveTextContent('Research API caching strategies');
    expect(doneList).toHaveTextContent('Research API caching strategies');
  });
});
