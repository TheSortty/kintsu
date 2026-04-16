'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('kintsu_user')
    if (user) {
      router.replace('/dashboard')
    } else {
      router.replace('/welcome')
    }
  }, [router])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        background: '#0A0A0A',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          color: '#D4AF37',
          opacity: 0.6,
        }}
      >
        金継ぎ
      </span>
    </div>
  )
}
