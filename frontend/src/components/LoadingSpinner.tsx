import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../utils/cn'
import type { LoadingSpinnerProps } from '../types/biometric'

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-tg-hint/20 border-t-primary-500 rounded-full animate-spin"></div>
        
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" style={{ animationDirection: 'reverse' }} />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-base font-medium text-tg-text">{message}</p>
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}