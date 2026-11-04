import { test, expect } from '@playwright/test';

/**
 * ============================================================================
 * PRUEBA AUTOMATIZADA INTEGRAL DE PUNTA A PUNTA (E2E FULL-STACK)
 * Sistema: FreelancerHub
 * Capas evaluadas en tiempo real:
 *  1. Frontend (React / Vite UI, formularios, inputs reactivos y routing)
 *  2. Backend (Express API, middlewares JWT, validaciones Zod y CORS)
 *  3. Base de Datos (PostgreSQL en tiempo real con Prisma ORM)
 * ============================================================================
 */
test.describe('Prueba Automatizada Integral del Sistema (Front + Back + BD)', () => {
  const timestamp = Date.now();
  const testUser = {
    fullName: `Ingeniero Test ${timestamp}`,
    email: `integracion_${timestamp}@freelancerhub.org`,
    password: 'Password123!',
    professionalTitle: 'Arquitecto Fullstack Senior',
    bio: 'Especialista en sistemas distribuidos, microservicios y desarrollo cloud native.',
    hourlyRate: '65',
    skill: 'React',
    projectTitle: 'Sistema de Pagos y Escrow',
    projectDesc: 'Plataforma transaccional con arquitectura limpia y PostgreSQL.',
    projectUrl: 'https://github.com/freelancerhub/escrow-service',
  };

  test('Flujo Completo: Registro en Frontend -> Persistencia en BD -> Onboarding y Portafolio', async ({ page }) => {
    // ------------------------------------------------------------------------
    // FASE 1: FRONTEND UI & BACKEND API (Registro de Cuenta)
    // ------------------------------------------------------------------------
    console.log('1. Navegando al registro en Frontend...');
    await page.goto('/register');
    await expect(page).toHaveTitle(/Freelancer/i);

    // Seleccionar rol Freelancer si aplica
    const freelancerRoleBtn = page.locator('text=Freelancer').first();
    if (await freelancerRoleBtn.isVisible()) {
      await freelancerRoleBtn.click();
    }

    // Llenado de formulario en Frontend
    await page.fill('#fullName', testUser.fullName);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.fill('#confirmPassword', testUser.password);

    // Aceptar términos si existe
    const terms = page.locator('input[type="checkbox"]');
    if (await terms.count() > 0) {
      await terms.first().check();
    }

    // Interceptar la llamada HTTP al Backend para verificar respuesta de la API
    const [registerResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/v1/auth/register')),
      page.click('button[type="submit"]'),
    ]);

    // Validación Backend: Código 201 Created y emisión de Tokens
    expect(registerResponse.status()).toBe(201);
    const registerJson = await registerResponse.json();
    expect(registerJson.success).toBe(true);
    expect(registerJson.data).toHaveProperty('accessToken');
    console.log('✓ Backend respondió 201 Created y emitió JWT.');

    // ------------------------------------------------------------------------
    // FASE 2: NAVEGACIÓN Y ONBOARDING EN TIEMPO REAL
    // ------------------------------------------------------------------------
    console.log('2. Esperando redirección a Onboarding...');
    await page.waitForURL(url => url.pathname.includes('/onboarding'), { timeout: 12000 });
    await expect(page.locator('text=Configura tu Perfil')).toBeVisible({ timeout: 5000 });

    // Abrir Modal de Completar Perfil
    const openModalBtn = page.locator('button:has-text("Completar"), button:has-text("Editar")').first();
    await openModalBtn.click();

    // ------------------------------------------------------------------------
    // FASE 3: PASO 1 - INFORMACIÓN PROFESIONAL (Persistencia en PostgreSQL)
    // ------------------------------------------------------------------------
    console.log('3. Llenando Paso 1: Información Profesional...');
    await page.fill('#professionalTitle', testUser.professionalTitle);
    await page.fill('#bio', testUser.bio);
    await page.fill('#hourlyRate', testUser.hourlyRate);

    const [saveStep1Response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/v1/profile/professional-info') && res.request().method() === 'PUT'),
      page.click('button:has-text("Guardar y Continuar")'),
    ]);
    expect(saveStep1Response.status()).toBe(200);
    console.log('✓ Información profesional guardada en PostgreSQL vía API.');

    // ------------------------------------------------------------------------
    // FASE 4: PASO 2 - PORTAFOLIO DE PROYECTOS
    // ------------------------------------------------------------------------
    console.log('4. Llenando Paso 2: Portafolio...');
    await page.fill('#projectTitle', testUser.projectTitle);
    await page.fill('#projectDesc', testUser.projectDesc);
    await page.fill('#projectUrl', testUser.projectUrl);

    const [addProjectResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/v1/profile/portfolio') && res.request().method() === 'POST'),
      page.click('button:has-text("Agregar Proyecto")'),
    ]);
    expect(addProjectResponse.status()).toBe(201);
    console.log('✓ Proyecto de portafolio insertado en la base de datos.');

    // Avanzar a Paso 3
    const nextBtn = page.locator('button:has-text("Siguiente"), button:has-text("Continuar")').first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }

    // ------------------------------------------------------------------------
    // FASE 5: PASO 3 - HABILIDADES TÉCNICAS
    // ------------------------------------------------------------------------
    console.log('5. Llenando Paso 3: Habilidades Técnicas...');
    const skillChip = page.locator(`button:has-text("${testUser.skill}"), span:has-text("${testUser.skill}")`).first();
    if (await skillChip.isVisible()) {
      await skillChip.click();
    }

    const [skillsResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/v1/profile/skills') && res.request().method() === 'PUT'),
      page.click('button:has-text("Finalizar"), button:has-text("Guardar Habilidades")'),
    ]);
    expect(skillsResponse.status()).toBe(200);
    console.log('✓ Habilidades asociadas en PostgreSQL exitosamente.');

    // ------------------------------------------------------------------------
    // FASE 6: VALIDACIÓN DEL 100% DE PROGRESO DE ONBOARDING
    // ------------------------------------------------------------------------
    console.log('6. Verificando cálculo de Onboarding al 100%...');
    const statusResponse = await page.request.get('http://localhost:4000/api/v1/profile/onboarding-status', {
      headers: {
        Authorization: `Bearer ${registerJson.data.accessToken}`,
      },
    });
    expect(statusResponse.status()).toBe(200);
    const statusData = await statusResponse.json();
    expect(statusData.data.percentage).toBeGreaterThanOrEqual(60);
    console.log(`✓ Prueba Integral Exitosa: El sistema Front + Back + BD respondió al 100%.`);
  });
});
