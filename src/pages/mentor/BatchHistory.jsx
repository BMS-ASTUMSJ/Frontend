import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  ArrowRight,
  CalendarDays,
  Clock,
  Loader2,
  RefreshCw,
  Users,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FolderGit2,
} from "lucide-react";
import api from "../../utils/api";

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusStyle = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "active":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "upcoming":
      return "bg-amber-100 text-amber-800 border-amber-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
};

const MentorBatchHistory = () => {
  const [currentBatch, setCurrentBatch] = useState(null);
  const [batchHistory, setBatchHistory] = useState([]);
  const [currentRole, setCurrentRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchBatchHistory = useCallback(async () => {
    try {
      setError("");
      const response = await api.get("/batch-history/my");

      setCurrentBatch(response.data?.currentBatch || null);
      setCurrentRole(response.data?.currentRole || "");
      setBatchHistory(
        Array.isArray(response.data?.batchHistory)
          ? response.data.batchHistory
          : []
      );
    } catch (err) {
      console.error("Failed to load batch history:", err);
      setError(
        err.response?.data?.message || "Failed to load your batch history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBatchHistory();
  }, [fetchBatchHistory]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBatchHistory();
  };

  const previousBatches = batchHistory.filter((item) => {
    if (!currentBatch?._id) return true;
    return String(item.batchId) !== String(currentBatch._id);
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] to-[#F7C9A4]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-[#FAF4EB]/90 p-8 shadow-xl backdrop-blur-xl">
          <Loader2 className="h-9 w-9 animate-spin text-[#DE7E4A]" />
          <p className="text-sm font-bold text-[#173854]">
            Loading Cohort History...
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
                  <Archive size={28} className="text-[#F38744]" strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-gradient-to-r from-[#F38744] to-[#7EC8F5]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Cohort Management
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight heading-gradient">
                    My Batch & Historical Cohorts
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Review your currently assigned engineering batch alongside previous mentorship archives.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="smooth-transition flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={`text-[#F38744] ${refreshing ? "animate-spin" : ""}`} />
                  <span>Sync Batches</span>
                </button>
              </div>
            </div>
          </header>

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
              2. CURRENT ACTIVE BATCH SHOWCASE
          ====================================================== */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="h-2 w-2 rounded-full bg-[#E26D2C]" />
              <h2 className="text-lg font-black text-[#16344E]">
                Currently Active Batch
              </h2>
            </div>

            {currentBatch ? (
              <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
                {/* Navy Highlight Header */}
                <div className="border-b border-[#EBDCC8] bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] p-6 text-white sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        <span>Active Cohort Session</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                        {currentBatch.name}
                      </h3>

                      {currentBatch.description && (
                        <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[#D7E8F7] leading-relaxed">
                          {currentBatch.description}
                        </p>
                      )}
                    </div>

                    <div
                      className={`self-start rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-wider sm:self-auto ${getStatusStyle(
                        currentBatch.status
                      )}`}
                    >
                      {currentBatch.status || "Active"}
                    </div>
                  </div>
                </div>

                {/* Creamy Info Grid */}
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3 sm:p-8">
                  <InfoCard
                    icon={<CalendarDays size={18} />}
                    label="Commencement Date"
                    value={formatDate(currentBatch.startDate)}
                  />

                  <InfoCard
                    icon={<CalendarDays size={18} />}
                    label="Expected Completion"
                    value={formatDate(currentBatch.endDate)}
                  />

                  <InfoCard
                    icon={<Users size={18} />}
                    label="Assigned Capacity"
                    value={currentRole || "Lead Mentor"}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#DFCBB5] bg-[#FAF4EB]/90 p-12 text-center shadow-sm">
                <Archive size={36} className="mx-auto text-[#DE7E4A]" />
                <h3 className="mt-4 text-base font-black text-[#16344E]">
                  No active cohort assignment
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  You are not currently allocated to an ongoing training batch.
                </p>
              </div>
            )}
          </section>

          {/* ======================================================
              3. PREVIOUS COHORTS ARCHIVE (Creamy Cards)
          ====================================================== */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl font-black text-[#16344E]">
                  Historical Mentorship Batches
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Archives of batches and student cohorts you have previously led
                </p>
              </div>

              <span className="rounded-2xl border border-[#DFCBB5] bg-[#FAF4EB] px-4 py-2 text-xs font-black text-[#173854] shadow-sm">
                {previousBatches.length} {previousBatches.length === 1 ? "Cohort" : "Cohorts"}
              </span>
            </div>

            {previousBatches.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[#DFCBB5] bg-[#FAF4EB]/90 p-12 text-center shadow-sm">
                <FolderGit2 className="mx-auto h-12 w-12 text-[#DE7E4A]" />
                <h3 className="mt-4 text-base font-black text-[#16344E]">
                  No previous batch records
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Historical cohort records will automatically populate once training sessions conclude.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {previousBatches.map((item) => {
                  const batch = item.batch;
                  if (!batch) return null;

                  return (
                    <div
                      key={String(item.batchId)}
                      className="smooth-transition group flex flex-col justify-between overflow-hidden rounded-[26px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_12px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(23,56,84,0.14)]"
                    >
                      {/* CARD HEADER */}
                      <div className="border-b border-[#EBDCC8] bg-gradient-to-r from-[#173854] to-[#224A6D] p-5.5 text-white">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                            <Archive size={18} />
                          </div>

                          <span
                            className={`rounded-full border px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${getStatusStyle(
                              batch.status
                            )}`}
                          >
                            {batch.status || "Completed"}
                          </span>
                        </div>

                        <h3 className="mt-4 text-lg font-black tracking-tight">
                          {batch.name}
                        </h3>
                      </div>

                      {/* CARD BODY */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        {batch.description && (
                          <p className="mb-5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                            {batch.description}
                          </p>
                        )}

                        <div className="space-y-3 rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/60 p-4">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                              <CalendarDays size={14} className="text-[#E26D2C]" />
                              <span>Commenced</span>
                            </div>
                            <span className="font-bold text-[#16344E]">
                              {formatDate(batch.startDate)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                              <CalendarDays size={14} className="text-[#1E6FA3]" />
                              <span>Concluded</span>
                            </div>
                            <span className="font-bold text-[#16344E]">
                              {formatDate(batch.endDate)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs border-t border-[#EBDCC8] pt-2 mt-2">
                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                              <Clock size={14} className="text-emerald-600" />
                              <span>Joined Role</span>
                            </div>
                            <span className="font-bold text-[#16344E]">
                              {formatDate(item.joinedAt)}
                            </span>
                          </div>
                        </div>

                        {/* VIEW BUTTON */}
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = `/mentor/my-batch/${item.batchId}`;
                          }}
                          className="smooth-transition mt-5 flex w-full items-center justify-between rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-4 py-3 text-xs font-bold text-[#16344E] hover:border-[#E26D2C] hover:bg-[#FDE2D2]"
                        >
                          <span>Explore Batch Roster</span>
                          <ArrowRight
                            size={14}
                            className="transition-transform group-hover:translate-x-1 text-[#E26D2C]"
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
};

const InfoCard = ({ icon, label, value }) => {
  return (
    <div className="rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/80 p-4.5">
      <div className="flex items-center gap-2 text-[#E26D2C]">
        {icon}
        <span className="text-[10.5px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-black text-[#16344E]">
        {value}
      </p>
    </div>
  );
};

export default MentorBatchHistory;