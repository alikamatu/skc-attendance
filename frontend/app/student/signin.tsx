"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

type Student = {
  id: number;
  student_id: string;
  full_name: string;
  session: string;
};

export default function StudentSignIn() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = useRouter();

  // Fetch students list
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students');
        const data: Student[] = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, []);

  const handleSignIn = async () => {
    if (!selectedStudent) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: selectedStudent }),
      });

      if (response.ok) {
        setIsSignedIn(true);
        setTimeout(() => {
          router.push('/student/signout');
        }, 2000);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">Student Sign In</h1>

      {isSignedIn ? (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center py-8"
        >
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <p className="text-xl font-semibold">Successfully signed in!</p>
          <p className="text-gray-500">Redirecting to sign out page...</p>
        </motion.div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Your Name</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select Student --</option>
              {students.map((student) => (
                <option key={student.id} value={student.student_id}>
                  {student.full_name} ({student.session})
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignIn}
            disabled={!selectedStudent || isLoading}
            className={`w-full py-2 px-4 rounded text-white ${
              !selectedStudent || isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Signing In...' : 'Confirm Sign In'}
          </motion.button>
        </>
      )}
    </motion.div>
  );
}