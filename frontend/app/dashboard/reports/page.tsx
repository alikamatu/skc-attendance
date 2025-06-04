"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useState } from "react";
import { FiAlertCircle, FiDownload, FiFilter, FiRefreshCw, FiUser } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface Attendance {
  id: number;
  student_name: string;
  date: string;
  signed_in_at: string | null;
  signed_out_at: string | null;
  comment: string;
  session: string;
  branch: string;
}

export default function AttendanceReports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [error, setError] = useState("");
  const [session, setSession] = useState("");
  const [isLoading, setIsLoading] = useState(false);
    const [branch, setBranch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateFormat] = useState("DD MMM YYYY");

  // Fetch Attendance with loading state
  const fetchAttendance = async () => {
    if (!startDate || !endDate) {
      setError("Please select a start and end date");
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    let url = `https://skc-attendance.onrender.com/api/attendance/?start=${startDate}&end=${endDate}`;
    if (session) url += `&session=${session}`;
    if (branch) url += `&branch=${branch}`; // Add branch to the query
  
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAttendance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch attendance");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export functions
  const handleExport = async (type: "csv" | "pdf") => {
    if (!startDate || !endDate) {
      setError("Please select start and end dates");
      return;
    }

    let url = `https://skc-attendance.onrender.com/api/attendance/export/${type}?start=${startDate}&end=${endDate}`;
    if (session) url += `&session=${session}`;
    // if (branch) url += `&branch=${branch}`;
    if (type === "csv") url += `&format=${dateFormat}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `attendance_report.${type}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError(`Failed to export ${type.toUpperCase()}`);
      console.error(`Export ${type} error:`, err);
    }
  };

  // Filter attendance by status
  const filteredAttendance = attendance.filter(() => {
    if (activeTab === "all") return true;
    return true;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "N/A";
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Reports</h1>
            <p className="text-gray-600">View and export attendance records</p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={session}
                onChange={(e) => setSession(e.target.value)}
              >
                <option value="">All Sessions</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="">All Branches</option>
                <option value="Tema">Tema</option>
                <option value="Mataheko">Mataheko</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchAttendance}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <FiRefreshCw className="animate-spin" />
                ) : (
                  <FiFilter />
                )}
                {isLoading ? "Loading..." : "Apply Filters"}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2"
            >
              <FiAlertCircle />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === "all" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <FiUser />
              All Records ({attendance.length})
            </button>
            {/* <button
              onClick={() => setActiveTab("present")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === "present" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <FiUser />
              Present ({attendance.filter(r => r.status === "present").length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === "completed" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <FiUser />
              Completed ({attendance.filter(r => r.status === "completed").length})
            </button> */}
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            {filteredAttendance.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sign In</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sign Out</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signed Out By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.student_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{record.session}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{record.branch}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(record.signed_in_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(record.signed_out_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.comment}</td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === "present" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {record.status}
                        </span>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                <p className="mt-1 text-sm text-gray-500">Apply filters to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => handleExport("pdf")}
            disabled={attendance.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="mr-2" />
            Export PDF
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
