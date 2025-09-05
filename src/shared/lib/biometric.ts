import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export class BiometricManager {
  // Check if biometric authentication is available
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false; // Biometrics not available on web
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.warn('Biometric availability check failed:', error);
      return false;
    }
  }

  // Get available biometric types
  static async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.warn('Failed to get biometric types:', error);
      return [];
    }
  }

  // Authenticate with biometrics
  static async authenticate(
    promptMessage: string = 'Authenticate to continue',
    fallbackLabel: string = 'Use Passcode'
  ): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS === 'web') {
      return { success: false, error: 'Biometrics not supported on web' };
    }

    try {
      const isAvailable = await this.isAvailable();
      
      if (!isAvailable) {
        return { success: false, error: 'Biometric authentication not available' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel,
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Authentication failed' 
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication error' 
      };
    }
  }

  // Check if device has secure lock screen
  static async hasSecureLockScreen(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
      return securityLevel > LocalAuthentication.SecurityLevel.NONE;
    } catch (error) {
      console.warn('Security level check failed:', error);
      return false;
    }
  }
}