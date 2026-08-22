import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast, { Toaster } from "react-hot-toast";
import {
  Megaphone,
  CalendarDays,
  Loader2,
  AlertCircle,
  User,
  Sparkles,
  RotateCcw,
  Volume2,
  Bell,
  CheckCircle2,
} from "lucide-react";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/announcements");

      if (response.data?.success) {
        setAnnouncements(response.data.announcements || []);
      } else {
        const message =
          response.data?.message || "Failed to load announcements.";
        setAnnouncements([]);
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error("Fetch student announcements error:", err);
      const message =
        err.response?.data?.message ||
        "Failed to load announcements. Please refresh the page.";
      setAnnouncements([]);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getAudienceLabel = (audience) => {
    if (audience === "all") return "Everyone";
    if (audience === "assigned_students") return "My Mentor Group";
    return audience;
  };

  const getCreatorName = (item) => {
    if (!item?.createdBy) return "Administration";
    const firstName = item.createdBy.firstName || "";
    const lastName = item.createdBy.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) return fullName;
    if (item.createdBy.role === "admin") return "Administration";
    if (item.createdBy.role === "mentor") return "Assigned Mentor";
    return "Administration";
  };

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
                  <Megaphone size={28} className="text-[#F38744]" strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-gradient-to-r from-[#F38744] to-[#7EC8F5]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Broadcast Feed
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight heading-gradient">
                    Announcements & Bulletins
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Stay up-to-date with official milestones, schedule notices, and mentor messages.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadAnnouncements}
                  disabled={loading}
                  className="smooth-transition flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-50"
                >
                  <RotateCcw size={16} className={`text-[#F38744] ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh Feed</span>
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
              2. RECENT ANNOUNCEMENTS FEED TABLE (Creamy Alabaster)
          ====================================================== */}
          <section className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[#EBDCC8] p-6">
              <div>
                <h2 className="text-xl font-black text-[#16344E]">
                  Recent Broadcasts Feed
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Chronological feed of notices and announcements for your cohort
                </p>
              </div>

              <span className="rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0] px-4 py-2 text-xs font-black text-[#173854]">
                Total: {announcements.length} Dispatches
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-60 flex-col items-center justify-center p-12">
                <Loader2 size={32} className="animate-spin text-[#E26D2C]" />
                <p className="mt-3 text-xs font-bold text-slate-500">Fetching latest announcements...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="p-12 text-center">
                <Megaphone className="mx-auto h-12 w-12 text-[#DE7E4A]" />
                <h3 className="mt-4 text-base font-black text-[#16344E]">No announcements yet</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Check back later for important schedule and milestone updates.
                </p>
              </div>
            ) : (
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Announcement Content
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Target Group
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Author
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Published Date
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {announcements.map((item) => (
                      <tr
                        key={item._id}
                        className="smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]"
                      >
                        {/* ANNOUNCEMENT SUBJECT & BODY */}
                        <td className="px-6 py-4.5 max-w-md align-top">
                          <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E0F0FA] text-[#173854]">
                              <Volume2 size={18} className="text-[#E26D2C]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-black text-[#16344E]">
                                {item.title}
                              </h3>
                              <p className="mt-1 whitespace-pre-wrap text-xs font-medium text-slate-600 leading-relaxed">
                                {item.body}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* AUDIENCE */}
                        <td className="px-5 py-4.5 align-top">
                          <span
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                              item.audience === "assigned_students"
                                ? "border-[#FDE2D2] bg-[#FDE2D2] text-[#E26D2C]"
                                : "border-emerald-200 bg-emerald-50 text-emerald-800"
                            }`}
                          >
                            {getAudienceLabel(item.audience)}
                          </span>
                        </td>

                        {/* AUTHOR */}
                        <td className="px-5 py-4.5 align-top">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#16344E]">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E0F0FA] text-[#173854]">
                              <User size={13} />
                            </div>
                            <span>{getCreatorName(item)}</span>
                          </div>
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-4.5 align-top">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <CalendarDays size={13} className="text-[#E26D2C]" />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4.5 text-right align-top">
                          {item.edited ? (
                            <div>
                              <span className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-800">
                                Edited
                              </span>
                              {item.updatedAt && (
                                <p className="mt-1 text-[9.5px] font-semibold text-amber-800">
                                  {formatDate(item.updatedAt)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-800">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}

export default Announcements;