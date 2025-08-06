/**
 * Session Management Utility
 * Handles session ID generation, validation, and data clearing to prevent
 * cross-user data contamination (fixes "Kavya Shah" issue)
 */

export interface SessionData {
  sessionId: string;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

class SessionManager {
  private static instance: SessionManager;
  private currentSessionId: string | null = null;
  private readonly SESSION_KEY = 'app_session_id';
  private readonly SESSION_DATA_KEY = 'app_session_data';

  private constructor() {
    this.initializeSession();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Generate a unique session ID
   */
  public generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const sessionId = `session_${timestamp}_${random}`;
    
    console.log('🆔 Generated new session ID:', sessionId);
    return sessionId;
  }

  /**
   * Get current session ID, create one if it doesn't exist
   */
  public getCurrentSessionId(): string {
    if (!this.currentSessionId) {
      this.currentSessionId = this.generateSessionId();
      this.storeSessionId(this.currentSessionId);
    }
    return this.currentSessionId;
  }

  /**
   * Check if this is a new session (different from stored session)
   */
  public isNewSession(): boolean {
    const storedSessionId = this.getStoredSessionId();
    const currentSessionId = this.getCurrentSessionId();
    
    const isNew = !storedSessionId || storedSessionId !== currentSessionId;
    
    if (isNew) {
      console.log('🔄 New session detected:', {
        stored: storedSessionId,
        current: currentSessionId
      });
    }
    
    return isNew;
  }

  /**
   * Initialize session on app start
   */
  private initializeSession(): void {
    const storedSessionId = this.getStoredSessionId();
    const storedSessionData = this.getStoredSessionData();
    
    // Check if we have a valid existing session
    if (storedSessionId && storedSessionData && this.isSessionValid(storedSessionData)) {
      this.currentSessionId = storedSessionId;
      this.updateLastActivity();
      console.log('♻️ Restored existing session:', storedSessionId);
    } else {
      // Create new session and clear any stale data
      this.createNewSession();
      this.clearAllStaleData();
      console.log('🆕 Created new session due to invalid/missing session data');
    }
  }

  /**
   * Create a completely new session
   */
  public createNewSession(): void {
    this.currentSessionId = this.generateSessionId();
    this.storeSessionId(this.currentSessionId);
    this.storeSessionData({
      sessionId: this.currentSessionId,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true
    });
    
    console.log('✨ New session created:', this.currentSessionId);
  }

  /**
   * Clear all session data
   */
  public clearSessionData(): void {
    try {
      // Clear from sessionStorage (session-specific data)
      sessionStorage.removeItem(this.SESSION_KEY);
      sessionStorage.removeItem(this.SESSION_DATA_KEY);
      
      // Clear from localStorage (persistent data that might leak)
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('form_data');
      localStorage.removeItem('cached_user_data');
      
      // Clear any other potential data sources
      this.clearAllStaleData();
      
      this.currentSessionId = null;
      
      console.log('🧹 Session data cleared completely');
    } catch (error) {
      console.error('❌ Error clearing session data:', error);
    }
  }

  /**
   * Update last activity timestamp
   */
  public updateLastActivity(): void {
    const sessionData = this.getStoredSessionData();
    if (sessionData) {
      sessionData.lastActivity = new Date();
      this.storeSessionData(sessionData);
    }
  }

  /**
   * Check if session is valid (not expired, not corrupted)
   */
  private isSessionValid(sessionData: SessionData): boolean {
    if (!sessionData || !sessionData.sessionId || !sessionData.createdAt) {
      return false;
    }

    // Check if session is too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const sessionAge = Date.now() - new Date(sessionData.createdAt).getTime();
    
    if (sessionAge > maxAge) {
      console.log('⏰ Session expired due to age:', sessionAge / (60 * 60 * 1000), 'hours');
      return false;
    }

    // Check if session is inactive (2 hours)
    const maxInactivity = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const inactivityTime = Date.now() - new Date(sessionData.lastActivity).getTime();
    
    if (inactivityTime > maxInactivity) {
      console.log('💤 Session expired due to inactivity:', inactivityTime / (60 * 60 * 1000), 'hours');
      return false;
    }

    return sessionData.isActive;
  }

  /**
   * Store session ID in sessionStorage
   */
  private storeSessionId(sessionId: string): void {
    try {
      sessionStorage.setItem(this.SESSION_KEY, sessionId);
    } catch (error) {
      console.error('❌ Error storing session ID:', error);
    }
  }

  /**
   * Get stored session ID from sessionStorage
   */
  private getStoredSessionId(): string | null {
    try {
      return sessionStorage.getItem(this.SESSION_KEY);
    } catch (error) {
      console.error('❌ Error getting stored session ID:', error);
      return null;
    }
  }

  /**
   * Store session data in sessionStorage
   */
  private storeSessionData(data: SessionData): void {
    try {
      sessionStorage.setItem(this.SESSION_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('❌ Error storing session data:', error);
    }
  }

  /**
   * Get stored session data from sessionStorage
   */
  private getStoredSessionData(): SessionData | null {
    try {
      const data = sessionStorage.getItem(this.SESSION_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Error getting stored session data:', error);
      return null;
    }
  }

  /**
   * Clear all potentially stale data from various storage locations
   */
  private clearAllStaleData(): void {
    try {
      // List of keys that might contain user data
      const potentialUserDataKeys = [
        'user',
        'auth_token',
        'form_data',
        'cached_user_data',
        'student_data',
        'login_data',
        'signup_data',
        'dashboard_data'
      ];

      // Clear from localStorage
      potentialUserDataKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear from sessionStorage (except our session management keys)
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key !== this.SESSION_KEY && key !== this.SESSION_DATA_KEY) {
          sessionStorage.removeItem(key);
        }
      });

      console.log('🧽 Cleared all potentially stale data');
    } catch (error) {
      console.error('❌ Error clearing stale data:', error);
    }
  }

  /**
   * Get session info for debugging
   */
  public getSessionInfo(): {
    sessionId: string | null;
    isNew: boolean;
    sessionData: SessionData | null;
  } {
    return {
      sessionId: this.currentSessionId,
      isNew: this.isNewSession(),
      sessionData: this.getStoredSessionData()
    };
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();

// Export utility functions for easy use
export const getCurrentSessionId = () => sessionManager.getCurrentSessionId();
export const isNewSession = () => sessionManager.isNewSession();
export const clearSessionData = () => sessionManager.clearSessionData();
export const createNewSession = () => sessionManager.createNewSession();
export const updateLastActivity = () => sessionManager.updateLastActivity();
export const getSessionInfo = () => sessionManager.getSessionInfo();