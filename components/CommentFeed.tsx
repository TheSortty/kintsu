'use client'
import { useState } from 'react'
import MemberAvatar from './MemberAvatar'
import StatusBadge from './StatusBadge'
import type { TaskComment, TaskProgress } from '@/lib/types'
import { timeAgo } from '@/lib/utils/progress'

interface CommentFeedProps {
  comments: TaskComment[]
  progress: TaskProgress[]
  currentUser: string | null
  onComment?: (content: string) => Promise<void>
}

export default function CommentFeed({
  comments,
  progress,
  currentUser,
  onComment,
}: CommentFeedProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  // Merge comments and status changes into a feed, sorted by date
  const progressEvents = progress
    .filter(p => p.updated_at)
    .map(p => ({
      id: `prog-${p.id}`,
      member_name: p.member_name,
      content: p.notes ? `${p.notes}` : '',
      status: p.status,
      created_at: p.updated_at,
      type: 'status' as const,
    }))

  const commentEvents = comments.map(c => ({
    id: c.id,
    member_name: c.member_name,
    content: c.content,
    status: undefined,
    created_at: c.created_at,
    type: 'comment' as const,
  }))

  const feed = [...progressEvents, ...commentEvents].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const handleSubmit = async () => {
    if (!text.trim() || !onComment || loading) return
    setLoading(true)
    try {
      await onComment(text.trim())
      setText('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
        {/* Timeline line */}
        <div
          style={{
            position: 'absolute',
            left: 15,
            top: 16,
            bottom: 16,
            width: 1,
            background: 'linear-gradient(180deg, #D4AF37 0%, #D4AF3722 100%)',
          }}
        />
        {feed.length === 0 && (
          <p style={{ color: '#9CA3AF', fontSize: '13px', fontFamily: 'var(--font-body)', paddingLeft: 36 }}>
            Sin actividad aún. ¡Sé el primero en actualizar!
          </p>
        )}
        {feed.map(event => (
          <div
            key={event.id}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16, paddingLeft: 4 }}
          >
            {/* Dot on timeline */}
            <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <MemberAvatar name={event.member_name} size="sm" />
            </div>

            <div style={{ flex: 1, paddingTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#F5F5F5',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {event.member_name}
                </span>
                {event.status && <StatusBadge status={event.status as any} size="sm" />}
                <span
                  style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}
                >
                  {timeAgo(event.created_at)}
                </span>
              </div>
              {event.content && (
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '13px',
                    color: '#9CA3AF',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.5,
                  }}
                >
                  {event.content}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comment input */}
      {onComment && currentUser && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="¿Cómo vas? Contale al equipo..."
            rows={3}
            aria-label="Agregar comentario"
            style={{
              width: '100%',
              background: '#0F0F0F',
              border: '1px solid #2C2C2C',
              borderRadius: 10,
              padding: '12px 14px',
              color: '#F5F5F5',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = '#D4AF37')}
            onBlur={e => (e.target.style.borderColor = '#2C2C2C')}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            style={{
              padding: '12px',
              borderRadius: 10,
              background: loading || !text.trim() ? '#1F1F1F' : '#D4AF37',
              color: loading || !text.trim() ? '#9CA3AF' : '#0A0A0A',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              minHeight: 44,
            }}
          >
            {loading ? 'Enviando...' : 'Comentar'}
          </button>
        </div>
      )}
    </div>
  )
}
