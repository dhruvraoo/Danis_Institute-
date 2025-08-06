import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Save,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: number;
  name: string;
  roll_id: string;
  student_class_name: string;
  student_class_grade: number;
}

interface AttendanceRecord {
  id: number;
  student: number;
  student_name: string;
  student_roll_id: string;
  date: string;
  present: boolean;
}

interface AttendanceData {
  students: Student[];
  attendance_records: AttendanceRecord[];
  date: string;
  class_grade: number;
}

interface AttendanceState {
  [studentId: number]: boolean;
}

export default function AttendanceManagement() {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [attendanceState, setAttendanceState] = useState<AttendanceState>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const grades = [9, 10, 11, 12];

  // Fetch attendance data when grade or date changes
  useEffect(() => {
    if (selectedGrade) {
      fetchAttendanceData();
    }
  }, [selectedGrade, selectedDate]);

  const fetchAttendanceData = async () => {
    if (!selectedGrade) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/attendance/admin/?class_grade=${selectedGrade}&date=${selectedDate}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const data: AttendanceData = await response.json();
      setAttendanceData(data);

      // Initialize attendance state from existing records
      const initialState: AttendanceState = {};
      data.students.forEach(student => {
        const existingRecord = data.attendance_records.find(
          record => record.student === student.id
        );
        initialState[student.id] = existingRecord ? existingRecord.present : false;
      });
      setAttendanceState(initialState);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: number, present: boolean) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: present
    }));
  };

  const saveAttendance = async () => {
    if (!attendanceData || !selectedGrade) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const attendanceDataToSend = attendanceData.students.map(student => ({
        student_id: student.id,
        present: attendanceState[student.id] || false
      }));

      const response = await fetch('http://127.0.0.1:8000/api/attendance/admin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          attendance_data: attendanceDataToSend
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
      }

      const result = await response.json();
      setSuccess(`Attendance saved successfully! Created: ${result.created}, Updated: ${result.updated}`);
      
      // Refresh data to show updated records
      await fetchAttendanceData();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    if (!attendanceData) return { present: 0, absent: 0, total: 0, percentage: 0 };

    const total = attendanceData.students.length;
    const present = Object.values(attendanceState).filter(Boolean).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, total, percentage };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Grade Selection Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {grades.map((grade) => (
          <Card
            key={grade}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedGrade === grade
                ? 'ring-2 ring-orange-500 bg-orange-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedGrade(grade)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Grade {grade}
              </h3>
              <p className="text-sm text-gray-600">
                {grade === 9 ? '9th' : grade === 10 ? '10th' : grade === 11 ? '11th' : '12th'} Class
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Date Picker */}
      {selectedGrade && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <label htmlFor="attendance-date" className="text-sm font-medium text-gray-700">
              Select Date:
            </label>
          </div>
          <input
            id="attendance-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 p-4 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 p-4 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Success</span>
          </div>
          <p className="text-green-700 text-sm mt-1">{success}</p>
        </motion.div>
      )}

      {/* Attendance Management */}
      {selectedGrade && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        >
          {/* Student List */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-orange-600" />
                  <span>Grade {selectedGrade} Attendance</span>
                </div>
                <Badge variant="outline">
                  {selectedDate}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <span className="ml-2 text-gray-600">Loading students...</span>
                </div>
              ) : attendanceData && attendanceData.students.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attendanceData.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {student.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Roll ID: {student.roll_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={attendanceState[student.id] ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAttendanceChange(student.id, true)}
                          className={attendanceState[student.id] ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Present
                        </Button>
                        <Button
                          variant={!attendanceState[student.id] ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleAttendanceChange(student.id, false)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Absent
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No students found for Grade {selectedGrade}</p>
                </div>
              )}

              {attendanceData && attendanceData.students.length > 0 && (
                <div className="mt-6">
                  <Button
                    onClick={saveAttendance}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Attendance
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <span>Attendance Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h3 className="text-2xl font-bold text-green-900">
                    {stats.present}
                  </h3>
                  <p className="text-green-700 text-sm">Present</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <h3 className="text-2xl font-bold text-red-900">
                    {stats.absent}
                  </h3>
                  <p className="text-red-700 text-sm">Absent</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h3 className="text-3xl font-bold text-blue-900">
                  {stats.percentage}%
                </h3>
                <p className="text-blue-700 text-sm">Attendance Rate</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Students:</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-medium">Grade {selectedGrade}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Instructions */}
      {!selectedGrade && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Select a Grade to Manage Attendance
          </h3>
          <p className="text-gray-600">
            Choose from Grade 9, 10, 11, or 12 to view and manage student attendance
          </p>
        </motion.div>
      )}
    </div>
  );
}