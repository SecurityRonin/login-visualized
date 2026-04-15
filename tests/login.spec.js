import { test, expect } from '@playwright/test';

// ── Page loads ──────────────────────────────────────────────────────────────
test('page loads with title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Login Security');
});

test('shows subtitle', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header + header')).not.toBeEmpty();
});

// ── Scenario selector ────────────────────────────────────────────────────────
test('three scenario buttons present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-scenario="plain"]')).toBeVisible();
  await expect(page.locator('[data-scenario="salted"]')).toBeVisible();
  await expect(page.locator('[data-scenario="peppered"]')).toBeVisible();
});

test('plain scenario active by default', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-scenario="plain"]')).toHaveClass(/active/);
  await expect(page.locator('[data-scenario="salted"]')).not.toHaveClass(/active/);
});

test('switching scenario resets to step 1', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnNext');
  await page.click('[data-scenario="salted"]');
  await expect(page.locator('#stepCounter')).toContainText('Step 1 of 7');
});

// ── Wizard panel ─────────────────────────────────────────────────────────────
test('seven wizard steps present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.wizard-step')).toHaveCount(7);
});

test('first step active on load', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('.wizard-step').first();
  await expect(first).toHaveClass(/active/);
});

test('wizard step click navigates directly', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="4"]');
  await expect(page.locator('#stepCounter')).toContainText('Step 5 of 7');
  const step5 = page.locator('[data-step="4"]');
  await expect(step5).toHaveClass(/active/);
});

test('attack step has attack styling when active', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  await expect(page.locator('[data-step="6"]')).toHaveClass(/attack/);
});

// ── Step navigation ───────────────────────────────────────────────────────────
test('step counter shows 1 of 7 on load', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#stepCounter')).toContainText('Step 1 of 7');
});

test('next button advances step', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnNext');
  await expect(page.locator('#stepCounter')).toContainText('Step 2 of 7');
});

test('prev button goes back', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnNext');
  await page.click('#btnPrev');
  await expect(page.locator('#stepCounter')).toContainText('Step 1 of 7');
});

test('prev button disabled on first step', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnPrev')).toBeDisabled();
});

test('next button disabled on last step', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 6; i++) await page.click('#btnNext');
  await expect(page.locator('#btnNext')).toBeDisabled();
});

test('arrow key right advances step', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#stepCounter')).toContainText('Step 2 of 7');
});

test('arrow key left goes back', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#stepCounter')).toContainText('Step 1 of 7');
});

test('keyboard 1/2/3 switches scenarios', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('2');
  await expect(page.locator('[data-scenario="salted"]')).toHaveClass(/active/);
  await page.keyboard.press('3');
  await expect(page.locator('[data-scenario="peppered"]')).toHaveClass(/active/);
  await page.keyboard.press('1');
  await expect(page.locator('[data-scenario="plain"]')).toHaveClass(/active/);
});

test('reset button resets to step 1 plain', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  for (let i = 0; i < 3; i++) await page.click('#btnNext');
  await page.click('#btnReset');
  await expect(page.locator('#stepCounter')).toContainText('Step 1 of 7');
  await expect(page.locator('[data-scenario="plain"]')).toHaveClass(/active/);
  await expect(page.locator('[data-scenario="peppered"]')).not.toHaveClass(/active/);
});

test('keyboard r resets to step 1 plain', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await page.click('#btnNext');
  await page.keyboard.press('r');
  await expect(page.locator('#stepCounter')).toContainText('Step 1 of 7');
  await expect(page.locator('[data-scenario="plain"]')).toHaveClass(/active/);
});

// ── Step content ─────────────────────────────────────────────────────────────
test('step tag shows REGISTER on step 1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#stepTag')).toContainText('REGISTER');
});

test('step text is not empty', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#stepText')).not.toBeEmpty();
});

test('attack step shows ATTACK tag', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 6; i++) await page.click('#btnNext');
  await expect(page.locator('#stepTag')).toContainText('ATTACK');
});

test('login steps show LOGIN tag', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="3"]');
  await expect(page.locator('#stepTag')).toContainText('LOGIN');
});

// ── Chips ────────────────────────────────────────────────────────────────────
test('password chip appears on step 1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#chips-0 .ws-chip-password')).toBeVisible();
});

test('salt chip appears in salted scenario step 2', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await page.click('[data-step="1"]');
  await expect(page.locator('#chips-1 .ws-chip-salt')).toBeVisible();
});

test('pepper chip appears in peppered scenario step 2', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  await page.click('[data-step="1"]');
  await expect(page.locator('#chips-1 .ws-chip-pepper')).toBeVisible();
});

// ── DB panel ──────────────────────────────────────────────────────────────────
test('database empty on steps 1-2 (plain)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.db-empty')).toBeVisible();
  await page.click('#btnNext');
  await expect(page.locator('.db-empty')).toBeVisible();
});

test('database table appears after store step (plain)', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="2"]');
  await expect(page.locator('.db-table')).toBeVisible();
});

test('salted scenario DB shows salt column', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await page.click('[data-step="2"]');
  await expect(page.locator('.db-table th')).toContainText(['username', 'hash', 'salt']);
});

test('plain scenario DB has no salt column', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="2"]');
  const headers = await page.locator('.db-table th').allTextContents();
  expect(headers).not.toContain('salt');
});

// ── Computation panel ─────────────────────────────────────────────────────────
test('computation panel shows content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#computationRows')).not.toBeEmpty();
});

test('computation shows pepper in peppered scenario step 2', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  await page.click('[data-step="1"]');
  await expect(page.locator('#computationRows')).toContainText('pepper');
});

// ── Formula blocks ────────────────────────────────────────────────────────────
test('formula row visible on hash step (plain)', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="1"]');
  await expect(page.locator('.formula-row')).toBeVisible();
});

test('formula shows password block on step 1', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="1"]');
  await expect(page.locator('.formula-block.password')).toBeVisible();
});

test('formula shows hash block on hash step', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="1"]');
  await expect(page.locator('.formula-block.hash')).toBeVisible();
});

test('formula shows salt block in salted scenario hash step', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await page.click('[data-step="1"]');
  await expect(page.locator('.formula-block.salt')).toBeVisible();
});

test('formula shows pepper block in peppered scenario hash step', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  await page.click('[data-step="1"]');
  await expect(page.locator('.formula-block.pepper')).toBeVisible();
});

test('formula shows missing pepper block on peppered attack step', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  await page.click('[data-step="6"]');
  await expect(page.locator('.formula-block.missing')).toBeVisible();
});

test('formula shows breach block on plain attack step', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  await expect(page.locator('.formula-block.breach')).toBeVisible();
});

// ── Attack outcomes ───────────────────────────────────────────────────────────
test('attack section visible on step 7', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 6; i++) await page.click('#btnNext');
  await expect(page.locator('#attackSection')).toBeVisible();
});

test('attack section hidden on non-attack steps', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#attackSection')).toBeHidden();
});

test('plain scenario attack shows .fail outcome', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 6; i++) await page.click('#btnNext');
  await expect(page.locator('.attack-outcome.fail')).toBeVisible();
});

test('salted scenario attack shows .partial outcome', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  for (let i = 0; i < 6; i++) await page.click('#btnNext');
  await expect(page.locator('.attack-outcome.partial')).toBeVisible();
});

test('peppered scenario attack shows .success (defender wins)', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  for (let i = 0; i < 6; i++) await page.click('#btnNext');
  await expect(page.locator('.attack-outcome.success')).toBeVisible();
});

// ── Think why ─────────────────────────────────────────────────────────────────
test('think-why block visible on attack step', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 6; i++) await page.click('#btnNext');
  await expect(page.locator('#thinkWhy')).toBeVisible();
});

test('think-why hidden on non-attack steps', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#thinkWhy')).toBeHidden();
});

// ── Success box ───────────────────────────────────────────────────────────────
test('success box visible on login verify step', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="4"]');
  await expect(page.locator('#successBox')).toBeVisible();
});

test('success box hidden on non-verify steps', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#successBox')).toBeHidden();
});

// ── Attacker node ─────────────────────────────────────────────────────────────
test('attacker row hidden on non-attack steps', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#attackerRow')).not.toHaveClass(/visible/);
});

test('attacker row visible on attack step', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 6; i++) await page.click('#btnNext');
  await expect(page.locator('#attackerRow')).toHaveClass(/visible/);
});

// ── Multi-user DB ─────────────────────────────────────────────────────────────
test('DB shows 3 users after store step (plain)', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="2"]');
  await expect(page.locator('.db-table tbody tr')).toHaveCount(3);
});

test('DB shows 3 users after store step (salted)', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await page.click('[data-step="2"]');
  await expect(page.locator('.db-table tbody tr')).toHaveCount(3);
});

test('plain DB: alice and bob share the same hash', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="2"]');
  const hashes = await page.locator('.db-table td.hash-val').allTextContents();
  expect(hashes[0]).toBe(hashes[1]); // alice === bob
  expect(hashes[0]).not.toBe(hashes[2]); // charlie differs
});

test('salted DB: alice and bob have different hashes despite same password', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await page.click('[data-step="2"]');
  const hashes = await page.locator('.db-table td.hash-val').allTextContents();
  expect(hashes[0]).not.toBe(hashes[1]); // alice ≠ bob despite same password
});

test('plain attack: mass-crack rows visible', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  await expect(page.locator('.db-table tr.mass-crack')).toHaveCount(2);
});

// ── Live hash input ────────────────────────────────────────────────────────────
test('live hash input visible on step 2 (hash step)', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="1"]');
  await expect(page.locator('#liveHashInput')).toBeVisible();
});

test('live hash input hidden on non-hash steps', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#liveHashSection')).toBeHidden();
});

test('typing in live hash input updates output', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="1"]');
  await page.fill('#liveHashInput', 'hello');
  await page.waitForTimeout(300);
  const val = await page.locator('#liveHashOut').textContent();
  expect(val).not.toBe('—');
  expect(val).toMatch(/[0-9a-f]{8}/);
});

// ── Cracking time bar ─────────────────────────────────────────────────────────
test('crack bar visible on attack step', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  await expect(page.locator('#crackBarSection')).toBeVisible();
});

test('crack bar hidden on non-attack steps', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#crackBarSection')).toBeHidden();
});

test('plain crack bar shows instant difficulty', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  await expect(page.locator('#crackBarSection')).toContainText('< 1 second');
});

test('peppered crack bar shows blocked', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  await page.click('[data-step="6"]');
  await expect(page.locator('#crackBarSection')).toContainText('blocked');
});

// ── All scenarios × all steps smoke test ─────────────────────────────────────
for (const scenario of ['plain', 'salted', 'peppered']) {
  test(`all 7 steps render without error — ${scenario}`, async ({ page }) => {
    await page.goto('/');
    await page.click(`[data-scenario="${scenario}"]`);
    for (let i = 0; i < 7; i++) {
      await page.click(`[data-step="${i}"]`);
      await expect(page.locator('#stepText')).not.toBeEmpty();
      await expect(page.locator('#computationRows')).not.toBeEmpty();
    }
  });
}

// ── Feature 1: Argon2id scenario ─────────────────────────────────────────────
test('argon2 scenario button is present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-scenario="argon2"]')).toBeVisible();
});

test('keyboard 4 switches to argon2 scenario', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('4');
  await expect(page.locator('[data-scenario="argon2"]')).toHaveClass(/active/);
});

test('argon2 scenario shows Argon2id in computation', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  await expect(page.locator('#computationRows')).toContainText('Argon2id');
});

test('argon2 attack step crack bar shows centuries', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  await page.click('[data-step="6"]');
  await expect(page.locator('#crackBarSection')).toContainText('centuries');
});

test('all 7 steps render without error — argon2', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  for (let i = 0; i < 7; i++) {
    await page.click(`[data-step="${i}"]`);
    await expect(page.locator('#stepText')).not.toBeEmpty();
    await expect(page.locator('#computationRows')).not.toBeEmpty();
  }
});

// ── Feature 2: Compare mode ───────────────────────────────────────────────────
test('compare button is present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnCompare')).toBeVisible();
});

test('compare panel is hidden by default', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#comparePanel')).toBeHidden();
});

test('clicking compare button shows compare panel', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnCompare');
  await expect(page.locator('#comparePanel')).toBeVisible();
});

test('compare panel shows all scenario labels', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnCompare');
  await expect(page.locator('#comparePanel')).toContainText('Plain');
  await expect(page.locator('#comparePanel')).toContainText('Salted');
  await expect(page.locator('#comparePanel')).toContainText('Peppered');
  await expect(page.locator('#comparePanel')).toContainText('Argon2id');
});

test('keyboard c toggles compare panel', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('c');
  await expect(page.locator('#comparePanel')).toBeVisible();
  await page.keyboard.press('c');
  await expect(page.locator('#comparePanel')).toBeHidden();
});

test('Escape closes compare panel', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnCompare');
  await expect(page.locator('#comparePanel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#comparePanel')).toBeHidden();
});

// ── Feature 3: Keyboard shortcut overlay ─────────────────────────────────────
test('shortcut overlay is hidden by default', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#shortcutOverlay')).toBeHidden();
});

test('? key shows shortcut overlay', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('?');
  await expect(page.locator('#shortcutOverlay')).toBeVisible();
});

test('? key again hides shortcut overlay', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('?');
  await page.keyboard.press('?');
  await expect(page.locator('#shortcutOverlay')).toBeHidden();
});

test('Escape closes shortcut overlay', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('?');
  await expect(page.locator('#shortcutOverlay')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#shortcutOverlay')).toBeHidden();
});

test('shortcut overlay lists arrow key shortcuts', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('?');
  await expect(page.locator('#shortcutOverlay')).toContainText('←');
  await expect(page.locator('#shortcutOverlay')).toContainText('→');
});

// ── Feature 4: Permalink / deep-link ─────────────────────────────────────────
test('URL hash updates on step change', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="2"]');
  await expect(page).toHaveURL(/#plain\/2/);
});

test('URL hash updates on scenario change', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await expect(page).toHaveURL(/#salted\/0/);
});

test('loading with hash navigates to correct scenario and step', async ({ page }) => {
  await page.goto('/#salted/3');
  await expect(page.locator('[data-scenario="salted"]')).toHaveClass(/active/);
  await expect(page.locator('#stepCounter')).toContainText('Step 4');
});

// ── Feature 5: Print / export ─────────────────────────────────────────────────
test('print button is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnPrint')).toBeVisible();
});

test('clicking print button calls window.print', async ({ page }) => {
  await page.goto('/');
  let printCalled = false;
  await page.exposeFunction('__testPrintCalled', () => { printCalled = true; });
  await page.evaluate(() => {
    window.print = () => window.__testPrintCalled();
  });
  await page.click('#btnPrint');
  await expect.poll(() => printCalled).toBe(true);
});
