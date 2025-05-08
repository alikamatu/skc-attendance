"use client";
import { useState } from "react";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  interface RegisterResponse {
    message: string;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const response = await fetch("https://skc-attendance-backend.vercel.app/api/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data: RegisterResponse = await response.json();

    if (response.ok) {
      setSuccess("Registration successful! You can now login.");
    } else {
      setError(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2 p-4 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold">Admin Registration</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="border p-2 rounded"/>
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded"/>
      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Register</button>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </form>
  );
};

export default RegisterForm;
