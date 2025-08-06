import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  User,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
  date: string;
  present: boolean;
  status: string;
}

interface StudentData {
  id: number;
  name: string;
  roll_id: string;
  class: string;
  grade_level: number;
}

interface AttendanceSummary {
  total_days: number;
  present_days: number;
  absent_days: number;
  attendance_percentage: number;
}

interface StudentAttendanceData {
  student: StudentData;
  attendance_history: AttendanceRecord[];
  summary: AttendanceSummary;
}

interface StudentAttendanceHistoryProps {
  studentId: number;
}

export default function StudentAttendanceHistory({ studentId }: StudentAttendanceHistoryProps) {
  const [attendanceData, setAttendanceData] = useState<StudentAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAttendanceHistory();
  }, [studentId, dateFilter]);

  const fetchAttendanceHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `http://127.0.0.1:8000/api/attendance/student/${studentId}/`;
      
      // Add date filters if provided
      const params = new URLSearchParams();
      if (dateFilter.startDate) params.append('start_date', dateFilter.startDate);
      if (dateFilter.endDate) params.append('end_date', dateFilter.endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch attendance history');
      }

      const data: StudentAttendanceData = await response.json();
      setAttendanceData(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRecentTrend = () => {
    if (!attendanceData || attendanceData.attendance_history.length < 5) return null;
    
    const recent5 = attendanceData.attendance_history.slice(0, 5);
    const presentCount = recent5.filter(record => record.present).length;
    const percentage = (presentCount / 5) * 100;
    
    return {
      percentage,
      trend: percentage >= 80 ? 'good' : percentage >= 60 ? 'average' : 'poor'
    };
  };

  const recentTrend = getRecentTrend();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2 text-gray-600">Loading attendance history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attendanceData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No attendance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Info & Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Student Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{attendanceData.student.name}</h3>
                <p className="text-sm text-gray-600">Roll: {attendanceData.student.roll_id}</p>
                <p className="text-sm text-gray-600">{attendanceData.student.class}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Days */}
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">
              {attendanceData.summary.total_days}
            </h3>
            <p className="text-sm text-gray-600">Total Days</p>
          </CardContent>
        </Card>

        {/* Present Days */}
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-900">
              {attendanceData.summary.present_days}
            </h3>
            <p className="text-sm text-gray-600">Present Days</p>
          </CardContent>
        </Card>

        {/* Attendance Percentage */}
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className={`text-2xl font-bold ${getAttendanceColor(attendanceData.summary.attendance_percentage).split(' ')[0]}`}>
              {attendanceData.summary.attendance_percentage}%
            </h3>
            <p className="text-sm text-gray-600">Attendance Rate</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Date Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-4"
      >
        <div className="flex items-center space-x-2">
          <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
            From:
          </label>
          <input
            id="start-date"
            type="date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
            To:
          </label>
          <input
            id="end-date"
            type="date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        {(dateFilter.startDate || dateFilter.endDate) && (
          <button
            onClick={() => setDateFilter({ startDate: '', endDate: '' })}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear Filters
          </button>
        )}
      </motion.div>

      {/* Recent Trend */}
      {recentTrend && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Recent Trend (Last 5 Days)</h3>
                  <p className="text-sm text-gray-600">
                    {recentTrend.percentage}% attendance in recent days
                  </p>
                </div>
                <Badge
                  variant={recentTrend.trend === 'good' ? 'default' : recentTrend.trend === 'average' ? 'secondary' : 'destructive'}
                >
                  {recentTrend.trend === 'good' ? 'Good' : recentTrend.trend === 'average' ? 'Average' : 'Needs Improvement'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Attendance History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span>Attendance History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.attendance_history.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {attendanceData.attendance_history.map((record, index) => (
                  <motion.div
                    key={`${record.date}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {record.present ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h4>
                        <p className="text-sm text-gray-500">{record.date}</p>
                      </div>
                    </div>
                    <Badge
                      variant={record.present ? 'default' : 'destructive'}
                      className={record.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {record.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No attendance records found</p>
                {(dateFilter.startDate || dateFilter.endDate) && (
                  <p className="text-sm text-gray-500 mt-2">
                    Try adjusting your date filters
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}