import { test, expect } from '@playwright/test'

/**
 * Landing pública de reservas (/book)
 * - Flujo de 3 pasos: servicio → fecha/hora → datos del paciente
 * - No requiere autenticación
 */
test.describe('Booking public page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book')
  })

  test('muestra el título y los servicios disponibles', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible()
    // Al menos 1 tarjeta de servicio visible
    const cards = page.locator('[data-testid="service-card"], button').filter({ hasText: /consulta|limpieza|blanqueamiento|ortodoncia|extracción|implante/i })
    await expect(cards.first()).toBeVisible()
  })

  test('paso 1 → seleccionar servicio avanza al paso 2', async ({ page }) => {
    const firstService = page.getByRole('button').filter({ hasText: /consulta|limpieza|blanqueamiento|ortodoncia|extracción|implante/i }).first()
    await firstService.click()
    // Paso 2: selector de fecha/hora
    await expect(page.getByText(/selecciona|elige.*fecha|fecha.*hora/i)).toBeVisible({ timeout: 5000 })
  })

  test('paso 2 → seleccionar slot avanza al paso 3', async ({ page }) => {
    // Seleccionar primer servicio
    await page.getByRole('button').filter({ hasText: /consulta|limpieza|blanqueamiento|ortodoncia|extracción|implante/i }).first().click()
    // Esperar slots — click en cualquier slot habilitado
    const slot = page.getByRole('button').filter({ hasText: /^\d{1,2}:\d{2}$/ }).first()
    await slot.waitFor({ timeout: 8000 })
    await slot.click()
    // Paso 3: formulario de datos
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 5000 })
  })

  test('paso 3 → formulario tiene campos nombre, email y teléfono', async ({ page }) => {
    await page.getByRole('button').filter({ hasText: /consulta|limpieza|blanqueamiento|ortodoncia|extracción|implante/i }).first().click()
    const slot = page.getByRole('button').filter({ hasText: /^\d{1,2}:\d{2}$/ }).first()
    await slot.waitFor({ timeout: 8000 })
    await slot.click()
    await expect(page.getByPlaceholder(/nombre/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByPlaceholder(/email|correo/i)).toBeVisible()
    await expect(page.getByPlaceholder(/teléfono|celular|phone/i)).toBeVisible()
  })

  test('navegar atrás desde paso 2 regresa al paso 1', async ({ page }) => {
    await page.getByRole('button').filter({ hasText: /consulta|limpieza|blanqueamiento|ortodoncia|extracción|implante/i }).first().click()
    await page.getByRole('button', { name: /atrás|volver|back/i }).click()
    // Debe volver a mostrar servicios
    await expect(page.getByRole('button').filter({ hasText: /consulta|limpieza|blanqueamiento|ortodoncia|extracción|implante/i }).first()).toBeVisible()
  })
})
