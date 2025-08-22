import React, { useEffect, useState } from 'react'
import { Shield, Fingerprint, Settings, Trash2, Lock } from 'lucide-react'
import { cn } from '../utils/cn'
import type { BiometricActionsProps, BiometricData } from '../types/biometric'

export const BiometricActions: React.FC<BiometricActionsProps> = ({
  status,
  biometricManager,
  onRequestAccess,
  onSetup,
  onAuthenticate,
  onRemoveToken,
  onOpenSettings,
  onAuthSuccess,
  onError,
  className,
  style
}) => {
  const [isProcessing, setIsProcessing] = useState(false)

  // Listen for biometric authentication success
  useEffect(() => {
    const handleAuthSuccess = (event: CustomEvent<BiometricData>) => {
      onAuthSuccess(event.detail)
    }

    window.addEventListener('biometricAuthSuccess', handleAuthSuccess as EventListener)
    
    return () => {
      window.removeEventListener('biometricAuthSuccess', handleAuthSuccess as EventListener)
    }
  }, [onAuthSuccess])

  const handleAction = async (action: () => Promise<void>, actionName: string) => {
    if (isProcessing) return

    setIsProcessing(true)
    try {
      await action()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${actionName}`
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const getBiometricTypeText = (type?: string): string => {
    switch (type) {
      case 'finger':
        return 'Fingerprint'
      case 'face':
        return 'Face ID'
      default:
        return 'Biometric'
    }
  }

  const getActionButtons = () => {
    switch (status) {
      case 'ACCESS_REQUIRED':
        return (
          <>
            <button
              onClick={() => handleAction(onRequestAccess, 'request access')}
              disabled={isProcessing}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-200",
                "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-medium",
                "hover:from-primary-600 hover:to-primary-700 hover:shadow-hard hover:-translate-y-0.5",
                "active:translate-y-0 active:shadow-medium",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              )}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Requesting Access...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Request Biometric Access</span>
                </>
              )}
            </button>
            
            <button
              onClick={onOpenSettings}
              disabled={isProcessing}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-200",
                "bg-tg-secondary-bg text-tg-text border border-tg-secondary-bg",
                "hover:bg-opacity-80 hover:-translate-y-0.5 hover:shadow-soft",
                "active:translate-y-0",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              )}
            >
              <Settings className="w-5 h-5" />
              <span>Open Settings</span>
            </button>
          </>
        )

      case 'READY':
        return (
          <button
            onClick={() => handleAction(onSetup, 'setup biometric')}
            disabled={isProcessing}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-200",
              "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-medium",
              "hover:from-primary-600 hover:to-primary-700 hover:shadow-hard hover:-translate-y-0.5",
              "active:translate-y-0 active:shadow-medium",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            )}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-5 h-5" />
                <span>Setup {getBiometricTypeText(biometricManager?.biometricType)} Authentication</span>
              </>
            )}
          </button>
        )

      case 'CONFIGURED':
        return (
          <>
            <button
              onClick={() => handleAction(onAuthenticate, 'authenticate')}
              disabled={isProcessing}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-200",
                "bg-gradient-to-r from-success-500 to-success-600 text-white shadow-medium",
                "hover:from-success-600 hover:to-success-700 hover:shadow-hard hover:-translate-y-0.5",
                "active:translate-y-0 active:shadow-medium",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              )}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Authenticate with {getBiometricTypeText(biometricManager?.biometricType)}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleAction(onRemoveToken, 'remove token')}
              disabled={isProcessing}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200",
                "bg-error-50 text-error-700 border border-error-200",
                "hover:bg-error-100 hover:-translate-y-0.5 hover:shadow-soft",
                "dark:bg-error-900/20 dark:text-error-300 dark:border-error-700/50",
                "dark:hover:bg-error-900/30",
                "active:translate-y-0",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              )}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-error-500/30 border-t-error-500 rounded-full animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Biometric Token</span>
                </>
              )}
            </button>
          </>
        )

      default:
        return null
    }
  }

  const actionButtons = getActionButtons()

  if (!actionButtons) {
    return null
  }

  return (
    <div className={cn("space-y-3", className)} style={style}>
      {actionButtons}
    </div>
  )
}