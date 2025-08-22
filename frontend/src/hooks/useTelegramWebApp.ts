import { useState, useEffect } from 'react'
import type { TelegramWebApp, TelegramUser, TelegramThemeParams, UseTelegramWebAppReturn } from '../types/biometric'

export const useTelegramWebApp = (): UseTelegramWebAppReturn => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [themeParams, setThemeParams] = useState<TelegramThemeParams | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp
      
      setWebApp(tgWebApp)
      setIsSupported(true)
      
      // Get user data
      if (tgWebApp.initDataUnsafe?.user) {
        setUser(tgWebApp.initDataUnsafe.user)
      }
      
      // Get theme parameters
      if (tgWebApp.themeParams) {
        setThemeParams(tgWebApp.themeParams)
      }

      // Log initialization info
      console.log('Telegram WebApp initialized:', {
        version: tgWebApp.version,
        platform: tgWebApp.platform,
        colorScheme: tgWebApp.colorScheme,
        user: tgWebApp.initDataUnsafe?.user,
        viewportHeight: tgWebApp.viewportHeight,
        isExpanded: tgWebApp.isExpanded
      })
    } else {
      console.warn('Telegram WebApp not available')
      setIsSupported(false)
    }
  }, [])

  return {
    webApp,
    user,
    themeParams,
    isSupported
  }
}