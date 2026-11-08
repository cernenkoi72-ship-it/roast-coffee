const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const widths = [360, 768, 1280, 1440];
const fmt = value => new Intl.NumberFormat('ru-RU').format(value).replace(/\s/g, '');
async function captureResponsive(page, slug) {
  fs.mkdirSync(path.join(__dirname, 'artifacts'), { recursive: true });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: path.join(__dirname, 'artifacts', slug + '-' + width + '.png'), fullPage: true });
  }
}

test('поиск, фильтрация, пустой результат, сортировка', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.product-card')).toHaveCount(8);
  await page.locator('[data-filter="light"]').click();
  await expect(page.locator('.product-card')).toHaveCount(2);
  await page.locator('#searchInput').fill('Кения');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.locator('#searchInput').fill('несуществующий сорт');
  await expect(page.locator('.product-card')).toHaveCount(0);
  await expect(page.locator('.empty-results')).toBeVisible();
  await page.locator('#searchInput').fill('');
  await page.locator('[data-filter="all"]').click();
  await page.locator('#sortSelect').selectOption('low');
  await expect(page.locator('.product-card').first()).toContainText('Бразилия Сантос');
});
test('корзина: цены, доставка, демо-заказ без оплаты', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-add="ethiopia"]').click();
  await page.locator('#cartOpen').click();
  await expect(page.locator('#subtotal')).toContainText(/990\s*₽/);
  await expect(page.locator('#shipping')).toContainText(/350\s*₽/);
  await expect(page.locator('#grandTotal')).toContainText(/1\s*340\s*₽/);
  for (let i = 0; i < 3; i++) await page.locator('[data-action="plus"]').first().click();
  await expect(page.locator('#subtotal')).toContainText(/3\s*960\s*₽/);
  await expect(page.locator('#shipping')).toHaveText('Бесплатно');
  await page.locator('#checkoutButton').click();
  await expect(page.locator('#orderDialog')).toBeVisible();
  await expect(page.locator('#orderText')).toHaveValue(/Это демонстрационный заказ/);
  await expect(page.locator('#orderText')).toHaveValue(/Заказ никуда не отправлен/);
});
test('корзина: клавиатура, Escape, сохранение', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-add="kenya"]').click();
  await page.reload();
  await expect(page.locator('#cartCount')).toHaveText('1');
  await page.locator('#cartOpen').click();
  await expect(page.locator('#cartClose')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#cartOpen')).toBeFocused();
  await expect(page.locator('#cartDrawer')).toHaveAttribute('aria-hidden', 'true');
});
test('адаптивность и полноразмерные базовые скриншоты', async ({ page }) => { await captureResponsive(page, 'roast'); });
