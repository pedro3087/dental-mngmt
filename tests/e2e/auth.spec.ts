import { test, expect } from '@playwright/test'

/**
 * Autenticación: login, logout
 * Usa credenciales de demo de .env.local (TEST_EMAIL / TEST_PASSWORD)
 * o fallback a variables de entorno del CI.
 */
const EMAIL = process.env.TEST_EMAIL ?? 'admin@vitaldent.com'
const PASSWORD = process.env.TEST_PASSWORD ?? ''

test.describe('Auth flow', () => {
  test('página de login carga correctamente', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /iniciar sesión|bienvenido|login/i })).toBeVisible()
    await expect(page.getByPlaceholder(/email|correo/i)).toBeVisible()
    await expect(page.getByPlaceholder(/contraseña|password/i)).toBeVisible()
  })

  test('credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/email|correo/i).fill('invalido@test.com')
    await page.getByPlaceholder(/contraseña|password/i).fill('wrong123')
    await page.getByRole('button', { name: /iniciar|entrar|login/i }).click()
    await expect(page.getByText(/inválid|incorrecto|error|invalid/i)).toBeVisible({ timeout: 6000 })
  })

  test.skip(!PASSWORD, 'TEST_PASSWORD no configurado')('login exitoso redirige al dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/email|correo/i).fill(EMAIL)
    await page.getByPlaceholder(/contraseña|password/i).fill(PASSWORD)
    await page.getByRole('button', { name: /iniciar|entrar|login/i }).click()
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
  })

  test.skip(!PASSWORD, 'TEST_PASSWORD no configurado')('botón cerrar sesión cierra la sesión', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByPlaceholder(/email|correo/i).fill(EMAIL)
    await page.getByPlaceholder(/contraseña|password/i).fill(PASSWORD)
    await page.getByRole('button', { name: /iniciar|entrar|login/i }).click()
    await page.waitForURL(/dashboard/, { timeout: 10000 })
    // Logout — botón en sidebar
    await page.getByRole('button', { name: /cerrar sesión|log out|salir/i }).click()
    await expect(page).toHaveURL(/login/, { timeout: 8000 })
  })
})
