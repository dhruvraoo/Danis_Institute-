/**
 * Form State Validation and Cleaning Utilities
 * Provides utilities to validate and clean form state to prevent
 * cross-user data contamination (fixes "Kavya Shah" issue)
 */

import { getCurrentSessionId } from './sessionManager';
import { getStorageItem, removeStorageItem } from './storageManager';

export interface FormState {
  sessionId: string;
  formType: 'signup' | 'login';
  data: Record<string, any>;
  timestamp: Date;
  isClean: boolean;
}

export interface FormValidationResult {
  isValid: boolean;
  isClean: boolean;
  hasUnexpectedData: boolean;
  issues: string[];
  recommendations: string[];
}

class FormCleaner {
  private static instance: FormCleaner;
  private readonly FORM_DATA_KEY = 'form_state';
  private readonly SUSPICIOUS_NAMES = [
    'kavya shah',
    'kavya',
    'shah',
    'test user',
    'admin',
    'demo user'
  ];

  private constructor() {}

  public static getInstance(): FormCleaner {
    if (!FormCleaner.instance) {
      FormCleaner.instance = new FormCleaner();
    }
    return FormCleaner.instance;
  }

  /**
   * Validate form state for unexpected or suspicious data
   */
  public validateFormState(formData: Record<string, any>, formType: 'signup' | 'login'): FormValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let hasUnexpectedData = false;

    console.log('🔍 Validating form state:', { formType, formData });

    // Check for suspicious names
    if (formData.fullName || formData.name) {
      const name = (formData.fullName || formData.name).toLowerCase();
      const isSuspicious = this.SUSPICIOUS_NAMES.some(suspiciousName => 
        name.includes(suspiciousName)
      );
      
      if (isSuspicious) {
        hasUnexpectedData = true;
        issues.push(`Suspicious name detected: "${formData.fullName || formData.name}"`);
        recommendations.push('Clear form data and start fresh');
      }
    }

    // Check for pre-filled data in signup form (should be empty)
    if (formType === 'signup') {
      const expectedEmptyFields = ['fullName', 'email', 'password', 'rollId'];
      expectedEmptyFields.forEach(field => {
        if (formData[field] && formData[field].trim() !== '') {
          hasUnexpectedData = true;
          issues.push(`Unexpected pre-filled data in ${field}: "${formData[field]}"`);
          recommendations.push(`Clear ${field} field`);
        }
      });
    }

    // Check for data from different session
    const currentSessionId = getCurrentSessionId();
    const storedFormState = this.getStoredFormState();
    
    if (storedFormState && storedFormState.sessionId !== currentSessionId) {
      hasUnexpectedData = true;
      issues.push('Form data belongs to different session');
      recommendations.push('Clear all form data and create new session');
    }

    // Check for stale data (older than 1 hour)
    if (storedFormState) {
      const dataAge = Date.now() - new Date(storedFormState.timestamp).getTime();
      const maxAge = 60 * 60 * 1000; // 1 hour
      
      if (dataAge > maxAge) {
        hasUnexpectedData = true;
        issues.push('Form data is stale (older than 1 hour)');
        recommendations.push('Clear stale form data');
      }
    }

    const isValid = issues.length === 0;
    const isClean = isValid && !hasUnexpectedData;

    const result: FormValidationResult = {
      isValid,
      isClean,
      hasUnexpectedData,
      issues,
      recommendations
    };

    if (!isClean) {
      console.log('⚠️ Form validation failed:', result);
    } else {
      console.log('✅ Form validation passed');
    }

    return result;
  }

  /**
   * Clear all form data and reset to clean state
   */
  public clearFormData(formType?: 'signup' | 'login'): void {
    try {
      console.log('🧹 Clearing form data:', formType || 'all');

      // Remove stored form state
      removeStorageItem(this.FORM_DATA_KEY);

      // Clear any form-related localStorage items
      const formKeys = [
        'signup_form_data',
        'login_form_data',
        'form_cache',
        'user_input_cache',
        'temp_form_data'
      ];

      formKeys.forEach(key => {
        removeStorageItem(key);
      });

      console.log('✨ Form data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing form data:', error);
    }
  }

  /**
   * Reset form on navigation or component unmount
   */
  public resetFormOnNavigation(fromPath: string, toPath: string): void {
    console.log('🔄 Resetting form on navigation:', { fromPath, toPath });

    // Clear form data when navigating away from forms
    if (fromPath.includes('/signup') || fromPath.includes('/login')) {
      this.clearFormData();
    }

    // Ensure clean state when navigating to forms
    if (toPath.includes('/signup') || toPath.includes('/login')) {
      this.clearFormData();
      this.createCleanFormState(toPath.includes('/signup') ? 'signup' : 'login');
    }
  }

  /**
   * Detect and handle unexpected pre-filled data
   */
  public detectUnexpectedData(formData: Record<string, any>, formType: 'signup' | 'login'): boolean {
    const validation = this.validateFormState(formData, formType);
    
    if (validation.hasUnexpectedData) {
      console.log('🚨 Unexpected data detected - auto-clearing');
      this.clearFormData(formType);
      
      // Show warning to user (optional)
      if (typeof window !== 'undefined') {
        console.warn('Form contained unexpected data and has been cleared for security');
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Create clean form state for new session
   */
  public createCleanFormState(formType: 'signup' | 'login'): FormState {
    const cleanState: FormState = {
      sessionId: getCurrentSessionId(),
      formType,
      data: {},
      timestamp: new Date(),
      isClean: true
    };

    this.storeFormState(cleanState);
    console.log('✨ Created clean form state:', formType);
    
    return cleanState;
  }

  /**
   * Monitor form state for contamination
   */
  public monitorFormState(formData: Record<string, any>, formType: 'signup' | 'login'): void {
    // Continuous monitoring for suspicious changes
    const validation = this.validateFormState(formData, formType);
    
    if (!validation.isClean) {
      console.log('🔍 Form state monitoring detected issues:', validation.issues);
      
      // Auto-clear if critical issues found
      const criticalIssues = validation.issues.filter(issue => 
        issue.includes('Suspicious name') || 
        issue.includes('different session')
      );
      
      if (criticalIssues.length > 0) {
        console.log('🚨 Critical form contamination detected - auto-clearing');
        this.clearFormData(formType);
      }
    }
  }

  /**
   * Get clean default values for form fields
   */
  public getCleanDefaults(formType: 'signup' | 'login'): Record<string, any> {
    const defaults = {
      signup: {
        fullName: "",
        email: "",
        password: "",
        rollId: "",
        classId: "",
        subjectIds: []
      },
      login: {
        email: "",
        password: ""
      }
    };

    return defaults[formType] || {};
  }

  /**
   * Validate that form data matches expected clean defaults
   */
  public isFormDataClean(formData: Record<string, any>, formType: 'signup' | 'login'): boolean {
    const cleanDefaults = this.getCleanDefaults(formType);
    
    // Check if all fields match clean defaults
    for (const [key, value] of Object.entries(cleanDefaults)) {
      const formValue = formData[key];
      
      if (Array.isArray(value)) {
        if (!Array.isArray(formValue) || formValue.length !== 0) {
          return false;
        }
      } else if (formValue !== value) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Store form state with session validation
   */
  private storeFormState(formState: FormState): void {
    try {
      // Store with 1 hour expiration
      const storageManager = require('./storageManager');
      storageManager.setStorageItem(this.FORM_DATA_KEY, formState, 1);
    } catch (error) {
      console.error('❌ Error storing form state:', error);
    }
  }

  /**
   * Get stored form state with session validation
   */
  private getStoredFormState(): FormState | null {
    try {
      const storageManager = require('./storageManager');
      return storageManager.getStorageItem(this.FORM_DATA_KEY);
    } catch (error) {
      console.error('❌ Error getting stored form state:', error);
      return null;
    }
  }

  /**
   * Emergency form cleaning (nuclear option)
   */
  public emergencyFormClean(): void {
    console.log('🚨 Emergency form cleaning initiated');
    
    try {
      // Clear all possible form-related data
      const allPossibleKeys = [
        'form_state',
        'signup_form_data',
        'login_form_data',
        'form_cache',
        'user_input_cache',
        'temp_form_data',
        'cached_form_values',
        'form_backup',
        'user_form_data'
      ];

      allPossibleKeys.forEach(key => {
        removeStorageItem(key);
        // Also try to remove from regular localStorage as fallback
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore errors
        }
      });

      console.log('🧽 Emergency form cleaning completed');
    } catch (error) {
      console.error('❌ Error during emergency form cleaning:', error);
    }
  }
}

// Export singleton instance
export const formCleaner = FormCleaner.getInstance();

// Export utility functions for easy use
export const validateFormState = (formData: Record<string, any>, formType: 'signup' | 'login') => 
  formCleaner.validateFormState(formData, formType);

export const clearFormData = (formType?: 'signup' | 'login') => 
  formCleaner.clearFormData(formType);

export const resetFormOnNavigation = (fromPath: string, toPath: string) => 
  formCleaner.resetFormOnNavigation(fromPath, toPath);

export const detectUnexpectedData = (formData: Record<string, any>, formType: 'signup' | 'login') => 
  formCleaner.detectUnexpectedData(formData, formType);

export const createCleanFormState = (formType: 'signup' | 'login') => 
  formCleaner.createCleanFormState(formType);

export const monitorFormState = (formData: Record<string, any>, formType: 'signup' | 'login') => 
  formCleaner.monitorFormState(formData, formType);

export const getCleanDefaults = (formType: 'signup' | 'login') => 
  formCleaner.getCleanDefaults(formType);

export const isFormDataClean = (formData: Record<string, any>, formType: 'signup' | 'login') => 
  formCleaner.isFormDataClean(formData, formType);

export const emergencyFormClean = () => 
  formCleaner.emergencyFormClean();