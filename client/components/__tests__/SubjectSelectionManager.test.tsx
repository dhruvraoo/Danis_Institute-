import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SubjectSelectionManager from '../SubjectSelectionManager';
import { SubjectFilterProvider } from '@/contexts/SubjectFilterContext';

// Mock the SubjectFilterContext
jest.mock('@/contexts/SubjectFilterContext', () => ({
  useSubjectFilter: () => ({
    selectedSubjects: [
      { id: 1, name: 'Mathematics', code: 'MATH101' }
    ],
    isLoading: false,
    error: null,
    updateSubjects: jest.fn().mockResolvedValue(true),
    clearError: jest.fn()
  }),
  SubjectFilterProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock fetch
global.fetch = jest.fn();

const mockSubjects = [
  { id: 1, name: 'Mathematics', code: 'MATH101' },
  { id: 2, name: 'Science', code: 'SCI101' },
  { id: 3, name: 'English', code: 'ENG101' }
];

describe('SubjectSelectionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        subjects: mockSubjects
      })
    });
  });

  it('should render with available subjects', async () => {
    render(
      <SubjectFilterProvider>
        <SubjectSelectionManager availableSubjects={mockSubjects} />
      </SubjectFilterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Subject Selection')).toBeInTheDocument();
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('Science')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  it('should show selected subjects count', async () => {
    render(
      <SubjectFilterProvider>
        <SubjectSelectionManager availableSubjects={mockSubjects} />
      </SubjectFilterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Selected: 1 of 3 subjects')).toBeInTheDocument();
    });
  });

  it('should handle subject selection toggle', async () => {
    const onSubjectsChange = jest.fn();
    
    render(
      <SubjectFilterProvider>
        <SubjectSelectionManager 
          availableSubjects={mockSubjects}
          onSubjectsChange={onSubjectsChange}
        />
      </SubjectFilterProvider>
    );

    await waitFor(() => {
      const scienceCheckbox = screen.getByLabelText(/Science/);
      fireEvent.click(scienceCheckbox);
    });

    expect(onSubjectsChange).toHaveBeenCalled();
  });

  it('should disable interactions in readonly mode', async () => {
    render(
      <SubjectFilterProvider>
        <SubjectSelectionManager 
          availableSubjects={mockSubjects}
          readonly={true}
        />
      </SubjectFilterProvider>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled();
      });
      
      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    });
  });

  it('should show loading state when fetching subjects', () => {
    render(
      <SubjectFilterProvider>
        <SubjectSelectionManager />
      </SubjectFilterProvider>
    );

    expect(screen.getByText('Loading available subjects...')).toBeInTheDocument();
  });
});