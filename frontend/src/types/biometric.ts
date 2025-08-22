// Telegram WebApp Types
export interface TelegramUser {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    is_premium?: boolean
  }
  
  export interface TelegramThemeParams {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  
  export interface TelegramWebApp {
    initData: string
    initDataUnsafe: {
      user?: TelegramUser
      query_id?: string
      auth_date?: number
    }
    version: string
    platform: string
    colorScheme: 'light' | 'dark'
    themeParams: TelegramThemeParams
    isExpanded: boolean
    viewportHeight: number
    viewportStableHeight: number
    headerColor: string
    backgroundColor: string
    BackButton: {
      show(): void
      hide(): void
      onClick(callback: () => void): void
    }
    MainButton: {
      text: string
      color: string
      textColor: string
      isVisible: boolean
      isProgressVisible: boolean
      isActive: boolean
      setText(text: string): void
      onClick(callback: () => void): void
      show(): void
      hide(): void
      enable(): void
      disable(): void
      showProgress(leaveActive?: boolean): void
      hideProgress(): void
    }
    HapticFeedback?: {
      impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
      notificationOccurred(type: 'error' | 'success' | 'warning'): void
      selectionChanged(): void
    }
    BiometricManager?: BiometricManager
    sendData(data: string): void
    ready(): void
    expand(): void
    close(): void
  }
  
  // Biometric Manager Types
  export interface BiometricManager {
    isInited: boolean
    isBiometricAvailable: boolean
    biometricType: 'finger' | 'face' | 'unknown'
    isAccessRequested: boolean
    isAccessGranted: boolean
    isBiometricTokenSaved: boolean
    deviceId: string
    init(callback?: () => void): BiometricManager
    requestAccess(params?: BiometricRequestAccessParams, callback?: (granted: boolean) => void): BiometricManager
    authenticate(params?: BiometricAuthenticateParams, callback?: (success: boolean, token?: string) => void): BiometricManager
    updateBiometricToken(token: string, callback?: (success: boolean) => void): BiometricManager
    openSettings(): BiometricManager
  }
  
  export interface BiometricRequestAccessParams {
    reason?: string
  }
  
  export interface BiometricAuthenticateParams {
    reason?: string
  }
  
  // Biometric Data Types
  export interface BiometricData {
    token: string
    deviceId: string
    biometricType: 'finger' | 'face' | 'unknown'
    success: boolean
    timestamp: number
    userId?: number
  }
  
  // Biometric Status Types
  export type BiometricStatus = 
    | 'NOT_INITIALIZED'
    | 'NOT_AVAILABLE'
    | 'ACCESS_REQUIRED'
    | 'CONFIGURED'
    | 'READY'
    | 'ERROR'
  
  // Component Props Types
  export interface BiometricStatusProps {
    status: BiometricStatus
    biometricManager?: BiometricManager
    className?: string
  }
  
  export interface BiometricActionsProps {
    status: BiometricStatus
    biometricManager?: BiometricManager
    onRequestAccess: () => Promise<void>
    onSetup: () => Promise<void>
    onAuthenticate: () => Promise<void>
    onRemoveToken: () => Promise<void>
    onOpenSettings: () => void
    onAuthSuccess: (data: BiometricData) => void
    onError: (error: string) => void
    className?: string
    style?: React.CSSProperties
  }
  
  export interface HeaderProps {
    user?: TelegramUser
    className?: string
  }
  
  export interface FooterProps {
    className?: string
    style?: React.CSSProperties
  }
  
  export interface LoadingSpinnerProps {
    message?: string
    className?: string
  }
  
  export interface ErrorDisplayProps {
    message: string
    onRetry?: () => void
    className?: string
  }
  
  // Hook Return Types
  export interface UseTelegramWebAppReturn {
    webApp: TelegramWebApp | null
    user: TelegramUser | null
    themeParams: TelegramThemeParams | null
    isSupported: boolean
  }
  
  export interface UseBiometricReturn {
    biometricManager: BiometricManager | null
    status: BiometricStatus
    isLoading: boolean
    error: string | null
    initializeBiometric: () => Promise<void>
    requestAccess: () => Promise<void>
    setupBiometric: () => Promise<void>
    authenticate: () => Promise<void>
    removeToken: () => Promise<void>
    openSettings: () => void
  }
  
  // Utility Types
  export interface BiometricCapabilities {
    isSupported: boolean
    biometricType?: 'finger' | 'face' | 'unknown'
    hasPermission: boolean
    isConfigured: boolean
  }
  
  export interface DeviceInfo {
    id: string
    platform: string
    version: string
    isSupported: boolean
  }
  
  // Error Types
  export class BiometricError extends Error {
    constructor(
      message: string,
      public type: 'INIT_FAILED' | 'NOT_AVAILABLE' | 'ACCESS_DENIED' | 'AUTH_FAILED' | 'TOKEN_INVALID' = 'AUTH_FAILED'
    ) {
      super(message)
      this.name = 'BiometricError'
    }
  }
  
  // Global Window Extension
  declare global {
    interface Window {
      Telegram: {
        WebApp: TelegramWebApp
      }
    }
  }