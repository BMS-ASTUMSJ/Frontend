import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  FileText,
  BarChart3,
  Megaphone,
  AlertCircle,
  GraduationCap,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";

import api from "../../utils/api";

function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/users/student-dashboard");

        if (response.data.success) {
          setDashboard(response.data.dashboard);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF4F7]">
        <div className="flex items-center gap-2.5 rounded-2xl border border-cyan-100/60 bg-white p-6 shadow-xl shadow-cyan-950/5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
            <Activity className="h-5 w-5 animate-pulse text-[#00A8CC]" />
          </div>

          <span className="text-sm font-semibold tracking-wide text-[#14222B]">
            Loading dashboard overview...
          </span>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const {
    student = {},
    attendance = {},
    progress = {},
    assignments = {},
    grades = {},
    announcements = [],
    risk = {},
  } = dashboard;

  const stats = [
    {
      title: "Attendance",
      value: `${attendance?.percentage || 0}%`,
      icon: ClipboardCheck,
      subtitle: "Attendance rate",
    },
    {
      title: "Assignments",
      value: `${assignments?.submitted || 0}/${assignments?.total || 0}`,
      icon: FileText,
      subtitle: "Completed tasks",
    },
    {
      title: "Progress",
      value: `${progress?.completed || 0}/${progress?.total || 0}`,
      icon: BarChart3,
      subtitle: progress?.percentage
        ? `${progress.percentage}% learning progress`
        : "Learning progress",
    },
    {
      title: "Average Grade",
      value: `${grades?.average || 0}%`,
      icon: GraduationCap,
      subtitle: "Academic performance",
    },
  ];

  return (
    <div className="min-h-screen bg-[#EEF4F7] p-4 font-sans antialiased text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="group relative overflow-hidden rounded-2xl border border-[#293E4C]/40 bg-linear-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] p-5 text-white shadow-xl shadow-cyan-950/20 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#00A8CC]/20 opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />

          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A8CC] text-white shadow-md shadow-[#00A8CC]/30 transition-transform duration-300 group-hover:scale-105">
              <Users size={22} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Student Dashboard
              </h1>

              <p className="mt-0.5 text-[11px] font-medium text-cyan-200/70">
                Personal learning overview
              </p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#00A8CC]/30 hover:shadow-lg hover:shadow-cyan-900/5 sm:p-6">
          <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-100/40 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-cyan-100 bg-[#EAF7FA] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#00A8CC]">
                Student Portal
              </span>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#0F172A]">
                Welcome back, {student?.firstName || "Student"}
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Track your assignments, attendance and learning progress.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#F6FAFC] p-3.5 transition-all duration-300 group-hover:border-[#00A8CC]/30 group-hover:bg-[#EAF7FA]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12313B] text-sm font-black text-white shadow-md shadow-slate-900/10">
                {student?.firstName?.[0] || "S"}
                {student?.lastName?.[0] || ""}
              </div>

              <div>
                <p className="text-xs font-bold text-[#0F172A]">
                  {student?.firstName || "Student"} {student?.lastName || ""}
                </p>

                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00A8CC]">
                  Student
                </p>
              </div>
            </div>
          </div>
        </div>

        {risk?.isAtRisk && (
          <div className="group relative overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/90 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="absolute bottom-0 left-0 h-0.75 w-0 bg-amber-400 transition-all duration-500 group-hover:w-full" />

            <div className="relative flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-sm">
                <AlertCircle size={21} />
              </div>

              <div>
                <h3 className="font-bold text-amber-800">Performance Alert</h3>

                {risk?.reasons?.map((reason, index) => (
                  <p
                    key={index}
                    className="mt-1 text-xs font-medium text-amber-700"
                  >
                    • {reason}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A8CC]/40 hover:shadow-lg hover:shadow-cyan-900/5"
              >
                <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {item.title}
                    </p>

                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A] transition-colors duration-300 group-hover:text-[#00A8CC]">
                      {item.value}
                    </h2>

                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7FA] text-[#00A8CC] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00A8CC] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#00A8CC]/30">
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#00A8CC]/30 hover:shadow-md">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

            <div className="relative flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC] transition-transform duration-300 group-hover:scale-105">
                  <ClipboardCheck size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Attendance Overview
                  </h2>

                  <p className="mt-0.5 text-[10px] font-medium text-[#8FA3B0]">
                    Your attendance statistics
                  </p>
                </div>
              </div>

              <TrendingUp
                size={16}
                className="text-[#00A8CC] transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </div>

            <div className="relative mt-6 grid grid-cols-2 gap-4">
              <div className="group/stat rounded-xl border border-emerald-100 bg-emerald-50/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">
                    Present
                  </p>

                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>

                <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                  {attendance?.present || 0}
                </p>
              </div>

              <div className="group/stat rounded-xl border border-rose-100 bg-rose-50/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">Absent</p>

                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                </div>

                <p className="mt-2 text-2xl font-extrabold text-rose-700">
                  {attendance?.absent || 0}
                </p>
              </div>

              <div className="group/stat rounded-xl border border-blue-100 bg-blue-50/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">
                    Total Sessions
                  </p>

                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                </div>

                <p className="mt-2 text-2xl font-extrabold text-blue-700">
                  {attendance?.total || 0}
                </p>
              </div>

              <div className="group/stat rounded-xl border border-amber-100 bg-amber-50/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">
                    Excused
                  </p>

                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                </div>

                <p className="mt-2 text-2xl font-extrabold text-amber-700">
                  {attendance?.excused || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#00A8CC]/30 hover:shadow-md">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

            <div className="relative flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC] transition-transform duration-300 group-hover:scale-105">
                  <Megaphone size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Announcements
                  </h2>

                  <p className="mt-0.5 text-[10px] font-medium text-[#8FA3B0]">
                    Latest bootcamp updates
                  </p>
                </div>
              </div>

              <Megaphone
                size={16}
                className="text-[#00A8CC] transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            {announcements?.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center py-8 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <Megaphone size={19} />
                </div>

                <p className="mt-3 text-xs font-bold text-slate-600">
                  No announcements
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  New announcements will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a._id}
                    className="group/announcement rounded-xl border border-slate-200 border-l-4 border-l-[#00A8CC] bg-[#F8FBFC] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E3F5F9] text-[#00A8CC] transition-colors duration-300 group-hover/announcement:bg-[#00A8CC] group-hover/announcement:text-white">
                        <Megaphone size={14} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[#0F172A] transition-colors duration-200 group-hover/announcement:text-[#00A8CC]">
                          {a.title}
                        </h3>

                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                          {a.body || a.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
