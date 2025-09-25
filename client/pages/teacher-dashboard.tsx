import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.user_type !== 'faculty')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || user.user_type !== 'faculty') {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Your Classes</h2>
          <ul className="space-y-2">
            {user.classes?.map((cls) => (
              <li key={cls.id} className="flex justify-between items-center">
                <span>{cls.name}</span>
                <span className="text-gray-500">Grade {cls.grade_level}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Your Subjects</h2>
          <ul className="space-y-2">
            {user.subjects?.map((subject) => (
              <li key={subject.id} className="flex justify-between items-center">
                <span>{subject.name}</span>
                <span className="text-gray-500">{subject.code}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
