import { test, expect } from '@playwright/test';

test.describe('FREEL-45 (HU-03): Modal para Postular Propuesta Económica', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'fh_access_token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_freelancer_jwt'
      );
      localStorage.setItem(
        'fh_user',
        JSON.stringify({
          id: 'free_e2e_01',
          email: 'axel@freelancehub.mx',
          fullName: 'Axel Rocha',
          role: 'FREELANCER',
        })
      );
    });
  });

  test('Valida presupuesto, hasta 3 URLs, desglose de hitos, previene doble envío, muestra Toast y marca proyecto como postulado', async ({
    page,
  }) => {
    let postCallCount = 0;
    let capturedPayload: Record<string, unknown> | null = null;

    await page.route('**/api/v1/proposals', async (route) => {
      if (route.request().method() === 'POST') {
        postCallCount += 1;
        capturedPayload = route.request().postDataJSON();
        // Retardo breve para verificar estado de envío y botón deshabilitado
        await new Promise((resolve) => setTimeout(resolve, 350));
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            statusCode: 201,
            message: 'Propuesta económica registrada exitosamente',
            data: {
              id: 'prop_freel45_01',
              projectId: capturedPayload?.projectId,
              freelancerId: 'free_e2e_01',
              coverLetter: capturedPayload?.coverLetter,
              totalPrice: capturedPayload?.totalPrice,
              estimatedDays: capturedPayload?.estimatedDays,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
              milestones: [
                {
                  id: 'ms_1',
                  title: 'Arquitectura inicial y API REST',
                  amount: 1800,
                  deliveryDays: 10,
                  order: 1,
                },
                {
                  id: 'ms_2',
                  title: 'Interfaz React y pruebas finales',
                  amount: 2200,
                  deliveryDays: 12,
                  order: 2,
                },
              ],
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/projects/proj_101');
    await expect(page.getByTestId('detail-title')).toBeVisible();

    // Abrir modal desde el detalle de la convocatoria
    const openModalBtn = page.getByTestId('btn-open-submit-proposal');
    await expect(openModalBtn).toBeVisible();
    await openModalBtn.click();

    const modal = page.getByTestId('submit-proposal-modal');
    await expect(modal).toBeVisible();

    const submitBtn = page.getByTestId('btn-submit-proposal');
    await expect(submitBtn).toBeDisabled();

    // 1. Carta de propuesta (>= 20 caracteres)
    await page
      .getByTestId('input-cover-letter')
      .fill(
        'Propongo implementar una arquitectura modular en React y Node.js con PostgreSQL, entregas semanales y cobertura de pruebas automatizadas.'
      );

    // 2. Validar que no exceda el presupuesto del cliente (proj_101 tiene budget = 4500)
    await page.getByTestId('input-total-price').fill('9000');
    await expect(page.getByTestId('error-total-price')).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Corregir monto dentro del presupuesto
    await page.getByTestId('input-total-price').fill('4000');
    await expect(page.getByTestId('error-total-price')).not.toBeVisible();

    // 3. Plazo de entrega en días naturales
    await page.getByTestId('input-estimated-days').fill('22');

    // 4. Hasta 3 URLs de proyectos previos en su portafolio
    await page
      .getByTestId('input-portfolio-url-0')
      .fill('https://github.com/axelrocha/ecommerce-escrow');
    await page.getByTestId('btn-add-portfolio-url').click();
    await page
      .getByTestId('input-portfolio-url-1')
      .fill('https://github.com/axelrocha/fintech-dashboard');
    await page.getByTestId('btn-add-portfolio-url').click();
    await page
      .getByTestId('input-portfolio-url-2')
      .fill('https://github.com/axelrocha/portal-b2b');
    await expect(page.getByTestId('btn-add-portfolio-url')).toBeDisabled();

    // 5. Desglose de hitos cotizados (Título, costo parcial y días)
    await page
      .getByTestId('input-milestone-title-0')
      .fill('Arquitectura inicial y API REST');
    await page.getByTestId('input-milestone-amount-0').fill('1800');
    await page.getByTestId('input-milestone-days-0').fill('10');

    await page.getByTestId('btn-add-milestone').click();
    await page
      .getByTestId('input-milestone-title-1')
      .fill('Interfaz React y pruebas finales');
    await page.getByTestId('input-milestone-amount-1').fill('2200');
    await page.getByTestId('input-milestone-days-1').fill('12');

    await expect(submitBtn).toBeEnabled();

    // Enviar y verificar que el botón se deshabilita mientras envía para evitar dobles postulaciones
    await submitBtn.click();
    await expect(submitBtn).toBeDisabled();

    // Cierre automático del modal y Toast de éxito
    await expect(modal).not.toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('status').filter({ hasText: '¡Propuesta enviada!' })).toBeVisible();

    // Verificar petición POST /api/v1/proposals enviada exactamente 1 vez
    expect(postCallCount).toBe(1);
    expect(capturedPayload).toMatchObject({
      projectId: 'proj_101',
      totalPrice: 4000,
      estimatedDays: 22,
      portfolioUrls: [
        'https://github.com/axelrocha/ecommerce-escrow',
        'https://github.com/axelrocha/fintech-dashboard',
        'https://github.com/axelrocha/portal-b2b',
      ],
    });

    // La vista muestra 'Ya has enviado una propuesta a este proyecto' y oculta el botón de postular
    const alreadyAppliedBanner = page.getByTestId('already-applied-banner');
    await expect(alreadyAppliedBanner).toContainText(
      'Ya has enviado una propuesta a este proyecto'
    );
    await expect(page.getByTestId('btn-open-submit-proposal')).not.toBeVisible();

    // Persiste al recargar la página
    await page.reload();
    await expect(page.getByTestId('already-applied-banner')).toContainText(
      'Ya has enviado una propuesta a este proyecto'
    );
  });
});
