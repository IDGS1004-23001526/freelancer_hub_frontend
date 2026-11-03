import { test, expect } from '@playwright/test';

test.describe('Flujo E2E Completo: Registro, Login y Onboarding', () => {
  const timestamp = Date.now();
  const testUser = {
    fullName: `Tester Auto ${timestamp}`,
    email: `tester_${timestamp}@example.com`,
    password: 'Password123!',
  };

  test('1. Debe registrar un nuevo freelancer y navegar al onboarding', async ({ page }) => {
    await page.goto('/register');

    // Validar carga de página
    await expect(page).toHaveTitle(/Freelancer/i);

    // Llenar formulario de registro
    await page.fill('input[id="fullName"], input[name="fullName"], input[placeholder*="nombre" i]', testUser.fullName);
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[id="password"], input[name="password"]', testUser.password);
    
    const confirmInput = page.locator('input[id*="confirm" i], input[name*="confirm" i]');
    if (await confirmInput.count() > 0) {
      await confirmInput.first().fill(testUser.password);
    }

    // Aceptar términos si existe checkbox
    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.first().check();
    }

    // Enviar registro
    await page.click('button[type="submit"]');

    // Esperar redirección o persistencia de sesión
    await page.waitForURL(url => url.pathname.includes('/onboarding') || url.pathname.includes('/login'), { timeout: 10000 });
  });

  test('2. Debe iniciar sesión con el usuario creado', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Esperar navegación exitosa
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
  });
});
