"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StudentSearchFilter from "./StudentSearchFilter";
import StudentSelectionModal from "./StudentSelectedModal";
import Link from "next/link";
import { FaUser } from "react-icons/fa";

const STUDENTS_API = "https://skc-attendance-backend.vercel.app/api/students/students-by-session"; 
const API_URL = "https://skc-attendance-backend.vercel.app/api/attendance";


export default function AttendanceForm() {
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [session, setSession] = useState("morning");
  const [signedInUsers, setSignedInUsers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [signOutId, setSignOutId] = useState<number | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signOutComment, setSignOutComment] = useState("");
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);

   type AttendanceRecord = {
    id: number;
    name: string;
    signInTime: string;
    signOutTime?: string;
    date: string;
    comment?: string;
  };
  
  useEffect(() => {
    const savedAttendance = localStorage.getItem("attendanceRecords");
    if (savedAttendance) {
      const parsedAttendance: AttendanceRecord[] = JSON.parse(savedAttendance);
      setAttendance(parsedAttendance);
  
      const signedIn = parsedAttendance
        .filter((record: AttendanceRecord) => record.date === currentDate && !record.signOutTime)
        .map((record: AttendanceRecord) => record.id);
      setSignedInUsers(signedIn);
    }
  }, [currentDate]);
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${STUDENTS_API}?session=${session}`);
        if (!response.ok) throw new Error("Failed to fetch students");
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

  const saveAttendanceToLocalStorage = (updatedAttendance: typeof attendance) => {
    localStorage.setItem("attendanceRecords", JSON.stringify(updatedAttendance));
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log("Filtered students:", filteredStudents); // Debugging filtered students
  
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
            session,
            action: "sign-in",
            date: currentDate,
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to sign in");
        }
  
        const newRecord = {
          id: selectedUser,
          name: selectedStudent.name,
          signInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: currentDate,
        };
  
        const updatedAttendance = [...attendance, newRecord];
        setAttendance(updatedAttendance);
        setSignedInUsers([...signedInUsers, selectedUser]);
        setSelectedUser(null);
  
        saveAttendanceToLocalStorage(updatedAttendance);
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(error.message || "Sign-in failed");
        } else {
          alert("An unknown error occurred during sign-in");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

 const handleSignOut = async () => {
  if (signOutId) {
    if (!signOutComment.trim()) {
      alert("Please enter a comment before signing out.");
      return;
    }
    setIsLoading(true);
    const selectedStudent = students.find(student => student.id === signOutId);
    if (!selectedStudent) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: signOutId,
          name: selectedStudent.name,
          action: "sign-out",
          date: currentDate,
          comment: signOutComment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sign out");
      }

      const updatedAttendance = attendance.map(record =>
        record.id === signOutId && record.date === currentDate && !record.signOutTime
          ? { ...record, signOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), comment: signOutComment }
          : record
      );

      setAttendance(updatedAttendance);
      setSignedInUsers(signedInUsers.filter(id => id !== signOutId));
      setSignOutId(null);
      setSignOutComment(""); // Clear comment

      saveAttendanceToLocalStorage(updatedAttendance);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || "Sign-Out failed");
      }
    } finally {
      setIsLoading(false);
    }
  }
};

  const handleClearAttendance = () => {
    setAttendance([]);
    setSignedInUsers([]);
    localStorage.removeItem("attendanceRecords");
  };

  const todaysAttendance = attendance.filter(record => record.date === currentDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 md:mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">SKCF Attendance System</h1>
        <p className="text-gray-600 mt-1 md:mt-2">Today: {new Date(currentDate).toLocaleDateString()}</p>
        <Link href="/login" className="text-black mt-2 inline-block md:fixed top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-white/30 hover:cursor-pointer hover:top-3.5 duration-200">
        <FaUser size={40} className="inline mr-1 bg-black/20 p-1 text-black rounded-full" />
          Admin Login
        </Link>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Attendance Log Section - Now below on mobile, side on desktop */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 w-full lg:w-1/3 order-2 lg:order-1"
        >
          <div className="flex items-center mb-4">
            <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Today&apos;s Attendance</h2>
            <button 
              onClick={handleClearAttendance} 
              className="bg-red-500 text-white px-3 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-md mt-2 ml-auto"
            >
              Clear
            </button>
            <span className="ml-2 bg-gray-100 text-gray-800 text-xs md:text-sm font-medium px-2 py-0.5 md:px-3 md:py-1 rounded-full">
              {todaysAttendance.length} records
            </span>
          </div>
          
          {todaysAttendance.length === 0 ? (
            <div className="text-center py-8 flex-grow flex items-center justify-center">
              <div>
                <svg className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm md:text-base font-medium text-gray-900">No attendance records for today</h3>
                <p className="mt-1 text-xs md:text-sm text-gray-500">Sign in students to see records here.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 flex-grow">
              <ul className="divide-y divide-gray-200 h-full overflow-y-auto max-h-[300px] md:max-h-[400px]">
                <AnimatePresence>
                  {todaysAttendance.map((record, index) => (
                    <motion.li
                      key={record.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className={`p-3 md:p-4 ${record.signOutTime ? 'bg-gray-50' : 'bg-blue-50'}`}
                    >
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-2 w-2 md:h-3 md:w-3 rounded-full ${record.signOutTime ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                        <div className="ml-2 md:ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm md:text-base font-medium text-gray-900 truncate">{record.name}</p>
                            <div className="text-xs md:text-sm text-gray-500 ml-2 whitespace-nowrap">
                              {record.signInTime}
                              {record.signOutTime && ` → ${record.signOutTime}`}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {record.signOutTime ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                                Signed out
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800">
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

        {/* Main Content Area - Forms */}
        <div className="flex-1 space-y-4 md:space-y-6 order-1 lg:order-2">
          {/* Sign In Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center mb-3 md:mb-4">
              <div className="w-2 h-5 md:h-6 bg-blue-500 rounded-full mr-2 md:mr-3"></div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Sign In</h2>
            </div>

            <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Select Session</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full p-2 border rounded text-sm md:text-base"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>

            <StudentSearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-600 text-white py-2 mb-4 rounded-lg hover:bg-blue-700"
        >
          {selectedUser ? "Change Student" : "Select a Student"}
        </button>

        <StudentSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          students={filteredStudents.filter(
            (student) =>
              !signedInUsers.includes(student.id) &&
              !attendance.some(
                (record) =>
                  record.id === student.id &&
                  record.date === currentDate &&
                  !record.signOutTime
              )
          )}
          onSelect={(id) => setSelectedUser(id)}
        />

            <div className="space-y-3 md:space-y-4">
              
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <div className="flex-1">
                  <select
                    value={selectedUser || ""}
                    onChange={(e) => setSelectedUser(Number(e.target.value))}
                    className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                    disabled={isLoading}
                  >
                    <option value="" disabled>Select a student</option>
                    {students
                      .filter((student) => 
                        !signedInUsers.includes(student.id) && 
                        !attendance.some(record => 
                          record.id === student.id && 
                          record.date === currentDate && 
                          !record.signOutTime
                        )
                      )
                      .map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                  </select>
                </div>
                <button 
                  onClick={handleSignIn} 
                  disabled={!selectedUser || isLoading}
                  className="px-3 py-2 md:px-5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center text-sm md:text-base"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "Sign In"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Sign Out Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center mb-3 md:mb-4">
              <div className="w-2 h-5 md:h-6 bg-red-500 rounded-full mr-2 md:mr-3"></div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Sign Out</h2>
            </div>
            
           <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
  <div className="flex-1">
    <select
      value={signOutId || ""}
      onChange={(e) => {
        setSignOutId(Number(e.target.value));
        setSignOutComment(""); // Reset comment when changing student
      }}
      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm md:text-base"
      disabled={isLoading}
    >
      <option value="" disabled>Select a student</option>
      {students
        .filter((student) => 
          signedInUsers.includes(student.id) || 
          attendance.some(record => 
            record.id === student.id && 
            record.date === currentDate && 
            !record.signOutTime
          )
        )
        .map((student) => (
          <option key={student.id} value={student.id}>
            {student.name}
          </option>
        ))}
    </select>
  </div>
</div>
{signOutId && (
  <div className="mt-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Comment (required)
    </label>
    <textarea
      value={signOutComment}
      onChange={(e) => setSignOutComment(e.target.value)}
      className="w-full p-2 border rounded text-sm"
      rows={2}
      required
      placeholder="Enter a comment about your sign out..."
      disabled={isLoading}
    />
  </div>
)}
<div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-2">
  <button 
    onClick={handleSignOut} 
    disabled={!signOutId || !signOutComment.trim() || isLoading}
    className="px-3 py-2 md:px-5 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors flex items-center justify-center text-sm md:text-base"
  >
    {isLoading ? (
      <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ) : "Sign Out"}
  </button>
</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
