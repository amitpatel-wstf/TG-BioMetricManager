import React from 'react'
import { Shield } from 'lucide-react'
import { cn } from '../utils/cn'
import type { FooterProps } from '../types/biometric'

export const Footer: React.FC<FooterProps> = ({ className, style }) => {
  return (
    <footer className={cn("mt-8 pt-6", className)} style={style}>
      <div className="bg-tg-secondary-bg border border-tg-secondary-bg rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 text-success-600 dark:text-success-400 mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-tg-hint leading-relaxed">
              <strong className="text-tg-text">Security Notice:</strong> Your biometric data is stored securely on your device and never transmitted to our servers. All authentication is performed locally using your device's secure biometric storage.
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-tg-hint/20">
          <p className="text-xs text-tg-hint text-center">
            Powered by Telegram Web Apps • End-to-end encrypted
          </p>
        </div>
      </div>
    </footer>
  )
}