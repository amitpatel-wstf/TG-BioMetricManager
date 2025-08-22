import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '../utils/cn'
import type { ErrorDisplayProps } from '../types/biometric'

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  message, 
  onRetry, 
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 p-8 text-center", className)}>
      {/* Error Icon */}
      <div className="w-20 h-20 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-error-600 dark:text-error-400" />
      </div>

      {/* Error Message */}
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-semibold text-tg-text">Something went wrong</h3>
        <p className="text-sm text-tg-hint leading-relaxed">{message}</p>
      </div>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200",
            "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-medium",
            "hover:from-primary-600 hover:to-primary-700 hover:shadow-hard hover:-translate-y-0.5",
            "active:translate-y-0 active:shadow-medium"
          )}
        >
          <RefreshCw className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      )}

      {/* Help Text */}
      <div className="text-xs text-tg-hint max-w-xs">
        <p>If the problem persists, please try:</p>
        <ul className="mt-2 space-y-1 text-left">
          <li>• Refreshing the page</li>
          <li>• Checking your device's biometric settings</li>
          <li>• Ensuring Telegram app is up to date</li>
        </ul>
      </div>
    </div>
  )
}