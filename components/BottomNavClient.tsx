'use client'
import { usePathname } from 'next/navigation'
import BottomNav from './BottomNav'

export default function BottomNavClient() {
  const pathname = usePathname()
  // Don't show on welcome screen
  if (pathname === '/welcome' || pathname === '/') return null
  return <BottomNav />
}
