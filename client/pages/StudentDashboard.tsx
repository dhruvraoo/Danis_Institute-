import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import StudentAttendanceHistory from "@/components/StudentAttendanceHistory";
import StudentMessages from "@/components/StudentMessages";
import { motion } from "framer-motion";
import {
  BookOpen,
  TrendingUp,
  MessageSquare,
  User,
  BarChart3,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

// Types for API data
interface Student {
  id: number;
  name: string;
  email: string;
  roll_id: string;
  student_class: {
    id: number;
    name: string;
    grade_level: number;
    section: string;
  };
  subjects_selected: {
    id: number;
    name: string;
    code: string;
  }[];
}

interface PracticeQuestion {
  id: string;
  subject: string;
  subject_code: string;
  question: string;
  difficulty: string;
  type: string;
}

interface StudentMark {
  id: number;
  subject: {
    id: number;
    name: string;
    code: string;
  };
  exam_type: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  exam_date: string;
  created_at: string;
}

interface SubjectAverage {
  subject_name: string;
  subject_code: string;
  average_percentage: number;
  total_exams: number;
}

interface BookRecommendation {
  id: number;
  title: string;
  author: string;
  subject: {
    id: number;
    name: string;
    code: string;
  };
  description: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  price?: number;
  display_price: string;
  recommended_for_grade: number;
  is_available: boolean;
}

export default function StudentDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState("");
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [subjectAverages, setSubjectAverages] = useState<Record<number, SubjectAverage>>({});
  const [marksLoading, setMarksLoading] = useState(false);
  const [marksError, setMarksError] = useState("");
  const [bookRecommendations, setBookRecommendations] = useState<BookRecommendation[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'messages'>('overview');

  // Get student data from auth context
  const student = user && user.user_type === 'student' ? user : null;

  // Fetch student marks
  const fetchStudentMarks = async () => {
    setMarksLoading(true);
    setMarksError("");
    
    try {
      console.log('📊 Fetching student marks...');
      
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('📊 Sending auth token:', authToken);
      }
      
      const response = await fetch('http://127.0.0.1:8000/accounts/api/student/marks/', {
        credentials: 'include',
        headers,
      });
      console.log('📊 Marks API response status:', response.status);
      const data = await response.json();
      console.log('📊 Marks API response data:', data);

      if (data.success) {
        console.log('📊 Marks data received:', data.marks?.length, 'marks for', data.subjects_count, 'subjects');
        setStudentMarks(data.marks || []);
        setSubjectAverages(data.subject_averages || {});
      } else {
        setMarksError(data.message || "Failed to fetch marks");
      }
    } catch (error) {
      console.error("Error fetching student marks:", error);
      setMarksError("Failed to load marks. Please try again.");
    } finally {
      setMarksLoading(false);
    }
  };

  // Fetch practice questions
  const fetchPracticeQuestions = async () => {
    setQuestionsLoading(true);
    setQuestionsError("");
    
    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('http://127.0.0.1:8000/accounts/api/student/practice-questions/', {
        credentials: 'include',
        headers,
      });
      const data = await response.json();

      if (data.success) {
        console.log('❓ Practice questions received:', data.questions?.length, 'questions');
        setPracticeQuestions(data.questions || []);
      } else {
        setQuestionsError(data.message || "Failed to fetch practice questions");
      }
    } catch (error) {
      console.error("Error fetching practice questions:", error);
      setQuestionsError("Failed to load practice questions. Please try again.");
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Fetch book recommendations
  const fetchBookRecommendations = async () => {
    setBooksLoading(true);
    setBooksError("");
    
    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('http://127.0.0.1:8000/accounts/api/student/book-recommendations/', {
        credentials: 'include',
        headers,
      });
      const data = await response.json();

      if (data.success) {
        console.log('📚 Book recommendations received:', data.recommendations?.length, 'books');
        setBookRecommendations(data.recommendations || []);
      } else {
        setBooksError(data.message || "Failed to fetch book recommendations");
      }
    } catch (error) {
      console.error("Error fetching book recommendations:", error);
      setBooksError("Failed to load book recommendations. Please try again.");
    } finally {
      setBooksLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (student) {
      console.log('🎯 Student data available, fetching dashboard data...');
      console.log('🎯 Student:', student);
      
      // Add a small delay to ensure session is fully established
      setTimeout(() => {
        fetchPracticeQuestions();
        fetchStudentMarks();
        fetchBookRecommendations();
      }, 200);
    }
  }, [student]);

  const handleFeedbackSubmit = () => {
    alert("Feedback submitted successfully!");
    setFeedback("");
  };

  const getQuestionsForSubject = (subjectName: string) => {
    return practiceQuestions.filter(q => q.subject === subjectName);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main
        className="pt-20 pb-12 transition-all duration-300"
        style={{ marginLeft: "var(--sidebar-width, 0px)" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome, {student?.name || 'Student'}
                </h1>
                <p className="text-gray-600">Student ID: {student?.roll_id || 'Loading...'}</p>
                <p className="text-gray-500 text-sm">Class: {student?.student_class?.name || 'Loading...'}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'attendance'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Attendance History</span>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'messages'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </button>
            </div>
          </motion.div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Row 1: Marks Section */}
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Your Marks</span>
                  {marksLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {marksError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-red-600 text-sm">{marksError}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchStudentMarks}
                      className="ml-auto"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {!student?.subjects_selected || student.subjects_selected.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Subjects Selected
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Please select subjects to view your marks and performance.
                    </p>
                  </div>
                ) : marksLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex justify-between items-center py-3 border-b">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Subject</th>
                          <th className="text-center py-2 font-medium">Latest Mark</th>
                          <th className="text-center py-2 font-medium">Average</th>
                          <th className="text-center py-2 font-medium">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student?.subjects_selected?.map((subject) => {
                          const subjectMarks = studentMarks.filter(mark => mark.subject.id === subject.id);
                          const latestMark = subjectMarks.length > 0 ? subjectMarks[0] : null;
                          const average = subjectAverages[subject.id];

                          return (
                            <tr key={subject.id} className="border-b">
                              <td className="py-3">
                                <div>
                                  <div className="font-medium">{subject.name}</div>
                                  <div className="text-xs text-gray-500">{subject.code}</div>
                                </div>
                              </td>
                              <td className="text-center py-3">
                                {latestMark ? (
                                  <div>
                                    <div className="font-medium">
                                      {latestMark.marks_obtained}/{latestMark.total_marks}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {latestMark.exam_type}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No marks yet</span>
                                )}
                              </td>
                              <td className="text-center py-3">
                                {average ? (
                                  <div>
                                    <div className="font-medium">{average.average_percentage}%</div>
                                    <div className="text-xs text-gray-500">
                                      {average.total_exams} exam{average.total_exams !== 1 ? 's' : ''}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="text-center py-3">
                                {latestMark ? (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    latestMark.grade === 'A+' || latestMark.grade === 'A' 
                                      ? 'bg-green-100 text-green-800'
                                      : latestMark.grade === 'B+' || latestMark.grade === 'B'
                                      ? 'bg-blue-100 text-blue-800'
                                      : latestMark.grade === 'C'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {latestMark.grade}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    N/A
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {studentMarks.length === 0 && student?.subjects_selected && student.subjects_selected.length > 0 && (
                      <div className="text-center py-6">
                        <p className="text-gray-500">
                          No marks available for your selected subjects yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Row 2: Performance Graph and Submit Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Graph */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Performance Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        Performance graph coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span>Submit Feedback</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Share your feedback about courses, faculty, or campus..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                  />
                  <Button onClick={handleFeedbackSubmit} className="w-full">
                    Submit Feedback
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Row 3: Practice Questions and Recommended Books */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Practice Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>Practice Questions</span>
                    {questionsLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questionsError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-red-600 text-sm">{questionsError}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchPracticeQuestions}
                        className="ml-auto"
                      >
                        Retry
                      </Button>
                    </div>
                  )}

                  {!student?.subjects_selected || student.subjects_selected.length === 0 ? (
                    <div className="text-center py-6">
                      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-medium text-gray-900 mb-2">
                        No Subjects Selected
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Select subjects to view practice questions.
                      </p>
                    </div>
                  ) : questionsLoading ? (
                    <div className="space-y-3">
                      <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                      <div className="space-y-2">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-gray-200 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        <Select onValueChange={setSelectedSubject}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {student?.subjects_selected?.map((subject) => (
                              <SelectItem key={subject.id} value={subject.name}>
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedSubject && (
                        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                          <h4 className="font-medium text-gray-900">
                            Questions for {selectedSubject}:
                          </h4>
                          <div className="space-y-2">
                            {getQuestionsForSubject(selectedSubject).map((question, index) => (
                              <div
                                key={question.id}
                                className="p-3 bg-gray-50 rounded-lg text-sm"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-blue-600">
                                    Q{index + 1}:
                                  </span>
                                  <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      {question.difficulty}
                                    </span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      {question.type}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-700">{question.question}</p>
                              </div>
                            ))}
                            {getQuestionsForSubject(selectedSubject).length === 0 && (
                              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 text-center">
                                No practice questions available for this subject yet.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!selectedSubject && practiceQuestions.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm">
                            No practice questions available for your selected subjects.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Books */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>Recommended Books</span>
                    {booksLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {booksError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-red-600 text-sm">{booksError}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchBookRecommendations}
                        className="ml-auto"
                      >
                        Retry
                      </Button>
                    </div>
                  )}

                  {!student?.subjects_selected || student.subjects_selected.length === 0 ? (
                    <div className="text-center py-6">
                      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-medium text-gray-900 mb-2">
                        No Subjects Selected
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Select subjects to view book recommendations.
                      </p>
                    </div>
                  ) : booksLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {bookRecommendations.length > 0 ? (
                        bookRecommendations.map((book) => (
                          <div
                            key={book.id}
                            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {book.title}
                              </h4>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {book.subject.name}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              by {book.author}
                            </p>
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                              {book.description}
                            </p>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">
                                Grade {book.recommended_for_grade}
                              </span>
                              <span className="font-medium text-green-600">
                                {book.display_price}
                              </span>
                            </div>
                            {book.isbn && (
                              <p className="text-xs text-gray-400 mt-1">
                                ISBN: {book.isbn}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                          <h4 className="font-medium text-gray-900 mb-2">
                            No Recommendations Available
                          </h4>
                          <p className="text-gray-600 text-sm">
                            No book recommendations found for your selected subjects and grade level.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && student && (
            <div className="mt-8">
              <StudentAttendanceHistory studentId={student.id} />
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && student && (
            <div className="mt-8">
              <StudentMessages 
                studentId={student.id} 
                studentName={student.name}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
