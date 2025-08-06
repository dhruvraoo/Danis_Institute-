/**
 * Simple Session Manager (Fallback)
 * Basic session management without complex features
 */

export const getCurrentSessionId = (): string => {
  try {
    let sessionId = sessionStorage.getItem('simple_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem('simple_session_id', sessionId);
    }
    return sessionId;
  } catch (error) {
    console.error('Error getting session ID:', error);
    return `fallback_${Date.now()}`;
  }
};

export const clearSessionData = (): void => {
  try {
    // Clear localStorage items that might contain user data
    const keysToRemove = ['user', 'auth_token', 'cached_user_data'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear session storage
    sessionStorage.clear();
    
    console.log('✅ Session data cleared');
  } catch (error) {
    console.error('Error clearing session data:', error);
  }
};

export const cleanupExpiredData = (): void => {
  try {
    // Simple cleanup - just remove any data that might be suspicious
    const userData = localStorage.getItem('user');
    if (userData && userData.toLowerCase().includes('kavya')) {
      localStorage.removeItem('user');
      console.log('🧹 Removed suspicious user data');
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};