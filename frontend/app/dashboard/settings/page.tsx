"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });
  const [passwordChange, setPasswordChange] = useState({ oldPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add admin");
      }

      setMessage("New admin added successfully!");
      setNewAdmin({ username: "", password: "" });
    } catch (error) {
      console.error("Error adding admin:", error);
      setMessage("Failed to add admin.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordChange),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to change password");
      }

      setMessage("Password changed successfully!");
      setPasswordChange({ oldPassword: "", newPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage("Failed to change password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="space-y-8 w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

        {/* Add Admin Form */}
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Add New Admin</h3>
          <div>
            <label className="block text-gray-600">Username</label>
            <input
              type="text"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600">Password</label>
            <input
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Add Admin
          </button>
        </form>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Change Password</h3>
          <div>
            <label className="block text-gray-600">Old Password</label>
            <input
              type="password"
              value={passwordChange.oldPassword}
              onChange={(e) => setPasswordChange({ ...passwordChange, oldPassword: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600">New Password</label>
            <input
              type="password"
              value={passwordChange.newPassword}
              onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Change Password
          </button>
        </form>

        {/* Message */}
        {message && <p className="text-center text-gray-700">{message}</p>}
      </div>
    </div>
  );
}