import { test, expect } from '@playwright/test';

test.describe('FLH-FE-01: Dashboard de Clientes y Publicación Reactiva de Convocatoria', () => {
  test('1. Muestra el Navbar con avatar, nombre, saldo/tarjeta y botón + Nueva Convocatoria', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    await expect(page.getByTestId('navbar-user-avatar')).toBeVisible();
    await expect(page.getByTestId('navbar-wallet-card')).toBeVisible();
    const newBtn = page.getByTestId('btn-nueva-convocatoria');
    await expect(newBtn).toBeVisible();
    await expect(newBtn).toContainText('+ Nueva Convocatoria');
  });

  test('2. Escenario 2: Resalta campos inválidos y alerta si hay menos de 3 habilidades', async ({
    page,
  }) => {
    await page.goto('/projects/new');

    // Alerta inicial de menos de 3 habilidades activa en tiempo real
    const skillsAlert = page.getByTestId('skills-min-alert');
    await expect(skillsAlert).toBeVisible();
    await expect(page.getByTestId('skills-counter')).toContainText('0 / 3');

    //Seleccionar solo 2 habilidades -> sigue mostrando alerta
    await page.getByTestId('skill-chip-React').click();
    await page.getByTestId('skill-chip-TypeScript').click();
    await expect(page.getByTestId('skills-counter')).toContainText('2 / 3');
    await expect(skillsAlert).toBeVisible();

    // Intentar enviar con campos vacíos y < 3 habilidades
    await page.getByTestId('btn-submit-convocatoria').click();

    await expect(page.getByTestId('form-error-banner')).toBeVisible();
    await expect(page.getByTestId('error-title')).toBeVisible();
    await expect(page.getByTestId('error-category')).toBeVisible();
    await expect(page.getByTestId('error-budget')).toBeVisible();
    await expect(page.getByTestId('error-skills')).toBeVisible();
    await expect(page.getByTestId('error-estimated-date')).toBeVisible();
  });

  test('3. Registra exitosamente una convocatoria y redirige al detalle con badge ABIERTO', async ({
    page,
  }) => {
    await page.goto('/projects/new');

    await page
      .getByTestId('input-title')
      .fill('Sistema Web Reactivo con Pagos Escrow');
    await page.getByTestId('select-category').selectOption('Desarrollo Web');
    await page.getByTestId('input-budget').fill('3200');

    // Seleccionar 3 habilidades interactivas
    await page.getByTestId('skill-chip-React').click();
    await page.getByTestId('skill-chip-TypeScript').click();
    await page.getByTestId('skill-chip-Tailwind CSS').click();

    await expect(page.getByTestId('skills-counter')).toContainText('3 / 3');
    await expect(page.getByTestId('skills-min-alert')).toHaveCount(0);

    // Seleccionar fecha estimada en el datepicker
    await page.getByTestId('input-estimated-date').fill('2026-12-31');

    // Publicar convocatoria
    await page.getByTestId('btn-submit-convocatoria').click();

    // Verificar redirección al detalle del proyecto con badge ABIERTO
    await page.waitForURL((url) => /\/projects\/proj_/.test(url.pathname), {
      timeout: 10000,
    });

    await expect(page.getByTestId('detail-status-badge')).toContainText('ABIERTO');
    await expect(page.getByTestId('detail-title')).toContainText(
      'Sistema Web Reactivo con Pagos Escrow'
    );
  });
});
