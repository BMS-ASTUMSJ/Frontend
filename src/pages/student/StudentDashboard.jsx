import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [metrics, setMetrics] = useState({
    attendanceRate: 0,
    assignmentCount: 0,
    progressRate: 0,
    announcementCount: 0,
  });

  useEffect(() => {
    const fetchRealDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.get("/api/dashboard/student/metrics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setStudentName(response.data.student.fullName);
          setMetrics(response.data.metrics);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError(
          err.response?.data?.message || "Failed to connect to backend server.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRealDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-600 font-medium">
        Loading real-time student data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-red-500 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Dynamic Welcome Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-sky-600">Student Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome back, {studentName || "Student"}
        </h1>
        <p className="text-slate-500 mt-1">
          Keep learning, complete your assignments and track your progress.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Attendance Metric */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Attendance</p>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {metrics.attendanceRate}%
            </h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Assignments Metric */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Assignments</p>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {metrics.assignmentCount}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        {/* Progress Metric */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Progress</p>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {metrics.progressRate}%
            </h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>

        {/* Announcements Metric */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Announcements</p>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {metrics.announcementCount}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5.882T19.24 3 22 4.12V17g-11-11.118L2 10v4l9 4.12"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Progress Card Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800">Your Progress</h3>
          <p className="text-sm text-slate-500 mb-4">
            Keep working toward completing the bootcamp.
          </p>
          <div className="flex justify-between items-center text-sm font-semibold mb-2">
            <span className="text-slate-700">Overall Progress</span>
            <span className="text-sky-600">{metrics.progressRate}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-sky-600 h-full transition-all duration-300"
              style={{ width: `${metrics.progressRate}%` }}
            ></div>
          </div>
        </div>

        {/* Announcements Action Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Latest Announcement
            </h3>
            <p className="text-sm text-slate-500">
              Check the announcements section regularly for important updates
              from the bootcamp administration.
            </p>
          </div>
          <button className="mt-6 w-max px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors">
            View Announcements
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
