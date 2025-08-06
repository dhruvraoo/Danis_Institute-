/**
 * Session-Aware Storage Manager
 * Provides safe localStorage operations with session validation to prevent
 * cross-user data contamination (fixes "Kavya Shah" issue)
 */

import { sessionManager, getCurrentSessionId } from './sessionManager';

export interface StorageItem {
  sessionId: string;
  data: any;
  timestamp: Date;
  expiresAt?: Date;
}

class StorageManager {
  private static instance: StorageManager;
  private readonly STORAGE_PREFIX = 'app_';

  private constructor() {}

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Set item in localStorage with session validation
   */
  public setItem(key: string, value: any, expirationHours?: number): boolean {
    try {
      const sessionId = getCurrentSessionId();
      const now = new Date();
      const expiresAt = expirationHours 
        ? new Date(now.getTime() + (expirationHours * 60 * 60 * 1000))
        : undefined;

      const storageItem: StorageItem = {
        sessionId,
        data: value,
        timestamp: now,
        expiresAt
      };

      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(storageItem));
      
      console.log('💾 Stored item with session validation:', {
        key: storageKey,
        sessionId,
        expiresAt
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error setting storage item:', error);
      return false;
    }
  }

  /**
   * Get item from localStorage with session validation
   */
  public getItem(key: string): any {
    try {
      const currentSessionId = getCurrentSessionId();
      const storageKey = this.getStorageKey(key);
      const storedValue = localStorage.getItem(storageKey);

      if (!storedValue) {
        return null;
      }

      const storageItem: StorageItem = JSON.parse(storedValue);

      // Validate session ownership
      if (!this.validateDataOwnership(storageItem, currentSessionId)) {
        console.log('🚫 Data ownership validation failed, removing item:', {
          key: storageKey,
          storedSessionId: storageItem.sessionId,
          currentSessionId
        });
        this.removeItem(key);
        return null;
      }

      // Check expiration
      if (this.isExpired(storageItem)) {
        console.log('⏰ Data expired, removing item:', {
          key: storageKey,
          expiresAt: storageItem.expiresAt
        });
        this.removeItem(key);
        return null;
      }

      console.log('✅ Retrieved valid item:', {
        key: storageKey,
        sessionId: storageItem.sessionId
      });

      return storageItem.data;
    } catch (error) {
      console.error('❌ Error getting storage item:', error);
      // If there's an error parsing, remove the corrupted item
      this.removeItem(key);
      return null;
    }
  }

  /**
   * Remove specific item from localStorage
   */
  public removeItem(key: string): boolean {
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
      
      console.log('🗑️ Removed storage item:', storageKey);
      return true;
    } catch (error) {
      console.error('❌ Error removing storage item:', error);
      return false;
    }
  }

  /**
   * Clear all data for current session
   */
  public clearCurrentSessionData(): void {
    try {
      const currentSessionId = getCurrentSessionId();
      const keysToRemove: string[] = [];

      // Find all keys that belong to current session
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const storageItem: StorageItem = JSON.parse(value);
              if (storageItem.sessionId === currentSessionId) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // If we can't parse it, it's probably corrupted, so remove it
            keysToRemove.push(key);
          }
        }
      }

      // Remove all identified keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('🧹 Cleared current session data:', {
        sessionId: currentSessionId,
        itemsRemoved: keysToRemove.length
      });
    } catch (error) {
      console.error('❌ Error clearing current session data:', error);
    }
  }

  /**
   * Clear all data for all sessions (emergency cleanup)
   */
  public clearAllSessionData(): void {
    try {
      const keysToRemove: string[] = [];

      // Find all app-related keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(this.STORAGE_PREFIX) || this.isUserDataKey(key))) {
          keysToRemove.push(key);
        }
      }

      // Remove all identified keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('🧽 Emergency cleanup - cleared all session data:', {
        itemsRemoved: keysToRemove.length
      });
    } catch (error) {
      console.error('❌ Error clearing all session data:', error);
    }
  }

  /**
   * Clean up expired and invalid data
   */
  public cleanupExpiredData(): void {
    try {
      const currentSessionId = getCurrentSessionId();
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const storageItem: StorageItem = JSON.parse(value);
              
              // Remove if expired or belongs to different session
              if (this.isExpired(storageItem) || 
                  !this.validateDataOwnership(storageItem, currentSessionId)) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // Remove corrupted items
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      if (keysToRemove.length > 0) {
        console.log('🧼 Cleaned up expired/invalid data:', {
          itemsRemoved: keysToRemove.length
        });
      }
    } catch (error) {
      console.error('❌ Error cleaning up expired data:', error);
    }
  }

  /**
   * Validate that data belongs to current session
   */
  public validateDataOwnership(storageItem: StorageItem, currentSessionId: string): boolean {
    if (!storageItem || !storageItem.sessionId) {
      return false;
    }

    return storageItem.sessionId === currentSessionId;
  }

  /**
   * Check if storage item is expired
   */
  private isExpired(storageItem: StorageItem): boolean {
    if (!storageItem.expiresAt) {
      return false; // No expiration set
    }

    return new Date() > new Date(storageItem.expiresAt);
  }

  /**
   * Generate storage key with prefix
   */
  private getStorageKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`;
  }

  /**
   * Check if a key is likely to contain user data
   */
  private isUserDataKey(key: string): boolean {
    const userDataKeys = [
      'user',
      'auth_token',
      'form_data',
      'cached_user_data',
      'student_data',
      'login_data',
      'signup_data',
      'dashboard_data'
    ];

    return userDataKeys.some(userKey => key.includes(userKey));
  }

  /**
   * Get storage statistics for debugging
   */
  public getStorageStats(): {
    totalItems: number;
    currentSessionItems: number;
    expiredItems: number;
    invalidItems: number;
  } {
    let totalItems = 0;
    let currentSessionItems = 0;
    let expiredItems = 0;
    let invalidItems = 0;

    const currentSessionId = getCurrentSessionId();

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          totalItems++;
          
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const storageItem: StorageItem = JSON.parse(value);
              
              if (storageItem.sessionId === currentSessionId) {
                currentSessionItems++;
              }
              
              if (this.isExpired(storageItem)) {
                expiredItems++;
              }
            }
          } catch (error) {
            invalidItems++;
          }
        }
      }
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
    }

    return {
      totalItems,
      currentSessionItems,
      expiredItems,
      invalidItems
    };
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance();

// Export utility functions for easy use
export const setStorageItem = (key: string, value: any, expirationHours?: number) => 
  storageManager.setItem(key, value, expirationHours);

export const getStorageItem = (key: string) => 
  storageManager.getItem(key);

export const removeStorageItem = (key: string) => 
  storageManager.removeItem(key);

export const clearCurrentSessionData = () => 
  storageManager.clearCurrentSessionData();

export const clearAllSessionData = () => 
  storageManager.clearAllSessionData();

export const cleanupExpiredData = () => 
  storageManager.cleanupExpiredData();

export const getStorageStats = () => 
  storageManager.getStorageStats();