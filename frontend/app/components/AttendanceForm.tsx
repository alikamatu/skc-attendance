"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/api/attendance";
const sampleUsers = ["Alice", "Bob", "Charlie", "David"];

export default function AttendanceForm() {
  const [signedInUsers, setSignedInUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [signOutName, setSignOutName] = useState("");
  const [attendance, setAttendance] = useState<{ name: string; signInTime: string; signOutTime?: string }[]>([]);

  const handleSignIn = async () => {
    if (selectedUser && !signedInUsers.includes(selectedUser)) {
      const timestamp = new Date().toLocaleTimeString();
      setSignedInUsers([...signedInUsers, selectedUser]);
      setAttendance([...attendance, { name: selectedUser, signInTime: timestamp }]);

      try {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: selectedUser, status: "Present" }),
        });
      } catch (error) {
        console.error("Failed to record sign-in:", error);
      }
      setSelectedUser(null);
    }
  };

  const handleSignOut = async () => {
    if (signOutName.trim() && signedInUsers.includes(signOutName.trim())) {
      const timestamp = new Date().toLocaleTimeString();
      setSignedInUsers(signedInUsers.filter((user) => user !== signOutName.trim()));
      setAttendance(
        attendance.map((record) =>
          record.name === signOutName.trim() && !record.signOutTime
            ? { ...record, signOutTime: timestamp }
            : record
        )
      );

      try {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: signOutName.trim(), status: "Signed Out" }),
        });
      } catch (error) {
        console.error("Failed to record sign-out:", error);
      }
      setSignOutName("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="space-y-6 w-full max-w-md">
        {/* Sign In Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sign In</h2>
          <div className="flex gap-3">
            <select
              value={selectedUser || ""}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="" disabled>Select a user</option>
              {sampleUsers
                .filter((user) => !signedInUsers.includes(user))
                .map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
            </select>
            <button
              onClick={handleSignIn}
              disabled={!selectedUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              Sign In
            </button>
          </div>
        </motion.div>

        {/* Sign Out Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sign Out</h2>
          <div className="flex gap-3">
            <input
              placeholder="Enter your name"
              value={signOutName}
              onChange={(e) => setSignOutName(e.target.value)}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={handleSignOut}
              disabled={!signOutName.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </motion.div>

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
                    key={index}
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