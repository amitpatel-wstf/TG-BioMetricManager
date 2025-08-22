// Telegram Bot API Types
export interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    added_to_attachment_menu?: boolean;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
  }
  
  export interface TelegramChat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    is_forum?: boolean;
  }
  
  export interface WebAppInitData {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    chat?: TelegramChat;
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
  }
  
  // Biometric Types
  export interface BiometricData {
    token: string;
    deviceId: string;
    biometricType: 'finger' | 'face' | 'unknown';
    success: boolean;
    timestamp?: number;
    userId?: number;
  }
  
  export interface BiometricSession {
    userId: number;
    deviceId: string;
    biometricToken: string;
    biometricType: 'finger' | 'face' | 'unknown';
    isEnabled: boolean;
    createdAt: Date;
    lastUsed: Date;
  }
  
  export interface BiometricRequestAccessParams {
    reason?: string;
  }
  
  export interface BiometricAuthenticateParams {
    reason?: string;
  }
  
  // API Response Types
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface ValidationResponse {
    valid: boolean;
    token?: string;
    error?: string;
  }
  
  export interface BiometricStorageResponse {
    success: boolean;
    message: string;
    data?: {
      userId: number;
      deviceId: string;
      timestamp: string;
    };
  }
  
  // Error Types
  export class TelegramBotError extends Error {
    constructor(
      message: string,
      public code?: string,
      public statusCode?: number
    ) {
      super(message);
      this.name = 'TelegramBotError';
    }
  }
  
  export class BiometricError extends Error {
    constructor(
      message: string,
      public type: 'INIT_FAILED' | 'NOT_AVAILABLE' | 'ACCESS_DENIED' | 'AUTH_FAILED' | 'TOKEN_INVALID' = 'AUTH_FAILED'
    ) {
      super(message);
      this.name = 'BiometricError';
    }
  }
  
  // Database Types (if using a database)
  export interface UserBiometricRecord {
    id: string;
    userId: number;
    deviceId: string;
    biometricType: 'finger' | 'face' | 'unknown';
    tokenHash: string; // Hashed version of the biometric token
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastAuthAt?: Date;
    authCount: number;
  }
  
  // Configuration Types
  export interface BotConfig {
    token: string;
    webAppUrl: string;
    jwtSecret: string;
    port: number;
    corsOrigins: string[];
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    environment: 'development' | 'production' | 'test';
  }
  
  // Webhook Types
  export interface TelegramWebhook {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    ip_address?: string;
    last_error_date?: number;
    last_error_message?: string;
    last_synchronization_error_date?: number;
    max_connections?: number;
    allowed_updates?: string[];
  }
  
  // Middleware Types
  export interface SessionData {
    userId?: number;
    biometricEnabled?: boolean;
    biometricToken?: string;
    deviceId?: string;
    biometricType?: 'finger' | 'face' | 'unknown';
    lastActivity?: Date;
    authCount?: number;
  }
  
  // Event Types
  export interface BiometricEvent {
    type: 'SETUP' | 'AUTH_SUCCESS' | 'AUTH_FAILED' | 'TOKEN_UPDATED' | 'ACCESS_DENIED';
    userId: number;
    deviceId?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }
  
  // Utility Types
  export type BiometricStatus = 
    | 'NOT_INITIALIZED'
    | 'NOT_AVAILABLE'
    | 'ACCESS_REQUIRED'
    | 'CONFIGURED'
    | 'READY'
    | 'ERROR';
  
  export interface DeviceInfo {
    id: string;
    platform: string;
    version: string;
    biometricType?: 'finger' | 'face' | 'unknown';
    isSupported: boolean;
  }
  
  // Rate Limiting Types
  export interface RateLimitInfo {
    userId: number;
    endpoint: string;
    attempts: number;
    windowStart: Date;
    isBlocked: boolean;
  }
  
  // Logging Types
  export interface LogContext {
    userId?: number;
    deviceId?: string;
    endpoint?: string;
    duration?: number;
    userAgent?: string;
    ip?: string;
  }
  
  // Security Types
  export interface SecurityAlert {
    type: 'MULTIPLE_FAILED_ATTEMPTS' | 'SUSPICIOUS_DEVICE' | 'TOKEN_COMPROMISED';
    userId: number;
    deviceId?: string;
    timestamp: Date;
    details: Record<string, any>;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }