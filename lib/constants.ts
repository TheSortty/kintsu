import type { MemberConfig } from './types'

export const MEMBERS: MemberConfig[] = [
  { name: 'Gonza',  color: '#F59E0B', emoji: '⚡' },
  { name: 'Ara',    color: '#EC4899', emoji: '🌸' },
  { name: 'Martu',  color: '#8B5CF6', emoji: '✨' },
  { name: 'Migue',  color: '#3B82F6', emoji: '🎯' },
  { name: 'Sil',    color: '#10B981', emoji: '🌿' },
  { name: 'Nare',   color: '#EF4444', emoji: '🔥' },
  { name: 'Juani',  color: '#F97316', emoji: '🎵' },
  { name: 'Giuli',  color: '#06B6D4', emoji: '💫' },
  { name: 'Olga',   color: '#84CC16', emoji: '🌙' },
  { name: 'Fer',    color: '#A855F7', emoji: '🦋' },
]

export const MEMBER_NAMES = MEMBERS.map(m => m.name)

export const getMemberConfig = (name: string): MemberConfig => {
  return MEMBERS.find(m => m.name === name) ?? { name, color: '#9CA3AF', emoji: '👤' }
}

export const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: '#4B4B4B',
    bg: 'rgba(75,75,75,0.2)',
    icon: '⏳',
    textColor: '#9CA3AF',
  },
  in_progress: {
    label: 'En progreso',
    color: '#D4AF37',
    bg: 'rgba(212,175,55,0.15)',
    icon: '⚡',
    textColor: '#D4AF37',
  },
  done: {
    label: 'Listo',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.15)',
    icon: '✓',
    textColor: '#10B981',
  },
  needs_review: {
    label: 'Necesita revisión',
    color: '#F9A8C9',
    bg: 'rgba(249,168,201,0.15)',
    icon: '👁',
    textColor: '#F9A8C9',
  },
}

export const KINTSU_COLORS = {
  bg: '#0A0A0A',
  card: '#111111',
  cardBorder: '#1F1F1F',
  gold: '#D4AF37',
  goldLight: '#C9A84C',
  sakura: '#F9A8C9',
  sakuraDark: '#EC8FAA',
  white: '#F5F5F5',
  muted: '#9CA3AF',
  done: '#10B981',
}

export const MEMBER_PHRASES: Record<string, string> = {
  Gonza:  '"Somos protagonistas distintos por naturaleza."',
  Ara:    '"Consecuentes y preparados para desafiarnos sin límites."',
  Martu:  '"Transformando al mundo hacia el compromiso de vivir."',
  Migue:  '"El oro no oculta las grietas; las celebra."',
  Sil:    '"La naturaleza encuentra su camino siempre."',
  Nare:   '"El fuego purifica y da fuerza para seguir."',
  Juani:  '"La música une lo que las palabras no pueden."',
  Giuli:  '"Brilla con luz propia en la oscuridad."',
  Olga:   '"La luna guía aún cuando no se ve."',
  Fer:    '"Las transformaciones más bellas llevan tiempo."',
}
