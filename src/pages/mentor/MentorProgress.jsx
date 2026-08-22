import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Code2,
  Monitor,
  Loader2,
  Sparkles,
  Users,
  Flame,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Zap,
  Activity,
} from "lucide-react";

import api from "../../utils/api";

const MentorProgress = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD MENTOR PROGRESS
  // ============================================================

  useEffect(() => {
    loadMentorProgress();
  }, []);

  const loadMentorProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/progress/mentor/progress");

      const data = response?.data;
      let progressData = [];

      if (Array.isArray(data)) {
        progressData = data;
      } else if (Array.isArray(data?.data)) {
        progressData = data.data;
      } else if (Array.isArray(data?.students)) {
        progressData = data.students;
      } else if (Array.isArray(data?.progress)) {
        progressData = data.progress;
      }

      setProgress(progressData);
    } catch (err) {
      console.error("Failed to load mentor progress:", err);
      setError(
        err?.response?.data?.message || "Failed to load mentor progress."
      );
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getCpCompleted = (student) => {
    return Number(student?.cp?.completed ?? student?.completed ?? 0);
  };

  const getCpTotal = (student) => {
    return Number(student?.cp?.total ?? student?.total ?? 0);
  };

  const getCpCompletion = (student) => {
    const completion = student?.cp?.completion ?? student?.completion;

    if (completion !== undefined && completion !== null) {
      return Math.min(Math.max(Number(completion), 0), 100);
    }

    const completed = getCpCompleted(student);
    const total = getCpTotal(student);

    if (total > 0) {
      return Math.min(Math.round((completed / total) * 100), 100);
    }

    return 0;
  };

  const getDevCompleted = (student) => {
    return Number(student?.dev?.completed ?? 0);
  };

  const getDevTotal = (student) => {
    return Number(student?.dev?.total ?? 0);
  };

  const getDevCompletion = (student) => {
    const completion = student?.dev?.completion;

    if (completion !== undefined && completion !== null) {
      return Math.min(Math.max(Number(completion), 0), 100);
    }

    const completed = getDevCompleted(student);
    const total = getDevTotal(student);

    if (total > 0) {
      return Math.min(Math.round((completed / total) * 100), 100);
    }

    return 0;
  };

  const getOverallCompletion = (student) => {
    const cpCompletion = getCpCompletion(student);
    const devCompletion = getDevCompletion(student);
    const cpTotal = getCpTotal(student);
    const devTotal = getDevTotal(student);

    if (cpTotal > 0 && devTotal > 0) {
      return Math.round((cpCompletion + devCompletion) / 2);
    }
    if (cpTotal > 0) return cpCompletion;
    if (devTotal > 0) return devCompletion;

    return 0;
  };

  const getStudentName = (student) => {
    return (
      student?.student?.name ||
      student?.student?.fullName ||
      `${student?.student?.firstName || ""} ${
        student?.student?.lastName || ""
      }`.trim() ||
      student?.name ||
      student?.fullName ||
      `${student?.firstName || ""} ${student?.lastName || ""}`.trim() ||
      "Student"
    );
  };

  const getStudentEmail = (student) => {
    return student?.student?.email || student?.email || "";
  };

  // ============================================================
  // STATISTICS
  // ============================================================

  const completed = progress.filter(
    (student) => getOverallCompletion(student) >= 100
  ).length;

  const inProgress = progress.filter((student) => {
    const percentage = getOverallCompletion(student);
    return percentage > 0 && percentage < 100;
  }).length;

  const needHelp = progress.filter((student) => {
    const status =
      student?.status || student?.progressStatus || student?.overallStatus;
    return status === "need_help" || status === "needs_help";
  }).length;

  // ============================================================
  // TOTALS
  // ============================================================

  const totalCpCompleted = progress.reduce(
    (total, student) => total + getCpCompleted(student),
    0
  );

  const totalCpExpected = progress.reduce(
    (total, student) => total + getCpTotal(student),
    0
  );

  const totalDevCompleted = progress.reduce(
    (total, student) => total + getDevCompleted(student),
    0
  );

  const totalDevExpected = progress.reduce(
    (total, student) => total + getDevTotal(student),
    0
  );

  const overallPercentage =
    totalCpExpected + totalDevExpected > 0
      ? Math.min(
          Math.round(
            ((totalCpCompleted + totalDevCompleted) /
              (totalCpExpected + totalDevExpected)) *
              100
          ),
          100
        )
      : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] to-[#F7C9A4]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-[#FAF4EB]/90 p-8 shadow-xl backdrop-blur-xl">
          <Loader2 className="h-9 w-9 animate-spin text-[#DE7E4A]" />
          <p className="text-sm font-bold text-[#173854]">
            Calibrating Student Milestones...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
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
        @keyframes rotateOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .page-enter { animation: pageEnter 0.6s cubic-bezier(.2,.8,.2,1) both; }
        .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        .float-slow { animation: floatSlow 5s ease-in-out infinite; }
        .rotate-orbit { animation: rotateOrbit 16s linear infinite; }
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
                  <BarChart3 size={28} className="text-[#F38744]" strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-gradient-to-r from-[#F38744] to-[#7EC8F5]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Student Progress Tracking
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight heading-gradient">
                    Students Progress & Milestones
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Monitor CP algorithms, full-stack dev challenges, and milestone velocity for your assigned team.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadMentorProgress}
                  disabled={loading}
                  className="smooth-transition flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-50"
                >
                  <RotateCcw size={16} className={`text-[#F38744] ${loading ? "animate-spin" : ""}`} />
                  <span>Sync Milestones</span>
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
              <p className="font-bold">{error}</p>
            </div>
          )}

          {/* ======================================================
              2. TOP CIRCULAR STATISTIC PODS
          ====================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto">
            
            {/* CIRCULAR POD 1: COMPLETED (100%) */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-emerald-500 hover:shadow-[0_20px_45px_rgba(16,185,129,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-emerald-400/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm mb-1">
                <CheckCircle size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {completed}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Completed
              </span>

              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[8.5px] font-black text-emerald-800">
                100% Progress
              </span>
            </div>

            {/* CIRCULAR POD 2: IN PROGRESS */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-amber-500 hover:shadow-[0_20px_45px_rgba(245,158,11,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-amber-400/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-sm mb-1">
                <Clock size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {inProgress}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                In Progress
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-amber-100/80 px-2 py-0.5 text-[8.5px] font-black text-amber-800">
                Currently Learning
              </span>
            </div>

            {/* CIRCULAR POD 3: NEED HELP */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-rose-500 hover:shadow-[0_20px_45px_rgba(244,63,94,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-rose-400/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-sm mb-1">
                <AlertCircle size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {needHelp}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Need Help
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-rose-100/80 px-2 py-0.5 text-[8.5px] font-black text-rose-800">
                Support Required
              </span>
            </div>

            {/* CIRCULAR POD 4: OVERALL COMPLETION */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-[#DE7E4A] hover:shadow-[0_20px_45px_rgba(222,126,74,0.22)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-[#DE7E4A]/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDE2D2] text-[#DE7E4A] shadow-sm mb-1">
                <TrendingUp size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {overallPercentage}%
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Overall Rate
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-[#FDE2D2] px-2 py-0.5 text-[8.5px] font-black text-[#DE7E4A]">
                Combined CP + Dev
              </span>
            </div>

          </div>

          {/* ======================================================
              3. OVERALL SUMMARY PROGRESS CARD
          ====================================================== */}
          <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EBDCC8] pb-5">
              <div>
                <h2 className="text-xl font-black text-[#16344E]">
                  Cohort Overall Learning Progress
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Combined CP problem sets and Full-Stack development lecture completion
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-[#E26D2C]">
                  {overallPercentage}%
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Milestone Completion
                </p>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#EBDCC8]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#DE7E4A] via-[#E26D2C] to-[#1E6FA3] transition-all duration-700"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>

            {/* METRICS PILLS */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/80 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#E0F0FA] text-[#1E6FA3]">
                    <Code2 size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">CP Solved</span>
                </div>
                <p className="mt-2 text-base font-black text-[#16344E]">
                  {totalCpCompleted} <span className="text-xs text-slate-400 font-normal">/ {totalCpExpected}</span>
                </p>
              </div>

              <div className="rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/80 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                    <Monitor size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Dev Lectures</span>
                </div>
                <p className="mt-2 text-base font-black text-[#16344E]">
                  {totalDevCompleted} <span className="text-xs text-slate-400 font-normal">/ {totalDevExpected}</span>
                </p>
              </div>

              <div className="rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/80 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-[#173854]">
                    <Users size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Assigned Roster</span>
                </div>
                <p className="mt-2 text-base font-black text-[#16344E]">
                  {progress.length} Students
                </p>
              </div>

              <div className="rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/80 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Graduated (100%)</span>
                </div>
                <p className="mt-2 text-base font-black text-emerald-700">
                  {completed} Completed
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================
              4. ASSIGNED STUDENTS DETAILED TABLE
          ====================================================== */}
          <section className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
            <div className="border-b border-[#EBDCC8] p-6">
              <h2 className="text-xl font-black text-[#16344E]">
                Assigned Students Progress Matrix
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Detailed real-time task completion breakdown per assigned student
              </p>
            </div>

            {progress.length === 0 ? (
              <div className="p-12 text-center text-xs font-semibold text-slate-500">
                No student progress records found for your assigned team yet.
              </div>
            ) : (
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Student
                      </th>
                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#1E6FA3]">
                        CP Challenge
                      </th>
                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#E26D2C]">
                        Development
                      </th>
                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Overall Status
                      </th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Milestone
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {progress.map((student, index) => {
                      const studentName = getStudentName(student);
                      const email = getStudentEmail(student);
                      const cpCompleted = getCpCompleted(student);
                      const cpTotal = getCpTotal(student);
                      const cpCompletion = getCpCompletion(student);
                      const devCompleted = getDevCompleted(student);
                      const devTotal = getDevTotal(student);
                      const devCompletion = getDevCompletion(student);
                      const overall = getOverallCompletion(student);
                      const status =
                        student?.status ||
                        student?.progressStatus ||
                        student?.overallStatus;

                      const initials = studentName
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr
                          key={student?._id || student?.student?._id || index}
                          className="smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]"
                        >
                          {/* STUDENT INFO */}
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0F0FA] to-[#D0E6F7] text-xs font-black text-[#173854]">
                                {initials || "S"}
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#16344E]">
                                  {studentName}
                                </p>
                                {email && (
                                  <p className="text-[11px] font-medium text-slate-500">
                                    {email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* CP PROGRESS */}
                          <td className="px-5 py-4.5">
                            <div className="mx-auto w-36">
                              <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-500">{cpCompleted}/{cpTotal}</span>
                                <span className="text-[#1E6FA3]">{cpCompletion}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-[#EBDCC8]">
                                <div
                                  className="h-full rounded-full bg-[#1E6FA3] transition-all duration-500"
                                  style={{ width: `${cpCompletion}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* DEV PROGRESS */}
                          <td className="px-5 py-4.5">
                            <div className="mx-auto w-36">
                              <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-500">{devCompleted}/{devTotal}</span>
                                <span className="text-[#E26D2C]">{devCompletion}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-[#EBDCC8]">
                                <div
                                  className="h-full rounded-full bg-[#E26D2C] transition-all duration-500"
                                  style={{ width: `${devCompletion}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* OVERALL PERCENTAGE */}
                          <td className="px-5 py-4.5 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-sm font-black text-[#16344E]">
                                {overall}%
                              </span>
                              <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-[#EBDCC8]">
                                <div
                                  className={`h-full rounded-full ${
                                    overall >= 80
                                      ? "bg-emerald-600"
                                      : overall >= 50
                                      ? "bg-amber-500"
                                      : "bg-[#DE7E4A]"
                                  }`}
                                  style={{ width: `${overall}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* STATUS BADGE */}
                          <td className="px-6 py-4.5 text-center">
                            {overall >= 100 ? (
                              <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                                Completed
                              </span>
                            ) : status === "need_help" || status === "needs_help" ? (
                              <span className="inline-flex rounded-full border border-rose-300 bg-rose-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-rose-800">
                                Need Help
                              </span>
                            ) : overall > 0 ? (
                              <span className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800">
                                In Progress
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
                                Not Started
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-[#EBDCC8] bg-[#F5ECE0]/60 px-6 py-3.5 text-xs font-semibold text-slate-600">
              💡 CP metrics represent solved algorithmic problems; Development tracks watched architectural video modules.
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default MentorProgress;