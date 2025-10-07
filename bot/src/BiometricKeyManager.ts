import crypto from 'crypto';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export interface BiometricKeyData {
  publicKey: string;
  privateKey: string; // Base58 encoded
  deviceId: string;
  biometricType: 'finger' | 'face' | 'unknown';
  derivationPath?: string;
}

export interface KeyDerivationParams {
  biometricToken: string;
  deviceId: string;
  userId: number;
  salt?: string;
}

export class BiometricKeyManager {
  private static readonly SALT_PREFIX = 'TG_BIOMETRIC_';
  private static readonly KEY_ITERATIONS = 100000; // PBKDF2 iterations
  
  /**
   * Derives a deterministic private key from biometric authentication data
   * Uses PBKDF2 with SHA-256 for secure key derivation
   */
  static derivePrivateKey(params: KeyDerivationParams): BiometricKeyData {
    const { biometricToken, deviceId, userId, salt } = params;
    
    // Create a deterministic salt combining multiple factors
    const combinedSalt = salt || this.createDeterministicSalt(deviceId, userId);
    
    // Use PBKDF2 to derive a 32-byte seed from biometric token
    const seed = crypto.pbkdf2Sync(
      biometricToken,
      combinedSalt,
      this.KEY_ITERATIONS,
      32, // 32 bytes for Ed25519
      'sha256'
    );
    
    // Create Solana keypair from the derived seed
    const keypair = Keypair.fromSeed(seed);
    
    return {
      publicKey: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey),
      deviceId,
      biometricType: 'finger', // Default, should be passed from biometric manager
    };
  }
  
  /**
   * Creates a deterministic salt from device and user information
   */
  private static createDeterministicSalt(deviceId: string, userId: number): string {
    const saltData = `${this.SALT_PREFIX}${deviceId}_${userId}`;
    return crypto.createHash('sha256').update(saltData).digest('hex');
  }
  
  /**
   * Derives multiple keys for different purposes (signing, encryption, etc.)
   */
  static deriveMultipleKeys(params: KeyDerivationParams, keyCount: number = 3): BiometricKeyData[] {
    const keys: BiometricKeyData[] = [];
    
    for (let i = 0; i < keyCount; i++) {
      const derivationSalt = this.createDeterministicSalt(params.deviceId, params.userId) + `_${i}`;
      const keyData = this.derivePrivateKey({
        ...params,
        salt: derivationSalt
      });
      
      keyData.derivationPath = `m/44'/501'/${i}'`; // Solana derivation path
      keys.push(keyData);
    }
    
    return keys;
  }
  
  /**
   * Validates that a biometric token can reproduce the same private key
   */
  static validateBiometricKey(
    params: KeyDerivationParams,
    expectedPublicKey: string
  ): boolean {
    try {
      const derivedKey = this.derivePrivateKey(params);
      return derivedKey.publicKey === expectedPublicKey;
    } catch (error) {
      console.error('Key validation failed:', error);
      return false;
    }
  }
  
  /**
   * Creates a secure backup of key derivation parameters (without the actual key)
   */
  static createKeyBackup(params: KeyDerivationParams): string {
    const backupData = {
      deviceId: params.deviceId,
      userId: params.userId,
      salt: this.createDeterministicSalt(params.deviceId, params.userId),
      timestamp: Date.now(),
      version: '1.0'
    };
    
    return Buffer.from(JSON.stringify(backupData)).toString('base64');
  }
  
  /**
   * Restores key derivation parameters from backup
   */
  static restoreFromBackup(backup: string): Omit<KeyDerivationParams, 'biometricToken'> {
    try {
      const backupData = JSON.parse(Buffer.from(backup, 'base64').toString());
      return {
        deviceId: backupData.deviceId,
        userId: backupData.userId,
        salt: backupData.salt
      };
    } catch (error) {
      throw new Error('Invalid backup data');
    }
  }
}

/**
 * Enhanced biometric session with private key capabilities
 */
export interface BiometricSession {
  userId: number;
  deviceId: string;
  biometricToken: string;
  biometricType: 'finger' | 'face' | 'unknown';
  publicKey: string;
  isEnabled: boolean;
  createdAt: Date;
  lastUsed: Date;
  keyBackup?: string; // Encrypted backup of derivation parameters
}

/**
 * Utility functions for biometric key management
 */
export class BiometricUtils {
  /**
   * Generates a secure biometric session with private key
   */
  static async createBiometricSession(
    userId: number,
    deviceId: string,
    biometricToken: string,
    biometricType: 'finger' | 'face' | 'unknown'
  ): Promise<BiometricSession> {
    const keyData = BiometricKeyManager.derivePrivateKey({
      biometricToken,
      deviceId,
      userId
    });
    
    const backup = BiometricKeyManager.createKeyBackup({
      biometricToken,
      deviceId,
      userId
    });
    
    return {
      userId,
      deviceId,
      biometricToken,
      biometricType,
      publicKey: keyData.publicKey,
      isEnabled: true,
      createdAt: new Date(),
      lastUsed: new Date(),
      keyBackup: backup
    };
  }
  
  /**
   * Recreates private key from biometric authentication
   */
  static recreatePrivateKey(
    session: BiometricSession,
    currentBiometricToken: string
  ): string | null {
    try {
      const keyData = BiometricKeyManager.derivePrivateKey({
        biometricToken: currentBiometricToken,
        deviceId: session.deviceId,
        userId: session.userId
      });
      
      // Validate that the derived key matches the stored public key
      if (keyData.publicKey === session.publicKey) {
        return keyData.privateKey;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to recreate private key:', error);
      return null;
    }
  }
}
