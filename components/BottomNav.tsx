'use client'
import { useRouter, usePathname } from 'next/navigation'

interface NavItem {
  href: string
  icon: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/dashboard?tab=mis-tareas', icon: '✓', label: 'Mis Tareas' },
  { href: '/dashboard?tab=equipo', icon: '◎', label: 'Equipo' },
  { href: '/review', icon: '⬡', label: 'Revisar' },
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid #1F1F1F',
        display: 'flex',
        alignItems: 'stretch',
        height: 60,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Navegación principal"
    >
      {NAV_ITEMS.map(item => {
        const isActive = pathname === item.href.split('?')[0]
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#D4AF37' : '#9CA3AF',
              fontFamily: 'var(--font-body)',
              transition: 'color 0.2s',
              minHeight: 44,
              padding: '4px 0',
            }}
          >
            <span
              style={{
                fontSize: 18,
                lineHeight: 1,
                filter: isActive ? 'drop-shadow(0 0 4px #D4AF37)' : 'none',
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: 24,
                  height: 2,
                  background: '#D4AF37',
                  borderRadius: 2,
                }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
