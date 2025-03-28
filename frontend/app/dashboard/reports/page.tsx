"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useState } from "react";

interface Attendance {
    id: number;
    student_name: string;
    date: string;
    signed_in_at: string | null;
    signed_out_at: string | null;
    status: string;
}

export default function AttendanceReports() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [error, setError] = useState("");
    const [session, setSession] = useState(""); // Default to all sessions
        const [dateFormat, setDateFormat] = useState("DD MMM YYYY");

    // Fetch Attendance
    const fetchAttendance = async () => {
        if (!startDate || !endDate) {
            alert("Please select a start and end date.");
            return;
        }

        let url = `http://localhost:5000/api/attendance/?start=${startDate}&end=${endDate}`;
        if (session) url += `&session=${session}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch attendance.");
            const data = await res.json();
            setAttendance(data);
            setError(""); // Clear errors if successful
        } catch (err) {
            setError("Error fetching attendance report. Please try again.");
            console.error("Fetch error:", err);
        }
    };

    // Export CSV
    const fetchCSV = () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        let csvUrl = `http://localhost:5000/api/attendance/export?start=${startDate}&end=${endDate}`;
        if (session) csvUrl += `&session=${session}`;

        window.open(csvUrl, "_blank"); // Open in a new tab for download
    };

    // Export PDF
    const handleExportPDF = () => {
        if (!startDate || !endDate) {
            alert("Please select start and end dates.");
            return;
        }

        let pdfUrl = `http://localhost:5000/api/attendance/export/pdf?start=${startDate}&end=${endDate}`;
        if (session) pdfUrl += `&session=${session}`;

        window.open(pdfUrl, "_blank"); // Open in new tab for download
    };

        const fetchPDF = async () => {
        const response = await fetch(`http://localhost:5000/api/attendance/export/pdf?start=${startDate}&end=${endDate}&session=${session}&format=${dateFormat}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "attendance_report.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert("Failed to export PDF");
        }
    };

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold">📅 Attendance Reports</h2>

            <div className="mt-4 flex space-x-2">
                <input type="date" className="border p-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" className="border p-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                {/* Session Filter Dropdown */}
                <select className="border p-2" value={session} onChange={(e) => setSession(e.target.value)}>
                    <option value="">All Sessions</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                </select>

                <button onClick={fetchAttendance} className="bg-blue-500 text-white px-4 py-2 rounded">Fetch Reports</button>
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <h3 className="mt-6 text-lg font-semibold">Results</h3>
            <ul className="mt-4">
                {attendance.length > 0 ? (
                    attendance.map((record) => (
                        <li key={record.id} className="p-2 border-b">
                            {record.student_name} - {record.date} ({record.status})  
                            <br />
                            Signed In: {record.signed_in_at || "N/A"} | Signed Out: {record.signed_out_at || "N/A"}
                        </li>
                    ))
                ) : (
                    <p className="text-gray-500">No attendance records found.</p>
                )}
            </ul>

            <div className="mt-4 space-x-2">
                <button onClick={handleExportPDF} className="bg-red-500 text-white px-4 py-2 rounded">📄 Export PDF</button>
                <button onClick={fetchCSV} className="bg-green-500 text-white px-4 py-2 rounded">📥 Export CSV</button>
            </div>
        </DashboardLayout>
    );
}
