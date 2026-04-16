import { test, expect } from '@playwright/test';

// Dismiss guided tour for all tests
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tourSeen', '1');
  });
});

// ── SEO & meta ───────────────────────────────────────────────────────────────
test('page has meta description', async ({ page }) => {
  await page.goto('/');
  const content = await page.locator('meta[name="description"]').getAttribute('content');
  expect(content).toBeTruthy();
  expect(content.length).toBeGreaterThan(20);
});

test('page has og:title', async ({ page }) => {
  await page.goto('/');
  const content = await page.locator('meta[property="og:title"]').getAttribute('content');
  expect(content).toBeTruthy();
});

test('page has og:description', async ({ page }) => {
  await page.goto('/');
  const content = await page.locator('meta[property="og:description"]').getAttribute('content');
  expect(content).toBeTruthy();
});

test('page has canonical link', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(href).toBeTruthy();
  expect(href).toContain('login-visualized');
});

// ── Security headers ─────────────────────────────────────────────────────────
test('response has X-Frame-Options header', async ({ page }) => {
  const response = await page.goto('/');
  expect(response.headers()['x-frame-options']).toBe('DENY');
});

test('response has X-Content-Type-Options header', async ({ page }) => {
  const response = await page.goto('/');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
});

test('response has Content-Security-Policy header', async ({ page }) => {
  const response = await page.goto('/');
  const csp = response.headers()['content-security-policy'];
  expect(csp).toBeTruthy();
  expect(csp).toContain("frame-ancestors 'none'");
});

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
test('eight wizard steps present for plain scenario', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.wizard-step')).toHaveCount(8);
});

test('first step active on load', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('.wizard-step').first();
  await expect(first).toHaveClass(/active/);
});

test('wizard step click navigates directly', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="4"]');
  await expect(page.locator('#stepCounter')).toContainText('Step 5 of 8');
  const step5 = page.locator('[data-step="4"]');
  await expect(step5).toHaveClass(/active/);
});

test('attack step has attack styling when active', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  await expect(page.locator('[data-step="6"]')).toHaveClass(/attack/);
});

// ── Step navigation ───────────────────────────────────────────────────────────
test('step counter shows 1 of 8 on load (plain has 8 steps)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#stepCounter')).toContainText('Step 1 of 8');
});

test('next button advances step', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnNext');
  await expect(page.locator('#stepCounter')).toContainText('Step 2 of 8');
});

test('prev button goes back', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnNext');
  await page.click('#btnPrev');
  await expect(page.locator('#stepCounter')).toContainText('Step 1 of 8');
});

test('prev button disabled on first step', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnPrev')).toBeDisabled();
});

test('next button disabled on last step', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 7; i++) await page.click('#btnNext'); // 8 steps → 7 clicks to reach step 8
  await expect(page.locator('#btnNext')).toBeDisabled();
});

test('arrow key right advances step', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#stepCounter')).toContainText('Step 2 of 8');
});

test('arrow key left goes back', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#stepCounter')).toContainText('Step 1 of 8');
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
  await expect(page.locator('#stepCounter')).toContainText('Step 1 of 8');
  await expect(page.locator('[data-scenario="plain"]')).toHaveClass(/active/);
  await expect(page.locator('[data-scenario="peppered"]')).not.toHaveClass(/active/);
});

test('keyboard r resets to step 1 plain', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await page.click('#btnNext');
  await page.keyboard.press('r');
  await expect(page.locator('#stepCounter')).toContainText('Step 1 of 8');
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

test('peppered scenario attack shows .partial (DB-only breach blocked, but combined breach possible)', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  for (let i = 0; i < 6; i++) await page.click('#btnNext');
  await expect(page.locator('.attack-outcome.partial')).toBeVisible();
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
test('crack bar visible on attack step with crack bar data', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="7"]'); // step 7 = rainbow table (has crackBar)
  await expect(page.locator('#crackBarSection')).toBeVisible();
});

test('crack bar hidden on non-attack steps', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#crackBarSection')).toBeHidden();
});

test('plain crack bar shows instant difficulty (rainbow table step)', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="7"]');
  await expect(page.locator('#crackBarSection')).toContainText('< 1 second');
});

test('peppered crack bar shows blocked', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  await page.click('[data-step="6"]');
  await expect(page.locator('#crackBarSection')).toContainText('blocked');
});

// ── Cmd/Ctrl modifier keys bypass single-key shortcuts ───────────────────────
test('Cmd+C does not toggle compare panel', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Meta+c');
  await expect(page.locator('#comparePanel')).toBeHidden();
});

test('Ctrl+C does not toggle compare panel', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+c');
  await expect(page.locator('#comparePanel')).toBeHidden();
});

// ── Plain scenario has 8 steps (attack split into two) ───────────────────────
test('plain scenario step counter shows 8 steps', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#stepCounter')).toContainText('of 8');
});

test('non-plain scenarios still have 7 steps', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await expect(page.locator('#stepCounter')).toContainText('of 7');
});

test('plain step 6 describes the simultaneous exposure problem and salt', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  const text = await page.locator('#stepText').textContent();
  expect(text.toLowerCase()).toMatch(/simultaneous|salt/);
});

test('plain step 6 charlie row is NOT shown as breached (only alice+bob are)', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  // charlie row must not carry breach/mass-crack styling on this step
  const charlieRow = page.locator('.db-table tr').filter({ hasText: 'charlie' });
  await expect(charlieRow).not.toHaveClass(/mass-crack/);
  const charlieHash = charlieRow.locator('td').nth(1);
  await expect(charlieHash).not.toHaveClass(/breach/);
});

test('plain step 7 describes rainbow table attack', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="7"]');
  await expect(page.locator('#stepText')).toContainText(/rainbow/i);
});

test('plain step 7 crack bar shows < 1 second', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="7"]');
  await expect(page.locator('#crackBarSection')).toContainText('< 1 second');
});

test('all 8 plain steps render without error', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 8; i++) {
    await page.click(`[data-step="${i}"]`);
    await expect(page.locator('#stepText')).not.toBeEmpty();
    await expect(page.locator('#computationRows')).not.toBeEmpty();
  }
});

// ── All scenarios × all steps smoke test ─────────────────────────────────────
for (const scenario of ['salted', 'peppered']) {
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

// ── Coverage: stepTag ─────────────────────────────────────────────────────────
test('step tag shows REGISTER on registration steps', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="0"]');
  await expect(page.locator('#stepTag')).toContainText('REGISTER');
});

test('step tag shows LOGIN on login steps', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="3"]');
  await expect(page.locator('#stepTag')).toContainText('LOGIN');
});

test('step tag shows ATTACK on attack step', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  await expect(page.locator('#stepTag')).toContainText('ATTACK');
});

// ── Coverage: thinkWhy block ──────────────────────────────────────────────────
test('thinkWhy block is hidden when step has no thinkWhy', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="0"]');
  await expect(page.locator('#thinkWhy')).not.toHaveClass(/visible/);
});

test('thinkWhy block is visible when step has thinkWhy', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  await expect(page.locator('#thinkWhy')).toHaveClass(/visible/);
});

test('thinkWhy block content changes between scenarios', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  const plain = await page.locator('#thinkWhy').textContent();
  await page.click('[data-scenario="peppered"]');
  await page.click('[data-step="6"]');
  const peppered = await page.locator('#thinkWhy').textContent();
  expect(plain).not.toEqual(peppered);
});

// ── Coverage: success box ─────────────────────────────────────────────────────
test('success box is hidden on non-login steps', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="0"]');
  await expect(page.locator('#successBox')).not.toHaveClass(/visible/);
});

test('success box is visible on login confirmed step', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  await page.click('[data-step="4"]');
  await expect(page.locator('#successBox')).toHaveClass(/visible/);
});

// ── Coverage: attacker row ────────────────────────────────────────────────────
test('attacker row is hidden on non-attack steps', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="0"]');
  await expect(page.locator('#attackerRow')).not.toHaveClass(/visible/);
});

test('attacker row is visible on attack step', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  await expect(page.locator('#attackerRow')).toHaveClass(/visible/);
});

// ── Coverage: OWASP refs section ──────────────────────────────────────────────
test('refs section hidden when step has no refs', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="0"]');
  const display = await page.locator('#refsSection').evaluate(el => el.style.display);
  expect(display).toBe('none');
});

test('refs section visible and contains link when step has refs', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="1"]');
  await expect(page.locator('#refsSection')).not.toHaveCSS('display', 'none');
  await expect(page.locator('#refsList .ref-link').first()).toBeVisible();
});

// ── Coverage: compare grid DB content ────────────────────────────────────────
test('compare grid shows DB tables at step 3 (store step)', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="2"]');
  await page.click('#btnCompare');
  await expect(page.locator('#compareGrid')).toContainText('alice');
});

// ── Coverage: permalink argon2 deep-link ─────────────────────────────────────
test('loading /#argon2/6 shows argon2 attack step', async ({ page }) => {
  await page.goto('/#argon2/6');
  await expect(page.locator('[data-scenario="argon2"]')).toHaveClass(/active/);
  await expect(page.locator('#stepTag')).toContainText('ATTACK');
});

// ── Coverage: live hash hidden on non-liveHash step ──────────────────────────
test('live hash section is hidden on steps without liveHash', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="0"]');
  const display = await page.locator('#liveHashSection').evaluate(el => el.style.display);
  expect(display).toBe('none');
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENHANCEMENT TESTS — 13 features
// ═══════════════════════════════════════════════════════════════════════════════

// ── Feature A: Real breach callouts ──────────────────────────────────────────
test('attack steps show a historical breach callout box', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="7"]'); // rainbow table attack step
  await expect(page.locator('#breachCallout')).toBeVisible();
});

test('breach callout contains a real incident name', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="7"]');
  const text = await page.locator('#breachCallout').textContent();
  expect(text.length).toBeGreaterThan(20);
});

test('breach callout is hidden on non-attack steps', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="0"]');
  await expect(page.locator('#breachCallout')).toBeHidden();
});

// ── Feature B: Password strength interplay (Argon2id attack step) ────────────
test('argon2 attack step shows strength demo input', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  await page.click('[data-step="6"]');
  await expect(page.locator('#strengthDemoWrap')).toBeVisible();
});

test('typing a weak password into strength demo shows fast crack estimate', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  await page.click('[data-step="6"]');
  await page.fill('#strengthInput', '123');
  const result = await page.locator('#strengthResult').textContent();
  expect(result.toLowerCase()).toMatch(/pattern|common|short|simple|cracked|minute|hour/);
});

test('typing a strong password into strength demo shows slow crack estimate', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  await page.click('[data-step="6"]');
  await page.fill('#strengthInput', 'correct-horse-battery-staple-42!');
  const result = await page.locator('#strengthResult').textContent();
  expect(result.toLowerCase()).toMatch(/centur|million year/);
});

// ── Feature C: Scenario delta highlight ──────────────────────────────────────
test('switching to salted adds delta-new class to salt formula blocks', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="plain"]');
  await page.click('[data-step="1"]');
  await page.click('[data-scenario="salted"]');
  // salt block should briefly have delta-new class
  await expect(page.locator('.formula-block.salt.delta-new').first()).toBeVisible();
});

// ── Feature D: Quiz ───────────────────────────────────────────────────────────
test('quiz button visible on last attack step of plain', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="7"]');
  await expect(page.locator('#btnQuiz')).toBeVisible();
});

test('quiz panel is hidden by default', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#quizPanel')).toBeHidden();
});

test('clicking quiz button shows quiz panel', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="7"]');
  await page.click('#btnQuiz');
  await expect(page.locator('#quizPanel')).toBeVisible();
});

test('quiz panel contains at least one question', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="7"]');
  await page.click('#btnQuiz');
  await expect(page.locator('#quizPanel .quiz-question').first()).toBeVisible();
});

test('quiz shows score after submitting answers', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="7"]');
  await page.click('#btnQuiz');
  // select first option of every question
  const questions = page.locator('#quizPanel .quiz-question');
  const count = await questions.count();
  for (let i = 0; i < count; i++) {
    await questions.nth(i).locator('input[type=radio]').first().check();
  }
  await page.click('#btnQuizSubmit');
  await expect(page.locator('#quizScore')).toBeVisible();
});

test('quiz close button hides panel', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="7"]');
  await page.click('#btnQuiz');
  await page.click('#btnQuizClose');
  await expect(page.locator('#quizPanel')).toBeHidden();
});

// ── Feature E: Breach scale counter ──────────────────────────────────────────
test('plain step 6 shows a breach counter element', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  await expect(page.locator('#breachCounterWrap')).toBeVisible();
});

test('breach counter starts at 0 and reaches target', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="6"]');
  // wait for counter to animate
  await expect.poll(async () => {
    const txt = await page.locator('#breachCounterValue').textContent();
    return parseInt(txt.replace(/,/g, ''), 10);
  }, { timeout: 5000 }).toBeGreaterThan(0);
});

// ── Feature F: Cross-scenario summary table ───────────────────────────────────
test('summary button is visible in toolbar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnSummary')).toBeVisible();
});

test('summary panel is hidden by default', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#summaryPanel')).toBeHidden();
});

test('clicking summary button shows summary panel', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnSummary');
  await expect(page.locator('#summaryPanel')).toBeVisible();
});

test('summary panel shows all 4 scenarios as columns', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnSummary');
  await expect(page.locator('#summaryPanel')).toContainText('Plain');
  await expect(page.locator('#summaryPanel')).toContainText('Salted');
  await expect(page.locator('#summaryPanel')).toContainText('Peppered');
  await expect(page.locator('#summaryPanel')).toContainText('Argon2id');
});

test('summary panel shows attack vector rows', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnSummary');
  await expect(page.locator('#summaryPanel')).toContainText(/rainbow|brute force/i);
});

test('keyboard s toggles summary panel', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('s');
  await expect(page.locator('#summaryPanel')).toBeVisible();
  await page.keyboard.press('s');
  await expect(page.locator('#summaryPanel')).toBeHidden();
});

test('Escape closes summary panel', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnSummary');
  await page.keyboard.press('Escape');
  await expect(page.locator('#summaryPanel')).toBeHidden();
});

// ── Feature G: Copy-link button ───────────────────────────────────────────────
test('copy-link button is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnCopyLink')).toBeVisible();
});

test('clicking copy-link copies current permalink to clipboard', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="2"]');
  let copied = '';
  await page.exposeFunction('__captureClipboard', (t) => { copied = t; });
  await page.evaluate(() => { navigator.clipboard.writeText = (t) => window.__captureClipboard(t); });
  await page.click('#btnCopyLink');
  await expect.poll(() => copied).toContain('#plain/2');
});

// ── Feature H: Presentation mode ─────────────────────────────────────────────
test('present button is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnPresent')).toBeVisible();
});

test('keyboard p starts presentation mode and adds class to body', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('p');
  await expect(page.locator('body')).toHaveClass(/presenting/);
});

test('pressing Escape stops presentation mode', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('p');
  await expect(page.locator('body')).toHaveClass(/presenting/);
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/presenting/);
});

test('presentation mode auto-advances to next step', async ({ page }) => {
  await page.goto('/');
  // speed up timer for testing via page injection
  await page.evaluate(() => { window.__PRESENT_INTERVAL_MS = 200; });
  await page.keyboard.press('p');
  await expect.poll(async () => {
    return page.locator('#stepCounter').textContent();
  }, { timeout: 3000 }).toContain('Step 2');
});

// ── Feature I: Mobile swipe ───────────────────────────────────────────────────
test('swipe left advances to next step', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const el = document.querySelector('.main-panel');
    el.dispatchEvent(new TouchEvent('touchstart', { touches: [new Touch({ identifier: 1, target: el, clientX: 300, clientY: 200 })] }));
    el.dispatchEvent(new TouchEvent('touchend',   { changedTouches: [new Touch({ identifier: 1, target: el, clientX: 80,  clientY: 200 })] }));
  });
  await expect(page.locator('#stepCounter')).toContainText('Step 2');
});

test('swipe right goes back to previous step', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnNext');
  await page.evaluate(() => {
    const el = document.querySelector('.main-panel');
    el.dispatchEvent(new TouchEvent('touchstart', { touches: [new Touch({ identifier: 1, target: el, clientX: 80,  clientY: 200 })] }));
    el.dispatchEvent(new TouchEvent('touchend',   { changedTouches: [new Touch({ identifier: 1, target: el, clientX: 300, clientY: 200 })] }));
  });
  await expect(page.locator('#stepCounter')).toContainText('Step 1');
});

// ── Feature J: Dark / light mode toggle ──────────────────────────────────────
test('theme toggle button is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnTheme')).toBeVisible();
});

test('clicking theme button adds light-mode class to body', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnTheme');
  await expect(page.locator('body')).toHaveClass(/light-mode/);
});

test('clicking theme button again removes light-mode class', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnTheme');
  await page.click('#btnTheme');
  await expect(page.locator('body')).not.toHaveClass(/light-mode/);
});

// ── Feature K: JSON-LD structured data ───────────────────────────────────────
test('page has JSON-LD script in head', async ({ page }) => {
  await page.goto('/');
  const exists = await page.locator('head script[type="application/ld+json"]').count();
  expect(exists).toBeGreaterThan(0);
});

test('JSON-LD contains HowTo schema type', async ({ page }) => {
  await page.goto('/');
  const json = await page.locator('head script[type="application/ld+json"]').textContent();
  const data = JSON.parse(json);
  expect(data['@type']).toBe('HowTo');
});

// ── Feature L: noscript fallback ─────────────────────────────────────────────
test('page has noscript element with content', async ({ page }) => {
  await page.goto('/');
  const content = await page.locator('noscript').textContent();
  expect(content.trim().length).toBeGreaterThan(20);
});

// ── Feature M: Service worker ─────────────────────────────────────────────────
test('service worker file is served at /sw.js', async ({ page }) => {
  const response = await page.goto('/sw.js');
  expect(response.status()).toBe(200);
});

test('page registers a service worker on load', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null ||
    navigator.serviceWorker.getRegistration('/').then(r => r !== undefined), { timeout: 5000 });
  const registered = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration('/');
    return !!reg;
  });
  expect(registered).toBe(true);
});


// ═══════════════════════════════════════════════════════════════════════════════
// ENHANCEMENT TESTS — ROUND 2 (12 features: A–K, M)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Feature A: Quiz on all 4 scenarios ──────────────────────────────────────
test('quiz button visible on last attack step of salted', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await page.click('[data-step="6"]');
  await expect(page.locator('#btnQuiz')).toBeVisible();
});

test('quiz button visible on last attack step of peppered', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  await page.click('[data-step="6"]');
  await expect(page.locator('#btnQuiz')).toBeVisible();
});

test('quiz button visible on last attack step of argon2', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  await page.click('[data-step="6"]');
  await expect(page.locator('#btnQuiz')).toBeVisible();
});

test('salted quiz has scenario-specific question about salt', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await page.click('[data-step="6"]');
  await page.click('#btnQuiz');
  await expect(page.locator('#quizPanel')).toContainText(/salt/i);
});

test('argon2 quiz has scenario-specific question about memory', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  await page.click('[data-step="6"]');
  await page.click('#btnQuiz');
  await expect(page.locator('#quizPanel')).toContainText(/memory|RAM|Argon2/i);
});

// ── Feature B: Scenario progress tracker ────────────────────────────────────
test('scenario tab shows completion check after visiting all steps', async ({ page }) => {
  await page.goto('/');
  // visit all 8 plain steps
  for (let i = 0; i < 8; i++) await page.click(`[data-step="${i}"]`);
  await expect(page.locator('[data-scenario="plain"] .scenario-check')).toBeVisible();
});

test('progress counter shows completed count', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#progressCounter')).toContainText('0');
});

test('completion state persists across page reload', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 8; i++) await page.click(`[data-step="${i}"]`);
  await page.evaluate(async () => { const regs = await navigator.serviceWorker.getRegistrations(); for (const r of regs) await r.unregister(); });
  await page.goto('/');
  await expect(page.locator('[data-scenario="plain"] .scenario-check')).toBeVisible();
});

// ── Feature C: Guided tour ──────────────────────────────────────────────────
test('first-time visitor sees tour overlay', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('http://localhost:3010/');
  await expect(page.locator('#tourOverlay')).toBeVisible();
  await ctx.close();
});

test('tour has multiple steps and next button advances', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('http://localhost:3010/');
  await expect(page.locator('#tourOverlay')).toBeVisible();
  const step1 = await page.locator('#tourStep').textContent();
  await page.click('#tourNext');
  const step2 = await page.locator('#tourStep').textContent();
  expect(step1).not.toBe(step2);
  await ctx.close();
});

test('tour does not appear on return visit', async ({ page }) => {
  // beforeEach already sets tourSeen=1 via addInitScript
  await page.goto('/');
  await expect(page.locator('#tourOverlay')).toBeHidden();
});

// ── Feature D: zxcvbn-lite password strength ────────────────────────────────
test('strength demo shows pattern feedback for dictionary word', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  await page.click('[data-step="6"]');
  await page.fill('#strengthInput', 'password');
  await expect(page.locator('#strengthResult')).toContainText(/common|dictionary/i);
});

test('strength demo identifies keyboard pattern', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  await page.click('[data-step="6"]');
  await page.fill('#strengthInput', 'qwerty123');
  await expect(page.locator('#strengthResult')).toContainText(/keyboard|pattern|common/i);
});

test('strength demo shows strong result for complex password', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="argon2"]');
  await page.click('[data-step="6"]');
  await page.fill('#strengthInput', 'j#9Kx!mP2vR$wL7q');
  await expect(page.locator('#strengthResult')).toContainText(/centuries|decades|years/i);
});

// ── Feature E: Side-by-side dual view ───────────────────────────────────────
test('dual view button visible in toolbar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnDual')).toBeVisible();
});

test('clicking dual view opens split panel with two scenario selectors', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnDual');
  await expect(page.locator('#dualPanel')).toBeVisible();
  await expect(page.locator('#dualPanel select').first()).toBeVisible();
});

test('dual view shows data for both selected scenarios', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnDual');
  await expect(page.locator('#dualPanel .dual-col')).toHaveCount(2);
});

// ── Feature F: ARIA landmarks & accessibility ───────────────────────────────
test('main content area has role main', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[role="main"]')).toBeVisible();
});

test('wizard panel has role navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[role="navigation"]')).toBeVisible();
});

test('icon buttons have aria-label attributes', async ({ page }) => {
  await page.goto('/');
  const btns = ['#btnPrev', '#btnNext', '#btnReset', '#btnCompare', '#btnTheme', '#btnPrint'];
  for (const sel of btns) {
    const label = await page.locator(sel).getAttribute('aria-label');
    expect(label).toBeTruthy();
  }
});

test('step description has aria-live polite', async ({ page }) => {
  await page.goto('/');
  const live = await page.locator('.step-description').getAttribute('aria-live');
  expect(live).toBe('polite');
});

test('keyboard focus outlines are visible on buttons', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const outlineStyle = await page.evaluate(() => {
    const el = document.querySelector(':focus');
    if (!el) return '';
    return window.getComputedStyle(el).outlineStyle;
  });
  expect(outlineStyle).not.toBe('none');
  expect(outlineStyle).not.toBe('');
});

// ── Feature G: i18n — 5 languages ──────────────────────────────────────────
test('language selector is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#langSelector')).toBeVisible();
});

test('switching to zh-TW changes step counter text', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#langSelector', 'zh-TW');
  const text = await page.locator('#stepCounter').textContent();
  expect(text).toMatch(/步驟/);
});

test('switching to zh-CN changes step counter text', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#langSelector', 'zh-CN');
  const text = await page.locator('#stepCounter').textContent();
  expect(text).toMatch(/步骤/);
});

test('switching to fr changes step counter text', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#langSelector', 'fr');
  const text = await page.locator('#stepCounter').textContent();
  expect(text).toMatch(/Étape/i);
});

test('switching to ja changes step counter text', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#langSelector', 'ja');
  const text = await page.locator('#stepCounter').textContent();
  expect(text).toMatch(/ステップ/);
});

test('language preference persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#langSelector', 'ja');
  await page.evaluate(async () => { const regs = await navigator.serviceWorker.getRegistrations(); for (const r of regs) await r.unregister(); });
  await page.goto('/');
  const text = await page.locator('#stepCounter').textContent();
  expect(text).toMatch(/ステップ/);
});

test('switching to zh-TW changes scenario button text', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#langSelector', 'zh-TW');
  await expect(page.locator('[data-scenario="plain"]')).toContainText(/純雜湊/);
});

test('switching to fr changes toolbar button text', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#langSelector', 'fr');
  await expect(page.locator('#btnNext')).toContainText(/Suivant/i);
});

// ── Feature H: localStorage persistence ─────────────────────────────────────
test('theme preference persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnTheme');
  await expect(page.locator('body')).toHaveClass(/light-mode/);
  await page.evaluate(async () => { const regs = await navigator.serviceWorker.getRegistrations(); for (const r of regs) await r.unregister(); });
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/light-mode/);
});

test('last scenario+step persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="salted"]');
  await page.click('[data-step="3"]');
  await page.evaluate(async () => { const regs = await navigator.serviceWorker.getRegistrations(); for (const r of regs) await r.unregister(); });
  await page.goto('/');
  // Resume prompt appears — click to restore
  await page.click('#resumeYes');
  await expect(page.locator('#stepCounter')).toContainText('4');
  await expect(page.locator('[data-scenario="salted"]')).toHaveClass(/active/);
});

test('resume prompt appears on return to unfinished session', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  await page.click('[data-step="4"]');
  await page.evaluate(async () => { const regs = await navigator.serviceWorker.getRegistrations(); for (const r of regs) await r.unregister(); });
  await page.goto('/');
  await expect(page.locator('#resumePrompt')).toBeVisible();
});

test('clicking resume restores last position', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-scenario="peppered"]');
  await page.click('[data-step="4"]');
  await page.evaluate(async () => { const regs = await navigator.serviceWorker.getRegistrations(); for (const r of regs) await r.unregister(); });
  await page.goto('/');
  await page.click('#resumeYes');
  await expect(page.locator('#stepCounter')).toContainText('5');
});

// ── Feature I: Export / Share ────────────────────────────────────────────────
test('export button is visible in toolbar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnExport')).toBeVisible();
});

test('share button is visible in toolbar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnShare')).toBeVisible();
});

test('clicking share opens share menu with links', async ({ page }) => {
  await page.goto('/');
  await page.click('#btnShare');
  await expect(page.locator('#shareMenu')).toBeVisible();
  await expect(page.locator('#shareMenu a')).toHaveCount(2); // WhatsApp + Telegram
});

test('share links contain current permalink', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-step="3"]');
  await page.click('#btnShare');
  const href = await page.locator('#shareMenu a').first().getAttribute('href');
  expect(href).toMatch(/plain(%2F|\/)3/);
});

// ── Feature J: Animated data flow ───────────────────────────────────────────
test('active arrow has animated particle on step 1', async ({ page }) => {
  await page.goto('/');
  const particle = page.locator('.arrow-particle');
  await expect(particle.first()).toBeVisible();
});

test('particle not visible when arrow is inactive', async ({ page }) => {
  await page.goto('/');
  // on step 0, SD arrow is inactive
  const sdParticle = page.locator('#lineSD .arrow-particle');
  await expect(sdParticle).toHaveCount(0);
});

// ── Feature K: Step narration ───────────────────────────────────────────────
test('narrate button is visible in toolbar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btnNarrate')).toBeVisible();
});

test('clicking narrate calls speechSynthesis.speak', async ({ page }) => {
  await page.goto('/');
  let spoken = false;
  await page.evaluate(() => {
    window.speechSynthesis.speak = () => { window.__speechCalled = true; };
  });
  await page.click('#btnNarrate');
  const called = await page.evaluate(() => window.__speechCalled);
  expect(called).toBe(true);
});

// ── Feature M: PWA manifest + favicon ───────────────────────────────────────
test('manifest.json is served', async ({ page }) => {
  const response = await page.goto('/manifest.json');
  expect(response.status()).toBe(200);
});

test('page has link to manifest', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toContain('manifest');
});

test('page has favicon link', async ({ page }) => {
  await page.goto('/');
  const icon = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(icon).toBeTruthy();
});


// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSIVE / MOBILE LAYOUT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Auto-detection & layout switching ───────────────────────────────────────
test('mobile layout activates at 375px viewport width', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await expect(page.locator('.wizard-panel')).toBeHidden();
  await expect(page.locator('#mobileNav')).toBeVisible();
  await ctx.close();
});

test('desktop layout at 1024px has visible wizard panel', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await expect(page.locator('.wizard-panel')).toBeVisible();
  await expect(page.locator('#mobileNav')).toBeHidden();
  await ctx.close();
});

test('tablet layout at 768px hides wizard shows mobile nav', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await expect(page.locator('#mobileNav')).toBeVisible();
  await ctx.close();
});

// ── Mobile bottom navigation ────────────────────────────────────────────────
test('mobile nav has prev, next, and step indicator', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await expect(page.locator('#mobileNav #mobilePrev')).toBeVisible();
  await expect(page.locator('#mobileNav #mobileNext')).toBeVisible();
  await expect(page.locator('#mobileNav #mobileStepIndicator')).toBeVisible();
  await ctx.close();
});

test('mobile nav next button advances step', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await page.click('#mobileNext');
  await expect(page.locator('#mobileStepIndicator')).toContainText('2');
  await ctx.close();
});

test('mobile nav prev button goes back', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await page.click('#mobileNext');
  await page.click('#mobilePrev');
  await expect(page.locator('#mobileStepIndicator')).toContainText('1');
  await ctx.close();
});

// ── Mobile scenario switcher ────────────────────────────────────────────────
test('mobile has scenario selector dropdown', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await expect(page.locator('#mobileScenarioSelect')).toBeVisible();
  await ctx.close();
});

test('mobile scenario selector changes scenario', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await page.selectOption('#mobileScenarioSelect', 'salted');
  await expect(page.locator('#mobileStepIndicator')).toContainText('1');
  await ctx.close();
});

// ── Mobile step drawer ──────────────────────────────────────────────────────
test('mobile has step list toggle button', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await expect(page.locator('#mobileStepListBtn')).toBeVisible();
  await ctx.close();
});

test('clicking step list button shows bottom sheet with all steps', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await page.click('#mobileStepListBtn');
  await expect(page.locator('#mobileStepSheet')).toBeVisible();
  const steps = await page.locator('#mobileStepSheet .mobile-step-item').count();
  expect(steps).toBe(8); // plain has 8 steps
  await ctx.close();
});

test('tapping step in sheet navigates to that step', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await page.click('#mobileStepListBtn');
  await page.click('#mobileStepSheet .mobile-step-item:nth-child(4)');
  await expect(page.locator('#mobileStepIndicator')).toContainText('4');
  await ctx.close();
});

test('bottom sheet dismisses on backdrop click', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await page.click('#mobileStepListBtn');
  await expect(page.locator('#mobileStepSheet')).toBeVisible();
  await page.click('#mobileSheetBackdrop');
  await expect(page.locator('#mobileStepSheet')).toBeHidden();
  await ctx.close();
});

// ── Touch targets & sizing ──────────────────────────────────────────────────
test('mobile nav buttons are at least 44px tall', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  const height = await page.locator('#mobileNext').evaluate(el => el.getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(44);
  await ctx.close();
});

// ── Desktop toolbar hidden on mobile ────────────────────────────────────────
test('desktop toolbar-nav hidden on mobile', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await expect(page.locator('.toolbar-nav')).toBeHidden();
  await ctx.close();
});

// ── Mobile menu button for toolbar actions ──────────────────────────────────
test('mobile has hamburger menu button for extra actions', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await expect(page.locator('#mobileMenuBtn')).toBeVisible();
  await ctx.close();
});

test('mobile menu shows compare, summary, theme, share actions', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  await page.click('#mobileMenuBtn');
  await expect(page.locator('#mobileMenu')).toBeVisible();
  await expect(page.locator('#mobileMenu')).toContainText(/Compare|Summary|Theme|Share/i);
  await ctx.close();
});

// ── Landscape compaction ────────────────────────────────────────────────────
test('landscape mode compacts mobile nav', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 667, height: 375 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('tourSeen', '1'));
  await page.goto('http://localhost:3010/');
  // In landscape, nav should still be functional but compact
  await expect(page.locator('#mobileNav')).toBeVisible();
  const height = await page.locator('#mobileNav').evaluate(el => el.getBoundingClientRect().height);
  expect(height).toBeLessThan(60);
  await ctx.close();
});

// ── Auto-switch on resize ───────────────────────────────────────────────────
test('resizing from desktop to mobile shows mobile nav dynamically', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('#mobileNav')).toBeHidden();
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('#mobileNav')).toBeVisible();
});

test('resizing from mobile to desktop shows wizard panel', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('.wizard-panel')).toBeHidden();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('.wizard-panel')).toBeVisible();
});

