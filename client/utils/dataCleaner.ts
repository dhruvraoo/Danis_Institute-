/**
 * Comprehensive Data Clearing Service
 * Provides comprehensive data clearing capabilities to prevent
 * cross-user data contamination (fixes "Kavya Shah" issue)
 */

import { clearSessionData, createNewSession } from './sessionManager';
import { clearAllSessionData, clearCurrentSessionData } from './storageManager';
import { emergencyFormClean } from './formCleaner';

export interface DataClearingOptions {
  clearLocalStorage?: boolean;
  clearSessionStorage?: boolean;
  clearFormData?: boolean;
  clearUserData?: boolean;
  clearAuthTokens?: boolean;
  clearBrowserCache?: boolean;
  createNewSession?: boolean;
  forceReload?: boolean;
}

export interface ClearingResult {
  success: boolean;
  itemsCleared: number;
  errors: string[];
  warnings: string[];
  timestamp: Date;
}

class DataCleaner {
  private static instance: DataCleaner;

  private constructor() {}

  public static getInstance(): DataCleaner {
    if (!DataCleaner.instance) {
      DataCleaner.instance = new DataCleaner();
    }
    return DataCleaner.instance;
  }

  /**
   * Clear all user data (nuclear option)
   */
  public clearAllUserData(options: DataClearingOptions = {}): ClearingResult {
    console.log('🚨 NUCLEAR OPTION: Clearing all user data');
    
    const defaultOptions: DataClearingOptions = {
      clearLocalStorage: true,
      clearSessionStorage: true,
      clearFormData: true,
      clearUserData: true,
      clearAuthTokens: true,
      clearBrowserCache: true,
      createNewSession: true,
      forceReload: false,
      ...options
    };

    const result: ClearingResult = {
      success: true,
      itemsCleared: 0,
      errors: [],
      warnings: [],
      timestamp: new Date()
    };

    try {
      // 1. Clear session management data
      if (defaultOptions.clearSessionStorage) {
        this.clearSessionStorageData(result);
      }

      // 2. Clear localStorage data
      if (defaultOptions.clearLocalStorage) {
        this.clearLocalStorageData(result);
      }

      // 3. Clear form data
      if (defaultOptions.clearFormData) {
        this.clearFormStates(result);
      }

      // 4. Clear user-specific data
      if (defaultOptions.clearUserData) {
        this.clearUserSpecificData(result);
      }

      // 5. Clear authentication tokens
      if (defaultOptions.clearAuthTokens) {
        this.clearAuthenticationData(result);
      }

      // 6. Clear browser cache (limited)
      if (defaultOptions.clearBrowserCache) {
        this.clearBrowserCache(result);
      }

      // 7. Create new session
      if (defaultOptions.createNewSession) {
        clearSessionData();
        createNewSession();
        result.itemsCleared++;
        console.log('🆕 Created new session');
      }

      // 8. Force page reload
      if (defaultOptions.forceReload) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        result.warnings.push('Page will reload in 1 second');
      }

      console.log('✅ All user data cleared successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Error clearing all user data:', error);
      result.success = false;
      result.errors.push(`Failed to clear all data: ${error}`);
      return result;
    }
  }

  /**
   * Clear form states and form-related data
   */
  public clearFormStates(result?: ClearingResult): ClearingResult {
    const clearingResult = result || {
      success: true,
      itemsCleared: 0,
      errors: [],
      warnings: [],
      timestamp: new Date()
    };

    try {
      console.log('📝 Clearing form states');

      // Use emergency form clean
      emergencyFormClean();
      clearingResult.itemsCleared++;

      // Clear form-related keys from both storages
      const formKeys = [
        'form_state',
        'signup_form_data',
        'login_form_data',
        'form_cache',
        'user_input_cache',
        'temp_form_data',
        'cached_form_values',
        'form_backup',
        'user_form_data',
        'form_validation_cache',
        'input_history'
      ];

      formKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
          clearingResult.itemsCleared++;
        } catch (error) {
          clearingResult.errors.push(`Failed to clear ${key}: ${error}`);
        }
      });

      console.log('✅ Form states cleared');
      return clearingResult;

    } catch (error) {
      console.error('❌ Error clearing form states:', error);
      clearingResult.success = false;
      clearingResult.errors.push(`Form clearing failed: ${error}`);
      return clearingResult;
    }
  }

  /**
   * Clear user-specific data
   */
  public clearUserSpecificData(result?: ClearingResult): ClearingResult {
    const clearingResult = result || {
      success: true,
      itemsCleared: 0,
      errors: [],
      warnings: [],
      timestamp: new Date()
    };

    try {
      console.log('👤 Clearing user-specific data');

      const userDataKeys = [
        'user',
        'current_user',
        'logged_in_user',
        'student_data',
        'faculty_data',
        'principal_data',
        'user_profile',
        'user_preferences',
        'user_settings',
        'dashboard_data',
        'user_cache',
        'profile_cache'
      ];

      userDataKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
          clearingResult.itemsCleared++;
        } catch (error) {
          clearingResult.errors.push(`Failed to clear ${key}: ${error}`);
        }
      });

      console.log('✅ User-specific data cleared');
      return clearingResult;

    } catch (error) {
      console.error('❌ Error clearing user-specific data:', error);
      clearingResult.success = false;
      clearingResult.errors.push(`User data clearing failed: ${error}`);
      return clearingResult;
    }
  }

  /**
   * Clear authentication data
   */
  public clearAuthenticationData(result?: ClearingResult): ClearingResult {
    const clearingResult = result || {
      success: true,
      itemsCleared: 0,
      errors: [],
      warnings: [],
      timestamp: new Date()
    };

    try {
      console.log('🔐 Clearing authentication data');

      const authKeys = [
        'auth_token',
        'access_token',
        'refresh_token',
        'session_token',
        'jwt_token',
        'bearer_token',
        'auth_data',
        'login_token',
        'authentication_cache',
        'auth_state'
      ];

      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
          clearingResult.itemsCleared++;
        } catch (error) {
          clearingResult.errors.push(`Failed to clear ${key}: ${error}`);
        }
      });

      console.log('✅ Authentication data cleared');
      return clearingResult;

    } catch (error) {
      console.error('❌ Error clearing authentication data:', error);
      clearingResult.success = false;
      clearingResult.errors.push(`Auth data clearing failed: ${error}`);
      return clearingResult;
    }
  }

  /**
   * Clear localStorage data
   */
  private clearLocalStorageData(result: ClearingResult): void {
    try {
      console.log('💾 Clearing localStorage data');

      // Get all localStorage keys
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter(key => 
        key.startsWith('app_') || 
        this.isUserDataKey(key)
      );

      appKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          result.itemsCleared++;
        } catch (error) {
          result.errors.push(`Failed to clear localStorage ${key}: ${error}`);
        }
      });

      // Also use the storage manager's clear function
      clearAllSessionData();
      result.itemsCleared++;

      console.log(`✅ Cleared ${appKeys.length} localStorage items`);

    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
      result.errors.push(`localStorage clearing failed: ${error}`);
    }
  }

  /**
   * Clear sessionStorage data
   */
  private clearSessionStorageData(result: ClearingResult): void {
    try {
      console.log('🗂️ Clearing sessionStorage data');

      // Get all sessionStorage keys
      const keys = Object.keys(sessionStorage);
      const appKeys = keys.filter(key => 
        key.startsWith('app_') || 
        this.isUserDataKey(key)
      );

      appKeys.forEach(key => {
        try {
          sessionStorage.removeItem(key);
          result.itemsCleared++;
        } catch (error) {
          result.errors.push(`Failed to clear sessionStorage ${key}: ${error}`);
        }
      });

      console.log(`✅ Cleared ${appKeys.length} sessionStorage items`);

    } catch (error) {
      console.error('❌ Error clearing sessionStorage:', error);
      result.errors.push(`sessionStorage clearing failed: ${error}`);
    }
  }

  /**
   * Clear browser cache (limited capabilities)
   */
  public clearBrowserCache(result?: ClearingResult): ClearingResult {
    const clearingResult = result || {
      success: true,
      itemsCleared: 0,
      errors: [],
      warnings: [],
      timestamp: new Date()
    };

    try {
      console.log('🌐 Attempting to clear browser cache (limited)');

      // Clear any cached API responses
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
            clearingResult.itemsCleared++;
          });
        }).catch(error => {
          clearingResult.errors.push(`Cache clearing failed: ${error}`);
        });
      }

      // Clear any IndexedDB data (if used)
      if ('indexedDB' in window) {
        // This is limited - we can't easily clear all IndexedDB data
        clearingResult.warnings.push('IndexedDB clearing is limited');
      }

      clearingResult.warnings.push('Browser cache clearing has limited capabilities');
      console.log('⚠️ Browser cache clearing completed (limited)');

      return clearingResult;

    } catch (error) {
      console.error('❌ Error clearing browser cache:', error);
      clearingResult.success = false;
      clearingResult.errors.push(`Browser cache clearing failed: ${error}`);
      return clearingResult;
    }
  }

  /**
   * Emergency data clearing (for security incidents)
   */
  public emergencyDataClearing(): ClearingResult {
    console.log('🚨 EMERGENCY DATA CLEARING INITIATED');

    const result = this.clearAllUserData({
      clearLocalStorage: true,
      clearSessionStorage: true,
      clearFormData: true,
      clearUserData: true,
      clearAuthTokens: true,
      clearBrowserCache: true,
      createNewSession: true,
      forceReload: true
    });

    // Additional emergency measures
    try {
      // Clear all possible storage
      localStorage.clear();
      sessionStorage.clear();
      result.itemsCleared += 2;

      // Clear cookies (limited capability)
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      console.log('🚨 Emergency data clearing completed');

    } catch (error) {
      console.error('❌ Error in emergency data clearing:', error);
      result.errors.push(`Emergency clearing failed: ${error}`);
    }

    return result;
  }

  /**
   * Check if a key is likely to contain user data
   */
  private isUserDataKey(key: string): boolean {
    const userDataPatterns = [
      'user',
      'auth',
      'token',
      'login',
      'signup',
      'form',
      'student',
      'faculty',
      'principal',
      'dashboard',
      'profile',
      'cache',
      'data',
      'state'
    ];

    return userDataPatterns.some(pattern => 
      key.toLowerCase().includes(pattern)
    );
  }

  /**
   * Get data clearing statistics
   */
  public getDataStats(): {
    localStorageItems: number;
    sessionStorageItems: number;
    suspiciousItems: string[];
    recommendations: string[];
  } {
    const stats = {
      localStorageItems: 0,
      sessionStorageItems: 0,
      suspiciousItems: [] as string[],
      recommendations: [] as string[]
    };

    try {
      // Count localStorage items
      stats.localStorageItems = localStorage.length;

      // Count sessionStorage items
      stats.sessionStorageItems = sessionStorage.length;

      // Find suspicious items
      const allKeys = [
        ...Object.keys(localStorage),
        ...Object.keys(sessionStorage)
      ];

      stats.suspiciousItems = allKeys.filter(key => 
        this.isUserDataKey(key) || key.includes('kavya') || key.includes('shah')
      );

      // Generate recommendations
      if (stats.suspiciousItems.length > 0) {
        stats.recommendations.push('Clear suspicious data items');
      }

      if (stats.localStorageItems > 10) {
        stats.recommendations.push('Consider clearing localStorage');
      }

      if (stats.sessionStorageItems > 5) {
        stats.recommendations.push('Consider clearing sessionStorage');
      }

    } catch (error) {
      console.error('❌ Error getting data stats:', error);
    }

    return stats;
  }
}

// Export singleton instance
export const dataCleaner = DataCleaner.getInstance();

// Export utility functions for easy use
export const clearAllUserData = (options?: DataClearingOptions) => 
  dataCleaner.clearAllUserData(options);

export const clearFormStates = () => 
  dataCleaner.clearFormStates();

export const clearUserSpecificData = () => 
  dataCleaner.clearUserSpecificData();

export const clearAuthenticationData = () => 
  dataCleaner.clearAuthenticationData();

export const clearBrowserCache = () => 
  dataCleaner.clearBrowserCache();

export const emergencyDataClearing = () => 
  dataCleaner.emergencyDataClearing();

export const getDataStats = () => 
  dataCleaner.getDataStats();