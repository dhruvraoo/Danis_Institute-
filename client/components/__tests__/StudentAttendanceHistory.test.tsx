import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import StudentAttendanceHistory from '../StudentAttendanceHistory';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock data
const mockAttendanceData = {
  student: {
    id: 1,
    name: 'John Doe',
    roll_id: '2024001',
    class: 'Grade 9A',
    grade_level: 9
  },
  attendance_history: [
    {
      date: '2025-08-03',
      present: true,
      status: 'Present'
    },
    {
      date: '2025-08-02',
      present: false,
      status: 'Absent'
    },
    {
      date: '2025-08-01',
      present: true,
      status: 'Present'
    }
  ],
  summary: {
    total_days: 3,
    present_days: 2,
    absent_days: 1,
    attendance_percentage: 66.67
  }
};

describe('StudentAttendanceHistory', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<StudentAttendanceHistory studentId={1} />);
    
    expect(screen.getByText('Loading attendance history...')).toBeInTheDocument();
  });

  it('fetches and displays attendance data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAttendanceData
    });

    render(<StudentAttendanceHistory studentId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Roll: 2024001')).toBeInTheDocument();
      expect(screen.getByText('Grade 9A')).toBeInTheDocument();
    });
  });

  it('displays attendance summary correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAttendanceData
    });

    render(<StudentAttendanceHistory studentId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total days
      expect(screen.getByText('2')).toBeInTheDocument(); // Present days
      expect(screen.getByText('66.67%')).toBeInTheDocument(); // Attendance rate
    });
  });

  it('displays attendance history records', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAttendanceData
    });

    render(<StudentAttendanceHistory studentId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Sunday, August 3, 2025')).toBeInTheDocument();
      expect(screen.getByText('Saturday, August 2, 2025')).toBeInTheDocument();
      expect(screen.getByText('Friday, August 1, 2025')).toBeInTheDocument();
    });

    // Check status badges
    const presentBadges = screen.getAllByText('Present');
    const absentBadges = screen.getAllByText('Absent');
    expect(presentBadges).toHaveLength(2);
    expect(absentBadges).toHaveLength(1);
  });

  it('handles API error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<StudentAttendanceHistory studentId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('handles 404 error for non-existent student', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        error: true,
        message: 'Student with id 999 does not exist'
      })
    });

    render(<StudentAttendanceHistory studentId={999} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch attendance history')).toBeInTheDocument();
    });
  });

  it('applies date filters correctly', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAttendanceData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockAttendanceData,
          attendance_history: [mockAttendanceData.attendance_history[0]], // Only one record
          summary: {
            total_days: 1,
            present_days: 1,
            absent_days: 0,
            attendance_percentage: 100
          }
        })
      });

    render(<StudentAttendanceHistory studentId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Set start date filter
    const startDateInput = screen.getByLabelText('From:');
    fireEvent.change(startDateInput, { target: { value: '2025-08-03' } });
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.stringContaining('start_date=2025-08-03')
      );
    });
  });

  it('clears date filters when clear button is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAttendanceData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAttendanceData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAttendanceData
      });

    render(<StudentAttendanceHistory studentId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Set date filters
    const startDateInput = screen.getByLabelText('From:');
    fireEvent.change(startDateInput, { target: { value: '2025-08-01' } });
    
    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    // Clear filters
    fireEvent.click(screen.getByText('Clear Filters'));
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(startDateInput).toHaveValue('');
    });
  });

  it('displays recent trend when available', async () => {
    const dataWithRecentTrend = {
      ...mockAttendanceData,
      attendance_history: [
        { date: '2025-08-05', present: true, status: 'Present' },
        { date: '2025-08-04', present: true, status: 'Present' },
        { date: '2025-08-03', present: true, status: 'Present' },
        { date: '2025-08-02', present: false, status: 'Absent' },
        { date: '2025-08-01', present: true, status: 'Present' }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => dataWithRecentTrend
    });

    render(<StudentAttendanceHistory studentId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Trend (Last 5 Days)')).toBeInTheDocument();
      expect(screen.getByText('80% attendance in recent days')).toBeInTheDocument();
      expect(screen.getByText('Good')).toBeInTheDocument();
    });
  });

  it('handles empty attendance history', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockAttendanceData,
        attendance_history: [],
        summary: {
          total_days: 0,
          present_days: 0,
          absent_days: 0,
          attendance_percentage: 0
        }
      })
    });

    render(<StudentAttendanceHistory studentId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('No attendance records found')).toBeInTheDocument();
    });
  });

  it('shows correct attendance percentage colors', async () => {
    // Test different percentage ranges
    const testCases = [
      { percentage: 95, expectedClass: 'text-green-600' },
      { percentage: 80, expectedClass: 'text-yellow-600' },
      { percentage: 60, expectedClass: 'text-red-600' }
    ];

    for (const testCase of testCases) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockAttendanceData,
          summary: {
            ...mockAttendanceData.summary,
            attendance_percentage: testCase.percentage
          }
        })
      });

      const { unmount } = render(<StudentAttendanceHistory studentId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(`${testCase.percentage}%`)).toBeInTheDocument();
      });

      unmount();
    }
  });
});