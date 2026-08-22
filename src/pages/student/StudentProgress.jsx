import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  ExternalLink,
  Loader2,
  Monitor,
  Send,
  TrendingUp,
  X,
  Sparkles,
  Zap,
  Check,
  RotateCcw,
  BookOpen,
  Calendar,
  Layers,
  Clock,
  Flame,
  Award,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function StudentProgress() {
  const [dashboard, setDashboard] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [selectedCpContent, setSelectedCpContent] = useState(null);
  const [submittingCp, setSubmittingCp] = useState(false);

  const [devStatuses, setDevStatuses] = useState({});

  const [cpForm, setCpForm] = useState({
    submissionLink: "",
    attempts: 1,
    timeSpent: 30,
  });

  // ============================================================
  // LOAD PROGRESS DATA
  // ============================================================

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardResponse, progressResponse] = await Promise.allSettled([
        api.get("/progress/student/dashboard"),
        api.get("/progress/student/progress"),
      ]);

      if (dashboardResponse.status === "fulfilled") {
        setDashboard(
          dashboardResponse.value.data?.data ||
            dashboardResponse.value.data ||
            {}
        );
      }

      if (progressResponse.status === "fulfilled") {
        const data =
          progressResponse.value.data?.data ||
          progressResponse.value.data ||
          [];

        const list = Array.isArray(data) ? data : [];
        setProgressList(list);

        const statuses = {};
        list.forEach((item) => {
          const content = item?.content || item;
          if (content?.type === "dev") {
            const contentId = content?._id;
            if (contentId) {
              statuses[contentId] = item?.progress?.status || "not_started";
            }
          }
        });

        setDevStatuses(statuses);
      } else {
        setError(
          progressResponse.reason?.response?.data?.message ||
            "Failed to load your learning content."
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load your learning progress."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgressData();
  }, []);

  // ============================================================
  // UPDATE PROGRESS
  // ============================================================

  const updateProgress = async (contentId, data) => {
    try {
      setUpdatingId(contentId);
      setError("");
      setSuccess("");

      await api.patch(`/progress/student/progress/${contentId}`, data);
      setSuccess("Milestone updated successfully.");
      toast.success("Progress saved!");
      await loadProgressData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update progress.");
      toast.error(err?.response?.data?.message || "Failed to update progress.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ============================================================
  // UPDATE DEV STATUS
  // ============================================================

  const handleDevStatusUpdate = async (contentId) => {
    const selectedStatus = devStatuses[contentId];

    if (!selectedStatus || selectedStatus === "not_started") {
      setError("Please select a progress status.");
      toast.error("Please choose a valid status.");
      return;
    }

    await updateProgress(contentId, {
      status: selectedStatus,
      ...(selectedStatus === "done" ? { watched: true } : {}),
    });
  };

  // ============================================================
  // CP SUBMISSION
  // ============================================================

  const submitCpSolution = async (event) => {
    event.preventDefault();

    if (!selectedCpContent) return;

    if (!cpForm.submissionLink.trim()) {
      setError("Please enter your GitHub, LeetCode, or Codeforces link.");
      toast.error("Solution link is required.");
      return;
    }

    try {
      setSubmittingCp(true);
      setError("");
      setSuccess("");

      await api.patch(`/progress/student/progress/${selectedCpContent._id}`, {
        submissionLink: cpForm.submissionLink.trim(),
        attempts: Number(cpForm.attempts) || 1,
        timeSpent: Number(cpForm.timeSpent) || 0,
        status: "done",
      });

      setSuccess("Solution submitted successfully.");
      toast.success("CP solution submitted successfully!");
      setSelectedCpContent(null);

      setCpForm({
        submissionLink: "",
        attempts: 1,
        timeSpent: 30,
      });

      await loadProgressData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit solution.");
      toast.error(err?.response?.data?.message || "Failed to submit solution.");
    } finally {
      setSubmittingCp(false);
    }
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredList = progressList.filter((item) => {
    const content = item?.content || item;
    const typeMatches =
      selectedType === "all" || content?.type === selectedType;
    const weekMatches =
      selectedWeek === "all" || String(content?.week) === String(selectedWeek);

    return typeMatches && weekMatches;
  });

  // ============================================================
  // STATS
  // ============================================================

  const cpStats = dashboard?.cp || { total: 0, completed: 0, completion: 0 };
  const devStats = dashboard?.dev || { total: 0, completed: 0, completion: 0 };
  const totalItems = cpStats.total + devStats.total;
  const totalCompleted = cpStats.completed + devStats.completed;

  const completion =
    dashboard?.overall?.completion ||
    (totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0);

  const uniqueWeeks = Array.from(
    new Set(
      progressList
        .map((item) => item?.content?.week || item?.week)
        .filter(Boolean)
    )
  ).sort((a, b) => a - b);

  const statusLabel = {
    not_started: "Not Started",
    in_progress: "In Progress",
    needs_help: "Needs Help",
    done: "Completed",
  };

  const statusColor = {
    not_started: "bg-slate-100 text-slate-700 border-slate-300",
    in_progress: "bg-amber-100/90 text-amber-800 border-amber-300",
    needs_help: "bg-rose-100/90 text-rose-800 border-rose-300",
    done: "bg-emerald-100/90 text-emerald-800 border-emerald-300",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] to-[#F7C9A4]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-[#FAF4EB]/90 p-8 shadow-xl backdrop-blur-xl">
          <Loader2 className="h-9 w-9 animate-spin text-[#DE7E4A]" />
          <p className="text-sm font-bold text-[#173854]">
            Loading Your Learning Milestones...
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
                  <TrendingUp size={28} className="text-[#F38744]" strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-gradient-to-r from-[#F38744] to-[#7EC8F5]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Progress Dashboard
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight heading-gradient">
                    My Learning Progress & Milestones
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Submit algorithm solutions, update lecture completion, and inspect mentor feedback.
                  </p>
                </div>
              </div>

              {dashboard?.student && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4.5 py-3 text-white shadow-lg backdrop-blur-md">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DE7E4A] text-xs font-black">
                    {dashboard.student.name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <p className="text-xs font-black">{dashboard.student.name}</p>
                    <p className="text-[10px] text-[#FCD8BF] capitalize">{dashboard.student.gender} Student</p>
                  </div>
                </div>
              )}
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

          {success && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-100/90 px-5 py-4 text-sm font-bold text-emerald-800 shadow-sm backdrop-blur-md">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* ======================================================
              2. TOP CIRCULAR STATISTIC PODS (Compact Radius)
          ====================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto">
            
            {/* CIRCULAR POD 1: OVERALL COMPLETION */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-[#1E6FA3] hover:shadow-[0_20px_45px_rgba(30,111,163,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-[#1E6FA3]/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E0F0FA] text-[#1E6FA3] shadow-sm mb-1">
                <TrendingUp size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {completion}%
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Overall Rate
              </span>

              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[8.5px] font-black text-emerald-800">
                Active Velocity
              </span>
            </div>

            {/* CIRCULAR POD 2: CP PROGRESS */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-[#1E6FA3] hover:shadow-[0_20px_45px_rgba(30,111,163,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-blue-400/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E0F0FA] text-[#1E6FA3] shadow-sm mb-1">
                <Code2 size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {cpStats.completed} <span className="text-sm font-normal text-slate-400">/{cpStats.total}</span>
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                CP Problems
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-blue-100/80 px-2 py-0.5 text-[8.5px] font-black text-blue-800">
                {cpStats.completion || 0}% Cleared
              </span>
            </div>

            {/* CIRCULAR POD 3: DEV PROGRESS */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-[#E26D2C] hover:shadow-[0_20px_45px_rgba(226,109,44,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-[#DE7E4A]/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDE2D2] text-[#E26D2C] shadow-sm mb-1">
                <Monitor size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {devStats.completed} <span className="text-sm font-normal text-slate-400">/{devStats.total}</span>
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Dev Lectures
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-amber-100/80 px-2 py-0.5 text-[8.5px] font-black text-amber-800">
                {devStats.completion || 0}% Watched
              </span>
            </div>

            {/* CIRCULAR POD 4: TOTAL TASKS */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_40px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-emerald-500 hover:shadow-[0_20px_45px_rgba(16,185,129,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-emerald-400/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm mb-1">
                <CheckCircle2 size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {totalCompleted} <span className="text-sm font-normal text-slate-400">/{totalItems}</span>
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Total Tasks Done
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-emerald-100/80 px-2 py-0.5 text-[8.5px] font-black text-emerald-800">
                Combined Total
              </span>
            </div>

          </div>

          {/* ======================================================
              3. LEARNING TASKS WORKSHOP (Creamy Glass Card)
          ====================================================== */}
          <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8">
            
            {/* Control Filters Header */}
            <div className="mb-6 flex flex-col gap-4 border-b border-[#EBDCC8] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#16344E]">
                  Curriculum Learning Tasks
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Submit problem solution links and manage dev lecture video milestones
                </p>
              </div>

              {/* FILTER PILLS */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/80 p-1">
                  {["all", "cp", "dev"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`smooth-transition rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider ${
                        selectedType === type
                          ? "bg-[#173854] text-white shadow-sm"
                          : "text-[#16344E] hover:bg-[#FFFDF9]"
                      }`}
                    >
                      {type === "all" ? "All Tasks" : type === "cp" ? "CP" : "Dev"}
                    </button>
                  ))}
                </div>

                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="h-10 rounded-2xl border border-[#DFCBB5] bg-[#FFFDF9] px-3.5 text-xs font-bold text-[#16344E] outline-none focus:border-[#E26D2C]"
                >
                  <option value="all">All Weeks</option>
                  {uniqueWeeks.map((w) => (
                    <option key={w} value={w}>
                      Week {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TASKS LIST */}
            {filteredList.length === 0 ? (
              <div className="p-12 text-center text-xs font-semibold text-slate-500">
                No learning tasks match your selected filter criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredList.map((item, index) => {
                  const content = item?.content || item;
                  const prog = item?.progress || {};
                  const contentId = content?._id || index;
                  const isCp = content?.type === "cp";
                  const taskStatus = prog.status || "not_started";
                  const isTaskUpdating = updatingId === contentId;

                  return (
                    <div
                      key={contentId}
                      className="smooth-transition rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#DE7E4A]/50 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        
                        {/* TASK INFORMATION */}
                        <div className="flex-1 min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                isCp
                                  ? "bg-[#E0F0FA] text-[#1E6FA3]"
                                  : "bg-[#FDE2D2] text-[#E26D2C]"
                              }`}
                            >
                              {isCp ? "CP Challenge" : "Dev Lecture"}
                            </span>

                            <span className="rounded-lg border border-[#EBDCC8] bg-[#F5ECE0] px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                              {content.topic}
                            </span>

                            <span className="rounded-lg border border-[#EBDCC8] bg-[#F5ECE0] px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                              Week {content.week}
                            </span>

                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                statusColor[taskStatus] || statusColor.not_started
                              }`}
                            >
                              {statusLabel[taskStatus] || "Not Started"}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-[#16344E]">
                            {content.title}
                          </h3>

                          {content.link && (
                            <a
                              href={content.link?.startsWith("http") ? content.link : `https://${content.link}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#1E6FA3] hover:underline"
                            >
                              <span>{isCp ? "Solve problem on platform" : "Watch video lecture"}</span>
                              <ExternalLink size={12} />
                            </a>
                          )}

                          {prog.submissionLink && (
                            <div className="mt-2.5 flex items-center gap-3">
                              <a
                                href={prog.submissionLink?.startsWith("http") ? prog.submissionLink : `https://${prog.submissionLink}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                              >
                                <CheckCircle2 size={13} /> View Submitted Solution
                              </a>
                              <span className="text-[11px] font-semibold text-slate-400">
                                • {prog.attempts || 1} attempt(s) • {prog.timeSpent || 0} mins spent
                              </span>
                            </div>
                          )}

                          {prog.mentorNote && (
                            <div className="mt-2 rounded-xl border border-blue-200 bg-[#E0F0FA]/70 p-2.5 text-xs font-medium text-[#173854]">
                              <strong>Mentor Feedback:</strong> {prog.mentorNote}
                            </div>
                          )}
                        </div>

                        {/* ACTION AREA (CP vs DEV) */}
                        <div className="shrink-0">
                          {isCp ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCpContent(content);
                                setCpForm({
                                  submissionLink: prog.submissionLink || "",
                                  attempts: prog.attempts || 1,
                                  timeSpent: prog.timeSpent || 30,
                                });
                              }}
                              className="smooth-transition inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#173854] to-[#224A6D] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                            >
                              <Send size={13} className="text-[#F38744]" />
                              <span>{prog.submissionLink ? "Update Solution" : "Submit Solution"}</span>
                            </button>
                          ) : (
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                              <select
                                value={devStatuses[contentId] || taskStatus}
                                onChange={(e) =>
                                  setDevStatuses((prev) => ({
                                    ...prev,
                                    [contentId]: e.target.value,
                                  }))
                                }
                                disabled={isTaskUpdating}
                                className="h-10 rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-3.5 text-xs font-bold text-[#16344E] outline-none focus:border-[#E26D2C]"
                              >
                                <option value="not_started">Not Started</option>
                                <option value="in_progress">In Progress</option>
                                <option value="needs_help">Needs Help</option>
                                <option value="done">Completed (Done)</option>
                              </select>

                              <button
                                type="button"
                                disabled={isTaskUpdating}
                                onClick={() => handleDevStatusUpdate(contentId)}
                                className="smooth-transition inline-flex items-center gap-1.5 rounded-xl bg-[#173854] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1e486d] disabled:opacity-50"
                              >
                                {isTaskUpdating && <Loader2 size={13} className="animate-spin" />}
                                <span>{isTaskUpdating ? "Updating..." : "Save Status"}</span>
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ========================================================
          CP SUBMISSION MODAL (Creamy Glass)
      ======================================================== */}
      {selectedCpContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#173854]/50 p-4 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedCpContent(null);
          }}
        >
          <div className="modal-enter w-full max-w-lg overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB] shadow-[0_30px_90px_rgba(23,56,84,0.3)]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBDCC8] bg-[#F5ECE0] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E0F0FA] text-[#1E6FA3]">
                  <Code2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#16344E]">
                    Submit CP Solution
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[280px]">
                    {selectedCpContent.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCpContent(null)}
                className="rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={submitCpSolution} className="p-6 sm:p-7 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                  Solution / GitHub / LeetCode Link <span className="text-[#E26D2C]">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={cpForm.submissionLink}
                  onChange={(e) =>
                    setCpForm({
                      ...cpForm,
                      submissionLink: e.target.value,
                    })
                  }
                  placeholder="https://github.com/... or LeetCode submission URL"
                  className="h-11 w-full rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-3.5 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                    Number of Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cpForm.attempts}
                    onChange={(e) =>
                      setCpForm({
                        ...cpForm,
                        attempts: e.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-3.5 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                    Time Spent (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cpForm.timeSpent}
                    onChange={(e) =>
                      setCpForm({
                        ...cpForm,
                        timeSpent: e.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-3.5 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#EBDCC8] pt-5 mt-5">
                <button
                  type="button"
                  onClick={() => setSelectedCpContent(null)}
                  className="rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#E5D7C4]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingCp}
                  className="smooth-transition inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DE7E4A] via-[#E26D2C] to-[#BA6137] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                >
                  {submittingCp && <Loader2 size={14} className="animate-spin" />}
                  <span>{submittingCp ? "Saving..." : "Save & Complete"}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

export default StudentProgress;