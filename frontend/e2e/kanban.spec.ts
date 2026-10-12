import { test, expect } from '@playwright/test';

test.describe('Kanban Board Integration and E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads board with 5 columns, dummy cards, and correct metadata', async ({
    page,
  }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Project Management Board'
    );

    const columns = page.locator('.kanban-column');
    await expect(columns).toHaveCount(5);

    const columnTitles = [
      'Backlog',
      'To Do',
      'In Progress',
      'Review',
      'Done',
    ];

    for (const title of columnTitles) {
      await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible();
    }

    await expect(page.getByTestId('meta-columns')).toContainText('5 Columns');
    await expect(page.getByTestId('meta-cards')).toContainText('9 Cards');

    await expect(
      page.getByText('Research API caching strategies')
    ).toBeVisible();
  });

  test('renames a column', async ({ page }) => {
    await page.getByTestId('rename-column-col-backlog').click();

    const input = page.getByTestId('rename-input-col-backlog');
    await expect(input).toBeVisible();
    await input.fill('Discovery & Backlog');

    await page.getByTestId('rename-save-col-backlog').click();

    await expect(
      page.getByTestId('column-title-col-backlog')
    ).toHaveText('Discovery & Backlog');
  });

  test('adds a new card to a specific column', async ({ page }) => {
    await page.getByTestId('add-card-col-inprogress').click();

    const modal = page.getByTestId('card-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('modal-title')).toHaveText(
      'Add Card to In Progress'
    );

    await page
      .getByTestId('modal-title-input')
      .fill('Deploy Canary Release');
    await page
      .getByTestId('modal-details-input')
      .fill('Roll out to 10 percent of traffic and monitor error rate');

    await page.getByTestId('modal-submit-button').click();

    await expect(modal).toBeHidden();

    const newCard = page.getByText('Deploy Canary Release');
    await expect(newCard).toBeVisible();
    await expect(
      page.getByText('Roll out to 10 percent of traffic and monitor error rate')
    ).toBeVisible();

    await expect(page.getByTestId('column-count-col-inprogress')).toHaveText('3');
    await expect(page.getByTestId('meta-cards')).toContainText('10 Cards');
  });

  test('edits an existing card title and details', async ({ page }) => {
    await page.getByTestId('edit-card-card-1').click();

    const modal = page.getByTestId('card-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('modal-title')).toHaveText('Edit Card');

    const titleInput = page.getByTestId('modal-title-input');
    await expect(titleInput).toHaveValue('Research API caching strategies');

    await titleInput.fill('Advanced Cache Invalidation');
    await page
      .getByTestId('modal-details-input')
      .fill('Use Redis pub-sub for cluster cache busts');

    await page.getByTestId('modal-submit-button').click();

    await expect(modal).toBeHidden();
    await expect(
      page.getByTestId('card-title-card-1')
    ).toHaveText('Advanced Cache Invalidation');
    await expect(
      page.getByTestId('card-details-card-1')
    ).toHaveText('Use Redis pub-sub for cluster cache busts');
  });

  test('deletes an existing card', async ({ page }) => {
    await expect(page.getByTestId('card-card-2')).toBeVisible();

    await page.getByTestId('delete-card-card-2').click();

    await expect(page.getByTestId('card-card-2')).toBeHidden();
    await expect(page.getByTestId('column-count-col-backlog')).toHaveText('1');
    await expect(page.getByTestId('meta-cards')).toContainText('8 Cards');
  });

  test('drags and drops a card to another column', async ({ page }) => {
    const card = page.getByTestId('card-card-1');
    const targetColumn = page.getByTestId('column-col-done');

    await expect(
      page.getByTestId('column-count-col-backlog')
    ).toHaveText('2');
    await expect(
      page.getByTestId('column-count-col-done')
    ).toHaveText('2');

    // Trigger HTML5 drag and drop events
    await card.dispatchEvent('dragstart');
    await targetColumn.dispatchEvent('dragover');
    await targetColumn.dispatchEvent('drop');

    await expect(
      page.getByTestId('column-count-col-backlog')
    ).toHaveText('1');
    await expect(
      page.getByTestId('column-count-col-done')
    ).toHaveText('3');

    await expect(
      page.locator('[data-testid="card-list-col-done"] [data-testid="card-card-1"]')
    ).toBeVisible();
  });

  test('dismisses modal on Cancel button and Escape key', async ({ page }) => {
    await page.getByTestId('add-card-col-todo').click();
    const modal = page.getByTestId('card-modal');
    await expect(modal).toBeVisible();

    await page.getByTestId('modal-cancel-button').click();
    await expect(modal).toBeHidden();

    await page.getByTestId('add-card-col-todo').click();
    await expect(modal).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });
});
