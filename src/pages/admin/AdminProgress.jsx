import { useState, useEffect } from "react";
import api from "../../utils/api";
import toast, { Toaster } from "react-hot-toast";
import {
  Users,
  Shield,
  Code2,
  Monitor,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Trophy,
  Copy,
  Check,
  Flame,
  Zap,
} from "lucide-react";

function AdminProgress() {
  // ============================================================
  // DATA
  // ============================================================

  const [statsData, setStatsData] = useState(null);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LEADERBOARD
  // ============================================================

  const [performerTab, setPerformerTab] = useState("cp");

  // ============================================================
  // CP FORM
  // ============================================================

  const [cpWeek, setCpWeek] = useState(1);
  const [cpTitle, setCpTitle] = useState("");
  const [cpLink, setCpLink] = useState("");
  const [cpDifficulty, setCpDifficulty] = useState("Medium");
  const [cpTopic, setCpTopic] = useState("JavaScript");
  const [publishingCp, setPublishingCp] = useState(false);

  // ============================================================
  // DEV FORM
  // ============================================================

  const [devWeek, setDevWeek] = useState(1);
  const [devTitle, setDevTitle] = useState("");
  const [devLink, setDevLink] = useState("");
  const [devDuration, setDevDuration] = useState("45 mins");
  const [devTopic, setDevTopic] = useState("React");
  const [publishingDev, setPublishingDev] = useState(false);

  // ============================================================
  // UI
  // ============================================================

  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ============================================================
  // TOPICS
  // ============================================================

  const TOPICS = [
    "HTML / CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Git / GitHub",
  ];

  // ============================================================
  // GET CURRENT BATCH
  // ============================================================

  const fetchCurrentBatch = async () => {
    try {
      const res = await api.get("/batches/dashboard-stats");

      const currentBatch =
        res.data?.currentBatch?.batch || res.data?.currentBatch || null;

      if (!currentBatch?._id) {
        setCurrentBatch(null);
        throw new Error(
          "No current batch available. Please activate a batch first."
        );
      }

      setCurrentBatch(currentBatch);
      return currentBatch;
    } catch (err) {
      console.error("Current batch error:", err);
      setCurrentBatch(null);
      throw new Error(
        err?.response?.data?.message ||
          err?.message ||
          "No current batch available. Please activate a batch first."
      );
    }
  };

  // ============================================================
  // LOAD PROGRESS DATA
  // ============================================================

  const loadProgressData = async () => {
    try {
      setError("");

      const batch = await fetchCurrentBatch();
      const batchId = batch._id;

      const [statsRes, progRes, contentRes] = await Promise.allSettled([
        api.get("/batches/dashboard-stats"),
        api.get("/progress/students/progress", {
          params: { batchId },
        }),
        api.get("/progress/content", {
          params: { batchId },
        }),
      ]);

      if (statsRes.status === "fulfilled") {
        setStatsData(statsRes.value.data || {});
      } else {
        console.error("Batch statistics error:", statsRes.reason);
        setStatsData(null);
      }

      if (progRes.status === "fulfilled") {
        const progData = progRes.value.data?.data || progRes.value.data || [];
        setStudentsProgress(Array.isArray(progData) ? progData : []);
      } else {
        console.error("Student progress error:", progRes.reason);
        setStudentsProgress([]);
      }

      if (contentRes.status === "fulfilled") {
        const contentData =
          contentRes.value.data?.data || contentRes.value.data || [];
        setContentList(Array.isArray(contentData) ? contentData : []);
      } else {
        console.error("Progress content error:", contentRes.reason);
        setContentList([]);
      }
    } catch (err) {
      console.error("Load progress data error:", err);
      setError(err?.message || "Failed to load current batch progress.");
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialLoad = async () => {
      try {
        setLoading(true);
        setError("");
        await loadProgressData();
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialLoad();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // COPY LINK
  // ============================================================

  const handleCopyLink = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Link copied!");

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error("Copy error:", err);
      toast.error("Failed to copy link.");
    }
  };

  // ============================================================
  // PUBLISH CP
  // ============================================================

  const handlePublishCp = async (e) => {
    e.preventDefault();

    if (!currentBatch?._id) {
      setError("No current batch is available. Please activate a batch first.");
      return;
    }
    if (!cpTitle.trim()) {
      setError("Please provide a question title.");
      return;
    }
    if (!cpLink.trim()) {
      setError("Please provide the problem link.");
      return;
    }
    if (!cpTopic) {
      setError("Please select a topic.");
      return;
    }

    try {
      setPublishingCp(true);
      setError("");
      setSuccess("");

      await api.post("/progress/content", {
        batch: currentBatch._id,
        type: "cp",
        topic: cpTopic,
        week: Number(cpWeek),
        title: `${cpTitle.trim()} [${cpDifficulty}]`,
        link: cpLink.trim(),
      });

      toast.success(`Week ${cpWeek} CP problem published successfully.`);
      setCpTitle("");
      setCpLink("");
      await loadProgressData();
    } catch (err) {
      console.error("Publish CP error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to publish CP question."
      );
    } finally {
      setPublishingCp(false);
    }
  };

  // ============================================================
  // PUBLISH DEV
  // ============================================================

  const handlePublishDev = async (e) => {
    e.preventDefault();

    if (!currentBatch?._id) {
      setError("No current batch is available. Please activate a batch first.");
      return;
    }
    if (!devTitle.trim()) {
      setError("Please provide a lecture title.");
      return;
    }
    if (!devLink.trim()) {
      setError("Please provide the lecture link.");
      return;
    }
    if (!devTopic) {
      setError("Please select a topic.");
      return;
    }

    try {
      setPublishingDev(true);
      setError("");
      setSuccess("");

      await api.post("/progress/content", {
        batch: currentBatch._id,
        type: "dev",
        topic: devTopic,
        week: Number(devWeek),
        title: `${devTitle.trim()} (${devDuration})`,
        link: devLink.trim(),
      });

      toast.success(`Week ${devWeek} Dev lecture published successfully.`);
      setDevTitle("");
      setDevLink("");
      await loadProgressData();
    } catch (err) {
      console.error("Publish Dev error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to publish Dev video."
      );
    } finally {
      setPublishingDev(false);
    }
  };

  // ============================================================
  // DELETE CONTENT
  // ============================================================

  const handleDeleteContent = (contentId) => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#16344E]">
            Remove this curriculum task?
          </span>

          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  setDeletingId(contentId);
                  setError("");
                  await api.patch(`/progress/content/${contentId}/unpublish`);
                  toast.success("Task removed successfully.");
                  await loadProgressData();
                } catch (err) {
                  console.error("Delete task error:", err);
                  toast.error(
                    err?.response?.data?.message || "Failed to remove task."
                  );
                } finally {
                  setDeletingId(null);
                }
              }}
              className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 6000, position: "top-center" }
    );
  };

  // ============================================================
  // STATISTICS METRICS
  // ============================================================

  const statsCurrentBatch = statsData?.currentBatch || {};

  const totalStudents =
    statsData?.overallStats?.totalStudentsAllTime ||
    studentsProgress.length ||
    0;

  const femaleStudentsCount =
    statsCurrentBatch?.femaleStudents ||
    studentsProgress.filter(
      (s) => String(s?.student?.gender || "").toLowerCase() === "female"
    ).length ||
    0;

  const maleStudentsCount =
    statsCurrentBatch?.maleStudents ||
    studentsProgress.filter(
      (s) => String(s?.student?.gender || "").toLowerCase() === "male"
    ).length ||
    0;

  const currentTotal = femaleStudentsCount + maleStudentsCount;

  const malePercent =
    currentTotal > 0
      ? ((maleStudentsCount / currentTotal) * 100).toFixed(0)
      : "0";

  const femalePercent =
    currentTotal > 0
      ? ((femaleStudentsCount / currentTotal) * 100).toFixed(0)
      : "0";

  const totalMentors = statsData?.overallStats?.totalMentors || 0;

  const cpContentList = contentList.filter(
    (item) => item.type === "cp" && item.week === Number(cpWeek)
  );

  const devContentList = contentList.filter(
    (item) => item.type === "dev" && item.week === Number(devWeek)
  );

  const totalQuestionsSolved = studentsProgress.reduce(
    (total, student) =>
      total + Number(student?.cp?.completed || student?.completed || 0),
    0
  );

  const totalExpectedQuestions =
    studentsProgress.reduce(
      (total, student) =>
        total + Number(student?.cp?.total || student?.total || 0),
      0
    ) || 100;

  const avgCpCompletion =
    totalExpectedQuestions > 0
      ? Math.min(
          Math.round((totalQuestionsSolved / totalExpectedQuestions) * 100),
          100
        )
      : 0;

  const totalDevCompleted = studentsProgress.reduce(
    (total, student) => total + Number(student?.dev?.completed || 0),
    0
  );

  const totalDevExpected = studentsProgress.reduce(
    (total, student) => total + Number(student?.dev?.total || 0),
    0
  );

  const avgDevCompletion =
    totalDevExpected > 0
      ? Math.min(Math.round((totalDevCompleted / totalDevExpected) * 100), 100)
      : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] to-[#F7C9A4]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-[#FAF4EB]/90 p-8 shadow-xl backdrop-blur-xl">
          <Loader2 className="h-9 w-9 animate-spin text-[#DE7E4A]" />
          <p className="text-sm font-bold text-[#173854]">
            Loading Student Progress...
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
      `}</style>

      {/* ============================================================
          MAIN GRADIENT CANVAS (Ice-Blue -> Cream -> Sunset Peach)
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
              1. TOP HEADER BANNER (Updated Heading: Student Progress)
          ====================================================== */}
          <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-7 shadow-[0_20px_50px_rgba(23,56,84,0.22)] backdrop-blur-2xl md:px-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#F38744]/35 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-[-50px] left-1/3 h-52 w-52 rounded-full bg-[#7EC8F5]/25 blur-[60px]" />

            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="float-slow relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                  <Zap size={28} className="text-[#F38744]" strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-[#F38744]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Live Curriculum Hub
                    </span>
                  </div>

                  {/* Heading Updated to Student Progress */}
                  <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    Student Progress
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Publish weekly milestones, analyze problem sets, and evaluate student ranks in real time.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white shadow-lg backdrop-blur-md">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold">
                    Cohort: {currentBatch?.name || "None Active"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================
              ALERTS
          ====================================================== */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-100/90 p-4 text-sm text-rose-800 shadow-sm backdrop-blur-md">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
              <p className="font-bold">{error}</p>
            </div>
          )}

          {/* ======================================================
              2. TOP CIRCULAR STATISTIC CARDS (Neatly Scaled Radius)
          ====================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto">
            
            {/* CIRCULAR POD 1: TOTAL STUDENTS */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-[#1E6FA3] hover:shadow-[0_20px_45px_rgba(30,111,163,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-[#1E6FA3]/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E0F0FA] text-[#1E6FA3] shadow-sm mb-1">
                <Users size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {totalStudents}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Total Students
              </span>

              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[8.5px] font-black text-emerald-800">
                <Flame size={10} className="fill-emerald-500 text-emerald-500" />
                Active Cohort
              </span>
            </div>

            {/* CIRCULAR POD 2: MALE STUDENTS */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-blue-500 hover:shadow-[0_20px_45px_rgba(59,130,246,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-blue-400/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E0F0FA] text-blue-600 font-extrabold text-sm shadow-sm mb-1">
                ♂
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {maleStudentsCount}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Male Students
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-blue-100/80 px-2 py-0.5 text-[8.5px] font-black text-blue-800">
                {malePercent}% of total
              </span>
            </div>

            {/* CIRCULAR POD 3: FEMALE STUDENTS */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-rose-400 hover:shadow-[0_20px_45px_rgba(244,63,94,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-rose-400/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-extrabold text-sm shadow-sm mb-1">
                ♀
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {femaleStudentsCount}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Female Students
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-rose-100/80 px-2 py-0.5 text-[8.5px] font-black text-rose-800">
                {femalePercent}% of total
              </span>
            </div>

            {/* CIRCULAR POD 4: TOTAL MENTORS */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-[#DE7E4A] hover:shadow-[0_20px_45px_rgba(222,126,74,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-[#DE7E4A]/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDE2D2] text-[#DE7E4A] shadow-sm mb-1">
                <Shield size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {totalMentors}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Total Mentors
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-[#FDE2D2] px-2 py-0.5 text-[8.5px] font-black text-[#DE7E4A]">
                Engineering Leads
              </span>
            </div>

          </div>

          {/* ======================================================
              3. CURRICULUM GAUGES + LEADERBOARD
          ====================================================== */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* OVERALL RADAR GAUGES */}
            <div className="space-y-6 rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-[#EBDCC8] pb-4">
                <div>
                  <h2 className="text-lg font-black text-[#16344E]">
                    Overall Curriculum Completion
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Real-time aggregated completion rates for CP and Dev tracks
                  </p>
                </div>

                <span className="flex items-center gap-1.5 rounded-full border border-[#DFCBB5] bg-[#F5ECE0] px-3.5 py-1 text-xs font-bold text-[#E26D2C]">
                  <Sparkles size={13} />
                  Live Sync
                </span>
              </div>

              <div className="grid gap-8 pt-2 sm:grid-cols-2">
                {/* CP GAUGE */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/50 p-6">
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0F0FA] text-[#1E6FA3]">
                      <Code2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#16344E]">CP Track</h3>
                      <p className="text-[10px] text-slate-500">Problem Solving & Algorithms</p>
                    </div>
                  </div>

                  <div className="relative flex h-36 w-36 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#EBDCC8]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#173854]"
                        strokeDasharray={`${avgCpCompletion}, 100`}
                        strokeWidth="3.6"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-black text-[#16344E]">
                        {avgCpCompletion}%
                      </span>
                      <span className="block text-[10px] font-bold text-slate-500">
                        Completed
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Problems Cleared
                    </p>
                    <p className="mt-0.5 text-lg font-black text-[#16344E]">
                      {totalQuestionsSolved}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        / {totalExpectedQuestions}
                      </span>
                    </p>
                  </div>
                </div>

                {/* DEV GAUGE */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/50 p-6">
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                      <Monitor size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#16344E]">Dev Track</h3>
                      <p className="text-[10px] text-slate-500">Full-Stack Development</p>
                    </div>
                  </div>

                  <div className="relative flex h-36 w-36 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#EBDCC8]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#DE7E4A]"
                        strokeDasharray={`${avgDevCompletion}, 100`}
                        strokeWidth="3.6"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-black text-[#16344E]">
                        {avgDevCompletion}%
                      </span>
                      <span className="block text-[10px] font-bold text-slate-500">
                        Completed
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Lectures Cleared
                    </p>
                    <p className="mt-0.5 text-lg font-black text-[#16344E]">
                      {totalDevCompleted}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        / {totalDevExpected || 0}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* LEADERBOARD */}
            <div className="space-y-4 rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between border-b border-[#EBDCC8] pb-3.5">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-[#E26D2C]" />
                  <h3 className="text-base font-black text-[#16344E]">
                    Leaderboard
                  </h3>
                </div>

                <div className="flex rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] p-0.5 text-xs font-bold">
                  <button
                    onClick={() => setPerformerTab("cp")}
                    className={`rounded-lg px-3 py-1 transition ${
                      performerTab === "cp"
                        ? "bg-[#173854] text-white shadow-sm"
                        : "text-slate-600 hover:text-black"
                    }`}
                  >
                    CP
                  </button>
                  <button
                    onClick={() => setPerformerTab("dev")}
                    className={`rounded-lg px-3 py-1 transition ${
                      performerTab === "dev"
                        ? "bg-[#173854] text-white shadow-sm"
                        : "text-slate-600 hover:text-black"
                    }`}
                  >
                    Dev
                  </button>
                </div>
              </div>

              {studentsProgress.length === 0 ? (
                <p className="py-12 text-center text-xs font-semibold text-slate-500">
                  No progress records available for this cohort yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {[...studentsProgress]
                    .sort((a, b) => {
                      const aComp =
                        performerTab === "cp"
                          ? (a?.cp?.completion ?? a?.completion ?? 0)
                          : (a?.dev?.completion ?? 0);
                      const bComp =
                        performerTab === "cp"
                          ? (b?.cp?.completion ?? b?.completion ?? 0)
                          : (b?.dev?.completion ?? 0);
                      return bComp - aComp;
                    })
                    .slice(0, 5)
                    .map((item, idx) => {
                      const completion =
                        performerTab === "cp"
                          ? (item?.cp?.completion ?? item?.completion ?? 0)
                          : (item?.dev?.completion ?? 0);
                      const completed =
                        performerTab === "cp"
                          ? (item?.cp?.completed ?? item?.completed ?? 0)
                          : (item?.dev?.completed ?? 0);

                      const medal =
                        idx === 0
                          ? "🥇"
                          : idx === 1
                          ? "🥈"
                          : idx === 2
                          ? "🥉"
                          : `#${idx + 1}`;

                      return (
                        <div
                          key={item?.student?.id || item?.student?._id || idx}
                          className={`flex items-center justify-between rounded-2xl border p-3 ${
                            idx === 0
                              ? "border-[#DE7E4A]/40 bg-[#FDE2D2]/60 shadow-sm"
                              : "border-[#EBDCC8] bg-[#FFFDF9]"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="w-5 text-center text-sm font-black">
                              {medal}
                            </span>
                            <div className="truncate">
                              <p className="truncate text-xs font-bold text-[#16344E]">
                                {item?.student?.name || "Student"}
                              </p>
                              <span className="text-[10px] text-slate-400 capitalize">
                                {item?.student?.gender || "Student"}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">
                              {completed}
                            </span>
                            <span className="rounded-xl bg-[#173854] px-2.5 py-0.5 text-[11px] font-black text-white">
                              {completion}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* ======================================================
              4. PUBLISHING WORKSHOPS: CP & DEV
          ====================================================== */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* CP WORKSHOP */}
            <div className="space-y-5 rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between border-b border-[#EBDCC8] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0F0FA] text-[#1E6FA3]">
                    <Code2 size={18} />
                  </div>
                  <h3 className="text-base font-black text-[#16344E]">
                    Publish CP Challenge
                  </h3>
                </div>
                <span className="rounded-full bg-[#E0F0FA] px-3 py-0.5 text-[10px] font-black uppercase text-[#173854]">
                  LeetCode / Codeforces
                </span>
              </div>

              <form onSubmit={handlePublishCp} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#16344E]">
                      Week Number
                    </label>
                    <select
                      value={cpWeek}
                      onChange={(e) => setCpWeek(Number(e.target.value))}
                      className="h-10 w-full rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-3 text-xs font-bold text-[#16344E] outline-none focus:border-[#E26D2C]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                        <option key={w} value={w}>
                          Week {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#16344E]">
                      Topic Category
                    </label>
                    <select
                      value={cpTopic}
                      onChange={(e) => setCpTopic(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-3 text-xs font-bold text-[#16344E] outline-none focus:border-[#E26D2C]"
                    >
                      {TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-bold text-[#16344E]">
                      Problem Title
                    </label>
                    <input
                      type="text"
                      required
                      value={cpTitle}
                      onChange={(e) => setCpTitle(e.target.value)}
                      placeholder="e.g. Trapping Rain Water"
                      className="h-10 w-full rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-3 text-xs font-semibold outline-none focus:border-[#E26D2C] focus:bg-[#FFFDF9]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#16344E]">
                      Difficulty
                    </label>
                    <select
                      value={cpDifficulty}
                      onChange={(e) => setCpDifficulty(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-2.5 text-xs font-bold outline-none focus:border-[#E26D2C]"
                    >
                      <option value="Easy">🟢 Easy</option>
                      <option value="Medium">🟡 Med</option>
                      <option value="Hard">🔴 Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#16344E]">
                    Platform URL
                  </label>
                  <input
                    type="url"
                    required
                    value={cpLink}
                    onChange={(e) => setCpLink(e.target.value)}
                    placeholder="https://leetcode.com/problems/..."
                    className="h-10 w-full rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-3 text-xs font-semibold outline-none focus:border-[#E26D2C] focus:bg-[#FFFDF9]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={publishingCp || !currentBatch}
                  className="smooth-transition flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#173854] to-[#224A6D] py-3 text-xs font-bold text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                >
                  {publishingCp ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Plus size={15} />
                  )}
                  <span>Publish CP Problem</span>
                </button>
              </form>

              {/* CP QUESTION TABLE */}
              <div className="space-y-2 pt-2 border-t border-[#EBDCC8]">
                <div className="flex items-center justify-between text-xs font-black text-[#16344E]">
                  <span>Week {cpWeek} Questions</span>
                  <span className="rounded-full bg-[#E0F0FA] px-2.5 py-0.5 text-[10px] text-[#173854]">
                    {cpContentList.length} Published
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9]">
                  {cpContentList.length === 0 ? (
                    <p className="p-5 text-center text-xs text-slate-400">
                      No CP challenges published for Week {cpWeek}.
                    </p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-[#EBDCC8]">
                        {cpContentList.map((item, index) => (
                          <tr key={item._id} className="hover:bg-[#FAF4EB]">
                            <td className="p-3 font-bold text-slate-400 w-8">
                              {index + 1}
                            </td>
                            <td className="p-3 font-bold text-[#16344E]">
                              {item.title}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <a
                                  href={item.link?.startsWith("http") ? item.link : `https://${item.link}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                                >
                                  Solve <ExternalLink size={12} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(item.link, item._id)}
                                  className="text-slate-400 hover:text-black"
                                >
                                  {copiedId === item._id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteContent(item._id)}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* DEV WORKSHOP */}
            <div className="space-y-5 rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between border-b border-[#EBDCC8] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                    <Monitor size={18} />
                  </div>
                  <h3 className="text-base font-black text-[#16344E]">
                    Publish Dev Video Lecture
                  </h3>
                </div>
                <span className="rounded-full bg-[#FDE2D2] px-3 py-0.5 text-[10px] font-black uppercase text-[#E26D2C]">
                  Full-Stack Architecture
                </span>
              </div>

              <form onSubmit={handlePublishDev} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#16344E]">
                      Week Number
                    </label>
                    <select
                      value={devWeek}
                      onChange={(e) => setDevWeek(Number(e.target.value))}
                      className="h-10 w-full rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-3 text-xs font-bold text-[#16344E] outline-none focus:border-[#E26D2C]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                        <option key={w} value={w}>
                          Week {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#16344E]">
                      Topic Category
                    </label>
                    <select
                      value={devTopic}
                      onChange={(e) => setDevTopic(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-3 text-xs font-bold text-[#16344E] outline-none focus:border-[#E26D2C]"
                    >
                      {TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-bold text-[#16344E]">
                      Lecture Title
                    </label>
                    <input
                      type="text"
                      required
                      value={devTitle}
                      onChange={(e) => setDevTitle(e.target.value)}
                      placeholder="e.g. Node.js Streams & Buffers"
                      className="h-10 w-full rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-3 text-xs font-semibold outline-none focus:border-[#E26D2C] focus:bg-[#FFFDF9]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#16344E]">
                      Duration
                    </label>
                    <select
                      value={devDuration}
                      onChange={(e) => setDevDuration(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-2 text-xs font-bold outline-none focus:border-[#E26D2C]"
                    >
                      <option value="30 mins">⏱️ 30m</option>
                      <option value="45 mins">⏱️ 45m</option>
                      <option value="1 hour">⏱️ 1h</option>
                      <option value="1.5 hours">⏱️ 1.5h</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#16344E]">
                    Video Resource Link
                  </label>
                  <input
                    type="url"
                    required
                    value={devLink}
                    onChange={(e) => setDevLink(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="h-10 w-full rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-3 text-xs font-semibold outline-none focus:border-[#E26D2C] focus:bg-[#FFFDF9]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={publishingDev || !currentBatch}
                  className="smooth-transition flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DE7E4A] via-[#E26D2C] to-[#BA6137] py-3 text-xs font-black text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                >
                  {publishingDev ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Plus size={15} />
                  )}
                  <span>Publish Dev Lecture</span>
                </button>
              </form>

              {/* DEV VIDEOS TABLE */}
              <div className="space-y-2 pt-2 border-t border-[#EBDCC8]">
                <div className="flex items-center justify-between text-xs font-black text-[#16344E]">
                  <span>Week {devWeek} Lectures</span>
                  <span className="rounded-full bg-[#FDE2D2] px-2.5 py-0.5 text-[10px] text-[#E26D2C]">
                    {devContentList.length} Published
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9]">
                  {devContentList.length === 0 ? (
                    <p className="p-5 text-center text-xs text-slate-400">
                      No Dev lectures published for Week {devWeek}.
                    </p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-[#EBDCC8]">
                        {devContentList.map((item, index) => (
                          <tr key={item._id} className="hover:bg-[#FAF4EB]">
                            <td className="p-3 font-bold text-slate-400 w-8">
                              {index + 1}
                            </td>
                            <td className="p-3 font-bold text-[#16344E]">
                              {item.title}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <a
                                  href={item.link?.startsWith("http") ? item.link : `https://${item.link}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-purple-600 font-bold hover:underline"
                                >
                                  Watch <ExternalLink size={12} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(item.link, item._id)}
                                  className="text-slate-400 hover:text-black"
                                >
                                  {copiedId === item._id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteContent(item._id)}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default AdminProgress;