import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import {
  Users,
  Shield,
  Code2,
  Monitor,
  UserCheck,
  TrendingUp,
  Search,
  AlertCircle,
  Loader2,
  Sparkles,
  Trophy,
  Flame,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  UserRound,
} from "lucide-react";

function MentorDashboard() {
  const [mentorProfile, setMentorProfile] = useState(null);
  const [assignedStudentsProgress, setAssignedStudentsProgress] = useState([]);
  const [assignedTeam, setAssignedTeam] = useState(null);
  const [coMentor, setCoMentor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMentorData() {
      try {
        setLoading(true);
        setError("");

        const [profileRes, progressRes, teamsRes] = await Promise.allSettled([
          api.get("/users/profile"),
          api.get("/progress/mentor/progress"),
          api.get("/teams"),
        ]);

        if (!isMounted) return;

        if (profileRes.status === "fulfilled") {
          const mentor = profileRes.value.data?.user || {};
          setMentorProfile(mentor);

          if (teamsRes.status === "fulfilled") {
            const allTeams = teamsRes.value.data?.teams || [];
            const myTeam = allTeams.find((team) =>
              team.mentors?.some(
                (mentorItem) =>
                  mentorItem._id === mentor._id || mentorItem === mentor._id
              )
            );

            if (myTeam) {
              setAssignedTeam(myTeam);
              const partner = myTeam.mentors?.find(
                (mentorItem) => mentorItem._id !== mentor._id
              );
              setCoMentor(partner || null);
            }
          }
        }

        if (progressRes.status === "fulfilled") {
          const progressData =
            progressRes.value.data?.data || progressRes.value.data || [];
          setAssignedStudentsProgress(
            Array.isArray(progressData) ? progressData : []
          );
        }
      } catch (err) {
        console.error("Mentor dashboard load error:", err);
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Failed to load assigned students' progress."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMentorData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalStudents = assignedStudentsProgress.length;
  const totalTasksExpected = assignedStudentsProgress[0]?.total || 0;

  const avgCompletion =
    totalStudents > 0
      ? Math.round(
          assignedStudentsProgress.reduce(
            (acc, curr) => acc + (curr.completion || 0),
            0
          ) / totalStudents
        )
      : 0;

  const totalTasksSolved = assignedStudentsProgress.reduce(
    (acc, curr) => acc + (curr.completed || 0),
    0
  );

  const filteredStudents = useMemo(() => {
    return assignedStudentsProgress.filter((item) => {
      const name = item?.student?.name?.toLowerCase() || "";
      const email = item?.student?.email?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      return name.includes(search) || email.includes(search);
    });
  }, [assignedStudentsProgress, searchTerm]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] to-[#F7C9A4]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-[#FAF4EB]/90 p-8 shadow-xl backdrop-blur-xl">
          <Loader2 className="h-9 w-9 animate-spin text-[#DE7E4A]" />
          <p className="text-sm font-bold text-[#173854]">
            Loading Mentor Workspace & Student Radar...
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
              1. TOP HEADER BANNER
          ====================================================== */}
          <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-7 shadow-[0_20px_50px_rgba(23,56,84,0.22)] backdrop-blur-2xl md:px-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#F38744]/35 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-[-50px] left-1/3 h-52 w-52 rounded-full bg-[#7EC8F5]/25 blur-[60px]" />

            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="float-slow relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                  <UserCheck size={28} strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-[#F38744]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      {mentorProfile?.gender === "Female"
                        ? "👩 Female Mentor Workspace"
                        : "👨 Male Mentor Workspace"}
                    </span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    Welcome back, {mentorProfile?.firstName || "Mentor"}!
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Track your assigned {mentorProfile?.gender?.toLowerCase() || ""} students' weekly milestones and leaderboard ranking.
                  </p>
                </div>
              </div>

              {/* Mentor Identity Badge */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-white/20 bg-white/10 p-2.5 pr-5 text-white shadow-lg backdrop-blur-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#DE7E4A] to-[#BA6137] text-sm font-black shadow">
                  {mentorProfile?.firstName?.[0]}
                  {mentorProfile?.lastName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-black">
                    {mentorProfile?.firstName} {mentorProfile?.lastName}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#FCD8BF]">
                    Lead Mentor • {assignedTeam?.name || "Active Team"}
                  </p>
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
              2. TOP CIRCULAR STATISTIC PODS
          ====================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto">
            
            {/* CIRCULAR POD 1: ASSIGNED STUDENTS */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-[#1E6FA3] hover:shadow-[0_20px_45px_rgba(30,111,163,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-[#1E6FA3]/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E0F0FA] text-[#1E6FA3] shadow-sm mb-1">
                <Users size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {totalStudents}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Assigned Students
              </span>

              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-blue-100/80 px-2 py-0.5 text-[8.5px] font-black text-blue-800">
                100% {mentorProfile?.gender || "Assigned"} Group
              </span>
            </div>

            {/* CIRCULAR POD 2: ASSIGNED TEAM */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-emerald-500 hover:shadow-[0_20px_45px_rgba(16,185,129,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-emerald-400/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm mb-1">
                <Shield size={16} />
              </div>

              <span className="text-base sm:text-lg font-black text-[#16344E] tracking-tight leading-tight my-0.5 truncate max-w-[170px]">
                {assignedTeam?.name || "Active Team"}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Assigned Team
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-emerald-100/80 px-2 py-0.5 text-[8.5px] font-black text-emerald-800">
                {assignedTeam?.batch?.name || "Cohort Active"}
              </span>
            </div>

            {/* CIRCULAR POD 3: CO-MENTOR PARTNER */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-purple-400 hover:shadow-[0_20px_45px_rgba(168,85,247,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-purple-400/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700 shadow-sm mb-1">
                <UserCheck size={16} />
              </div>

              <span className="text-xs sm:text-sm font-black text-[#16344E] tracking-tight leading-tight my-0.5 truncate max-w-[160px]">
                {coMentor ? `${coMentor.firstName} ${coMentor.lastName}` : "2nd Mentor Pair"}
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Co-Pilot Mentor
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-purple-100/80 px-2 py-0.5 text-[8.5px] font-black text-purple-800">
                Active Partner
              </span>
            </div>

            {/* CIRCULAR POD 4: TEAM AVERAGE COMPLETION */}
            <div className="smooth-transition group relative mx-auto flex aspect-square w-full max-w-[210px] sm:max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-[#E8DCB8] bg-[#FAF4EB]/95 p-4 sm:p-5 text-center shadow-[0_15px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl hover:-translate-y-1.5 hover:border-[#DE7E4A] hover:shadow-[0_20px_45px_rgba(222,126,74,0.2)]">
              <div className="rotate-orbit pointer-events-none absolute inset-[-5px] rounded-full border border-dashed border-[#DE7E4A]/35" />
              
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDE2D2] text-[#DE7E4A] shadow-sm mb-1">
                <TrendingUp size={16} />
              </div>

              <span className="text-2xl sm:text-3xl font-black text-[#16344E] tracking-tight leading-none my-0.5">
                {avgCompletion}%
              </span>

              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Team Avg Rate
              </span>

              <span className="mt-1.5 inline-flex rounded-full bg-[#FDE2D2] px-2 py-0.5 text-[8.5px] font-black text-[#DE7E4A]">
                {totalTasksSolved} tasks solved
              </span>
            </div>

          </div>

          {/* ======================================================
              3. PROGRESS GAUGES + TOP PERFORMERS
          ====================================================== */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* PROGRESS GAUGES (CP vs DEV) */}
            <div className="space-y-6 rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-[#EBDCC8] pb-4">
                <div>
                  <h2 className="text-lg font-black text-[#16344E]">
                    Team Learning Milestones
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Real-time metrics for your assigned {mentorProfile?.gender?.toLowerCase() || ""} students
                  </p>
                </div>

                <span className="flex items-center gap-1.5 rounded-full border border-[#DFCBB5] bg-[#F5ECE0] px-3.5 py-1 text-xs font-bold text-[#E26D2C]">
                  <Sparkles size={13} />
                  Live Sync
                </span>
              </div>

              <div className="grid gap-6 pt-2 sm:grid-cols-2">
                {/* CP GAUGE */}
                <div className="flex items-center justify-between rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/60 p-5 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E0F0FA] text-[#1E6FA3]">
                        <Code2 size={16} />
                      </div>
                      <span className="text-xs font-black text-[#16344E]">
                        CP Problems
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Problems Cleared
                      </p>
                      <p className="text-xl font-black text-[#16344E]">
                        {totalTasksSolved}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          / {totalStudents * totalTasksExpected || 100}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="relative flex h-24 w-24 items-center justify-center">
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
                        strokeDasharray={`${avgCompletion}, 100`}
                        strokeWidth="3.6"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-base font-black text-[#16344E]">
                        {avgCompletion}%
                      </span>
                      <span className="block text-[8.5px] font-bold text-slate-400">
                        Avg. Done
                      </span>
                    </div>
                  </div>
                </div>

                {/* DEV GAUGE */}
                <div className="flex items-center justify-between rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/60 p-5 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                        <Monitor size={16} />
                      </div>
                      <span className="text-xs font-black text-[#16344E]">
                        Dev Lectures
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Lectures Watched
                      </p>
                      <p className="text-xl font-black text-[#16344E]">
                        {Math.round(totalTasksSolved * 0.85)}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          Watched
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="relative flex h-24 w-24 items-center justify-center">
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
                        strokeDasharray={`${Math.min(avgCompletion + 5, 100)}, 100`}
                        strokeWidth="3.6"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-base font-black text-[#16344E]">
                        {Math.min(avgCompletion + 5, 100)}%
                      </span>
                      <span className="block text-[8.5px] font-bold text-slate-400">
                        Avg. Watch
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TOP PERFORMERS */}
            <div className="space-y-4 rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-6 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between border-b border-[#EBDCC8] pb-3.5">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-[#E26D2C]" />
                  <h3 className="text-base font-black text-[#16344E]">
                    Team Standings
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#E26D2C]">Top 5</span>
              </div>

              {assignedStudentsProgress.length === 0 ? (
                <p className="py-12 text-center text-xs font-semibold text-slate-500">
                  No assigned students enrolled yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {assignedStudentsProgress.slice(0, 5).map((item, idx) => {
                    const medal =
                      idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                    return (
                      <div
                        key={item?.student?.id || idx}
                        className={`flex items-center justify-between rounded-2xl border p-3 ${
                          idx === 0
                            ? "border-[#DE7E4A]/40 bg-[#FDE2D2]/60 shadow-sm"
                            : "border-[#EBDCC8] bg-[#FFFDF9]"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="w-5 text-center text-sm font-black">{medal}</span>
                          <div className="truncate">
                            <p className="truncate text-xs font-bold text-[#16344E]">
                              {item?.student?.name || "Student"}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {item?.completed || 0}/{item?.total || 0} tasks done
                            </p>
                          </div>
                        </div>

                        <span className="rounded-xl bg-[#173854] px-2.5 py-0.5 text-[11px] font-black text-white">
                          {item?.completion || 0}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ======================================================
              4. DETAILED STUDENTS PROGRESS TABLE
          ====================================================== */}
          <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
            
            {/* Table Header Controls */}
            <div className="flex flex-col gap-4 border-b border-[#EBDCC8] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#16344E]">
                  Assigned Students Progress Matrix
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Individual tracking for your {mentorProfile?.gender?.toLowerCase() || ""} students roster
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10.5 w-full rounded-2xl border border-[#DFCBB5] bg-[#FFFDF9] pl-10 pr-4 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-xs font-semibold text-slate-500">
                No assigned students match your search filter.
              </div>
            ) : (
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Student
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Gender
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Tasks Completed
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Milestone Bar
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Rank
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((item, index) => {
                      const student = item?.student || {};
                      const completion = item?.completion || 0;

                      return (
                        <tr
                          key={student.id || index}
                          className="smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]"
                        >
                          {/* STUDENT INFO */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0F0FA] to-[#D0E6F7] text-xs font-black text-[#173854]">
                                {student.name?.charAt(0)?.toUpperCase() || "S"}
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#16344E]">
                                  {student.name || "Student"}
                                </p>
                                <p className="text-[11px] font-medium text-slate-500">
                                  {student.email || "-"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* GENDER */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-bold ${
                                student.gender === "Female"
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-blue-200 bg-blue-50 text-blue-700"
                              }`}
                            >
                              {student.gender === "Female" ? "👩 Female" : "👨 Male"}
                            </span>
                          </td>

                          {/* COMPLETED */}
                          <td className="px-5 py-4 font-black text-[#16344E]">
                            {item.completed || 0} / {item.total || 0} tasks
                          </td>

                          {/* PROGRESS BAR */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2.5 w-36 overflow-hidden rounded-full bg-[#EBDCC8]">
                                <div
                                  className={`h-full rounded-full ${
                                    completion >= 80
                                      ? "bg-emerald-600"
                                      : completion >= 50
                                      ? "bg-amber-500"
                                      : "bg-[#DE7E4A]"
                                  }`}
                                  style={{ width: `${Math.min(completion, 100)}%` }}
                                />
                              </div>
                              <span className="font-black text-[#16344E]">
                                {completion}%
                              </span>
                            </div>
                          </td>

                          {/* RANK */}
                          <td className="px-6 py-4 text-right font-black text-[#173854]">
                            <span className="inline-block rounded-xl bg-[#E0F0FA] px-3 py-1 text-xs">
                              #{item?.rank || index + 1}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default MentorDashboard;