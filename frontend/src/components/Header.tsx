import React from 'react'
import { Shield } from 'lucide-react'
import { cn } from '../utils/cn'
import type { HeaderProps } from '../types/biometric'

export const Header: React.FC<HeaderProps> = ({ user, className }) => {
  return (
    <header className={cn("text-center mb-8 pt-6", className)}>
      {/* App Icon */}
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-medium animate-scale-in">
        <Shield className="w-8 h-8 text-white" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-tg-text mb-2 animate-fade-in">
        Biometric Security
      </h1>

      {/* Subtitle */}
      <p className="text-base text-tg-hint animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {user 
          ? `Welcome, ${user.first_name}! Secure your account with biometric authentication.`
          : 'Secure your account with biometric authentication'
        }
      </p>

      {/* User Info (if available) */}
      {user && (
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-tg-secondary-bg rounded-full text-sm text-tg-hint animate-slide-up">
          <div className="w-2 h-2 bg-success-500 rounded-full"></div>
          <span>Signed in as @{user.username || `user${user.id}`}</span>
        </div>
      )}
    </header>
  )
}