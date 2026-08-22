import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  Users,
  X,
  Loader2,
  XCircle,
  FileText,
  AlertCircle,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  Clock,
  UserCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

import api from "../../utils/api";

const AdminAttendance = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    fetchAttendanceStats();
  }, []);

  const fetchAttendanceStats = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/attendance/admin-stats");
      setBatches(res.data.allBatches || []);
    } catch (err) {
      console.error("Failed to load attendance stats:", err);
      setError(
        err.response?.data?.message || "Failed to load attendance statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (batch) => {
    try {
      setSelectedBatch(batch);
      setReport(null);
      setReportError("");
      setReportLoading(true);

      const res = await api.get(`/attendance/admin-report/${batch._id}`);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to load batch report:", err);
      setReportError(
        err.response?.data?.message ||
          "Failed to load the full attendance report."
      );
    } finally {
      setReportLoading(false);
    }
  };

  const closeReport = () => {
    setSelectedBatch(null);
    setReport(null);
    setReportError("");
  };

  // High-level analytics summary
  const summaryStats = useMemo(() => {
    if (!batches.length) return { avgRate: 0, totalStudents: 0, totalSessions: 0 };
    const validBatches = batches.filter((b) => b.totalStudents > 0);
    const totalStudents = batches.reduce((acc, b) => acc + Number(b.totalStudents || 0), 0);
    const totalSessions = batches.reduce((acc, b) => acc + Number(b.totalSessions || 0), 0);
    const avgRate = validBatches.length
      ? validBatches.reduce((acc, b) => acc + Number(b.overallAttendanceRate || 0), 0) /
        validBatches.length
      : 0;

    return {
      avgRate: avgRate.toFixed(1),
      totalStudents,
      totalSessions,
    };
  }, [batches]);

  return (
    <>
      {/* ============================================================
          DYNAMIC ANIMATION STYLES
      ============================================================ */}
      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.07); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .page-enter { animation: pageEnter 0.6s cubic-bezier(.2,.8,.2,1) both; }
        .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        .float-slow { animation: floatSlow 5s ease-in-out infinite; }
        .modal-enter { animation: modalIn 0.25s cubic-bezier(.2,.8,.2,1) both; }
        
        .smooth-transition {
          transition: all 220ms ease;
        }

        .hide-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(226, 109, 44, 0.3);
          border-radius: 999px;
        }
      `}</style>

      {/* ============================================================
          MAIN CONTAINER (Ice-Blue -> Cream -> Sunset Peach Gradient)
      ============================================================ */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] via-[#F8DECA] to-[#F7C9A4] p-4 text-[#16344E] selection:bg-[#E26D2C] selection:text-white md:p-6 lg:p-8">

        {/* Ambient Glow Lights */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pulse-glow absolute -top-36 left-1/4 h-[480px] w-[600px] rounded-full bg-[#5FB8F2]/30 blur-[130px]" />
          <div className="absolute top-1/3 -right-20 h-[480px] w-[480px] rounded-full bg-[#F38744]/30 blur-[140px]" />
          <div className="float-slow absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-[#F5A36C]/35 blur-[150px]" />
        </div>

        <div className="page-enter relative z-10 mx-auto max-w-[1500px] space-y-7">

          {/* ======================================================
              1. TOP HEADER BANNER
          ====================================================== */}
          <header className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-7 shadow-[0_20px_50px_rgba(23,56,84,0.22)] backdrop-blur-2xl md:px-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#F38744]/35 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-[-50px] left-1/3 h-52 w-52 rounded-full bg-[#7EC8F5]/25 blur-[60px]" />

            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="float-slow relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                  <BarChart3 size={28} strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-[#F38744]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Attendance Intelligence
                    </span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    Global Analytics
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Weighted attendance tracking and risk detection for all bootcamp cohorts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAttendanceStats}
                  disabled={loading}
                  className="smooth-transition flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/20"
                >
                  <RotateCcw size={16} className={`text-[#F38744] ${loading ? "animate-spin" : ""}`} />
                  <span>Sync Analytics</span>
                </button>
              </div>
            </div>
          </header>

          {/* ======================================================
              2. SUMMARY KPI STATS BAR
          ====================================================== */}
          <section className="grid gap-5 sm:grid-cols-3">
            <div className="smooth-transition flex items-center justify-between rounded-[26px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-5.5 shadow-[0_12px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Global Attendance Rate
                </p>
                <p className="mt-1 text-3xl font-black text-[#16344E]">
                  {summaryStats.avgRate}%
                </p>
                <p className="mt-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <TrendingUp size={13} /> Cohort Weighted Average
                </p>
              </div>
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#E0F0FA] text-[#173854]">
                <Activity size={24} />
              </div>
            </div>

            <div className="smooth-transition flex items-center justify-between rounded-[26px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-5.5 shadow-[0_12px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Monitored Students
                </p>
                <p className="mt-1 text-3xl font-black text-[#16344E]">
                  {summaryStats.totalStudents}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  Across all active cohorts
                </p>
              </div>
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#FDE2D2] text-[#E26D2C]">
                <Users size={24} />
              </div>
            </div>

            <div className="smooth-transition flex items-center justify-between rounded-[26px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-5.5 shadow-[0_12px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Sessions Conducted
                </p>
                <p className="mt-1 text-3xl font-black text-[#16344E]">
                  {summaryStats.totalSessions}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  Total attendance checkpoints
                </p>
              </div>
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#D5F2E3] text-[#0E9F6E]">
                <CalendarDays size={24} />
              </div>
            </div>
          </section>

          {/* ======================================================
              ERROR ALERT
          ====================================================== */}
          {error && (
            <div className="flex items-start gap-3.5 rounded-2xl border border-rose-300 bg-rose-100/90 p-4.5 text-sm text-rose-800 shadow-sm backdrop-blur-md">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
              <div className="flex-1">
                <p className="font-bold">Unable to load attendance statistics</p>
                <p className="mt-0.5 text-xs text-rose-700">{error}</p>
                <button
                  onClick={fetchAttendanceStats}
                  className="mt-2.5 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700"
                >
                  Retry Fetch
                </button>
              </div>
            </div>
          )}

          {/* ======================================================
              3. BATCH ATTENDANCE DIRECTORY (Creamy Glass Table)
          ====================================================== */}
          {loading ? (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-10 shadow-lg backdrop-blur-xl">
              <Loader2 size={32} className="animate-spin text-[#E26D2C]" />
              <p className="mt-4 text-sm font-bold text-[#16344E]">
                Computing batch statistics & rates...
              </p>
              <p className="mt-1 text-xs text-slate-500">Please wait a moment</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-[30px] border border-dashed border-[#DFCBB5] bg-[#FAF4EB]/90 p-10 text-center">
              <Users size={36} className="text-[#DE7E4A]" />
              <h3 className="mt-4 text-lg font-black text-[#16344E]">
                No batches found
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                There are currently no batches available to display attendance statistics.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
              {/* Table Top Header */}
              <div className="flex flex-col justify-between gap-4 border-b border-[#EBDCC8] px-6 py-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-black text-[#16344E]">
                    Batch Attendance Directory
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Comprehensive weighted metrics categorized by gender & total checks
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-[#DFCBB5] bg-[#F5ECE0] px-3.5 py-1 text-xs font-semibold text-slate-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  Live Sync Active
                </div>
              </div>

              {/* Table */}
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-275">
                  <thead>
                    <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95 text-left">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Batch Info
                      </th>
                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Status
                      </th>
                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Students
                      </th>
                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Sessions
                      </th>
                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Checks Done
                      </th>
                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Overall Rate
                      </th>
                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Female %
                      </th>
                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Male %
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {batches.map((batch, index) => {
                      const overallRate = Number(batch.overallAttendanceRate || 0);
                      const femaleRate = Number(batch.femaleAttendanceRate || 0);
                      const maleRate = Number(batch.maleAttendanceRate || 0);

                      return (
                        <tr
                          key={batch._id}
                          className="smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]"
                        >
                          {/* BATCH NAME */}
                          <td className="px-6 py-4.5">
                            <p className="text-sm font-black text-[#16344E]">
                              {batch.name}
                            </p>
                            <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                              Cohort tracking active
                            </p>
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-4.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                batch.status === "active"
                                  ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                                  : "border-slate-300 bg-slate-100 text-slate-600"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${batch.status === "active" ? "bg-emerald-600" : "bg-slate-400"}`} />
                              {batch.status || "Unknown"}
                            </span>
                          </td>

                          {/* STUDENTS */}
                          <td className="px-5 py-4.5 text-center text-sm font-black text-[#16344E]">
                            {Number(batch.totalStudents || 0)}
                          </td>

                          {/* SESSIONS */}
                          <td className="px-5 py-4.5 text-center text-sm font-black text-[#16344E]">
                            {Number(batch.totalSessions || 0)}
                          </td>

                          {/* CHECKS */}
                          <td className="px-5 py-4.5 text-center text-sm font-black text-[#16344E]">
                            {Number(batch.totalApplicableChecks || 0)}
                          </td>

                          {/* OVERALL RATE WITH PROGRESS INDICATOR */}
                          <td className="px-5 py-4.5 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`text-sm font-black ${
                                  overallRate >= 80
                                    ? "text-emerald-700"
                                    : overallRate >= 50
                                      ? "text-amber-700"
                                      : "text-rose-700"
                                }`}
                              >
                                {overallRate.toFixed(1)}%
                              </span>
                              <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-[#EBDCC8]">
                                <div
                                  className={`h-full rounded-full ${
                                    overallRate >= 80
                                      ? "bg-emerald-600"
                                      : overallRate >= 50
                                        ? "bg-amber-500"
                                        : "bg-rose-600"
                                  }`}
                                  style={{ width: `${Math.min(overallRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* FEMALE */}
                          <td className="px-5 py-4.5 text-center">
                            <span className="text-sm font-black text-rose-600">
                              {femaleRate.toFixed(1)}%
                            </span>
                          </td>

                          {/* MALE */}
                          <td className="px-5 py-4.5 text-center">
                            <span className="text-sm font-black text-blue-700">
                              {maleRate.toFixed(1)}%
                            </span>
                          </td>

                          {/* DETAILS BUTTON */}
                          <td className="px-6 py-4.5 text-right">
                            <button
                              onClick={() => handleViewReport(batch)}
                              className="smooth-transition inline-flex items-center gap-1.5 rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] px-3.5 py-2 text-xs font-bold text-[#E26D2C] shadow-sm hover:-translate-y-0.5 hover:border-[#E26D2C] hover:bg-[#FDE2D2]"
                            >
                              <span>View Intelligence</span>
                              <ArrowUpRight size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ============================================================
          DETAILED REPORT INTELLIGENCE MODAL (Creamy Glass)
      ============================================================ */}
      {selectedBatch && (
        <ReportModal
          batch={selectedBatch}
          report={report}
          loading={reportLoading}
          error={reportError}
          onClose={closeReport}
        />
      )}
    </>
  );
};

const ReportModal = ({ batch, report, loading, error, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#173854]/50 p-4 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-enter flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB] shadow-[0_30px_90px_rgba(23,56,84,0.3)]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-[#EBDCC8] bg-[#F5ECE0] px-6 py-5 sm:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                <FileText size={18} />
              </div>
              <h2 className="text-xl font-black text-[#16344E]">
                {batch.name} Attendance Intelligence
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Detailed weighted attendance & individual student risk tracking
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin text-[#E26D2C]" />
              <p className="mt-4 text-sm font-bold text-[#16344E]">
                Compiling cohort report...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <XCircle size={32} className="text-rose-600" />
              <h3 className="mt-3 font-black text-[#16344E]">
                Failed to load report
              </h3>
              <p className="mt-1 max-w-md text-xs text-slate-500">{error}</p>
            </div>
          ) : report ? (
            <FullReport report={report} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

const FullReport = ({ report }) => {
  const summary = report.summary || {};
  const students = report.students || [];

  return (
    <div className="space-y-6">
      {/* SUMMARY TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9]">
        <table className="w-full min-w-200 text-center">
          <thead>
            <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/70">
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-[#4E6173]">
                Students
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-[#4E6173]">
                Sessions
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-[#4E6173]">
                Checks Done
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                Present
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
                Late
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-rose-800">
                Absent
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-blue-800">
                Excused
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-[#E26D2C]">
                Avg Rate
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="divide-x divide-[#EBDCC8] font-black text-sm">
              <td className="px-4 py-3.5 text-[#16344E]">{summary.totalStudents ?? 0}</td>
              <td className="px-4 py-3.5 text-[#16344E]">{summary.totalSessions ?? 0}</td>
              <td className="px-4 py-3.5 text-[#16344E]">{summary.totalApplicableChecks ?? 0}</td>
              <td className="px-4 py-3.5 text-emerald-700">{summary.totalPresent ?? 0}</td>
              <td className="px-4 py-3.5 text-amber-700">{summary.totalLate ?? 0}</td>
              <td className="px-4 py-3.5 text-rose-700">{summary.totalAbsent ?? 0}</td>
              <td className="px-4 py-3.5 text-blue-700">{summary.totalExcused ?? 0}</td>
              <td className="px-4 py-3.5 text-[#E26D2C] text-base">
                {Number(summary.overallAttendanceRate || 0).toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* RISK STATUS LEGEND */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#EBDCC8] bg-[#F5ECE0]/60 p-3.5">
        <span className="text-xs font-black uppercase tracking-wide text-slate-600">
          Risk Thresholds:
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Normal (≥ 80%)
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Warning (50% - 79%)
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800">
          <span className="h-2 w-2 rounded-full bg-rose-500" /> At Risk (&lt; 50%)
        </span>
      </div>

      {/* STUDENT TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9]">
        <div className="hide-scrollbar overflow-x-auto">
          <table className="w-full min-w-212.5">
            <thead>
              <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95 text-left">
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-[#4E6173]">
                  Student
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-[#4E6173]">
                  Gender
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Present
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-amber-800">
                  Late
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-rose-800">
                  Absent
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-blue-800">
                  Excused
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-[#4E6173]">
                  Rate
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-[#4E6173]">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EBDCC8]">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    No attendance records found for this cohort.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <StudentReportRow
                    key={student._id || student.studentId}
                    student={student}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StudentReportRow = ({ student }) => {
  const attendance = Number(student.percentage ?? student.attendanceRate ?? 0);

  const getRiskStatus = (value) => {
    if (value < 50) return "At Risk";
    if (value < 80) return "Warning";
    return "Normal";
  };

  const riskStatus = getRiskStatus(attendance);

  const statusStyles = {
    Normal: {
      row: "bg-[#FFFDF9] hover:bg-emerald-50/60",
      border: "border-l-emerald-500",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    Warning: {
      row: "bg-[#FFFDF9] hover:bg-amber-50/60",
      border: "border-l-amber-500",
      badge: "bg-amber-100 text-amber-800 border-amber-300",
    },
    "At Risk": {
      row: "bg-[#FFFDF9] hover:bg-rose-50/60",
      border: "border-l-rose-500",
      badge: "bg-rose-100 text-rose-800 border-rose-300",
    },
  };

  const styles = statusStyles[riskStatus];

  return (
    <tr className={`border-l-4 smooth-transition ${styles.row} ${styles.border}`}>
      {/* STUDENT */}
      <td className="px-5 py-3.5">
        <p className="text-sm font-bold text-[#16344E]">
          {student.fullName ||
            `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
            "Unknown Student"}
        </p>
        {student.schoolId && (
          <p className="mt-0.5 text-[10px] font-medium text-slate-500">
            {student.schoolId}
          </p>
        )}
      </td>

      {/* GENDER */}
      <td className="px-5 py-3.5">
        <span className="text-[10px] font-bold uppercase text-slate-600">
          {student.gender || "-"}
        </span>
      </td>

      {/* PRESENT */}
      <td className="px-5 py-3.5 text-center font-black text-emerald-700">
        {student.presentChecks ?? 0}
      </td>

      {/* LATE */}
      <td className="px-5 py-3.5 text-center font-black text-amber-700">
        {student.lateChecks ?? 0}
      </td>

      {/* ABSENT */}
      <td className="px-5 py-3.5 text-center font-black text-rose-700">
        {student.absentChecks ?? 0}
      </td>

      {/* EXCUSED */}
      <td className="px-5 py-3.5 text-center font-black text-blue-700">
        {student.excusedChecks ?? 0}
      </td>

      {/* ATTENDANCE */}
      <td className="px-5 py-3.5 text-center font-black text-sm text-[#16344E]">
        {attendance.toFixed(1)}%
      </td>

      {/* STATUS BADGE */}
      <td className="px-5 py-3.5 text-center">
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${styles.badge}`}>
          {riskStatus}
        </span>
      </td>
    </tr>
  );
};

export default AdminAttendance;