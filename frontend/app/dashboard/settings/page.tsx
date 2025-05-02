"use client";
import { useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { FiUserPlus, FiKey, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });
  const [passwordChange, setPasswordChange] = useState({ 
    oldPassword: "", 
    newPassword: "",
    confirmPassword: "" 
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("https://skc-attendance-46dh.vercel.app/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add admin");
      }

      setMessage({ 
        text: "New admin added successfully!", 
        type: "success" 
      });
      setNewAdmin({ username: "", password: "" });
    }     catch (error) {
      console.error("Error adding admin:", error);
    
      setMessage({
        text: error instanceof Error ? error.message : "Failed to add admin.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setMessage({ 
        text: "New passwords don't match!", 
        type: "error" 
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://skc-attendance-46dh.vercel.app/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordChange.oldPassword,
          newPassword: passwordChange.newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to change password");
      }

      setMessage({ 
        text: "Password changed successfully!", 
        type: "success" 
      });
      setPasswordChange({ 
        oldPassword: "", 
        newPassword: "",
        confirmPassword: "" 
      });
    }     catch (error) {
      console.error("Error adding admin:", error);
    
      setMessage({
        text: error instanceof Error ? error.message : "Failed to add admin.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-48 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setActiveTab("admin")}
                className={`w-full text-left px-4 py-3 flex items-center gap-2 ${activeTab === "admin" ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <FiUserPlus className="text-lg" />
                <span>Admin Users</span>
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full text-left px-4 py-3 flex items-center gap-2 ${activeTab === "password" ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <FiKey className="text-lg" />
                <span>Password</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Admin Management */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: activeTab === "admin" ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${activeTab !== "admin" ? "hidden" : ""}`}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiUserPlus className="text-blue-500" />
                <span>Add New Admin</span>
              </h2>
              
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter admin username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiUserPlus />
                      Add Admin
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Password Change */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: activeTab === "password" ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${activeTab !== "password" ? "hidden" : ""}`}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiKey className="text-blue-500" />
                <span>Change Password</span>
              </h2>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordChange.oldPassword}
                    onChange={(e) => setPasswordChange({ ...passwordChange, oldPassword: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordChange.newPassword}
                    onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordChange.confirmPassword}
                    onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiKey />
                      Change Password
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Status Message */}
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 p-4 rounded-lg ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
                >
                  <div className="flex items-center gap-2">
                    {message.type === "error" ? (
                      <FiAlertCircle className="text-lg" />
                    ) : (
                      <FiCheckCircle className="text-lg" />
                    )}
                    <span>{message.text}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}