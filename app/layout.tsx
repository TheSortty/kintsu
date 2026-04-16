import type { Metadata } from 'next'
import './globals.css'
import KintsuBackground from '@/components/KintsuBackground'
import BottomNavClient from '@/components/BottomNavClient'

export const metadata: Metadata = {
  title: '金継ぎ KINTSU TRACKER · 3er Fin de Semana',
  description:
    'Coordiná el 3er Fin de Semana de Graduación del equipo Kintsu. Todo el estado del equipo en tiempo real.',
  keywords: 'kintsu, graduación, equipo, coordinación, tareas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        {/* Background layer: gold cracks + sakura petals */}
        <KintsuBackground />
        {/* Page content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
        {/* Bottom navigation - hidden on welcome */}
        <BottomNavClient />
      </body>
    </html>
  )
}
