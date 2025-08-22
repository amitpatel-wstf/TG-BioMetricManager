import { useState, useCallback } from 'react'
import type { 
  BiometricManager, 
  BiometricStatus, 
  UseBiometricReturn,
  BiometricError
} from '../types/biometric'

export const useBiometric = (): UseBiometricReturn => {
  const [biometricManager, setBiometricManager] = useState<BiometricManager | null>(null)
  const [status, setStatus] = useState<BiometricStatus>('NOT_INITIALIZED')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine biometric status
  const updateStatus = useCallback((manager: BiometricManager) => {
    if (!manager.isInited) {
      setStatus('NOT_INITIALIZED')
    } else if (!manager.isBiometricAvailable) {
      setStatus('NOT_AVAILABLE')
    } else if (!manager.isAccessGranted) {
      setStatus('ACCESS_REQUIRED')
    } else if (manager.isBiometricTokenSaved) {
      setStatus('CONFIGURED')
    } else {
      setStatus('READY')
    }
  }, [])

  // Initialize biometric manager
  const initializeBiometric = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const webApp = window.Telegram?.WebApp
      
      if (!webApp?.BiometricManager) {
        throw new Error('Biometric authentication is not supported on this device or Telegram version.')
      }

      const manager = webApp.BiometricManager

      // Initialize the biometric manager
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Biometric initialization timeout'))
        }, 10000)

        manager.init(() => {
          clearTimeout(timeout)
          console.log('BiometricManager initialized successfully')
          setBiometricManager(manager)
          updateStatus(manager)
          resolve()
        })
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize biometric authentication'
      console.error('Biometric initialization failed:', err)
      setError(errorMessage)
      setStatus('ERROR')
    } finally {
      setIsLoading(false)
    }
  }, [updateStatus])

  // Request biometric access
  const requestAccess = useCallback(async (): Promise<void> => {
    if (!biometricManager) {
      throw new Error('Biometric manager not initialized')
    }

    setIsLoading(true)
    setError(null)

    try {
      const granted = await new Promise<boolean>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Access request timeout'))
        }, 30000)

        biometricManager.requestAccess(
          { reason: 'Enable secure authentication for your account' },
          (granted) => {
            clearTimeout(timeout)
            resolve(granted)
          }
        )
      })

      if (granted) {
        updateStatus(biometricManager)
        console.log('Biometric access granted')
      } else {
        throw new Error('Biometric access was denied')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request biometric access'
      console.error('Access request failed:', err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [biometricManager, updateStatus])

  // Setup biometric authentication
  const setupBiometric = useCallback(async (): Promise<void> => {
    if (!biometricManager) {
      throw new Error('Biometric manager not initialized')
    }

    setIsLoading(true)
    setError(null)

    try {
      // First authenticate to generate a token
      const { success, token } = await new Promise<{ success: boolean; token?: string }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Authentication timeout'))
        }, 60000)

        biometricManager.authenticate(
          { reason: 'Set up biometric authentication for secure access' },
          (success, token) => {
            clearTimeout(timeout)
            resolve({ success, token: token || undefined })
          }
        )
      })

      if (!success || !token) {
        throw new Error('Biometric authentication failed during setup')
      }

      // Store the token
      const tokenSaved = await new Promise<boolean>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Token storage timeout'))
        }, 10000)

        biometricManager.updateBiometricToken(token, (success) => {
          clearTimeout(timeout)
          resolve(success)
        })
      })

      if (!tokenSaved) {
        throw new Error('Failed to save biometric token')
      }

      updateStatus(biometricManager)
      console.log('Biometric setup completed successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set up biometric authentication'
      console.error('Biometric setup failed:', err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [biometricManager, updateStatus])

  // Authenticate using biometrics
  const authenticate = useCallback(async (): Promise<void> => {
    if (!biometricManager) {
      throw new Error('Biometric manager not initialized')
    }

    setIsLoading(true)
    setError(null)

    try {
      const { success, token } = await new Promise<{ success: boolean; token?: string }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Authentication timeout'))
        }, 60000)

        biometricManager.authenticate(
          { reason: 'Authenticate to verify your identity' },
          (success, token) => {
            clearTimeout(timeout)
            resolve({ success, token: token || undefined })
          }
        )
      })

      if (!success || !token) {
        throw new Error('Biometric authentication failed')
      }

      console.log('Biometric authentication successful')
      
      // You can dispatch a custom event or call a callback here
      const authEvent = new CustomEvent('biometricAuthSuccess', {
        detail: {
          token,
          deviceId: biometricManager.deviceId,
          biometricType: biometricManager.biometricType,
          success: true,
          timestamp: Date.now()
        }
      })
      window.dispatchEvent(authEvent)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      console.error('Authentication failed:', err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [biometricManager])

  // Remove biometric token
  const removeToken = useCallback(async (): Promise<void> => {
    if (!biometricManager) {
      throw new Error('Biometric manager not initialized')
    }

    setIsLoading(true)
    setError(null)

    try {
      const removed = await new Promise<boolean>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Token removal timeout'))
        }, 10000)

        biometricManager.updateBiometricToken('', (success) => {
          clearTimeout(timeout)
          resolve(success)
        })
      })

      if (!removed) {
        throw new Error('Failed to remove biometric token')
      }

      updateStatus(biometricManager)
      console.log('Biometric token removed successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove biometric token'
      console.error('Token removal failed:', err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [biometricManager, updateStatus])

  // Open biometric settings
  const openSettings = useCallback((): void => {
    if (!biometricManager) {
      console.warn('Biometric manager not initialized')
      return
    }

    try {
      biometricManager.openSettings()
      console.log('Opened biometric settings')
    } catch (err) {
      console.error('Failed to open biometric settings:', err)
      setError('Failed to open biometric settings')
    }
  }, [biometricManager])

  return {
    biometricManager,
    status,
    isLoading,
    error,
    initializeBiometric,
    requestAccess,
    setupBiometric,
    authenticate,
    removeToken,
    openSettings
  }
}