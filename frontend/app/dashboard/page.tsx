"use client";
import { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState("");
  const [report, setReport] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stats, setStats] = useState([]);

  // 🔹 Fetch Students List
  useEffect(() => {
    fetch("http://localhost:5000/api/students")
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  // 🔹 Add Student
  const handleAddStudent = async () => {
    if (!newStudent) return;

    const res = await fetch("http://localhost:5000/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStudent }),
    });

    if (res.ok) {
      const student = await res.json();
      setStudents([...students, student]);
      setNewStudent("");
    }
  };

  // 🔹 Remove Student
  const handleRemoveStudent = async (id) => {
    const res = await fetch(`http://localhost:5000/api/admin/students/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setStudents(students.filter(student => student.id !== id));
    }
  };

  // 🔹 Generate Attendance Report
  const generateReport = async () => {
    const res = await fetch(`http://localhost:5000/api/admin/attendance/report?startDate=${startDate}&endDate=${endDate}`);
    if (res.ok) {
      const data = await res.json();
      setReport(data);
    }
  };

  // 🔹 Fetch Attendance Stats
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/attendance/stats")
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* ➕ Add Student */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Student Name"
          value={newStudent}
          onChange={(e) => setNewStudent(e.target.value)}
          className="border p-2 rounded mr-2"
        />
        <button onClick={handleAddStudent} className="bg-green-500 text-white px-4 py-2 rounded">Add Student</button>
      </div>

      {/* 🗑️ Students List */}
      <ul className="mb-6">
        {students.map((student) => (
          <li key={student.id} className="flex justify-between bg-gray-100 p-2 mb-2 rounded">
            {student.name}
            <button onClick={() => handleRemoveStudent(student.id)} className="bg-red-500 text-white px-3 py-1 rounded">Remove</button>
          </li>
        ))}
      </ul>

      {/* 📊 Attendance Report */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Generate Attendance Report</h2>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded mr-2" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded mr-2" />
        <button onClick={generateReport} className="bg-blue-500 text-white px-4 py-2 rounded">Generate</button>

        <ul className="mt-4">
          {report.map((record, index) => (
            <li key={index} className="bg-gray-100 p-2 rounded mb-2">
              {record.name} - {record.date} ({record.status})
            </li>
          ))}
        </ul>
      </div>

      {/* 📈 Attendance Stats */}
      <div>
        <h2 className="text-xl font-bold mb-2">Attendance Stats</h2>
        <ul>
          {stats.map((stat, index) => (
            <li key={index} className="bg-gray-100 p-2 rounded mb-2">
              {stat.name}: {stat.total_present} days present
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
