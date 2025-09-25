import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Edit3,
  MessageSquare,
  Trash2,
  Save,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock data
const initialStudents = [
  { id: 1, name: "John Doe", email: "john@example.com", rollNo: "ST2024001" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", rollNo: "ST2024002" },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    rollNo: "ST2024003",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    rollNo: "ST2024004",
  },
];

const initialMarks = [
  {
    studentId: 1,
    name: "John Doe",
    math: 85,
    physics: 92,
    chemistry: 78,
    cs: 95,
  },
  {
    studentId: 2,
    name: "Jane Smith",
    math: 90,
    physics: 88,
    chemistry: 85,
    cs: 91,
  },
  {
    studentId: 3,
    name: "Mike Johnson",
    math: 75,
    physics: 82,
    chemistry: 88,
    cs: 79,
  },
  {
    studentId: 4,
    name: "Sarah Wilson",
    math: 93,
    physics: 89,
    chemistry: 91,
    cs: 94,
  },
];

const studentFeedback = [
  {
    student: "John Doe",
    feedback: "The teaching methods are excellent and very engaging.",
    date: "2024-01-15",
  },
  {
    student: "Jane Smith",
    feedback: "Would love more practical sessions in the lab.",
    date: "2024-01-14",
  },
  {
    student: "Mike Johnson",
    feedback: "Great explanations, but need more practice problems.",
    date: "2024-01-13",
  },
];

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Authentication check
  useEffect(() => {
    if (!loading && (!user || user.user_type !== 'faculty')) {
      console.log('TeacherDashboard: Authentication failed, redirecting to login');
      console.log('TeacherDashboard: User:', user);
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Don't render anything if user is not authenticated
  if (!user || user.user_type !== 'faculty') {
    return null;
  }

  const [students, setStudents] = useState(initialStudents);
  const [marks, setMarks] = useState(initialMarks);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    rollNo: "",
  });
  const [editingMarks, setEditingMarks] = useState<number | null>(null);

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.email && newStudent.rollNo) {
      const newId = Math.max(...students.map((s) => s.id)) + 1;
      setStudents([...students, { id: newId, ...newStudent }]);
      setMarks([
        ...marks,
        {
          studentId: newId,
          name: newStudent.name,
          math: 0,
          physics: 0,
          chemistry: 0,
          cs: 0,
        },
      ]);
      setNewStudent({ name: "", email: "", rollNo: "" });
    }
  };

  const handleRemoveStudent = (id: number) => {
    setStudents(students.filter((s) => s.id !== id));
    setMarks(marks.filter((m) => m.studentId !== id));
  };

  const handleUpdateMarks = (
    studentId: number,
    subject: string,
    value: number,
  ) => {
    setMarks(
      marks.map((m) =>
        m.studentId === studentId ? { ...m, [subject]: value } : m,
      ),
    );
  };

  const handleSaveMarks = () => {
    setEditingMarks(null);
    alert("Marks updated successfully!");
  };

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
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.name}!
              </h1>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Teacher Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage students and academic records
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Add/Remove Students */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  <span>Manage Students</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Student Form */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-4">Add New Student</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="studentName">Name</Label>
                      <Input
                        id="studentName"
                        value={newStudent.name}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, name: e.target.value })
                        }
                        placeholder="Student name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentEmail">Email</Label>
                      <Input
                        id="studentEmail"
                        type="email"
                        value={newStudent.email}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            email: e.target.value,
                          })
                        }
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rollNo">Roll Number</Label>
                      <Input
                        id="rollNo"
                        value={newStudent.rollNo}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            rollNo: e.target.value,
                          })
                        }
                        placeholder="ST2024XXX"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddStudent} className="w-full">
                        Add Student
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Name</th>
                        <th className="text-left py-2 font-medium">Email</th>
                        <th className="text-left py-2 font-medium">
                          Roll Number
                        </th>
                        <th className="text-center py-2 font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b">
                          <td className="py-2">{student.name}</td>
                          <td className="py-2">{student.email}</td>
                          <td className="py-2">{student.rollNo}</td>
                          <td className="py-2 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveStudent(student.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Update Student Marks */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                  <span>Student Marks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Student</th>
                        <th className="text-center py-2 font-medium">Math</th>
                        <th className="text-center py-2 font-medium">
                          Physics
                        </th>
                        <th className="text-center py-2 font-medium">
                          Chemistry
                        </th>
                        <th className="text-center py-2 font-medium">CS</th>
                        <th className="text-center py-2 font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map((mark) => (
                        <tr key={mark.studentId} className="border-b">
                          <td className="py-2 font-medium">{mark.name}</td>
                          <td className="py-2 text-center">
                            {editingMarks === mark.studentId ? (
                              <Input
                                type="number"
                                value={mark.math}
                                onChange={(e) =>
                                  handleUpdateMarks(
                                    mark.studentId,
                                    "math",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-16 text-center"
                                min="0"
                                max="100"
                              />
                            ) : (
                              mark.math
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {editingMarks === mark.studentId ? (
                              <Input
                                type="number"
                                value={mark.physics}
                                onChange={(e) =>
                                  handleUpdateMarks(
                                    mark.studentId,
                                    "physics",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-16 text-center"
                                min="0"
                                max="100"
                              />
                            ) : (
                              mark.physics
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {editingMarks === mark.studentId ? (
                              <Input
                                type="number"
                                value={mark.chemistry}
                                onChange={(e) =>
                                  handleUpdateMarks(
                                    mark.studentId,
                                    "chemistry",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-16 text-center"
                                min="0"
                                max="100"
                              />
                            ) : (
                              mark.chemistry
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {editingMarks === mark.studentId ? (
                              <Input
                                type="number"
                                value={mark.cs}
                                onChange={(e) =>
                                  handleUpdateMarks(
                                    mark.studentId,
                                    "cs",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-16 text-center"
                                min="0"
                                max="100"
                              />
                            ) : (
                              mark.cs
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {editingMarks === mark.studentId ? (
                              <Button
                                size="sm"
                                onClick={handleSaveMarks}
                                className="mr-1"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingMarks(mark.studentId)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Student Feedback */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <span>Student Feedback</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentFeedback.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {item.student}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {item.date}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{item.feedback}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
