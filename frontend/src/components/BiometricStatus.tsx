import React from 'react'
import { Shield, Fingerprint, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '../utils/cn'
import type { BiometricStatusProps } from '../types/biometric'

export const BiometricStatus: React.FC<BiometricStatusProps> = ({ 
  status, 
  biometricManager, 
  className 
}) => {
  const getBiometricIcon = (type?: string) => {
    switch (type) {
      case 'finger':
        return <Fingerprint className="w-6 h-6" />
      case 'face':
        return <Shield className="w-6 h-6" />
      default:
        return <Shield className="w-6 h-6" />
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

  const getStatusContent = () => {
    switch (status) {
      case 'NOT_INITIALIZED':
        return {
          type: 'error' as const,
          icon: <AlertCircle className="w-6 h-6" />,
          title: 'Not Initialized',
          description: 'Biometric manager is not initialized'
        }

      case 'NOT_AVAILABLE':
        return {
          type: 'error' as const,
          icon: <AlertCircle className="w-6 h-6" />,
          title: 'Not Available',
          description: 'Biometric authentication is not available on this device'
        }

      case 'ACCESS_REQUIRED':
        return {
          type: 'warning' as const,
          icon: <AlertTriangle className="w-6 h-6" />,
          title: 'Permission Required',
          description: 'Biometric access permission is needed to continue'
        }

      case 'READY':
        return {
          type: 'warning' as const,
          icon: getBiometricIcon(biometricManager?.biometricType),
          title: 'Ready to Setup',
          description: `${getBiometricTypeText(biometricManager?.biometricType)} is available but not configured`
        }

      case 'CONFIGURED':
        return {
          type: 'success' as const,
          icon: <CheckCircle className="w-6 h-6" />,
          title: 'Configured & Ready',
          description: `${getBiometricTypeText(biometricManager?.biometricType)} authentication is set up and ready to use`
        }

      case 'ERROR':
      default:
        return {
          type: 'error' as const,
          icon: <AlertCircle className="w-6 h-6" />,
          title: 'Error',
          description: 'An error occurred with biometric authentication'
        }
    }
  }

  const { type, icon, title, description } = getStatusContent()

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Status Card */}
      <div className={cn(
        "border rounded-2xl p-5 transition-all duration-200",
        type === 'success' && "biometric-success",
        type === 'warning' && "biometric-warning", 
        type === 'error' && "biometric-error"
      )}>
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex-shrink-0 mt-0.5",
            type === 'success' && "text-success-600 dark:text-success-400",
            type === 'warning' && "text-warning-600 dark:text-warning-400",
            type === 'error' && "text-error-600 dark:text-error-400"
          )}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm opacity-80 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>

      {/* Device Info (if available) */}
      {biometricManager && status !== 'NOT_INITIALIZED' && status !== 'NOT_AVAILABLE' && (
        <div className="bg-tg-secondary-bg border border-tg-secondary-bg rounded-xl p-4">
          <h4 className="font-medium text-sm text-tg-text mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Device Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-tg-hint">Biometric Type:</span>
              <span className="text-tg-text font-medium">
                {getBiometricTypeText(biometricManager.biometricType)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-tg-hint">Device ID:</span>
              <span className="text-tg-text font-mono text-xs">
                {biometricManager.deviceId?.substring(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-tg-hint">Access Granted:</span>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                biometricManager.isAccessGranted 
                  ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300"
                  : "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300"
              )}>
                {biometricManager.isAccessGranted ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-tg-hint">Token Saved:</span>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                biometricManager.isBiometricTokenSaved 
                  ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300"
                  : "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300"
              )}>
                {biometricManager.isBiometricTokenSaved ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}