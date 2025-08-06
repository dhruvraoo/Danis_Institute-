import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import StudentDashboard from '../StudentDashboard';
import { useAuth } from '@/contexts/AuthContext';

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

const mockStudent = {
  id: 1,
  name: 'Test Student',
  email: 'test@example.com',
  roll_id: '2024001',
  student_class: {
    id: 1,
    name: 'Grade 10A',
    grade_level: 10,
    section: 'A'
  },
  subjects_selected: [
    { id: 1, name: 'Mathematics', code: 'MATH101' },
    { id: 2, name: 'Science', code: 'SCI101' }
  ],
  user_type: 'student'
};

const mockMarksResponse = {
  success: true,
  marks: [
    {
      id: 1,
      subject: { id: 1, name: 'Mathematics', code: 'MATH101' },
      exam_type: 'midterm',
      marks_obtained: 85,
      total_marks: 100,
      percentage: 85,
      grade: 'A',
      exam_date: '2024-01-15',
      created_at: '2024-01-15 10:00:00'
    }
  ],
  subject_averages: {
    1: {
      subject_name: 'Mathematics',
      subject_code: 'MATH101',
      average_percentage: 85,
      total_exams: 1
    }
  }
};

describe('StudentDashboard - Marks Section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockStudent,
      isAuthenticated: true,
      loading: false
    });
  });

  it('should display marks for selected subjects', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, questions: [] })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockMarksResponse)
      });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Your Marks')).toBeInTheDocument();
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('85/100')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching marks', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, questions: [] })
      })
      .mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Your Marks')).toBeInTheDocument();
    });

    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should show error state when marks fetch fails', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, questions: [] })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false, message: 'Failed to fetch marks' })
      });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch marks')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('should show no subjects selected message', async () => {
    const studentWithNoSubjects = {
      ...mockStudent,
      subjects_selected: []
    };

    (useAuth as jest.Mock).mockReturnValue({
      user: studentWithNoSubjects,
      isAuthenticated: true,
      loading: false
    });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No Subjects Selected')).toBeInTheDocument();
      expect(screen.getByText('Please select subjects to view your marks and performance.')).toBeInTheDocument();
    });
  });

  it('should show no marks available message', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, questions: [] })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          marks: [],
          subject_averages: {}
        })
      });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No marks available for your selected subjects yet.')).toBeInTheDocument();
    });
  });
});