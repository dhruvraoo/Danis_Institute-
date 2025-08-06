import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Types
interface Subject {
  id: number;
  name: string;
  code: string;
}

interface SubjectFilterContextType {
  selectedSubjects: Subject[];
  isLoading: boolean;
  error: string | null;
  updateSubjects: (subjects: Subject[]) => Promise<boolean>;
  refreshSubjects: () => Promise<void>;
  clearError: () => void;
}

// Create context
const SubjectFilterContext = createContext<SubjectFilterContextType | undefined>(undefined);

// Provider component
interface SubjectFilterProviderProps {
  children: ReactNode;
}

export const SubjectFilterProvider: React.FC<SubjectFilterProviderProps> = ({ children }) => {
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Initialize subjects from user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user && user.user_type === 'student' && user.subjects_selected) {
      setSelectedSubjects(user.subjects_selected);
    } else {
      setSelectedSubjects([]);
    }
  }, [isAuthenticated, user]);

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Refresh subjects from server
  const refreshSubjects = async (): Promise<void> => {
    if (!isAuthenticated || !user || user.user_type !== 'student') {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/api/student/current/', {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.student) {
        setSelectedSubjects(data.student.subjects_selected || []);
      } else {
        throw new Error(data.message || 'Failed to fetch current student data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh subjects';
      setError(errorMessage);
      console.error('Error refreshing subjects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update subjects on server and local state
  const updateSubjects = async (subjects: Subject[]): Promise<boolean> => {
    if (!isAuthenticated || !user || user.user_type !== 'student') {
      setError('Not authenticated as student');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/api/student/update-subjects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject_ids: subjects.map(subject => subject.id)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedSubjects(data.subjects || []);
        return true;
      } else {
        throw new Error(data.message || 'Failed to update subjects');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update subjects';
      setError(errorMessage);
      console.error('Error updating subjects:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: SubjectFilterContextType = {
    selectedSubjects,
    isLoading,
    error,
    updateSubjects,
    refreshSubjects,
    clearError,
  };

  return (
    <SubjectFilterContext.Provider value={contextValue}>
      {children}
    </SubjectFilterContext.Provider>
  );
};

// Hook to use the context
export const useSubjectFilter = (): SubjectFilterContextType => {
  const context = useContext(SubjectFilterContext);
  if (context === undefined) {
    throw new Error('useSubjectFilter must be used within a SubjectFilterProvider');
  }
  return context;
};

export default SubjectFilterContext;