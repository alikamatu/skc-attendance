"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { format, subDays } from 'date-fns';

Chart.register(...registerables);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
  });
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7),
    end: new Date(),
  });

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const attendanceData = {
    labels: ['Morning', 'Afternoon', 'Evening'],
    datasets: [
      {
        label: 'Attendance by Session',
        data: [65, 59, 80], // Replace with actual data
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Students" 
            value={stats.totalStudents} 
            icon="👥" 
          />
          <StatCard 
            title="Present Today" 
            value={stats.presentToday} 
            icon="✅" 
          />
          <StatCard 
            title="Absent Today" 
            value={stats.absentToday} 
            icon="❌" 
          />
          <StatCard 
            title="Attendance Rate" 
            value={`${stats.attendanceRate}%`} 
            icon="📊" 
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Attendance by Session</h2>
            <Bar data={attendanceData} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Session Distribution</h2>
            <Pie data={attendanceData} />
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Generate Report</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <input
                type="date"
                value={format(dateRange.start, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange({...dateRange, start: new Date(e.target.value)})}
                className="p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <input
                type="date"
                value={format(dateRange.end, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange({...dateRange, end: new Date(e.target.value)})}
                className="p-2 border rounded"
              />
            </div>
            <button className="mt-6 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Generate Report
            </button>
          </div>
        </div>
      </motion.div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.03 }}
      className="bg-white p-4 rounded-lg shadow"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </motion.div>
  );
}