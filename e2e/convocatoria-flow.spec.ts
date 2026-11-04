import { test, expect } from '@playwright/test';

test.describe('FREEL-37 (HU-01): Formulario de Creación de Convocatorias - CreateProjectPage', () => {
  test('1. Deshabilita el botón de enviar mientras haya errores de validación en vivo', async ({
    page,
  }) => {
    await page.goto('/projects/new');

    const submitBtn = page.getByTestId('btn-submit-convocatoria');
    await expect(submitBtn).toBeDisabled();

    // Título menor a 10 caracteres muestra error en vivo
    await page.getByTestId('input-title').fill('Corto');
    await expect(page.getByTestId('error-title')).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Descripción menor a 30 caracteres muestra error en vivo
    await page.getByTestId('input-description').fill('Descripción muy breve');
    await expect(page.getByTestId('error-description')).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Presupuesto <= 0 muestra error en vivo
    await page.getByTestId('input-budget').fill('0');
    await expect(page.getByTestId('error-budget')).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Seleccionar solo 2 habilidades mantiene la alerta y botón deshabilitado
    await page.getByTestId('skill-chip-React').click();
    await page.getByTestId('skill-chip-Node').click();
    await expect(page.getByTestId('skills-counter')).toContainText('2 / 3');
    await expect(page.getByTestId('skills-min-alert')).toBeVisible();
    await expect(submitBtn).toBeDisabled();
  });

  test('2. Habilita el envío al cumplir las 5 validaciones, envía POST /api/v1/projects con JWT y redirige al feed', async ({
    page,
  }) => {
    // Simular token JWT en localStorage
    await page.addInitScript(() => {
      localStorage.setItem('fh_access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_jwt_token');
    });

    let capturedAuthHeader: string | undefined;
    await page.route('**/api/v1/projects', async (route) => {
      if (route.request().method() === 'POST') {
        capturedAuthHeader = route.request().headers()['authorization'];
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'proj_freel37',
              ...body,
              status: 'ABIERTO',
              clientName: 'Sofía Ramírez • Estudio Nexus',
              proposalsCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/projects/new');

    const submitBtn = page.getByTestId('btn-submit-convocatoria');
    await expect(submitBtn).toBeDisabled();

    // 1. Título (>= 10 caracteres)
    await page
      .getByTestId('input-title')
      .fill('Desarrollo de Plataforma Fintech con Pagos Escrow');

    // 2. Descripción detallada (>= 30 caracteres)
    await page
      .getByTestId('input-description')
      .fill(
        'Requerimos construir el frontend en React y backend en Node con PostgreSQL e integración de pagos protegidos.'
      );

    // 3. Presupuesto estimado en MXN (> 0)
    await page.getByTestId('input-budget').fill('45000');

    // 4. Fecha estimada posterior a hoy
    await page.getByTestId('input-estimated-date').fill('2027-12-31');

    // 5. Mínimo 3 tags de habilidades (React, Node, PostgreSQL)
    await page.getByTestId('skill-chip-React').click();
    await page.getByTestId('skill-chip-Node').click();
    await page.getByTestId('skill-chip-PostgreSQL').click();

    await expect(page.getByTestId('skills-counter')).toContainText('3 / 3');
    await expect(submitBtn).toBeEnabled();

    await submitBtn.click();

    // Redirección al feed (/projects) y verificación de JWT enviado
    await page.waitForURL((url) => url.pathname === '/projects', {
      timeout: 10000,
    });

    expect(capturedAuthHeader).toContain('Bearer ');
    await expect(page.getByTestId('convocatoria-created-banner')).toBeVisible();
  });
});
