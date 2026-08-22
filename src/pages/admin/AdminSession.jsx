import { useEffect, useState } from "react";
import {
  CalendarPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Layers,
  Sparkles,
  Calendar,
  BookOpen,
  Trophy,
  Users,
  Clock,
  RotateCcw,
} from "lucide-react";
import api from "../../utils/api";

const AdminSessions = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  const [week, setWeek] = useState(1);
  const [lectureCount, setLectureCount] = useState(2);
  const [defaultDate, setDefaultDate] = useState("");

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches");
        const list = Array.isArray(res.data?.batches)
          ? res.data.batches
          : res.data || [];

        setBatches(list);

        if (list.length > 0) {
          setSelectedBatch(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load batches:", err);
        setError("Failed to load batches.");
      }
    };

    fetchBatches();
  }, []);

  const fetchSessions = async () => {
    if (!selectedBatch) return;

    setLoadingSessions(true);
    setError("");

    try {
      const res = await api.get(`/sessions/batch/${selectedBatch}`);
      setSessions(Array.isArray(res.data?.sessions) ? res.data.sessions : []);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load sessions for this batch."
      );
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [selectedBatch]);

  const handleGenerate = async () => {
    if (!selectedBatch) {
      setError("Select a batch first.");
      return;
    }

    if (!defaultDate) {
      setError("Pick a default date for this week's sessions.");
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/sessions/generate-week", {
        batchId: selectedBatch,
        week,
        lectureCount,
        dates: { default: defaultDate },
      });

      setSuccess(res.data?.message || "Sessions generated successfully.");
      await fetchSessions();
    } catch (err) {
      console.error("Failed to generate sessions:", err);
      setError(
        err.response?.data?.message || "Failed to generate week sessions."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (sessionId) => {
    try {
      await api.delete(`/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch (err) {
      console.error("Failed to delete session:", err);
      setError(err.response?.data?.message || "Failed to delete session.");
    }
  };

  const sessionsByWeek = sessions.reduce((acc, session) => {
    acc[session.week] = acc[session.week] || [];
    acc[session.week].push(session);
    return acc;
  }, {});

  const weekNumbers = Object.keys(sessionsByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  const getSessionIcon = (type = "") => {
    const lower = type.toLowerCase();
    if (lower.includes("contest")) {
      return <Trophy size={16} className="text-[#E26D2C]" />;
    }
    if (lower.includes("experience") || lower.includes("sharing")) {
      return <Users size={16} className="text-[#1E6FA3]" />;
    }
    return <BookOpen size={16} className="text-emerald-600" />;
  };

  return (
    <>
      {/* ============================================================
          ANIMATION STYLES
      ============================================================ */}
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

        <div className="page-enter relative z-10 mx-auto max-w-5xl space-y-7">

          {/* ======================================================
              1. TOP HEADER BANNER
          ====================================================== */}
          <header className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-7 shadow-[0_20px_50px_rgba(23,56,84,0.22)] backdrop-blur-2xl md:px-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#F38744]/35 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-[-50px] left-1/3 h-52 w-52 rounded-full bg-[#7EC8F5]/25 blur-[60px]" />

            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="float-slow relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                  <Layers size={28} strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-[#F38744]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Curriculum Schedule
                    </span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    Weekly Sessions
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Configure lectures, contests, and experience sharing checkpoints for cohorts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-white shadow-lg backdrop-blur-md">
                <Calendar size={16} className="text-[#F38744]" />
                <span className="text-xs font-bold">
                  {sessions.length} Total Session{sessions.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </header>

          {/* ======================================================
              ALERTS
          ====================================================== */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-100/90 p-4.5 text-sm text-rose-800 shadow-sm backdrop-blur-md">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
              <p className="font-bold">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-100/90 p-4.5 text-sm text-emerald-800 shadow-sm backdrop-blur-md">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="font-bold">{success}</p>
            </div>
          )}

          {/* ======================================================
              2. GENERATE A WEEK PANEL (Creamy Glass Card)
          ====================================================== */}
          <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-[#EBDCC8] pb-4">
              <div>
                <h2 className="text-lg font-black text-[#16344E]">
                  Generate a Week Schedule
                </h2>
                <p className="text-xs text-slate-500">
                  Automatically generates lecture series, contest checkpoint, and experience sharing session.
                </p>
              </div>

              <span className="rounded-full bg-[#E0F0FA] px-3 py-1 text-[11px] font-bold text-[#173854]">
                Batch Automation
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* BATCH SELECT */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                  Batch Cohort <span className="text-[#E26D2C]">*</span>
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 text-xs font-bold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                >
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* WEEK NUMBER */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                  Week Number <span className="text-[#E26D2C]">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={week}
                  onChange={(e) => setWeek(Number(e.target.value))}
                  className="h-12 w-full rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 text-xs font-bold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                />
              </div>

              {/* LECTURES COUNT */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                  Lectures This Week <span className="text-[#E26D2C]">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={lectureCount}
                  onChange={(e) => setLectureCount(Number(e.target.value))}
                  className="h-12 w-full rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 text-xs font-bold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  e.g. 2 for normal, 4 for intensive week
                </p>
              </div>

              {/* DEFAULT DATE */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                  Default Date <span className="text-[#E26D2C]">*</span>
                </label>
                <input
                  type="date"
                  value={defaultDate}
                  onChange={(e) => setDefaultDate(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 text-xs font-bold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-600">
                ⚡ Automatically creates <span className="font-black text-[#16344E]">{lectureCount} Lectures</span>, <span className="font-black text-[#E26D2C]">1 Contest</span>, and <span className="font-black text-[#173854]">1 Experience Sharing</span> session.
              </p>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="smooth-transition inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DE7E4A] via-[#E26D2C] to-[#BA6137] px-7 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CalendarPlus size={16} />
                )}
                <span>Generate Week</span>
              </button>
            </div>
          </div>

          {/* ======================================================
              3. CONFIGURED SESSIONS SECTION (Creamy Session Tiles)
          ====================================================== */}
          <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-[#EBDCC8] pb-4">
              <div>
                <h2 className="text-lg font-black text-[#16344E]">
                  Configured Sessions Timeline
                </h2>
                <p className="text-xs text-slate-500">
                  Attendance checkpoints grouped chronologically by curriculum week
                </p>
              </div>

              <button
                onClick={fetchSessions}
                className="rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] p-2 text-slate-600 transition hover:bg-[#FFFDF9]"
                title="Refresh sessions"
              >
                <RotateCcw size={14} className={loadingSessions ? "animate-spin" : ""} />
              </button>
            </div>

            {loadingSessions ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={28} className="animate-spin text-[#E26D2C]" />
                <p className="mt-3 text-xs font-bold text-slate-500">Loading batch sessions...</p>
              </div>
            ) : weekNumbers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#DFCBB5] bg-[#F5ECE0]/50 p-10 text-center">
                <Calendar className="mx-auto h-10 w-10 text-[#DE7E4A]" />
                <p className="mt-3 text-sm font-bold text-[#16344E]">No sessions configured yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Select parameters above and click "Generate Week" to schedule sessions.
                </p>
              </div>
            ) : (
              <div className="space-y-7">
                {weekNumbers.map((weekNum) => (
                  <div key={weekNum} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#E26D2C]" />
                      <span className="text-xs font-black uppercase tracking-widest text-[#E26D2C]">
                        Week {weekNum}
                      </span>
                      <div className="h-px flex-1 bg-[#EBDCC8]" />
                      <span className="text-[11px] font-bold text-slate-500">
                        {sessionsByWeek[weekNum].length} checkpoints
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                      {sessionsByWeek[weekNum].map((session) => (
                        <div
                          key={session._id}
                          className="smooth-transition flex items-center justify-between rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4 shadow-sm hover:-translate-y-1 hover:border-[#E26D2C]/60 hover:shadow-md"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF4EB] border border-[#EBDCC8]">
                              {getSessionIcon(session.type)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-[#16344E]">
                                {session.name}
                              </p>
                              <p className="mt-0.5 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                                <span className="uppercase text-[9px] font-extrabold text-[#E26D2C]">
                                  {session.type}
                                </span>
                                <span>•</span>
                                <span>{new Date(session.date).toLocaleDateString()}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDelete(session._id)}
                            className="rounded-xl border border-transparent p-2 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                            title="Remove session"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminSessions;