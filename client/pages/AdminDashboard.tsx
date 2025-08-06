import { useState } from "react";
import Navigation from "@/components/Navigation";
import InquiryManagement from "@/components/InquiryManagement";
import AttendanceManagement from "@/components/AttendanceManagement";
import AdminMessaging from "@/components/AdminMessaging";
import UserManagement from "@/components/UserManagement";
import { motion } from "framer-motion";
import {
  UserCheck,
  Shield,
  Users,
  MessageSquare,
  UserPlus,
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'inquiries' | 'messages' | 'users'>('attendance');

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
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage attendance, inquiries, messages, and system administration
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'attendance'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>Attendance</span>
              </button>
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'inquiries'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Admission Inquiries</span>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'messages'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Messages & Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span>User Management</span>
              </button>
            </div>
          </motion.div>

          {/* Tab Content */}
          {activeTab === 'attendance' && (
            <AttendanceManagement />
          )}

          {/* Admission Inquiries Tab */}
          {activeTab === 'inquiries' && (
            <InquiryManagement />
          )}

          {/* Messages & Notifications Tab */}
          {activeTab === 'messages' && (
            <AdminMessaging />
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <UserManagement />
          )}
        </div>
      </main>
    </div>
  );
}
