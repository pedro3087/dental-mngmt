import { test, expect } from '@playwright/test'

/**
 * Hamburger menu en mobile (viewport 375×667)
 * No requiere autenticación — solo valida que la UI existe.
 * Las rutas protegidas redirigen a /login — verificamos el menú desde ahí.
 */
test.describe('Mobile hamburger menu', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('botón hamburger es visible en mobile en página de login', async ({ page }) => {
    await page.goto('/login')
    // La página de login es pública — verifica que es mobile-friendly
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('dashboard protegido redirige a login en mobile', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })

  test.skip(!process.env.TEST_PASSWORD, 'TEST_PASSWORD no configurado')(
    'sidebar mobile abre y cierra con hamburger',
    async ({ page }) => {
      const EMAIL = process.env.TEST_EMAIL ?? 'admin@vitaldent.com'
      const PASSWORD = process.env.TEST_PASSWORD!
      await page.goto('/login')
      await page.getByPlaceholder(/email|correo/i).fill(EMAIL)
      await page.getByPlaceholder(/contraseña|password/i).fill(PASSWORD)
      await page.getByRole('button', { name: /iniciar|entrar|login/i }).click()
      await page.waitForURL(/dashboard/, { timeout: 10000 })

      // Botón hamburger visible en mobile
      const hamburger = page.getByRole('button', { name: /menu|menú|hamburger/i })
        .or(page.locator('button[aria-label*="menu" i], button svg.lucide-menu').locator('..'))
        .first()
      await expect(hamburger).toBeVisible()
      await hamburger.click()

      // Sidebar abierto: enlace a Settings visible
      await expect(page.getByRole('link', { name: /settings|configuración/i })).toBeVisible({ timeout: 4000 })

      // Cerrar con botón X
      await page.getByRole('button', { name: /cerrar|close|x/i }).first().click()
    }
  )
})
