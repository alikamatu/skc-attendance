"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useState, useEffect } from "react";

interface Attendance {
    id: number;
    student_name: string;
    date: string;
    status: string;
}

export default function AttendanceReports() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [error, setError] = useState("");

    const fetchAttendance = async () => {
        if (!startDate || !endDate) {
            alert("Please select a start and end date.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/attendance?start=${startDate}&end=${endDate}`);
            if (!res.ok) throw new Error("Failed to fetch attendance.");
            
            const data = await res.json();
            setAttendance(data);
            setError(""); // Clear errors if successful
        } catch (err) {
            setError("Error fetching attendance report. Please try again.");
            console.error("Fetch error:", err);
        }
    };

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold">📅 Attendance Reports</h2>

            <div className="mt-4 flex space-x-2">
                <input type="date" className="border p-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" className="border p-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <button onClick={fetchAttendance} className="bg-blue-500 text-white px-4 py-2 rounded">Fetch Reports</button>
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <h3 className="mt-6 text-lg font-semibold">Results</h3>
            <ul className="mt-4">
                {attendance.length > 0 ? (
                    attendance.map((record) => (
                        <li key={record.id} className="p-2 border-b">
                            {record.student_name} - {record.date} ({record.status})
                        </li>
                    ))
                ) : (
                    <p className="text-gray-500">No attendance records found.</p>
                )}
            </ul>
        </DashboardLayout>
    );
}
