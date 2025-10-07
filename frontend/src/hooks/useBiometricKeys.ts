import { useState, useCallback } from 'react'
import type { BiometricManager } from '../types/biometric'

export interface BiometricKeyData {
  publicKey: string
  privateKey: string // Base58 encoded
  deviceId: string
  biometricType: 'finger' | 'face' | 'unknown'
  derivationPath?: string
}

export interface UseBiometricKeysReturn {
  keyData: BiometricKeyData | null
  isGenerating: boolean
  error: string | null
  generateKeys: (biometricToken: string, userId: number) => Promise<BiometricKeyData | null>
  validateKeys: (biometricToken: string, expectedPublicKey: string) => Promise<boolean>
  clearKeys: () => void
}

// Client-side key derivation using Web Crypto API
class ClientBiometricKeyManager {
  private static readonly SALT_PREFIX = 'TG_BIOMETRIC_'
  private static readonly KEY_ITERATIONS = 100000

  static async derivePrivateKey(
    biometricToken: string,
    deviceId: string,
    userId: number,
    salt?: string
  ): Promise<BiometricKeyData> {
    // Create deterministic salt
    const combinedSalt = salt || await this.createDeterministicSalt(deviceId, userId)
    
    // Import the biometric token as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(biometricToken),
      'PBKDF2',
      false,
      ['deriveBits']
    )
    
    // Derive 32 bytes using PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(combinedSalt),
        iterations: this.KEY_ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 32 bytes * 8 bits
    )
    
    const seed = new Uint8Array(derivedBits)
    
    // For demonstration - in production, use proper Ed25519 key generation
    // This is a simplified approach for the client side
    const keyPair = await this.generateKeyPairFromSeed(seed)
    
    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      deviceId,
      biometricType: 'finger' // Should be passed from biometric manager
    }
  }
  
  private static async createDeterministicSalt(deviceId: string, userId: number): Promise<string> {
    const saltData = `${this.SALT_PREFIX}${deviceId}_${userId}`
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(saltData))
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  
  private static async generateKeyPairFromSeed(seed: Uint8Array): Promise<{publicKey: string, privateKey: string}> {
    // Convert seed to base58 for compatibility with Solana
    const base58Encode = (bytes: Uint8Array): string => {
      const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      let result = ''
      let num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''))
      
      while (num > 0) {
        result = alphabet[Number(num % 58n)] + result
        num = num / 58n
      }
      
      return result
    }
    
    // For demo purposes - create deterministic keys from seed
    const privateKeyBytes = new Uint8Array(64) // Ed25519 private key is 64 bytes
    privateKeyBytes.set(seed, 0)
    privateKeyBytes.set(seed, 32) // Duplicate for 64 bytes
    
    const publicKeyBytes = seed.slice(0, 32) // Public key from first 32 bytes
    
    return {
      publicKey: base58Encode(publicKeyBytes),
      privateKey: base58Encode(privateKeyBytes)
    }
  }
}

export const useBiometricKeys = (): UseBiometricKeysReturn => {
  const [keyData, setKeyData] = useState<BiometricKeyData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateKeys = useCallback(async (
    biometricToken: string,
    userId: number
  ): Promise<BiometricKeyData | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      // Get device ID from Telegram WebApp
      const webApp = window.Telegram?.WebApp
      const deviceId = webApp?.BiometricManager?.deviceId || 'unknown_device'

      const keys = await ClientBiometricKeyManager.derivePrivateKey(
        biometricToken,
        deviceId,
        userId
      )

      setKeyData(keys)
      
      // Store public key in localStorage for validation
      localStorage.setItem('biometric_public_key', keys.publicKey)
      
      console.log('Biometric keys generated:', {
        publicKey: keys.publicKey,
        deviceId: keys.deviceId,
        biometricType: keys.biometricType
      })

      return keys
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate biometric keys'
      console.error('Key generation failed:', err)
      setError(errorMessage)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const validateKeys = useCallback(async (
    biometricToken: string,
    expectedPublicKey: string
  ): Promise<boolean> => {
    try {
      const webApp = window.Telegram?.WebApp
      const deviceId = webApp?.BiometricManager?.deviceId || 'unknown_device'
      const userId = webApp?.initDataUnsafe?.user?.id || 0

      const derivedKeys = await ClientBiometricKeyManager.derivePrivateKey(
        biometricToken,
        deviceId,
        userId
      )

      return derivedKeys.publicKey === expectedPublicKey
    } catch (error) {
      console.error('Key validation failed:', error)
      return false
    }
  }, [])

  const clearKeys = useCallback(() => {
    setKeyData(null)
    setError(null)
    localStorage.removeItem('biometric_public_key')
  }, [])

  return {
    keyData,
    isGenerating,
    error,
    generateKeys,
    validateKeys,
    clearKeys
  }
}
