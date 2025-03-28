"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useState, useEffect } from "react";

interface Student {
    id: number;
    name: string;
    session: string;
}

export default function ManageStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [name, setName] = useState("");
    const [session, setSession] = useState(""); // Filter session
    const [page, setPage] = useState(1);
    const limit = 5; // Items per page

    useEffect(() => {
        fetch(`http://localhost:5000/api/students/fetch?session=${session}&page=${page}&limit=${limit}`)
            .then((res) => res.json())
            .then((data) => setStudents(data))
            .catch((error) => console.error("Fetch error:", error));
    }, [session, page]);

    // Add Student
    const handleAddStudent = async () => {
        if (!name || !session) {
            alert("Please enter both name and session");
            return;
        }
    
        const response = await fetch("http://localhost:5000/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, session }),
        });
    
        if (response.ok) {
            const newStudent = await response.json();
            setStudents((prevStudents) => [...prevStudents, newStudent]);
            setName("");
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    };
    

    // Delete Student
    const handleDeleteStudent = async (id: number) => {
        await fetch(`http://localhost:5000/api/students/${id}`, { method: "DELETE" });
        setStudents(students.filter((student) => student.id !== id));
    };

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold">👨‍🎓 Manage Students</h2>
            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Student Name"
                    className="border p-2 mr-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <select className="border p-2 mr-2" value={session} onChange={(e) => setSession(e.target.value)}>
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                </select>
                <button onClick={handleAddStudent} className="bg-blue-500 text-white px-4 py-2 rounded">Add Student</button>
            </div>

            <h2 className="text-2xl font-bold">👨‍🎓 Students</h2>

            {/* Filter by session */}
            <select value={session} onChange={(e) => setSession(e.target.value)}>
                <option value="">All Sessions</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
            </select>

            {/* Student List */}
            <ul className="mt-4">
                {students.map((student) => (
                    <li key={student.id} className="p-2 border-b">
                        {student.name} - {student.session}
                    </li>
                ))}
            </ul>

            {/* Pagination Controls */}
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span> Page {page} </span>
            <button onClick={() => setPage(page + 1)}>Next</button>
        </DashboardLayout>
    );
}
