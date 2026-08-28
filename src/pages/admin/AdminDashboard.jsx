import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import {
  Users,
  Shield,
  Layers,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  BarChart3,
  ClipboardCheck,
  Activity,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

function AdminDashboard() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/batches/dashboard-stats");

        if (isMounted) {
          setStatsData(response.data);
        }
      } catch (err) {
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
      <div className="flex min-h-screen items-center justify-center bg-[#EEF4F7]">
        <div className="flex items-center gap-2.5 rounded-2xl bg-white p-6 shadow-xl shadow-cyan-950/5 border border-cyan-100/60">
          <Loader2 className="h-6 w-6 animate-spin text-[#00A8CC]" />
          <span className="text-sm font-semibold tracking-wide text-[#14222B]">
            Loading dashboard overview...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EEF4F7] p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/90 p-4 text-xs font-semibold text-rose-700 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentBatch = statsData?.currentBatch || {};
  const previousBatches = statsData?.previousBatches || [];
  const overallStats = statsData?.overallStats || {};
  const activeBatch = currentBatch?.batch || null;

  const attendanceStats = statsData?.attendanceStats ||
    statsData?.attendance || {
      present: 0,
      absent: 0,
      late: 0,
    };

  const assignmentStats = statsData?.assignmentStats ||
    statsData?.assignments || {
      completed: 0,
      pending: 0,
      overdue: 0,
    };

  const recentActivity =
    statsData?.recentActivity || statsData?.activities || [];

  const attendanceTotal =
    Number(attendanceStats?.present || 0) +
    Number(attendanceStats?.absent || 0) +
    Number(attendanceStats?.late || 0);

  const assignmentTotal =
    Number(assignmentStats?.completed || 0) +
    Number(assignmentStats?.pending || 0) +
    Number(assignmentStats?.overdue || 0);

  const attendanceLineData = [
    {
      label: "Present",
      value: attendanceStats?.present || 0,
      color: "#10B981",
    },
    {
      label: "Absent",
      value: attendanceStats?.absent || 0,
      color: "#F43F5E",
    },
    {
      label: "Late",
      value: attendanceStats?.late || 0,
      color: "#FBBF24",
    },
  ];

  const assignmentChartData = [
    {
      label: "Done",
      value: assignmentStats?.completed || 0,
      activeBg: "bg-[#00A8CC]",
      activeShadow: "shadow-[#00A8CC]/40",
      activeTextColor: "text-[#00A8CC]",
    },
    {
      label: "Pending",
      value: assignmentStats?.pending || 0,
      activeBg: "bg-amber-400",
      activeShadow: "shadow-amber-400/40",
      activeTextColor: "text-amber-600",
    },
    {
      label: "Overdue",
      value: assignmentStats?.overdue || 0,
      activeBg: "bg-rose-500",
      activeShadow: "shadow-rose-500/40",
      activeTextColor: "text-rose-600",
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "Not Set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#EEF4F7] p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-800">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#293E4C]/40 bg-linear-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] p-5 shadow-xl shadow-cyan-950/20 sm:p-6 group">
          <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#00A8CC]/20 opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-75" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A8CC] text-white shadow-md shadow-[#00A8CC]/30 transition-transform duration-300 group-hover:scale-105">
                <Sparkles size={22} strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Admin Dashboard
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Top Summary Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A8CC]/40 hover:shadow-lg hover:shadow-cyan-900/5">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Students
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-[#0F172A] tracking-tight transition-colors duration-300 group-hover:text-[#00A8CC]">
                  {overallStats?.totalStudentsAllTime || 0}
                </h2>
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  All-time registrations
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7FA] text-[#00A8CC] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00A8CC] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#00A8CC]/30">
                <Users size={20} />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A8CC]/40 hover:shadow-lg hover:shadow-cyan-900/5">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Mentors
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-[#0F172A] tracking-tight transition-colors duration-300 group-hover:text-[#00A8CC]">
                  {overallStats?.totalMentors || 0}
                </h2>
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Assigned instructors
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7FA] text-[#00A8CC] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00A8CC] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#00A8CC]/30">
                <Shield size={20} />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A8CC]/40 hover:shadow-lg hover:shadow-cyan-900/5">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Bootcamp Batches
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-[#0F172A] tracking-tight transition-colors duration-300 group-hover:text-[#00A8CC]">
                  {overallStats?.totalBatches || 0}
                </h2>
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Total program cohorts
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7FA] text-[#00A8CC] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00A8CC] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#00A8CC]/30">
                <Layers size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#293E4C]/50 bg-linear-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] text-white shadow-xl">
          <div className="border-b border-white/10 px-6 py-5 backdrop-blur-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00A8CC] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                    Current Active Bootcamp
                  </span>
                </div>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
                  {activeBatch?.name || "No Active Batch Selected"}
                </h2>

                <p className="mt-1 max-w-2xl text-xs text-slate-300 leading-relaxed">
                  {activeBatch?.description ||
                    "No active bootcamp is currently selected."}
                </p>
              </div>

              <div>
                {activeBatch ? (
                  <span className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 shadow-sm backdrop-blur-md">
                    Active Session
                  </span>
                ) : (
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[10px] font-bold text-slate-300 backdrop-blur-md">
                    No Active Cohort
                  </span>
                )}
              </div>
            </div>
          </div>

          {activeBatch ? (
            <div className="grid grid-cols-2 gap-3 p-5 lg:grid-cols-4">
              <div className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-[#00A8CC]/50 hover:bg-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 transition-colors duration-300 group-hover:text-white">
                  Enrolled Students
                </p>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-white">
                    {currentBatch?.studentCount || 0}
                  </span>
                </div>
              </div>

              <div className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-[#00A8CC]/50 hover:bg-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 transition-colors duration-300 group-hover:text-white">
                  Active Teams
                </p>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-white">
                  {currentBatch?.teamCount || 0}
                </div>
              </div>

              <div className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-[#00A8CC]/50 hover:bg-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 transition-colors duration-300 group-hover:text-white">
                  Available Mentors
                </p>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-white">
                  {currentBatch?.mentorCount || 0}
                </div>
              </div>

              <div className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-[#00A8CC]/50 hover:bg-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 transition-colors duration-300 group-hover:text-white">
                  Cohort Applicants
                </p>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-white">
                  {currentBatch?.applicantCount || 0}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Layers className="mx-auto h-8 w-8 text-slate-400 opacity-60" />
              <p className="mt-2 text-xs font-bold text-slate-200">
                No Active Batch Selected
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Activate a batch from Batch Management to view it here.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#00A8CC]/30 hover:shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC] transition-transform duration-300 group-hover:scale-105">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Attendance Statics
                  </h2>
                </div>
              </div>
              <TrendingUp
                size={16}
                className="text-[#00A8CC] transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </div>

            <FancyLineDotChart
              data={attendanceLineData}
              total={attendanceTotal}
            />
          </div>

          <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#00A8CC]/30 hover:shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC] transition-transform duration-300 group-hover:scale-105">
                  <ClipboardCheck size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Assignment Statistics
                  </h2>
                </div>
              </div>
              <BarChart3
                size={16}
                className="text-[#00A8CC] transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </div>

            <FancyInteractiveBarChart
              data={assignmentChartData}
              total={assignmentTotal}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC]">
                <Activity size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  Recent Activity
                </h2>
                <p className="text-xs text-[#8FA3B0]">
                  Latest actions and live system event stream
                </p>
              </div>
            </div>
            <Clock size={16} className="text-slate-400" />
          </div>

          <div className="mt-5">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs font-bold text-slate-600">
                  No recent activity recorded
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, index) => {
                  const isMentor = activity?.message?.includes("MENTOR");
                  const isStudent = activity?.message?.includes("STUDENT");
                  const isApplicant = activity?.message?.includes("applicant");

                  const badgeCode = isMentor
                    ? "ME"
                    : isStudent
                      ? "ST"
                      : isApplicant
                        ? "AP"
                        : "AC";

                  return (
                    <div
                      key={activity?._id || index}
                      className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 border-l-[5px] border-l-[#00A8CC] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F5F9] font-bold text-xs text-[#00A8CC] transition-colors duration-300 group-hover:bg-[#00A8CC] group-hover:text-white">
                          {badgeCode}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[#0F172A] transition-colors duration-200 group-hover:text-[#00A8CC]">
                            {activity?.message || "New system event"}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#00A8CC] mt-0.5">
                            LIVE EVENT STREAM
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 self-end sm:self-auto">
                        <Clock
                          size={13}
                          className="text-[#8FA3B0] transition-colors duration-200 group-hover:text-[#00A8CC]"
                        />
                        <span>
                          {activity?.createdAt
                            ? new Date(activity.createdAt).toLocaleString(
                                "en-US",
                                {
                                  month: "numeric",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                  second: "numeric",
                                  hour12: true,
                                },
                              )
                            : "Recently"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Bootcamp Cohorts
              </h2>
            </div>
            <Link
              to="/admin/batches"
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-[#00A8CC] transition-colors hover:text-[#008ba8] hover:underline"
            >
              <span>Manage Batches</span>
              <ArrowRight
                size={13}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="mt-5">
            {previousBatches.length === 0 ? (
              <div className="p-8 text-center">
                <Layers className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs font-bold text-slate-600">
                  No previous cohorts recorded
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="hidden md:grid grid-cols-[1.5fr_1.2fr_1fr_1fr_120px] gap-4 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                  <span>DELIVERABLE BATCH</span>
                  <span>TIMELINE DURATION</span>
                  <span>TOTAL STUDENTS</span>
                  <span>STATUS</span>
                  <span className="text-right">ACTION</span>
                </div>

                {previousBatches.map((batch) => {
                  const initials = batch.name
                    ? batch.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "BH";

                  return (
                    <div
                      key={batch._id}
                      className="group grid grid-cols-1 md:grid-cols-[1.5fr_1.2fr_1fr_1fr_120px] items-center gap-3 rounded-2xl border border-slate-200 border-l-[5px] border-l-[#00A8CC] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F5F9] text-xs font-bold text-[#00A8CC] transition-colors duration-300 group-hover:bg-[#00A8CC] group-hover:text-white">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[#0F172A] transition-colors duration-200 group-hover:text-[#00A8CC]">
                            {batch.name || "Unnamed Batch"}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#00A8CC]">
                            COHORT ARCHIVE
                          </p>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#00A8CC]" />
                          <span>{formatDate(batch.startDate)}</span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Users size={13} className="text-[#8FA3B0]" />
                          <span>{batch.totalStudents || 0} students</span>
                        </div>
                      </div>

                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 shadow-2xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                          {batch.status?.toUpperCase() || "COMPLETED"}
                        </span>
                      </div>

                      <div className="flex items-center justify-end">
                        <Link
                          to="/admin/batches"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#00A8CC] transition-all duration-200 group-hover:translate-x-0.5 group-hover:underline"
                        >
                          <span>Inspect</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FancyLineDotChart({ data, total }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const points = data.map((item, idx) => {
    const percent =
      total > 0 ? Math.round((Number(item.value || 0) / total) * 100) : 0;
    const x = 50 + idx * 150;
    const y = 140 - (percent / 100) * 105;
    return { ...item, percent, x, y };
  });

  const pathD =
    points.length === 3
      ? `M ${points[0].x} ${points[0].y} C ${(points[0].x + points[1].x) / 2} ${points[0].y}, ${(points[0].x + points[1].x) / 2} ${points[1].y}, ${points[1].x} ${points[1].y} C ${(points[1].x + points[2].x) / 2} ${points[1].y}, ${(points[1].x + points[2].x) / 2} ${points[2].y}, ${points[2].x} ${points[2].y}`
      : "";

  const areaD =
    pathD.length > 0
      ? `${pathD} L ${points[2].x} 150 L ${points[0].x} 150 Z`
      : "";

  return (
    <div className="relative pt-3">
      <div className="relative h-45 w-full overflow-hidden">
        <svg
          viewBox="0 0 400 170"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00A8CC" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00A8CC" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <line
            x1="30"
            y1="35"
            x2="370"
            y2="35"
            stroke="#E2E8F0"
            strokeDasharray="4 4"
          />
          <line
            x1="30"
            y1="90"
            x2="370"
            y2="90"
            stroke="#E2E8F0"
            strokeDasharray="4 4"
          />
          <line x1="30" y1="145" x2="370" y2="145" stroke="#E2E8F0" />

          {areaD && <path d={areaD} fill="url(#areaGradient)" />}

          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#00A8CC"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={pt.label}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "12" : "7"}
                  fill={pt.color}
                  fillOpacity={isHovered ? "0.3" : "0.15"}
                  className="transition-all duration-300"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "6" : "4.5"}
                  fill="#FFFFFF"
                  stroke={pt.color}
                  strokeWidth="3"
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
        </svg>

        {points.map((pt, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={pt.label}
              style={{
                left: `${(pt.x / 400) * 100}%`,
                top: `${(pt.y / 170) * 100}%`,
              }}
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-full pb-3 transition-all duration-200 ${
                isHovered
                  ? "scale-100 opacity-100 -translate-y-3"
                  : "scale-90 opacity-0"
              }`}
            >
              <div className="rounded-xl border border-slate-700/60 bg-[#0C2331] px-3 py-1.5 text-center text-white shadow-2xl">
                <p className="text-[9px] font-black uppercase text-[#00A8CC]">
                  {pt.label}
                </p>
                <p className="text-xs font-bold leading-tight">
                  {pt.value} count ({pt.percent}%)
                </p>
              </div>
              <div className="mx-auto h-1.5 w-2 bg-[#0C2331] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
            </div>
          );
        })}
      </div>

      <div className="flex justify-around px-2 text-center">
        {points.map((pt, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={pt.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer transition-all"
            >
              <p
                className={`text-xs font-black transition-colors ${
                  isHovered ? "text-[#0F172A]" : "text-slate-500"
                }`}
              >
                {pt.percent}%
              </p>
              <p
                className={`text-[11px] font-bold transition-colors ${
                  isHovered ? "text-[#00A8CC]" : "text-slate-400"
                }`}
              >
                {pt.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FancyInteractiveBarChart({ data, total }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div className="relative pt-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-37.5 flex-col justify-between opacity-30">
        <div className="w-full border-b border-dashed border-slate-200" />
        <div className="w-full border-b border-dashed border-slate-200" />
        <div className="w-full border-b border-dashed border-slate-200" />
      </div>

      <div className="relative flex h-40 items-end justify-around gap-6 px-4">
        {data.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          const percent =
            total > 0 ? Math.round((Number(item.value || 0) / total) * 100) : 0;
          const barHeight = Math.max(percent, percent > 0 ? 10 : 3);

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="group relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
            >
              <div
                className={`pointer-events-none absolute -top-12 z-30 flex flex-col items-center transition-all duration-200 ${
                  isHovered
                    ? "scale-100 opacity-100 -translate-y-1"
                    : "scale-95 opacity-0 translate-y-2"
                }`}
              >
                <div className="rounded-xl border border-slate-700/60 bg-[#0C2331] px-3 py-1.5 text-center text-white shadow-2xl">
                  <p className="text-[10px] font-black tracking-wider text-[#00A8CC] uppercase">
                    {item.label}
                  </p>
                  <p className="text-xs font-bold leading-tight">
                    {item.value} count ({percent}%)
                  </p>
                </div>
                <div className="h-1.5 w-2 bg-[#0C2331] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
              </div>

              <span
                className={`mb-2 text-xs font-black transition-colors duration-200 ${
                  isHovered
                    ? item.activeTextColor
                    : "text-slate-400 group-hover:text-slate-700"
                }`}
              >
                {percent}%
              </span>

              <div className="relative flex h-full max-h-27.5 w-full max-w-12.5 items-end overflow-hidden rounded-2xl bg-slate-100/90 p-1 transition-all duration-300 group-hover:bg-slate-200/80">
                <div
                  className={`w-full rounded-xl transition-all duration-500 ${
                    isHovered
                      ? `${item.activeBg} shadow-lg ${item.activeShadow}`
                      : "bg-slate-300/80"
                  }`}
                  style={{
                    height: `${barHeight}%`,
                    minHeight: "6px",
                  }}
                />
              </div>

              <span
                className={`mt-2.5 text-[11px] font-bold transition-colors duration-200 ${
                  isHovered ? "text-[#0F172A]" : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminDashboard;
