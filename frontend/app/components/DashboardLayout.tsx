"use client";
import { useState } from "react";
import { FaHome, FaUserGraduate, FaChartBar, FaCog, FaBars } from "react-icons/fa";
import Link from "next/link";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className={`bg-gray-800 text-white ${isOpen ? "w-64" : "w-20"} duration-300 p-5`}>
                <button onClick={() => setIsOpen(!isOpen)} className="text-white mb-5">
                    <FaBars size={25} />
                </button>
                <ul className="space-y-4">
                    <li>
                        <Link href="/dashboard">
                            <div className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded">
                                <FaHome size={20} /> {isOpen && "Home"}
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/students">
                            <div className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded">
                                <FaUserGraduate size={20} /> {isOpen && "Manage Students"}
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/reports">
                            <div className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded">
                                <FaChartBar size={20} /> {isOpen && "Attendance Reports"}
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/settings">
                            <div className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded">
                                <FaCog size={20} /> {isOpen && "Settings"}
                            </div>
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-gray-100">
                {/* Top Navbar */}
                <div className="bg-white p-4 shadow flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    <button className="bg-red-500 px-4 py-2 text-white rounded">Logout</button>
                </div>

                {/* Content */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

export default DashboardLayout;
