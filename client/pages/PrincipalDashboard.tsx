import { useState } from "react";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Save,
  BarChart3,
  Crown,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock data
const initialTeachers = [
  {
    id: 1,
    name: "Dr. Smith",
    email: "smith@dis.edu",
    subject: "Mathematics",
    experience: "10 years",
  },
  {
    id: 2,
    name: "Prof. Johnson",
    email: "johnson@dis.edu",
    subject: "Physics",
    experience: "15 years",
  },
  {
    id: 3,
    name: "Dr. Brown",
    email: "brown@dis.edu",
    subject: "Chemistry",
    experience: "8 years",
  },
  {
    id: 4,
    name: "Prof. Davis",
    email: "davis@dis.edu",
    subject: "Computer Science",
    experience: "12 years",
  },
];

const allStudents = [
  {
    id: 1,
    name: "John Doe",
    rollNo: "ST2024001",
    course: "Computer Science",
    year: "3rd Year",
  },
  {
    id: 2,
    name: "Jane Smith",
    rollNo: "ST2024002",
    course: "Physics",
    year: "2nd Year",
  },
  {
    id: 3,
    name: "Mike Johnson",
    rollNo: "ST2024003",
    course: "Mathematics",
    year: "4th Year",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    rollNo: "ST2024004",
    course: "Chemistry",
    year: "1st Year",
  },
  {
    id: 5,
    name: "Alex Chen",
    rollNo: "ST2024005",
    course: "Computer Science",
    year: "3rd Year",
  },
];

export default function PrincipalDashboard() {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    subject: "",
    experience: "",
  });
  const [editingTeacher, setEditingTeacher] = useState<number | null>(null);
  const [editTeacher, setEditTeacher] = useState({
    name: "",
    email: "",
    subject: "",
    experience: "",
  });

  const handleAddTeacher = () => {
    if (
      newTeacher.name &&
      newTeacher.email &&
      newTeacher.subject &&
      newTeacher.experience
    ) {
      const newId = Math.max(...teachers.map((t) => t.id)) + 1;
      setTeachers([...teachers, { id: newId, ...newTeacher }]);
      setNewTeacher({ name: "", email: "", subject: "", experience: "" });
    }
  };

  const handleRemoveTeacher = (id: number) => {
    setTeachers(teachers.filter((t) => t.id !== id));
  };

  const handleEditTeacher = (teacher: any) => {
    setEditingTeacher(teacher.id);
    setEditTeacher({
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      experience: teacher.experience,
    });
  };

  const handleSaveTeacher = () => {
    if (editingTeacher) {
      setTeachers(
        teachers.map((t) =>
          t.id === editingTeacher ? { ...t, ...editTeacher } : t,
        ),
      );
      setEditingTeacher(null);
      setEditTeacher({ name: "", email: "", subject: "", experience: "" });
    }
  };

  const handleCancelEdit = () => {
    setEditingTeacher(null);
    setEditTeacher({ name: "", email: "", subject: "", experience: "" });
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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Principal Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage academic operations and staff
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Teacher Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                  <span>Teacher Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Teacher Form */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-4">Add New Teacher</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="teacherName">Name</Label>
                      <Input
                        id="teacherName"
                        value={newTeacher.name}
                        onChange={(e) =>
                          setNewTeacher({
                            ...newTeacher,
                            name: e.target.value,
                          })
                        }
                        placeholder="Teacher name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherEmail">Email</Label>
                      <Input
                        id="teacherEmail"
                        type="email"
                        value={newTeacher.email}
                        onChange={(e) =>
                          setNewTeacher({
                            ...newTeacher,
                            email: e.target.value,
                          })
                        }
                        placeholder="email@dis.edu"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={newTeacher.subject}
                        onChange={(e) =>
                          setNewTeacher({
                            ...newTeacher,
                            subject: e.target.value,
                          })
                        }
                        placeholder="Subject"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Experience</Label>
                      <Input
                        id="experience"
                        value={newTeacher.experience}
                        onChange={(e) =>
                          setNewTeacher({
                            ...newTeacher,
                            experience: e.target.value,
                          })
                        }
                        placeholder="5 years"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddTeacher} className="w-full">
                        Add Teacher
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Teachers Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Name</th>
                        <th className="text-left py-2 font-medium">Email</th>
                        <th className="text-left py-2 font-medium">Subject</th>
                        <th className="text-left py-2 font-medium">
                          Experience
                        </th>
                        <th className="text-center py-2 font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher) => (
                        <tr key={teacher.id} className="border-b">
                          <td className="py-2">
                            {editingTeacher === teacher.id ? (
                              <Input
                                value={editTeacher.name}
                                onChange={(e) =>
                                  setEditTeacher({
                                    ...editTeacher,
                                    name: e.target.value,
                                  })
                                }
                                className="w-full"
                              />
                            ) : (
                              teacher.name
                            )}
                          </td>
                          <td className="py-2">
                            {editingTeacher === teacher.id ? (
                              <Input
                                type="email"
                                value={editTeacher.email}
                                onChange={(e) =>
                                  setEditTeacher({
                                    ...editTeacher,
                                    email: e.target.value,
                                  })
                                }
                                className="w-full"
                              />
                            ) : (
                              teacher.email
                            )}
                          </td>
                          <td className="py-2">
                            {editingTeacher === teacher.id ? (
                              <Input
                                value={editTeacher.subject}
                                onChange={(e) =>
                                  setEditTeacher({
                                    ...editTeacher,
                                    subject: e.target.value,
                                  })
                                }
                                className="w-full"
                              />
                            ) : (
                              teacher.subject
                            )}
                          </td>
                          <td className="py-2">
                            {editingTeacher === teacher.id ? (
                              <Input
                                value={editTeacher.experience}
                                onChange={(e) =>
                                  setEditTeacher({
                                    ...editTeacher,
                                    experience: e.target.value,
                                  })
                                }
                                className="w-full"
                              />
                            ) : (
                              teacher.experience
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {editingTeacher === teacher.id ? (
                              <div className="flex space-x-2 justify-center">
                                <Button size="sm" onClick={handleSaveTeacher}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex space-x-2 justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditTeacher(teacher)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveTeacher(teacher.id)
                                  }
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* All Students Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span>All Students Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Name</th>
                        <th className="text-left py-2 font-medium">
                          Roll Number
                        </th>
                        <th className="text-left py-2 font-medium">Course</th>
                        <th className="text-left py-2 font-medium">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStudents.map((student) => (
                        <tr key={student.id} className="border-b">
                          <td className="py-2">{student.name}</td>
                          <td className="py-2">{student.rollNo}</td>
                          <td className="py-2">{student.course}</td>
                          <td className="py-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {student.year}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* All Teachers Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>All Teachers Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Name</th>
                        <th className="text-left py-2 font-medium">Email</th>
                        <th className="text-left py-2 font-medium">Subject</th>
                        <th className="text-left py-2 font-medium">
                          Experience
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher) => (
                        <tr key={teacher.id} className="border-b">
                          <td className="py-2">{teacher.name}</td>
                          <td className="py-2">{teacher.email}</td>
                          <td className="py-2">{teacher.subject}</td>
                          <td className="py-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {teacher.experience}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <span>Analytics Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-blue-900">
                      {allStudents.length}
                    </h3>
                    <p className="text-blue-700">Total Students</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-green-900">
                      {teachers.length}
                    </h3>
                    <p className="text-green-700">Total Teachers</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-purple-900">85%</h3>
                    <p className="text-purple-700">Average Performance</p>
                  </div>
                </div>

                <div className="mt-6 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      Detailed analytics charts coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
