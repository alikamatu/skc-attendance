"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/api/attendance";
const STUDENTS_API = "http://localhost:5000/api/students/fetch"; // Fetch students from DB

export default function AttendanceForm() {
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [signedInUsers, setSignedInUsers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [signOutId, setSignOutId] = useState<number | null>(null);
  const [attendance, setAttendance] = useState<{ id: number; name: string; signInTime: string; signOutTime?: string }[]>([]);
  const [signOutName, setSignOutName] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    // Fetch students from the API
    const fetchStudents = async () => {
      try {
        const response = await fetch(STUDENTS_API);
        if (!response.ok) throw new Error("Failed to fetch students.");
        const data = await response.json();
        setStudents(data); // Ensure `data` is an array of `{ id, name }`
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  const handleSignIn = async () => {
    if (selectedUser) {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: selectedUser,
            status: "Present",
            action: "sign-in",
          }),
        });
  
        if (!response.ok) throw new Error("Failed to sign in");
        setSignedInUsers([...signedInUsers, selectedUser]);
        setAttendance([...attendance, { name: selectedUser, signInTime: new Date().toLocaleTimeString() }]);
        setSelectedUser(null);
      } catch (error) {
        console.error("Sign-in failed:", error);
      }
    }
  };
  

const handleSignOut = async () => {
  if (signOutId) {  // Ensure a valid student ID is selected
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: signOutId,  // Use the selected ID instead of signOutName
          action: "sign-out",
        }),
      });

      if (!response.ok) throw new Error("Failed to sign out");

      // Update the attendance list
      setAttendance(attendance.map((record) =>
        record.id === signOutId && !record.signOutTime
          ? { ...record, signOutTime: new Date().toLocaleTimeString() }
          : record
      ));

      // Remove from signed-in users
      setSignedInUsers(signedInUsers.filter(id => id !== signOutId));

      setSignOutId(null); // Reset selection
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  }
};

  

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="space-y-6 w-full max-w-md">
        {/* Sign In Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sign In</h2>
          <div className="flex gap-3">
            <select
              value={selectedUser || ""}
              onChange={(e) => setSelectedUser(Number(e.target.value))}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
            <button onClick={handleSignIn} disabled={!selectedUser} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
              Sign In
            </button>
          </div>
        </motion.div>

        {/* Sign Out Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sign Out</h2>
          <div className="flex gap-3">
            <select
              value={signOutId || ""}
              onChange={(e) => setSignOutId(Number(e.target.value))}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
            <button onClick={handleSignOut} disabled={!signOutId} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors">
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Attendance Log Section */}
               {/* Attendance Log Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Attendance Log</h2>
          {attendance.length === 0 ? (
            <p className="text-gray-500">No records yet.</p>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence>
                {attendance.map((record, index) => (
                  <motion.li
                    key={record.id || index} // Use `record.id` if available, otherwise fallback to `index`
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <span className="font-medium text-gray-800">{record.name}</span> - 
                    Signed in at {record.signInTime}
                    {record.signOutTime ? (
                      <span className="text-gray-600">, Signed out at {record.signOutTime}</span>
                    ) : (
                      <span className="text-green-600"> (Still Present)</span>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}
