import { test, expect, Page } from '@playwright/test'

/**
 * Settings page (/settings) — requiere auth de admin.
 * Sin TEST_PASSWORD se saltan los tests autenticados.
 */
const EMAIL = process.env.TEST_EMAIL ?? 'admin@vitaldent.com'
const PASSWORD = process.env.TEST_PASSWORD ?? ''

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByPlaceholder(/email|correo/i).fill(email)
  await page.getByPlaceholder(/contraseña|password/i).fill(password)
  await page.getByRole('button', { name: /iniciar|entrar|login/i }).click()
  await page.waitForURL(/dashboard/, { timeout: 10000 })
}

test.describe('Settings page', () => {
  test.skip(!PASSWORD, 'TEST_PASSWORD no configurado')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, EMAIL, PASSWORD)
    await page.goto('/settings')
  })

  const TABS = [
    { id: 'reservas',       label: /reservas/i },
    { id: 'clinica',        label: /clínica/i },
    { id: 'facturacion',    label: /facturación/i },
    { id: 'equipo',         label: /equipo/i },
    { id: 'notificaciones', label: /notificaciones/i },
    { id: 'inventario',     label: /inventario/i },
    { id: 'ia',             label: /ia|inteligencia/i },
  ]

  for (const tab of TABS) {
    test(`tab ${tab.id} carga sin errores`, async ({ page }) => {
      await page.goto(`/settings?tab=${tab.id}`)
      // No debe haber errores de Next.js ni pantalla en blanco
      await expect(page.locator('body')).not.toContainText(/application error|unhandled error/i)
      // El tab activo debe estar visible
      await expect(page.getByRole('link', { name: tab.label })).toBeVisible()
    })
  }

  test('tab Equipo muestra tabla de miembros', async ({ page }) => {
    await page.goto('/settings?tab=equipo')
    await expect(page.getByRole('table').or(page.locator('tbody'))).toBeVisible({ timeout: 6000 })
  })

  test('tab Notificaciones tiene campo de saludo del chatbot', async ({ page }) => {
    await page.goto('/settings?tab=notificaciones')
    await expect(page.getByPlaceholder(/hola|saludo|bienvenid|greeting/i).or(
      page.getByLabel(/saludo|greeting|chatbot/i)
    )).toBeVisible({ timeout: 6000 })
  })

  test('tab Inventario tiene toggle de alertas', async ({ page }) => {
    await page.goto('/settings?tab=inventario')
    const toggle = page.getByRole('checkbox').or(page.locator('[role="switch"]')).first()
    await expect(toggle).toBeVisible({ timeout: 6000 })
  })

  test('tab Reservas tiene campos de horario', async ({ page }) => {
    await page.goto('/settings?tab=reservas')
    // Algún input de hora o selector de días
    const hourInput = page.getByLabel(/hora|apertura|cierre|inicio/i).or(
      page.locator('input[type="number"]').first()
    )
    await expect(hourInput).toBeVisible({ timeout: 6000 })
  })
})
