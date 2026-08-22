import { useEffect, useState } from "react";
import {
  ShieldCheck,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  CalendarDays,
  Sparkles,
  RotateCcw,
  ClipboardCheck,
  TrendingUp,
  Activity,
  Calendar,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import api from "../../utils/api";

const EMPTY_SUMMARY = {
  totalSessions: 0,
  totalChecks: 0,
  attendedChecks: 0,
  absentChecks: 0,
  lateChecks: 0,
  excusedChecks: 0,
};

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  // ============================================================
  // FETCH MY ATTENDANCE
  // ============================================================

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/attendance/my-records");
      const data = res.data || {};

      setRecords(Array.isArray(data.records) ? data.records : []);
      setSummary({
        ...EMPTY_SUMMARY,
        ...(data.summary || {}),
      });
      setRate(Number(data.percentage || 0));
    } catch (err) {
      console.error("Failed to load student attendance:", err);
      setError(
        err.response?.data?.message || "Failed to load attendance records."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] to-[#F7C9A4]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-[#FAF4EB]/90 p-8 shadow-xl backdrop-blur-xl">
          <Loader2 className="h-9 w-9 animate-spin text-[#DE7E4A]" />
          <p className="text-sm font-bold text-[#173854]">
            Loading Your Attendance Logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "14px",
            background: "#FAF4EB",
            color: "#16344E",
            border: "1px solid #E8DCB8",
            fontWeight: "600",
          },
        }}
      />

      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.06); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .page-enter { animation: pageEnter 0.6s cubic-bezier(.2,.8,.2,1) both; }
        .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        .float-slow { animation: floatSlow 5s ease-in-out infinite; }
        .smooth-transition { transition: all 220ms ease; }
        
        .heading-gradient {
          background: linear-gradient(90deg, #FFFFFF 0%, #FCD8BF 50%, #7EC8F5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hide-scrollbar::-webkit-scrollbar { height: 6px; }
        .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hide-scrollbar::-webkit-scrollbar-thumb { background: rgba(226, 109, 44, 0.3); border-radius: 999px; }
      `}</style>

      {/* ============================================================
          MAIN CONTAINER (Ice-Blue -> Cream -> Sunset Peach Gradient)
      ============================================================ */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] via-[#F8DECA] to-[#F7C9A4] p-4 text-[#16344E] selection:bg-[#E26D2C] selection:text-white md:p-6 lg:p-8">

        {/* Ambient Moving Glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pulse-glow absolute -top-36 left-1/4 h-[480px] w-[600px] rounded-full bg-[#5FB8F2]/30 blur-[130px]" />
          <div className="absolute top-1/3 -right-20 h-[480px] w-[480px] rounded-full bg-[#F38744]/30 blur-[140px]" />
          <div className="float-slow absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-[#F5A36C]/35 blur-[150px]" />
        </div>

        <div className="page-enter relative z-10 mx-auto max-w-[1500px] space-y-8">

          {/* ======================================================
              1. TOP HEADER BANNER WITH GRADIENT TEXT
          ====================================================== */}
          <header className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-7 shadow-[0_20px_50px_rgba(23,56,84,0.22)] backdrop-blur-2xl md:px-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#F38744]/35 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-[-50px] left-1/3 h-52 w-52 rounded-full bg-[#7EC8F5]/25 blur-[60px]" />

            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="float-slow relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                  <ClipboardCheck size={28} className="text-[#F38744]" strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-gradient-to-r from-[#F38744] to-[#7EC8F5]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Attendance Analytics
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight heading-gradient">
                    My Attendance & Checkpoints
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Track individual checkpoint attendances, verified absences, and performance standing.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchRecords}
                  disabled={loading}
                  className="smooth-transition flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-50"
                >
                  <RotateCcw size={16} className={`text-[#F38744] ${loading ? "animate-spin" : ""}`} />
                  <span>Sync Records</span>
                </button>
              </div>
            </div>
          </header>

          {/* ======================================================
              ALERTS
          ====================================================== */}
          {error && (
            <div className="flex items-start gap-3.5 rounded-2xl border border-rose-300 bg-rose-100/90 p-4.5 text-sm text-rose-800 shadow-sm backdrop-blur-md">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
              <div className="flex-1">
                <p className="font-bold">Unable to load attendance</p>
                <p className="mt-0.5 text-xs text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={fetchRecords}
                  className="mt-2.5 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow"
                >
                  Retry Fetch
                </button>
              </div>
            </div>
          )}

          {/* ======================================================
              2. ATTENDANCE OVERVIEW (PERCENTAGE + DASHBOARD)
          ====================================================== */}
          <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
              
              {/* ATTENDANCE PERCENTAGE SECTION */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      My Attendance Standing
                    </p>
                    <h2 className="mt-2 text-4xl sm:text-5xl font-black text-[#173854] tracking-tight">
                      {rate.toFixed(1)}%
                    </h2>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E0F0FA] text-[#1E6FA3] shadow-sm">
                    <ShieldCheck size={30} />
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-[#EBDCC8]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#DE7E4A] via-[#E26D2C] to-[#1E6FA3] transition-all duration-700"
                    style={{
                      width: `${Math.min(Math.max(rate, 0), 100)}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs font-semibold text-slate-500">
                  💡 Present and Late check-ins count toward active attendance percentage.
                </p>
              </div>

              {/* DIVIDER */}
              <div className="hidden h-32 w-px bg-[#EBDCC8] lg:block" />
              <div className="h-px w-full bg-[#EBDCC8] lg:hidden" />

              {/* PERSONAL DASHBOARD TILES */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User size={18} className="text-[#E26D2C]" />
                  <h3 className="text-base font-black text-[#16344E]">
                    Checkpoint Metrics
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Aggregated statistics across all cohort sessions
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  <SummaryItem label="Sessions" value={summary.totalSessions} />
                  <SummaryItem label="Checks" value={summary.totalChecks} />
                  <SummaryItem label="Attended" value={summary.attendedChecks} />
                  <SummaryItem label="Absent" value={summary.absentChecks} />
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================
              3. STATUS BREAKDOWN CARDS
          ====================================================== */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatusSummary
              icon={<CheckCircle2 size={18} />}
              label="Present"
              value={Math.max(0, summary.attendedChecks - summary.lateChecks)}
              className="text-emerald-700"
              bgClass="bg-emerald-100/70 border-emerald-300"
            />
            <StatusSummary
              icon={<Clock3 size={18} />}
              label="Late"
              value={summary.lateChecks}
              className="text-amber-700"
              bgClass="bg-amber-100/70 border-amber-300"
            />
            <StatusSummary
              icon={<XCircle size={18} />}
              label="Absent"
              value={summary.absentChecks}
              className="text-rose-700"
              bgClass="bg-rose-100/70 border-rose-300"
            />
            <StatusSummary
              icon={<ShieldCheck size={18} />}
              label="Excused"
              value={summary.excusedChecks}
              className="text-blue-700"
              bgClass="bg-blue-100/70 border-blue-300"
            />
          </div>

          {/* ======================================================
              4. ATTENDANCE HISTORY TABLE (Creamy Alabaster)
          ====================================================== */}
          <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[#EBDCC8] p-6">
              <div>
                <h3 className="text-xl font-black text-[#16344E]">
                  Attendance Checkpoint Log
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Chronological record of first and second attendance checks
                </p>
              </div>

              <span className="rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0] px-4 py-2 text-xs font-black text-[#173854]">
                Total: {records.length} Records
              </span>
            </div>

            {records.length === 0 ? (
              <div className="p-12 text-center">
                <ShieldCheck size={36} className="mx-auto text-[#DE7E4A]" />
                <h4 className="mt-3 text-base font-black text-[#16344E]">
                  No attendance records yet
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Your attendance will appear here after your mentor marks the roll call.
                </p>
              </div>
            ) : (
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Date
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Session Name
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Format
                      </th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        First Check (AM)
                      </th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Second Check (PM)
                      </th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Overall Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((record) => (
                      <AttendanceTableRow key={record._id} record={record} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

// ============================================================
// TABLE ROW COMPONENT
// ============================================================
const AttendanceTableRow = ({ record }) => {
  const date = record.date ? new Date(record.date) : null;
  const firstStatus = record.firstCheck?.status || null;
  const secondStatus = record.secondCheck?.status || null;

  let overallStatus = "Not Marked";
  if (firstStatus === "Absent" || secondStatus === "Absent") {
    overallStatus = "Absent";
  } else if (firstStatus === "Late" || secondStatus === "Late") {
    overallStatus = "Late";
  } else if (firstStatus === "Excused" || secondStatus === "Excused") {
    overallStatus = "Excused";
  } else if (firstStatus === "Present" || secondStatus === "Present") {
    overallStatus = "Present";
  }

  return (
    <tr className="smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]">
      {/* DATE */}
      <td className="whitespace-nowrap px-6 py-4.5">
        <div className="font-bold text-[#16344E]">
          {date
            ? date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Unknown date"}
        </div>
        {date && (
          <div className="text-[10px] font-semibold text-slate-400">
            {date.toLocaleDateString(undefined, { weekday: "long" })}
          </div>
        )}
      </td>

      {/* SESSION */}
      <td className="px-6 py-4.5 font-bold text-[#16344E]">
        {record.sessionName || record.sessionType || "Attendance Session"}
      </td>

      {/* TYPE */}
      <td className="px-6 py-4.5">
        <div className="flex flex-wrap gap-1.5">
          {record.sessionType && (
            <span className="rounded-lg border border-[#DFCBB5] bg-[#FFFDF9] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#173854]">
              {record.sessionType}
            </span>
          )}
        </div>
      </td>

      {/* FIRST CHECK */}
      <td className="px-6 py-4.5 text-center">
        <RecordStatus status={firstStatus} />
      </td>

      {/* SECOND CHECK */}
      <td className="px-6 py-4.5 text-center">
        <RecordStatus status={secondStatus} />
      </td>

      {/* OVERALL STATUS */}
      <td className="px-6 py-4.5 text-center">
        <OverallStatus status={overallStatus} />
      </td>
    </tr>
  );
};

// ============================================================
// STATUS PILLS
// ============================================================
const RecordStatus = ({ status }) => {
  const styles = {
    Present: "border-emerald-300 bg-emerald-100/80 text-emerald-800",
    Late: "border-amber-300 bg-amber-100/80 text-amber-800",
    Absent: "border-rose-300 bg-rose-100/80 text-rose-800",
    Excused: "border-blue-300 bg-blue-100/80 text-blue-800",
  };

  const displayStatus = status || "Not Marked";
  const statusStyle = styles[status] || "border-slate-200 bg-slate-100 text-slate-500";

  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${statusStyle}`}>
      {displayStatus}
    </span>
  );
};

const OverallStatus = ({ status }) => {
  const styles = {
    Present: "border-emerald-300 bg-emerald-100 text-emerald-800",
    Late: "border-amber-300 bg-amber-100 text-amber-800",
    Absent: "border-rose-300 bg-rose-100 text-rose-800",
    Excused: "border-blue-300 bg-blue-100 text-blue-800",
    "Not Marked": "border-slate-200 bg-slate-100 text-slate-500",
  };

  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-black ${styles[status] || styles["Not Marked"]}`}>
      {status}
    </span>
  );
};

// ============================================================
// SUMMARY ITEMS & CARDS
// ============================================================
const SummaryItem = ({ label, value }) => (
  <div className="rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-3 text-center">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-lg font-black text-[#16344E]">{value ?? 0}</p>
  </div>
);

const StatusSummary = ({ icon, label, value, className, bgClass }) => (
  <div className={`smooth-transition rounded-[24px] border p-5 shadow-[0_10px_30px_rgba(23,56,84,0.06)] backdrop-blur-xl ${bgClass}`}>
    <div className={`mb-2 flex items-center gap-2 font-black text-xs uppercase tracking-wider ${className}`}>
      {icon}
      <span>{label}</span>
    </div>
    <p className={`text-2xl font-black ${className}`}>{value ?? 0}</p>
  </div>
);

export default StudentAttendance;