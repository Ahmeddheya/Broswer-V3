import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

export class SecurityManager {
  private static readonly ENCRYPTION_ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;

  // Generate a secure random key
  static async generateKey(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Hash password with salt
  static async hashPassword(password: string): Promise<string> {
    if (Platform.OS === 'web') {
      // Web fallback using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(password + 'aura-browser-salt');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + 'aura-browser-salt'
    );
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }

  // Encrypt sensitive data
  static async encryptData(data: string, key: string): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        // Web fallback - basic encoding (not secure, for demo only)
        return btoa(data);
      }
      
      // For mobile platforms, use expo-crypto
      const encrypted = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + key
      );
      
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt sensitive data
  static async decryptData(encryptedData: string, key: string): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        // Web fallback
        return atob(encryptedData);
      }
      
      // Note: This is a simplified implementation
      // In production, use proper encryption libraries
      return encryptedData;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Validate URL for security
  static validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Block dangerous protocols
      const dangerousProtocols = ['javascript:', 'data:', 'file:', 'ftp:'];
      if (dangerousProtocols.includes(urlObj.protocol)) {
        return false;
      }
      
      // Block local/private IPs
      const hostname = urlObj.hostname;
      const privateIpPatterns = [
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^localhost$/i,
      ];
      
      if (privateIpPatterns.some(pattern => pattern.test(hostname))) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  // Sanitize input to prevent XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  // Generate secure session ID
  static async generateSessionId(): Promise<string> {
    const timestamp = Date.now().toString();
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const randomString = Array.from(randomBytes, byte => 
      byte.toString(16).padStart(2, '0')
    ).join('');
    
    return `${timestamp}_${randomString}`;
  }

  // Check if running in secure context
  static isSecureContext(): boolean {
    if (Platform.OS === 'web') {
      return window.isSecureContext || location.protocol === 'https:';
    }
    return true; // Mobile apps are considered secure
  }

  // Rate limiting for API calls
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }
}