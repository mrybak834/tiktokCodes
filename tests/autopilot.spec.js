// @ts-check
const { test, expect } = require('@playwright/test');

const getGameState = async (page) => {
  return page.evaluate(() => {
    const debug = window.__CANVAS_RUNNER_DEBUG__;
    if (!debug) {
      throw new Error('Debug helpers are not available on the window object.');
    }
    return debug.getState();
  });
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.click('#game-canvas');
});

test('autopilot toggle updates HUD and sequence state', async ({ page }) => {
  const autopilotButton = page.getByRole('button', { name: /autopilot/i });
  const statusText = page.locator('.hud__autopilot-status');

  await expect(autopilotButton).toHaveAttribute('aria-pressed', 'false');
  await expect(statusText).toHaveText('Off');

  const initialState = await getGameState(page);
  expect(Object.values(initialState.keys).every((value) => value === false)).toBe(true);
  expect(initialState.autopilot.enabled).toBe(false);

  await autopilotButton.click();
  await expect(autopilotButton).toHaveAttribute('aria-pressed', 'true');
  await expect(statusText).toHaveText('On');

  await page.waitForTimeout(100);
  const stateAfterEnable = await getGameState(page);
  expect(stateAfterEnable.autopilot.enabled).toBe(true);
  expect(Object.values(stateAfterEnable.keys).some((value) => value)).toBe(true);

  const firstActiveKey = Object.entries(stateAfterEnable.keys).find(([, active]) => active)?.[0];
  await page.waitForTimeout(1300);
  const stateAfterAdvance = await getGameState(page);
  const nextActiveKey = Object.entries(stateAfterAdvance.keys).find(([, active]) => active)?.[0];
  expect(nextActiveKey && firstActiveKey).toBeTruthy();
  expect(nextActiveKey).not.toBe(firstActiveKey);

  await autopilotButton.click();
  await expect(autopilotButton).toHaveAttribute('aria-pressed', 'false');
  await expect(statusText).toHaveText('Off');

  const stateAfterDisable = await getGameState(page);
  expect(stateAfterDisable.autopilot.enabled).toBe(false);
  expect(Object.values(stateAfterDisable.keys).every((value) => value === false)).toBe(true);
});

test('manual key input cancels autopilot and hands control back to the player', async ({ page }) => {
  const autopilotButton = page.getByRole('button', { name: /autopilot/i });
  await autopilotButton.click();
  await page.waitForTimeout(100);

  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(50);

  const stateAfterInput = await getGameState(page);
  expect(stateAfterInput.autopilot.enabled).toBe(false);
  expect(stateAfterInput.keys.ArrowLeft).toBe(true);

  await page.keyboard.up('ArrowLeft');
  await page.waitForTimeout(50);
  const stateAfterRelease = await getGameState(page);
  expect(stateAfterRelease.keys.ArrowLeft).toBe(false);
});
