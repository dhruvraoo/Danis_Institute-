import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AttendanceManagement from '../AttendanceManagement';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Attendance Management Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('completes full attendance workflow', async () => {
    // Mock initial data fetch
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
      attendance_records: [],
      date: '2025-08-03',
      class_grade: 9
    };

    // Mock save response
    const mockSaveResponse = {
      success: true,
      created: 2,
      updated: 0,
      date: '2025-08-03'
    };

    // Mock updated data after save
    const mockUpdatedData = {
      ...mockStudentsData,
      attendance_records: [
        {
          id: 1,
          student: 1,
          student_name: 'John Doe',
          student_roll_id: '2024001',
          date: '2025-08-03',
          present: true
        },
        {
          id: 2,
          student: 2,
          student_name: 'Jane Smith',
          student_roll_id: '2024002',
          date: '2025-08-03',
          present: false
        }
      ]
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudentsData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSaveResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedData
      });

    render(<AttendanceManagement />);

    // Step 1: Select Grade 9
    fireEvent.click(screen.getByText('Grade 9'));

    // Wait for students to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Step 2: Mark attendance
    const presentButtons = screen.getAllByText('Present');
    const absentButtons = screen.getAllByText('Absent');

    // Mark John as present
    fireEvent.click(presentButtons[0]);
    
    // Mark Jane as absent
    fireEvent.click(absentButtons[1]);

    // Step 3: Save attendance
    fireEvent.click(screen.getByText('Save Attendance'));

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText(/Created: 2, Updated: 0/)).toBeInTheDocument();
    });

    // Verify API calls
    expect(mockFetch).toHaveBeenCalledTimes(3);
    
    // First call: fetch students
    expect(mockFetch).toHaveBeenNthCalledWith(1, 
      expect.stringContaining('class_grade=9')
    );

    // Second call: save attendance
    expect(mockFetch).toHaveBeenNthCalledWith(2, 
      'http://127.0.0.1:8000/api/attendance/admin/',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: '2025-08-03',
          attendance_data: [
            { student_id: 1, present: true },
            { student_id: 2, present: false }
          ]
        })
      })
    );

    // Third call: refresh data
    expect(mockFetch).toHaveBeenNthCalledWith(3, 
      expect.stringContaining('class_grade=9')
    );
  });

  it('handles date change and refetches data', async () => {
    const mockDataDay1 = {
      students: [
        {
          id: 1,
          name: 'John Doe',
          roll_id: '2024001',
          student_class_name: 'Grade 9A',
          student_class_grade: 9
        }
      ],
      attendance_records: [],
      date: '2025-08-03',
      class_grade: 9
    };

    const mockDataDay2 = {
      ...mockDataDay1,
      attendance_records: [
        {
          id: 1,
          student: 1,
          student_name: 'John Doe',
          student_roll_id: '2024001',
          date: '2025-08-04',
          present: true
        }
      ],
      date: '2025-08-04'
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataDay1
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataDay2
      });

    render(<AttendanceManagement />);

    // Select Grade 9
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

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<AttendanceManagement />);

    // Select Grade 9
    fireEvent.click(screen.getByText('Grade 9'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('handles server errors during save', async () => {
    const mockStudentsData = {
      students: [
        {
          id: 1,
          name: 'John Doe',
          roll_id: '2024001',
          student_class_name: 'Grade 9A',
          student_class_grade: 9
        }
      ],
      attendance_records: [],
      date: '2025-08-03',
      class_grade: 9
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudentsData
      })
      .mockRejectedValueOnce(new Error('Save failed'));

    render(<AttendanceManagement />);

    // Select Grade 9
    fireEvent.click(screen.getByText('Grade 9'));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Try to save
    fireEvent.click(screen.getByText('Save Attendance'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  it('updates attendance summary in real-time', async () => {
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
      attendance_records: [],
      date: '2025-08-03',
      class_grade: 9
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudentsData
    });

    render(<AttendanceManagement />);

    // Select Grade 9
    fireEvent.click(screen.getByText('Grade 9'));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Initially all absent (0% attendance)
    expect(screen.getByText('0%')).toBeInTheDocument();

    // Mark one student present
    const presentButtons = screen.getAllByText('Present');
    fireEvent.click(presentButtons[0]);

    // Should now show 50% attendance
    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    // Mark second student present
    fireEvent.click(presentButtons[1]);

    // Should now show 100% attendance
    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  it('preserves existing attendance when loading', async () => {
    const mockStudentsData = {
      students: [
        {
          id: 1,
          name: 'John Doe',
          roll_id: '2024001',
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

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudentsData
    });

    render(<AttendanceManagement />);

    // Select Grade 9
    fireEvent.click(screen.getByText('Grade 9'));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Should show 100% attendance (1 present out of 1 total)
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});