import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SubjectFilterProvider, useSubjectFilter } from '../SubjectFilterContext';
import { AuthProvider } from '../AuthContext';

// Mock the AuthContext
jest.mock('../AuthContext', () => ({
  useAuth: () => ({
    user: {
      user_type: 'student',
      subjects_selected: [
        { id: 1, name: 'Mathematics', code: 'MATH101' },
        { id: 2, name: 'Science', code: 'SCI101' }
      ]
    },
    isAuthenticated: true
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock fetch
global.fetch = jest.fn();

// Test component that uses the context
const TestComponent: React.FC = () => {
  const { selectedSubjects, isLoading, error } = useSubjectFilter();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <div data-testid="subjects-count">{selectedSubjects.length}</div>
      {selectedSubjects.map(subject => (
        <div key={subject.id} data-testid={`subject-${subject.id}`}>
          {subject.name} ({subject.code})
        </div>
      ))}
    </div>
  );
};

describe('SubjectFilterContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide initial subjects from user data', async () => {
    render(
      <AuthProvider>
        <SubjectFilterProvider>
          <TestComponent />
        </SubjectFilterProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('subjects-count')).toHaveTextContent('2');
      expect(screen.getByTestId('subject-1')).toHaveTextContent('Mathematics (MATH101)');
      expect(screen.getByTestId('subject-2')).toHaveTextContent('Science (SCI101)');
    });
  });

  it('should show not loading initially', () => {
    render(
      <AuthProvider>
        <SubjectFilterProvider>
          <TestComponent />
        </SubjectFilterProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSubjectFilter must be used within a SubjectFilterProvider');
    
    consoleSpy.mockRestore();
  });
});