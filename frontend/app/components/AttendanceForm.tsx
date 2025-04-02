"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/api/attendance";
const STUDENTS_API = "http://localhost:5000/api/students/students-by-session"; 

export default function AttendanceForm() {
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [session, setSession] = useState("morning");
  const [signedInUsers, setSignedInUsers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [signOutId, setSignOutId] = useState<number | null>(null);
  const [attendance, setAttendance] = useState<{ id: number; name: string; signInTime: string; signOutTime?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${STUDENTS_API}?session=${session}`);
        if (!response.ok) throw new Error("Failed to fetch students.");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [session]);

  const handleSignIn = async () => {
    if (selectedUser) {
      setIsLoading(true);
      const selectedStudent = students.find(student => student.id === selectedUser);
      if (!selectedStudent) return;

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: selectedUser,
            name: selectedStudent.name,
            action: "sign-in",
          }),
        });

        if (!response.ok) throw new Error("Failed to sign in");

        setSignedInUsers([...signedInUsers, selectedUser]);
        setAttendance([
          ...attendance,
          { 
            id: selectedUser, 
            name: selectedStudent.name, 
            signInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          },
        ]);
        setSelectedUser(null);
      } catch (error) {
        console.error("Sign-in failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSignOut = async () => {
    if (signOutId) {
      setIsLoading(true);
      const selectedStudent = students.find(student => student.id === signOutId);
      if (!selectedStudent) {
        console.error("Student not found for sign-out");
        return;
      }

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: signOutId,
            name: selectedStudent.name,
            action: "sign-out",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Sign-out failed:", errorData);
          throw new Error("Failed to sign out");
        }

        setAttendance(attendance.map((record) =>
          record.id === signOutId && !record.signOutTime
            ? { 
                ...record, 
                signOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              }
            : record
        ));

        setSignedInUsers(signedInUsers.filter(id => id !== signOutId));
        setSignOutId(null);
      } catch (error) {
        console.error("Sign-out failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="space-y-6 w-full max-w-2xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800">Attendance System</h1>
          <p className="text-gray-600 mt-2">Track student sign-ins and sign-outs</p>
        </motion.div>

        {/* Sign In Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center mb-4">
            <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-semibold text-gray-800">Sign In</h2>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Session</h2>
        <select
          value={session}
          onChange={(e) => setSession(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>

        <h3 className="text-lg font-semibold mt-6">Students</h3>
        {isLoading ? (
          <p>Loading students...</p>
        ) : students.length === 0 ? (
          <p>No students found for the selected session.</p>
        ) : (
          <ul className="space-y-2">
            {students.map((student) => (
              <li key={student.id} className="p-4 bg-gray-50 rounded-md shadow-sm">
                {student.name}
              </li>
            ))}
          </ul>
        )}
          <div className="flex gap-3">
            <select
              value={selectedUser || ""}
              onChange={(e) => setSelectedUser(Number(e.target.value))}
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            >
              <option value="" disabled>Select a student</option>
              {students
                .filter((student) => !signedInUsers.includes(student.id))
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
            </select>
            <button 
              onClick={handleSignIn} 
              disabled={!selectedUser || isLoading}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Sign In"}
            </button>
          </div>
        </motion.div>

        {/* Sign Out Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center mb-4">
            <div className="w-2 h-6 bg-red-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-semibold text-gray-800">Sign Out</h2>
          </div>
          <div className="flex gap-3">
            <select
              value={signOutId || ""}
              onChange={(e) => setSignOutId(Number(e.target.value))}
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              disabled={isLoading}
            >
              <option value="" disabled>Select a student</option>
              {students
                .filter((student) => signedInUsers.includes(student.id))
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
            </select>
            <button 
              onClick={handleSignOut} 
              disabled={!signOutId || isLoading}
              className="px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Sign Out"}
            </button>
          </div>
        </motion.div>

        {/* Attendance Log Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center mb-4">
            <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-semibold text-gray-800">Attendance Log</h2>
            <span className="ml-auto bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
              {attendance.length} records
            </span>
          </div>
          
          {attendance.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">Sign in students to see records here.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <ul className="divide-y divide-gray-200">
                <AnimatePresence>
                  {attendance.map((record, index) => (
                    <motion.li
                      key={record.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 ${record.signOutTime ? 'bg-gray-50' : 'bg-blue-50'}`}
                    >
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-3 w-3 rounded-full ${record.signOutTime ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{record.name}</p>
                            <div className="text-xs text-gray-500">
                              {record.signInTime}
                              {record.signOutTime && ` → ${record.signOutTime}`}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {record.signOutTime ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                                Signed out
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                Currently present
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}