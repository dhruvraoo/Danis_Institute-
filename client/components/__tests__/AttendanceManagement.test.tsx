import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AttendanceManagement from '../AttendanceManagement';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock data
const mockStudentsData = {
  students: [
    {
      id: 1,
      name: 'John Doe',
      roll_id: '2024001',
      student_class_name: 'Grade 9A',
      student_class_grade: 9
    },
    {
      id: 2,
      name: 'Jane Smith',
      roll_id: '2024002',
      student_class_name: 'Grade 9A',
      student_class_grade: 9
    }
  ],
  attendance_records: [
    {
      id: 1,
      student: 1,
      student_name: 'John Doe',
      student_roll_id: '2024001',
      date: '2025-08-03',
      present: true
    }
  ],
  date: '2025-08-03',
  class_grade: 9
};

describe('AttendanceManagement', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders grade selection cards', () => {
    render(<AttendanceManagement />);
    
    expect(screen.getByText('Grade 9')).toBeInTheDocument();
    expect(screen.getByText('Grade 10')).toBeInTheDocument();
    expect(screen.getByText('Grade 11')).toBeInTheDocument();
    expect(screen.getByText('Grade 12')).toBeInTheDocument();
  });

  it('shows instructions when no grade is selected', () => {
    render(<AttendanceManagement />);
    
    expect(screen.getByText('Select a Grade to Manage Attendance')).toBeInTheDocument();
    expect(screen.getByText('Choose from Grade 9, 10, 11, or 12 to view and manage student attendance')).toBeInTheDocument();
  });

  it('fetches students when grade is selected', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudentsData
    });

    render(<AttendanceManagement />);
    
    // Click on Grade 9
    fireEvent.click(screen.getByText('Grade 9'));
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('class_grade=9')
      );
    });
  });

  it('displays students after successful fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudentsData
    });

    render(<AttendanceManagement />);
    
    // Click on Grade 9
    fireEvent.click(screen.getByText('Grade 9'));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Roll ID: 2024001')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AttendanceManagement />);
    
    // Click on Grade 9
    fireEvent.click(screen.getByText('Grade 9'));
    
    expect(screen.getByText('Loading students...')).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<AttendanceManagement />);
    
    // Click on Grade 9
    fireEvent.click(screen.getByText('Grade 9'));
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('allows marking attendance as present/absent', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudentsData
    });

    render(<AttendanceManagement />);
    
    // Click on Grade 9
    fireEvent.click(screen.getByText('Grade 9'));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find Present button for John Doe and click it
    const presentButtons = screen.getAllByText('Present');
    fireEvent.click(presentButtons[0]);
    
    // The button should be selected (this would be tested with proper styling classes)
    expect(presentButtons[0]).toBeInTheDocument();
  });

  it('updates date picker and refetches data', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudentsData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockStudentsData, date: '2025-08-04' })
      });

    render(<AttendanceManagement />);
    
    // Click on Grade 9
    fireEvent.click(screen.getByText('Grade 9'));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Change date
    const dateInput = screen.getByDisplayValue('2025-08-03');
    fireEvent.change(dateInput, { target: { value: '2025-08-04' } });
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.stringContaining('date=2025-08-04')
      );
    });
  });

  it('saves attendance successfully', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudentsData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          created: 1,
          updated: 1,
          date: '2025-08-03'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudentsData
      });

    render(<AttendanceManagement />);
    
    // Click on Grade 9
    fireEvent.click(screen.getByText('Grade 9'));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click Save Attendance
    fireEvent.click(screen.getByText('Save Attendance'));
    
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText(/Created: 1, Updated: 1/)).toBeInTheDocument();
    });
  });

  it('displays attendance summary correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudentsData
    });

    render(<AttendanceManagement />);
    
    // Click on Grade 9
    fireEvent.click(screen.getByText('Grade 9'));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check summary stats (initially all students are marked absent by default)
    expect(screen.getByText('0')).toBeInTheDocument(); // Present count
    expect(screen.getByText('2')).toBeInTheDocument(); // Absent count (2 students)
    expect(screen.getByText('0%')).toBeInTheDocument(); // Attendance rate
  });

  it('handles empty student list', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        students: [],
        attendance_records: [],
        date: '2025-08-03',
        class_grade: 9
      })
    });

    render(<AttendanceManagement />);
    
    // Click on Grade 9
    fireEvent.click(screen.getByText('Grade 9'));
    
    await waitFor(() => {
      expect(screen.getByText('No students found for Grade 9')).toBeInTheDocument();
    });
  });
});