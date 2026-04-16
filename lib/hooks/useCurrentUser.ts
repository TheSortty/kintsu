'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'kintsu_user'

export function useCurrentUser() {
  const [user, setUser] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setUser(stored)
    setIsLoaded(true)
  }, [])

  const setCurrentUser = (name: string) => {
    localStorage.setItem(STORAGE_KEY, name)
    setUser(name)
  }

  const clearCurrentUser = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return { user, isLoaded, setCurrentUser, clearCurrentUser }
}
