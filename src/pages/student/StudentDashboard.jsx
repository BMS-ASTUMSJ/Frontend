import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  FileText,
  BarChart3,
  Megaphone,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Sparkles,
  User,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  CalendarDays,
  Activity,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../utils/api";

function StudentDashboard() {
  // ============================================================
  // STATE
  // ============================================================

  const [student, setStudent] = useState(null);

  const [risk, setRisk] = useState({
    attendanceIssues: 0,
    assignmentIssues: 0,
    totalIssues: 0,
    absenceCount: 0,
    missedAssignmentCount: 0,
    attendanceAtRisk: false,
    assignmentAtRisk: false,
    isAtRisk: false,
    reason: [],
    message: "Checking your current status...",
  });

  const [loading, setLoading] = useState(true);

  // ============================================================
  // FETCH STUDENT PROFILE + RISK STATUS
  // ============================================================

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);

        const profileResponse = await api.get("/users/profile");
        if (profileResponse.data.success) {
          setStudent(profileResponse.data.user);
        }

        const riskResponse = await api.get("/at-risk/my-status");
        if (riskResponse.data.success) {
          setRisk(riskResponse.data.risk);
        }
      } catch (error) {
        console.error("Error fetching student dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const studentName = student
    ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
    : "Student";

  const isAtRisk = risk.isAtRisk;
  const status = isAtRisk ? "Attention Req." : "On Track";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] to-[#F7C9A4]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-[#FAF4EB]/90 p-8 shadow-xl backdrop-blur-xl">
          <Zap className="h-9 w-9 animate-spin text-[#DE7E4A]" />
          <p className="text-sm font-bold text-[#173854]">
            Loading Student Workspace...
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

        {/* Ambient Moving Glow Lights */}
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
                  <User size={28} className="text-[#F38744]" strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-gradient-to-r from-[#F38744] to-[#7EC8F5]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Student Learning Dashboard
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight heading-gradient">
                    Welcome back, {studentName}
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Keep learning, complete your assignments, and track your milestone progress.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-4.5 py-3 text-white shadow-lg backdrop-blur-md">
                  <span className={`h-2.5 w-2.5 rounded-full ${isAtRisk ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                  <span className="text-xs font-bold">
                    Standing: {status}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ======================================================
              WARNING / ATTENTION NOTIFICATION BANNER
          ====================================================== */}
          {isAtRisk && (
            <div className="flex flex-col gap-4 rounded-[26px] border border-amber-300 bg-gradient-to-r from-[#FEF3C7]/90 via-[#FDE68A]/80 to-[#FEF3C7]/90 p-5 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-amber-400/50 bg-amber-200/80 p-3 text-amber-800 shadow-sm">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <p className="text-sm font-black text-amber-950">
                    Performance Notice: Attention Required
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-amber-900 leading-relaxed">
                    {risk.reason?.length > 0
                      ? `Issues detected: ${risk.reason.join(" and ")}. Please consult your mentor.`
                      : "Your recent attendance or assignment completion requires immediate attention."}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 self-start rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-white shadow sm:self-auto">
                <Clock3 size={14} />
                <span>Pending Review</span>
              </div>
            </div>
          )}

          {/* ======================================================
              2. TOP CIRCULAR STATISTIC PODS (Compact Radius)
          ====================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto">
            
            {/* CIRCULAR POD 1: ATTENDANCE ISSUES */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-[#1E6FA3] hover:shadow-[0_20px_45px_rgba(30,111,163,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-[#1E6FA3]/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E0F0FA] text-[#1E6FA3] shadow-sm mb-1">
                <ClipboardCheck size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {risk.attendanceIssues || 0}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Attendance Issues
              </span>

              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[8.5px] font-bold text-slate-600">
                Absences Logged
              </span>
            </div>

            {/* CIRCULAR POD 2: MISSED ASSIGNMENTS */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-amber-500 hover:shadow-[0_20px_45px_rgba(245,158,11,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-amber-400/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDE2D2] text-[#E26D2C] shadow-sm mb-1">
                <FileText size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {risk.assignmentIssues || 0}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Missed Tasks
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[8.5px] font-bold text-amber-800">
                Overdue
              </span>
            </div>

            {/* CIRCULAR POD 3: TOTAL ISSUES */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-rose-400 hover:shadow-[0_20px_45px_rgba(244,63,94,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-rose-400/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-sm mb-1">
                <BarChart3 size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {risk.totalIssues || 0}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Total Warnings
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[8.5px] font-bold text-rose-800">
                Action Items
              </span>
            </div>

            {/* CIRCULAR POD 4: STATUS STANDING */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_40px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-[#DE7E4A] hover:shadow-[0_20px_45px_rgba(222,126,74,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-[#DE7E4A]/35" />
              
              <div className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm mb-1 ${isAtRisk ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                {isAtRisk ? <Clock3 size={16} /> : <CheckCircle2 size={16} />}
              </div>

              <span className={`text-base sm:text-lg font-black tracking-tight leading-tight my-0.5 ${isAtRisk ? "text-amber-700" : "text-emerald-700"}`}>
                {status}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Cohort Status
              </span>

              <span className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-[8.5px] font-black ${isAtRisk ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                {isAtRisk ? "Reviewing" : "Verified Good"}
              </span>
            </div>

          </div>

          {/* ======================================================
              3. PERFORMANCE STATUS BREAKDOWN + ANNOUNCEMENT
          ====================================================== */}
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* PERFORMANCE STATUS DETAILS */}
            <div className="space-y-5 rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between border-b border-[#EBDCC8] pb-4">
                <div>
                  <h2 className="text-lg font-black text-[#16344E]">
                    Performance Health Matrix
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time diagnostics of your session attendance and deliverables
                  </p>
                </div>

                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${isAtRisk ? "border-amber-300 bg-amber-100 text-amber-800" : "border-emerald-300 bg-emerald-100 text-emerald-800"}`}>
                  {isAtRisk ? "Pending Status" : "Healthy Standing"}
                </span>
              </div>

              <div className="space-y-3.5">
                {/* ATTENDANCE ROW */}
                <div className="flex items-center justify-between rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4.5 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E0F0FA] text-[#1E6FA3]">
                      <ClipboardCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#16344E]">
                        Session Attendance Log
                      </p>
                      <p className="text-xs text-slate-500">
                        Total recorded absences across all lectures
                      </p>
                    </div>
                  </div>

                  <span className={`text-lg font-black ${risk.attendanceAtRisk ? "text-rose-600" : "text-[#16344E]"}`}>
                    {risk.attendanceIssues || 0} Absences
                  </span>
                </div>

                {/* ASSIGNMENTS ROW */}
                <div className="flex items-center justify-between rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4.5 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#16344E]">
                        Assignment Deliverables
                      </p>
                      <p className="text-xs text-slate-500">
                        Unsubmitted milestones past scheduled deadline
                      </p>
                    </div>
                  </div>

                  <span className={`text-lg font-black ${risk.assignmentAtRisk ? "text-rose-600" : "text-[#16344E]"}`}>
                    {risk.assignmentIssues || 0} Missed
                  </span>
                </div>
              </div>
            </div>

            {/* LATEST ANNOUNCEMENT CARD */}
            <div className="flex flex-col justify-between rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8">
              <div>
                <div className="flex items-center justify-between border-b border-[#EBDCC8] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                      <Megaphone size={18} />
                    </div>
                    <h2 className="text-lg font-black text-[#16344E]">
                      Cohort Announcements
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#E0F0FA] px-3 py-0.5 text-[10px] font-black uppercase text-[#173854]">
                    Broadcast Hub
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-5">
                  <div className="flex items-center gap-2 text-xs font-black text-[#E26D2C]">
                    <Sparkles size={14} />
                    <span>Important Bootcamp Broadcasts</span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-600 leading-relaxed">
                    Check the announcements portal regularly for project deadlines, weekly session updates, and contest invitations from mentors.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EBDCC8]">
                <Link
                  to="/student/announcements"
                  className="smooth-transition inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto"
                >
                  <span>View All Announcements</span>
                  <ArrowRight size={15} className="text-[#F38744]" />
                </Link>
              </div>
            </div>

          </div>

          {/* ======================================================
              4. KEEP LEARNING ROADMAP PILLARS
          ====================================================== */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-[#16344E]">
                Bootcamp Pillars of Excellence
              </h2>
              <p className="mt-0.5 text-xs text-slate-600">
                Core habits that guarantee your success and graduation readiness
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {/* PILLAR 1 */}
              <div className="smooth-transition group flex flex-col justify-between rounded-[26px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_12px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(23,56,84,0.14)]">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E0F0FA] text-[#1E6FA3] shadow-sm mb-4">
                    <CalendarDays size={22} />
                  </div>
                  <h3 className="text-base font-black text-[#16344E] group-hover:text-[#E26D2C] transition-colors">
                    Active Session Attendance
                  </h3>
                  <p className="mt-2 text-xs font-medium text-slate-600 leading-relaxed">
                    Attend scheduled live workshops and mentorship check-ins regularly to maintain good standing and solve blockers.
                  </p>
                </div>
                <div className="mt-5 border-t border-[#EBDCC8] pt-3 text-[11px] font-bold text-[#1E6FA3]">
                  ● Weekly Live Sessions
                </div>
              </div>

              {/* PILLAR 2 */}
              <div className="smooth-transition group flex flex-col justify-between rounded-[26px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_12px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(23,56,84,0.14)]">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FDE2D2] text-[#E26D2C] shadow-sm mb-4">
                    <BookOpen size={22} />
                  </div>
                  <h3 className="text-base font-black text-[#16344E] group-hover:text-[#E26D2C] transition-colors">
                    Timely Deliverables
                  </h3>
                  <p className="mt-2 text-xs font-medium text-slate-600 leading-relaxed">
                    Build end-to-end full stack projects and solve algorithmic problem sets before deadlines to receive mentor reviews.
                  </p>
                </div>
                <div className="mt-5 border-t border-[#EBDCC8] pt-3 text-[11px] font-bold text-[#E26D2C]">
                  ● Weekly Milestone Sprints
                </div>
              </div>

              {/* PILLAR 3 */}
              <div className="smooth-transition group flex flex-col justify-between rounded-[26px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_12px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(23,56,84,0.14)]">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D5F2E3] text-[#0E9F6E] shadow-sm mb-4">
                    <Flame size={22} />
                  </div>
                  <h3 className="text-base font-black text-[#16344E] group-hover:text-[#0E9F6E] transition-colors">
                    Continuous Consistency
                  </h3>
                  <p className="mt-2 text-xs font-medium text-slate-600 leading-relaxed">
                    Engage with your co-students, compete in weekly CP challenges, and cultivate professional software engineering habits.
                  </p>
                </div>
                <div className="mt-5 border-t border-[#EBDCC8] pt-3 text-[11px] font-bold text-emerald-700">
                  ● Engineering Growth
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default StudentDashboard;