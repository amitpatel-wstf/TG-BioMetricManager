import React, { useEffect, useState, useCallback } from 'react'
import { useBiometric } from './hooks/useBiometric'
import { BiometricStatus } from './components/BiometricStatus'
import { BiometricActions } from './components/BiometricActions'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorDisplay } from './components/ErrorDisplay'
import { cn } from './utils/cn'
import type { BiometricData } from './types/biometric'
import { useTelegramWebApp } from './hooks/useTelegramWebApp'

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authData, setAuthData] = useState<BiometricData | null>(null)

  const { 
    webApp, 
    user, 
    themeParams, 
    isSupported: isTelegramSupported 
  } = useTelegramWebApp()

  const {
    biometricManager,
    status,
    isLoading,
    error: biometricError,
    initializeBiometric,
    requestAccess,
    setupBiometric,
    authenticate,
    removeToken,
    openSettings
  } = useBiometric()

  // Initialize the app
  useEffect(() => {
    if (!isTelegramSupported) {
      setError('This application must be opened within Telegram using a bot\'s web app interface.')
      return
    }

    const init = async () => {
      try {
        // Apply theme
        applyTelegramTheme()
        
        // Initialize WebApp
        webApp?.ready()
        webApp?.expand()

        // Initialize biometric
        await initializeBiometric()
        
        setIsInitialized(true)
      } catch (err) {
        console.error('Failed to initialize app:', err)
        setError('Failed to initialize the application. Please try again.')
      }
    }

    init()
  }, [isTelegramSupported, webApp, initializeBiometric])

  // Apply Telegram theme
  const applyTelegramTheme = useCallback(() => {
    if (!themeParams) return

    const root = document.documentElement
    const isDark = webApp?.colorScheme === 'dark'

    // Apply theme class
    if (isDark) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }

    // Apply theme colors
    if (themeParams.bg_color) {
      root.style.setProperty('--tg-bg-color', themeParams.bg_color)
      document.body.style.backgroundColor = themeParams.bg_color
    }

    if (themeParams.text_color) {
      root.style.setProperty('--tg-text-color', themeParams.text_color)
    }

    if (themeParams.button_color) {
      root.style.setProperty('--tg-button-color', themeParams.button_color)
    }

    if (themeParams.button_text_color) {
      root.style.setProperty('--tg-button-text-color', themeParams.button_text_color)
    }

    if (themeParams.hint_color) {
      root.style.setProperty('--tg-hint-color', themeParams.hint_color)
    }

    if (themeParams.secondary_bg_color) {
      root.style.setProperty('--tg-secondary-bg-color', themeParams.secondary_bg_color)
    }
  }, [themeParams, webApp?.colorScheme])

  // Setup main button
  useEffect(() => {
    if (!webApp || !authData) return

    webApp.MainButton.setText('Send to Bot')
    webApp.MainButton.color = themeParams?.button_color || '#007AFF'
    webApp.MainButton.show()

    const handleMainButtonClick = () => {
      try {
        webApp.sendData(JSON.stringify(authData))
        webApp.HapticFeedback?.notificationOccurred('success')
      } catch (err) {
        console.error('Failed to send data:', err)
        webApp.HapticFeedback?.notificationOccurred('error')
        setError('Failed to send data to bot.')
      }
    }

    webApp.MainButton.onClick(handleMainButtonClick)

    return () => {
      webApp.MainButton.hide()
    }
  }, [webApp, authData, themeParams?.button_color])

  // Handle biometric authentication success
  const handleAuthSuccess = useCallback((data: BiometricData) => {
    setAuthData(data)
    webApp?.HapticFeedback?.notificationOccurred('success')
  }, [webApp])

  // Handle authentication error
  const handleAuthError = useCallback((errorMessage: string) => {
    setError(errorMessage)
    webApp?.HapticFeedback?.notificationOccurred('error')
  }, [webApp])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-tg-bg flex items-center justify-center p-4">
        <LoadingSpinner 
          message="Initializing biometric security..." 
          className="text-tg-text"
        />
      </div>
    )
  }

  // Error state
  if (error || biometricError) {
    return (
      <div className="min-h-screen bg-tg-bg flex items-center justify-center p-4">
        <ErrorDisplay 
          message={error || biometricError || 'An unknown error occurred'}
          onRetry={error ? clearError : () => window.location.reload()}
          className="text-tg-text"
        />
      </div>
    )
  }

  return (
    <div className={cn(
      "min-h-screen bg-tg-bg text-tg-text transition-colors duration-300",
      webApp?.colorScheme === 'dark' && "dark"
    )}>
      <div className="container mx-auto max-w-md px-4 py-6 min-h-screen flex flex-col">
        {/* Header */}
        <Header user={user} />

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          {/* Biometric Status */}
          <BiometricStatus
            status={status}
            biometricManager={biometricManager}
            className="animate-fade-in"
          />

          {/* Authentication Success Message */}
          {authData && (
            <div className="biometric-success border rounded-2xl p-4 animate-slide-up">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 text-success-600 dark:text-success-400 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Authentication Successful!</h3>
                  <p className="text-sm opacity-80">
                    You have been verified using {authData.biometricType === 'face' ? 'Face ID' : 'Fingerprint'} authentication.
                    Click "Send to Bot" to complete the process.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Biometric Actions */}
          <BiometricActions
            status={status}
            biometricManager={biometricManager}
            onRequestAccess={requestAccess}
            onSetup={setupBiometric}
            onAuthenticate={authenticate}
            onRemoveToken={removeToken}
            onOpenSettings={openSettings}
            onAuthSuccess={handleAuthSuccess}
            onError={handleAuthError}
            className="animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          />
        </main>

        {/* Footer */}
        <Footer className="animate-fade-in" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  )
}

export default App