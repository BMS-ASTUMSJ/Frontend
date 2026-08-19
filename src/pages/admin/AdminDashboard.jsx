import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

import {
  Users,
  Shield,
  Layers,
  UserCheck,
  Calendar,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  Users2,
} from "lucide-react";

function AdminDashboard() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/batches/stats");

        if (isMounted) {
          setStatsData(response.data);
        }
      } catch (err) {
        console.error("Dashboard stats error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Failed to load dashboard statistics.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-125 items-center justify-center">
        <div className="flex items-center gap-3 text-[#1A3D63]">
          <Loader2 className="h-7 w-7 animate-spin" />

          <span className="text-base font-semibold">
            Loading dashboard overview...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const {
    currentBatch = {},
    previousBatches = [],
    overallStats = {},
  } = statsData || {};

  const activeBatchInfo = currentBatch?.batch || {};

  return (
    <div className="min-h-full bg-[#F6FAFD] p-6 sm:p-8">
      <div className="space-y-8">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#4A7FA7]">
              Admin Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#0A1931] sm:text-3xl">
              Welcome back, Admin
            </h1>

            <p className="mt-1 text-sm text-[#7A7F85]">
              Manage the bootcamp and keep everything running smoothly.
            </p>
          </div>

          <Link
            to="/admin/applicants"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#0A1931] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1A3D63]"
          >
            <UserCheck className="h-4 w-4" />
            Review Applicants ({currentBatch?.applicantCount || 0})
          </Link>
        </div>

        {/* =====================================================
            STAT CARDS
        ===================================================== */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Students */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-[#7A7F85]">
                TOTAL STUDENTS
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#0A1931]">
                {overallStats?.totalStudentsAllTime || 0}
              </h2>

              <p className="mt-1 text-xs text-[#7A7F85]">Registered students</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F1F8] text-[#1A3D63]">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Active Mentors */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-[#7A7F85]">
                ACTIVE MENTORS
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#0A1931]">
                {overallStats?.totalMentors || 0}
              </h2>

              <p className="mt-1 text-xs text-[#7A7F85]">Currently active</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <Shield className="h-6 w-6" />
            </div>
          </div>

          {/* Pending Applications */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-[#7A7F85]">
                PENDING APPLICATIONS
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#0A1931]">
                {currentBatch?.applicantCount || 0}
              </h2>

              <p className="mt-1 text-xs text-[#7A7F85]">Waiting for review</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>

          {/* Batches */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-[#7A7F85]">
                BOOTCAMP COHORTS
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#0A1931]">
                {overallStats?.totalBatches || 0}
              </h2>

              <p className="mt-1 text-xs text-[#7A7F85]">Published cohorts</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <Layers className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* =====================================================
            CURRENT ACTIVE BATCH
        ===================================================== */}
        <div className="overflow-hidden rounded-3xl bg-linear-to-br from-[#0A1931] to-[#1A3D63] text-white shadow-xl">
          {/* Batch Header */}
          <div className="border-b border-white/10 p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />

                  <span className="text-xs font-bold uppercase tracking-widest text-[#B3CFE5]">
                    Current Active Bootcamp
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  {activeBatchInfo?.name || "No Active Batch Selected"}
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-gray-300">
                  {activeBatchInfo?.description ||
                    "Active summer bootcamp cohort operations."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-xs font-bold ${
                    activeBatchInfo?.isRegistrationOpen
                      ? "border border-green-400/30 bg-green-500/20 text-green-300"
                      : "border border-gray-400/30 bg-gray-500/20 text-gray-300"
                  }`}
                >
                  {activeBatchInfo?.isRegistrationOpen
                    ? "🟢 Registration OPEN"
                    : "🔴 Registration CLOSED"}
                </span>

                <Link
                  to="/admin/batches"
                  className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  Batch Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Batch Metrics */}
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
            {/* Students */}
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#B3CFE5]">
                Enrolled Students
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {currentBatch?.studentCount || 0}
                </span>

                <span className="text-xs text-gray-300">
                  ({currentBatch?.femaleStudents || 0} female /{" "}
                  {currentBatch?.maleStudents || 0} male )
                </span>
              </div>
            </div>

            {/* Teams */}
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#B3CFE5]">
                Active Teams
              </p>

              <div className="mt-2 text-3xl font-bold">
                {currentBatch?.teamCount || 0}
              </div>

              <p className="mt-1 text-xs text-gray-300">Teams formed</p>
            </div>

            {/* Mentors */}
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#B3CFE5]">
                Available Mentors
              </p>

              <div className="mt-2 text-3xl font-bold">
                {currentBatch?.mentorCount || 0}
              </div>

              <p className="mt-1 text-xs text-gray-300">Active mentors</p>
            </div>

            {/* Applicants */}
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#B3CFE5]">
                Cohort Applicants
              </p>

              <div className="mt-2 text-3xl font-bold">
                {currentBatch?.applicantCount || 0}
              </div>

              <p className="mt-1 text-xs text-gray-300">
                Applications received
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            PREVIOUS BATCHES
        ===================================================== */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0A1931]">
                Previous Bootcamp Cohorts
              </h2>

              <p className="mt-1 text-xs text-[#7A7F85]">
                Historical student enrollment and team records.
              </p>
            </div>

            <Link
              to="/admin/batches"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1A3D63] transition hover:text-[#4A7FA7]"
            >
              Manage All Batches
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6">
            {previousBatches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <Layers className="mx-auto h-8 w-8 text-gray-300" />

                <p className="mt-3 text-sm font-semibold text-[#7A7F85]">
                  No previous cohorts found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Past bootcamp cohorts will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {previousBatches.map((batch) => (
                  <div
                    key={batch._id}
                    className="rounded-2xl border border-gray-100 bg-[#F6FAFD] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[#0A1931]">
                          {batch.name || "Unnamed Batch"}
                        </h3>

                        <span className="text-[11px] font-semibold text-[#4A7FA7]">
                          {batch.status?.toUpperCase() || "COMPLETED"}
                        </span>
                      </div>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-[#7A7F85]">
                        Archived
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 text-xs text-[#7A7F85]">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />

                        <span>
                          <strong className="text-[#0A1931]">
                            {batch.totalStudents || 0}
                          </strong>{" "}
                          Students
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users2 className="h-4 w-4 text-gray-400" />

                        <span>
                          <strong className="text-[#0A1931]">
                            {batch.totalTeams || 0}
                          </strong>{" "}
                          Teams
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />

                        <span>
                          {batch.startDate
                            ? new Date(batch.startDate).getFullYear()
                            : "Past Cohort"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#0A1931]">Quick Actions</h2>

            <p className="mt-1 text-xs text-[#7A7F85]">
              Quickly access the most important admin tools.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Applicants */}
            <Link
              to="/admin/applicants"
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#4A7FA7] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1A3D63]">
                  <UserCheck className="h-5 w-5" />
                </div>

                <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1A3D63]" />
              </div>

              <h3 className="mt-4 font-bold text-[#0A1931]">
                Applicant Reviews
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#7A7F85]">
                Accept or reject registered students and review their
                applications.
              </p>
            </Link>

            {/* Teams */}
            <Link
              to="/admin/teams"
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#4A7FA7] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <Users2 className="h-5 w-5" />
                </div>

                <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1A3D63]" />
              </div>

              <h3 className="mt-4 font-bold text-[#0A1931]">Team Formations</h3>

              <p className="mt-1 text-xs leading-5 text-[#7A7F85]">
                Group students into teams and assign mentors.
              </p>
            </Link>

            {/* Batches */}
            <Link
              to="/admin/batches"
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#4A7FA7] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Calendar className="h-5 w-5" />
                </div>

                <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1A3D63]" />
              </div>

              <h3 className="mt-4 font-bold text-[#0A1931]">
                Cohort Management
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#7A7F85]">
                Manage batches and control public registration.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
