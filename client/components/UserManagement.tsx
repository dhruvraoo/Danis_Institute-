import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Shield, GraduationCap } from 'lucide-react';
import FacultyRegistrationForm from './FacultyRegistrationForm';
import PrincipalRegistrationForm from './PrincipalRegistrationForm';

type RegistrationType = 'faculty' | 'principal' | null;

export default function UserManagement() {
  const [activeForm, setActiveForm] = useState<RegistrationType>(null);

  const registrationTypes = [
    {
      type: 'faculty' as const,
      title: 'Register Faculty',
      description: 'Add new faculty members with class and subject assignments',
      icon: GraduationCap,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      type: 'principal' as const,
      title: 'Register Principal',
      description: 'Add new principals with administrative access',
      icon: Shield,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    }
  ];

  const handleBackToSelection = () => {
    setActiveForm(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Register new faculty members and principals</p>
        </div>
      </div>

      {/* Selection or Forms */}
      <div>
        {activeForm === null ? (
          <div className="grid md:grid-cols-2 gap-6">
            {registrationTypes.map((regType) => (
              <motion.button
                key={regType.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveForm(regType.type)}
                className={`${regType.color} ${regType.hoverColor} p-6 rounded-xl text-white text-left transition-colors w-full`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <regType.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{regType.title}</h3>
                  </div>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  {regType.description}
                </p>
                <div className="mt-4 flex items-center text-white/80">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span className="text-sm">Click to start registration</span>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={handleBackToSelection}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2"
            >
              ← Back to Selection
            </button>
            
            {activeForm === 'faculty' ? (
              <FacultyRegistrationForm onSuccess={handleBackToSelection} onBack={handleBackToSelection} />
            ) : (
              <PrincipalRegistrationForm onSuccess={handleBackToSelection} onBack={handleBackToSelection} />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}