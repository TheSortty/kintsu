'use client'
import { useEffect, useState } from 'react'
import MemberAvatar from './MemberAvatar'
import StatusBadge from './StatusBadge'
import type { TaskStatus } from '@/lib/types'

export interface ToastData {
  id: string
  memberName: string
  taskTitle: string
  status: TaskStatus
}

interface RealtimeToastProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

export default function RealtimeToast({ toasts, onDismiss }: RealtimeToastProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 280,
      }}
      aria-live="polite"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            background: '#111111',
            border: '1px solid #D4AF37',
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'slideInRight 0.3s ease-out',
            boxShadow: '0 4px 20px rgba(212,175,55,0.15)',
          }}
          onClick={() => onDismiss(toast.id)}
        >
          <span style={{ fontSize: '16px', flexShrink: 0 }}>🌸</span>
          <MemberAvatar name={toast.memberName} size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: '12px',
                color: '#F5F5F5',
                fontFamily: 'var(--font-body)',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <strong>{toast.memberName}</strong> actualizó
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#9CA3AF',
                fontFamily: 'var(--font-body)',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {toast.taskTitle}
            </span>
          </div>
          <StatusBadge status={toast.status} size="sm" />
        </div>
      ))}
    </div>
  )
}

// Hook to manage toasts
export function useRealtimeToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])
    // Auto-dismiss after 4s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, addToast, dismiss }
}
