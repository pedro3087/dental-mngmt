import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VitalDent',
  description: 'Sistema Integral para Clínicas Dentales',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
